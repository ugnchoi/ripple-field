import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WaterState,worldFromNormalized} from './sourceState.mjs';
// Reject input during pause/loss/hidden suspension rather than secretly replaying it later.
test('paused and suspended inputs never queue; user pause survives suspension',()=>{
 const state=new WaterState({paused:true,strength:.7});
 assert.equal(state.spawn(0,0),false);state.setPaused(false);assert.equal(state.spawn(0,0),true);
 state.setSuspended('hidden',true);assert.equal(state.spawn(.2,0),false);state.setPaused(true);state.setSuspended('hidden',false);
 assert.equal(state.paused,true);assert.equal(state.spawn(.2,0),false);assert.equal(state.activeCount,1);
 state.setPaused(false);state.setStatus('lost');assert.equal(state.spawn(0,0),false);state.setStatus('ready');assert.equal(state.activeCount,1);
});
// Clock must not accrue hidden/offscreen/context-gap seconds.
test('clock resumes without wall-clock jumps and expires old sources',()=>{
 const state=new WaterState({paused:false,strength:.7});assert.equal(state.spawn(0,0),true);
 state.advance(1000);state.advance(1016);assert.ok(Math.abs(state.time-.016)<1e-12);
 state.setSuspended('offscreen',true);state.advance(90000);state.setSuspended('offscreen',false);state.advance(91000);assert.ok(Math.abs(state.time-.016)<1e-12);
 state.advance(91016);assert.ok(Math.abs(state.time-.032)<1e-12);
 for(let i=1;i<180;i++)state.advance(91016+i*50);
 assert.equal(state.activeCount,0);assert.equal(state.shouldAnimate(false),false);
});
// Bounded storage and recycling; numeric source data, no per-frame growing collection.
test('source capacity recycles oldest, strength clamps, clear preserves time/settings',()=>{
 const state=new WaterState({paused:false,strength:.7});
 for(let i=0;i<17;i++){state.spawn(i,0);state.advance(1000+i*16);}
 assert.equal(state.activeCount,16);assert.equal(state.centerX[0],16);
 state.setStrength(2);assert.equal(state.strength,1);state.setStrength(-1);assert.equal(state.strength,0);
 const time=state.time;state.clear();assert.equal(state.activeCount,0);assert.equal(state.time,time);assert.equal(state.paused,false);assert.equal(state.strength,0);
});
// Destruction is irreversible and repeated calls cannot resurrect the source/clock.
test('disposed state is idempotent and rejects lifecycle resurrection',()=>{
 const state=new WaterState({paused:false,strength:1});state.spawn(0,0);state.advance(0);state.advance(16);
 state.dispose();state.dispose();const time=state.time;state.setPaused(false);state.setStatus('ready');state.setSuspended('hidden',false);state.advance(10000);
 assert.equal(state.spawn(0,0),false);assert.equal(state.activeCount,0);assert.equal(state.time,time);assert.equal(state.shouldAnimate(true),false);
});
// Actual displayed aspect (not browser window dimensions) defines source coordinate mapping.
test('normalized top-left input maps to orthographic world and rejects nonfinite input',()=>{
 assert.deepEqual(worldFromNormalized(0,0,2),{x:-2,y:1});assert.deepEqual(worldFromNormalized(1,1,2),{x:2,y:-1});assert.deepEqual(worldFromNormalized(.5,.5,.5),{x:0,y:0});
 assert.equal(worldFromNormalized(NaN,.5,1),null);
});
// Repeated synthetic same-frame clicks must not turn one logical impulse into16coherent packets.
// Explicitly preserve separated spatial inputs and ordinary >35ms follow-up impulses.
test('near-identical impulses coalesce with bounded strength while separated inputs remain independent',()=>{
 const state=new WaterState({paused:false,strength:.35});
 for(let i=0;i<16;i++)assert.equal(state.spawn(0,0),true);
 assert.equal(state.activeCount,1);assert.equal(state.sourceStrength[0],1);assert.equal(state.startTime[0],0);
 state.spawn(.006,0,.7);assert.equal(state.activeCount,1);assert.equal(state.centerX[0],0);
 state.spawn(.024,0,.7);assert.equal(state.activeCount,2);
 const pair=new WaterState({paused:false,strength:.7});pair.spawn(-.2,0);pair.spawn(.2,0);assert.equal(pair.activeCount,2);
 const sequential=new WaterState({paused:false,strength:.7});sequential.spawn(0,0);sequential.advance(1000);sequential.advance(1050);sequential.spawn(0,0);assert.equal(sequential.activeCount,2);
});
