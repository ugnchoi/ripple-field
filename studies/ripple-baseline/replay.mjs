/** Study-only Mulberry32 stream. Never patches Math.random. */
export function seededRandom(seed) {
 let state=Number(seed)>>>0;
 return ()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export function selectEvents(tape,time,auto) {
 return tape.filter(e=>e.time<=time&&(auto||e.kind!=='auto')).sort((a,b)=>a.time-b.time||a.id.localeCompare(b.id));
}
/** Mirrors SwellSourceBuffer first-free, then first-oldest recycling. Fresh for every seek. */
export function replaySlots(events,capacity=16) {
 const slots=[];
 for(const e of events){
  if(slots.length<capacity){slots.push(e);continue;}
  let oldest=0;for(let i=1;i<slots.length;i++)if(slots[i].time<slots[oldest].time)oldest=i;
  slots[oldest]=e;
 }
 return slots;
}
export function makeTape({seed,scenario,duration=30,aspect=1,parameters={}}) {
 const p={width:.075,decay:.98,autoCount:5,window:10,autoStrength:.44,autoJitter:.07,autoWidth:.94,pointerStrength:.85,...parameters};
 const tape=[];
 const add=(id,time,x,y,strength=p.pointerStrength,width=p.width,kind='script')=>tape.push({id,time,x,y,strength,width,decay:p.decay,kind});
 if(scenario==='single')add('script-00',1,0,0);
 if(scenario==='pair'||scenario==='delayed-pair'){add('script-00',1,-.45,0);add('script-01',scenario==='pair'?1:1.5,.45,0);}
 if(scenario==='burst')for(let i=0;i<20;i++)add(`script-${String(i).padStart(2,'0')}`,Number((1+i*.16).toFixed(2)),0,0);
 if(scenario==='edge')add('script-00',1,aspect*.95,0);
 // Window-local streams keep tape prefixes invariant if trial duration increases.
 for(let w=0;w<Math.ceil(duration/p.window);w++){
  const random=seededRandom((Number(seed)>>>0)^Math.imul(w+1,0x9e3779b1));
  const offsets=Array.from({length:p.autoCount},()=>random()*p.window).sort((a,b)=>a-b);
  for(let i=0;i<offsets.length;i++)add(`auto-${String(w).padStart(4,'0')}-${i}`,w*p.window+offsets[i],(random()*2-1)*aspect,random()*2-1,p.autoStrength*(1-p.autoJitter+random()*2*p.autoJitter),p.width*p.autoWidth,'auto');
 }
 return tape.filter(e=>e.time<=duration).sort((a,b)=>a.time-b.time||a.id.localeCompare(b.id));
}
/** Copied study-local from src/engine/createPointGridGeometry.ts, replacing only RNG.
 * Parameters supplied from existing engine constants in main.tsx. */
export function makeGeometryData(aspect,colsRequested,seed,parameters={}) {
 const {min=40,max=512,stagger=.5,jitter=.12}=parameters;
 const cols=Math.max(min,Math.min(max,Math.round(colsRequested)));
 const rows=Math.max(56,Math.round((cols-1)/aspect)+1);
 const positions=new Float32Array(cols*rows*3),seeds=new Float32Array(cols*rows);
 const random=seededRandom(seed),dx=2*aspect/(cols-1),dy=2/(rows-1);
 let n=0;
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const s=random(),alt=Math.sin(s*12.9898)*43758.5453123;
  positions[3*n]=-aspect+(j%2)*stagger*dx+i/(cols-1)*(2*aspect-(j%2)*stagger*dx)+(s-.5)*jitter*dx;
  positions[3*n+1]=-1+j/(rows-1)*2+(alt-Math.floor(alt)-.5)*jitter*dy;
  seeds[n++]=s;
 }
 return {positions,seeds,cols,rows};
}
export function canonicalizeInactive(arrays) {
 for(let i=0;i<arrays.uStartTime.length;i++)if(arrays.uStartTime[i]<0){
  for(const [key,values] of Object.entries(arrays))if(key!=='uStartTime')values[i]=0;
 }
}
export function assertCompatibleImport(saved,current) {
 for(const key of ['parameters','viewport','geometry','eventTape','revision']){
  if(JSON.stringify(saved[key])!==JSON.stringify(current[key]))throw new Error(`Incompatible ${key}; restore the exported viewport/DPR/code before importing.`);
 }
}
