export class WaterState{
 constructor(options?:{paused?:boolean;strength?:number});
 time:number;activeCount:number;disposed:boolean;status:'ready'|'lost'|'unavailable';hidden:boolean;offscreen:boolean;undrawable:boolean;paused:boolean;strength:number;readonly running:boolean;
 centerX:Float32Array;centerY:Float32Array;startTime:Float32Array;sourceStrength:Float32Array;
 resetClock():void;setPaused(value:boolean):void;setStatus(status:'ready'|'lost'|'unavailable'):void;setSuspended(reason:'hidden'|'offscreen'|'undrawable',value:boolean):void;setStrength(value:number):void;shouldAnimate(ambient:boolean):boolean;spawn(x:number,y:number,strength?:number):boolean;advance(stamp:number):boolean;clear():void;dispose():void;
}
export function worldFromNormalized(x:number,y:number,aspect:number):{x:number;y:number}|null;
