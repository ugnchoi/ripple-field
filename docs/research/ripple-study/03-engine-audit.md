# Current-engine audit and controlled comparison plan

Research only · 2026-10-16 · source inspection, no application edits, installs, browser sessions, or runtime performance measurements.

## Finding and evidence scope

The present field is a single orthographic `Points` object with procedural per-vertex evaluation: positive expanding swell bands layered over animated domain-warped noise contours. It is not a time-stepped water simulation, a signed interference model, or a screen-space dithering pipeline. These are high-confidence conclusions about this checkout's code, not claims about the Instagram reference's provenance. No reference frames were inspected for this report; temporal/reference interpretation belongs to the reference-forensics report.

Code citations below use repository-relative paths and current line numbers. Equations are transcriptions of source behavior, not measured visual outcomes. Existing phase documents describe intentions and earlier states; they do not establish that their acceptance criteria were measured or met.

## 1. Exact current mechanism

### Swell profile and time

`src/engine/rippleFieldMaterial.ts:353-411` evaluates up to 16 analytic sources independently at each point. For age `t = uTime - startTime`:

- Radius is `0.84t` world units; strength does not change propagation speed (`rippleFieldMaterial.ts:357-363`; `constants.ts:15-22`). The orthographic frustum spans two world units vertically (`bootstrapRippleField.ts:157-170`), so nominal radius speed is `0.42 × viewport-height` CSS px/s. This is NOT constant CSS-pixel speed across viewport heights.
- Strength is clamped to `[0.08, 1.5]`. Width begins at `0.075(1 + 0.52s)`, tightens with age by `0.4 + 0.6/(1 + 2.35t)`, then receives source-hash variation and a further strength term (`rippleFieldMaterial.ts:370-382`; `constants.ts:61-83,149-153`). Auto and key inputs apply additional width multipliers.
- Distance is evaluated in statically warped XY, plus an ambient-gradient offset. A per-point/per-source angular perturbation modifies distance from the ring (`rippleFieldMaterial.ts:317-323,339-347,365-384`). This is not a perfectly circular continuous wavefront: random point seeds affect both the domain and contour perturbation.
- With `z = delta/wEff`, the spatial profile is `(0.48 exp(-0.5(z/2.35)^2) + 0.52 exp(-0.5z^2)) × (0.62 + 0.38/(1 + 0.22z^2))` (`rippleFieldMaterial.ts:386-396`; `constants.ts:49-59`). `SWELL_WIDE_MIX`'s comment says mix toward the wide cushion, but GLSL `mix(gw, gn, 0.52)` weights the narrow term by 0.52. Use the expression, not the comment, when varying it.
- Temporal amplitude is `exp(-0.98t²/(t + 0.46/(1 + 0.42s)))`; bump is `s × spatial × temporal` (`rippleFieldMaterial.ts:398-402`). Each source produces one positive band with tails, not a train of alternating crests and troughs.
- Important comment discrepancy: `constants.ts:64` describes strength slowing fade, but increasing strength decreases `softTail`, which makes the *normalized* temporal envelope decay faster for fixed positive age. Larger initial amplitude and width can nevertheless keep stronger sources above a visibility threshold longer. Perceived persistence needs measurement; it cannot be attributed to slower envelope decay.

### Overlap and displacement

Positive bumps sum into `fieldSum`; outward direction vectors multiplied by bumps sum into `accDisp` (`rippleFieldMaterial.ts:401-411`). Safe-zone attenuation precedes separate tanh caps (`:414-429`). The displacement cap uses `k=2.75`, then multiplies by displacement scale `0.009` and global scale `0.92`; the scalar cap uses `k=1.02` and drives point size AND tone/opacity (`constants.ts:34,70-74,164`; `rippleFieldMaterial.ts:417-430,502-513`).

Thus overlap can darken/enlarge dots toward saturation while opposing vectors cancel displacement. Cancellation of position is not destructive interference of the scalar field. Source profiles and speeds do not change after collision. There is no neighbor exchange, velocity buffer, boundary reflection, diffusion, or evolving height state in these files. The design phrase “pooled pressure” in `docs/02-phase-2-motion-language-and-pressure-blending.md` is an intended appearance, not a physical model.

The source buffer reuses the oldest start-time slot once full; sources are never expired by age (`swellSourceBuffer.ts:30-74`). Consequently, after 16 lifetime spawns all 16 loop slots remain active until overwritten or cleared, even when visually negligible. Dirty gating avoids CPU array copies until spawn/clear (`swellSourceBuffer.ts:77-99`); this alone does not demonstrate that the renderer avoids all GPU uniform uploads on every draw.

### Ambient field, already present

This is not a blank lattice between user clicks. `ambientSurface` produces evenly spaced height contours from animated domain-warped gradient noise (`rippleFieldMaterial.ts:166-307`). Two warp fBm components move in opposing directions; a two-octave height fBm is sampled in the resulting domain (`:220-248,272-282`; `constants.ts:314-375`). Defaults: noise frequency 1.5, 8 contour levels, line half-width 8.1 CSS px, edge fraction 0.25, warp amplitude 1.6, warp frequency 0.55, warp speed 0.23, time multiplier 1.5.

`fract(height × levels)` folded to nearest band edge determines contour distance. Division by the height gradient and world-per-pixel factor approximates a CSS-pixel stroke width (`rippleFieldMaterial.ts:287-300,341-344`). The gradient omits the warp Jacobian, explicitly acknowledged in source (`:302-306`), so this is approximate distance compensation, not exact equal-width geometry. Static per-point evaluation warp also perturbs sampled contours.

Ambient contours enlarge dots by up to `1.3 × ambH` CSS px, darken via coefficient 0.26, and raise opacity via 0.55; smooth-height gradients drift XY by scale 0.0016 and offset swell evaluation coordinates by 0.006 (`constants.ts:281-302,382`; `rippleFieldMaterial.ts:339-347,423-441,502-513`). Neither ambient nor swells change Z. Apparent depth, if perceived, comes from XY/size/tone and optional polish, not a displaced 3D surface.

Comments in `constants.ts:253-266,326-353` quote sweep speeds, changed-dot fractions, and merging thresholds. Their measurement harness, device, sample set and artifacts are not established here. Treat them as historical tuning notes, not freshly verified measurements or general guarantees.

### Point rendering and reproducibility

Geometry is a rectangular row/column lattice with odd-row stagger and per-point position jitter; every point is at Z=0 (`createPointGridGeometry.ts:24-76`). Defaults: stagger half a cell, jitter range ±0.06 cell per axis, base point size 3.2 CSS px, base opacity 0.215 (`constants.ts:90-109`). Odd rows compress their horizontal span, so stagger is not a perfectly uniform hexagonal lattice. Edge jitter is not clamped back inside the frustum despite the constants comment claiming containment.

`aSeed = Math.random()` is generated anew on geometry rebuild (`createPointGridGeometry.ts:59-70`). The fixed `FIELD_VARIATION_SEED = 47.17` therefore does NOT make side-by-side sessions reproducible; it is only one input to procedural variation. Resizing can rebuild and reroll the field (`bootstrapRippleField.ts:130-141,174-178`). Auto timing, positions and strength jitter are also unseeded (`bootstrapRippleField.ts:76-78,219-239`).

Point diameter is base + capped-swell gain (6.4 CSS px per field unit) + ambient gain + tiny rest-size variation, multiplied by applied DPR (`rippleFieldMaterial.ts:435-443`; `bootstrapRippleField.ts:143-154`). The sprite has seed-driven anisotropy and a soft circular alpha edge; increased field makes it darker and more opaque (`rippleFieldMaterial.ts:488-514`). Transparent material disables depth writes/tests (`:580-582`). The renderer clears to `#f7f7fb`, with dot diffuse `#68687a` (`bootstrapRippleField.ts:50-51`; `rippleFieldMaterial.ts:543`). There is no threshold matrix, error diffusion, quantization pass, framebuffer feedback, or postprocess pipeline here. “Dither-like” can describe an appearance; it does not identify this algorithm as dithering.

### Interaction and autonomous events

- Window `pointerdown`, including foreground content, creates a swell. There is no mouse-move ripple or pointer-pressure mapping. Pointer strength is `0.85 × U[0.94,1.06]`; throttle is 0.056 s (`bootstrapRippleField.ts:276-295,350-354`; `constants.ts:185-191,226`). All pointer buttons/types are accepted by this handler.
- Keyboard swells occur at the LAST POINTER-DOWN location, initially world center; hovering does not update it. Repeat, Meta/Ctrl/Alt combinations, input and textarea targets are excluded; other keys/targets are not filtered. Strength is `0.38 × U[0.95,1.05]`, width is 0.92 of default, throttle 0.16 s (`bootstrapRippleField.ts:57,298-321`; `constants.ts:182,188,194`). Contenteditable and select targets are not explicitly excluded.
- Five auto events are scheduled at sorted random offsets within each 10-second clock window; positions cover the viewport uniformly and strength is `0.44 × U[0.93,1.07]`, width scale 0.94 (`constants.ts:196-209`; `bootstrapRippleField.ts:219-259`). This is NOT a fixed two-second cadence. A skipped whole window is not replayed, but overdue offsets in the current window can be emitted in one frame.
- Legacy demo controls have separate click handlers that could add a second swell on top of global pointerdown if those IDs existed (`bootstrapRippleField.ts:324-338,356-359`). Current `App.tsx:1-3` renders Resume; the quiet/polish/demo IDs are absent from the inspected current UI. Quiet/polish query bindings are therefore inactive in this integration, with normal intensity and polish off (`bootstrapRippleField.ts:42-43,90-124`).

### Foreground safe zone and reduced motion

Only the first `[data-ripple-safe="primary"]` is used, currently the resume `<main className="sheet">` (`bootstrapRippleField.ts:126-128`; `src/resume/Resume.tsx:187`). Its clipped DOM rectangle maps to world XY; bounds are read every animation frame, but uniform writes are suppressed when the rounded bounds key is unchanged (`bootstrapRippleField.ts:183-217,361-368`; `worldFromPointer.ts:29-59`). This is one rectangle, not multiple text-aware masks. It can cover most/all of the viewport during scrolling through a long sheet.

Shader attenuation is 0.38 inside with an outward world-space feather of 0.11; it affects ambient modulation/gradient and swell field/displacement, not base resting-dot opacity or base size (`constants.ts:176-179`; `rippleFieldMaterial.ts:325-345,414-441`). Quiet mode, if a control is added later, additionally scales global modulation by 0.62 and overall opacity by 0.78 (`bootstrapRippleField.ts:90-98`). Safe-zone attenuation is not a guarantee of text readability; current foreground CSS compositing and actual content need separate viewing tests.

Reduced motion disables ambient evaluation and auto-spawns and forces polish off, then recomputes performance budget (`bootstrapRippleField.ts:109-117,242-245,343-347`). It DOES NOT disable manual pointer/key swells, clear existing sources, freeze `uTime`, or stop requestAnimationFrame (`:276-321,361-369`). This distinction should be an explicit study condition rather than calling the mode static.

### Performance architecture and limits

The bootstrap constructs one Points object, one ShaderMaterial, and performs one scene render per RAF, with no custom render targets/postprocess (`bootstrapRippleField.ts:45-55,130-141,361-371`). There is no frame-time-based adaptive controller, explicit visibility/offscreen pause, context-loss fallback, or teardown in this file. This is a bounded analytic-source design, not measured proof of smoothness.

`resolvePerformanceBudget.ts:56-91` uses viewport CSS area, optional device memory and reduced-motion preference:

| Tier | Selection before narrow-screen adjustment | DPR cap | Target point ceiling |
| --- | --- | --- | --- |
| full | Default | 2 | 62,000 |
| balanced | Memory ≤4 GB OR CSS area >2,520,000 | 1.5 | 48,000 |
| efficient | Reduced motion | 1.25 | 36,000 |

Width <640 promotes full→balanced, otherwise →efficient (`:68-70`). Thus narrow screens are NOT invariably efficient. Density starts from `round(width/6)` columns, clamped 40…512, then decremented by four to fit the point ceiling; rows are at least 56 (`:27-45,81-91`). The 40-column floor can override the ceiling at pathological aspect ratios. Six-pixel spacing is approximate, and budget clamps or the row floor change it. At larger viewports contours and swell widths also scale differently: contour width is CSS-pixel compensated; swell width/speed are in world units.

`docs/06-phase-6-performance-hardening.md:127-148` is stale in its fixed-244/88%/72% column description and narrow-screen tier statement. Read current code as authority. GPU work scales with vertices × active source slots plus ambient noise evaluations, with sprite overdraw dependent on point sizes and DPR. Profile these separately; CPU dirty-array copies are unlikely to describe the whole cost.

## 2. Hypotheses, alternatives, and uncertainty

| Claim/hypothesis | Evidence for | Strongest alternative / evidence against | Confidence; next discriminator |
| --- | --- | --- | --- |
| Present contours could contribute to a nested organic ripple appearance | Existing warped-noise level sets and ambient time evolution | Reference could use signed waves, surface normals, or a moving threshold field; these need different causal behavior | High for local mechanism, unestablished for reference; compare tracked contour topology and response to controlled impacts |
| Current positive swells may look too uniformly outward or cushioned relative to reference | Single positive analytic band; no signed field or interaction state | Tone/size mapping and ambient coupling may dominate the perceived difference more than the underlying field | Hypothesis only; hold mapping fixed while comparing field families, then hold field fixed while comparing mappings |
| Stronger swells appear longer-lived | Larger initial amplitude and width can sustain visibility | Normalized decay actually becomes faster with strength, contrary to the comment | Medium mathematical inference, no perceptual measurement; equal-normalized-amplitude decay plots plus thresholded visibility duration |
| Performance pressure may be vertex-shader dominated | Up to 16 sources plus repeated procedural noise per point | Large translucent sprites/DPR could make fragments/overdraw dominate; software rendering differs materially | Unmeasured; separate GPU/CPU timings and vary point count versus sprite size/DPR independently |

No implementation is preferred at this stage. Prior conversational assumptions unavailable in the brief cannot be audited verbatim; the mechanism and comment discrepancies above are concrete checks against commonly implied claims. The most consequential unresolved issue is whether the reference's appearance is driven primarily by field dynamics, transfer function, or sampling—not whether one familiar shader recipe is plausible.

## 3. Proposed controlled comparison, after evidence gate

This is a protocol proposal, not code added during this audit. Obtain coordinator agreement on reference observations and practical budgets before building a study harness.

### Reproducible baseline and stimuli

1. Pin commit, browser/Three.js version, hardware/GPU, viewport CSS dimensions, DPR/capped DPR, tier and color settings. Store exact geometry positions/seeds, source event list, uniform values and clock samples. Disable spontaneous randomness for scripted trials by replaying recorded events; use the same geometry for all paired variants. Fixed hash constants alone are insufficient.
2. Separate three exposures: isolated field on identical paper; field behind the unchanged resume; reduced-motion behavior. Lock global intensity, safe rectangle and polish off unless they are the variable. Keep a full unmodified-current-engine recording as an ecological baseline, in addition to controlled replays.
3. Sample at exact fixed times, e.g. 0, 0.25, 0.5, 1, 2, 4, 8 seconds and a deterministic 60 Hz sequence. Real-time recordings are a separate performance test; fixed-clock screenshots do not measure smoothness.
4. Replay: (A) ambient-only for 20 s; (B) one center event at t=0, strengths 0.38/0.85 in separate runs; (C) two sources at world X ±0.45, Y=0 at t=0, then a delayed-pair condition with second at 0.5 s; (D) repeated same-center input at 0.16 s for 3 s to stress saturation/recycling; (E) prescribed source near viewport edge; (F) fixed recorded five-per-10-second event sequence; (G) scroll/resize plus foreground clicks and keyboard input. In an isolated study, allow signed source events only as a declared candidate factor, not as a silent baseline change.
5. Test 1440×900 and 390×844 CSS px, DPR 1 and 2 with actual caps logged; add a real integrated GPU and mobile device for performance decisions. Emulator screenshots/software rendering establish appearance/debugging evidence, not mobile performance.

### Small staged matrix: change one mechanism family at a time

| Stage | Independent variable | Controlled quantities | Discriminating outcome |
| --- | --- | --- | --- |
| 0 | Ambient on/off; auto replay on/off (2×2 ablation) | Current swell and mapping, same event locations/times | Which existing layer contributes contour complexity and distraction? |
| 1 | Current positive bump vs normalized signed damped radial train vs a stateful wave candidate, only if reference warrants it | Equal initial visible extent, front speed, approximate peak contrast, identical mapping and stimuli | Does crest/trough behavior, collision persistence or topology better match trustworthy reference observations? |
| 2 | Current contour transfer vs continuous height transfer vs threshold/halftone transfer | Same scalar field samples and motion; common mean luminance/coverage where possible | Is appearance explained by mapping rather than dynamics? Thresholding is a candidate, not reference attribution. |
| 3 | XY displacement only / size only / tone+opacity only / current combined | Same field, lattice and event list | Which channel carries the wanted effect and which causes merging or visual instability? |
| 4 | Selected contour level count, stroke width and time multiplier, each swept separately around baseline | All other parameters, exact geometry/time and mean ink coverage recorded | Locate aliasing/distraction tradeoffs; do not change all three simultaneously. |

Avoid a full combinatorial sweep. Use 0 to identify confounds; compare at most three candidates in 1 and 2; carry two forward for foreground/performance tests. A stateful candidate adds resolution, time-step and boundary conditions as confounds, so document them and separate equal-appearance from equal-cost comparisons.

### Measurements and decision criteria

- **Temporal/shape:** radius versus time, radial band count and signed profile where available, half-height width and decay curves, contour component count/closure/merging, front curvature, and continuity before/after overlap. Record measurements in world units and CSS px. In the reference, use only visible image-derived quantities with uncertainty; do not infer hidden signed height from dark bands.
- **Sampling/visual:** luminance/ink coverage distribution, active-dot fraction, nearest-neighbor dot-gap distribution, fraction of adjacent sprites merging, per-dot size change over 100 ms/1 s, optical-flow speed and frame-to-frame luminance differences. Register captures and crop away UI/video compression borders. Match crop scale; compression and dot-lattice differences limit direct pixel metrics.
- **Foreground:** blinded randomized A/B clips, same resume and stimuli; assess motion character, distraction, and reading/task accuracy separately. Predefine task and audience; preserve resume facts and functions. A visual preference does not override reduced-motion or functional regressions.
- **Performance:** after warm-up, capture at least three 30-second runs per candidate/device under idle, two-source and saturated-source replay. Report median/p95/p99 frame interval, missed-frame fraction, longest stall, CPU scripting/render submission and GPU time where supported, point count/DPR and draw calls. GPU timer disjoint samples must be excluded. Record missing timer support rather than treating RAF timing as GPU timing.
- **Proposed gates (ratify before trials):** zero resume interaction/fact regressions; reproducible paired captures; no automatic animation under reduced motion; explicit user decision on whether manual reduced-motion swells remain. For a declared 60 Hz target, aim p95 frame interval ≤18 ms and <1% intervals >33.3 ms on agreed real hardware, with no >10% p95 regression against current baseline. If baseline already fails, report that and agree an absolute device budget rather than legitimizing the failure by comparison.
- **Selection:** advance only candidates improving the specific observed reference traits and foreground task results without failing agreed performance/accessibility gates. Keep current engine if alternatives fail. If subjective ranking is inconsistent or matched-tone comparisons erase the effect, return to mapping/measurement rather than committing a simulation rewrite. Sample size and practical preference margin must be set before participant trials; a single reviewer is exploratory evidence.

## 4. Audit limitations and next discriminating step

This report verifies source behavior, not rendered pixels, build success, frame rates, or reference implementation. No tests were installed/run because no application change was made and this assignment is browser-free. Existing phase acceptance language, source tuning comments, and analytic ceilings are not runtime evidence.

Next: reconcile this audit with independently observed reference frames, then approve a deterministic baseline/ablation study (Stage 0). That resolves how much of the perceived gap is already attributable to ambient contours, random auto events and transfer channels before choosing any replacement field model.
