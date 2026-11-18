import * as THREE from 'three';
import {PARAMS,makeGrid,tapeFor,hashArray} from './field.mjs';
import {vertexShader,fragmentShader} from './shaders.mjs';
import './style.css';
const canvas=document.querySelector('canvas'),panel=document.querySelector('.panel'),statusText=document.querySelector('.status');
const errors=[];
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
const pointSizeRange=Array.from(renderer.getContext().getParameter(renderer.getContext().ALIASED_POINT_SIZE_RANGE));
renderer.setClearColor('#f7f7fb');renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.debug.onShaderError=(_gl,_program,_vs,_fs)=>{errors.push('Shader compile/link failure');statusText.textContent='This browser could not draw the study.';};
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
const uniforms={uTime:{value:0},uHeight:{value:1},uDpr:{value:1},uMode:{value:1},uSources:{value:Array.from({length:PARAMS.maxSources},()=>new THREE.Vector4(0,0,-1,0))}};
const material=new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,depthTest:false,depthWrite:false});
let geometry=new THREE.BufferGeometry(),points=new THREE.Points(geometry,material);points.frustumCulled=false;scene.add(points);
let mode='B',scenario='overlap',time=0,events=tapeFor(scenario),paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
let width=0,height=0,grid,anchorHash,frames=0,raf=0,last=null,lost=false,disposed=false;
function syncSources(){for(let i=0;i<PARAMS.maxSources;i++){const e=events[i];uniforms.uSources.value[i].set(e?.x??0,e?.y??0,e?.start??-1,e?.strength??0);}}
function draw(){if(disposed||lost)return;uniforms.uTime.value=time;uniforms.uMode.value={A:0,B:1,C:2}[mode];renderer.render(scene,camera);frames++;}
function resize(){if(disposed)return;const rect=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
 if(w!==width||h!==height){width=w;height=h;grid=makeGrid(w,h);anchorHash=hashArray(grid.positions);geometry.dispose();geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(grid.positions,3));points.geometry=geometry;camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();}
 const dpr=Math.min(devicePixelRatio||1,2);renderer.setPixelRatio(dpr);renderer.setSize(w,h,false);uniforms.uHeight.value=h;uniforms.uDpr.value=dpr;draw();}
function canRun(){return !disposed&&!lost&&!paused&&!document.hidden;}
function cancel(){if(raf)cancelAnimationFrame(raf);raf=0;last=null;}
function schedule(){if(canRun()&&!raf)raf=requestAnimationFrame(tick);}
function tick(now){raf=0;if(!canRun()){last=null;return;}if(last!==null)time+=Math.min((now-last)/1000,.05);last=now;draw();schedule();}
function ui(){document.querySelector('#pause').textContent=paused?'Play':'Pause';document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));document.querySelector('#scenario').value=scenario;}
function setPaused(value){paused=!!value;cancel();ui();schedule();}
function setMode(value){if(!['A','B','C'].includes(value))throw new Error('Mode must be A, B or C');mode=value;ui();draw();}
function setTime(value){if(!Number.isFinite(value)||value<0)throw new Error('Time must be nonnegative finite');setPaused(true);time=value;draw();}
function setScenario(value){const next=tapeFor(value);scenario=value;events=next;time=0;syncSources();setPaused(true);draw();}
function replay(){events=tapeFor(scenario);time=0;syncSources();draw();setPaused(false);}
function clear(){events=[];syncSources();draw();}
function disturb(x,y,strength=.9){if(paused||disposed||lost||document.hidden)return false;if(![x,y,strength].every(Number.isFinite))return false;
 events=events.filter(e=>time-e.start<PARAMS.lifetime);if(events.length>=PARAMS.maxSources)events.shift();events.push({x:(Math.max(0,Math.min(1,x))*2-1)*width/height,y:1-2*Math.max(0,Math.min(1,y)),start:time,strength:Math.max(0,Math.min(1,strength))});syncSources();return true;}
function onPointer(e){if(e.button!==0||!e.isPrimary)return;const r=canvas.getBoundingClientRect();disturb((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);}
function onKey(e){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();disturb(.5,.5);}}
function visibility(){cancel();schedule();}
function contextLost(e){e.preventDefault();lost=true;cancel();statusText.textContent='Graphics paused. Waiting for the browser to reconnect.';}
function contextRestored(){lost=false;material.needsUpdate=true;resize();statusText.textContent='Every dot stays in place.';schedule();}
function hideControls(value=true){panel.hidden=value;document.querySelector('#hide').hidden=value;document.querySelector('#show').hidden=!value;}
function dispose(){if(disposed)return;disposed=true;cancel();observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);canvas.removeEventListener('pointerdown',onPointer);canvas.removeEventListener('keydown',onKey);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);geometry.dispose();material.dispose();renderer.dispose();}
const observer=new ResizeObserver(resize);observer.observe(canvas);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('pointerdown',onPointer);canvas.addEventListener('keydown',onKey);canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
document.querySelector('#pause').onclick=()=>setPaused(!paused);document.querySelector('#replay').onclick=replay;document.querySelector('#clear').onclick=clear;document.querySelector('#scenario').onchange=e=>{setScenario(e.target.value);replay();};document.querySelector('#hide').onclick=()=>hideControls();document.querySelector('#show').onclick=()=>hideControls(false);
window.gridReflections={setMode,setTime,setPaused,setScenario,replay,clear,disturb,hideControls,dispose,getState:()=>({mode,scenario,time,paused,seed:PARAMS.seed,params:PARAMS,events:events.map(e=>({...e})),viewport:{width,height,dpr:renderer.getPixelRatio()},grid:{cols:grid.cols,rows:grid.rows,count:grid.positions.length/3,anchorHash,currentHash:hashArray(geometry.attributes.position.array),positionInvariant:anchorHash===hashArray(geometry.attributes.position.array),z:0,pitch:PARAMS.pitch},frames,rafPending:!!raf,hidden:document.hidden,lost,disposed,shaderErrors:[...errors],pointSizeRange:[...pointSizeRange],revision:__GRID_REVISION__})};
syncSources();resize();ui();schedule();
