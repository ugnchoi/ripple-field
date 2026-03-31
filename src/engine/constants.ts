/** Max simultaneous analytic swell sources (must match shader `MAX_SOURCES`). */
export const MAX_SWELL_SOURCES = 16;

/** Default lattice resolution along the wider horizontal span. */
export const GRID_COLS = 144;

/** Shared propagation speed in world units per second (constant across impacts). */
export const DEFAULT_PROPAGATION_SPEED = 0.84;

/** Base Gaussian width in world space; effective width scales with strength (Phase 2.3). */
export const DEFAULT_SWELL_WIDTH = 0.068;

/** Temporal decay rate (higher = faster fade); paired with soft-tail curve (Phase 2.2). */
export const DEFAULT_DECAY = 0.98;

/** Vertex displacement scale (subtle background motion). */
export const DEFAULT_DISPLACEMENT_SCALE = 0.034;

/** Extra `gl_PointSize` from accumulated field (after soft saturation, Phase 2.4). */
export const DEFAULT_SIZE_LIFT_SCALE = 12;

// --- Phase 2: swell profile, decay, strength mapping, overlap (see docs/02-phase-2) ---

/** Mix toward wide Gaussian cushion (0–1). */
export const SWELL_WIDE_MIX = 0.52;

/** Lorentz shoulder weight on the core (0–1). Softer tails, less crisp ring. */
export const SWELL_SHOULDER = 0.38;

/** Wide-band sigma = effectiveWidth * this. */
export const SWELL_WIDE_WIDTH_SCALE = 2.35;

/** Lorentz term: 1 / (1 + SHOULDER_Z * zn²). */
export const SWELL_SHOULDER_Z = 0.22;

/** Effective width multiplier: wEff = w * (1 + this * strength). Stronger → broader, not faster. */
export const STRENGTH_TO_WIDTH_SCALE = 0.52;

/** Strength slows fade via soft tail: tail = BASE / (1 + this * strength). */
export const STRENGTH_DECAY_PERSISTENCE = 0.42;

/** Baseline soft tail (seconds-scale) inside exp(-decay * t² / (t + tail)). */
export const DECAY_SOFT_TAIL_BASE = 0.46;

/** Displacement magnitude soft cap: tanh(dm * k) / k on summed direction. */
export const DISP_SOFT_CAP_K = 2.75;

/** Point-size field soft cap (same tanh form on summed field). */
export const FIELD_SIZE_SOFT_CAP_K = 1.02;

/**
 * As a swell ages (t since spawn), width tightens: factor =
 * `floor + (1-floor)/(1 + rate*t)`. At t=0 full width; approaches `floor` over time.
 */
export const SWELL_WIDTH_TIGHTEN_RATE = 2.35;

/** Minimum fraction of width retained at late times (prevents a vanishingly thin ring). */
export const SWELL_WIDTH_TIGHTEN_FLOOR = 0.4;

export const DEFAULT_BASE_POINT_SIZE = 2.8;

export const DEFAULT_POINT_OPACITY = 0.22;
