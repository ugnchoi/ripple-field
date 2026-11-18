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
    { label: 'Define', nx: -0.46, ny: 0.14, strong: true },
    { label: 'Map', nx: 0.0, ny: 0.0 },
    { label: 'Validate', nx: 0.46, ny: -0.14, strong: true },
  ],
  [
    { label: 'Design', nx: 0.0, ny: -0.48 },
    { label: 'Engineering', nx: -0.48, ny: 0.36 },
    { label: 'Stakeholders', nx: 0.48, ny: 0.36 },
    { label: 'Aligned', nx: 0.0, ny: 0.04, strong: true },
  ],
  [
    { label: 'Sketch', nx: -0.46, ny: 0.22 },
    { label: 'Prototype', nx: 0.0, ny: -0.14 },
    { label: 'Shipped', nx: 0.46, ny: 0.12, strong: true },
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

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Scalar field 0: UX Expert
 * Focused elliptical ripple resonance between Define (-0.46, 0.14) and Validate (0.46, -0.14),
 * passing through Map (0.0, 0.0).
 */
function fieldUxExpert(nx: number, ny: number, time: number): { energy: number; accent: number } {
  const d1 = Math.hypot(nx + 0.46, ny - 0.14);
  const d2 = Math.hypot(nx - 0.46, ny + 0.14);
  const ellipticSum = d1 + d2;

  // Elliptical wave-lens standing contours connecting both foci
  const ellipticEnvelope = Math.exp(-Math.max(0, ellipticSum - 1.0) * 1.65);
  const ellipticContours =
    Math.pow(Math.max(0, Math.cos((ellipticSum - 1.0) * 16.0 - time * 0.75)), 2) *
    0.46 *
    ellipticEnvelope;

  // Expanding ripple from Define & converging/focusing ripple into Validate
  const waveDefine = Math.max(0, Math.sin(d1 * 22.0 - time * 2.2)) * Math.exp(-d1 * 1.85);
  const waveValidate = Math.max(0, Math.sin(d2 * 22.0 + time * 2.2)) * Math.exp(-d2 * 1.85);
  const focusRipples = (waveDefine + waveValidate) * 0.48;

  // Crisp focal drop cores and subtle halos at Define & Validate, plus gentle Map center
  const defineCore = Math.exp(-(d1 * d1) / 0.0052);
  const validateCore = Math.exp(-(d2 * d2) / 0.0056);
  const dMap = Math.hypot(nx, ny);
  const mapNode = Math.exp(-(dMap * dMap) / 0.0042) * 0.55;

  const focalHalos =
    0.32 * Math.exp(-Math.pow((d1 - 0.11) / 0.032, 2)) +
    0.38 * Math.exp(-Math.pow((d2 - 0.11) / 0.032, 2));

  const energy = clamp01(
    ellipticContours + focusRipples + defineCore * 0.92 + validateCore * 0.95 + mapNode + focalHalos,
  );
  const accent = clamp01(
    validateCore * 0.95 +
      defineCore * 0.65 +
      ellipticContours * 0.7 +
      Math.max(0, waveValidate - 0.2) * 0.85,
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

const JUST_MAKE_IT_DROPS = [
  { x: -0.46, y: 0.22 }, // Sketch
  { x: 0.0, y: -0.14 },  // Prototype
  { x: 0.46, y: 0.12 },  // Shipped
] as const;

/**
 * Scalar field 2: Just Make It
 * Cascading multi-drop ripple interference across Sketch (-0.46, 0.22),
 * Prototype (0.0, -0.14), and Shipped (0.46, 0.12) on a 4.2s 3-beat cadence.
 */
function fieldJustMakeIt(nx: number, ny: number, time: number): { energy: number; accent: number } {
  const cycle = 4.2;
  const stagger = 1.4;
  const speed = 0.58;
  const width = 0.24;
  const wavelength = 0.19;
  const twoPiOverLambda = (Math.PI * 2) / wavelength;

  let waveSum = 0;
  let coreSum = 0;
  let shippedBoost = 0;

  for (let k = 0; k < JUST_MAKE_IT_DROPS.length; k++) {
    const drop = JUST_MAKE_IT_DROPS[k];
    const r = Math.hypot(nx - drop.x, ny - drop.y);
    const age = (((time - k * stagger) % cycle) + cycle) % cycle;

    const onset = 1 - Math.exp(-age / 0.15);
    const decay = Math.exp(-0.45 * age) * Math.exp(-r * 0.9);
    const front = speed * age;
    const packet = Math.exp(-0.5 * Math.pow((r - front) / width, 2));
    const harmonic = 0.5 + 0.5 * Math.cos(twoPiOverLambda * (r - front));

    const train = onset * decay * packet * harmonic;
    waveSum += train;

    const impact = Math.exp(-age / 0.55) * 0.6 + 0.4;
    const core = Math.exp(-(r * r) / 0.005) * impact;
    coreSum += core;

    if (k === 2) {
      shippedBoost = core + train * 0.75;
    }
  }

  const energy = clamp01(waveSum * 0.78 + coreSum * 0.85);
  const accent = clamp01(shippedBoost * 0.85 + Math.max(0, waveSum - 0.35) * 0.9);
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
