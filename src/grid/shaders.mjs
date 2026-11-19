import {CONTOUR,contourGLSL} from './contour.mjs';
import {PARAMS as P} from './field.mjs';
const f=n=>Number(n).toFixed(10);
export const createVertexShader=(ambient=true)=>`
uniform float uTime,uHeight,uDpr,uMode,uPull;
uniform vec2 uPointer;
uniform vec4 uSources[${P.maxSources}];
varying vec3 vInk;
varying float vFringe;
${contourGLSL}
float smoothCap(float x){return 2.0/(1.0+exp(-2.0*x))-1.0;}
void main(){
 vec2 p=position.xy*2.0/uHeight;
 float raw=${ambient?`${f(CONTOUR.baseline)}+${f(CONTOUR.gain)}*ambientSurface(p,uTime,2.0/uHeight).x`:'0.0'};float ambEdge=${ambient?'ambientSurface(p,uTime,2.0/uHeight).y':'0.0'};float waveEdge=0.0;
 for(int i=0;i<${P.maxSources};i++){
  vec4 source=uSources[i];float age=uTime-source.z;
  if(source.z<0.0||age<=0.0||age>=${f(P.lifetime)})continue;
  float r=sqrt(dot(p-source.xy,p-source.xy)+${f(P.core**2)});
  float d=r-${f(P.speed)}*age;
  float fade=min(1.0,(${f(P.lifetime)}-age)/.5);fade=fade*fade*(3.0-2.0*fade);
  float env=clamp(source.w,0.0,1.0)*(1.0-exp(-age/${f(P.rise)}))*exp(-${f(P.decay)}*age)*fade*exp(-.5*d*d/${f(P.width**2)});
  float phase=6.283185307179586*d/${f(P.wavelength)};
  raw+=env*cos(phase);
  waveEdge+=env*(-sin(phase))*((p.x-source.x)/max(r,1e-4));
 }
 float pd=length(p-uPointer);
 float bump=exp(-pd*pd*1.65)*uPull;
 float s=smoothCap(raw/${f(P.cap)});
 float y=${f(P.lumaBase)}-${f(P.lumaGain)}*s;
 float tint=uMode>1.5?${f(P.chroma)}*smoothCap(-.65*p.x+.35*p.y+.6*s+bump*1.15):0.0;
 float subEdge=uMode>1.5?clamp(ambEdge+waveEdge*.9,-1.0,1.0):0.0;
 vec3 subAA=vec3(subEdge*.22,subEdge*.03,-subEdge*.24);
 vInk=clamp(vec3(y+tint,y+.15*tint,y-${f((.2126+.7152*.15)/.0722)}*tint)+subAA,0.0,1.0);
 vFringe=uMode>1.5?clamp(abs(s)*.75+bump*.45,0.0,1.0):0.0;
 gl_PointSize=${f(P.pitch)}*(${f(P.diameterBase)}+(uMode>.5?${f(P.diameterGain)}*s:0.0))*uDpr;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;
export const vertexShader=createVertexShader();
export const fragmentShader=`
varying vec3 vInk;
varying float vFringe;
void main(){
 vec2 pc=gl_PointCoord-.5;
 float r=length(pc);
 float edge=fwidth(r);
 float coverage=1.0-smoothstep(.5-edge,.5,r);
 if(coverage<=0.0)discard;
 float rim=smoothstep(.16,.48,r)*(1.0-smoothstep(.46,.52,r));
 float horiz=clamp(pc.x*2.2,-1.0,1.0);
 vec3 aa=vec3(-horiz*.09,-abs(horiz)*.02,horiz*.10)*(rim*vFringe);
 gl_FragColor=vec4(clamp(vInk+aa,0.0,1.0),coverage);
#include <colorspace_fragment>
}`;
