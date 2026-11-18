import {BufferGeometry,Float32BufferAttribute,OrthographicCamera,Points,Scene,WebGLRenderer,REVISION} from 'three';
import * as C from '../../src/engine/constants';
import {createRippleFieldMaterial,primeShapeUniforms,SwellSourceBuffer,resolvePerformanceBudget} from '../../src/engine';
import {makeGeometryData,makeTape,selectEvents,replaySlots,canonicalizeInactive,type StudyEvent} from '../ripple-baseline/replay.mjs';
import {WAVELENGTH,injectSignedProfile,negativeTransferReference} from './profile.mjs';
import './study.css';

declare const __PROFILE_REVISION__:unknown;
type State={time:number;seed:number;scenario:'single'|'pair'|'null';profile:'P'|'S'};
const duration=6;
const state:State={time:0,seed:47,scenario:'single',profile:'P'};
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
const materialP=createRippleFieldMaterial();primeShapeUniforms(materialP.uniforms);
const signedVertex=injectSignedProfile(materialP.vertexShader);
const materialS=createRippleFieldMaterial();
// Shared objects guarantee source/scalar/size/displacement uniforms cannot drift between transfers.
materialS.uniforms=materialP.uniforms;
materialS.vertexShader=signedVertex;
const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
const buffer=new SwellSourceBuffer();
let geometry=new BufferGeometry(),points=new Points(geometry,materialP);scene.add(points);
let geometryHash='',cols=0,rows=0,script:StudyEvent[]=[],manual:StudyEvent[]=[],playing=false,lastFrame=0,manualEnabled=false,lastManualTime=-Infinity;
let budget:ReturnType<typeof resolvePerformanceBudget>;
const mq=matchMedia('(prefers-reduced-motion: reduce)');
const limits=[
 'S is an analytic signed envelope, not a stateful physical-water simulation or reference reconstruction.',
 'Only the single original bump assignment changes: cosine carrier with frozen wavelength .14 world. Signed bump feeds scalar sum AND vector displacement.',
 'Original transfer remains fixed: negative field can shrink dots to the framebuffer size floor and reduce opacity to zero. Display is nonlinear after tanh/size/alpha guards.',
 'Original point-conditioned warp, source envelope/decay, sampling, palette, camera and all engine parameters remain unchanged.',
 'Ambient, auto, polish, safe zone and slope shading are off. No objects or new dither/lighting/palette.',
 'Seeded Stage0 geometry/replay replace unseeded production behavior. Manual/script jitter omitted; preserveDrawingBuffer enabled for inspection.',
 'Starts held; reduced-motion preference changes pause. Explicit play/seek are available; production behavior unchanged.',
 'Manual tape persists until cleared; no import promise. Software-renderer evidence is appearance/correctness only.',
 'Original core atan(0,0) convention remains untouched in both P/S; neither profile is a fix for that existing singularity.'
];
function fnvBytes(bytes:Uint8Array){let h=2166136261;for(const b of bytes){h^=b;h=Math.imul(h,16777619);}return(h>>>0).toString(16).padStart(8,'0');}
function hashText(text:string){return fnvBytes(new TextEncoder().encode(text));}
function hashGeometry(arrays:Float32Array[]){const bytes=new Uint8Array(arrays.reduce((n,a)=>n+a.byteLength,0));let offset=0;for(const a of arrays){bytes.set(new Uint8Array(a.buffer,a.byteOffset,a.byteLength),offset);offset+=a.byteLength;}return fnvBytes(bytes);}
const shaders={P:{vertexSource:materialP.vertexShader,fragmentSource:materialP.fragmentShader,vertexHash:hashText(materialP.vertexShader),fragmentHash:hashText(materialP.fragmentShader),sha256:null as null|{vertex:string;fragment:string}},S:{vertexSource:materialS.vertexShader,fragmentSource:materialS.fragmentShader,vertexHash:hashText(materialS.vertexShader),fragmentHash:hashText(materialS.fragmentShader),sha256:null as null|{vertex:string;fragment:string}}};
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
 scene.remove(points);geometry.dispose();geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(data.positions,3));geometry.setAttribute('aSeed',new Float32BufferAttribute(data.seeds,1));points=new Points(geometry,state.profile==='P'?materialP:materialS);scene.add(points);
 materialP.uniforms.uPixelRatio.value=ratio;materialP.uniforms.uResolution.value.set(canvas.width,canvas.height);materialP.uniforms.uViewAspect.value=aspect;
 rebuildTape();
}
function events(){return selectEvents([...script,...manual],state.time,false);}
function sourceArrays(){return Object.fromEntries(['uStartTime','uCenterX','uCenterY','uStrength','uWidth','uDecay'].map(k=>[k,Array.from(materialP.uniforms[k].value as Float32Array)]));}
function render(){
 if(shaderErrors.length)throw new Error(shaderErrors.join('\n'));
 const u=materialP.uniforms;
 u.uTime.value=state.time;u.uAmbientScale.value=0;u.uSafeEnabled.value=0;u.uPolishMaster.value=0;
 buffer.clear();for(const e of events())buffer.spawn(e.x,e.y,e.time,{strength:e.strength,width:e.width,decay:e.decay});buffer.copyToUniforms(materialP);
 canonicalizeInactive(Object.fromEntries(['uStartTime','uCenterX','uCenterY','uStrength','uWidth','uDecay'].map(k=>[k,u[k].value as Float32Array])));
 points.material=state.profile==='P'?materialP:materialS;renderer.render(scene,camera);
 input('time').value=String(Number(state.time.toFixed(4)));input('scrub').value=String(state.time);input('seed').value=String(state.seed);
 element<HTMLSelectElement>('profile').value=state.profile;element<HTMLSelectElement>('scenario').value=state.scenario;
 element('play').textContent=playing?'Hold':'Play';
 element('status').textContent=`${playing?'PLAYING':'HELD'} · ${state.profile} · t=${state.time.toFixed(4)}s\n${cols}×${rows} points · ${budget.tier} · DPR${renderer.getPixelRatio()}\ngeometry ${geometryHash} · ${events().length} events · ${manual.length} manual`;
 element('motion').textContent=mq.matches?'Reduced motion: held by default. Explicit Play or seek opts into inspection.':'Starts held. Exact seeks and a shared 0–6s clock support paired review.';
}
function getState(){return {...state,playing};}
function pause(){playing=false;render();}
function seek(time:number){if(!Number.isFinite(time))throw new Error('Time must be finite');playing=false;lastManualTime=-Infinity;state.time=Math.max(0,Math.min(duration,time));render();return getState();}
function setState(patch:Partial<State>){
 if(patch.time!==undefined&&!Number.isFinite(patch.time))throw new Error('Time must be finite');
 if(patch.seed!==undefined&&(!Number.isInteger(patch.seed)||patch.seed<0||patch.seed>4294967295))throw new Error('Seed must be uint32');
 if(patch.profile!==undefined&&!['P','S'].includes(patch.profile))throw new Error('Unknown profile');
 if(patch.scenario!==undefined&&!['single','pair','null'].includes(patch.scenario))throw new Error('Unknown scenario');
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
  return {profile:vertexSource.includes('cos(6.283185307179586 * delta /')?'S':'P',linked:!!gl.getProgramParameter(program.program,gl.LINK_STATUS),vertexSource,fragmentSource,vertexHash:hashText(vertexSource),fragmentHash:hashText(fragmentSource)};
 });
}
function exportState(){
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
 const baseUniforms=Object.fromEntries(Object.entries(materialP.uniforms).map(([k,v])=>[k,ArrayBuffer.isView(v.value)?Array.from(v.value as Float32Array):v.value?.toArray?v.value.toArray():v.value]));
 const selected=events().map(e=>({...e}));
 const controls={time:state.time,seed:state.seed,scenario:state.scenario,geometryHash,sourceUniforms:sourceArrays(),baseUniforms,scriptedTape:script.map(e=>({...e})),manualEvents:manual.map(e=>({...e})),selectedEvents:selected,sourceSlots:replaySlots(selected,C.MAX_SWELL_SOURCES),ambient:0,auto:false,safe:0,polish:0,transfer:'original-A',globalFieldScale:materialP.uniforms.uGlobalFieldScale.value};
 const profileSettings={mode:state.profile,wavelength:WAVELENGTH,formula:state.profile==='P'?'bump=str*spatial*temporal':'bump=str*spatial*temporal*cos(2*pi*delta/.14)'};
 return {schema:'ripple-profile/v1',state:{...state},duration,playing,reducedMotion:mq.matches,manualEnabled,revision:typeof __PROFILE_REVISION__==='undefined'?'Unavailable: use study Vite config':__PROFILE_REVISION__,controlIdentity:hashText(JSON.stringify(controls)),fieldIdentity:hashText(JSON.stringify({controls,profile:profileSettings})),controls,field:{...controls,profile:profileSettings},profileSettings,geometry:{hash:geometryHash,hashAlgorithm:'FNV1a32 Float32 bytes, positions then seeds',cols,rows},viewport:{cssWidth:innerWidth,cssHeight:innerHeight,rawDpr:devicePixelRatio,appliedDpr:renderer.getPixelRatio(),framebufferWidth:canvas.width,framebufferHeight:canvas.height,budget},renderer:{userAgent:navigator.userAgent,threeRevision:REVISION,vendor:gl.getParameter(gl.VENDOR),renderer:gl.getParameter(gl.RENDERER),unmasked:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null},engineParameters:{...C},baseUniforms,negativeTransferReference:{provenance:'CPU reference of existing guards, not measured GPU output; rest seed=.5/ambient=0',samples:[0,-.25,-.5,-.8,-1/C.FIELD_SIZE_SOFT_CAP_K].map(field=>({field,...negativeTransferReference(field,{pixelRatio:renderer.getPixelRatio(),baseSize:C.DEFAULT_BASE_POINT_SIZE,sizeLift:C.DEFAULT_SIZE_LIFT_SCALE,sizeJitter:0,opacity:C.DEFAULT_POINT_OPACITY,opacityLift:C.POINT_OPACITY_LIFT_FROM_FIELD})}))},shaders:{hashAlgorithm:'FNV1a32 UTF8 plus SHA256 when secure-context crypto is available',...shaders},compiledPrograms:compiledPrograms(),shaderErrors:[...shaderErrors],limitations:limits};
}
const api={setState,seek,pause,hold:pause,play,restart:()=>seek(0),getTime:()=>state.time,getState,addManual,clearManual:()=>{manual=[];lastManualTime=-Infinity;render();return getState();},setPanelVisible:(visible:boolean)=>document.body.classList.toggle('capture',!visible),awaitReady:async()=>{await shaderHashReady;await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>{render();resolve();}));return getState();},exportState};
function invoke(action:()=>unknown){try{action();element('error').textContent='';}catch(error){playing=false;element('error').textContent=String(error);console.error(error);}}
element('profile').onchange=()=>invoke(()=>setState({profile:element<HTMLSelectElement>('profile').value as State['profile']}));element('scenario').onchange=()=>invoke(()=>setState({scenario:element<HTMLSelectElement>('scenario').value as State['scenario']}));input('seed').onchange=()=>invoke(()=>setState({seed:Number(input('seed').value)}));input('time').onchange=()=>invoke(()=>seek(Number(input('time').value)));input('scrub').oninput=()=>invoke(()=>seek(Number(input('scrub').value)));
element('play').onclick=()=>invoke(()=>playing?pause():play());element('restart').onclick=()=>invoke(()=>seek(0));input('manual').onchange=()=>{manualEnabled=input('manual').checked;};element('clear').onclick=()=>api.clearManual();
element('export').onclick=()=>invoke(()=>{const data=exportState();const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`ripple-profile-${state.scenario}-${state.profile}-${state.time.toFixed(3)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
canvas.addEventListener('pointerdown',event=>{if(!manualEnabled||state.time-lastManualTime<C.PERF_POINTER_SWELL_MIN_INTERVAL)return;lastManualTime=state.time;const rect=canvas.getBoundingClientRect();invoke(()=>addManual({x:((event.clientX-rect.left)/rect.width*2-1)*innerWidth/innerHeight,y:1-(event.clientY-rect.top)/rect.height*2}));});
window.addEventListener('resize',()=>invoke(()=>{pause();regenerate();render();}));mq.addEventListener('change',()=>invoke(()=>{pause();regenerate();render();}));
function frame(now:number){if(playing)invoke(()=>{state.time=Math.min(duration,state.time+(now-lastFrame)/1000);if(state.time===duration)playing=false;render();});lastFrame=now;requestAnimationFrame(frame);}
regenerate();render();
// Compile both profiles before exposing the API; never silently fall back from S to P.
points.material=materialS;renderer.compile(scene,camera);points.material=materialP;renderer.compile(scene,camera);render();
Object.assign(window,{rippleProfile:api});requestAnimationFrame(frame);
