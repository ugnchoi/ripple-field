import { Color, ShaderMaterial, Vector2, Vector4 } from 'three';

import {
  DECAY_SOFT_TAIL_BASE,
  DEFAULT_BASE_POINT_SIZE,
  DEFAULT_DECAY,
  DEFAULT_DISPLACEMENT_SCALE,
  DEFAULT_POINT_OPACITY,
  DEFAULT_PROPAGATION_SPEED,
  DEFAULT_SIZE_LIFT_SCALE,
  DEFAULT_SWELL_WIDTH,
  DISP_SOFT_CAP_K,
  FIELD_SIZE_SOFT_CAP_K,
  MAX_SWELL_SOURCES,
  STRENGTH_DECAY_PERSISTENCE,
  STRENGTH_TO_WIDTH_SCALE,
  SWELL_SHOULDER,
  SWELL_SHOULDER_Z,
  SWELL_WIDE_MIX,
  SWELL_WIDE_WIDTH_SCALE,
  POINT_DARKEN_FROM_FIELD,
  POINT_OPACITY_LIFT_FROM_FIELD,
  POINT_EDGE_INNER,
  POINT_EDGE_OUTER,
  POINT_SHAPE_ANISOTROPY,
  REST_POINT_SIZE_JITTER,
  SWELL_WIDTH_TIGHTEN_FLOOR,
  SWELL_WIDTH_TIGHTEN_RATE,
  DISPLACEMENT_DIR_BIAS_RAD,
  FIELD_DELTA_BIAS_STRENGTH,
  FIELD_VARIATION_SEED,
  FIELD_WARP_AMPLITUDE,
  FIELD_WARP_FREQUENCY,
  SWELL_BREADTH_STRENGTH_K,
  SWELL_WIDTH_MOD_RANGE,
  AMBIENT_CONTOUR_LEVELS,
  AMBIENT_DARKEN_FROM_FIELD,
  AMBIENT_DISPLACEMENT_SCALE,
  AMBIENT_LINE_EDGE,
  AMBIENT_LINE_WIDTH_PX,
  AMBIENT_NOISE_FREQUENCY,
  AMBIENT_NOISE_OCTAVES,
  AMBIENT_OPACITY_LIFT,
  AMBIENT_SIZE_AMPLITUDE,
  AMBIENT_SWELL_COUPLING,
  AMBIENT_TIME_SCALE,
  AMBIENT_WARP_AMPLITUDE,
  AMBIENT_WARP_FREQUENCY,
  AMBIENT_WARP_OCTAVES,
  AMBIENT_WARP_SPEED,
  FOREGROUND_GLOBAL_FIELD_SCALE,
  FOREGROUND_SAFE_ZONE_BLEND_WORLD,
  FOREGROUND_SAFE_ZONE_INTERIOR_MUL,
  POLISH_DEPTH_ATTEN_FLOOR,
  POLISH_DEPTH_CUE_K,
  POLISH_EDGE_OUTER_DELTA,
  POLISH_TONAL_LIFT_K,
  POLISH_VIGNETTE_FLOOR,
  POLISH_VIGNETTE_K,
} from './constants';

const maxSources = MAX_SWELL_SOURCES;

/** Injected as `#define` so Phase 2 tuning lives in `constants.ts` only. */
const phase2Defines = /* glsl */ `
#define RF_WIDE_MIX ${SWELL_WIDE_MIX}
#define RF_SHOULDER ${SWELL_SHOULDER}
#define RF_WIDE_W ${SWELL_WIDE_WIDTH_SCALE}
#define RF_SHOULDER_Z ${SWELL_SHOULDER_Z}
#define RF_STR_W ${STRENGTH_TO_WIDTH_SCALE}
#define RF_STR_DEC ${STRENGTH_DECAY_PERSISTENCE}
#define RF_DEC_TAIL ${DECAY_SOFT_TAIL_BASE}
#define RF_DISP_CAP ${DISP_SOFT_CAP_K}
#define RF_SZ_CAP ${FIELD_SIZE_SOFT_CAP_K}
#define RF_W_TIGHT_RATE ${SWELL_WIDTH_TIGHTEN_RATE}
#define RF_W_TIGHT_FLOOR ${SWELL_WIDTH_TIGHTEN_FLOOR}
#define RF_REST_SZ ${REST_POINT_SIZE_JITTER}
`;

const phase4Defines = /* glsl */ `
#define RF_VAR_SEED ${FIELD_VARIATION_SEED}
#define RF_WARP_AMP ${FIELD_WARP_AMPLITUDE}
#define RF_WARP_F ${FIELD_WARP_FREQUENCY}
#define RF_W_MOD ${SWELL_WIDTH_MOD_RANGE}
#define RF_BREADTH_STR ${SWELL_BREADTH_STRENGTH_K}
#define RF_DELTA_BIAS ${FIELD_DELTA_BIAS_STRENGTH}
#define RF_DIR_BIAS ${DISPLACEMENT_DIR_BIAS_RAD}
`;

/**
 * Ambient surface tuning. `toFixed` guarantees GLSL float literals for whole-number values;
 * the octave counts are deliberately left bare, since they are loop bounds and must stay ints.
 */
const phase8Defines = /* glsl */ `
#define A_TIME ${AMBIENT_TIME_SCALE.toFixed(4)}
#define A_DISP ${AMBIENT_DISPLACEMENT_SCALE.toFixed(5)}
#define A_SIZE ${AMBIENT_SIZE_AMPLITUDE.toFixed(4)}
#define A_NOISE_F ${AMBIENT_NOISE_FREQUENCY.toFixed(4)}
#define A_LEVELS ${AMBIENT_CONTOUR_LEVELS.toFixed(4)}
#define A_LINE_W ${AMBIENT_LINE_WIDTH_PX.toFixed(4)}
#define A_LINE_EDGE ${AMBIENT_LINE_EDGE.toFixed(4)}
#define A_OCTAVES ${AMBIENT_NOISE_OCTAVES}
#define A_WARP_OCTAVES ${AMBIENT_WARP_OCTAVES}
#define A_WARP_AMP ${AMBIENT_WARP_AMPLITUDE.toFixed(4)}
#define A_WARP_F ${AMBIENT_WARP_FREQUENCY.toFixed(4)}
#define A_WARP_SP ${AMBIENT_WARP_SPEED.toFixed(4)}
#define A_SWELL_COUPLE ${AMBIENT_SWELL_COUPLING.toFixed(5)}
`;

const phase3FragDefines = /* glsl */ `
#define A_DARKEN ${AMBIENT_DARKEN_FROM_FIELD.toFixed(4)}
#define A_OPACITY_LIFT ${AMBIENT_OPACITY_LIFT.toFixed(4)}
#define P_DARKEN ${POINT_DARKEN_FROM_FIELD.toFixed(4)}
#define P_OPACITY_LIFT ${POINT_OPACITY_LIFT_FROM_FIELD.toFixed(4)}
#define P_EDGE_IN ${POINT_EDGE_INNER}
#define P_EDGE_OUT ${POINT_EDGE_OUTER}
#define P_ANISO ${POINT_SHAPE_ANISOTROPY}
`;

const vertexShader =
  phase2Defines +
  phase4Defines +
  phase8Defines +
  /* glsl */ `
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

attribute float aSeed;

uniform float uTime;
uniform float uPropagationSpeed;
uniform float uDisplacementScale;
uniform float uSizeLiftScale;
uniform float uBasePointSize;
uniform float uPixelRatio;
uniform vec2 uResolution;
uniform float uGlobalFieldScale;
uniform float uSafeEnabled;
uniform vec4 uSafeBounds;
uniform float uSafeBlend;
uniform float uSafeInteriorMul;

#define MAX_SOURCES ${maxSources}
uniform float uStartTime[MAX_SOURCES];
uniform float uCenterX[MAX_SOURCES];
uniform float uCenterY[MAX_SOURCES];
uniform float uStrength[MAX_SOURCES];
uniform float uWidth[MAX_SOURCES];
uniform float uDecay[MAX_SOURCES];

uniform float uViewAspect;
uniform float uPolishMaster;
uniform vec4 uPolishLayers;
uniform float uPolishDepthK;
uniform float uAmbientScale;

varying float vField;
varying float vAmbient;
varying float vSeed;
varying float vDepthAtten;

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
  // The lattice offset is load-bearing, not decoration. ambHash folds on x*y*(x+y), which
  // collapses toward zero around the origin — and the origin is screen centre. Sampled in place
  // the field goes slack across the middle of the viewport and only develops texture at the
  // corners. Pushing the domain well away from zero keeps the gradients well distributed.
  vec2 p = q * A_NOISE_F + vec2(137.0, 219.0);
  vec2 drift = vec2(t * 0.11, t * 0.07) * A_WARP_SP * A_TIME;

  // The two warp components travel in opposite directions, so cells reshape in place rather
  // than sliding across the screen as one rigid pattern.
  vec2 w = vec2(
    ambFbm(p * A_WARP_F + drift),
    ambFbm(p * A_WARP_F + vec2(5.2, 1.3) - drift * 0.83)
  );

  vec3 n = ambFbmd(p + A_WARP_AMP * w);

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

  // The returned gradient is of the smooth height, not of the contour field. The contour value is
  // discontinuous at every band edge, so steering dot drift with it would tear the lattice along
  // each line. The warp's Jacobian is left out; it only steers a sub-pixel drift, and the exact
  // chain rule would cost two more fbm evaluations to correct a direction nobody can see.
  return vec3(line, n.yz * A_NOISE_F);
}

void main() {
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>

  vSeed = aSeed;

  vec2 p = transformed.xy;
  vec2 wq = p * RF_WARP_F + vec2(aSeed * 2.718281828, aSeed * 1.414213562);
  vec2 warp = vec2(
    sin(wq.x + wq.y * 0.62 + RF_VAR_SEED),
    cos(wq.y - wq.x * 0.53 + RF_VAR_SEED * 0.73)
  ) * RF_WARP_AMP;
  vec2 pw = p + warp;

  float hx =
    smoothstep(uSafeBounds.x - uSafeBlend, uSafeBounds.x, p.x) *
    (1.0 - smoothstep(uSafeBounds.z, uSafeBounds.z + uSafeBlend, p.x));
  float hy =
    smoothstep(uSafeBounds.y - uSafeBlend, uSafeBounds.y, p.y) *
    (1.0 - smoothstep(uSafeBounds.w, uSafeBounds.w + uSafeBlend, p.y));
  float inside = hx * hy;
  float safeMul =
    uSafeEnabled > 0.5 ? mix(uSafeInteriorMul, 1.0, 1.0 - inside) : 1.0;

  // Branch is on a uniform, so it stays coherent across vertices; skipping it entirely
  // matters because reduced motion is often paired with the weakest hardware.
  float ambH = 0.0;
  vec2 ambGrad = vec2(0.0);
  if (uAmbientScale > 0.001) {
    float ambMul = uAmbientScale * safeMul * uGlobalFieldScale;
    // The frustum spans 2 world units vertically. uResolution is in framebuffer pixels, so the
    // ratio divides back out to leave the CSS pixels the line width is denominated in.
    float worldPerPx = 2.0 * uPixelRatio / max(uResolution.y, 1.0);
    vec3 amb = ambientSurface(pw, uTime, worldPerPx);
    ambH = amb.x * ambMul;
    ambGrad = amb.yz * ambMul;
    pw += ambGrad * A_SWELL_COUPLE;
  }

  vec2 accDisp = vec2(0.0);
  float fieldSum = 0.0;

  for (int i = 0; i < MAX_SOURCES; i++) {
    float t0 = uStartTime[i];
    if (t0 < 0.0) continue;

    float t = uTime - t0;
    if (t < 0.0) continue;

    vec2 c = vec2(uCenterX[i], uCenterY[i]);
    vec2 d = pw - c;
    float dist = length(d);
    float waveR = t * uPropagationSpeed;

    float ang = atan(d.y, d.x);
    float drift = sin(
      ang * 2.0 + dot(c, vec2(4.12, 8.31)) + t0 * 0.47 + aSeed * 4.18 + RF_VAR_SEED
    );

    float str = clamp(uStrength[i], 0.08, 1.5);
    float w0 = max(uWidth[i], 1e-4);
    float wEff = w0 * (1.0 + RF_STR_W * str);
    float ageTight =
      RF_W_TIGHT_FLOOR + (1.0 - RF_W_TIGHT_FLOOR) / (1.0 + RF_W_TIGHT_RATE * t);
    wEff *= ageTight;

    float wh = fract(
      sin(dot(c, vec2(127.1, 311.7)) + t0 * 19.27 + RF_VAR_SEED * 1.31) * 43758.5453123
    );
    float wHash = wh * 2.0 - 1.0;
    wEff *= 1.0 + RF_W_MOD * wHash + RF_BREADTH_STR * (str - 0.55);
    wEff = max(wEff, 1e-4);

    float delta = dist - waveR + drift * RF_DELTA_BIAS * wEff;

    float zn = delta / wEff;
    float gn = exp(-0.5 * zn * zn);

    float wWide = wEff * RF_WIDE_W;
    float zw = delta / max(wWide, 1e-4);
    float gw = exp(-0.5 * zw * zw);

    float spatial = mix(gw, gn, RF_WIDE_MIX);

    float shoulder = 1.0 / (1.0 + RF_SHOULDER_Z * zn * zn);
    spatial *= mix(1.0, shoulder, RF_SHOULDER);

    float softTail = RF_DEC_TAIL / (1.0 + RF_STR_DEC * str);
    float temporal = exp(-uDecay[i] * t * t / (t + softTail));

    float bump = str * spatial * temporal;
    fieldSum += bump;

    vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);
    float dirBend =
      sin(dot(c, vec2(6.02, 1.77)) + aSeed * 5.55 + t0 * 0.31 + RF_VAR_SEED * 0.51) *
      RF_DIR_BIAS;
    float cb = cos(dirBend);
    float sb = sin(dirBend);
    dir = vec2(dir.x * cb - dir.y * sb, dir.x * sb + dir.y * cb);
    accDisp += dir * bump;
  }

  fieldSum *= safeMul;
  accDisp *= safeMul;

  float dm = length(accDisp);
  if (dm > 1e-5) {
    accDisp *= tanh(dm * RF_DISP_CAP) / (dm * RF_DISP_CAP);
  }
  accDisp *= uDisplacementScale * uGlobalFieldScale;

  // Added after the swell soft cap so ambient drift is not squashed by strong impacts.
  accDisp += ambGrad * A_DISP;

  transformed.xy += accDisp;

  float sizeBoost = tanh(fieldSum * uGlobalFieldScale * RF_SZ_CAP) / RF_SZ_CAP;
  vField = sizeBoost;
  vAmbient = ambH;

  #include <morphtarget_vertex>
  #include <project_vertex>

  // Every term above is in CSS pixels; the ratio converts to the framebuffer pixels
  // gl_PointSize actually expects.
  gl_PointSize = max(
    (uBasePointSize +
      sizeBoost * uSizeLiftScale +
      ambH * A_SIZE +
      (aSeed - 0.5) * RF_REST_SZ) * uPixelRatio,
    0.5
  );

  vDepthAtten = 1.0;
  if (uPolishMaster > 0.001 && uPolishLayers.w > 0.5) {
    float dn = length(vec2(p.x / max(uViewAspect, 0.05), p.y));
    vDepthAtten = clamp(
      1.0 - uPolishDepthK * smoothstep(0.22, 1.02, dn),
      ${POLISH_DEPTH_ATTEN_FLOOR},
      1.0
    );
  }

  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <fog_vertex>
}
`;

const fragmentShader =
  phase3FragDefines +
  /* glsl */ `
#include <common>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform vec3 diffuse;
uniform float opacity;
uniform float uOpacityScale;

uniform vec2 uResolution;
uniform float uViewAspect;
uniform float uPolishMaster;
uniform vec4 uPolishLayers;
uniform float uPolishTonalK;
uniform float uPolishVignetteK;
uniform float uPolishVignetteFloor;
uniform float uPolishEdgeSoft;

varying float vField;
varying float vAmbient;
varying float vSeed;
varying float vDepthAtten;

void main() {
  float ax = 1.0 + (vSeed - 0.5) * 2.0 * P_ANISO;
  float ay = 1.0 - (vSeed - 0.37) * 1.35 * P_ANISO;
  vec2 qc = gl_PointCoord - vec2(0.5);
  qc /= vec2(max(ax, 0.75), max(ay, 0.75));
  float r = length(qc);
  if (r > 0.5) discard;

  float edgeOuter = P_EDGE_OUT;
  if (uPolishMaster > 0.001 && uPolishLayers.z > 0.5) {
    edgeOuter += uPolishEdgeSoft;
  }
  float edge = 1.0 - smoothstep(P_EDGE_IN, edgeOuter, r);

  float darken = 1.0 - P_DARKEN * vField - A_DARKEN * vAmbient;
  vec3 tone = diffuse * max(darken, 0.0);
  if (uPolishMaster > 0.001 && uPolishLayers.x > 0.5) {
    tone *= 1.0 + uPolishTonalK * vField * vField;
  }
  if (uPolishMaster > 0.001 && uPolishLayers.w > 0.5) {
    tone *= vDepthAtten;
  }

  float opacityLift =
    max(1.0 + P_OPACITY_LIFT * vField + A_OPACITY_LIFT * vAmbient, 0.0);
  vec4 diffuseColor = vec4(tone, min(opacity * uOpacityScale * opacityLift, 1.0));
  diffuseColor.a *= edge;

  if (uPolishMaster > 0.001 && uPolishLayers.y > 0.5) {
    vec2 fragUv = gl_FragCoord.xy / max(uResolution, vec2(1.0));
    vec2 c = (fragUv - 0.5) * vec2(uViewAspect, 1.0);
    float vig = 1.0 - uPolishVignetteK * dot(c, c);
    diffuseColor.rgb *= max(vig, uPolishVignetteFloor);
  }

  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>

  vec3 outgoingLight = diffuseColor.rgb;

  #include <opaque_fragment>
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
}
`;

const floatArrayUniform = () => new Float32Array(maxSources);

export type RippleFieldUniforms = ReturnType<
  typeof createRippleFieldMaterial
>['uniforms'];

export const createRippleFieldMaterial = (): ShaderMaterial => {
  const diffuse = new Color(0x68687a);

  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPropagationSpeed: { value: DEFAULT_PROPAGATION_SPEED },
      uDisplacementScale: { value: DEFAULT_DISPLACEMENT_SCALE },
      uSizeLiftScale: { value: DEFAULT_SIZE_LIFT_SCALE },
      uBasePointSize: { value: DEFAULT_BASE_POINT_SIZE },
      uPixelRatio: { value: 1 },
      uGlobalFieldScale: { value: FOREGROUND_GLOBAL_FIELD_SCALE },
      uSafeEnabled: { value: 0 },
      uSafeBounds: { value: new Vector4(0, 0, 0, 0) },
      uSafeBlend: { value: FOREGROUND_SAFE_ZONE_BLEND_WORLD },
      uSafeInteriorMul: { value: FOREGROUND_SAFE_ZONE_INTERIOR_MUL },
      uStartTime: { value: floatArrayUniform() },
      uCenterX: { value: floatArrayUniform() },
      uCenterY: { value: floatArrayUniform() },
      uStrength: { value: floatArrayUniform() },
      uWidth: { value: floatArrayUniform() },
      uDecay: { value: floatArrayUniform() },
      diffuse: { value: diffuse },
      opacity: { value: DEFAULT_POINT_OPACITY },
      uOpacityScale: { value: 1 },
      uResolution: { value: new Vector2(1, 1) },
      uViewAspect: { value: 1 },
      uPolishMaster: { value: 0 },
      uPolishLayers: { value: new Vector4(1, 1, 1, 1) },
      uPolishTonalK: { value: POLISH_TONAL_LIFT_K },
      uPolishVignetteK: { value: POLISH_VIGNETTE_K },
      uPolishVignetteFloor: { value: POLISH_VIGNETTE_FLOOR },
      uPolishEdgeSoft: { value: POLISH_EDGE_OUTER_DELTA },
      uPolishDepthK: { value: POLISH_DEPTH_CUE_K },
      uAmbientScale: { value: 1 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
};

/** Push default width/decay into uniform arrays so recycled slots read valid values before first CPU copy. */
export const primeShapeUniforms = (
  uniforms: RippleFieldUniforms,
  width = DEFAULT_SWELL_WIDTH,
  decay = DEFAULT_DECAY,
): void => {
  uniforms.uWidth.value.fill(width);
  uniforms.uDecay.value.fill(decay);
};
