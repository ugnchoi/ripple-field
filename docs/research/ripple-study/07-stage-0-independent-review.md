# Stage 0 independent implementation review

2026-10-17 · **Final verdict: PASS for fixed-time layer isolation and reproducibility on the recorded software renderer.** Foreground safe-bound mismatch was corrected and rechecked. Temporal visual quality, motion distraction, convincing water depth and real-device performance remain unassessed. Reviewer owns this report only; no browser session, application edits, dependency changes or new workers.

This report preserves the preliminary findings and their resolution below; pending language in those earlier sections records review history, superseded by the final verdict.

## Scope and evidence so far

Read `STAGE-0.md`, reporting protocol, study `replay.mjs`, `replay.test.mjs`, `main.tsx`, declarations and CSS as they emerged; compared copied geometry and buffer semantics against `src/engine/createPointGridGeometry.ts` and `src/engine/swellSourceBuffer.ts`. These files remain under active implementation, so findings refer to the inspected version and require recheck at handoff.

`node --test studies/ripple-baseline/replay.test.mjs`: six tests passed. This verifies current pure-logic checks, not the live API, GPU uniform contents, browser screenshots or reduced-motion behavior. No final acceptance claim follows.

## Material findings sent to implementer and coordinator

### R1: inactive uniform metadata can depend on seek history

Inspected render clears the reused `SwellSourceBuffer`, repopulates active events, then exports every uniform. Engine `clear()` resets only start times; other slot payload survives. Thus two equivalent states can have identical active sources and pixels but different exported inactive centers/strengths/widths/decays.

Reproducer: seek late into burst, then seek before the first event; compare full uniform metadata to a fresh page at the same final state. Independently confirmed without browser by transpiling the actual buffer class in memory and comparing (a) fresh buffer and (b) buffer after `spawn(.4,.2,3,{strength:.85}); clear()`. Both start-time arrays were identical inactive values; first center X was `0` versus `0.4000000059604645`, strength `0` versus `0.8500000238418579`.

Interpretation: this is a metadata/state-equality problem, not evidence of visible stale sources, because shader selection uses start time. Canonicalize inactive export payload or explicitly exclude/mark it; verify active slot state from actual Float32 uniforms rather than treating double-precision helper metadata as GPU truth. Source code need not change.

Status: source fix inspected: study canonicalizes inactive payload after real buffer copy; dedicated test passes. Browser/history equality still pending handoff.

### R2: imported state can silently reconstruct a different experiment

Inspected `loadState` checks schema, imports manual events and calls `setState(data.state)`. Saved parameters, geometry hash, viewport and automatic tape are not compared with the regenerated scene. Importing a desktop export at mobile dimensions or after parameter/algorithm changes can therefore produce a different tape/geometry under the same state fields.

Reproducer for coordinator: export desktop, import into mobile viewport, compare geometry hash, tape coordinates, parameter set and dimensions before calling it replay. Same-viewport parameter mismatch should also be tested through a deliberately edited copy of the export.

Interpretation: cross-viewport reconstruction can be useful, but must be explicitly labeled and not presented as faithful reproduction. Validate/reject mismatch or expose it clearly. This matters for saved-state evidence integrity even when the initial paired screenshot path does not use imports.

Status: source fix inspected: import signature checks parameters, viewport/budget, revision, expected geometry and regenerated tape before applying. Dedicated compatibility test passes. Browser rejection/readback still pending handoff.

## Preliminary observations, not verdict

- Seeded geometry uses a local PRNG without global `Math.random` mutation; inspected equations match stagger/jitter construction, with existing constants supplied by the harness.
- Event selection is inclusive at exact time and filters auto events independently; stable ordering is time then lexical ID. The policy differs from production RAF scheduling and is disclosed.
- Replay rebuilds sources for every frame and preserves all past events until capacity recycling. Automatic events may evict scripted events; this is a real factor interaction, not automatically a failure.
- `replaySlots` tie behavior matches first-oldest slot selection for ordinary scenario timestamps. The helper uses JavaScript time precision whereas actual engine stores Float32 start times; near-equal manual event times require care if exported slots are called exact GPU state.
- Study starts held and pauses on reduced-motion preference changes; explicit play remains possible. This is a study opt-in policy, not a production accessibility change. Browser confirmation remains pending.

## Pending acceptance evidence

Await implementation handoff/revision identity, runnable URL and automation API; meaningful fail-then-pass logic evidence; coordinator state manifests and decoded repeat-image comparisons; factor-isolation checks; source-capacity/ordering state; viewport/DPR/renderer identity; and reduced-motion observations. After handoff, recheck fixes and actual captures before final verdict. No aesthetic choice or new rendering algorithm is reviewed here.

## Follow-up during implementation

Re-ran Node checks after fixes: eight tests passed. Source now canonicalizes inactive uniform payload after copying the real buffer; active Float32 values remain in the export. Import compatibility checks independently reconstruct expected seed/scenario geometry and tape and compare viewport, engine constants and revision identity.

Sent capture prerequisites to both implementer and coordinator: restart study Vite after final source edits because revision hashes are injected at config evaluation; clear manual events explicitly before every scripted capture because scenario switches retain them. Reported a manual-flow issue: pointer/key throttle timestamps survive backward seek/restart, suppressing new input until previous trial time is reached. This does not invalidate scripted captures with manual input cleared; implementer response pending.

Read coordinator's emerging `output/playwright/stage-0/analyze.cjs`: metrics use declared display-encoded luminance and fixed thresholds, separate mean darkness from geometry claims, decode PNG pixels for repeat checks, and apply scalar factor contrasts correctly. Actual manifest/images were not yet present at this inspection; no executed-metrics claim.

Independent buffer cross-check: transpiled the actual constants and `SwellSourceBuffer` modules in memory (no written source), replayed six scenarios × two auto settings × ten timestamps including backward return to zero: **120 states passed**. Compared all 16 slots' actual Float32 time, center X/Y, strength, width and decay to the helper's expected Float32 values after canonicalization. This validates scripted ordering/capacity equivalence over the tested schedule; it does not cover arbitrary near-equal manual timestamps or GPU shading.

Inspected `studies/ripple-baseline/evidence/node-red-initial.txt` and `node-red-review.txt`: initial stub failures and two specific review-regression assertion failures are preserved. Current independent eight-test run passes. These logs satisfy evidence of failing checks before the corresponding logic fixes; browser evidence remains pending.

## Frozen implementation source review

Implementation handoff received: source frozen, study Vite restarted on port 5174, `studies/ripple-baseline/README.md` documents URL/API and caveats. Independently reran study TypeScript check (exit 0) and all eight Node tests (pass). Verified each injected source hash in `evidence/final-identity.txt` against current on-disk bytes; all five match. Git status has no tracked application-file modifications.

The manual throttle issue is fixed by resetting cadence in seek and setState; implementer reports browser pointer recording at t=5 then t=0 yielded `[5,0]`. Independently inspected the reset call sites; that browser interaction has not been repeated by this reviewer.

**Source portion: no remaining comparison-invalidating finding in the frozen scripted study.** R1 and R2 are addressed in source and targeted tests. The helper source-slot values are explicitly logical doubles; actual uniform arrays are Float32 authority. Imports intentionally reject incompatible viewport/budget/code/tape/geometry rather than promising universal replay. Manual logs persist across scenarios, so coordinator must clear them before the scripted matrix. `awaitReady()` waits fonts and redraw, with presentation separately required by the coordinator. Starts-held and preference-change pause support the declared reduced-motion policy; explicit playback remains an opt-in.

Readiness metadata covers engine constants, shader, source buffer, main harness and replay code, but does not hash every transitive renderer/CSS/budget dependency. Preserve this checkout and package context for full reconstruction; the five hashes are not a complete build attestation. No arbitrary cross-GPU pixel identity or runtime performance is established. Surface-first intent is confirmed: no boat/bird/object work is part of this study or review.

Final captured-state verdict remains pending coordinator matrix/manifests and repeat metrics.

## Coordinator capture evidence review

Inspected `output/playwright/stage-0/capture-script.js`, `capture-run.log`, `capture-manifest.json`, `image-metrics.json`, and the PNG analysis implementation. Independently checked all **56 manifests** (32 primary, 16 repeats, eight foreground): held clock; no manual events; requested/applied DPR1; correct ambient and polish uniforms; exact selected-event prefix and slot reconstruction; all six actual Float32 source arrays; source hashes matching disk. Within each primary viewport/checkpoint group, geometry, viewport/budget, parameters, potential tape, revision and renderer identity agree. Isolated safe zones are disabled.

Primary capture script compares full exported state before and after screenshots. Repeat script includes later/earlier seeks and a condition detour, then checks uniforms and source slots. Decoded image results show **16/16 exact RGB repeats**, zero changed-pixel fraction, zero maximum channel difference and zero mean absolute channel difference. Chromium 149.0.7827.55 uses ANGLE/SwiftShader; viewport sizes are 1440×900 and 390×844, DPR1. No captured console/page errors. This is reliable appearance/state evidence on this renderer, not real-device performance.

The reduced-motion capture logs t=0 held before/after a 300ms observation, with explicit seek to t=2 accepted. Extra scenarios have expected state-source counts; manual clear, same-viewport JSON import and incompatible-import rejection are logged. These are state/behavior smoke evidence, not full gesture/task coverage.

### Descriptive layer outcomes

At t=8 with no scripted impulses, whole-canvas mean darkness is:

| Viewport | C00 | C10 | C01 | C11 | Ambient effect, auto off | Auto effect, ambient off | Interaction |
|---|---:|---:|---:|---:|---:|---:|---:|
| Desktop | .010441 | .013062 | .011911 | .014718 | .002621 | .001470 | .000187 |
| Mobile layout | .010307 | .013137 | .013465 | .016752 | .002830 | .003158 | .000457 |

These are differences in normalized display-luminance darkness, not percentages, geometry displacement or depth scores. Both factors increase mean darkness at every sampled primary checkpoint. Ambient has the larger late contrast on desktop, while auto has the larger late contrast on mobile layout; do not generalize one factor's dominance across viewports. The combined effect is modestly more than additive for this metric at sampled states. Source saturation, transfer/blending and coordinate coupling remain plausible causes; image metrics do not isolate the cause.

Direct `view_image` inspection of the four mobile late images shows C00's quiet lattice, visible branching contour-like modulation in C10, broad curved disturbance in C01, and both patterns in C11. Desktop pair C11 shows overlapping broad bands. Mobile burst C11 has much greater dot coverage and visible enlarged/near-merged sprites. These observations support layer separation, not a physically simulated surface, measured center displacement, signed interference, or convincing water depth.

### Context-capture defect requiring a bounded correction

First foreground capture C00 has different safe bounds from the other three conditions at both viewports: desktop maxY .756944 vs .763611; mobile .689648 vs .708605. The held render can precede final layout; capture script waits fonts/RAF but does not explicitly redraw after settlement in its context loop. Cause remains a hypothesis, but the recorded mismatch is definite. Asked coordinator to recapture only the eight foreground images using settled-layout `awaitReady()`/redraw, before/after state checks and equal safe bounds. Isolated 32+16 results are unaffected.

An initial preview suggested left-edge text clipping, but this observation was withdrawn: independently decoded the original mobile C00 PNG and inspected a native crop enlarged with nearest-neighbor sampling; the initial letters are intact around x=45. No source-pixel clipping defect is established. Coordinator was notified of the correction. No UI/source changes requested by this review.

The fixed-time sequence is explicitly logged as state-only with visual playback not assessed. Thus moving-front coherence, fine-texture temporal stability, motion distraction and perceived depth remain unmeasured even though fixed-time determinism passes. Do not represent Stage 0 as selecting the best water surface.

## Final correction verification and verdict

Re-read corrected `capture-manifest.json` and `context-correction-script.js` after coordinator handoff. Exactly eight foreground records are marked corrected. All four safe bounds now agree within each viewport: desktop maxY .7636111111; mobile maxY .7086048578. The correction script explicitly awaits fonts/layout, renders again, asserts equal safe bounds, and compares exported state before/after each capture. Superseded context frames are retained separately and excluded from the active 56-image matrix. Isolated primary/repeat images were not changed. The suspected clipping was a preview interpretation error, corrected in this report and directly to coordinator; no clipping claim remains.

**PASS — bounded fixed-time comparison validity.** Frozen source, exact source-state controls, 32 paired primary images, 16 exact decoded repeat pairs and eight corrected foreground states support descriptive attribution of observed tonal/coverage patterns to ambient/auto factors at these checkpoints. R1 inactive metadata, R2 incompatible import and manual cadence findings are resolved. No outstanding defect invalidates the current isolated matrix or corrected context-state pairing.

**Limits / remaining decision:** state-only stepping is not visual playback evidence. No acceptance claim is made for coherent moving fronts, fine-texture stability over motion, reading distraction, reference similarity, water realism, hardware/mobile speed or an aesthetic winner. If Stage 0 completion is defined to include qualitative playback inspection, coordinator must record that separately or explicitly defer it before declaring that broader goal complete. The next design decision should use this reliable baseline to choose a small surface-only experiment; no objects, new algorithm or homepage integration is authorized by this review.
