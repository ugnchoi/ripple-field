import {createWaterSurface,type WaterSurfaceController} from '../index';
const canvas=document.querySelector<HTMLCanvasElement>('canvas')!;
let controller:WaterSurfaceController;
const changes:Array<{status:string;paused:boolean}>=[];
function mount(paused=false,ambient=true){controller=createWaterSurface(canvas,{paused,ambient,strength:.7,onChange:change=>{changes.push({...change});document.querySelector('output')!.textContent=JSON.stringify(change);}});return controller.getDiagnostics();}
mount();
canvas.addEventListener('pointerdown',event=>{const b=canvas.getBoundingClientRect();controller.disturb((event.clientX-b.left)/b.width,(event.clientY-b.top)/b.height);});
document.getElementById('pause')!.onclick=()=>controller.setPaused(!controller.getDiagnostics().paused);
document.getElementById('clear')!.onclick=()=>controller.clear();
document.getElementById('pair')!.onclick=()=>{controller.disturb(.4,.5);controller.disturb(.6,.5);};
document.getElementById('stress')!.onclick=()=>{for(let i=0;i<16;i++)controller.disturb(.5,.5,1);};
document.getElementById('reset')!.onclick=()=>{controller.dispose();mount();};
Object.assign(window,{waterSmoke:{getController:()=>controller,getDiagnostics:()=>controller.getDiagnostics(),setPaused:(paused:boolean)=>controller.setPaused(paused),setStrength:(strength:number)=>controller.setStrength(strength),clear:()=>controller.clear(),disturb:(x:number,y:number,strength?:number)=>controller.disturb(x,y,strength),dispose:()=>controller.dispose(),remount:(paused=false,ambient=true)=>{controller.dispose();return mount(paused,ambient);},hidePanel:(hidden=true)=>document.body.classList.toggle('capture',hidden),changes:()=>changes.map(c=>({...c})),canvas}});
