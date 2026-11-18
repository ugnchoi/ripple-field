import test from 'node:test';
import assert from 'node:assert/strict';
import * as production from './field.mjs';
import * as study from '../../studies/grid-reflections/field.mjs';
import {vertexShader,fragmentShader,createVertexShader} from './shaders.mjs';
import * as studyShaders from '../../studies/grid-reflections/shaders.mjs';
test('study and production share exact geometry, field and shader implementation',()=>{
 assert.equal(production.makeGrid,study.makeGrid);assert.equal(production.signalAt,study.signalAt);
 assert.equal(createVertexShader(true),studyShaders.vertexShader);assert.equal(fragmentShader,studyShaders.fragmentShader);
 assert.ok(vertexShader.includes('gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0)'));
});
test('ambient disable changes only raw ambient initialization, retaining click evaluation and projection',()=>{
 const enabled=createVertexShader(true),disabled=createVertexShader(false);
 const prefix=s=>s.slice(0,s.indexOf(' float raw=')),suffix=s=>s.slice(s.indexOf('\n for(int i='));
 assert.equal(prefix(enabled),prefix(disabled));assert.equal(suffix(enabled),suffix(disabled));
 assert.ok(disabled.includes('float raw=0.0;'));
 assert.equal(production.signalAt(.3,.1,3,[],false,900),0);
});
