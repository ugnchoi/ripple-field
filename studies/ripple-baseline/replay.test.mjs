import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seededRandom, makeTape, selectEvents, replaySlots, makeGeometryData} from './replay.mjs';
// Catches accidental dependence on session randomness or wrong seed handling.
test('seeded streams repeat and distinct seeds diverge',()=>{
 const a=seededRandom(47),b=seededRandom(47),c=seededRandom(48);
 const xs=Array.from({length:40},()=>a());
 assert.equal(xs.length,40); assert.ok(xs.every(x=>x>=0&&x<1));
 assert.deepEqual(xs,Array.from({length:40},()=>b()));
 assert.notDeepEqual(xs,Array.from({length:40},()=>c()));
});
// Catches < versus <= boundary loss and auto-condition leakage.
test('event boundary includes exact time and filters only auto layer',()=>{
 const tape=[{id:'s',time:1,kind:'script'},{id:'a',time:2,kind:'auto'}];
 assert.deepEqual(selectEvents(tape,0.999,true),[]);
 assert.deepEqual(selectEvents(tape,1,true).map(e=>e.id),['s']);
 assert.deepEqual(selectEvents(tape,2,false).map(e=>e.id),['s']);
 assert.deepEqual(selectEvents(tape,2,true).map(e=>e.id),['s','a']);
});
// Catches stale slots retained by seeking backwards; literal source IDs hand derived.
test('replay is independent of earlier forward and backward seeks',()=>{
 const tape=Array.from({length:20},(_,i)=>({id:String(i),time:i,kind:'script'}));
 assert.deepEqual(replaySlots(selectEvents(tape,19,true),3).map(e=>e.id),['18','19','17']);
 assert.deepEqual(replaySlots(selectEvents(tape,1,true),3).map(e=>e.id),['0','1']);
 assert.deepEqual(replaySlots(selectEvents(tape,19,true),3).map(e=>e.id),['18','19','17']);
});
// Catches incorrect replacement under simultaneous sources: oldest slot tie resolves first.
test('capacity recycles oldest and first index on ties',()=>{
 const events=[{id:'a',time:0},{id:'b',time:0},{id:'c',time:1},{id:'d',time:2}];
 assert.deepEqual(replaySlots(events,2).map(e=>e.id),['c','d']);
});
// Catches tape generated based on seek time rather than independent windows.
test('automatic tape has five events per window with bounded current distributions',()=>{
 const opts={seed:47,scenario:'ambient-only',duration:30,aspect:1.6};
 const a=makeTape(opts),b=makeTape(opts);
 assert.deepEqual(a,b); assert.equal(a.length,15);
 for(let w=0;w<3;w++) assert.equal(a.filter(e=>e.time>=10*w&&e.time<10*(w+1)).length,5);
 assert.ok(a.every(e=>e.kind==='auto'&&Math.abs(e.x)<=1.6&&Math.abs(e.y)<=1&&e.strength>=.4092&&e.strength<=.4708));
 assert.deepEqual(a,makeTape({...opts,duration:40}).slice(0,15));
});
// Catches loss of deterministic geometry and fixture stimulus coverage.
test('geometry and scripted burst are reproducible and cross capacity',()=>{
 const a=makeGeometryData(1.6,240,47),b=makeGeometryData(1.6,240,47);
 assert.deepEqual(a,b); assert.equal(a.positions.length,a.seeds.length*3);
 assert.notDeepEqual(a.seeds,makeGeometryData(1.6,240,48).seeds);
 const burst=makeTape({seed:1,scenario:'burst',duration:10,aspect:1.6}).filter(e=>e.kind==='script');
 assert.equal(burst.length,20); assert.equal(burst[0].time,1); assert.equal(burst[19].time,4.04);
});
// Catches inactive private buffer history leaking into serialized exact state.
test('inactive uniform payload is canonical while active Float32 values are retained',async()=>{
 const {canonicalizeInactive}=await import('./replay.mjs');
 const arrays={uStartTime:new Float32Array([-1,2]),uCenterX:new Float32Array([9,.25]),uStrength:new Float32Array([.9,.8])};
 canonicalizeInactive(arrays);
 assert.deepEqual(Array.from(arrays.uCenterX),[0,.25]);
 assert.equal(arrays.uStrength[0],0);assert.equal(arrays.uStrength[1],Math.fround(.8));
 assert.deepEqual(Array.from(arrays.uStartTime),[-1,2]);
});
// Catches silent reconstruction after a viewport/code/tape mismatch.
test('import rejects incompatible experiments instead of silently reconstructing',async()=>{
 const {assertCompatibleImport}=await import('./replay.mjs');
 const current={parameters:{width:.075},viewport:{cssWidth:1440,cssHeight:900,appliedDpr:1},geometry:{hash:'abc'},eventTape:[{time:1}],revision:{files:{engine:'sha'}}};
 assert.doesNotThrow(()=>assertCompatibleImport(structuredClone(current),current));
 for(const field of ['parameters','viewport','geometry','eventTape','revision']){
  const saved=structuredClone(current);saved[field]={different:true};
  assert.throws(()=>assertCompatibleImport(saved,current),/incompatible/i);
 }
});
