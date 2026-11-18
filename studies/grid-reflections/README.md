# Grid reflections

Isolated comparison for the corrected **fixed 2D dot grid** direction. No production entry, legacy renderer, or previous study is changed. This is a direction study for review, not an approved replacement or a recovered reference algorithm.

## Run

From the repository root, with its existing pnpm dependencies installed:

```sh
pnpm exec vite --config studies/grid-reflections/vite.config.mjs --host 0.0.0.0
node --test studies/grid-reflections/field.test.mjs
pnpm exec vite build --config studies/grid-reflections/vite.config.mjs
```

Open `http://localhost:5178/` (strict port). The build is standalone `studies/grid-reflections/dist/index.html` plus relative `assets/`; serve the dist directory over HTTP. It has no portfolio/water routes or external asset requests. WebGL2 is required. No backend.

## Controls and paired captures

A: tone only, fixed diameter. B: tone plus size, neutral. C: identical B diameter and linear luminance, restrained warm/cool color. Click/tap the field to add a packet; focus the canvas and press Space or Enter for a center packet. Pause, clear, replay and moment selection are available. Secondary buttons/nonprimary contacts are ignored. User input while paused, hidden, lost or disposed is dropped.

```js
const study = window.gridReflections;
study.setScenario('overlap'); // quiet | single | overlap; resets tape, time=0, pauses
study.setTime(2.3);           // seconds; pauses and renders synchronously
study.setMode('B');          // A | B | C; does not change time, seed or events
study.hideControls(true);   // hides panel, leaves Show controls button
study.getState();           // source SHA256s, anchor hashes, params, events, timing
```

For canvas-only images use the canvas element screenshot. Suggested matched moments: quiet at 0, single at 1.1, three-source overlap at 2.3. Same times/modes must also use the same viewport and DPR. `setTime` evaluates the existing event tape directly, including future events only after their start. `replay()` restores the currently selected scenario's original tape, resets time to 0, and plays. `clear()` removes all packets at the current time and preserves mode/pause/ambient motion. `setPaused(boolean)` preserves clock and tape. `disturb(x,y,strength=.9)` takes normalized canvas coordinates, top-left (0,0). `dispose()` releases GPU resources/RAF and owned canvas/resize/visibility listeners; it is idempotent.

The shared event tape uses world height 2, positive Y up:

| Source | X | Y | Start seconds | Strength |
|---|---:|---:|---:|---:|
| 1 | -.28 | .08 | .4 | .9 |
| 2 | .30 | -.15 | 1.05 | .8 |
| 3 | -.05 | .38 | 1.55 | .7 |

Quiet uses none, single uses source 1, overlap uses all three. Manual input is bounded to 16 sources, dropping the oldest listed event when full. There is no per-frame randomness or source-dependent grid regeneration.

## Frozen coefficients and invariants

- Background `#f7f7fb` in all modes. Fixed planar square grid, 6 CSS-pixel spacing; seed 42 produces a small constant lattice-origin offset. Every point has Z=0. `gl_Position` uses the original position attribute directly. No camera motion, surface displacement, normals, reflection/specular lighting, textures, foreground objects or fluid solver.
- Grid regenerates only when canvas dimensions change. Same dimensions/seed reconstruct byte-identical Float32 positions; same-sized mode/time/input changes never modify them. `anchorHash`/`currentHash` expose this invariant.
- Smooth radial packet: regularized radius sqrt(r²+.012²), travel .48 world units/s, wavelength .24, Gaussian width .24, rise .12s, exponential decay .65/s, lifetime 8s with smooth final .5s taper. Signed cosine carrier; summed before `tanh(raw/.65)`.
- The resting field now draws **warped noise contours**, adapted directly from `src/engine/rippleFieldMaterial.ts` at commit `4841159`. Two-octave gradient-noise fBm supplies the height; two oppositely traveling two-octave fBm fields warp its sample domain. Offset `(137,219)` avoids the original hash's weak region around the origin. Level-set distance is `min(fract(height*8),1-fract(height*8))`, divided by the local unwarped gradient magnitude and `worldPerPx=2/CSSHeight`. A plateau/soft edge makes sparse outlined cells and quieter interiors. Scalar ambient is `-.24 + mask`, with mask in [0,1], before the existing cap and click sum.
- Shared `CONTOUR` config in `contour.mjs`: noise frequency1.5, detail/warp octaves2, levels8, width8.1 CSSpx half-width, edge.25, warp amplitude1.6/frequency.55/speed.23, time multiplier1.5. CPU implementation follows the same hash/noise/fBm/contour equations; shader functions are a literal adapted copy of the original engine and receive generated defines. `ambientAt(x,y,time,height=900)` and final optional `signalAt(...,ambient=true,height=900)` take CSS viewport height; pass the actual height for comparisons. GLSL uses the existing `uHeight` uniform. The method does not move grid anchors or warp click sample coordinates.
- **Width is approximate:** the inherited denominator omits the domain-warp Jacobian. It estimates screen distance from the unwarped noise gradient, so do not claim exact/even geometric line thickness. JS double precision and GLSL float hash/fract can diverge, particularly at large domain offsets; CPU tests establish scalar bounds/structure, not exact GPU pixel parity. Actual native browser review remains required.
- Signal s stays in [-1,1]. Linear ink luminance is `.44−.22s`, bounded [.22,.66]. A diameter is `.47×pitch`; B/C diameter is `(.47+.22s)×pitch`, bounded [1.5,4.14] CSS px. Thus nominal edge-to-edge gap is at least 1.86 CSS px. No negative radius, strength-dependent discard, or opacity disappearance.
- C tint is `.024 tanh(-.65x+.35y+.6s)` times vector `[1,.15,−(.2126+.7152*.15)/.0722]`. Its linear Rec.709 luminance delta is zero; channel spread is under .131 across the full allowed tint. Spatial left/upper warmer olive versus right/lower cooler teal varies gently with the field. B and C have identical scalar luminance, alpha coverage, size, grid, events, timing and background. Linear RGB is converted to display sRGB. Exact linear Y does not imply exact human perceived brightness across hues.
- Circular marks have identical edge antialiasing in all modes. Alpha is unit ink coverage away from the edge; smooth radial edge coverage is geometric antialiasing, not a field-driven alpha transfer. At minimum size mobile rasterization can soften tiny dots.
- DPR capped at 2; largest requested GPU point is 8.28 device px. Test browser supports range [1,1023], exposed in `getState().pointSizeRange`. Other hardware has not been validated.

## Lifecycle and verification limits

Animation stops when paused, document-hidden or context-lost. Resume resets the wall timestamp; per-frame delta is capped at .05s, so an overloaded software renderer can run the simulation slower than wall time. No real-device frame-pacing claim. Context restore retains time/events/anchors and rebuilds GPU state. Source and GPU resources are bounded. Document visibility handling is source-inspected; actual hide/show is not included in the owned browser evidence.

This study exposes a diagnostic global intentionally. Dispose does not remove panel button handlers/global API or make later state-mutating API calls immutable; discard/reload the study page after disposal. It is not a reusable production component. No IntersectionObserver/offscreen suspension is implemented because the study canvas occupies the viewport. WebGL initialization failure is not given a full production fallback screen.

The initial .008 chroma gain was too faint in native review; the coordinator authorized one C-only increase to .024. A/B field and transfer are unchanged. Initial images are preserved by the coordinator. This is a proposed warm/cool interpretation, not an extracted reference palette. Controls have minimum 44px heights and 12px labels.

Dev evidence source-revision fields were computed at Vite startup and became stale after HMR edits. Treat their behavioral checks as evidence, not their revision values as exact current-source provenance. The final build embeds fresh SHA256s; see `evidence/final-source-manifest.json` for the verified final files.

`evidence/tests-green.txt`: nine meaningful unit tests (the historical log predates the contour revision; rerun the command above for current results). `browser-checks.json`: same grid/time/tape across modes; pause, input drop, clear, replay and pixel-identical repeated render. `context.json`: forced loss/restore, dropped input, same clock/anchors, no shader errors, device point-size range. `input-dispose.json`: keyboard and primary-pointer input, rejected secondary/nonprimary contacts, double-dispose stops RAF. `build.txt`: standalone Vite build. CPU math tests and source inspection do not alone establish pixel identity between CPU and GLSL on every GPU. Root coordinator owns native paired capture and playback review under `output/playwright/grid-reflections/`.

## Continuous resting-motion revision — 2026-10-19

The user accepted the fixed-grid direction and requested basic surface movement. The former very quiet two-wave ambient has been replaced by the three traveling bands above. This modifies only the shared resting scalar: anchors, event tape, click equations, mode transfers and palette stay fixed. Pausing and deterministic seeking already control the shared time, so they also stop/replay the ambient exactly. Clear removes clicks while resting motion continues during playback.

Eight tests now pass, including a regression that failed with the previous ambient: at 0, 2, 8 and 30 seconds, a one-second step produces signal RMS change above .1 across the sampled field and substantial regions changing in both directions. A separate test checks analytic amplitude/time/spatial bounds and deterministic values at 500 samples. These checks establish nontrivial, bounded spatial motion; root's actual playback review establishes its visual suitability. The build passes. Earlier evidence files and `final-source-manifest.json` describe the accepted pre-ambient revision and must not be treated as the new source manifest; the coordinator owns fresh capture/provenance evidence for this update.

## Explicit-shape revision — 2026-10-20

The user requested more contrast and explicit shapes, pointing to their existing implementation. The original engine's contour method is reused in isolated `contour.mjs`; `src/engine/` is unchanged. Earlier sine motion was accepted but is now superseded for the resting scalar. The 2026-10-19 section above records the previous delivery; its sine-specific bounds and eight-test results are historical, not claims about this contour implementation.

Off-line raw ambient is -.24 (capped signal about -.353), and full stroke raw ambient is .76 (signal about .824). The existing transfer therefore produces lighter/smaller interior dots and darker/larger stroke dots without changing its coefficients or C palette. Existing click sources still sum before the cap, with no new gradient coupling, source events, displacement or opacity lift. Strong strokes may reduce incremental positive-click contrast where they overlap; default click readability is a visual gate, not guaranteed solely by the math.

Nine current tests pass: prior anchor/signed-click/transfer/replay checks, bounded sparse contour occupancy and temporal reshaping, viewport-aware distance scaling, and unchanged click-only response across viewport heights. Build passes. Six noise evaluations replace three sine evaluations per point, so software/mobile performance must be observed. The copied shader's original explanatory comments record its author intent, not independently verified claims about physics, exact width or native appearance. Vite's revision manifest now includes `contour.mjs`. Earlier source manifests remain historical; coordinator owns current native capture, source hashes and the preserved before artifact.
