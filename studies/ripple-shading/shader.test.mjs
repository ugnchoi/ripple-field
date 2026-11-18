import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {injectShading} from './shader.mjs';
// Built from actual source regions, not copied fixture; catches drift in upstream integration contracts.
const material=readFileSync(new URL('../../src/engine/rippleFieldMaterial.ts',import.meta.url),'utf8');
const vertex=material.slice(material.indexOf('const vertexShader ='),material.indexOf('const fragmentShader ='));
const fragment=material.slice(material.indexOf('const fragmentShader ='),material.indexOf('const floatArrayUniform'));
// A failed anchor must stop the diagnostic, never silently change field or fall back.
test('shader injection rejects missing or duplicated revision-sensitive boundaries',()=>{
 for(const marker of ['void main() {','  vec2 p = transformed.xy;','  vField = sizeBoost;','  transformed.xy += accDisp;','  vAmbient = ambH;']){
  assert.throws(()=>injectShading(vertex.replace(marker,''),fragment),/shader contract/i);
  assert.throws(()=>injectShading(vertex+marker,fragment),/shader contract/i);
 }
 assert.throws(()=>injectShading(vertex,fragment.replace('  vec3 tone = diffuse * max(darken, 0.0);','')),/shader contract/i);
});
// Finite step / bounded gain validation must happen before GLSL emission.
test('shader construction rejects invalid numerical coefficients',()=>{
 assert.throws(()=>injectShading(vertex,fragment,{step:0,heightScale:.06,gain:.45}),/step/i);
 assert.throws(()=>injectShading(vertex,fragment,{step:.0025,heightScale:.06,gain:Infinity}),/gain/i);
});
