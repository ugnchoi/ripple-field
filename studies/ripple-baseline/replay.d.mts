export interface StudyEvent { id:string; time:number; x:number; y:number; strength:number; width:number; decay:number; kind:'script'|'auto'|'manual' }
export function seededRandom(seed:number):()=>number;
export function selectEvents(tape:StudyEvent[],time:number,auto:boolean):StudyEvent[];
export function replaySlots(events:StudyEvent[],capacity?:number):StudyEvent[];
export function makeTape(options:{seed:number;scenario:string;duration?:number;aspect:number;parameters?:Record<string,number>}):StudyEvent[];
export function makeGeometryData(aspect:number,cols:number,seed:number,parameters?:Record<string,number>):{positions:Float32Array;seeds:Float32Array;cols:number;rows:number};

export function canonicalizeInactive(arrays:Record<string,Float32Array>):void;
export function assertCompatibleImport(saved:unknown,current:unknown):void;
