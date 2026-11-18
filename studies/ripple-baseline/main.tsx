import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {BufferGeometry,Float32BufferAttribute,OrthographicCamera,Points,Scene,WebGLRenderer,REVISION} from 'three';
import * as C from '../../src/engine/constants';
import {createRippleFieldMaterial,primeShapeUniforms,SwellSourceBuffer,resolvePerformanceBudget,clientRectToWorldBounds} from '../../src/engine';
import {Resume} from '../../src/resume/Resume';
import '@fontsource-variable/figtree';
import '../../src/resume.css';
import './study.css';
import {makeGeometryData,makeTape,selectEvents,replaySlots,canonicalizeInactive,assertCompatibleImport,type StudyEvent} from './replay.mjs';

declare const __STUDY_REVISION__: unknown;

type Condition='00'|'10'|'01'|'11';
type Scenario='ambient-only'|'single'|'pair'|'delayed-pair'|'burst'|'edge';
type State={time:number;seed:number;condition:Condition;scenario:Scenario;context:boolean};
const duration=30;
const state:State={time:0,seed:47,condition:'11',scenario:'ambient-only',context:false};
const limitations=[
 'Study seeded geometry replaces production Math.random; same algorithm and engine constants, not same random realization.',
 'Script strengths have no jitter; auto jitter is seeded. Manual pointer/key strengths have no jitter and are logged separately.',
 'Exact trial clock replaces wall clock. Source order: time then lexical id; full replay includes old sources, no age culling.',
 'Auto tape uses independent window-local streams, five sorted offsets per ten seconds; skips/catch-up in production RAF are not reproduced.',
 'Context uses unchanged Resume with study font/CSS and safe bounds, not production bootstrap. Panel overlays viewport; collapse/hide for captures.',
 'Production reduced motion remains unchanged. Study starts held and pauses on preference changes; playback requires explicit action.',
 'Resize regenerates normalized scripted/auto positions; manual positions retain recorded world coordinates. Compare identical viewport/DPR only.',
 'preserveDrawingBuffer is enabled for synchronous canvas inspection, unlike production; its performance cost is not measured.',
 'Software rendering provides appearance evidence only. No performance claims or reference-algorithm attribution.'
];
const canvas=document.querySelector<HTMLCanvasElement>('#field')!;
const renderer=new WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
renderer.setClearColor(0xf7f7fb,1);
const material=createRippleFieldMaterial();primeShapeUniforms(material.uniforms);
const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
const buffer=new SwellSourceBuffer();
const root=createRoot(document.getElementById('context')!);
const mq=matchMedia('(prefers-reduced-motion: reduce)');
let geometry=new BufferGeometry(),points=new Points(geometry,material);scene.add(points);
let tape:StudyEvent[]=[],manual:StudyEvent[]=[],playing=false,lastFrame=0,geometryHash='',cols=0,rows=0;
let manualEnabled=false,lastPointer={x:0,y:0},lastManualPointer=-Infinity,lastManualKey=-Infinity;
let budget:ReturnType<typeof resolvePerformanceBudget>;
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const input=(id:string)=>el<HTMLInputElement>(id);
function hashArrays(arrays:Float32Array[]){let h=2166136261;for(const a of arrays)for(const b of new Uint8Array(a.buffer,a.byteOffset,a.byteLength)){h^=b;h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
function regenerate(){
 const aspect=innerWidth/innerHeight;
 const memory=(navigator as Navigator&{deviceMemory?:number}).deviceMemory;
 budget=resolvePerformanceBudget(aspect,{cssWidth:innerWidth,cssHeight:innerHeight,prefersReducedMotion:mq.matches,deviceMemoryGb:memory});
 const ratio=Math.min(devicePixelRatio||1,budget.rendererPixelRatioCap);renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight);
 camera.left=-aspect;camera.right=aspect;camera.updateProjectionMatrix();
 const data=makeGeometryData(aspect,budget.gridCols,state.seed,{min:C.PERF_GRID_COLS_MIN,max:C.PERF_GRID_COLS_MAX,stagger:C.GRID_STAGGER,jitter:C.GRID_JITTER});
 cols=data.cols;rows=data.rows;geometryHash=hashArrays([data.positions,data.seeds]);
 scene.remove(points);geometry.dispose();geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(data.positions,3));geometry.setAttribute('aSeed',new Float32BufferAttribute(data.seeds,1));points=new Points(geometry,material);scene.add(points);
 material.uniforms.uPixelRatio.value=ratio;material.uniforms.uResolution.value.set(canvas.width,canvas.height);material.uniforms.uViewAspect.value=aspect;
 tape=makeTape({seed:state.seed,scenario:state.scenario,duration,aspect,parameters:{width:C.DEFAULT_SWELL_WIDTH,decay:C.DEFAULT_DECAY,autoCount:C.AUTO_RANDOM_SPAWN_COUNT_PER_WINDOW,window:C.AUTO_RANDOM_SPAWN_WINDOW_SEC,autoStrength:C.AUTO_RANDOM_SPAWN_STRENGTH,autoJitter:C.AUTO_RANDOM_SPAWN_STRENGTH_JITTER,autoWidth:C.AUTO_RANDOM_SPAWN_WIDTH_SCALE,pointerStrength:C.FOREGROUND_POINTER_SWELL_STRENGTH}});
}
function activeEvents(){return selectEvents([...tape,...manual],state.time,state.condition[1]==='1');}
function render(){
 material.uniforms.uTime.value=state.time;
 material.uniforms.uAmbientScale.value=state.condition[0]==='1'?1:0;
 material.uniforms.uPolishMaster.value=0;
 const safe=document.querySelector<HTMLElement>('[data-ripple-safe="primary"]');
 material.uniforms.uSafeEnabled.value=0;
 if(safe){const b={minX:0,minY:0,maxX:0,maxY:0};clientRectToWorldBounds(safe.getBoundingClientRect(),canvas.getBoundingClientRect(),innerWidth/innerHeight,b);if(b.maxX>b.minX&&b.maxY>b.minY){material.uniforms.uSafeEnabled.value=1;material.uniforms.uSafeBounds.value.set(b.minX,b.minY,b.maxX,b.maxY);}}
 buffer.clear();for(const e of activeEvents())buffer.spawn(e.x,e.y,e.time,{strength:e.strength,width:e.width,decay:e.decay});buffer.copyToUniforms(material);
 canonicalizeInactive(Object.fromEntries(['uStartTime','uCenterX','uCenterY','uStrength','uWidth','uDecay'].map(k=>[k,material.uniforms[k].value as Float32Array])));
 renderer.render(scene,camera);
 input('time').value=String(Number(state.time.toFixed(4)));input('scrub').value=String(state.time);
 el('status').textContent=`${playing?'PLAYING':'HELD'} · t=${state.time.toFixed(4)}s\n${cols} × ${rows} = ${cols*rows} points · ${budget.tier}\nDPR ${renderer.getPixelRatio()} · geometry ${geometryHash}\n${activeEvents().length} events through t · ${manual.length} manual total`;
 el('play').textContent=playing?'Hold':'Play';
 el('motion').textContent=mq.matches?'Reduced motion: held by default. Play and exact-time inspection are explicit opt-ins.':'Starts held. Use Play or seek an exact time; no uncontrolled clock.';
}
function pause(){playing=false;render();}
function resetManualCadence(){lastManualPointer=-Infinity;lastManualKey=-Infinity;}
function seek(time:number){resetManualCadence();if(!Number.isFinite(time))throw new Error('Time must be finite');playing=false;state.time=Math.max(0,Math.min(duration,time));render();return exportState();}
function setState(patch:Partial<State>){
 if(patch.condition!==undefined&&!['00','10','01','11'].includes(patch.condition))throw new Error('Unknown condition');
 if(patch.scenario!==undefined&&!['ambient-only','single','pair','delayed-pair','burst','edge'].includes(patch.scenario))throw new Error('Unknown scenario');
 if(patch.seed!==undefined&&(!Number.isInteger(patch.seed)||patch.seed<0||patch.seed>4294967295))throw new Error('Seed must be a uint32');
 if(patch.context!==undefined&&typeof patch.context!=='boolean')throw new Error('Context must be boolean');
 if(patch.time!==undefined&&!Number.isFinite(patch.time))throw new Error('Time must be finite');
 playing=false;resetManualCadence();Object.assign(state,patch);state.time=Math.max(0,Math.min(duration,state.time));
 flushSync(()=>root.render(state.context?<Resume/>:null));
 el<HTMLSelectElement>('condition').value=state.condition;el<HTMLSelectElement>('scenario').value=state.scenario;input('seed').value=String(state.seed);input('resume').checked=state.context;
 regenerate();render();return exportState();
}
function addManual(event:Partial<StudyEvent>={}){
 const e:StudyEvent={id:`manual-${String(manual.length).padStart(6,'0')}`,time:state.time,x:lastPointer.x,y:lastPointer.y,strength:C.FOREGROUND_POINTER_SWELL_STRENGTH,width:C.DEFAULT_SWELL_WIDTH,decay:C.DEFAULT_DECAY,...event,kind:'manual'};
 if(![e.time,e.x,e.y,e.strength,e.width,e.decay].every(Number.isFinite)||e.time<0||e.time>duration||e.width<=0||e.decay<=0)throw new Error('Invalid manual event');
 e.id=`manual-${String(manual.length).padStart(6,'0')}`;manual.push(e);render();return {...e};
}
function exportState(){
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
 return {schema:'ripple-baseline/v1',revision:typeof __STUDY_REVISION__==='undefined'?'Unavailable: start with study Vite config':__STUDY_REVISION__,prng:'Mulberry32 uint32; separate geometry and auto-window streams',state:{...state},duration,playing,reducedMotion:mq.matches,manualEnabled,geometry:{hash:geometryHash,hashAlgorithm:'FNV1a32 Float32 bytes, positions then seeds',cols,rows},viewport:{cssWidth:innerWidth,cssHeight:innerHeight,rawDpr:devicePixelRatio,appliedDpr:renderer.getPixelRatio(),framebufferWidth:canvas.width,framebufferHeight:canvas.height,budget},identity:{userAgent:navigator.userAgent,threeRevision:REVISION,vendor:gl.getParameter(gl.VENDOR),renderer:gl.getParameter(gl.RENDERER),unmaskedRenderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):null},parameters:{...C},uniforms:Object.fromEntries(Object.entries(material.uniforms).map(([k,v])=>[k,ArrayBuffer.isView(v.value)?Array.from(v.value as Float32Array):v.value?.toArray?v.value.toArray():v.value])),eventTape:tape.map(e=>({...e})),manualEvents:manual.map(e=>({...e})),selectedEvents:activeEvents(),sourceSlots:replaySlots(activeEvents(),C.MAX_SWELL_SOURCES),limitations};
}
function importSignature(data:ReturnType<typeof exportState>){return {parameters:data.parameters,viewport:data.viewport,geometry:data.geometry,eventTape:data.eventTape,revision:data.revision};}
function loadState(data:ReturnType<typeof exportState>){
 if(data.schema!=='ripple-baseline/v1')throw new Error('Unsupported study schema');
 // Compute the intended imported scene without mutating the current study.
 const current=exportState();
 const aspect=innerWidth/innerHeight;
 const expected=makeGeometryData(aspect,budget.gridCols,data.state.seed,{min:C.PERF_GRID_COLS_MIN,max:C.PERF_GRID_COLS_MAX,stagger:C.GRID_STAGGER,jitter:C.GRID_JITTER});
 const expectedTape=makeTape({seed:data.state.seed,scenario:data.state.scenario,duration,aspect,parameters:{width:C.DEFAULT_SWELL_WIDTH,decay:C.DEFAULT_DECAY,autoCount:C.AUTO_RANDOM_SPAWN_COUNT_PER_WINDOW,window:C.AUTO_RANDOM_SPAWN_WINDOW_SEC,autoStrength:C.AUTO_RANDOM_SPAWN_STRENGTH,autoJitter:C.AUTO_RANDOM_SPAWN_STRENGTH_JITTER,autoWidth:C.AUTO_RANDOM_SPAWN_WIDTH_SCALE,pointerStrength:C.FOREGROUND_POINTER_SWELL_STRENGTH}});
 assertCompatibleImport(importSignature(data),{...importSignature(current),geometry:{...current.geometry,hash:hashArrays([expected.positions,expected.seeds]),cols:expected.cols,rows:expected.rows},eventTape:expectedTape});
 const previous=manual;manual=[];
 try{for(const e of data.manualEvents??[])addManual(e);setState(data.state);}catch(error){manual=previous;render();throw error;}
 return exportState();
}
function play(){if(state.time>=duration)state.time=0;playing=true;lastFrame=performance.now();render();}
const api={awaitReady:async()=>{await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>{render();resolve();}));return exportState();},setState,seek,play,pause,addManual,clearManual:()=>{manual=[];render();return exportState();},exportState,loadState,setPanelVisible:(visible:boolean)=>document.body.classList.toggle('capture',!visible)};
Object.assign(window,{rippleStudy:api});
input('time').addEventListener('change',()=>seek(Number(input('time').value)));input('scrub').addEventListener('input',()=>seek(Number(input('scrub').value)));
el('play').onclick=()=>playing?pause():play();el('restart').onclick=()=>seek(0);
el('condition').onchange=()=>setState({condition:el<HTMLSelectElement>('condition').value as Condition});el('scenario').onchange=()=>setState({scenario:el<HTMLSelectElement>('scenario').value as Scenario});
input('seed').onchange=()=>{try{setState({seed:Number(input('seed').value)});}catch(e){alert(String(e));input('seed').value=String(state.seed);}};
input('resume').onchange=()=>setState({context:input('resume').checked});input('manual').onchange=()=>{manualEnabled=input('manual').checked;};el('clear').onclick=api.clearManual;
el('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(exportState(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`ripple-baseline-${state.seed}-${state.condition}-${state.time.toFixed(3)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
el('import').onclick=()=>input('file').click();input('file').onchange=async()=>{try{const file=input('file').files?.[0];if(file)loadState(JSON.parse(await file.text()));}catch(e){alert(String(e));}input('file').value='';};
window.addEventListener('pointerdown',event=>{
 if(!manualEnabled||(event.target as Element).closest('#panel'))return;
 if(state.time-lastManualPointer<C.PERF_POINTER_SWELL_MIN_INTERVAL)return;
 lastManualPointer=state.time;lastPointer={x:(event.clientX/innerWidth*2-1)*innerWidth/innerHeight,y:1-event.clientY/innerHeight*2};addManual(lastPointer);
});
window.addEventListener('keydown',event=>{if(!manualEnabled||event.repeat||event.ctrlKey||event.metaKey||event.altKey||(event.target as Element).closest('#panel,input,textarea,select,[contenteditable]'))return;if(state.time-lastManualKey<C.FOREGROUND_KEY_SWELL_MIN_INTERVAL)return;lastManualKey=state.time;addManual({...lastPointer,strength:C.FOREGROUND_KEY_SWELL_STRENGTH,width:C.DEFAULT_SWELL_WIDTH*.92});});
window.addEventListener('resize',()=>{pause();regenerate();render();});window.addEventListener('scroll',render,{passive:true});mq.addEventListener('change',()=>{pause();regenerate();render();});
function frame(now:number){if(playing){state.time=Math.min(duration,state.time+(now-lastFrame)/1000);if(state.time===duration)playing=false;render();}lastFrame=now;requestAnimationFrame(frame);}
setState({});requestAnimationFrame(frame);
