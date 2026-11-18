import {PARAMS} from './field.mjs';
const MAX_DELTA=.05;
/** Browser-independent source pool and lifetime clock. Typed arrays are reused as shader uniforms. */
export class GridState {
 nextSlot=0;time=0;activeCount=0;disposed=false;status='ready';hidden=false;offscreen=false;undrawable=false;lastStamp=NaN;
 centerX=new Float32Array(PARAMS.maxSources);centerY=new Float32Array(PARAMS.maxSources);startTime=new Float32Array(PARAMS.maxSources);sourceStrength=new Float32Array(PARAMS.maxSources);
 constructor({paused=false,strength=.7}={}){if(!Number.isFinite(strength))throw new Error('Finite strength required');this.paused=!!paused;this.strength=Math.max(0,Math.min(1,strength));this.startTime.fill(-1);}
 get running(){return !this.disposed&&this.status==='ready'&&!this.paused&&!this.hidden&&!this.offscreen&&!this.undrawable;}
 resetClock(){this.lastStamp=NaN;}
 setPaused(paused){if(this.disposed)return;const next=!!paused;if(next!==this.paused){this.paused=next;this.resetClock();}}
 setStatus(status){if(this.disposed)return;if(this.status!==status){this.status=status;this.resetClock();}}
 setSuspended(reason,value){if(this.disposed)return;if(!['hidden','offscreen','undrawable'].includes(reason))throw new Error('Unknown suspension');if(this[reason]!==!!value){this[reason]=!!value;this.resetClock();}}
 setStrength(value){if(this.disposed||!Number.isFinite(value))return;this.strength=Math.max(0,Math.min(1,value));}
 shouldAnimate(ambient){return this.running&&(!!ambient||this.activeCount>0);}
 spawn(x,y,strength=this.strength){
  if(!this.running||![x,y,strength].every(Number.isFinite)||strength<=0)return false;
  const slot=this.nextSlot;this.nextSlot=(slot+1)%PARAMS.maxSources;
  if(this.startTime[slot]<0)this.activeCount++;
  this.centerX[slot]=x;this.centerY[slot]=y;this.startTime[slot]=this.time;this.sourceStrength[slot]=Math.min(1,strength);return true;
 }
 advance(stamp){
  if(!Number.isFinite(stamp)||!this.running){this.resetClock();return false;}
  if(!Number.isFinite(this.lastStamp)){this.lastStamp=stamp;return false;}
  const delta=Math.min(MAX_DELTA,Math.max(0,(stamp-this.lastStamp)/1000));this.lastStamp=stamp;this.time+=delta;
  for(let i=0;i<PARAMS.maxSources;i++)if(this.startTime[i]>=0&&this.time-this.startTime[i]>=PARAMS.lifetime){this.startTime[i]=-1;this.sourceStrength[i]=0;this.activeCount--;}
  return delta>0;
 }
 clear(){this.nextSlot=0;this.startTime.fill(-1);this.sourceStrength.fill(0);this.centerX.fill(0);this.centerY.fill(0);this.activeCount=0;}
 dispose(){if(this.disposed)return;this.clear();this.disposed=true;this.status='unavailable';this.resetClock();}
}
export function worldFromNormalized(x,y,aspect){if(![x,y,aspect].every(Number.isFinite)||aspect<=0)return null;return{x:(Math.max(0,Math.min(1,x))*2-1)*aspect,y:1-Math.max(0,Math.min(1,y))*2};}
