# Stage 0 comparison review protocol

2026-10-17 · Protocol only. No study execution, implementation review, browser use or new literature search performed. Scope follows `STAGE-0.md`; implementation review requires a later handoff. This protocol evaluates contributions of existing layers, not reference fidelity or a new rendering method.

## 1. Question and experimental unit

Use one deterministic scene state as the unit of comparison: exact geometry, seed, viewport, clock time and scripted event tape. Render it in four conditions:

| ID | Ambient | Automatic events |
|---|---|---|
| C00 | Off | Off |
| C10 | On | Off |
| C01 | Off | On |
| C11 | On | On |

“Auto off” must omit only the automatic events; it must not reseed geometry or regenerate the scripted pointer/key events. Generate the potential auto tape once, retain it in all exported manifests, and record which events were enabled. “Ambient off” must disable the ambient contribution, including its coordinate coupling to swells, according to the existing engine control. Report the exact control used. Consequently the ambient factor can affect swell position as well as background appearance; it is not necessarily an additive visual overlay.

Polish remains off; global intensity, strength/width parameters, transfer functions, safe-zone policy, camera, palette, sampling budget and event order remain fixed. No source retuning or mean-luminance matching during the primary comparison: coverage changes are outcomes. A second geometry seed is diagnostic only if the initial result hinges on one local pattern.

## 2. Preflight: reject confounded pairs before scoring

For every capture export the exact engine parameters, seed and PRNG identity, geometry hash, event tape, enabled factors, selected time, source state/capacity, viewport CSS dimensions, requested and applied DPR, framebuffer dimensions, point count/budget, context mode/safe bounds, browser version and renderer identity. Include commit or file revision identity and declared harness differences. A seed string alone is insufficient evidence of identical geometry.

Check the following before interpreting images:

1. Geometry hashes, scripted event tape, parameters and time agree across each four-way group. Auto tape is stable even when its application is disabled. Geometry hashes may differ between viewports because density/frustum change; require equality **within** viewport, not between desktop and mobile.
2. Fixed-time evaluation reconstructs from a cleared state and applies events in a stable total order. Specify the tie-break rule for simultaneous automatic and scripted events, and whether an event at `event.time == t` is included. All conditions use the same rule. Future events must never consume source slots.
3. Source reuse follows the existing oldest-start-time behavior, including ties. More than 16 applied events can cause auto events to evict scripted sources; this is a real factor interaction to log, not silently eliminate. “Full buffer” does not imply all sources remain visibly influential.
4. Hold freezes the scene clock. Restart and direct seek do not depend on elapsed wall time, previous scenario, condition, scroll or capture order. Manual input is absent from scripted runs. Controls must not accidentally inject pointer events into the field.
5. Isolated captures hide controls/tooltips and use a stable canvas crop. Foreground captures pin scroll position, font readiness, layout, safe bounds and canvas dimensions; retain the unchanged Resume content. A context safe-zone change makes that pair noncomparable.
6. Reduced-motion starts with autonomous playback paused. Explicit fixed-time inspection is allowed. Record actual study behavior independently from production reduced-motion behavior.

Missing renderer identity or manifest fields are evidence limitations. Mismatched geometry, time, event ordering or applied DPR invalidate the affected paired comparison; fix the capture setup before drawing conclusions.

## 3. Bounded capture plan

Use the implementation's documented deterministic scenarios and pin their exact event times in a manifest before capturing. Use the same seed throughout the primary set. Desktop: 1440×900 CSS px; mobile layout: 390×844. Request DPR 1 for this primary appearance comparison and record actual DPR; do not override the engine's other budget decisions. Additional DPR studies are outside this initial matrix.

### Primary set: 32 isolated images

At each viewport render four conditions for each of four checkpoints (2 × 4 × 4 = 32):

- **Unscripted early:** t=2.0 s, no scripted impulses. This tests ambient plus the enabled prefix of the fixed auto tape. Name it “no scripted impulses”, not “ambient only” when auto is on.
- **Unscripted late:** t=8.0 s, same scenario. Inspect the manifest to ensure auto-on has emitted at least one event by a selected checkpoint; if not, replace the late checkpoint once, before comparison, with a declared time after the tape's first event.
- **Simultaneous pair:** 1.0 s after the prescribed simultaneous event time. This exposes overlap under a common stimulus; record all intervening auto events.
- **Capacity burst:** immediately after the first event that exceeds 16 applied sources in the scripted burst, plus 0.25 s, using a common timestamp across all four conditions. Pin this timestamp from the scripted tape, not separately from each condition's buffer. Record if auto-on reached capacity earlier.

The first checkpoint is an early/late ambient sample, not a claim to measure ambient motion from one image. Do not choose timestamps after looking for flattering patterns. If the prescribed scenarios use a different origin, retain these offsets and document the absolute times.

### Repeatability set: 16 recaptures

For each viewport and condition, repeat the late-unscripted and capacity-burst states after visiting a later time, an earlier time, and another condition, then directly seeking back. This adds 16 images. Compare each to its corresponding primary image. Perform one additional restart-and-seek check in logic/state validation; it need not add screenshots if equivalent image repeatability is already established.

### Foreground set: 8 images

At the late-unscripted timestamp, capture all four conditions at both viewports behind the unchanged Resume: 8 images. These support a bounded reviewer readability/distraction observation only. If the foreground conceals the field, report that rather than moving content or weakening the safe zone.

Total initial budget: **56 screenshots**, plus manifests and logic-test output. Do not make a Cartesian screenshot sweep of every scenario/time/DPR. Single-center, delayed pair, edge impulse and five-per-ten-second tape still require deterministic state checks and a bounded visual smoke check by the coordinator when a browser is authorized. Record one diagnostic frame only for an actual anomaly; label additions and their reason. Verify the automatic tape's count per half-open 10-second window, distributions/ranges and seed stability in logic/state checks, not by estimating from imagery.

For a temporal visual check, replay only the same 0–10 s no-scripted and simultaneous-pair sequences per condition at the two viewports, using a deterministic clock sequence if available. Fixed-time stepping establishes appearance continuity, not runtime smoothness. If reliable frame-sequence automation is unavailable, record the check as qualitative playback; do not imply a measured motion speed or flicker rate.

## 4. Capture discipline and repeatability tolerance

Wait for study readiness, completed fonts/layout, and a presented frame for the requested state. Awaiting a seek setter or `requestAnimationFrame` alone may not prove that the screenshot contains that state. Verify exported time/state after the capture as well. Avoid CSS animation, hover, caret, selection and browser zoom changes. Use lossless PNG, fixed color settings and the same browser session/renderer for a paired group.

First compare decoded pixel arrays of same-condition repeats (file byte equality can differ through metadata). Report exact equality, changed-pixel fraction, maximum channel difference and mean absolute channel difference. Expected target is exact equality in the same renderer. If not exact, retain the discrepancy and identify whether it is UI/crop or rendered-field noise. Do not hide it with blur, a tolerance, or alignment. A state mismatch is always a failure even if images look similar. If equal state has a small renderer-level discrepancy that cannot be eliminated, report the observed repeatability floor; effects at or below that floor are inconclusive, and reproducibility remains qualified.

Do not translate or rescale paired captures to improve matching. Any registration correction can conceal the very displacement under study. A changed crop requires recapture.

## 5. Image measurements: measure coverage separately from geometry

Calculate only on the isolated canvas, with a common crop and identical alpha compositing. Define fixed ROIs before viewing outcomes: whole canvas plus a central rectangle spanning 50% of width/height. Report each viewport separately. Keep UI, labels and foreground out of quantitative masks. Use a consistent luminance transform; record whether values are linearized or display encoded. No cross-reference pixel-distance scoring is proposed.

| Measure | Operational definition and interpretation | What it cannot establish |
|---|---|---|
| Mean darkness | For background luminance `Yb`, mean `max(0, Yb − Y)` over the ROI. Report raw luminance difference too if pixels can be brighter than background. | More darkness does not imply more displaced geometry, better contours or deeper water. |
| Darkness distribution | Report median and p90/p99 darkness plus fraction exceeding two predeclared thresholds: 0.02 and 0.08 on a normalized 0–1 display-luminance scale. These are descriptive cutoffs, not perceptual just-noticeable differences. | Thresholded area mixes dot size, opacity, color and overlap; call it pixel coverage, never active-point fraction. |
| Paired image difference | Mean absolute luminance difference and fraction with absolute difference >0.02, against C00 and the matched other-factor condition. Display signed difference maps with one fixed scale across a viewport's matrix. | Pixel difference is not optical flow, front velocity, particle displacement or topology. |
| Local variation | Optional only if needed: standard deviation of luminance within fixed 32×32 CSS-pixel tiles, summarized by median/p90. Keep tile boundaries fixed. | This mixes coverage/contrast and spatial structure; do not name it geometric complexity or visual quality. |

Primary metrics require only darkness, thresholded coverage and paired differences. Skip optional analysis unless it answers an observed ambiguity. Threshold sensitivity is reported using both fixed thresholds; never choose a threshold to maximize separation.

**Geometry guardrail:** apparent dot merging can result from increased sprite size/opacity with unchanged centers. Counting connected components of a thresholded screenshot therefore does not measure contour topology or point displacement. Similarly, tracking the brightest/darkest pixel does not reliably locate a moving point whose sprite changes shape. If implementation exposes actual evaluated point centers or displacement, report their vector changes separately with provenance and units; do not require instrumentation or engine changes for this protocol. Otherwise mark center displacement unmeasured. Use enlarged matched crops as qualitative evidence only, explicitly distinguishing centroid motion from sprite expansion. None of these image metrics measures physical wave interference.

## 6. Factor contrasts and interpretation

For any scalar metric `m`, report:

- Ambient effect with auto off: `m(C10) − m(C00)`; with auto on: `m(C11) − m(C01)`.
- Auto effect with ambient off: `m(C01) − m(C00)`; with ambient on: `m(C11) − m(C10)`.
- Interaction: `m(C11) − m(C10) − m(C01) + m(C00)`.

The analogous signed per-pixel interaction map can localize nonadditive changes. Use these as descriptive paired contrasts, without p-values or claims of population significance. Multiple times from one seeded animation are not independent participants or independent geometry samples. The interaction can arise from saturation, opacity blending, ambient coordinate coupling, and source eviction; it is not proof of fluid coupling. Consult source-state logs before explaining it.

Interpret at the checkpoint level first, then summarize consistency across early/late/pair/burst. If effects reverse with time, report the reversal rather than averaging it away. Desktop/mobile differences may reflect world-to-pixel scaling, density and budget, not an isolated responsive-layout effect. Cross-viewport raw pixel differences are invalid.

Operational outcomes:

- **Valid layer contribution:** paired controls match, repeats are exact or qualified above a documented floor, and the relevant contrast is visible and supported by the recorded metric. State whether it changes coverage, tone, motion appearance or measurable geometry.
- **No resolved contribution:** contrast is absent or below the repeatability floor at sampled states. This is not proof the layer has no effect at other times.
- **Interaction requiring explanation:** combined result differs from simple addition. Check saturation, coordinate coupling and buffer membership; record unresolved cause if logs cannot separate them.
- **Invalid comparison:** seed/geometry/time/layout/events differ unexpectedly, frames are stale, or condition switches leak state. Repair and repeat only affected groups.
- **Readability concern:** a reviewer cannot comfortably follow a fixed passage or perceives competing movement in the foreground replay. Label as one-reviewer exploratory evidence, record condition/time/viewport, and do not claim task accuracy, accessibility compliance or user preference. Static foreground shots alone cannot establish motion distraction.

No condition is declared an aesthetic winner. The output should identify which existing layer accounts for which observed change, and which uncertainty merits a subsequent isolated experiment.

## 7. Software-renderer and runtime caveats

Record WebGL version and vendor/renderer, including unmasked values if exposed; unavailable identity stays unknown. Chromium software rendering supports shader/capture debugging and controlled appearance comparisons on that renderer. A 390×844 viewport is a mobile layout, not evidence from a mobile GPU or touch device. Shader precision, point-size limits, antialiasing and compositing can differ on hardware.

Do not infer real-device frame rate, GPU cost, battery use, thermal behavior or mobile readiness from these runs. A stopwatch, screenshot duration or deterministic stepping rate does not measure runtime performance. Any observed RAF interval is browser pacing under the recorded environment, not GPU time. A zero-difference capture pair demonstrates repeatability under that environment, not universal cross-GPU pixel identity. Production behavior and performance remain outside Stage 0's claims.

## 8. Handoff checklist and stop rule

Coordinator's review package should contain the 32-image primary matrix, 16 repeat comparisons, eight context images, exact state manifests, failed-then-passing meaningful logic-check evidence, bounded playback notes and a one-page contrast summary. Summary columns: checkpoint/viewport; control validity; repeatability; ambient contrast; auto contrast; interaction/source-state explanation; foreground observation; unresolved issue.

Stop after verifying the Stage 0 controls and reporting substantive layer contributions. If repeatability or factor isolation fails, the next action is a harness correction, not a replacement shader. If evidence is valid but visually ambiguous, propose one specific follow-up capture or second-seed check; do not start new field algorithms, retune parameters, infer the reel's provenance or integrate a homepage redesign.
