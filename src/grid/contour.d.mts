export const CONTOUR:Readonly<{timeScale:number;frequency:number;octaves:number;warpOctaves:number;levels:number;widthPx:number;edge:number;warpAmplitude:number;warpFrequency:number;warpSpeed:number;baseline:number;gain:number}>;
export const contourGLSL:string;
export function contourAt(x:number,y:number,time:number,height?:number):{mask:number;distPx:number;height:number;gradient:number};
