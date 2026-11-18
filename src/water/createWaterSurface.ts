import {Color,Mesh,OrthographicCamera,PlaneGeometry,Scene,ShaderMaterial,WebGLRenderer,REVISION} from 'three';
import type {SurfaceController,SurfaceFactory,SurfaceOptions,SurfaceStatus} from '../experience/types';
import {AMBIENT,PARAMS,resolveMeshSampling} from './field.mjs';
import {WaterState,worldFromNormalized} from './sourceState.mjs';
import {MATERIAL,waterFragmentShader,waterVertexShader} from './shaders';

export interface WaterSurfaceController extends SurfaceController {
 /** Explicit read-only snapshot for verification; never called by the render loop. */
 getDiagnostics():{
  status:SurfaceStatus;paused:boolean;disposed:boolean;hidden:boolean;offscreen:boolean;drawable:boolean;animating:boolean;rafPending:boolean;
  time:number;strength:number;ambient:boolean;activeSources:number;frames:number;geometryBuilds:number;contextLosses:number;contextRestores:number;
  cssWidth:number;cssHeight:number;pixelRatio:number;sampling:ReturnType<typeof resolveMeshSampling>|null;
  sources:Array<{x:number;y:number;start:number;strength:number}>;
  parameters:typeof PARAMS;ambientWaves:typeof AMBIENT;material:typeof MATERIAL;shaderErrors:string[];
  threeRevision:string;renderer:string|null;triangles:number;geometries:number;textures:number;programs:number;
  vertexShader:string;fragmentShader:string;
 };
}

/** One owned canvas, renderer, source pool, mesh, observers and RAF. No global input handling. */
export const createWaterSurface = ((canvas:HTMLCanvasElement,options:SurfaceOptions):WaterSurfaceController=>{
 const model=new WaterState({paused:options.paused,strength:options.strength});
 const ambient=!!options.ambient;
 let renderer:WebGLRenderer|null=null,geometry:PlaneGeometry|null=null,material:ShaderMaterial|null=null,mesh:Mesh|null=null;
 let observer:ResizeObserver|null=null,intersection:IntersectionObserver|null=null;
 let raf=0,frames=0,geometryBuilds=0,contextLosses=0,contextRestores=0,cssWidth=0,cssHeight=0,pixelRatio=1;
 let sampling:ReturnType<typeof resolveMeshSampling>|null=null;
 const shaderErrors:string[]=[];
 const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
 let listeners=false,lastChange='';
 const emit=()=>{const key=`${model.status}|${model.paused}`;if(key===lastChange)return;lastChange=key;try{options.onChange({status:model.status,paused:model.paused});}catch(error){console.error('Water surface status callback failed',error);}};
 const cancel=()=>{if(raf){cancelAnimationFrame(raf);raf=0;}model.resetClock();};
 function cleanup(){
  if(model.disposed)return;
  cancel();model.dispose();observer?.disconnect();intersection?.disconnect();observer=null;intersection=null;
  if(listeners){canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);listeners=false;}
  if(mesh)scene.remove(mesh);geometry?.dispose();material?.dispose();renderer?.dispose();
  // Ordinary disposal deliberately does NOT forceContextLoss: StrictMode may reuse this canvas.
 }
 function fail(error:unknown){if(model.disposed)return;shaderErrors.push(String(error));cleanup();emit();console.error('Water surface unavailable',error);}
 function draw(){
  if(model.disposed||model.status!=='ready'||model.hidden||model.offscreen||model.undrawable||!renderer||!material)return;
  material.uniforms.uTime.value=model.time;renderer.render(scene,camera);frames++;
 }
 function schedule(){
  if(!model.shouldAnimate(ambient)){cancel();return;}
  if(!raf){model.resetClock();raf=requestAnimationFrame(frame);}
 }
 function frame(stamp:number){
  raf=0;if(model.disposed)return;
  try{model.advance(stamp);draw();if(model.shouldAnimate(ambient))raf=requestAnimationFrame(frame);}catch(error){fail(error);}
 }
 function resize(){
  if(model.disposed||!renderer||!mesh)return;
  try{
   const rect=canvas.getBoundingClientRect();cssWidth=rect.width;cssHeight=rect.height;
   const drawable=cssWidth>=1&&cssHeight>=1;model.setSuspended('undrawable',!drawable);
   if(!drawable){schedule();return;}
   const next=resolveMeshSampling(cssWidth,cssHeight),aspect=cssWidth/cssHeight;
   if(!sampling||sampling.columns!==next.columns||sampling.rows!==next.rows||Math.abs(camera.right-aspect)>1e-6){
    const replacement=new PlaneGeometry(2*aspect,2,next.columns,next.rows);const previous=geometry;geometry=replacement;mesh.geometry=replacement;previous?.dispose();geometryBuilds++;
   }
   sampling=next;pixelRatio=Math.min(window.devicePixelRatio||1,next.pixelRatioCap);
   renderer.setPixelRatio(pixelRatio);renderer.setSize(cssWidth,cssHeight,false);
   camera.left=-aspect;camera.right=aspect;camera.updateProjectionMatrix();
   draw();schedule();
  }catch(error){fail(error);}
 }
 function visibility(){if(model.disposed)return;try{model.setSuspended('hidden',document.hidden);if(!document.hidden)draw();schedule();}catch(error){fail(error);}}
 function lost(event:Event){
  if(model.disposed)return;event.preventDefault();contextLosses++;model.setStatus('lost');cancel();emit();
 }
 function restored(){
  if(model.disposed||!renderer||!material)return;
  try{
   contextRestores++;model.setStatus('ready');material.needsUpdate=true;resize();
   if(model.disposed)return;
   renderer.compile(scene,camera);draw();emit();schedule();
  }catch(error){fail(error);}
 }
 const controller:WaterSurfaceController={
  setPaused(paused){if(model.disposed)return;try{const before=model.paused;model.setPaused(paused);if(model.paused!==before){draw();emit();}schedule();}catch(error){fail(error);}},
  setStrength(strength){model.setStrength(strength);},
  clear(){if(model.disposed)return;model.clear();try{draw();schedule();}catch(error){fail(error);}},
  disturb(x,y,strength){
   if(model.disposed||model.undrawable)return;
   const world=worldFromNormalized(x,y,cssWidth/cssHeight);if(!world)return;
   const wasAnimating=model.shouldAnimate(ambient);
   if(model.spawn(world.x,world.y,strength)){if(!wasAnimating)model.resetClock();schedule();}
  },
  dispose:cleanup,
  getDiagnostics(){
   const sources:Array<{x:number;y:number;start:number;strength:number}>=[];
   for(let i=0;i<PARAMS.maxSources;i++)if(model.startTime[i]>=0)sources.push({x:model.centerX[i],y:model.centerY[i],start:model.startTime[i],strength:model.sourceStrength[i]});
   const gl=renderer?.getContext(),debug=!model.disposed&&gl?.getExtension('WEBGL_debug_renderer_info');
   return {status:model.status,paused:model.paused,disposed:model.disposed,hidden:model.hidden,offscreen:model.offscreen,drawable:!model.undrawable,animating:model.shouldAnimate(ambient),rafPending:!!raf,time:model.time,strength:model.strength,ambient,activeSources:model.activeCount,frames,geometryBuilds,contextLosses,contextRestores,cssWidth,cssHeight,pixelRatio,sampling:sampling?{...sampling}:null,sources,parameters:PARAMS,ambientWaves:AMBIENT,material:MATERIAL,shaderErrors:[...shaderErrors],threeRevision:REVISION,renderer:debug&&gl?String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)):null,triangles:renderer?.info.render.triangles??0,geometries:renderer?.info.memory.geometries??0,textures:renderer?.info.memory.textures??0,programs:renderer?.info.programs?.length??0,vertexShader:waterVertexShader,fragmentShader:waterFragmentShader};
  },
 };
 try{
  renderer=new WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'default'});
  renderer.setClearColor(0xf0f4f0,1);renderer.debug.checkShaderErrors=true;
  renderer.debug.onShaderError=(gl,program,vertex,fragment)=>{const error=[gl.getProgramInfoLog(program),gl.getShaderInfoLog(vertex),gl.getShaderInfoLog(fragment)].filter(Boolean).join('\n')||'Water shader failed';gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);throw new Error(error);};
  material=new ShaderMaterial({vertexShader:waterVertexShader,fragmentShader:waterFragmentShader,uniforms:{uTime:{value:0},uAmbient:{value:ambient?1:0},uStart:{value:model.startTime},uCenterX:{value:model.centerX},uCenterY:{value:model.centerY},uStrength:{value:model.sourceStrength},uBase:{value:new Color(MATERIAL.base)},uReflectionLow:{value:new Color(MATERIAL.reflectionLow)},uReflectionHigh:{value:new Color(MATERIAL.reflectionHigh)}},depthTest:false,depthWrite:false});
  geometry=new PlaneGeometry(2,2,1,1);mesh=new Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);
  model.setSuspended('hidden',document.hidden);
  const rect=canvas.getBoundingClientRect();model.setSuspended('offscreen',rect.bottom<=0||rect.right<=0||rect.top>=window.innerHeight||rect.left>=window.innerWidth);
  canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restored);document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);listeners=true;
  if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(resize);observer.observe(canvas);}
  if(typeof IntersectionObserver!=='undefined'){intersection=new IntersectionObserver(entries=>{if(model.disposed)return;for(const entry of entries)if(entry.target===canvas){model.setSuspended('offscreen',!entry.isIntersecting);try{draw();schedule();}catch(error){fail(error);}}});intersection.observe(canvas);}
  resize();if(model.disposed)throw new Error(shaderErrors.join('\n')||'Water initialization failed');
  renderer.compile(scene,camera);draw();emit();schedule();return controller;
 }catch(error){cleanup();emit();throw error;}
}) satisfies SurfaceFactory;
