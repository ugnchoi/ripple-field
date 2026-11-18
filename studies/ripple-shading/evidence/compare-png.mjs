// Dependency-free decoded RGB comparison for noninterlaced 8-bit RGB/RGBA PNG smoke captures.
import {readFileSync,writeFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
function decode(path){
 const bytes=readFileSync(path);if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Not PNG');
 let offset=8,width,height,bpp;const compressed=[];
 while(offset<bytes.length){const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8),data=bytes.subarray(offset+8,offset+8+length);if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);bpp=data[9]===2?3:data[9]===6?4:0;if(data[8]!==8||data[12]!==0||!bpp)throw Error('Only noninterlaced RGB(A)8 supported');}if(type==='IDAT')compressed.push(data);offset+=length+12;}
 const raw=inflateSync(Buffer.concat(compressed)),stride=width*bpp,pixels=new Uint8Array(width*height*bpp);let pos=0;
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[pos++];if(filter>4)throw Error('Bad PNG filter');for(let x=0;x<stride;x++){const i=y*stride+x,left=x>=bpp?pixels[i-bpp]:0,up=y?pixels[i-stride]:0,upperLeft=y&&x>=bpp?pixels[i-stride-bpp]:0;const predictor=[0,left,up,Math.floor((left+up)/2),paeth(left,up,upperLeft)][filter];pixels[i]=(raw[pos++]+predictor)&255;}}
 const rgb=new Uint8Array(width*height*3);for(let i=0;i<width*height;i++)for(let c=0;c<3;c++)rgb[i*3+c]=pixels[i*bpp+c];return{width,height,rgb};
}
const a=decode(process.argv[2]),b=decode(process.argv[3]);if(a.width!==b.width||a.height!==b.height)throw Error('Mismatched dimensions');
let changed=0,max=0,sum=0;for(let i=0;i<a.rgb.length;i++){const d=Math.abs(a.rgb[i]-b.rgb[i]);sum+=d;max=Math.max(max,d);if(i%3===0&&[0,1,2].some(c=>a.rgb[i+c]!==b.rgb[i+c]))changed++;}
const result={width:a.width,height:a.height,exactDecodedRGB:changed===0,changedPixels:changed,changedPixelFraction:changed/(a.width*a.height),maximumChannelDifference:max,meanAbsoluteChannelDifference:sum/a.rgb.length};
if(process.argv[4])writeFileSync(process.argv[4],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
