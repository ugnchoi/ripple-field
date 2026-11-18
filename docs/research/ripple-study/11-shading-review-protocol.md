# Stage 1 shading diagnostic: review protocol

2026-10-17 · Preregistered before candidate captures. Scope is the same disturbance field with a directional tonal transfer; no new wave dynamics, dithering, objects or homepage work. No browser use or implementation performed by this reviewer.

## Question and alternative

Can directional tone make the existing scalar disturbance read as relief while its event response stays identical? A valid positive result is a bounded observation of stronger relief cues under this transfer. It is not proof of physical height, water simulation, reference provenance or the best surface. The strongest alternative is that the current positive single-band profile lacks the phase behavior needed for water; a tone change may improve modeled relief while leaving front identity and overlapping-disturbance behavior unresolved.

## Frozen factors and record

A uses the unchanged point rendering with ambient, auto and polish off. B retains the exact geometry/point seeds, sources, clock, XY displacement, point size, sprite shape, opacity, camera, clear color and base palette; only declared RGB tone response changes. Light reversal is a correctness diagnostic of B, not a third candidate. Compare seed47 single/pair scenarios without manual events. No scene context or safe-zone effect in the primary field-only comparison.

Before any preferred-image review, freeze coefficients in source/export: derivative step and coordinate units, proxy formula, derivative/slope gain, light direction normalization, tonal gain, bounds/clamps, null bias correction and color-space placement. Record every number; do not normalize mean darkness or retune per time/viewport/scenario. No extra matched-coverage control is preregistered: if later useful, propose it separately and label its fixed normalization and purpose rather than silently changing A/B.

For each capture export field identity separately from transfer identity:

- Shared state: geometry hash/dimensions/seed/PRNG, exact full potential and selected event tapes, real Float32 source uniforms, scalar/time/field constants, ambient/auto/polish flags, global/safe scaling, point-size/opacity/shape controls and viewport/budget.
- Transfer: A/B flag, all slope/lighting/tone coefficients, forward/reverse direction, actual injected vertex/fragment shader hashes, original shader hashes and source revision.
- Environment: CSS/framebuffer dimensions, actual DPR, browser/WebGL/renderer, readiness and held state; source hashes after final server restart. Preserve exact capture time before/after screenshot.

A→B→A and light changes must not reseed, regenerate event positions, mutate source ordering, move any point or change opacity. Ignore only explicitly named transfer uniforms when comparing field state. Hashing shared source text alone is insufficient: inspect the shader actually used. Shader injection must assert required marker counts and fail loudly if engine text changes; no silent fallback or altered field in A.

## Slope definition: independent correctness checks

Write the proxy as `H(p, s, t; sources)`, where `p=(x,y)` is in the engine's original world XY plane, `s` is the fixed seed of the evaluated point, and `t` is trial seconds. A derivative with respect to world position has units of proxy-height per world unit; height remains a dimensionless/artificial proxy unless a height scale is explicitly supplied. This is neither screen-pixel slope nor measured physical surface orientation.

State which quantity H is: raw sum, safe-scaled sum, global-scaled value or the saturated size/tone field. If using the saturated engine value, include the derivative of its tanh cap; if using raw sum, disclose that this can exaggerate relief under source overlap compared with capped tone/size. Do not accidentally differentiate the XY displacement vector or introduce a changed scalar field into baseline A. All source envelope/width/strength/age behavior must match the original scalar evaluation, including source hash and angular perturbation.

For finite differences use a declared constant world step h: `(H(p+h ex,s,t)-H(p-h ex,s,t))/(2h)` and similarly for y. Hold **the same s** at all displaced samples; do not choose neighboring lattice seeds or hash displaced coordinates into new random seeds. Re-evaluate position-dependent warp/angle at displaced p if claiming the full derivative. Freezing an intermediate warped position or omitting a warp Jacobian defines a different approximation and must be named. Same-point-conditioned slopes need not form one globally smooth height sheet across independently seeded points; inspect whether this introduces directional speckle under motion.

At center-distance zero, guard division and undefined direction. Null sources must give finite zero slope and exact unchanged A/B output. Normalize direction with a bounded length or a defined fallback. `atan(0,0)` behavior, narrow widths, strength clamps, old/future/inactive sources and saturated overlap require explicit treatment. Any center convention is a local diagnostic policy, not a new wave model.

Meaningful no-dependency checks should establish:

1. Analytic derivatives on a smooth known function agree with central differences to an a priori numeric tolerance; use a polynomial or Gaussian with known derivative, not the same helper expression twice.
2. The point-conditioned engine proxy agrees numerically with independently transcribed scalar evaluation at off-center samples, current temporal envelope and seed warp. A slope test at h and h/2 checks sensitivity/convergence, with narrow/center regions separately disclosed. Do not demand bitwise CPU/GPU transcendental identity.
3. Empty/zero proxy and constant proxy yield finite zero response; fixed forward/reverse light yields opposite signed directional contrast before nonlinear clipping. Exact displayed symmetry is only required if implied by the declared transfer; gamma, clamping and tone bounds can break pixel-level antisymmetry.
4. Overlap/cap handling is intentional: test a stronger multi-source state and verify chosen cap behavior and finite output. Zero/near-zero normal/light inputs must not produce NaN/Inf.
5. Preserve failing-before/passing-after evidence for the new behavior and rerun baseline replay tests. Passing math tests alone do not establish the injected GLSL uses that math.

If a normal-based Lambert term is used, subtract its flat-surface response or otherwise demonstrate the flat null. Reversing the horizontal light direction with its vertical component held fixed should reverse the directional term about the flat response; negating the entire light vector is a different test and can simply extinguish diffuse light. State which reversal is performed. If the transfer is a signed gradient dot product, record its expected sign convention directly.

## Bounded capture matrix

Primary: 2 viewports × 2 scenarios × 3 times × 2 transfers = **24 PNGs**. Viewports 1440×900 and 390×844 at requested/applied DPR1; seed47; ambient/auto/polish off; scenarios single/pair; times1.25,2,3 seconds (events at1s). No geometry/context drift. Compare within viewport; cross-viewport apparent width/speed reflects world-to-pixel scaling and budget too.

Additional correctness budget, not a tuning sweep:

- **Four null images:** A/B at no-source t0 for each viewport. Require exact decoded RGB equality within renderer; explicit finite checks of slope/transfer uniforms. An exact null must not depend on a gain secretly set to zero only for the null.
- **Four reversal images:** reverse-light B at single/pair t2 in each viewport, paired to the existing forward B. Check signed cue orientation qualitatively against declared direction; A must be independent of light.
- **Four repeat images:** B at single/pair t2 in each viewport after later→earlier seeks and A/B/light detours. Require matching full shared/transfer state and decoded pixels. Add A repeats only if parity or a suspected state leak warrants them.
- **Four baseline parity references:** frozen Stage0 C00 at single/pair t2 in each viewport. Pair against new A. Existing Stage0 pair t2 PNGs can be reused if identities match; single references require coordinator capture. Require exact decoded RGB equality on the same renderer/configuration; otherwise explain and resolve before interpreting B.

Thus at most 40 still files for the planned set, with four baseline references potentially reused. Do not expand a complete time/seed/light/gain sweep. Preserve wrong/old files separately and exclude them from the active manifest, as in Stage0's context correction.

Continuous evidence: **eight clips** = A/B × single/pair × desktop/mobile, trial0..6s including event at1s. Same playback schedule and held initial state, no manual input, no camera changes, same recording frame rate/codec/dimensions where possible. Record trial start relative to recording start, actual first/last trial timestamp and playback end/reset behavior so loading frames or an off-by-one start are not mistaken for different dynamics. Avoid clamped clipping/cropping; retain native output or document scale. Record one explicit timing/environment description, not unsupported GPU speed claims.

For review, extract a small fixed set of presented frames around t0,1.25,2,3,5 plus one short adjacent sequence around t2. Match trial time, not container timestamp alone. Mark pacing/codec artifacts separately from the rendered field; missing/dropped frames limit temporal conclusions. Reviewer uses delivered frames/state only, with no browser-session access.

## Interpretation and gates

First validate null, A parity, field invariance and repeats. Any failure blocks attribution to shading; fix only the affected controls before evaluating aesthetics. A compile fallback or changed source/geometry is not an acceptable “close enough” baseline.

Then assess visible signed light/dark flanks under B and their reversal; continuity along fronts; stable cue direction through travel and overlap; fine-texture popping/speckle; and whether front identity remains trackable. Report specific clip/time/viewport examples. Directional flanks support a relief-cue reading; they do not establish measured height, a continuous normal field or physically interacting waves. A reviewer’s water/relief impression is qualitative evidence, not a user-study result.

Report mean darkness and paired luminance-difference/coverage as descriptive confound checks only. No condition wins by having more dark pixels. Dot centers, sizes and alpha must be invariant by source/state checks even when thresholded image components change. Light reversal may shift apparent bright/dark edges without moving points. Signed image changes under fixed geometry are tonal response, not crest travel.

Verdict categories:

- **Valid diagnostic, relief cue supported:** controls pass and declared directional cue is visible/stable at cited states/motion intervals. Keep unresolved water/phase questions explicit.
- **Valid diagnostic, benefit unresolved/negative:** controls pass but cue is weak, noisy, unstable or only darker. Preserve the result; strongest alternative predicts signed phase structure may matter more than transfer.
- **Invalid comparison:** null/parity/field invariance/source identity fails or capture times cannot be paired. Correct the harness/evidence before any design conclusion.

Stop after the diagnostic and motion review. No automatic solver choice, new dither, objects, coefficient rescue pass or homepage integration. A subsequent signed-profile experiment requires a separate decision.
