# Fixed-grid reflection study: independent review

2026-10-18 · Final source/math review PASS; visual direction remains for user review. Reviewer owns this report only; no production edits or new browser session.

## Scope and acceptance gates

The corrected direction is a fixed two-dimensional grid whose points communicate liquid reflection features through brightness, size and subtle color variation. A continuous displaced surface is outside this study. Earlier surface acceptance does not establish acceptance of this direction.

- Verify point anchors stay fixed in XY and Z across time and variants, including CPU buffers and shader position transforms. Point-size changes may alter footprint, but must not relocate anchors.
- A: brightness; B: size plus brightness; C: size plus brightness plus subtle color. All use identical wave sources, phase, simulation time, seed and camera/grid configuration. Differences must be attributable to declared display channels.
- Verify finite, bounded brightness, point size and color, including overlap and quiet states. Account for pixel ratio and point-size hardware limits; distinguish numeric bounds from actual visual legibility.
- Verify deterministic replay/reset, fixed source ordering, no unseeded randomness or wall-clock drift in controlled comparisons, and inspect meaningful test evidence.
- Verify bounded source/geometry ownership and pause/visibility/context/disposal behavior appropriate to this isolated study. No lifecycle claim based solely on still screenshots.

## Status

`studies/grid-reflections` did not exist at first inspection. Implementation and evidence are pending. This is a reviewable study before integration, not user acceptance of a final visual direction. Final verdict will distinguish source/test results, attributed browser evidence and remaining visual judgment.

## Emerging source and math review

Read `field.mjs`, `shaders.mjs`, `main.mjs`, HTML and CSS. Independently ran `node --test studies/grid-reflections/field.test.mjs`: 5/5 pass.

Point anchors are created once per viewport resize from a regular six-CSS-pixel grid with one seeded global XY offset. Every Z coordinate is zero. Shader `gl_Position` uses the unchanged position attribute; time and mode affect only ink and point size. Orthographic camera maps grid units to CSS pixels. Resize intentionally rebuilds the grid; fixed-anchor comparison therefore requires identical viewport dimensions. The CPU buffer hash alone would not prove shader invariance, but source inspection of the final position expression does.

All variants run the same ambient field and signed radial packet expression at the same uniform time/source array. Smooth logistic shader cap is algebraically tanh, matching CPU reference up to floating-point evaluation. Mode switching changes the transfer only. A diameter is 2.82 CSS pixels; B/C are bounded 1.5–4.14 CSS pixels with six-pixel center spacing. This leaves at least 1.86 CSS pixels between ideal neighboring footprints. Device pixel ratio scales both rasterization and size consistently, capped at 2. Hardware point-size range evidence requested; maximum requested size is 8.28 device pixels.

Ink linear luminance is .44−.22s, bounded .22–.66. C adds bounded tint along [1,.15,−(.2126+.7152*.15)/.0722], preserving weighted linear RGB luminance exactly in reference arithmetic. Its maximum channel spread is under .044 and channel values remain in [0,1] for every saturated signal and bounded tint. C retains B point size and coverage. Output quantization, color conversion and blending mean this is not a promise of identical displayed perceptual lightness. No lighting normals, mesh displacement or color-based anchor movement appears.

Replay replaces events with copies of a fixed tape, resets time, and uses no wall-clock input to the field except live simulation advance. Explicit setScenario/setTime provides repeatable paused comparison; exact repeated image equality remains a browser evidence gate. Time advancement clamps to .05 seconds per frame, so live playback speed can differ from wall time on a slow renderer. Source uniform capacity is fixed at sixteen. Geometry changes on resize only.

## Concrete protocol findings sent to owners

- At this inspection, study canvas has no keyboard focus or Enter/Space input path, although the protocol requests keyboard validation. Engine asked to correct.
- `overlap` tape has three scripted sources; protocol currently says two. Align or explicitly label before interpreting captures.
- Dispose cancels RAF, disconnects resize observer, removes rendering input/visibility/context listeners and disposes GPU resources, but study UI handlers remain attached and public mutators may still update UI state. Do not describe this as a completely reusable controller teardown. No post-dispose render/RAF resurrection found because draw/canRun guard disposal.

No anchor/field/transfer blocker found. Keyboard/protocol follow-up and owner browser evidence are pending; no final visual-direction approval is implied.

## Follow-up and attributed browser evidence

Keyboard input is now implemented with canvas tabindex and scoped Space/Enter handling; disposal removes that listener. Pointer input now filters nonprimary and non-left-button events. Protocol was corrected to three overlapping ripples, matching the tape. These resolve the initial keyboard/protocol gaps.

Read implementer `browser-checks.json`, `context.json` and `input-dispose.json`. They report pause freeze, rejected paused input, clear preserving time, fixed replay and exact pixel repeat; context loss blocks input and restoration preserves clock/anchors; keyboard center impulse and primary pointer mapping; disposed no pending RAF. Point-size range [1,1023] supports the study's maximum requested 8.28 device pixels on this renderer. This reviewer did not execute the browser actions. Source inspection supports hidden-tab suspension/reset logic; this is distinct from browser verification of visibility.

Found a provenance limitation: `__GRID_REVISION__` is computed when Vite loads its configuration, so HMR-updated main/HTML can retain startup hashes. Some lifecycle JSON reports main `716e4c...` while inspected updated main hashes `0b53da...`; HTML differs too. Owners notified to restart/rebuild for a final bounded check or explicitly annotate stale metadata. This does not invalidate unchanged field/shader comparisons; it prevents claiming lifecycle records identify exact final input source without qualification.

## Independent capture-metadata validation

Independently parsed coordinator `output/playwright/grid-reflections/capture-manifest.json`: all eighteen records form six valid A/B/C groups. Within each group time, events, parameters, viewport and grid metadata match exactly; every record has invariant anchor hashes, Z=0 and no recorded shader errors. All field/shader hashes match current source. Desktop has 36,000 points; mobile 9,100. Quiet uses time0/no scripted events, single time1.1/one event, overlap time2.3/three events. These are evidence-control checks, not this reviewer's native-image or motion judgment. Root owns native visual comparison and presentation to the user.


## Final authorized C revision and verdict

Coordinator authorized one C-only chroma gain increase from .008 to .024 after native review found the original color benefit unresolved. The earlier .044 channel-spread bound applies to the initial version only. Final tint preserves the same zero-linear-Y axis; diameter, brightness transfer, field, timing and fixed anchors remain unchanged. Final conservative linear RGB bounds are approximately [.113668,.766332], with channel spread below .130332. No gamut clipping is required by the transfer. This does not establish that the color is aesthetically subtle on every display.

Independently reran final tests: 6/6 pass, including saturated-tint gamut and B/C equal-luminance/size checks. Independently recomputed all seven SHA256 entries in `studies/grid-reflections/evidence/final-source-manifest.json`; all match current files. GPU range is now cached before context loss. README and report23 explicitly disclose stale HMR revision fields in earlier browser evidence, resolving the provenance overclaim concern through accurate labeling. Final static-build captures remain coordinator-owned; initial eighteen-state validation above refers to the initial .008 comparison, not final C pixels.

**Verdict: PASS for the isolated fixed-anchor A/B/C study's source/math controls, deterministic field/replay design, bounded transfers and documented study lifecycle scope. No remaining blocking source finding.** Source tests and manifest verification were independently executed; browser lifecycle evidence is attributed to the implementer; native final image/motion judgment belongs to coordinator and user. This is readiness for review, not approval to integrate or a declaration that the user has accepted the palette.

Remaining limits: resizing rebuilds anchors; software-renderer playback uses a capped simulation clock; exact linear luminance does not guarantee perceptual equivalence; hidden-tab handling is source-reviewed here rather than independently browser-tested; study UI handlers remain attached after renderer disposal, so this is not a reusable production lifecycle contract. No production code edits or browser session were performed by this reviewer.

## Attributed final confirmation closure

Read coordinator final `output/playwright/grid-reflections/integrity.json`, `confirmation.json` and `touch-keyboard.json`. They record final-source hash agreement across all eighteen captures, exact pixel parity for all twelve A/B images against the initial batch, and an exact final C repeat. Final pause holds pixels, mode switching preserves time/anchors, and clear preserves pause/mode. At 390×844, recorded controls have 44px heights, remain in bounds and produce no horizontal overflow. A fresh emulated-touch/reduced-motion context starts held and accepts explicit touch and scoped Enter input; this is not physical-device testing.

Coordinator reports actual C playback capture and decoding. Its final native visual judgment is that B provides the strongest structure, while C adds discernible muted warmth; the proposed cool-reflection benefit remains tentative. This reviewer did not independently play the clip or substitute a visual approval for that attributed judgment. Final comparison is ready for user review; no production integration or user preference acceptance is implied. Source/math PASS above remains unchanged.
