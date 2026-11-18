import {CONTOUR,contourGLSL} from './contour.mjs';
import {PARAMS as P} from './field.mjs';
const f=n=>Number(n).toFixed(10);
export const createVertexShader=(ambient=true)=>`
uniform float uTime,uHeight,uDpr,uMode,uPull;
uniform vec2 uPointer;
uniform vec4 uSources[${P.maxSources}];
varying vec3 vInk;
${contourGLSL}
float smoothCap(float x){return 2.0/(1.0+exp(-2.0*x))-1.0;}
void main(){
 vec2 p=position.xy*2.0/uHeight;
 float raw=${ambient?`${f(CONTOUR.baseline)}+${f(CONTOUR.gain)}*ambientSurface(p,uTime,2.0/uHeight).x`:'0.0'};
 for(int i=0;i<${P.maxSources};i++){
  vec4 source=uSources[i];float age=uTime-source.z;
  if(source.z<0.0||age<=0.0||age>=${f(P.lifetime)})continue;
  float r=sqrt(dot(p-source.xy,p-source.xy)+${f(P.core**2)});
  float d=r-${f(P.speed)}*age;
  float fade=min(1.0,(${f(P.lifetime)}-age)/.5);fade=fade*fade*(3.0-2.0*fade);
  raw+=clamp(source.w,0.0,1.0)*(1.0-exp(-age/${f(P.rise)}))*exp(-${f(P.decay)}*age)*fade*exp(-.5*d*d/${f(P.width**2)})*cos(6.283185307179586*d/${f(P.wavelength)});
 }
 float pd=length(p-uPointer);
 float bump=exp(-pd*pd*1.65)*uPull;
 float s=smoothCap(raw/${f(P.cap)});
 float y=${f(P.lumaBase)}-${f(P.lumaGain)}*s;
 float tint=uMode>1.5?${f(P.chroma)}*smoothCap(-.65*p.x+.35*p.y+.6*s+bump*1.15):0.0;
 vInk=vec3(y+tint,y+.15*tint,y-${f((.2126+.7152*.15)/.0722)}*tint);
 gl_PointSize=${f(P.pitch)}*(${f(P.diameterBase)}+(uMode>.5?${f(P.diameterGain)}*s:0.0))*uDpr;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;
export const vertexShader=createVertexShader();
export const fragmentShader=`
varying vec3 vInk;
void main(){float r=length(gl_PointCoord-.5);float edge=fwidth(r);float coverage=1.0-smoothstep(.5-edge,.5,r);if(coverage<=0.0)discard;gl_FragColor=vec4(vInk,coverage);
#include <colorspace_fragment>
}`;
