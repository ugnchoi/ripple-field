import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {profileBump,injectSignedProfile} from './profile.mjs';
// Catches unsigned/absolute carrier or wrong delta/wavelength phase.
test('signed envelope has crest and trough lobes on both sides of origin',()=>{
 assert.equal(profileBump(.4,0,'S'),.4);
 for(const delta of [-.14,.14])assert.ok(Math.abs(profileBump(.4,delta,'S')-.4)<1e-14);
 for(const delta of [-.07,.07])assert.ok(Math.abs(profileBump(.4,delta,'S')+.4)<1e-14);
 for(const delta of [-.035,.035])assert.ok(Math.abs(profileBump(.4,delta,'S'))<1e-14);
});
// P must bypass modulation and zero envelopes must not create sources.
test('positive mode and null envelope remain unchanged',()=>{
 for(const delta of [-1,-.07,0,.035,1])assert.equal(profileBump(.4,delta,'P'),.4);
 for(const delta of [-1,0,.07,1])assert.equal(profileBump(0,delta,'S'),0);
});
// Sum signed contributions before the existing nonlinear cap: opposite phases cancel.
test('signed contributions cancel linearly before existing scalar cap',()=>{
 const sum=profileBump(.4,0,'S')+profileBump(.4,.07,'S');
 assert.ok(Math.abs(sum)<1e-14);assert.ok(Math.abs(Math.tanh(sum*1.02)/1.02)<1e-14);
 assert.ok(Math.abs(profileBump(.2,0,'S')+profileBump(.2,0,'S')-.4)<1e-14);
});
// Prevent undefined GLSL literals or division by zero; bounded normal inputs stay finite.
test('invalid profile inputs are rejected and valid envelopes stay bounded',()=>{
 for(const delta of [-10,-.01,0,.07,10]){const value=profileBump(.4,delta,'S');assert.ok(Number.isFinite(value)&&Math.abs(value)<=.4);}
 for(const wavelength of [0,-1,NaN,Infinity])assert.throws(()=>profileBump(.4,0,'S',wavelength),/wavelength/i);
 assert.throws(()=>profileBump(.4,Infinity,'S'),/finite/i);
 assert.throws(()=>profileBump(.4,0,'unknown'),/profile/i);
});
const source=readFileSync(new URL('../../src/engine/rippleFieldMaterial.ts',import.meta.url),'utf8');
const bump='    float bump = str * spatial * temporal;';
// Shader revision drift must fail rather than silently inject zero/two carriers.
test('signed shader injection guards exact single bump assignment',()=>{
 assert.throws(()=>injectSignedProfile(source.replace(bump,'')),/shader contract/i);
 assert.throws(()=>injectSignedProfile(source+bump),/shader contract/i);
 assert.throws(()=>injectSignedProfile(source,0),/wavelength/i);
});
// Existing mapping must be disclosed faithfully: negative scalar lobes are not visible signed height.
test('negative-transfer reference records the fixed point floor and opacity cutoff',async()=>{
 const {negativeTransferReference}=await import('./profile.mjs');
 const p={pixelRatio:1,baseSize:3.2,sizeLift:6.4,sizeJitter:0,opacity:.215,opacityLift:1.25};
 assert.deepEqual(negativeTransferReference(-.9,p),{pointSizeFramebuffer:.5,opacity:0});
 assert.deepEqual(negativeTransferReference(0,p),{pointSizeFramebuffer:3.2,opacity:.215});
 const shallow=negativeTransferReference(-.25,p);assert.equal(shallow.pointSizeFramebuffer,1.6);assert.ok(Math.abs(shallow.opacity-.1478125)<1e-14);
 assert.equal(negativeTransferReference(-.5,{...p,pixelRatio:2}).pointSizeFramebuffer,.5);
 assert.throws(()=>negativeTransferReference(0,{...p,pixelRatio:0}),/pixelRatio/i);
});
