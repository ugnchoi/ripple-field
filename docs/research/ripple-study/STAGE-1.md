# Stage 1: surface shading diagnostic

Authorized by user's “please continue”. Surface-first: no boat, bird, rock or other objects. Existing portfolio, production engine and frozen Stage 0 study remain unchanged.

## Question
Does directional tonal response reveal surface relief already present in the current disturbance field, without changing its dynamics? Strongest alternative: the positive field profile itself lacks the phase structure needed for water. This experiment tests the mapping explanation first; it does not presume a winner or the reference's implementation.

## Scope and ownership
- Engine worker owns new `studies/ripple-shading/` and report `10-shading-implementation.md`. Reuse frozen baseline deterministic helpers and unchanged engine material/constants/budget. No dependencies, app changes or baseline-file edits. Separate build/dev config on strict port 5175; source hashes embedded and server restarted after source freeze. Functional laboratory UI; not a new visual identity.
- Rendering reviewer owns `11-shading-review-protocol.md` and later `12-shading-independent-review.md`. Specify controls and independent correctness checks; report findings to implementer and coordinator. No source/browser-session edits.
- Reference researcher owns `13-shading-observations.md` after capture handoff; for now review brief and provide a small preregistered visual rubric. Do not browse/capture/implement or start broad literature work.
- Coordinator owns comparison captures, motion recordings, synthesis and Drive review delivery. Reporting protocol in BRIEF.md remains mandatory.

## Controlled comparison
A = exact current point rendering with ambient/automatic events disabled.
B = same points, field, event history, spatial displacement, point sizes, opacity, camera, output size and palette; add a declared directional slope-to-tone response using the current scalar disturbance as a height PROXY. No new wave dynamics, normal-driven XY/Z displacement, dither pass, backdrop gradient, specular assets, camera perspective or objects.

Both share seed47, scripted single/pair scenarios, exact clock, viewport/DPR and source uniforms. Transfer mode/light direction must not reseed or alter the field. Flat/no-source state is a null control. Include light reversal as a diagnostic of directional response, not another design candidate. Record all coefficients before primary visual comparisons and do not tune them based on preferred screenshots. If a comparable-coverage control is useful, preregister and disclose it; do not silently normalize every frame.

Derive slope from the same point-conditioned scalar evaluation, with mathematically stated coordinates, units and treatment of per-point seed/warp, temporal envelope, saturation and safe-zone/global scaling. Preserve source behavior exactly in A. A finite-difference diagnostic is acceptable if its extra cost and step are disclosed; a plausible smooth height proxy is not physical fluid height. Guard normalization/division and failed shader injection; do not silently fall back to altered dynamics.

Reuse baseline replay/geometry utilities read-only. API should support exact setState/seek/hold/play, seed, scenario, transfer, light reversal, panel hiding, awaitReady, exportState. Export field/geometry/source uniform identity separately from transfer settings, actual shader hash/source revision, all coefficients, viewport/renderer and limitations. Starts held; reduced-motion preference pauses playback. Include usable manual pointer interaction if practical, kept out of scripted captures. Save/export exact state for review; import may be omitted rather than copying an incompatible promise.

## Evidence requirements
1. Meaningful failing-then-passing no-dependency tests for new slope/transfer logic, zero-gradient behavior and directional reversal; existing replay suite remains green. Validate against independent finite-difference/numerical reasoning rather than a mirror assertion.
2. Study TypeScript/build and unchanged-app checks. Clean live shader compilation and finite extreme/zero-source output; actual baseline A parity against Stage0 at same field state/size.
3. Primary stills: desktop1440x900 and mobile390x844, DPR1; single/pair at fixed times1.25,2,3 seconds; A/B (24). Null/reversal diagnostics and out-of-order repeats are small additional correctness captures, not a broad parameter sweep. Exact manifests and decoded RGB comparisons.
4. Continuous browser recordings: A/B × single/pair at desktop and mobile (8 clips), same0..6s trial range including impulse at1s. Record timing/environment and distinguish browser pacing/recording artifacts from actual hardware performance. Fixed-time captures alone cannot settle motion quality.
5. Independent source/state review and bounded native-image/motion-frame review. Report which relief cues are actually visible, unresolved front identity/texture issues, and what the simpler alternative predicts. No solver or aesthetic winner selected by darkness metrics.

## Stop rule
Complete this diagnostic, the motion review and a reviewable package before any new wave model/dither/homepage integration. If mapping does not resolve the water reading, record that result and define the next signed-profile comparison. A failed candidate is useful evidence; do not rescue it with unrelated effects.
