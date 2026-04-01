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
  POINT_BRIGHTNESS_FROM_FIELD,
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

const phase3FragDefines = /* glsl */ `
#define P_BRIGHT ${POINT_BRIGHTNESS_FROM_FIELD}
#define P_EDGE_IN ${POINT_EDGE_INNER}
#define P_EDGE_OUT ${POINT_EDGE_OUTER}
#define P_ANISO ${POINT_SHAPE_ANISOTROPY}
`;

const vertexShader =
  phase2Defines +
  phase4Defines +
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

varying float vField;
varying float vSeed;
varying float vDepthAtten;

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

  float hx =
    smoothstep(uSafeBounds.x - uSafeBlend, uSafeBounds.x, p.x) *
    (1.0 - smoothstep(uSafeBounds.z, uSafeBounds.z + uSafeBlend, p.x));
  float hy =
    smoothstep(uSafeBounds.y - uSafeBlend, uSafeBounds.y, p.y) *
    (1.0 - smoothstep(uSafeBounds.w, uSafeBounds.w + uSafeBlend, p.y));
  float inside = hx * hy;
  float safeMul =
    uSafeEnabled > 0.5 ? mix(uSafeInteriorMul, 1.0, 1.0 - inside) : 1.0;
  fieldSum *= safeMul;
  accDisp *= safeMul;

  float dm = length(accDisp);
  if (dm > 1e-5) {
    accDisp *= tanh(dm * RF_DISP_CAP) / (dm * RF_DISP_CAP);
  }
  accDisp *= uDisplacementScale * uGlobalFieldScale;

  transformed.xy += accDisp;

  float sizeBoost = tanh(fieldSum * uGlobalFieldScale * RF_SZ_CAP) / RF_SZ_CAP;
  vField = sizeBoost;

  #include <morphtarget_vertex>
  #include <project_vertex>

  gl_PointSize =
    uBasePointSize + sizeBoost * uSizeLiftScale + (aSeed - 0.5) * RF_REST_SZ;

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

  float lift = 1.0 + P_BRIGHT * vField;
  vec3 tone = diffuse * lift;
  if (uPolishMaster > 0.001 && uPolishLayers.x > 0.5) {
    tone *= 1.0 + uPolishTonalK * vField * vField;
  }
  if (uPolishMaster > 0.001 && uPolishLayers.w > 0.5) {
    tone *= vDepthAtten;
  }

  vec4 diffuseColor = vec4(tone, opacity * uOpacityScale);
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
