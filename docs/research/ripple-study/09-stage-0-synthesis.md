# Stage 0: a trustworthy surface baseline

17 October 2026 · Coordinator synthesis · Fixed-time study completed; continuous-motion quality and final water-surface design remain open.

## Purpose and scope

The goal is a convincing water-like ripple surface on its own. Boat, bird, rock and other objects are excluded. This study isolates the current renderer's layers before changing its wave model or visual mapping. The portfolio and existing engine source remain unchanged.

A separate runnable study now controls seed, time, scripted inputs, automatic events and foreground context. Four conditions share the same geometry and potential event tape: C00 neither layer; C10 ambient only; C01 automatic ripples only; C11 both. Current material, source buffer, budgets and constants are reused without retuning.

## Evidence and verification

- 32 primary field captures: four conditions × four checkpoints × desktop/mobile layout.
- 16 repeat captures after later/earlier seeks and a condition detour: all 16 match exactly in decoded RGB pixels.
- Eight corrected foreground captures with settled fonts/layout, equal safe bounds within each viewport, and unchanged state during capture.
- Eight meaningful replay/seed/metadata tests pass. Study and portfolio TypeScript checks and production builds pass. Vite reports a >500 kB chunk advisory; this study is not bundle-optimized production delivery.
- All 56 active manifests have source hashes matching disk; no browser console/page errors in the capture run.
- Independent review also cross-checked 120 replay states against the actual engine buffer's Float32 values. Verdict: PASS for bounded fixed-time comparison validity.

Environment: Chromium 149.0.7827.55; ANGLE/SwiftShader software renderer; requested/applied DPR 1. Desktop 1440×900 uses 36,000 points; mobile-layout 390×844 uses 9,100 points. This is appearance/state evidence, not a test on a mobile GPU or a hardware-performance result.

## What the current layers contribute

The quiet lattice is visible with neither layer. Ambient introduces winding, branching contour modulation. Automatic events add localized broad curved bands. Together they combine those patterns; in crowded burst states, stronger coverage and large/near-merged dots can make separate fronts harder to distinguish. These are sampled-image observations, not a measured perceptual score.

At t=8 with no scripted impulses, mean darkness relative to background is:

| Viewport | Neither | Ambient only | Auto only | Both |
|---|---:|---:|---:|---:|
| Desktop | 0.010441 | 0.013062 | 0.011911 | 0.014718 |
| Mobile layout | 0.010307 | 0.013137 | 0.013465 | 0.016752 |

Darkness uses normalized display-encoded Rec.709 luminance relative to #f7f7fb. Larger values mean darker pixels, not deeper water, stronger displacement or better quality. Ambient's late contrast is larger on desktop; auto's late contrast is larger on mobile layout. Neither layer dominates universally. Combined darkness is modestly more than additive in these sampled groups; saturation, blending, ambient coordinate coupling and source replacement can all contribute. Causation is not isolated by this metric.

At the burst checkpoint t=3.81, auto-off has 18 historical events and auto-on 20; both retain 16 source slots. Thus automatic events can change which scripted events survive. The potential tapes and logical/actual slots are preserved so this interaction is inspectable rather than hidden.

## Issues resolved during review

The harness now canonicalizes inactive source payload, rejects incompatible saved experiments, and resets manual-input cadence after seeking. Those fixes are study-local. An initial font/layout timing mismatch invalidated first-pass foreground pairing; only those eight captures were replaced. Superseded frames are archived separately and excluded. A preview-based concern about clipped mobile text was withdrawn after native-pixel inspection; no clipping defect is established.

## What this does not settle

Fixed-time repeatability does not establish smooth front travel, fine-texture flicker stability, perceived water depth, motion distraction, user preference or hardware speed. The stepped sequence in the manifest validates state only. Continuous-motion assessment is explicitly deferred to the next surface trial and must include this baseline alongside candidates; broader motion-quality acceptance is not complete.

The reference's original implementation remains unknown. Current renderer code uses planar point XY/size/tone modulation, positive analytic swells and noise contours. More or darker dots alone cannot establish a continuous shaded water surface. Optional Resume shots confirm bounded static context pairing; they are not a reading study, production integration or accessibility audit.

## Next discriminating study

Two explanations remain viable: the field lacks useful crest/trough dynamics, or the current size/opacity transfer obscures relief already present in the field. The independent visual reviewer recommends testing the second explanation first. That changes fewer mechanisms than replacing the wave field and gives the simpler hypothesis a fair test.

1. **Transfer diagnostic first:** hold the current scalar field and single/pair event tape fixed; disable ambient/auto confounds. Compare current size/opacity mapping with directional slope-to-tone shading from the same field treated explicitly as a height proxy. Inspect undithered output, native point scale and continuous playback, with mean coverage recorded. This is a test of relief cues, not a declaration that the proxy is physical height. No new solver, dither method or object is needed.
2. **Wave-profile diagnostic if needed:** hold rendering fixed and compare the current positive bump with a signed, damped traveling wave train. Inspect isolated impulses, delayed overlap and repeated disturbances in continuous motion. This asks whether crest/trough evolution supplies a missing surface cue that shading alone could not resolve. Signed waves are a candidate, not the selected implementation.
3. **Texture diagnostic after macro-form works:** on the same shaded output, compare fixed ordered versus fixed noise thresholds while holding palette, output size and cell scale constant. Texture should describe the surface rather than conceal a failed field or shading model.

Only introduce a stateful height-field solver if these simpler candidates fail a defined behavior requirement (for example persistent interaction or later obstacle boundary response). A solver is not justified by the reference's appearance alone. Object rendering and homepage integration remain later work.

Advance based on coherent traveling fronts, intelligible overlap, tonal depth, stable fine texture and responsive input, with reduced-motion behavior and declared real-device budgets. Record continuous clips and real-hardware profiling before making motion/performance claims; do not select a winner from darkness metrics or a single attractive still.

## Review materials

- `studies/ripple-baseline/README.md`: run/build commands, controls, scenarios and automation API.
- `output/playwright/stage-0/index.html`: linked comparison viewer; native PNGs preserve texture evidence.
- `capture-manifest.json`, `image-metrics.json`: exact state and decoded-image measurements.
- Reports 04–08: implementation, protocol, reference rubric, independent validity review and surface observations.

The baseline is ready for controlled surface experiments. No final water algorithm, new dither pipeline or portfolio opening has been selected or implemented.
