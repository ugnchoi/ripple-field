export const WAVELENGTH:number;
export function profileBump(envelope:number,delta:number,profile:'P'|'S',wavelength?:number):number;
export function injectSignedProfile(vertex:string,wavelength?:number):string;

export function negativeTransferReference(field:number,parameters:{pixelRatio:number;baseSize:number;sizeLift:number;sizeJitter?:number;opacity:number;opacityLift:number}):{pointSizeFramebuffer:number;opacity:number};
