import {BufferGeometry,Float32BufferAttribute,OrthographicCamera,Points,Scene,ShaderMaterial,Vector2,Vector4,WebGLRenderer,WebGLRenderTarget,FloatType,RGBAFormat,REVISION} from 'three';
import * as C from '../../src/engine/constants';
import {createRippleFieldMaterial,primeShapeUniforms,SwellSourceBuffer,resolvePerformanceBudget} from '../../src/engine';
import {makeGeometryData,makeTape,selectEvents,replaySlots,canonicalizeInactive,type StudyEvent} from '../ripple-baseline/replay.mjs';
import {COEFFICIENTS} from './math.mjs';
import {injectShading} from './shader.mjs';
import './study.css';

declare const __SHADING_REVISION__:unknown;
type State={time:number;seed:number;scenario:'single'|'pair'|'null';transfer:'A'|'B';reverseLight:boolean};
type ProbeSample={x:number;y:number;seed:number};
const duration=6;
const state:State={time:0,seed:47,scenario:'single',transfer:'A',reverseLight:false};
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const input=(id:string)=>element<HTMLInputElement>(id);
const canvas=element<HTMLCanvasElement>('field');
const renderer=new WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.setClearColor(0xf7f7fb,1);
const shaderErrors:string[]=[];
renderer.debug.checkShaderErrors=true;
renderer.debug.onShaderError=(gl,program,vertex,fragment)=>{
 const message=[gl.getProgramInfoLog(program),gl.getShaderInfoLog(vertex),gl.getShaderInfoLog(fragment)].filter(Boolean).join('\n');
 shaderErrors.push(message||'Unknown shader compilation/link error');
 element('error').textContent=shaderErrors.join('\n');
 throw new Error(`Shader failed; diagnostic stopped: ${message}`);
};
const materialA=createRippleFieldMaterial();primeShapeUniforms(materialA.uniforms);
const generated=injectShading(materialA.vertexShader,materialA.fragmentShader);
const materialB=createRippleFieldMaterial();
// Shared objects guarantee source/scalar/size/displacement uniforms cannot drift between transfers.
materialB.uniforms={...materialA.uniforms,uStudyLight:{value:new Vector2()}};
materialB.vertexShader=generated.vertexShader;materialB.fragmentShader=generated.fragmentShader;
const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
const buffer=new SwellSourceBuffer();
let geometry=new BufferGeometry(),points=new Points(geometry,materialA);scene.add(points);
let geometryHash='',cols=0,rows=0,script:StudyEvent[]=[],manual:StudyEvent[]=[],playing=false,lastFrame=0,manualEnabled=false,lastManualTime=-Infinity;
let budget:ReturnType<typeof resolvePerformanceBudget>;
const mq=matchMedia('(prefers-reduced-motion: reduce)');
const limits=[
 'H is the existing nonnegative capped scalar disturbance as a height proxy, not physical fluid height or a new wave model.',
 'Finite differences hold the point seed fixed and recompute full static warp/angular drift/temporal envelope/safe-global scaling/saturation at each offset.',
 'Only the copied scalar evaluator guards atan at dist<=1e-8 with angle0; A and the original core field remain unchanged. The exact source-center angle is undefined in the original engine.',
 'B has four extra scalar evaluations per point. Cost is unmeasured; no hardware-performance claim follows from software rendering.',
 'A is the exact existing material. B changes RGB tone only; points, alpha, size, displacement, camera and source uniforms are shared.',
 'Ambient, automatic events, safe zone and polish are off. No Resume or objects. No per-frame coverage normalization.',
 'Geometry/script are seeded Stage0 helpers. Script/manual jitter is omitted, exact clock replaces production live clock, and preserveDrawingBuffer is enabled for inspection.',
 'All trials start held; reduced-motion changes pause playback. Explicit play/seek remain available. Production behavior is unchanged.',
 'Manual events persist across transfer/scenario changes and are logged separately. Clear manual events before scripted comparisons.',
 'No import promise: restore settings with setState and manual events explicitly. Exports include full actual shader sources plus hashes.',
 'State and fixed-time repeats do not establish a convincing water surface; continuous recorded motion and independent review remain necessary.'
];
function fnvBytes(bytes:Uint8Array){let h=2166136261;for(const b of bytes){h^=b;h=Math.imul(h,16777619);}return(h>>>0).toString(16).padStart(8,'0');}
function hashText(text:string){return fnvBytes(new TextEncoder().encode(text));}
function hashGeometry(arrays:Float32Array[]){const bytes=new Uint8Array(arrays.reduce((n,a)=>n+a.byteLength,0));let offset=0;for(const a of arrays){bytes.set(new Uint8Array(a.buffer,a.byteOffset,a.byteLength),offset);offset+=a.byteLength;}return fnvBytes(bytes);}
const shaders={A:{vertexSource:materialA.vertexShader,fragmentSource:materialA.fragmentShader,vertexHash:hashText(materialA.vertexShader),fragmentHash:hashText(materialA.fragmentShader),sha256:null as null|{vertex:string;fragment:string}},B:{vertexSource:materialB.vertexShader,fragmentSource:materialB.fragmentShader,vertexHash:hashText(materialB.vertexShader),fragmentHash:hashText(materialB.fragmentShader),sha256:null as null|{vertex:string;fragment:string}}};
const shaderHashReady=(async()=>{
 if(!globalThis.crypto?.subtle)return;
 const digest=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
 for(const shader of Object.values(shaders))shader.sha256={vertex:await digest(shader.vertexSource),fragment:await digest(shader.fragmentSource)};
})();
function rebuildTape(){script=makeTape({seed:state.seed,scenario:state.scenario==='null'?'ambient-only':state.scenario,duration,aspect:innerWidth/innerHeight,parameters:{width:C.DEFAULT_SWELL_WIDTH,decay:C.DEFAULT_DECAY,pointerStrength:C.FOREGROUND_POINTER_SWELL_STRENGTH}}).filter(e=>e.kind==='script');}
function regenerate(){
 const aspect=innerWidth/innerHeight;
 budget=resolvePerformanceBudget(aspect,{cssWidth:innerWidth,cssHeight:innerHeight,prefersReducedMotion:mq.matches,deviceMemoryGb:(navigator as Navigator&{deviceMemory?:number}).deviceMemory});
 const ratio=Math.min(devicePixelRatio||1,budget.rendererPixelRatioCap);renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight);
 camera.left=-aspect;camera.right=aspect;camera.updateProjectionMatrix();
 const data=makeGeometryData(aspect,budget.gridCols,state.seed,{min:C.PERF_GRID_COLS_MIN,max:C.PERF_GRID_COLS_MAX,stagger:C.GRID_STAGGER,jitter:C.GRID_JITTER});
 cols=data.cols;rows=data.rows;geometryHash=hashGeometry([data.positions,data.seeds]);
 scene.remove(points);geometry.dispose();geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(data.positions,3));geometry.setAttribute('aSeed',new Float32BufferAttribute(data.seeds,1));points=new Points(geometry,state.transfer==='A'?materialA:materialB);scene.add(points);
 materialA.uniforms.uPixelRatio.value=ratio;materialA.uniforms.uResolution.value.set(canvas.width,canvas.height);materialA.uniforms.uViewAspect.value=aspect;
 rebuildTape();
}
function events(){return selectEvents([...script,...manual],state.time,false);}
function sourceArrays(){return Object.fromEntries(['uStartTime','uCenterX','uCenterY','uStrength','uWidth','uDecay'].map(k=>[k,Array.from(materialA.uniforms[k].value as Float32Array)]));}
function lightDirection():[number,number]{const sign=state.reverseLight?-1:1;const angle=COEFFICIENTS.lightAngleDegrees*Math.PI/180;return[sign*Math.cos(angle),sign*Math.sin(angle)];}
function render(){
 if(shaderErrors.length)throw new Error(shaderErrors.join('\n'));
 const u=materialA.uniforms;
 u.uTime.value=state.time;u.uAmbientScale.value=0;u.uSafeEnabled.value=0;u.uPolishMaster.value=0;
 materialB.uniforms.uStudyLight.value.set(...lightDirection());
 buffer.clear();for(const e of events())buffer.spawn(e.x,e.y,e.time,{strength:e.strength,width:e.width,decay:e.decay});buffer.copyToUniforms(materialA);
 canonicalizeInactive(Object.fromEntries(['uStartTime','uCenterX','uCenterY','uStrength','uWidth','uDecay'].map(k=>[k,u[k].value as Float32Array])));
 points.material=state.transfer==='A'?materialA:materialB;renderer.render(scene,camera);
 input('time').value=String(Number(state.time.toFixed(4)));input('scrub').value=String(state.time);input('seed').value=String(state.seed);input('reverse').checked=state.reverseLight;
 element<HTMLSelectElement>('transfer').value=state.transfer;element<HTMLSelectElement>('scenario').value=state.scenario;
 element('play').textContent=playing?'Hold':'Play';
 element('status').textContent=`${playing?'PLAYING':'HELD'} · ${state.transfer}${state.reverseLight?' reversed':''} · t=${state.time.toFixed(4)}s\n${cols}×${rows} points · ${budget.tier} · DPR${renderer.getPixelRatio()}\ngeometry ${geometryHash} · ${events().length} events · ${manual.length} manual`;
 element('motion').textContent=mq.matches?'Reduced motion: held by default. Explicit Play or seek opts into inspection.':'Starts held. Exact seeks and a shared 0–6s clock support paired review.';
}
function getState(){return {...state,playing};}
function pause(){playing=false;render();}
function seek(time:number){if(!Number.isFinite(time))throw new Error('Time must be finite');playing=false;lastManualTime=-Infinity;state.time=Math.max(0,Math.min(duration,time));render();return getState();}
function setState(patch:Partial<State>){
 if(patch.time!==undefined&&!Number.isFinite(patch.time))throw new Error('Time must be finite');
 if(patch.seed!==undefined&&(!Number.isInteger(patch.seed)||patch.seed<0||patch.seed>4294967295))throw new Error('Seed must be uint32');
 if(patch.transfer!==undefined&&!['A','B'].includes(patch.transfer))throw new Error('Unknown transfer');
 if(patch.scenario!==undefined&&!['single','pair','null'].includes(patch.scenario))throw new Error('Unknown scenario');
 if(patch.reverseLight!==undefined&&typeof patch.reverseLight!=='boolean')throw new Error('reverseLight must be boolean');
 const reseed=patch.seed!==undefined&&patch.seed!==state.seed;
 const scenario=patch.scenario!==undefined&&patch.scenario!==state.scenario;
 playing=false;lastManualTime=-Infinity;Object.assign(state,patch);state.time=Math.max(0,Math.min(duration,state.time));
 if(reseed)regenerate();else if(scenario)rebuildTape();render();return getState();
}
function play(){if(state.time===duration)state.time=0;lastFrame=performance.now();playing=true;render();}
function addManual(event:Partial<StudyEvent>={}){
 const e:StudyEvent={time:state.time,x:0,y:0,strength:C.FOREGROUND_POINTER_SWELL_STRENGTH,width:C.DEFAULT_SWELL_WIDTH,decay:C.DEFAULT_DECAY,...event,id:`manual-${String(manual.length).padStart(6,'0')}`,kind:'manual'};
 if(![e.time,e.x,e.y,e.strength,e.width,e.decay].every(Number.isFinite)||e.time<0||e.time>duration||e.width<=0||e.decay<=0)throw new Error('Manual event must be finite, within trial time, and have positive width/decay');
 manual.push(e);render();return {...e};
}
function compiledPrograms(){
 const gl=renderer.getContext();
 return (renderer.info.programs??[]).map(program=>{
  const vertexSource=gl.getShaderSource(program.vertexShader)??'';
  const fragmentSource=gl.getShaderSource(program.fragmentShader)??'';
  return {transfer:vertexSource.includes('aProbeIndex')?'probe':vertexSource.includes('studyScalarAt')?'B':'A',linked:!!gl.getProgramParameter(program.program,gl.LINK_STATUS),vertexSource,fragmentSource,vertexHash:hashText(vertexSource),fragmentHash:hashText(fragmentSource)};
 });
}
function exportState(){
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
 const baseUniforms=Object.fromEntries(Object.entries(materialA.uniforms).map(([k,v])=>[k,ArrayBuffer.isView(v.value)?Array.from(v.value as Float32Array):v.value?.toArray?v.value.toArray():v.value]));
 const selected=events().map(e=>({...e}));
 const field={time:state.time,seed:state.seed,scenario:state.scenario,geometryHash,sourceUniforms:sourceArrays(),baseUniforms,scriptedTape:script.map(e=>({...e})),manualEvents:manual.map(e=>({...e})),selectedEvents:selected,sourceSlots:replaySlots(selected,C.MAX_SWELL_SOURCES),ambient:0,auto:false,safe:0,polish:0,globalFieldScale:materialA.uniforms.uGlobalFieldScale.value,baseShader:{vertex:shaders.A.vertexHash,fragment:shaders.A.fragmentHash}};
 return {schema:'ripple-shading/v1',state:{...state},duration,playing,reducedMotion:mq.matches,manualEnabled,revision:typeof __SHADING_REVISION__==='undefined'?'Unavailable: use study Vite config':__SHADING_REVISION__,fieldIdentity:hashText(JSON.stringify(field)),field,transferSettings:{mode:state.transfer,reverseLight:state.reverseLight,coefficients:{...COEFFICIENTS},lightXY:lightDirection(),formula:'tone *= 1 + gain * dot(normalize(vec3(-heightScale*dHdx,-heightScale*dHdy,1)).xy, normalize(Lxy))'},geometry:{hash:geometryHash,hashAlgorithm:'FNV1a32 Float32 bytes, positions then seeds',cols,rows},viewport:{cssWidth:innerWidth,cssHeight:innerHeight,rawDpr:devicePixelRatio,appliedDpr:renderer.getPixelRatio(),framebufferWidth:canvas.width,framebufferHeight:canvas.height,budget},renderer:{userAgent:navigator.userAgent,threeRevision:REVISION,vendor:gl.getParameter(gl.VENDOR),renderer:gl.getParameter(gl.RENDERER),unmasked:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null,floatProbeSupported:!!gl.getExtension('EXT_color_buffer_float')},engineParameters:{...C},baseUniforms,shaders:{hashAlgorithm:'FNV1a32 UTF8 plus SHA256 when secure-context crypto is available',...shaders},compiledPrograms:compiledPrograms(),shaderErrors:[...shaderErrors],limitations:limits};
}
/** Explicit diagnostic only: evaluate actual GPU H and central slopes at h and h/2.
 * Uses float target, no tone mapping, same scalar evaluator and actual source uniform objects. */
function probeSlopes(samples:ProbeSample[]=[{x:.15,y:.07,seed:.37},{x:-.2,y:.13,seed:.61}]){
 if(samples.length<1||samples.length>16||samples.some(p=>![p.x,p.y,p.seed].every(Number.isFinite)||p.seed<0||p.seed>1))throw new Error('Probe requires 1–16 finite samples with seed in [0,1]');
 if(!renderer.getContext().getExtension('EXT_color_buffer_float'))throw new Error('Float probe unsupported; no fallback measurement');
 const probeGeometry=new BufferGeometry();probeGeometry.setAttribute('position',new Float32BufferAttribute(samples.flatMap(p=>[p.x,p.y,0]),3));probeGeometry.setAttribute('aSeed',new Float32BufferAttribute(samples.map(p=>p.seed),1));probeGeometry.setAttribute('aProbeIndex',new Float32BufferAttribute(samples.map((_,i)=>i),1));
 const prefix=generated.vertexShader.slice(0,generated.vertexShader.indexOf('void main() {'));
 const probeMaterial=new ShaderMaterial({uniforms:{...materialB.uniforms,uProbeStep:{value:COEFFICIENTS.step},uProbeCount:{value:samples.length}},vertexShader:prefix+`\nattribute float aProbeIndex;uniform float uProbeStep;uniform float uProbeCount;varying vec3 vProbe;void main(){vec2 p=position.xy;float h=uProbeStep;vec2 g=vec2(studyScalarAt(p+vec2(h,0.0),aSeed)-studyScalarAt(p-vec2(h,0.0),aSeed),studyScalarAt(p+vec2(0.0,h),aSeed)-studyScalarAt(p-vec2(0.0,h),aSeed))/(2.0*h);vProbe=vec3(studyScalarAt(p,aSeed),g);gl_Position=vec4((aProbeIndex+0.5)/uProbeCount*2.0-1.0,0.0,0.0,1.0);gl_PointSize=1.0;}`,fragmentShader:'varying vec3 vProbe;void main(){gl_FragColor=vec4(vProbe,1.0);}',depthTest:false,depthWrite:false});
 const probeScene=new Scene();const probePoints=new Points(probeGeometry,probeMaterial);probePoints.frustumCulled=false;probeScene.add(probePoints);
 const target=new WebGLRenderTarget(samples.length,1,{type:FloatType,format:RGBAFormat,depthBuffer:false,stencilBuffer:false});
 const previous=renderer.getRenderTarget(),viewport=renderer.getViewport(new Vector4());
 const results:Record<string,number[][]>={};
 try{
  renderer.setRenderTarget(target);renderer.setViewport(0,0,samples.length,1);
  for(const [name,h] of [['h',COEFFICIENTS.step],['halfH',COEFFICIENTS.step/2]] as const){
   probeMaterial.uniforms.uProbeStep.value=h;renderer.render(probeScene,camera);const values=new Float32Array(samples.length*4);renderer.readRenderTargetPixels(target,0,0,samples.length,1,values);
   if(!Array.from(values).every(Number.isFinite)||samples.some((_,i)=>values[i*4+3]!==1))throw new Error('Nonfinite or incomplete GPU probe output');
   results[name]=samples.map((_,i)=>Array.from(values.slice(i*4,i*4+3)));
  }
 }finally{renderer.setRenderTarget(previous);renderer.setViewport(viewport);target.dispose();probeGeometry.dispose();probeMaterial.dispose();render();}
 return {fieldIdentity:exportState().fieldIdentity,step:COEFFICIENTS.step,samples:JSON.parse(JSON.stringify(samples)),channels:['H','dHdx','dHdy'],...results,limitations:'Float32 GPU finite differences; same seed per offset; diagnostic points need not be lattice points. Compare h/halfH away from source centers, not a physical-height measurement.'};
}
const api={setState,seek,pause,hold:pause,play,restart:()=>seek(0),getTime:()=>state.time,getState,addManual,clearManual:()=>{manual=[];lastManualTime=-Infinity;render();return getState();},setPanelVisible:(visible:boolean)=>document.body.classList.toggle('capture',!visible),awaitReady:async()=>{await shaderHashReady;await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>{render();resolve();}));return getState();},exportState,probeSlopes};
function invoke(action:()=>unknown){try{action();element('error').textContent='';}catch(error){playing=false;element('error').textContent=String(error);console.error(error);}}
element('transfer').onchange=()=>invoke(()=>setState({transfer:element<HTMLSelectElement>('transfer').value as State['transfer']}));element('scenario').onchange=()=>invoke(()=>setState({scenario:element<HTMLSelectElement>('scenario').value as State['scenario']}));input('reverse').onchange=()=>invoke(()=>setState({reverseLight:input('reverse').checked}));input('seed').onchange=()=>invoke(()=>setState({seed:Number(input('seed').value)}));input('time').onchange=()=>invoke(()=>seek(Number(input('time').value)));input('scrub').oninput=()=>invoke(()=>seek(Number(input('scrub').value)));
element('play').onclick=()=>invoke(()=>playing?pause():play());element('restart').onclick=()=>invoke(()=>seek(0));input('manual').onchange=()=>{manualEnabled=input('manual').checked;};element('clear').onclick=()=>api.clearManual();
element('export').onclick=()=>invoke(()=>{const data=exportState();const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`ripple-shading-${state.scenario}-${state.transfer}-${state.time.toFixed(3)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
canvas.addEventListener('pointerdown',event=>{if(!manualEnabled||state.time-lastManualTime<C.PERF_POINTER_SWELL_MIN_INTERVAL)return;lastManualTime=state.time;const rect=canvas.getBoundingClientRect();invoke(()=>addManual({x:((event.clientX-rect.left)/rect.width*2-1)*innerWidth/innerHeight,y:1-(event.clientY-rect.top)/rect.height*2}));});
window.addEventListener('resize',()=>invoke(()=>{pause();regenerate();render();}));mq.addEventListener('change',()=>invoke(()=>{pause();regenerate();render();}));
function frame(now:number){if(playing)invoke(()=>{state.time=Math.min(duration,state.time+(now-lastFrame)/1000);if(state.time===duration)playing=false;render();});lastFrame=now;requestAnimationFrame(frame);}
regenerate();render();
// Compile both paths now; never hide a broken B shader behind a working default A.
points.material=materialB;renderer.compile(scene,camera);points.material=materialA;renderer.compile(scene,camera);render();
Object.assign(window,{rippleShading:api});requestAnimationFrame(frame);
