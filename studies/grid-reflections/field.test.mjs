import {CONTOUR,contourAt} from './contour.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {makeGrid, signalAt, transfer, tapeFor, PARAMS, ambientAt} from './field.mjs';
test('seeded fixed planar grid is reproducible with exact pitch and no animated coordinates',()=>{
 const a=makeGrid(390,844,42),b=makeGrid(390,844,42),c=makeGrid(390,844,43);
 assert.deepEqual(a.positions,b.positions);assert.notDeepEqual(a.positions,c.positions);
 for(let i=2;i<a.positions.length;i+=3) assert.equal(a.positions[i],0);
 assert.ok(Math.abs(a.positions[3]-a.positions[0]-PARAMS.pitch)<1e-5);
 const original=a.positions.slice();for(const t of [0,.6,2,8])signalAt(.2,.4,t,tapeFor('overlap'));
 assert.deepEqual(a.positions,original);
});
test('signed field is deterministic, born continuously and expires without residual packets',()=>{
 const s=[{x:0,y:0,start:.4,strength:1}];
 assert.equal(signalAt(0,0,.4,s,false),0);
 const vals=Array.from({length:100},(_,i)=>signalAt(i/100,0,1,s,false));
 assert.ok(vals.some(x=>x<-.1));assert.ok(vals.some(x=>x>.1));
 assert.deepEqual(vals,Array.from({length:100},(_,i)=>signalAt(i/100,0,1,s,false)));
 assert.equal(signalAt(0,0,9,s,false),0);
});
test('all modes retain visible positive marks and gaps for arbitrary saturation',()=>{
 for(let i=-100;i<=100;i++){for(const mode of ['A','B','C']){
 const v=transfer(i/10,mode,.33,.7);
 assert.ok(v.diameter>=.25*PARAMS.pitch-1e-9&&v.diameter<=.69*PARAMS.pitch+1e-9);
 assert.equal(v.alpha,1);assert.ok(v.rgb.every(c=>c>=0&&c<=1));
 assert.ok(v.luminance>=.22-1e-9&&v.luminance<=.66+1e-9);
 }}
 assert.equal(transfer(-1,'A',0,0).diameter,transfer(1,'A',0,0).diameter);
 assert.ok(transfer(1,'B',0,0).diameter>transfer(-1,'B',0,0).diameter);
});
test('C adds only restrained zero-luminance chroma to B',()=>{
 for(let i=0;i<=100;i++){
 const b=transfer(i/50-1,'B',i/100,2),c=transfer(i/50-1,'C',i/100,2);
 assert.equal(c.diameter,b.diameter);assert.equal(c.alpha,b.alpha);
 assert.ok(Math.abs(c.rgb[0]*.2126+c.rgb[1]*.7152+c.rgb[2]*.0722-b.luminance)<1e-12);
 assert.ok(Math.max(...c.rgb)-Math.min(...c.rgb)<.131);
 }
});
test('scenario tape copies cannot mutate subsequent replay',()=>{
 const a=tapeFor('overlap');a[0].x=900;assert.notEqual(tapeFor('overlap')[0].x,900);
 assert.equal(tapeFor('quiet').length,0);assert.equal(tapeFor('single').length,1);
 assert.equal(tapeFor('overlap').length,3);
});

test('C saturated tint remains inside declared linear RGB gamut bound',()=>{
 for(const s of [-1,0,1])for(const x of [-100,100])for(const y of [-100,100]){const c=transfer(s,'C',x,y);assert.ok(c.rgb.every(v=>v>=.1136&&v<=.7664));assert.ok(Math.max(...c.rgb)-Math.min(...c.rgb)<.131);}
});

test('contour mask stays bounded and leaves broad quiet interiors with explicit strokes',()=>{
 let quiet=0,stroke=0,changed=0;
 for(let j=0;j<60;j++)for(let i=0;i<90;i++){
 const x=-1.6+i*3.2/89,y=-1+j*2/59,a=contourAt(x,y,0,900),b=contourAt(x,y,3,900);
 assert.ok(Number.isFinite(a.mask)&&a.mask>=0&&a.mask<=1);
 assert.ok(a.distPx>=0&&Number.isFinite(a.gradient));
 if(a.mask===0)quiet++;if(a.mask>.8)stroke++;if(Math.abs(a.mask-b.mask)>.2)changed++;
 assert.equal(a.mask,contourAt(x,y,0,900).mask);
 const raw=ambientAt(x,y,0,900);assert.ok(raw>=CONTOUR.baseline&&raw<=CONTOUR.baseline+CONTOUR.gain);
 }
 assert.ok(quiet>3500,'most samples retain quiet interiors');assert.ok(stroke>100&&stroke<1500,'strokes are present but sparse');assert.ok(changed>50,'contours reshape over time');
});
test('CSS distance scales with viewport height without modifying noise shape',()=>{
 for(let i=0;i<200;i++){
 const x=Math.sin(i)*1.6,y=Math.cos(i*.7),a=contourAt(x,y,1,450),b=contourAt(x,y,1,900);
 assert.equal(a.height,b.height);assert.equal(a.gradient,b.gradient);
 if(a.gradient*2/900>=1e-4)assert.ok(Math.abs(b.distPx-2*a.distPx)<1e-9);
 assert.ok(a.mask>=b.mask,'larger world footprint at smaller viewport');
 }
 assert.throws(()=>contourAt(0,0,0,0));
});
test('contours do not modify click-only scalar or accepted point bounds',()=>{
 const sources=tapeFor('single');
 for(let i=0;i<100;i++){
 const x=i/50-1,a=signalAt(x,.1,1.1,sources,false,390),b=signalAt(x,.1,1.1,sources,false,900);
 assert.equal(a,b);
 for(const h of [390,844,900]){
 const s=signalAt(x,.1,1.1,sources,true,h),v=transfer(s,'C',x,.1);
 assert.ok(Number.isFinite(s)&&Math.abs(s)<=1);assert.ok(v.diameter>=1.5&&v.diameter<=4.14);assert.ok(v.rgb.every(v=>v>=0&&v<=1));
 }
 }
});
