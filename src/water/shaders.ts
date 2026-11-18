import {AMBIENT,PARAMS} from './field.mjs';
const f=(value:number)=>Number.isInteger(value)?`${value}.0`:String(value);
const ambientTerms=AMBIENT.map(w=>{
 const norm=Math.hypot(w.x,w.y),k=2*Math.PI/w.wavelength;
 return `{vec2 direction=vec2(${f(w.x/norm)},${f(w.y/norm)});float k=${f(k)};float phase=k*(dot(direction,p)-${f(w.speed)}*uTime)+${f(w.phase)};raw+=${f(w.amplitude)}*sin(phase);gradient+=${f(w.amplitude)}*k*cos(phase)*direction;}`;
}).join('\n');
export const waterVertexShader=/* glsl */`
uniform float uTime;
uniform float uAmbient;
uniform float uStart[${PARAMS.maxSources}];
uniform float uCenterX[${PARAMS.maxSources}];
uniform float uCenterY[${PARAMS.maxSources}];
uniform float uStrength[${PARAMS.maxSources}];
varying vec2 vGradient;
varying float vHeight;
void main(){
 vec2 p=position.xy;float raw=0.0;vec2 gradient=vec2(0.0);
 if(uAmbient>0.5){${ambientTerms}}
 for(int i=0;i<${PARAMS.maxSources};i++){
  float start=uStart[i];if(start<0.0)continue;
  float age=uTime-start;if(age<0.0||age>=${f(PARAMS.lifetime)})continue;
  vec2 q=p-vec2(uCenterX[i],uCenterY[i]);
  float r=sqrt(dot(q,q)+${f(PARAMS.coreRadius**2)});
  float delta=r-${f(PARAMS.speed)}*age;
  float fade=clamp((${f(PARAMS.lifetime)}-age)/${f(PARAMS.fadeTail)},0.0,1.0);fade=fade*fade*(3.0-2.0*fade);
  float amplitude=${f(PARAMS.amplitude)}*clamp(uStrength[i],0.0,1.0)*(1.0-exp(-age/${f(PARAMS.rise)}))*exp(-${f(PARAMS.decay)}*age)*fade;
  float envelope=exp(-0.5*delta*delta/${f(PARAMS.width**2)});
  float phase=${f(2*Math.PI/PARAMS.wavelength)}*delta;
  float c=cos(phase);raw+=amplitude*envelope*c;
  float radial=amplitude*envelope*(-delta/${f(PARAMS.width**2)}*c-${f(2*Math.PI/PARAMS.wavelength)}*sin(phase));
  gradient+=radial*q/r;
 }
 float capped=tanh(raw/${f(PARAMS.heightCap)});
 vHeight=${f(PARAMS.heightCap)}*capped;
 vGradient=gradient*(1.0-capped*capped);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position.xy,vHeight,1.0);
}`;
export const MATERIAL=Object.freeze({base:'#cad8d0',reflectionLow:'#8aa79b',reflectionHigh:'#edf5f0',light:Object.freeze([-.6,.75,1] as const),reflectionBand:.45,specularTint:Object.freeze([1,.99,.94] as const),reflectionMix:.42,diffuseBase:.74,diffuseGain:.26,specularPower:64,specularGain:.34});
export const waterFragmentShader=/* glsl */`
uniform vec3 uBase;
uniform vec3 uReflectionLow;
uniform vec3 uReflectionHigh;
varying vec2 vGradient;
varying float vHeight;
void main(){
 vec3 normal=normalize(vec3(-vGradient,1.0));
 vec3 light=normalize(vec3(${MATERIAL.light.map(f).join(',')}));
 vec3 view=vec3(0.0,0.0,1.0);
 vec3 reflection=reflect(-view,normal);
 vec3 environment=mix(uReflectionLow,uReflectionHigh,smoothstep(-${f(MATERIAL.reflectionBand)},${f(MATERIAL.reflectionBand)},reflection.y));
 float diffuse=${f(MATERIAL.diffuseBase)}+${f(MATERIAL.diffuseGain)}*max(dot(normal,light),0.0);
 float specular=${f(MATERIAL.specularGain)}*pow(max(dot(normal,normalize(light+view)),0.0),${f(MATERIAL.specularPower)});
 vec3 color=mix(uBase*diffuse,environment,${f(MATERIAL.reflectionMix)})+specular*vec3(${MATERIAL.specularTint.map(f).join(',')});
 gl_FragColor=vec4(color,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
