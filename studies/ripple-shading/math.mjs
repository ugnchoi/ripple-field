/** Preregistered diagnostic constants. Never tuned by frame or capture. */
export const COEFFICIENTS=Object.freeze({step:.0025,heightScale:.06,gain:.45,lightAngleDegrees:35});
export function validateCoefficients({step,heightScale,gain}) {
 if(!Number.isFinite(step)||step<=0)throw new Error('Finite positive step required');
 if(!Number.isFinite(heightScale)||heightScale<0)throw new Error('Finite nonnegative heightScale required');
 if(!Number.isFinite(gain)||gain<0||gain>=1)throw new Error('Gain must be finite in [0,1)');
}
export function centralSlope(field,x,y,step=COEFFICIENTS.step) {
 if(!Number.isFinite(step)||step<=0)throw new Error('Finite positive step required');
 const samples=[field(x+step,y),field(x-step,y),field(x,y+step),field(x,y-step)];
 if(!samples.every(Number.isFinite))throw new Error('Field samples must be finite');
 return [(samples[0]-samples[1])/(2*step),(samples[2]-samples[3])/(2*step)];
}
/** CPU reference of the shader transfer; Math.hypot avoids overflow for diagnostic extremes. */
export function toneMultiplier(slope,light,heightScale=COEFFICIENTS.heightScale,gain=COEFFICIENTS.gain) {
 validateCoefficients({step:COEFFICIENTS.step,heightScale,gain});
 if(![...slope,...light].every(Number.isFinite))throw new Error('Slope and light must be finite');
 const lightLength=Math.hypot(...light);if(lightLength<1e-12)throw new Error('Light direction must be nonzero');
 const nx=-heightScale*slope[0],ny=-heightScale*slope[1],norm=Math.hypot(nx,ny,1);
 return 1+gain*(nx/norm*light[0]/lightLength+ny/norm*light[1]/lightLength);
}
