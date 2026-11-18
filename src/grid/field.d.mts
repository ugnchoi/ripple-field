export interface Source {x:number;y:number;start:number;strength:number}
export const PARAMS:Readonly<{pitch:number;seed:number;wavelength:number;speed:number;width:number;decay:number;rise:number;lifetime:number;core:number;cap:number;diameterBase:number;diameterGain:number;lumaBase:number;lumaGain:number;chroma:number;maxSources:number}>;
export function makeGrid(width:number,height:number,seed?:number):{positions:Float32Array;cols:number;rows:number;seed:number};
export function ambientAt(x:number,y:number,time:number,height?:number):number;
export function signalAt(x:number,y:number,time:number,sources:Source[],ambient?:boolean,height?:number):number;
export function transfer(signal:number,mode:string,x:number,y:number):{diameter:number;luminance:number;alpha:number;rgb:number[]};
export function tapeFor(scenario?:string):Source[];
export function hashArray(array:Float32Array):string;
