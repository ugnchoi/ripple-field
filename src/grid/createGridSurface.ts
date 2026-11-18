import {BufferAttribute,BufferGeometry,OrthographicCamera,Points,Scene,ShaderMaterial,SRGBColorSpace,Vector2,Vector4,WebGLRenderer,REVISION} from 'three';
import type {SurfaceController,SurfaceFactory,SurfaceOptions,SurfaceStatus} from '../experience/types';
import {PARAMS,makeGrid,hashArray} from './field.mjs';
import {CONTOUR} from './contour.mjs';
import {GridState,worldFromNormalized} from './sourceState.mjs';
import {createVertexShader,fragmentShader} from './shaders.mjs';

export interface GridDiagnostics {
 status:SurfaceStatus;paused:boolean;disposed:boolean;hidden:boolean;offscreen:boolean;drawable:boolean;animating:boolean;rafPending:boolean;
 time:number;strength:number;ambient:boolean;activeSources:number;frames:number;geometryBuilds:number;contextLosses:number;contextRestores:number;
 cssWidth:number;cssHeight:number;pixelRatio:number;seed:number;mode:'C';pointSizeRange:number[];
 grid:{columns:number;rows:number;count:number;anchorHash:string;currentHash:string;positionInvariant:boolean;z:0;pitch:number};
 sources:Array<{x:number;y:number;start:number;strength:number}>;
 parameters:typeof PARAMS;contour:typeof CONTOUR;shaderErrors:string[];threeRevision:string;
 geometries:number;textures:number;programs:number;vertexShader:string;fragmentShader:string;
}
export interface GridSurfaceController extends SurfaceController {getDiagnostics():GridDiagnostics}

/** Owns the rendering lifecycle only. UI owns pointer, keyboard and preference handling. */
export const createGridSurface=((canvas:HTMLCanvasElement,options:SurfaceOptions):GridSurfaceController=>{
 const model=new GridState({paused:options.paused,strength:options.strength});
 const ambient=!!options.ambient,vertexShader=createVertexShader(ambient);
 let renderer:WebGLRenderer|null=null,geometry:BufferGeometry|null=null,material:ShaderMaterial|null=null,points:Points|null=null;
 let observer:ResizeObserver|null=null,intersection:IntersectionObserver|null=null,dprQuery:MediaQueryList|null=null;
 let raf=0,frames=0,geometryBuilds=0,contextLosses=0,contextRestores=0,cssWidth=0,cssHeight=0,pixelRatio=1,columns=0,rows=0;
 let anchorHash='',pointSizeRange:number[]=[];
 const shaderErrors:string[]=[],sourceUniforms=Array.from({length:PARAMS.maxSources},()=>new Vector4(0,0,-1,0));
 const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
 let listeners=false,lastChange='';
 let pointerX=0,pointerY=0,targetPointerX=0,targetPointerY=0,pull=0,targetPull=0;
 const needsFrame=()=>model.running&&(model.shouldAnimate(ambient)||pull>0.002||targetPull>0);
 const emit=()=>{const key=`${model.status}|${model.paused}`;if(key===lastChange)return;lastChange=key;try{options.onChange({status:model.status,paused:model.paused});}catch(error){console.error('Grid surface status callback failed',error);}};
 const cancel=()=>{if(raf){cancelAnimationFrame(raf);raf=0;}model.resetClock();};
 function cleanup(){
  if(model.disposed)return;
  cancel();model.dispose();observer?.disconnect();intersection?.disconnect();observer=null;intersection=null;
  dprQuery?.removeEventListener('change',dprChanged);dprQuery=null;
  if(listeners){canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);listeners=false;}
  if(points)scene.remove(points);geometry?.dispose();material?.dispose();renderer?.dispose();
  // No forced context loss: React StrictMode may immediately reuse this same canvas.
 }
 function fail(error:unknown){if(model.disposed)return;shaderErrors.push(String(error));cleanup();emit();console.error('Grid surface unavailable',error);}
 function draw(){
  if(model.disposed||model.status!=='ready'||model.hidden||model.offscreen||model.undrawable||!renderer||!material)return;
  material.uniforms.uTime.value=model.time;
  material.uniforms.uPointer.value.set(pointerX,pointerY);
  material.uniforms.uPull.value=pull;
  for(let i=0;i<PARAMS.maxSources;i++)sourceUniforms[i].set(model.centerX[i],model.centerY[i],model.startTime[i],model.sourceStrength[i]);
  renderer.render(scene,camera);frames++;
 }
 function schedule(){
  if(!needsFrame()){cancel();return;}
  if(!raf){model.resetClock();raf=requestAnimationFrame(frame);}
 }
 function frame(stamp:number){
  raf=0;if(model.disposed)return;
  try{
   model.advance(stamp);
   pointerX+=(targetPointerX-pointerX)*0.14;
   pointerY+=(targetPointerY-pointerY)*0.14;
   pull+=(targetPull-pull)*0.09;
   if(pull<=0.002&&targetPull===0)pull=0;
   draw();
   if(needsFrame())raf=requestAnimationFrame(frame);
  }catch(error){fail(error);}
 }
 function resize(){
  if(model.disposed||!renderer||!points||!material)return;
  try{
   const rect=canvas.getBoundingClientRect();const width=Math.round(rect.width),height=Math.round(rect.height);
   const drawable=rect.width>=1&&rect.height>=1;model.setSuspended('undrawable',!drawable);
   if(!drawable){schedule();return;}
   if(cssWidth!==width||cssHeight!==height||!anchorHash){
    const grid=makeGrid(width,height),replacement=new BufferGeometry();replacement.setAttribute('position',new BufferAttribute(grid.positions,3));
    const previous=geometry;geometry=replacement;points.geometry=replacement;previous?.dispose();geometryBuilds++;
    columns=grid.cols;rows=grid.rows;anchorHash=hashArray(grid.positions);cssWidth=width;cssHeight=height;
    camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();
   }
   pixelRatio=Math.min(window.devicePixelRatio||1,2);
   if(pointSizeRange[1]<PARAMS.pitch*(PARAMS.diameterBase+PARAMS.diameterGain)*pixelRatio)throw new Error('GPU point size range is too small for the grid');
   renderer.setPixelRatio(pixelRatio);renderer.setSize(width,height,false);
   material.uniforms.uHeight.value=height;material.uniforms.uDpr.value=pixelRatio;
   draw();schedule();
  }catch(error){fail(error);}
 }
 function watchDpr(){
  dprQuery?.removeEventListener('change',dprChanged);
  if(typeof window.matchMedia==='function'){dprQuery=window.matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`);dprQuery.addEventListener('change',dprChanged);}
 }
 function dprChanged(){if(model.disposed)return;watchDpr();resize();}
 function visibility(){if(model.disposed)return;try{model.setSuspended('hidden',document.hidden);if(!document.hidden)draw();schedule();}catch(error){fail(error);}}
 function lost(event:Event){if(model.disposed)return;event.preventDefault();contextLosses++;model.setStatus('lost');cancel();emit();}
 function restored(){
  if(model.disposed||!renderer||!material)return;
  try{
   contextRestores++;model.setStatus('ready');material.needsUpdate=true;resize();if(model.disposed)return;
   renderer.compile(scene,camera);draw();emit();schedule();
  }catch(error){fail(error);}
 }
 const controller:GridSurfaceController={
  setPaused(paused){if(model.disposed)return;try{const before=model.paused;model.setPaused(paused);if(model.paused!==before){draw();emit();}schedule();}catch(error){fail(error);}},
  setStrength(strength){model.setStrength(strength);},
  clear(){if(model.disposed)return;model.clear();try{draw();schedule();}catch(error){fail(error);}},
  disturb(x,y,strength){
   if(model.disposed||model.undrawable)return;
   const world=worldFromNormalized(x,y,cssWidth/cssHeight);if(!world)return;
   if(model.spawn(world.x,world.y,strength))schedule();
  },
  hover(x,y){
   if(model.disposed||model.undrawable||model.paused)return;
   const world=worldFromNormalized(x,y,cssWidth/cssHeight);if(!world)return;
   targetPointerX=world.x;targetPointerY=world.y;
   if(targetPull===0&&pull<0.002){pointerX=world.x;pointerY=world.y;}
   targetPull=1;schedule();
  },
  leave(){
   if(model.disposed)return;
   targetPull=0;schedule();
  },
  dispose:cleanup,
  getDiagnostics(){
   const sources:Array<{x:number;y:number;start:number;strength:number}>=[];
   for(let i=0;i<PARAMS.maxSources;i++)if(model.startTime[i]>=0)sources.push({x:model.centerX[i],y:model.centerY[i],start:model.startTime[i],strength:model.sourceStrength[i]});
   const positions=geometry?.getAttribute('position')?.array,currentHash=positions?hashArray(positions as Float32Array):'';
   return {status:model.status,paused:model.paused,disposed:model.disposed,hidden:model.hidden,offscreen:model.offscreen,drawable:!model.undrawable,animating:model.shouldAnimate(ambient),rafPending:!!raf,time:model.time,strength:model.strength,ambient,activeSources:model.activeCount,frames,geometryBuilds,contextLosses,contextRestores,cssWidth,cssHeight,pixelRatio,seed:PARAMS.seed,mode:'C',pointSizeRange:[...pointSizeRange],grid:{columns,rows,count:columns*rows,anchorHash,currentHash,positionInvariant:anchorHash===currentHash,z:0,pitch:PARAMS.pitch},sources,parameters:PARAMS,contour:CONTOUR,shaderErrors:[...shaderErrors],threeRevision:REVISION,geometries:renderer?.info.memory.geometries??0,textures:renderer?.info.memory.textures??0,programs:renderer?.info.programs?.length??0,vertexShader,fragmentShader};
  },
 };
 try{
  renderer=new WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'default'});
  renderer.setClearColor('#f7f7fb',1);renderer.outputColorSpace=SRGBColorSpace;renderer.debug.checkShaderErrors=true;
  const gl=renderer.getContext();pointSizeRange=Array.from(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array);
  renderer.debug.onShaderError=(context,program,vertex,fragment)=>{const error=[context.getProgramInfoLog(program),context.getShaderInfoLog(vertex),context.getShaderInfoLog(fragment)].filter(Boolean).join('\n')||'Grid shader failed';context.deleteProgram(program);context.deleteShader(vertex);context.deleteShader(fragment);throw new Error(error);};
  material=new ShaderMaterial({vertexShader,fragmentShader,uniforms:{uTime:{value:0},uHeight:{value:1},uDpr:{value:1},uMode:{value:2},uPointer:{value:new Vector2(0,0)},uPull:{value:0},uSources:{value:sourceUniforms}},transparent:true,depthTest:false,depthWrite:false});
  geometry=new BufferGeometry();points=new Points(geometry,material);points.frustumCulled=false;scene.add(points);
  model.setSuspended('hidden',document.hidden);
  const rect=canvas.getBoundingClientRect();model.setSuspended('offscreen',rect.bottom<=0||rect.right<=0||rect.top>=window.innerHeight||rect.left>=window.innerWidth);
  canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);listeners=true;
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(canvas);}
  if(typeof IntersectionObserver!=='undefined'){intersection=new IntersectionObserver(entries=>{if(model.disposed)return;for(const entry of entries)if(entry.target===canvas){model.setSuspended('offscreen',!entry.isIntersecting);try{draw();schedule();}catch(error){fail(error);}}});intersection.observe(canvas);}
  watchDpr();resize();if(model.disposed)throw new Error(shaderErrors.join('\n')||'Grid initialization failed');
  renderer.compile(scene,camera);draw();emit();schedule();return controller;
 }catch(error){cleanup();emit();throw error;}
}) satisfies SurfaceFactory;
