import { Color, ShaderMaterial } from 'three';

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
  SWELL_WIDTH_TIGHTEN_FLOOR,
  SWELL_WIDTH_TIGHTEN_RATE,
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
`;

const vertexShader =
  phase2Defines +
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

#define MAX_SOURCES ${maxSources}
uniform float uStartTime[MAX_SOURCES];
uniform float uCenterX[MAX_SOURCES];
uniform float uCenterY[MAX_SOURCES];
uniform float uStrength[MAX_SOURCES];
uniform float uWidth[MAX_SOURCES];
uniform float uDecay[MAX_SOURCES];

varying float vField;

void main() {
  #include <color_vertex>
  #include <morphinstance_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>

  vec2 accDisp = vec2(0.0);
  float fieldSum = 0.0;

  for (int i = 0; i < MAX_SOURCES; i++) {
    float t0 = uStartTime[i];
    if (t0 < 0.0) continue;

    float t = uTime - t0;
    if (t < 0.0) continue;

    vec2 c = vec2(uCenterX[i], uCenterY[i]);
    vec2 d = transformed.xy - c;
    float dist = length(d);
    float waveR = t * uPropagationSpeed;
    float delta = dist - waveR;

    float str = clamp(uStrength[i], 0.08, 1.5);
    float w0 = max(uWidth[i], 1e-4);
    float wEff = w0 * (1.0 + RF_STR_W * str);
    float ageTight =
      RF_W_TIGHT_FLOOR + (1.0 - RF_W_TIGHT_FLOOR) / (1.0 + RF_W_TIGHT_RATE * t);
    wEff *= ageTight;

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
    accDisp += dir * bump;
  }

  float dm = length(accDisp);
  if (dm > 1e-5) {
    accDisp *= tanh(dm * RF_DISP_CAP) / (dm * RF_DISP_CAP);
  }
  accDisp *= uDisplacementScale;

  transformed.xy += accDisp;

  float sizeBoost = tanh(fieldSum * RF_SZ_CAP) / RF_SZ_CAP;
  vField = sizeBoost;

  #include <morphtarget_vertex>
  #include <project_vertex>

  gl_PointSize = uBasePointSize + sizeBoost * uSizeLiftScale + aSeed * 0.0;

  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <fog_vertex>
}
`;

const fragmentShader = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform vec3 diffuse;
uniform float opacity;

varying float vField;

void main() {
  vec4 diffuseColor = vec4(diffuse, opacity);
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>

  vec2 q = gl_PointCoord - vec2(0.5);
  float r = length(q);
  if (r > 0.5) discard;

  float edge = 1.0 - smoothstep(0.22, 0.48, r);
  diffuseColor.a *= edge;

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
  const diffuse = new Color(0x6a6a78);

  return new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPropagationSpeed: { value: DEFAULT_PROPAGATION_SPEED },
      uDisplacementScale: { value: DEFAULT_DISPLACEMENT_SCALE },
      uSizeLiftScale: { value: DEFAULT_SIZE_LIFT_SCALE },
      uBasePointSize: { value: DEFAULT_BASE_POINT_SIZE },
      uStartTime: { value: floatArrayUniform() },
      uCenterX: { value: floatArrayUniform() },
      uCenterY: { value: floatArrayUniform() },
      uStrength: { value: floatArrayUniform() },
      uWidth: { value: floatArrayUniform() },
      uDecay: { value: floatArrayUniform() },
      diffuse: { value: diffuse },
      opacity: { value: DEFAULT_POINT_OPACITY },
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
