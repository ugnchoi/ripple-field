import {test} from 'node:test';
import assert from 'node:assert/strict';
import {centralSlope,toneMultiplier,validateCoefficients} from './math.mjs';
// Wrong finite-difference divisor/offset fails this independently derived Gaussian derivative.
test('central slope converges to analytic Gaussian derivative in world coordinates',()=>{
 const f=(x,y)=>Math.exp(-.5*(x*x+y*y)/.01);
 const g=centralSlope(f,.1,0,.0025);
 assert.ok(Math.abs(g[0]-(-6.065306597126334))<.002);assert.equal(g[1],0);
 const finer=centralSlope(f,.1,0,.00125);
 assert.ok(Math.abs(finer[0]+6.065306597126334)<Math.abs(g[0]+6.065306597126334));
});
// Zero gradient must preserve exact base tone, not add constant lighting.
test('flat and zero-source field has exact multiplier one for either light',()=>{
 assert.deepEqual(centralSlope(()=>0,0,0,.0025),[0,0]);
 assert.equal(toneMultiplier([0,0],[.8,.6],.06,.45),1);
 assert.equal(toneMultiplier([0,0],[-.8,-.6],.06,.45),1);
});
// Independent 3-4-5-style normalization; catches unnormalized light, wrong slope sign, or extra bias.
test('normal-based tone agrees with independently calculated directional response',()=>{
 const expected=1-.45*3/Math.sqrt(26);
 assert.ok(Math.abs(toneMultiplier([3,4],[1,0],1,.45)-expected)<1e-14);
 assert.ok(Math.abs(toneMultiplier([3,4],[2,0],1,.45)-expected)<1e-14);
});
// Reversal must be odd around unchanged baseline, including both signed directions.
test('reversing planar light reverses modulation without changing its mean',()=>{
 const a=toneMultiplier([8,-3],[.8191520442889918,.573576436351046],.06,.45);
 const b=toneMultiplier([8,-3],[-.8191520442889918,-.573576436351046],.06,.45);
 assert.ok(a!==1);assert.ok(Math.abs(a+b-2)<1e-14);
});
// Incorrect normalization can overflow or exceed declared gain; guards reject undefined inputs.
test('extreme finite gradients stay finite and bounded; undefined math is rejected',()=>{
 for(const g of [[1e300,1e300],[-1e300,1e300],[0,0]]){const m=toneMultiplier(g,[1,0],.06,.45);assert.ok(Number.isFinite(m)&&m>=.55&&m<=1.45);}
 assert.throws(()=>centralSlope(()=>0,0,0,0),/step/i);
 assert.throws(()=>toneMultiplier([1,2],[0,0],.06,.45),/light/i);
 assert.throws(()=>toneMultiplier([Infinity,2],[1,0],.06,.45),/finite/i);
 assert.throws(()=>validateCoefficients({step:.0025,heightScale:.06,gain:2}),/gain/i);
});
