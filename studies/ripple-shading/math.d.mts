export interface Coefficients {step:number;heightScale:number;gain:number;lightAngleDegrees?:number}
export const COEFFICIENTS:Readonly<Required<Coefficients>>;
export function validateCoefficients(c:Coefficients):void;
export function centralSlope(field:(x:number,y:number)=>number,x:number,y:number,step?:number):[number,number];
export function toneMultiplier(slope:[number,number],light:[number,number],heightScale?:number,gain?:number):number;
