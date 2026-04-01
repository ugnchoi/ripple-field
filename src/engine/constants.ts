/** Max simultaneous analytic swell sources (must match shader `MAX_SOURCES`). */
export const MAX_SWELL_SOURCES = 16;

/** Default lattice resolution along the wider horizontal span. */
export const GRID_COLS = 244;

/** Shared propagation speed in world units per second (constant across impacts). */
export const DEFAULT_PROPAGATION_SPEED = 0.84;

/** Base Gaussian width in world space; effective width scales with strength (Phase 2.3). */
export const DEFAULT_SWELL_WIDTH = 0.06;

/** Temporal decay rate (higher = faster fade); paired with soft-tail curve (Phase 2.2). */
export const DEFAULT_DECAY = 0.98;

/** Vertex displacement scale (subtle background motion). */
export const DEFAULT_DISPLACEMENT_SCALE = 0.031;

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

export const DEFAULT_POINT_OPACITY = 0.185;

// --- Phase 3: point field visual language (docs/03-phase-3) ---

/**
 * Brick / stagger: odd rows shift by this fraction of one column step (0.5 = half-step).
 * Geometry keeps points inside the ortho frustum.
 */
export const GRID_STAGGER = 0.5;

/** Micro-position jitter as a fraction of local cell size (softened regular lattice). */
export const GRID_JITTER = 0.12;

/** Restrained lightness response to field: rgb *= (1 + this * vField). */
export const POINT_BRIGHTNESS_FROM_FIELD = 0.072;

/** Point disc falloff: smoothstep(inner, outer, r) in 0…0.5 space. */
export const POINT_EDGE_INNER = 0.17;
export const POINT_EDGE_OUTER = 0.45;

/** Slight seed-driven stretch of `gl_PointCoord` (premium, not gimmicky). */
export const POINT_SHAPE_ANISOTROPY = 0.065;

/** Subtle per-point base size variation at rest (world-independent, pixels). */
export const REST_POINT_SIZE_JITTER = 0.14;

// --- Phase 4: controlled irregularity (docs/04-phase-4) ---

/**
 * Fixed offset baked into field hashes for reproducible side-by-side sessions.
 * Change only when intentionally reshaping the organic character.
 */
export const FIELD_VARIATION_SEED = 47.17;

/** World-space evaluation warp amplitude (static; no time term to avoid flutter). */
export const FIELD_WARP_AMPLITUDE = 0.012;

/** Warp spatial frequency in world units. */
export const FIELD_WARP_FREQUENCY = 1.22;

/** Per-swell width: `wEff *= 1 + range * (hash*2 - 1)`; hash from center + startTime. */
export const SWELL_WIDTH_MOD_RANGE = 0.095;

/** Extra width tied to strength on top of hash (richer strong impacts, still bounded). */
export const SWELL_BREADTH_STRENGTH_K = 0.065;

/** Contour drift added to `delta` (scaled by `wEff` for stable thickness units). */
export const FIELD_DELTA_BIAS_STRENGTH = 0.03;

/** Tiny rotation of radial push direction (radians), static w.r.t. time. */
export const DISPLACEMENT_DIR_BIAS_RAD = 0.032;

// --- Phase 5: foreground integration & composition (docs/05-phase-5) ---

/** Master scale for displacement + size field (product-wide intensity knob). */
export const FOREGROUND_GLOBAL_FIELD_SCALE = 0.92;

/** Multiplies `FOREGROUND_GLOBAL_FIELD_SCALE` in quiet mode. */
export const FOREGROUND_QUIET_FIELD_SCALE_MUL = 0.62;

/** Multiplies point opacity in quiet mode. */
export const FOREGROUND_QUIET_OPACITY_MUL = 0.78;

/**
 * Inside `[data-ripple-safe]` bounds (world space), field and displacement multiply by this.
 * Edges feather by `FOREGROUND_SAFE_ZONE_BLEND_WORLD`.
 */
export const FOREGROUND_SAFE_ZONE_INTERIOR_MUL = 0.38;

/** World-space feather width for safe-zone falloff (avoids harsh holes). */
export const FOREGROUND_SAFE_ZONE_BLEND_WORLD = 0.11;

/** Minimum seconds between keyboard-triggered swells (typing bursts stay controlled). */
export const FOREGROUND_KEY_SWELL_MIN_INTERVAL = 0.16;

/** Pointer swell strength (foreground-safe default). */
export const FOREGROUND_POINTER_SWELL_STRENGTH = 0.68;

/** Keyboard swell strength (softer than pointer). */
export const FOREGROUND_KEY_SWELL_STRENGTH = 0.38;

/** Pointer jitter half-width (keeps Phase 2.5 narrow band). */
export const FOREGROUND_POINTER_STRENGTH_JITTER = 0.06;

/** Keyboard jitter half-width. */
export const FOREGROUND_KEY_STRENGTH_JITTER = 0.05;

/** Wall-clock window for scheduled random viewport spawns. */
export const AUTO_RANDOM_SPAWN_WINDOW_SEC = 10;

/** Random spawn count per window (e.g. ~5 every 10s). */
export const AUTO_RANDOM_SPAWN_COUNT_PER_WINDOW = 5;

/** Auto random spawn strength (calmer than pointer; near key swell). */
export const AUTO_RANDOM_SPAWN_STRENGTH = 0.44;

/** Strength jitter half-width for auto spawns. */
export const AUTO_RANDOM_SPAWN_STRENGTH_JITTER = 0.07;

/** Width scale vs `DEFAULT_SWELL_WIDTH` for auto spawns. */
export const AUTO_RANDOM_SPAWN_WIDTH_SCALE = 0.94;

// --- Phase 6: performance hardening (docs/06-phase-6) ---

/** Floor for responsive column count (below this the grid reads too coarse). */
export const PERF_GRID_COLS_MIN = 96;

/**
 * Minimum seconds between pointer-triggered swells (pathological click spam).
 * Keyboard cadence remains governed by `FOREGROUND_KEY_SWELL_MIN_INTERVAL`.
 */
export const PERF_POINTER_SWELL_MIN_INTERVAL = 0.056;

// --- Phase 7: optional subtle polish (docs/07-phase-7) — core field unchanged when master = 0 ---

/** Master off by default; enable in product only when comparison proves value. */
export const POLISH_DEFAULT_ENABLED = false;

/**
 * Extra `rgb *= (1 + k * vField²)` when tonal layer is on (strong-swell refinement only).
 */
export const POLISH_TONAL_LIFT_K = 0.036;

/** Vignette: `rgb *= clamp(1 - k * |uv|², floor, 1)` in screen space (per-fragment, no extra pass). */
export const POLISH_VIGNETTE_K = 0.2;

export const POLISH_VIGNETTE_FLOOR = 0.88;

/** Added to `P_EDGE_OUT` in point space for slightly softer discs (polish edge layer). */
export const POLISH_EDGE_OUTER_DELTA = 0.026;

/** Corners darken by at most this fraction via world-radius smoothstep (polish depth layer). */
export const POLISH_DEPTH_CUE_K = 0.055;

export const POLISH_DEPTH_ATTEN_FLOOR = 0.93;
