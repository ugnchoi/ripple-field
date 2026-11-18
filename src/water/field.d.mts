export interface WaveSource{x:number;y:number;start:number;strength:number}
export const PARAMS:Readonly<{wavelength:number;speed:number;width:number;amplitude:number;decay:number;rise:number;coreRadius:number;heightCap:number;lifetime:number;fadeTail:number;maxSources:number;maxDelta:number;mergeRadius:number;mergeWindow:number}>;
export const AMBIENT:ReadonlyArray<Readonly<{amplitude:number;wavelength:number;speed:number;x:number;y:number;phase:number}>>;
export function evaluateField(x:number,y:number,time:number,sources:WaveSource[],ambient?:boolean):{height:number;dx:number;dy:number};
export function resolveMeshSampling(width:number,height:number):{columns:number;rows:number;vertexBudget:number;stepX:number;stepY:number;samplesPerWavelength:number;pixelRatioCap:number};
