// Adapted from src/engine/rippleFieldMaterial.ts ambientSurface, commit 4841159.
// Original gradient approximation intentionally retained: warp Jacobian is omitted.
export const CONTOUR=Object.freeze({timeScale:1.5,frequency:1.5,octaves:2,warpOctaves:2,levels:8,widthPx:10.5,edge:.22,warpAmplitude:1.6,warpFrequency:.55,warpSpeed:.23,baseline:-.24,gain:1});
const fract=x=>x-Math.floor(x);
function hash(x,y){const a=x*.3183099+.3678794,b=y*.3678794+.3183099,v=fract(a*b*(a+b));return [-1+2*fract(16*.3183099*v),-1+2*fract(16*.3678794*v)];}
function noise(x,y){
 const ix=Math.floor(x),iy=Math.floor(y),fx=fract(x),fy=fract(y);
 const ux=fx**3*(fx*(fx*6-15)+10),uy=fy**3*(fy*(fy*6-15)+10);
 const dx=30*fx*fx*(fx*(fx-2)+1),dy=30*fy*fy*(fy*(fy-2)+1);
 const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);
 const va=a[0]*fx+a[1]*fy,vb=b[0]*(fx-1)+b[1]*fy,vc=c[0]*fx+c[1]*(fy-1),vd=d[0]*(fx-1)+d[1]*(fy-1);
 const k1=vb-va,k2=vc-va,k3=va-vb-vc+vd;
 return [va+ux*k1+uy*k2+ux*uy*k3,
 a[0]+ux*(b[0]-a[0])+uy*(c[0]-a[0])+ux*uy*(a[0]-b[0]-c[0]+d[0])+dx*(uy*k3+k1),
 a[1]+ux*(b[1]-a[1])+uy*(c[1]-a[1])+ux*uy*(a[1]-b[1]-c[1]+d[1])+dy*(ux*k3+k2)];
}
function fbm(x,y,octaves){
 let value=0,gx=0,gy=0,weight=.5,m00=1,m01=0,m10=0,m11=1;
 for(let i=0;i<octaves;i++){
 const n=noise(x,y);value+=weight*n[0];gx+=weight*(m00*n[1]+m01*n[2]);gy+=weight*(m10*n[1]+m11*n[2]);
 [x,y]=[1.9*(.8*x-.6*y),1.9*(.6*x+.8*y)];
 [m00,m01,m10,m11]=[1.9*(.8*m00+.6*m10),1.9*(.8*m01+.6*m11),1.9*(-.6*m00+.8*m10),1.9*(-.6*m01+.8*m11)];weight*=.55;
 }return [value,gx,gy];
}
export function contourAt(x,y,time,height=900){
 if(![x,y,time,height].every(Number.isFinite)||height<=0)throw new Error('Finite coordinates/time and positive CSS height required');
 const c=CONTOUR,px=x*c.frequency+137,py=y*c.frequency+219,dx=time*.11*c.warpSpeed*c.timeScale,dy=time*.07*c.warpSpeed*c.timeScale;
 const wx=fbm(px*c.warpFrequency+dx,py*c.warpFrequency+dy,c.warpOctaves)[0];
 const wy=fbm(px*c.warpFrequency+5.2-dx*.83,py*c.warpFrequency+1.3-dy*.83,c.warpOctaves)[0];
 const n=fbm(px+c.warpAmplitude*wx,py+c.warpAmplitude*wy,c.octaves);
 const f=fract(n[0]*c.levels),toLine=Math.min(f,1-f),gradient=Math.hypot(n[1],n[2])*c.frequency*c.levels;
 const distPx=toLine/Math.max(gradient*2/height,1e-4);
 const t=Math.max(0,Math.min(1,(distPx-c.widthPx*c.edge)/(c.widthPx*(1-c.edge))));
 return {mask:1-t*t*(3-2*t),distPx,height:n[0],gradient};
}
const f=n=>Number(n).toFixed(10);
const defines={A_TIME:'timeScale',A_NOISE_F:'frequency',A_LEVELS:'levels',A_LINE_W:'widthPx',A_LINE_EDGE:'edge',A_WARP_AMP:'warpAmplitude',A_WARP_F:'warpFrequency',A_WARP_SP:'warpSpeed'};
export const contourGLSL=Object.entries(defines).map(([name,key])=>`#define ${name} ${f(CONTOUR[key])}`).join('\n')+`\n#define A_OCTAVES ${CONTOUR.octaves}\n#define A_WARP_OCTAVES ${CONTOUR.warpOctaves}\n`+String.raw`
/* Per-corner gradient in [-1, 1]^2. From https://iquilezles.org/articles/gradientnoise/ */
vec2 ambHash(vec2 x) {
  vec2 k = vec2(0.3183099, 0.3678794);
  x = x * k + k.yx;
  return -1.0 + 2.0 * fract(16.0 * k * fract(x.x * x.y * (x.x + x.y)));
}

/*
 * Gradient noise: value in .x, analytic gradient in .yz. The derivative is what makes the
 * warped stack affordable in a vertex shader — a finite-difference gradient would cost three
 * full evaluations of the whole octave stack per vertex instead of one.
 */
vec3 ambNoised(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);

  vec2 ga = ambHash(i);
  vec2 gb = ambHash(i + vec2(1.0, 0.0));
  vec2 gc = ambHash(i + vec2(0.0, 1.0));
  vec2 gd = ambHash(i + vec2(1.0, 1.0));

  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));

  float k1 = vb - va;
  float k2 = vc - va;
  float k3 = va - vb - vc + vd;

  return vec3(
    va + u.x * k1 + u.y * k2 + u.x * u.y * k3,
    ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) +
      du * (u.yx * k3 + vec2(k1, k2))
  );
}

/* Value-only noise for the warp field, where the gradient is never needed. */
float ambNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float va = dot(ambHash(i), f);
  float vb = dot(ambHash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float vc = dot(ambHash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float vd = dot(ambHash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

  return va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * (va - vb - vc + vd);
}

/* Value + gradient fBm. Octaves are rotated between steps so features never align to an axis. */
vec3 ambFbmd(vec2 x) {
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  mat2 rotI = mat2(0.8, -0.6, 0.6, 0.8);
  mat2 m = mat2(1.0, 0.0, 0.0, 1.0);
  float a = 0.0;
  float b = 0.5;
  vec2 d = vec2(0.0);
  for (int i = 0; i < A_OCTAVES; i++) {
    vec3 n = ambNoised(x);
    a += b * n.x;
    d += b * m * n.yz;
    b *= 0.55;
    x = 1.9 * rot * x;
    m = 1.9 * rotI * m;
  }
  return vec3(a, d);
}

float ambFbm(vec2 x) {
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  float a = 0.0;
  float b = 0.5;
  for (int i = 0; i < A_WARP_OCTAVES; i++) {
    a += b * ambNoise(x);
    b *= 0.55;
    x = 1.9 * rot * x;
  }
  return a;
}

/*
 * Ambient surface: contour band in .x (0 off a line, 1 on one), height gradient in .yz.
 *
 * Domain-warped gradient noise (https://iquilezles.org/articles/warp/). The generator is the
 * whole point: summed directional sine waves are anisotropic, so their level sets are always
 * long parallel bands, however hard you warp them. Isotropic noise scatters its extrema across
 * the plane, so contours close into the rounded cells a water surface actually shows.
 *
 * What reaches the dots is not the height but its level sets, drawn at even intervals the way a
 * topographic map draws a hill. Mapping height straight to dot size fills every cell edge to edge
 * and reads as cloud; drawing distance-to-contour instead leaves the interiors empty and produces
 * closed, nested, interconnected loops — which is the line character this is after.
 *
 * One warp level, not two. A second level adds structure at frequencies finer than a 6px dot
 * lattice can resolve, so it would spend evaluations producing aliasing rather than shape.
 */
vec3 ambientSurface(vec2 q, float t, float worldPerPx) {
  // Dramatic cursor influence: warp the domain slightly away from the cursor and elevate
  // the height field before computing contour level sets, pushing ~5-6 rings outward.
  vec2 pDelta = q - uPointer;
  float pd2 = dot(pDelta, pDelta);
  float pBump = exp(-pd2 * 1.65) * uPull;
  vec2 qWarped = q - pDelta * (0.32 * pBump);

  // The lattice offset is load-bearing, not decoration. ambHash folds on x*y*(x+y), which
  // collapses toward zero around the origin — and the origin is screen centre. Sampled in place
  // the field goes slack across the middle of the viewport and only develops texture at the
  // corners. Pushing the domain well away from zero keeps the gradients well distributed.
  vec2 p = qWarped * A_NOISE_F + vec2(137.0, 219.0);
  vec2 drift = vec2(t * 0.11, t * 0.07) * A_WARP_SP * A_TIME;

  // The two warp components travel in opposite directions, so cells reshape in place rather
  // than sliding across the screen as one rigid pattern.
  vec2 w = vec2(
    ambFbm(p * A_WARP_F + drift),
    ambFbm(p * A_WARP_F + vec2(5.2, 1.3) - drift * 0.83)
  );

  vec3 n = ambFbmd(p + A_WARP_AMP * w);

  float bumpH = pBump * 0.72;
  vec2 bumpG = pDelta * (-3.3 * bumpH);
  n.x += bumpH;
  n.yz += bumpG / A_NOISE_F;

  // Position within a contour band, folded about its midpoint to give distance to the nearest
  // band edge. Unclamped on purpose: clamping height would flatten the outermost rings into a
  // plateau, and a plateau has no gradient, so those lines would simply stop being drawn.
  float u = n.x * A_LEVELS;
  float f = fract(u);
  float toLine = min(f, 1.0 - f);

  // Dividing by the gradient turns that into a real screen distance, and is what holds the line
  // to an even weight. Without it bands balloon wherever the field flattens, so the drawing pools
  // into thick blots exactly where it should be at its thinnest. Near an extremum the gradient
  // vanishes and the nearest contour genuinely is far away, so the line fades out instead of
  // flooding the cell interior — the same reason a contour map leaves summits blank.
  vec2 gradU = n.yz * (A_NOISE_F * A_LEVELS);
  float distPx = toLine / max(length(gradU) * worldPerPx, 1e-4);

  // Full strength across the core, then a short falloff, rather than a smoothstep from zero.
  float line = 1.0 - smoothstep(A_LINE_W * A_LINE_EDGE, A_LINE_W, distPx);

  // Horizontal stroke-edge slope for ClearType-style subpixel antialiasing:
  // positive on the left rising edge of a contour band, negative on the right falling edge, 0 at core/outside.
  float foldSign = f < 0.5 ? 1.0 : -1.0;
  float gradLen = max(length(gradU), 1e-4);
  float edgeBand = smoothstep(0.01, 0.24, line) * (1.0 - smoothstep(0.58, 0.90, line));
  float edgeSlopeX = clamp(-gradU.x * foldSign / gradLen, -1.0, 1.0) * edgeBand;

  return vec3(line, edgeSlopeX, n.z * A_NOISE_F);
}

`;
