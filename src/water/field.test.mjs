import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PARAMS,evaluateField,resolveMeshSampling} from './field.mjs';
// Independent spatial finite differences catch missing envelope, radius or cap derivatives.
test('analytic full-field gradient matches independent finite differences including overlap and ambient',()=>{
 const sources=[{x:-.2,y:0,start:0,strength:1},{x:.23,y:.1,start:.2,strength:.7}];
 const h=1e-6;let observedGradient=0;
 for(const ambient of [false,true])for(const [x,y,time] of [[.1,.25,1],[-.2,0,.4],[.35,-.12,1.5],[0,.1,.7]]){
  const f=evaluateField(x,y,time,sources,ambient);observedGradient=Math.max(observedGradient,Math.abs(f.dx),Math.abs(f.dy));
  const dx=(evaluateField(x+h,y,time,sources,ambient).height-evaluateField(x-h,y,time,sources,ambient).height)/(2*h);
  const dy=(evaluateField(x,y+h,time,sources,ambient).height-evaluateField(x,y-h,time,sources,ambient).height)/(2*h);
  assert.ok(Math.abs(f.dx-dx)<2e-7,`dx ${x},${y}`);assert.ok(Math.abs(f.dy-dy)<2e-7,`dy ${x},${y}`);
 }
 assert.ok(observedGradient>.01);
});
// Crest/trough sign at analytically located phase positions: no positive-only or abs shortcut.
test('radial packet has signed crests and troughs with finite center',()=>{
 const t=1,source=[{x:0,y:0,start:0,strength:1}];
 const atRadius=r=>evaluateField(Math.sqrt(r*r-PARAMS.coreRadius**2),0,t,source,false);
 assert.ok(atRadius(PARAMS.speed*t).height>0);
 assert.ok(atRadius(PARAMS.speed*t+PARAMS.wavelength/2).height<0);
 const center=evaluateField(0,0,t,source,false);assert.equal(center.dx,0);assert.equal(center.dy,0);assert.ok(Number.isFinite(center.height));
});
// Smooth total cap must include ambient and all sources; source birth/expiry must not jump.
test('height is bounded and source onset/expiry are smooth null limits',()=>{
 const sources=Array.from({length:16},()=>({x:0,y:0,start:0,strength:1}));
 for(const t of [0,.05,.4,1,4,8]){const f=evaluateField(.1,.1,t,sources,true);assert.ok(Math.abs(f.height)<=.035);assert.ok([f.height,f.dx,f.dy].every(Number.isFinite));}
 assert.deepEqual(evaluateField(0,0,0,sources,false),{height:0,dx:0,dy:0});
 assert.deepEqual(evaluateField(.1,.1,8,sources,false),{height:0,dx:0,dy:0});
 assert.ok(Math.abs(evaluateField(.1,.1,7.999,sources,false).height)<1e-8);
 // Force near-cap overlap away from a stationary extremum to exercise cap chain rule.
 const h=1e-6,x=.18,y=.06,t=.4;
 const f=evaluateField(x,y,t,sources,true);assert.ok(Math.abs(f.height)>.02);
 const d=(evaluateField(x+h,y,t,sources,true).height-evaluateField(x-h,y,t,sources,true).height)/(2*h);
 assert.ok(Math.abs(f.dx-d)<2e-7);
});
// Sampling must resolve the frozen shortest wavelength and respect budget on realistic rectangles.
test('mesh sampler bounds vertices and resolves waves on desktop and mobile',()=>{
 for(const [width,height] of [[1440,900],[390,844],[2560,1440],[1200,300]]){
  const m=resolveMeshSampling(width,height);assert.ok((m.columns+1)*(m.rows+1)<=m.vertexBudget);assert.ok(m.samplesPerWavelength>=8);
 }
 assert.throws(()=>resolveMeshSampling(100,0),/dimensions/i);
});
