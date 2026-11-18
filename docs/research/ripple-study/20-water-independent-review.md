# Production water renderer: independent review

2026-10-17 · Final bounded acceptance; earlier sections retain review history. Reviewer owns this report only; no source edits, browser use, dependencies or agents. Scope follows `SURFACE-DELIVERY.md` and `src/experience/types.ts`; bounded mathematical/lifecycle constraints are also recorded in report17. Three.js shader review guidance applied from `/home/ugnchoi/.codex/skills/threejs-shaders/SKILL.md`.

## Acceptance checks

- Analytic packet height/gradient includes envelope/carrier/window and smooth total-cap derivatives; regularized source-center math is finite. CPU reference agrees with independent central differences and actual shader convention. All coefficients/units and departures from diagnostic model declared.
- Mesh sampling resolves shortest wavelength in both world axes, with bounded vertex/DPR budgets. Displaced bounds/culling and normal coordinate basis agree. Camera/input mapping uses displayed canvas, not global-window assumptions. Actual quality requires native integrated surface/motion evidence; test counts alone do not establish it.
- Bounded reusable source slots expire/prune; clear preserves pause/strength and does not reseed; paused/lost/disposed input does not queue. No per-frame geometry construction/object churn beyond a demonstrated need.
- User pause is independent of hidden/offscreen/context suspension; resume has no hidden-wall-time jump. RAF, observers/listeners and GPU resources have one owner and idempotent teardown. Failed initialization and stale context-restore callbacks cannot leak or resurrect a disposed instance; StrictMode mount/dispose/remount is safe.
- Factory contract reports status/pause changes correctly, preserves UI input ownership and fallback/retry behavior, rejects nonfinite inputs and keeps diagnostics out of product UI. No performance claim from software-renderer screenshots.

## Evidence status

At first inspection `src/water/` did not yet exist. No implementation verdict or final realism claim. Await emerging code, meaningful red/green tests, source handoff and coordinator integrated-browser evidence. Material findings will be sent to implementer/coordinator with a reproducer; fixes remain owner-controlled.

## Emerging field math and sampling

Read `src/water/field.mjs` and tests. Regularized radius, Gaussian-envelope derivative and cosine derivative agree; total height cap multiplies the summed source+ambient gradient by1−tanh². Four current field tests pass, including finite-difference comparisons, signed lobes, center, onset/expiry and near-cap overlap. Red output from initial stub assertions is preserved.

Independent coherent-source stress:16 identical sources at age1, regularized radius r=.42+.14/4, ambient on. H≈.000976,dx≈−4.66722694; independent central difference≈−4.66722691, normalized gradient normal has unit length. No math defect; confirms height cap does not bound slope. Reported a visual sampling risk: characteristic capped transition scale≈.035/4.67=.0075world can be below the primary mesh cell≈.0116world. Base-wavelength sampling alone does not guarantee capped-burst alias freedom. Ask final native coherent-burst inspection, not an unbounded parameter change.

Actual sampler outputs:1440×900,275×172segments (~12.03samples/wavelength);390×844,80×172 (~12.04);2560×1440 (~12.01);1200×300 hits512-column cap with8.96. Within declared vertex budgets at these rectangles. DPR caps1.75desktop/1.5narrow. GLSL parity and lifecycle source still pending.

## Production source pass

Read `createWaterSurface.ts`, `shaders.ts`, `sourceState.mjs`, and shared UI types. Independently ran `node --test src/water/field.test.mjs src/water/sourceState.test.mjs`: 9/9 pass. `npx tsc --noEmit` passes. No source-level blocking defect found in this pass.

GLSL generation uses shared packet/ambient coefficients and reproduces the CPU height and analytic derivatives, including the total-cap chain. Normal `normalize(vec3(-gradient,1))`, lighting and fixed orthographic view share the untransformed XY-plane basis. Top-left normalized canvas input correctly maps onto that plane. Frustum culling is disabled; bounded Z displacement remains in camera depth range. Color uniforms use Three Color conversion and fragment output includes color-space handling. This is source parity plus actual compilation evidence, not a GPU numerical readback comparison. Interpolated vertex gradients approximate the continuous analytic gradient between vertices; the coherent-source sampling risk remains.

Source buffers are fixed typed arrays shared directly with uniforms. Source capacity, expiration, strength bounds and clear semantics are covered by the tests. Geometry changes on dimension/sampling changes rather than each frame. User pause is separate from hidden, offscreen, undrawable and context suspension. Rejected disturbances do not queue. Suspension resets clock origin and resume has no hidden-wall-time catch-up. A frame advances at most .05 simulation seconds; sustained rendering below 20fps therefore slows simulated time relative to wall time. This is a declared motion limitation, not evidence of real-device performance.

Cleanup cancels RAF, disconnects both observers, removes owned canvas/document/window listeners, removes mesh and disposes geometry/material/renderer; guards prevent stale observer/context callbacks from reviving disposed ownership. Ordinary disposal avoids forced context loss for same-canvas remount. Initialization failures clean up and report unavailable. Renderer-owned context listeners are installed before the factory restoration handler. These paths look consistent on source inspection; actual browser lifecycle evidence is separately attributed below.

## First production evidence inspected

Viewed implementer-produced native `src/water/smoke/evidence/desktop-first.png` and paired diagnostics. At 1440×900, simulation time .15, one .7-strength central disturbance, the image shows a continuous pale green surface with concentric light/dark flanks and a localized bright reflection. It supports continuous shaded-relief presentation at this single early state. It does not establish motion quality, mature overlap quality, alias freedom, or integrated product quality. Diagnostics identify SwiftShader, one geometry/program and no shader errors.

Read implementer-produced `lifecycle.json`: pause freeze; clear with zero sources and preserved pause/ambient; disposed zero sources/no pending RAF; same-canvas recreation ready with one geometry; context lost→ready with frozen time, preserved pause and no queued lost-state input; no recorded errors. This reviewer did not run that browser script. Actual React StrictMode, visibility/offscreen, mobile integration and burst visual acceptance remain coordinator/implementer evidence tasks.

**Current verdict:** mathematical/source-contract pass with no blocking defect found; production visual and integrated-flow acceptance pending. Do not interpret this report as final delivery acceptance.

## Confirmed overload limitation

Subsequently viewed implementer-produced `stress-mobile.png`: 16 coincident strength-1 impulses at reported .6 simulation seconds show conspicuous stair-stepped/faceted light and dark flanks. Rings remain coherent, but the surface loses smooth visual relief under this bounded overload. This confirms an actual quality limitation consistent with the earlier sampling risk; the image alone does not isolate the exact contribution of gradient interpolation versus specular amplification. Ordinary single-source quality cannot justify an all-input smoothness claim.

Implementer proposes coalescing near-identical center/time inputs into one strength-capped impulse. That is an explicit interaction-policy change, not a mathematical correction. It addresses this overload subset; nearby or phase-aligned sources can still sum steep gradients. Coordinator decides whether to adopt a bounded guard or accept/document the limitation. Any change requires checking the stress case and ordinary separated disturbances, while keeping shading gradients consistent with actual height. No source edits made by reviewer.

Read additional implementer `offscreen.json`: offscreen suspension freezes time, rejects input, resumes, and preserves user pause. This adds attributed browser evidence; reviewer did not independently execute browser actions.

**Revised quality status:** overload faceting confirmed and reported to engine/coordinator; final visual acceptance remains unresolved. Source math and lifecycle findings above still stand.

## Integrated desktop and production routing evidence

Viewed coordinator native `output/playwright/water-delivery/water-desktop.png` and `opening-desktop.png`. Single-source desktop flanks read as continuous shaded relief; controls remain legible and separate from the field. Opening headline, role and navigation are readable over the quiet surface. These are positive static observations, not motion/performance proof.

UI source uses primary left-button pointerdown and nonrepeat Enter/Space, one disturbance per accepted action. The exact simultaneous sixteen-source smoke overload is not one ordinary UI action; repeated nearby clicks can still overlap, so a bounded three-source nearby sequential check is requested along with the authorized guard recapture.

Read coordinator `static-build-checks.json`: root and `/review/` deployment checks cover opening→water→reload→portfolio, one canvas, no resume or print button in water, print hiding opening and retaining resume tagline; recorded page errors empty. Browser actions were coordinator-owned. Guard and final visual evidence remain pending.

## Authorized coalescing guard: source review

Reviewed implemented guard in `sourceState.spawn`: active impulse center within .012 world units and absolute simulation-age within .035 seconds receives summed strength capped at 1, retaining its original center/start. Later or spatially separate inputs allocate independent slots. This changes input policy only; packet, ambient, height cap, gradients, material and sampling remain unchanged. It preserves analytic height/shading consistency. The temporal window uses simulation time; under slow rendering it can span more than 35 milliseconds of wall time.

Independently reran 10/10 engine tests and `npx tsc --noEmit`, all pass. New red/green test covers sixteen duplicates reducing to one strength-1 impulse, .006 offset merged, .024 offset independent, separated pair independent, same-center .05-simulation-second follow-up independent. No blocking source defect found in this guard. Stress and ordinary-nearby recaptures pending before bounded visual verdict.


## Final bounded acceptance

Independently viewed final `stress-guard-mobile.png` and `ordinary-nearby-mobile.png` with their JSON diagnostics. Guarded sixteen-duplicate input yields one strength-1 source at simulation .6; the prior conspicuous staircase highlights are absent in this capture. Three medium nearby sources remain independent, starting at 0, .1 and .2 simulation seconds, captured at .6. Their overlapping flanks read as smooth continuous relief, with no comparable faceting or holes visible. Both use the same 80×172-segment mobile mesh and report no shader errors. These are bounded positive static checks, not an exhaustive overlap proof.

Also viewed coordinator final `production-overlap-desktop.png`: two overlapping fronts retain continuous shaded relief, with readable paused-state message and controls. Coordinator reports final 35 tests, production build and diff check pass; final whole-page walkthrough is `output/playwright/water-delivery/05-experience-walkthrough.webm`. This reviewer inspected the PNGs and source/tests, not video playback or live browser actions. Coordinator accepts desktop stylized-water quality and reports mobile 390px/landscape fit and UI recovery/fallback checks passed.

**Verdict: PASS for the reviewed renderer math, source/lifecycle contract, authorized duplicate-input guard, and bounded desktop/mobile stylized-water visual cases. No remaining blocking finding in this review scope.** Final integrated release/delivery ownership remains coordinator's. This supersedes earlier pending verdicts above.

Remaining limits: this is an analytic shaded surface, not a physical-water simulation or photorealism claim. Distinct densely aligned sources can still produce steeper transitions than mesh sampling resolves; the guard does not promise universal alias freedom. The .05-second frame increment cap slows simulation under sustained low frame rate, and its .035-second coalescing window uses simulation time. Software Chromium captures establish no hardware-device frame-rate guarantee. Lifecycle/browser findings retain their attributed owner evidence rather than being presented as this reviewer's live execution.
