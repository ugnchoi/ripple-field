/** World XY spans [-aspect,aspect] × [-1,1]; height is world Z. */
export const PARAMS=Object.freeze({wavelength:.14,speed:.42,width:.18,amplitude:.014,decay:.75,rise:.10,coreRadius:.018,heightCap:.035,lifetime:8,fadeTail:.5,maxSources:16,maxDelta:.05,mergeRadius:.012,mergeWindow:.035});
export const AMBIENT=Object.freeze([
 Object.freeze({amplitude:.0016,wavelength:.95,speed:.10,x:1,y:.3,phase:.4}),
 Object.freeze({amplitude:.0010,wavelength:.63,speed:.08,x:-.4,y:1,phase:2.1}),
 Object.freeze({amplitude:.0006,wavelength:.37,speed:.06,x:.7,y:-.8,phase:4.2}),
]);
/** CPU reference, not used in the render hot loop. Returns cap-consistent height+gradient. */
export function evaluateField(x,y,time,sources,ambient=true){
 if(![x,y,time].every(Number.isFinite))throw new Error('Field coordinates/time must be finite');
 let height=0,dx=0,dy=0;
 if(ambient)for(const wave of AMBIENT){
  const norm=Math.hypot(wave.x,wave.y),ux=wave.x/norm,uy=wave.y/norm,k=2*Math.PI/wave.wavelength;
  const phase=k*(ux*x+uy*y-wave.speed*time)+wave.phase;
  height+=wave.amplitude*Math.sin(phase);const slope=wave.amplitude*k*Math.cos(phase);dx+=slope*ux;dy+=slope*uy;
 }
 const k=2*Math.PI/PARAMS.wavelength;
 for(const source of sources){
  const age=time-source.start;if(source.start<0||age<0||age>=PARAMS.lifetime)continue;
  const qx=x-source.x,qy=y-source.y,r=Math.sqrt(qx*qx+qy*qy+PARAMS.coreRadius**2),delta=r-PARAMS.speed*age;
  const f=Math.max(0,Math.min(1,(PARAMS.lifetime-age)/PARAMS.fadeTail));
  const fade=f*f*(3-2*f);
  const amplitude=PARAMS.amplitude*Math.max(0,Math.min(1,source.strength))*(1-Math.exp(-age/PARAMS.rise))*Math.exp(-PARAMS.decay*age)*fade;
  const envelope=Math.exp(-.5*(delta/PARAMS.width)**2),c=Math.cos(k*delta);
  height+=amplitude*envelope*c;
  const radial=amplitude*envelope*(-delta/(PARAMS.width**2)*c-k*Math.sin(k*delta));
  dx+=radial*qx/r;dy+=radial*qy/r;
 }
 const capped=Math.tanh(height/PARAMS.heightCap),chain=1-capped*capped;
 return {height:PARAMS.heightCap*capped,dx:dx*chain,dy:dy*chain};
}
export function resolveMeshSampling(width,height){
 if(![width,height].every(Number.isFinite)||width<1||height<1)throw new Error('Positive finite canvas dimensions required');
 const aspect=width/height,vertexBudget=width<640?48000:72000;
 const density=Math.min(12/PARAMS.wavelength,Math.sqrt(vertexBudget/(4*aspect)));
 let columns=Math.min(512,Math.max(16,Math.ceil(2*aspect*density))),rows=Math.min(512,Math.max(16,Math.ceil(2*density)));
 while((columns+1)*(rows+1)>vertexBudget){if(columns>rows&&columns>16)columns--;else if(rows>16)rows--;else break;}
 const stepX=2*aspect/columns,stepY=2/rows;
 return {columns,rows,vertexBudget,stepX,stepY,samplesPerWavelength:PARAMS.wavelength/Math.max(stepX,stepY),pixelRatioCap:width<640?1.5:1.75};
}
