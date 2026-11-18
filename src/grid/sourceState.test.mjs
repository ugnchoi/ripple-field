import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GridState,worldFromNormalized} from './sourceState.mjs';
test('paused, hidden, offscreen, undrawable and lost inputs are dropped without changing user pause',()=>{
 const s=new GridState({paused:true,strength:.7});assert.equal(s.spawn(0,0),false);s.setPaused(false);
 for(const reason of ['hidden','offscreen','undrawable']){s.setSuspended(reason,true);assert.equal(s.spawn(0,0),false);s.setSuspended(reason,false);}
 s.setStatus('lost');assert.equal(s.spawn(0,0),false);s.setStatus('ready');assert.equal(s.spawn(0,0),true);
 s.setPaused(true);s.setSuspended('hidden',true);s.setSuspended('hidden',false);assert.equal(s.paused,true);assert.equal(s.activeCount,1);
});
test('resume resets wall clock; bounded delta and exact lifetime expiration',()=>{
 const s=new GridState();s.spawn(0,0);s.advance(1000);s.advance(1016);assert.equal(s.time,.016);
 s.setSuspended('offscreen',true);s.advance(90000);s.setSuspended('offscreen',false);s.advance(95000);assert.equal(s.time,.016);
 s.advance(96000);assert.equal(s.time,.066);
 for(let i=0;i<170;i++)s.advance(97000+i*50);assert.equal(s.activeCount,0);assert.equal(s.shouldAnimate(false),false);assert.equal(s.shouldAnimate(true),true);
});
test('16 sources preserve independent same-frame clicks and FIFO eviction',()=>{
 const s=new GridState();for(let i=0;i<35;i++)assert.equal(s.spawn(i,0,.7),true);
 assert.equal(s.activeCount,16);const ids=Array.from(s.centerX).sort((a,b)=>a-b);assert.deepEqual(ids,Array.from({length:16},(_,i)=>i+19));
 const repeated=new GridState();for(let i=0;i<16;i++)repeated.spawn(0,0);assert.equal(repeated.activeCount,16);
});
test('clear preserves settings/time; dispose cannot be resurrected',()=>{
 const s=new GridState({strength:.35});s.spawn(.2,.1);s.advance(0);s.advance(20);s.setPaused(true);s.clear();assert.equal(s.activeCount,0);assert.equal(s.time,.02);assert.equal(s.paused,true);assert.equal(s.strength,.35);
 s.dispose();s.dispose();s.setPaused(false);s.setStatus('ready');s.setStrength(1);s.advance(100000);assert.equal(s.spawn(0,0),false);assert.equal(s.time,.02);assert.equal(s.shouldAnimate(true),false);assert.equal(s.strength,.35);
});
test('input maps actual canvas aspect and clamps/rejects invalid coordinates and strengths',()=>{
 assert.deepEqual(worldFromNormalized(.25,.75,2),{x:-1,y:-.5});assert.deepEqual(worldFromNormalized(9,-3,.5),{x:.5,y:1});assert.equal(worldFromNormalized(NaN,0,1),null);
 const s=new GridState();assert.equal(s.spawn(NaN,0),false);assert.equal(s.spawn(0,0,-1),false);s.setStrength(4);assert.equal(s.strength,1);s.spawn(0,0,3);assert.equal(s.sourceStrength[0],1);
});
