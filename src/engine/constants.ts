/** Max simultaneous analytic swell sources (must match shader `MAX_SOURCES`). */
export const MAX_SWELL_SOURCES = 16;

/** Fallback lattice resolution when no explicit column count is supplied. */
export const GRID_COLS = 244;

/**
 * Target on-screen gap between adjacent dots, in CSS pixels. Column count is derived from
 * viewport width so perceived density stays constant instead of stretching with the viewport:
 * spacing = cssWidth / (cols - 1), so a fixed column count means a 2560px display reads far
 * sparser than a 768px one. 6px matches the density the field was tuned at (1440px / 244 cols).
 */
export const TARGET_DOT_SPACING_PX = 6;

/** Shared propagation speed in world units per second (constant across impacts). */
export const DEFAULT_PROPAGATION_SPEED = 0.84;

/** Base Gaussian width in world space; effective width scales with strength (Phase 2.3). */
export const DEFAULT_SWELL_WIDTH = 0.075;

/** Temporal decay rate (higher = faster fade); paired with soft-tail curve (Phase 2.2). */
export const DEFAULT_DECAY = 0.98;

/**
 * How far a swell pushes dots off their lattice position, in world units. Cut to roughly a quarter
 * of its original value once the dot spacing became a fixed 6px: peak displacement was near 4.7px,
 * three quarters of a whole spacing, so a passing ring tore the lattice apart and reshuffled it
 * rather than disturbing it. Now near 1.4px, a little under a quarter of the spacing, which puts it
 * in the same range as the ambient drift.
 *
 * The size and tone channels carry the ring; this only has to keep it from looking rigid. Past about
 * a third of the spacing, shear stops reading as motion and starts reading as damage.
 */
export const DEFAULT_DISPLACEMENT_SCALE = 0.009;

/**
 * Extra point size from the accumulated field, in CSS pixels (after soft saturation, Phase 2.4).
 * Halved when point size became pixel-ratio aware: this used to be applied in framebuffer pixels,
 * so on a retina display it delivered half of its nominal value.
 *
 * Trimmed again alongside the darken and opacity lifts, which is the same trade the ambient surface
 * makes: past a point, a wider crest dot only closes the gap to its neighbours and the ring reads as
 * a thickening band, where tone keeps it reading as a defined edge.
 */
export const DEFAULT_SIZE_LIFT_SCALE = 6.4;

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

/**
 * Resting dot diameter in CSS pixels, against `TARGET_DOT_SPACING_PX` of 6 — so this is a fill
 * fraction as much as a size. At 3.2 the lattice reads as distinct dots with clear air between
 * them; approaching 6 they touch and the field turns into a mesh.
 */
export const DEFAULT_BASE_POINT_SIZE = 3.2;

/**
 * Base alpha for a resting dot. Raised as diameter came down: a dot at 3.2px covers 79% of the area
 * it did at 3.6, and returning that as alpha keeps the field's overall weight while making each dot
 * read as a darker, tighter mark. Tone is the cheaper channel here — it costs no risk of dots
 * merging, which is the hard ceiling on diameter at a 6px spacing.
 */
export const DEFAULT_POINT_OPACITY = 0.215;

// --- Phase 3: point field visual language (docs/03-phase-3) ---

/**
 * Brick / stagger: odd rows shift by this fraction of one column step (0.5 = half-step).
 * Geometry keeps points inside the ortho frustum.
 */
export const GRID_STAGGER = 0.5;

/** Micro-position jitter as a fraction of local cell size (softened regular lattice). */
export const GRID_JITTER = 0.12;

/**
 * Field-driven contrast: dots darken toward ink (not brighten toward paper) as a wave passes, since
 * brightening a mid-tone dot on a light paper background moves it toward the background colour and
 * erases the effect instead of revealing it.
 *
 * Raised as the crest's size lift and displacement came down, so the ring keeps its presence through
 * tone instead of through geometry. `vField` is tanh-capped just under 1 and the shader clamps the
 * product at zero, so this can be pushed without the crest inverting.
 */
export const POINT_DARKEN_FROM_FIELD = 0.62;

/** Opacity boost from field, layered on top of the darken for a clearer pop. */
export const POINT_OPACITY_LIFT_FROM_FIELD = 1.25;

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
export const FOREGROUND_POINTER_SWELL_STRENGTH = 0.85;

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

/**
 * Guard against a degenerate lattice on extremely narrow viewports. Density itself is governed
 * by `TARGET_DOT_SPACING_PX`, so this floor only engages below roughly 240px of width.
 */
export const PERF_GRID_COLS_MIN = 40;

/** Safety ceiling on column count; the per-tier point budget is the real governor. */
export const PERF_GRID_COLS_MAX = 512;

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

// --- Phase 8: ambient surface dynamics — the swells ride on this, rather than on a flat plane ---

/**
 * Master speed multiplier for the ambient surface. Anything materially faster reads as flicker in
 * peripheral vision while the eye is on text.
 *
 * Contour lines are far more sensitive to this than the height mapping they replaced: a dot's size
 * follows its distance to the nearest line, so a slow drift in height sweeps lines sideways and
 * flips dots on and off as they pass. The quantity that has to stay small is the sweep rate, not
 * the rate the height changes. Measured at 1.5: lines sweep about 5px/s, crossing their own width in
 * 3.2 seconds, and 8% of dots change size by more than 1px within a given second.
 *
 * Two other constants set the budget this spends. The sparse `AMBIENT_CONTOUR_LEVELS` keeps most
 * dots away from any moving edge, and the soft `AMBIENT_LINE_EDGE` widens the falloff a dot has to
 * cross, which measurably lowered the rate at unchanged speed. Tightening either one turns this
 * speed twitchy without touching it.
 */
export const AMBIENT_TIME_SCALE = 1.5;

/**
 * Ambient drift added to vertex position, in world units, and the only thing that makes the lattice
 * itself breathe rather than just change size and tone. Sized so peak drift stays near a fifth of
 * the dot spacing: past roughly a third the lattice visibly shears rather than breathing, and the
 * surface stops reading as texture and starts competing with the swells.
 *
 * Retune this whenever `AMBIENT_NOISE_FREQUENCY` changes — drift is driven by the field gradient,
 * which scales with frequency, so the two move together and the coupling is easy to miss in both
 * directions. Raising the cell count silently raises the shear; lowering it, as the move to contour
 * lines did, silently flattens the drift to nothing.
 */
export const AMBIENT_DISPLACEMENT_SCALE = 0.0016;

/**
 * Size gain in CSS pixels for a dot sitting on a contour line, against `DEFAULT_BASE_POINT_SIZE`.
 * Unsigned, unlike the height mapping it replaced: off-line dots stay at rest size and the line is
 * drawn by the dots that grow. Held back from the point where on-line dots touch at the 6px
 * spacing — the stroke is carried by tone as much as by size, and letting dots merge trades the
 * line's crispness for weight it can get more cheaply from opacity.
 */
export const AMBIENT_SIZE_AMPLITUDE = 1.3;

/**
 * Tonal response, kept below `POINT_DARKEN_FROM_FIELD` so a swell still clearly outranks the
 * surface it travels on. Both this and the opacity lift are scaled by the base opacity before they
 * reach the eye, which is why the numbers look large next to the darken constant. Raised alongside
 * the size reduction: weight the strokes lost in diameter is returned as tone, which reads as a
 * finer line rather than a fatter one.
 */
export const AMBIENT_DARKEN_FROM_FIELD = 0.26;

/** Opacity response — the strongest lever, since dots gain presence against light paper. */
export const AMBIENT_OPACITY_LIFT = 0.55;

/**
 * Base spatial frequency of the surface noise, in cycles per world unit, which sets how large the
 * cells read — here about five across a 16:10 viewport, roughly 300px each.
 *
 * Lowered hard when the mapping became contour lines, for two reasons rather than one. Each cell
 * now has to be big enough to hold several nested rings, and — less obviously — a gentler field
 * spaces its own contours further apart, so a lower frequency is what buys the headroom to draw
 * more rings before neighbours merge back into filled bands. Bigger cells and denser nesting are
 * the same knob, not competing ones.
 */
export const AMBIENT_NOISE_FREQUENCY = 1.5;

/**
 * Detail octaves in the height field. Two, not three: contour lines expose fine detail far more
 * harshly than a filled gradient does, because a small wiggle in height becomes a visible kink in
 * the line. The third octave reads as granularity along the stroke rather than as detail.
 */
export const AMBIENT_NOISE_OCTAVES = 2;

/** Octaves in the warp field. Fewer than the detail field — the warp only needs broad bends. */
export const AMBIENT_WARP_OCTAVES = 2;

/**
 * Contour bands per unit of raw noise output — how many nested rings each cell holds, and the
 * main lever on how much of the field carries any ink at all. Contours sit at even intervals of
 * height, so their spacing on screen goes as 1/gradient: flat regions get almost no lines however
 * many bands you ask for, which is why a low value leaves the middle of the viewport bare.
 *
 * 8 leaves the drawing deliberately sparse — about a eighth of the dots on a line, with wide empty
 * interiors — which is both the look wanted and the quieter option. Band count is the dominant term
 * in how twitchy the surface feels: a dot's size follows its distance to the nearest line, so
 * packing bands closer means the same slow drift in height carries dots across edges far more
 * often. Measured, going from 8 bands to 20 leaves the line sweep speed untouched but doubles the
 * share of dots changing size appreciably within a second.
 *
 * The upper ceiling is merging, and it arrives abruptly: measured across a sweep, the share of
 * dots sitting in a filled patch rather than on a stroke runs 0.4% at 15 bands, 1.8% at 20, then
 * 10% at 26 — past which the drawing collapses back into the cloud that contours replaced.
 */
export const AMBIENT_CONTOUR_LEVELS = 8.0;

/**
 * Half-width of a contour line in CSS pixels, against the 6px dot spacing — so this is really "how
 * many dots wide is a stroke". A line needs about two dots to read as continuous rather than as a
 * row of separate marks. Much more and the drawing turns back into filled bands, though there is
 * plenty of headroom here: rings sit some 112px apart, so nothing is close to merging.
 *
 * Widened in step with the softer edge below. The two together set where the stroke reaches half
 * strength, at `WIDTH * (1 + EDGE) / 2`, and that is what the eye reads as the line's weight — so
 * softening the profile alone would have quietly made every line lighter as well as blurrier.
 */
export const AMBIENT_LINE_WIDTH_PX = 8.1;

/**
 * Fraction of the line half-width held at full strength before the falloff begins. A plateau plus a
 * short edge reads as a drawn stroke; falling away from the centre reads as a soft smear. This is
 * the softness knob — lower is softer, and 1 would be a hard aliased edge.
 */
export const AMBIENT_LINE_EDGE = 0.25;

/**
 * Domain-warp gain: how far the warp field displaces the sample point, in noise-space units.
 * This is the knob that turns concentric blobs into the meandering, stretched cells of a real
 * surface. Past roughly 2.5 the field folds onto itself and the cells break into filaments.
 */
export const AMBIENT_WARP_AMPLITUDE = 1.6;

/** Warp frequency relative to the detail field. Below 1 so bends are broader than the cells. */
export const AMBIENT_WARP_FREQUENCY = 0.55;

/** Warp travel speed; slowest term in the system, so the pattern never visibly repeats. */
export const AMBIENT_WARP_SPEED = 0.23;

/**
 * How much the surface gradient offsets the swell sample position, in world units. Non-zero is
 * what makes ripples behave as if they are *on* the surface: expanding rings inherit its
 * meander instead of staying perfect circles. Small — larger values make rings visibly wobble.
 */
export const AMBIENT_SWELL_COUPLING = 0.006;
