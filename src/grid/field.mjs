import {CONTOUR,contourAt} from './contour.mjs';
export const PARAMS=Object.freeze({pitch:4.5,seed:42,wavelength:.24,speed:.48,width:.24,decay:.65,rise:.12,lifetime:8,core:.012,cap:.65,diameterBase:.44,diameterGain:.24,lumaBase:.44,lumaGain:.22,chroma:.038,maxSources:16});
export function ambientAt(x,y,time,height=900){
 return CONTOUR.baseline+CONTOUR.gain*contourAt(x,y,time,height).mask;
}
export function makeGrid(width,height,seed=PARAMS.seed){
 if(![width,height].every(v=>Number.isFinite(v)&&v>0))throw new Error('Positive dimensions required');
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const ox=(random()-.5)*PARAMS.pitch*.5,oy=(random()-.5)*PARAMS.pitch*.5;
 const cols=Math.floor(width/PARAMS.pitch),rows=Math.floor(height/PARAMS.pitch),positions=new Float32Array(cols*rows*3);
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=(j*cols+i)*3;positions[k]=(i-(cols-1)/2)*PARAMS.pitch+ox;positions[k+1]=(j-(rows-1)/2)*PARAMS.pitch+oy;}
 return {positions,cols,rows,seed};
}
const TAPE=Object.freeze([{x:-.28,y:.08,start:.4,strength:.9},{x:.3,y:-.15,start:1.05,strength:.8},{x:-.05,y:.38,start:1.55,strength:.7}].map(Object.freeze));
export function tapeFor(scenario='overlap'){
 if(!['quiet','single','overlap'].includes(scenario))throw new Error('Unknown scenario');
 return TAPE.slice(0,scenario==='quiet'?0:scenario==='single'?1:3).map(e=>({...e}));
}
export function signalAt(x,y,time,sources,ambient=true,height=900){
 let raw=ambient?ambientAt(x,y,time,height):0;
 for(const s of sources){const age=time-s.start;if(age<=0||age>=PARAMS.lifetime)continue;
 const r=Math.sqrt((x-s.x)**2+(y-s.y)**2+PARAMS.core**2),d=r-PARAMS.speed*age;
 const f=Math.min(1,(PARAMS.lifetime-age)/.5),tail=f*f*(3-2*f);
 raw+=Math.max(0,Math.min(1,s.strength))*(1-Math.exp(-age/PARAMS.rise))*Math.exp(-PARAMS.decay*age)*tail*Math.exp(-.5*(d/PARAMS.width)**2)*Math.cos(2*Math.PI*d/PARAMS.wavelength);
 }return Math.tanh(raw/PARAMS.cap);
}
export function transfer(signal,mode,x,y){
 const s=Math.max(-1,Math.min(1,signal));const luminance=PARAMS.lumaBase-PARAMS.lumaGain*s;
 const tint=mode==='C'?PARAMS.chroma*Math.tanh(-.65*x+.35*y+.6*s):0;
 return {diameter:PARAMS.pitch*(PARAMS.diameterBase+(mode==='A'?0:PARAMS.diameterGain*s)),luminance,alpha:1,rgb:[luminance+tint,luminance+.15*tint,luminance-(.2126+.7152*.15)/.0722*tint]};
}
export function hashArray(array){let h=2166136261;for(const n of new Uint8Array(array.buffer,array.byteOffset,array.byteLength)){h=Math.imul(h^n,16777619)>>>0;}return h.toString(16).padStart(8,'0');}
