/** Preregistered wavelength in world units. No screenshot-led tuning. */
export const WAVELENGTH=.14;
function validateWavelength(wavelength){if(!Number.isFinite(wavelength)||wavelength<=0)throw new Error('Wavelength must be finite and positive');}
export function profileBump(envelope,delta,profile,wavelength=WAVELENGTH){
 validateWavelength(wavelength);
 if(!Number.isFinite(envelope)||!Number.isFinite(delta))throw new Error('Envelope and delta must be finite');
 if(!['P','S'].includes(profile))throw new Error('Unknown profile');
 if(profile==='P')return envelope;
 const phase=2*Math.PI*delta/wavelength;if(!Number.isFinite(phase))throw new Error('Carrier phase must be finite');
 return envelope===0?0:envelope*Math.cos(phase);
}
export function injectSignedProfile(vertex,wavelength=WAVELENGTH){
 validateWavelength(wavelength);
 const marker='    float bump = str * spatial * temporal;';
 if(typeof vertex!=='string'||vertex.split(marker).length!==2)throw new Error('Shader contract failed: expected exactly one original bump assignment');
 return vertex.replace(marker,`    float bump = str * spatial * temporal * cos(6.283185307179586 * delta / ${wavelength});`);
}
/** CPU documentation reference of existing ambient-off output guards, used in exported diagnostics.
 * Not measured per-vertex GPU output and not a replacement transfer. */
export function negativeTransferReference(field,{pixelRatio,baseSize,sizeLift,sizeJitter=0,opacity,opacityLift}){
 if(!Number.isFinite(pixelRatio)||pixelRatio<=0)throw new Error('pixelRatio must be finite and positive');
 if(![field,baseSize,sizeLift,sizeJitter,opacity,opacityLift].every(Number.isFinite))throw new Error('Transfer inputs must be finite');
 return {pointSizeFramebuffer:Math.max((baseSize+field*sizeLift+sizeJitter)*pixelRatio,.5),opacity:Math.min(opacity*Math.max(1+opacityLift*field,0),1)};
}
