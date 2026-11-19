import { useEffect, useRef, useState } from 'react';

export interface ApproachLatticeStageProps {
  /** Continuous scroll progress from 0.0 to 2.0 across the three chapters. */
  progress: number;
  /** Optional fixed progress for static/mobile inline diagrams. */
  staticProgress?: number;
  /** Layout variant: full-height desktop stage or compact mobile inline canvas. */
  variant?: 'stage' | 'inline';
  /** Accessible label describing the visual stage. */
  ariaLabel?: string;
}

interface CalloutItem {
  label: string;
  /** Normalized coordinates in [-1, 1] relative to the shorter canvas half-extent. */
  nx: number;
  ny: number;
  strong?: boolean;
}

const CHAPTER_CALLOUTS: readonly (readonly CalloutItem[])[] = [
  [
    { label: 'Define', nx: -0.62, ny: 0.16, strong: true },
    { label: 'Map', nx: 0.0, ny: -0.44 },
    { label: 'Validate', nx: 0.62, ny: 0.16, strong: true },
  ],
  [
    { label: 'Design', nx: 0.0, ny: -0.48 },
    { label: 'Engineering', nx: -0.48, ny: 0.36 },
    { label: 'Stakeholders', nx: 0.48, ny: 0.36 },
    { label: 'Aligned', nx: 0.0, ny: 0.04, strong: true },
  ],
  [
    { label: 'Sketch', nx: -0.56, ny: 0.30 },
    { label: 'Prototype', nx: 0.0, ny: -0.46 },
    { label: 'Shipped', nx: 0.56, ny: 0.30, strong: true },
  ],
];

const CHAPTER_TITLES = [
  'UX Expert',
  'Communicator and Leader',
  'Just Make It',
] as const;

// Matches src/grid/field.mjs PARAMS.pitch = 6 & src/grid/shaders.mjs palette.
const PITCH = 6;
const PAPER_RGB = [247, 247, 251] as const; // #f7f7fb
const INK_RGB = [22, 24, 31] as const; // #16181f
const SLATE_RGB = [54, 79, 110] as const; // #364f6e

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

function sdCapsule(px: number, py: number, ax: number, ay: number, bx: number, by: number, r: number): number {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const denom = bax * bax + bay * bay || 1e-6;
  const h = clamp01((pax * bax + pay * bay) / denom);
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
}

function sdCircle(px: number, py: number, cx: number, cy: number, r: number): number {
  return Math.hypot(px - cx, py - cy) - r;
}

function sdTriangle(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  const e0x = bx - ax, e0y = by - ay;
  const e1x = cx - bx, e1y = cy - by;
  const e2x = ax - cx, e2y = ay - cy;
  const v0x = px - ax, v0y = py - ay;
  const v1x = px - bx, v1y = py - by;
  const v2x = px - cx, v2y = py - cy;

  const t0 = clamp01((v0x * e0x + v0y * e0y) / (e0x * e0x + e0y * e0y || 1e-6));
  const t1 = clamp01((v1x * e1x + v1y * e1y) / (e1x * e1x + e1y * e1y || 1e-6));
  const t2 = clamp01((v2x * e2x + v2y * e2y) / (e2x * e2x + e2y * e2y || 1e-6));

  const pq0x = v0x - e0x * t0, pq0y = v0y - e0y * t0;
  const pq1x = v1x - e1x * t1, pq1y = v1y - e1y * t1;
  const pq2x = v2x - e2x * t2, pq2y = v2y - e2y * t2;

  const s = Math.sign(e0x * e2y - e0y * e2x) || 1;
  const d0 = pq0x * pq0x + pq0y * pq0y;
  const d1 = pq1x * pq1x + pq1y * pq1y;
  const d2 = pq2x * pq2x + pq2y * pq2y;

  const c0 = s * (v0x * e0y - v0y * e0x);
  const c1 = s * (v1x * e1y - v1y * e1x);
  const c2 = s * (v2x * e2y - v2y * e2x);

  const minD = Math.min(d0, d1, d2);
  const minC = Math.min(c0, c1, c2);
  return -Math.sqrt(minD) * Math.sign(minC);
}

/** 0: Paper plane (iconic 3/4 perspective dart with separated wings & lower keel) */
function sdfPaperPlane(nx: number, ny: number): number {
  const x = nx;
  const y = ny;
  // Upper-left wing
  const upperWing = sdTriangle(x, y, 0.52, -0.26, -0.50, -0.02, -0.12, 0.12);
  // Lower-right wing
  const lowerWing = sdTriangle(x, y, 0.52, -0.26, -0.02, 0.18, 0.22, 0.44);
  // Lower folded keel fin
  const keel = sdTriangle(x, y, -0.04, 0.16, -0.18, 0.36, 0.06, 0.24);
  // Carve a crisp fold gap between the two wings so the 3D fold reads clearly
  const foldGap = sdCapsule(x, y, 0.42, -0.20, -0.12, 0.15, 0.028);
  const wings = Math.max(Math.min(upperWing, lowerWing), -foldGap);
  return Math.min(wings, keel);
}

/** 1: Alpaca silhouette in profile (tall neck, perked ears, fluffy fleece torso, 4 legs, short tail) */
function sdfAlpaca(nx: number, ny: number): number {
  const x = nx;
  const y = ny + 0.04;
  // Head & short muzzle facing left
  const head = sdCircle(x, y, -0.20, -0.34, 0.082);
  const muzzle = sdCapsule(x, y, -0.20, -0.34, -0.34, -0.32, 0.052);
  // Two perked-up alpaca ears
  const ear1 = sdCapsule(x, y, -0.19, -0.40, -0.22, -0.55, 0.030);
  const ear2 = sdCapsule(x, y, -0.13, -0.39, -0.10, -0.53, 0.028);
  // Long upright neck
  const neck = sdCapsule(x, y, -0.18, -0.30, -0.14, 0.04, 0.082);
  // Fluffy fleece torso
  const torso = sdCapsule(x, y, -0.14, 0.06, 0.24, 0.08, 0.135);
  const fleece = sdCircle(x, y, 0.05, 0.01, 0.135);
  // Four slender legs
  const legFL = sdCapsule(x, y, -0.16, 0.12, -0.18, 0.44, 0.042);
  const legFR = sdCapsule(x, y, -0.07, 0.12, -0.06, 0.42, 0.040);
  const legBL = sdCapsule(x, y, 0.17, 0.12, 0.16, 0.42, 0.040);
  const legBR = sdCapsule(x, y, 0.26, 0.12, 0.28, 0.44, 0.042);
  // Short fluffy tail
  const tail = sdCapsule(x, y, 0.28, 0.04, 0.39, -0.02, 0.052);

  let d = smin(head, muzzle, 0.03);
  d = smin(d, ear1, 0.02);
  d = smin(d, ear2, 0.02);
  d = smin(d, neck, 0.04);
  d = smin(d, torso, 0.05);
  d = smin(d, fleece, 0.05);
  d = smin(d, legFL, 0.025);
  d = smin(d, legFR, 0.025);
  d = smin(d, legBL, 0.025);
  d = smin(d, legBR, 0.025);
  d = smin(d, tail, 0.03);
  return d;
}

/** 2: Flying dove silhouette (graceful profile with distinct swept wings & fanned tail) */
function sdfDove(nx: number, ny: number): number {
  const x = nx;
  const y = ny + 0.05;
  // Curved breast & slender body tapering toward tail
  const breast = sdCapsule(x, y, -0.22, -0.04, -0.04, 0.12, 0.095);
  const body = sdCapsule(x, y, -0.04, 0.12, 0.24, 0.18, 0.08);
  // Neck, head & pointed beak facing left
  const neck = sdCapsule(x, y, -0.22, -0.04, -0.28, -0.18, 0.062);
  const head = sdCircle(x, y, -0.29, -0.20, 0.072);
  const beak = sdTriangle(x, y, -0.35, -0.23, -0.48, -0.19, -0.35, -0.16);
  // Two distinct swept-up wings with a clear V-notch between them
  const wingFront = sdTriangle(x, y, -0.10, 0.04, 0.04, -0.54, 0.12, -0.04);
  const wingTipFront = sdCapsule(x, y, 0.02, -0.44, 0.06, -0.54, 0.03);
  const wingBack = sdTriangle(x, y, 0.04, 0.04, 0.38, -0.42, 0.22, 0.08);
  const wingTipBack = sdCapsule(x, y, 0.30, -0.32, 0.40, -0.42, 0.03);
  // Fanned tail feathers
  const tail = sdTriangle(x, y, 0.20, 0.16, 0.54, 0.12, 0.46, 0.38);

  let d = smin(breast, body, 0.05);
  d = smin(d, neck, 0.04);
  d = smin(d, head, 0.03);
  d = Math.min(d, beak);
  d = smin(d, Math.min(wingFront, wingTipFront), 0.035);
  d = smin(d, Math.min(wingBack, wingTipBack), 0.035);
  d = smin(d, tail, 0.035);
  return d;
}

/** 3: Classic heart silhouette (Inigo Quilez exact 2D heart SDF) */
function sdfHeart(nx: number, ny: number): number {
  const px = Math.abs(nx) * 1.15;
  const py = (-ny + 0.44) * 1.15;
  if (py + px > 1.0) {
    const dx = px - 0.25;
    const dy = py - 0.75;
    return (Math.hypot(dx, dy) - Math.SQRT2 / 4.0) / 1.15;
  }
  const d1x = px;
  const d1y = py - 1.0;
  const m = 0.5 * Math.max(px + py, 0.0);
  const d2x = px - m;
  const d2y = py - m;
  const distSq = Math.min(d1x * d1x + d1y * d1y, d2x * d2x + d2y * d2y);
  return (Math.sqrt(distSq) * Math.sign(px - py)) / 1.15;
}

const THANK_YOU_STROKES: ReadonlyArray<readonly [number, number, number, number]> = [
  // Row 1: T H A N K (y from -0.26 to -0.04)
  // T
  [-0.58, -0.26, -0.44, -0.26],
  [-0.51, -0.26, -0.51, -0.04],
  // H
  [-0.36, -0.26, -0.36, -0.04],
  [-0.24, -0.26, -0.24, -0.04],
  [-0.36, -0.15, -0.24, -0.15],
  // A
  [-0.14, -0.04, -0.08, -0.26],
  [-0.08, -0.26, -0.02, -0.04],
  [-0.12, -0.12, -0.04, -0.12],
  // N
  [0.06, -0.04, 0.06, -0.26],
  [0.06, -0.26, 0.18, -0.04],
  [0.18, -0.04, 0.18, -0.26],
  // K
  [0.27, -0.26, 0.27, -0.04],
  [0.39, -0.26, 0.27, -0.15],
  [0.27, -0.15, 0.40, -0.04],

  // Row 2: Y O U (y from 0.06 to 0.28)
  // Y
  [-0.36, 0.06, -0.29, 0.17],
  [-0.22, 0.06, -0.29, 0.17],
  [-0.29, 0.17, -0.29, 0.28],
  // O
  [-0.10, 0.06, 0.02, 0.06],
  [0.02, 0.06, 0.02, 0.28],
  [0.02, 0.28, -0.10, 0.28],
  [-0.10, 0.28, -0.10, 0.06],
  // U
  [0.12, 0.06, 0.12, 0.28],
  [0.12, 0.28, 0.24, 0.28],
  [0.24, 0.28, 0.24, 0.06],
];

/** 4: "THANK YOU" typographic silhouette */
function sdfThankYou(nx: number, ny: number): number {
  let d = 1e6;
  const r = 0.026;
  for (let i = 0; i < THANK_YOU_STROKES.length; i += 1) {
    const [ax, ay, bx, by] = THANK_YOU_STROKES[i];
    const seg = sdCapsule(nx, ny, ax, ay, bx, by, r);
    if (seg < d) d = seg;
  }
  return d;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Scalar field 0: UX Expert
 * Diverging then converging left-to-right braided river streams across [-0.9, 0.9],
 * widening into a braided delta around Map (0.0, -0.44) and converging into Validate (0.62, 0.16).
 */
function fieldUxExpert(nx: number, ny: number, time: number): { energy: number; accent: number } {
  // Smooth horizontal envelope across [-0.9, 0.9]
  const xMask = 1 - smoothstep(0.74, 0.96, Math.abs(nx));
  if (xMask <= 0.001) return { energy: 0, accent: 0 };

  // Narrow at left (nx <= -0.55) and right (nx >= 0.55), broad braided delta in the middle
  const spread = Math.exp(-nx * nx * 3.4);

  let streamSum = 0;
  let streamMax = 0;

  for (let k = -2; k <= 2; k++) {
    const cy = spread * k * 0.22 + 0.055 * Math.sin(nx * 5.2 - time * 1.4 + k * 1.3);
    const w = 0.032 + 0.018 * spread;
    const dy = ny - cy;
    const profile = Math.exp(-(dy * dy) / (w * w));
    const flow = 0.55 + 0.45 * Math.sin(nx * 13.0 - time * 3.4 + k * 0.9);
    const contribution = profile * flow;
    streamSum += contribution;
    if (contribution > streamMax) streamMax = contribution;
  }

  // Subtle ambient ripple eddies around the braided center
  const eddies =
    Math.max(0, Math.sin(nx * 9.5 - time * 2.2 + ny * 7.5)) *
    0.18 *
    spread *
    Math.exp(-ny * ny * 3.2);

  // Brighten the convergent exit stream on the right (nx > 0.35) with slate accent
  const exitBoost = smoothstep(0.35, 0.78, nx);

  const energy = clamp01((streamMax * 0.78 + streamSum * 0.24 + eddies) * xMask);
  const accent = clamp01(
    (streamMax * (0.18 + 0.82 * exitBoost) + exitBoost * streamSum * 0.28) * xMask,
  );
  return { energy, accent };
}

/**
 * Scalar field 1: Communicator and Leader
 * Three intersecting harmonic ring-fields (Design, Engineering, Stakeholders)
 * whose constructive wave interference illuminates a central alignment core.
 */
function fieldCommunicator(nx: number, ny: number, time: number): { energy: number; accent: number } {
  const c1x = 0.0;
  const c1y = -0.34;
  const c2x = -0.34;
  const c2y = 0.24;
  const c3x = 0.34;
  const c3y = 0.24;

  const d1 = Math.hypot(nx - c1x, ny - c1y);
  const d2 = Math.hypot(nx - c2x, ny - c2y);
  const d3 = Math.hypot(nx - c3x, ny - c3y);

  const ringR = 0.44;
  const ring1 = Math.exp(-Math.pow((d1 - ringR) / 0.036, 2));
  const ring2 = Math.exp(-Math.pow((d2 - ringR) / 0.036, 2));
  const ring3 = Math.exp(-Math.pow((d3 - ringR) / 0.036, 2));
  const rings = clamp01((ring1 + ring2 + ring3) * 0.72);

  const wave1 = Math.cos(d1 * 21.0 - time * 1.45) * Math.exp(-d1 * 1.75);
  const wave2 = Math.cos(d2 * 21.0 - time * 1.45) * Math.exp(-d2 * 1.75);
  const wave3 = Math.cos(d3 * 21.0 - time * 1.45) * Math.exp(-d3 * 1.75);
  const interference = Math.max(0, (wave1 + wave2 + wave3) * 0.42);

  const dCore = Math.hypot(nx, ny - 0.04);
  const core = Math.exp(-(dCore * dCore) / 0.012);
  const corePulse = 0.35 * Math.exp(-Math.pow((dCore - (0.14 + 0.03 * Math.sin(time * 1.8))) / 0.035, 2));

  const energy = clamp01(rings * 0.75 + interference * 0.85 + core * 0.95 + corePulse);
  const accent = clamp01(core * 0.95 + Math.max(0, interference - 0.25) * 0.85);
  return { energy, accent };
}

/**
 * Scalar field 2: Just Make It
 * Looping 6.0s cycle: waves of dispersed particles converge inward to assemble into
 * tangible silhouettes (paper plane, alpaca, dove, heart, thank you) ->
 * hold crisp form -> disperse outward as waves again.
 */
function fieldJustMakeIt(nx: number, ny: number, time: number): { energy: number; accent: number } {
  const CYCLE = 6.0;
  const cycleIdx = ((Math.floor(time / CYCLE) % 5) + 5) % 5;
  const p = (((time % CYCLE) + CYCLE) % CYCLE) / CYCLE;

  const r = Math.hypot(nx, ny);
  const theta = Math.atan2(ny, nx);

  let sdf: number;
  if (cycleIdx === 0) {
    sdf = sdfPaperPlane(nx, ny);
  } else if (cycleIdx === 1) {
    sdf = sdfAlpaca(nx, ny);
  } else if (cycleIdx === 2) {
    sdf = sdfDove(nx, ny);
  } else if (cycleIdx === 3) {
    sdf = sdfHeart(nx, ny);
  } else {
    sdf = sdfThankYou(nx, ny);
  }

  // Phase weights:
  // 1. Assembly (p = 0.00..0.32): inward-traveling particle waves converging onto the silhouette
  // 2. Crisp form (p = 0.24..0.58): sharp silhouette with slate-accented rim
  // 3. Dispersion (p = 0.54..0.95): outward-traveling wavelets scattering back into the field
  const assembleProgress = smoothstep(0.0, 0.30, p);
  const assembleEnvelope = smoothstep(0.0, 0.08, p) * (1 - smoothstep(0.24, 0.34, p));
  const sharpness = smoothstep(0.20, 0.32, p) * (1 - smoothstep(0.54, 0.66, p));
  const disperseProgress = smoothstep(0.54, 0.90, p);
  const disperseEnvelope = smoothstep(0.52, 0.60, p) * (1 - smoothstep(0.86, 0.98, p));

  // Ambient scattered wavelets between cycles so the stage never goes dead
  const ambientWavelets =
    Math.exp(-r * r * 1.35) *
    (0.32 + 0.28 * Math.sin(nx * 5.2 + time * 1.4) * Math.cos(ny * 4.8 - time * 1.2));

  // Phase 1: Inward-converging waves of dispersed particles assembling into the shape
  const inwardSdf = sdf - (1 - assembleProgress) * 0.44;
  const inwardRipple = Math.max(0, Math.sin((sdf + assembleProgress * 0.82) * 24.0));
  const inwardWavelets = 0.5 + 0.5 * Math.sin(theta * 7.0 - r * 12.0 + time * 2.8);
  const assemblingShell =
    Math.exp(-Math.pow(inwardSdf / 0.14, 2)) *
    (0.38 + 0.62 * inwardRipple) *
    (0.32 + 0.68 * inwardWavelets);
  const assemblingCore =
    (1 - smoothstep(-0.08, 0.10, inwardSdf)) *
    (0.25 + 0.45 * assembleProgress) *
    (0.45 + 0.55 * inwardRipple);

  // Phase 2: Crisp silhouette boundary
  const edge = 0.022 + 0.12 * (1 - sharpness);
  const shapeFill = 1 - smoothstep(-edge, edge, sdf);
  const crispRim = Math.exp(-Math.pow(sdf / 0.032, 2)) * sharpness;

  // Phase 3: Outward expansion, concentric dispersion ripples along silhouette, and drifting wavelets
  const expandedSdf = sdf - disperseProgress * 0.42;
  const dispersionRipple = Math.max(0, Math.sin((sdf - disperseProgress * 0.78) * 24.0));
  const wavelets = 0.5 + 0.5 * Math.sin(theta * 7.0 + r * 11.0 - time * 2.8);
  const dispersedShell =
    Math.exp(-Math.pow(expandedSdf / 0.14, 2)) *
    (0.38 + 0.62 * dispersionRipple) *
    (0.32 + 0.68 * wavelets);
  const dispersedCore =
    (1 - smoothstep(-0.08, 0.12, expandedSdf)) *
    0.45 *
    (1 - disperseProgress * 0.85) *
    (0.45 + 0.55 * dispersionRipple);

  const energy = clamp01(
    ambientWavelets * (1 - sharpness * 0.85) * 0.45 +
      (assemblingShell + assemblingCore) * assembleEnvelope * 0.95 +
      shapeFill * sharpness * 0.90 +
      crispRim * 0.35 +
      (dispersedShell + dispersedCore) * disperseEnvelope * 0.95,
  );
  const accent = clamp01(
    assemblingShell * assembleEnvelope * 0.80 +
      crispRim * 0.95 +
      shapeFill * sharpness * 0.22 +
      dispersedShell * disperseEnvelope * 0.85,
  );
  return { energy, accent };
}

export function ApproachLatticeStage({
  progress,
  staticProgress,
  variant = 'stage',
  ariaLabel = 'Interactive dot-lattice diagram matching the active approach chapter',
}: ApproachLatticeStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetProgressRef = useRef(staticProgress ?? progress);
  const currentProgressRef = useRef(staticProgress ?? progress);
  const pointerRef = useRef({ nx: 0, ny: 0, targetPull: 0, pull: 0 });
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const drawStaticRef = useRef<(() => void) | null>(null);
  const [weights, setWeights] = useState<[number, number, number]>(() => {
    const p = staticProgress ?? progress;
    return [
      Math.max(0, 1 - Math.abs(p - 0)),
      Math.max(0, 1 - Math.abs(p - 1)),
      Math.max(0, 1 - Math.abs(p - 2)),
    ];
  });

  targetProgressRef.current = staticProgress ?? progress;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    let rafId = 0;
    let isDisposed = false;
    let lastWeightSync = 0;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (
        sizeRef.current.width !== width ||
        sizeRef.current.height !== height ||
        sizeRef.current.dpr !== dpr
      ) {
        sizeRef.current = { width, height, dpr };
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
    };

    const drawFrame = (timeSec: number) => {
      const { width, height, dpr } = sizeRef.current;
      if (width <= 1 || height <= 1) return;

      const p = currentProgressRef.current;
      const w0 = Math.max(0, 1 - Math.abs(p - 0));
      const w1 = Math.max(0, 1 - Math.abs(p - 1));
      const w2 = Math.max(0, 1 - Math.abs(p - 2));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = `rgb(${PAPER_RGB[0]}, ${PAPER_RGB[1]}, ${PAPER_RGB[2]})`;
      ctx.fillRect(0, 0, width, height);

      const cols = Math.floor(width / PITCH);
      const rows = Math.floor(height / PITCH);
      const offsetX = (width - (cols - 1) * PITCH) * 0.5;
      const offsetY = (height - (rows - 1) * PITCH) * 0.5;
      const halfMin = Math.max(1, Math.min(width, height) * 0.44);
      const halfW = width * 0.5;
      const halfH = height * 0.5;

      const ptr = pointerRef.current;

      for (let j = 0; j < rows; j++) {
        const py = offsetY + j * PITCH;
        const ny = (py - halfH) / halfMin;
        const ey = (py - halfH) / halfH;

        for (let i = 0; i < cols; i++) {
          const px = offsetX + i * PITCH;
          const nx = (px - halfW) / halfMin;
          const ex = (px - halfW) / halfW;

          // Radial/elliptical edge fade into --water-paper
          const edgeDist = Math.hypot(ex * 0.94, ey * 0.94);
          const edgeFade = 1 - smoothstep(0.62, 1.0, edgeDist);
          if (edgeFade <= 0.01) continue;

          let energy = 0;
          let accent = 0;

          if (w0 > 0.005) {
            const f0 = fieldUxExpert(nx, ny, timeSec);
            energy += w0 * f0.energy;
            accent += w0 * f0.accent;
          }
          if (w1 > 0.005) {
            const f1 = fieldCommunicator(nx, ny, timeSec);
            energy += w1 * f1.energy;
            accent += w1 * f1.accent;
          }
          if (w2 > 0.005) {
            const f2 = fieldJustMakeIt(nx, ny, timeSec);
            energy += w2 * f2.energy;
            accent += w2 * f2.accent;
          }

          // Subtle interactive pointer hover lift
          if (ptr.pull > 0.005) {
            const pd = Math.hypot(nx - ptr.nx, ny - ptr.ny);
            const bump = Math.exp(-pd * pd * 8.5) * ptr.pull;
            energy = clamp01(energy + bump * 0.7);
            accent = clamp01(accent + bump * 0.65);
          }

          // Base lattice dot presence + signal gain
          const signal = clamp01(energy);
          const radius = PITCH * (0.21 + 0.18 * signal);

          // Blend between subtle resting lattice grey -> #16181f ink -> #364f6e slate accent
          const restAlpha = 0.14 + 0.72 * signal;
          const inkMix = clamp01(signal * 0.85);
          const slateMix = clamp01(accent * 0.9);

          const baseR = PAPER_RGB[0] + (INK_RGB[0] - PAPER_RGB[0]) * (0.28 + 0.72 * inkMix);
          const baseG = PAPER_RGB[1] + (INK_RGB[1] - PAPER_RGB[1]) * (0.28 + 0.72 * inkMix);
          const baseB = PAPER_RGB[2] + (INK_RGB[2] - PAPER_RGB[2]) * (0.28 + 0.72 * inkMix);

          const r = Math.round(baseR + (SLATE_RGB[0] - baseR) * slateMix);
          const g = Math.round(baseG + (SLATE_RGB[1] - baseG) * slateMix);
          const b = Math.round(baseB + (SLATE_RGB[2] - baseB) * slateMix);
          const alpha = restAlpha * edgeFade;

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const syncWeights = (p: number) => {
      setWeights([
        Math.max(0, 1 - Math.abs(p - 0)),
        Math.max(0, 1 - Math.abs(p - 1)),
        Math.max(0, 1 - Math.abs(p - 2)),
      ]);
    };

    drawStaticRef.current = () => drawFrame(0);
    updateSize();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateSize();
            if (motionQuery?.matches) {
              currentProgressRef.current = targetProgressRef.current;
              syncWeights(currentProgressRef.current);
              drawFrame(0);
            }
          })
        : null;
    resizeObserver?.observe(container);

    const startTime = performance.now();

    const tick = (now: number) => {
      if (isDisposed) return;

      const reduced = motionQuery?.matches ?? false;
      if (reduced) {
        currentProgressRef.current = targetProgressRef.current;
        pointerRef.current.pull = 0;
        syncWeights(currentProgressRef.current);
        drawFrame(0);
        return;
      }

      // Smoothly damp scroll progress & pointer hover
      const targetP = targetProgressRef.current;
      const diffP = targetP - currentProgressRef.current;
      currentProgressRef.current += diffP * 0.14;
      if (Math.abs(diffP) < 0.0005) {
        currentProgressRef.current = targetP;
      }

      const ptr = pointerRef.current;
      ptr.pull += (ptr.targetPull - ptr.pull) * 0.12;

      if (now - lastWeightSync > 32) {
        lastWeightSync = now;
        syncWeights(currentProgressRef.current);
      }

      drawFrame((now - startTime) * 0.001);
      rafId = window.requestAnimationFrame(tick);
    };

    if (motionQuery?.matches) {
      currentProgressRef.current = targetProgressRef.current;
      syncWeights(currentProgressRef.current);
      drawFrame(0);
    } else {
      rafId = window.requestAnimationFrame(tick);
    }

    const handleMotionChange = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (motionQuery?.matches) {
        currentProgressRef.current = targetProgressRef.current;
        syncWeights(currentProgressRef.current);
        drawFrame(0);
      } else {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    motionQuery?.addEventListener?.('change', handleMotionChange);

    return () => {
      isDisposed = true;
      drawStaticRef.current = null;
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      motionQuery?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  // Re-render static frame when progress updates under reduced motion
  useEffect(() => {
    const motionQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    if (!motionQuery?.matches) return;

    const p = staticProgress ?? progress;
    targetProgressRef.current = p;
    currentProgressRef.current = p;
    setWeights([
      Math.max(0, 1 - Math.abs(p - 0)),
      Math.max(0, 1 - Math.abs(p - 1)),
      Math.max(0, 1 - Math.abs(p - 2)),
    ]);
    drawStaticRef.current?.();
  }, [progress, staticProgress]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const halfMin = Math.max(1, Math.min(rect.width, rect.height) * 0.44);
    const nx = (event.clientX - rect.left - rect.width * 0.5) / halfMin;
    const ny = (event.clientY - rect.top - rect.height * 0.5) / halfMin;
    pointerRef.current.nx = nx;
    pointerRef.current.ny = ny;
    pointerRef.current.targetPull = 1;
  };

  const handlePointerLeave = () => {
    pointerRef.current.targetPull = 0;
  };

  const activeIdx = Math.max(0, Math.min(2, Math.round(staticProgress ?? progress)));

  return (
    <div
      ref={containerRef}
      className={`intro__lattice intro__lattice--${variant}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label={ariaLabel}
    >
      <canvas ref={canvasRef} className="intro__lattice-canvas" aria-hidden="true" />

      {variant === 'stage' ? (
        <div className="intro__lattice-caption" aria-hidden="true">
          <span className="intro__lattice-counter">
            {String(activeIdx + 1).padStart(2, '0')} / 03
          </span>
          <span className="intro__lattice-title">{CHAPTER_TITLES[activeIdx]}</span>
        </div>
      ) : null}

      <div className="intro__lattice-callouts" aria-hidden="true">
        {CHAPTER_CALLOUTS.map((group, groupIndex) => {
          const w = weights[groupIndex] ?? 0;
          if (w <= 0.02) return null;
          return (
            <div
              key={CHAPTER_TITLES[groupIndex]}
              className="intro__lattice-group"
              style={{ opacity: w }}
            >
              {group.map((item) => {
                // Convert normalized coordinates to percentage offsets from center
                const leftPct = 50 + item.nx * 36;
                const topPct = 50 + item.ny * 36;
                return (
                  <span
                    key={item.label}
                    className={`intro__lattice-callout${item.strong ? ' intro__lattice-callout--strong' : ''}`}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                    }}
                  >
                    {item.label}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
