import {createGridSurface,type GridSurfaceController} from '../index';
import type {SurfaceChange} from '../../experience/types';
const canvas=document.querySelector('canvas')!;
let controller:GridSurfaceController;
const changes:SurfaceChange[]=[];
function remount(paused=true,ambient=true){controller?.dispose();controller=createGridSurface(canvas,{paused,ambient,strength:.7,onChange:change=>changes.push({...change})});return controller.getDiagnostics();}
remount();
// QA entry only. This module is excluded from the application's build inputs.
Object.assign(window,{gridSmoke:{canvas,getController:()=>controller,getDiagnostics:()=>controller.getDiagnostics(),setPaused:(value:boolean)=>controller.setPaused(value),setStrength:(value:number)=>controller.setStrength(value),disturb:(x:number,y:number,strength?:number)=>controller.disturb(x,y,strength),clear:()=>controller.clear(),dispose:()=>controller.dispose(),remount,changes:()=>changes.map(change=>({...change}))}});
