# Stage 1 independent shading review

2026-10-17 · **FINAL: valid controlled diagnostic; perceptual relief/water benefit unresolved at the preregistered gains.** All still correctness gates pass. Eight recorded clips were delivered and their sampled frames reviewed, with substantial timing/codec limits on fine motion inference. No browser use, source edits, dependency changes or agents. Protocol: `11-shading-review-protocol.md`.

The source-review history below records early pending items; the final evidence section resolves them. This review does not complete the user's realistic-surface, intro or separate playground deliverables.

## Preregistered candidate

Implementer declared h=.0025 world units; proxy H is existing capped scalar; fixed point seed across samples; normal proxy `normalize(-.06*dHdx,-.06*dHdy,1)`; planar light at35°; multiplier `1+.45 dot(N.xy,Lxy)`; reversal flips planar L. No per-frame coverage normalization. Candidate changes directional tone only, not phase/dynamics, displacement or objects. These coefficients were communicated before primary visual captures.

## Emerging source observations

Inspected `studies/ripple-shading/math.mjs`, `math.test.mjs`, `shader.mjs`, `shader.test.mjs` while implementer was active. Seven current math/contract tests pass. They establish generic central-difference reasoning versus an analytic Gaussian, flat/reversed/bounded CPU transfer behavior, and loud failure on missing/duplicate shader anchors or invalid coefficients. Preserved red logs exist; not yet reviewed as final evidence.

Shader helper extracts the original vertex code from original point position through capped sizeBoost, replaces point position with its argument and aSeed with a fixed sample seed, removes the transformed-position write, and returns sizeBoost. Thus sampled H retains temporal decay, per-source widths/hash/angular perturbation, safe/global multiplication and tanh saturation, with warp re-evaluated at each p±h. It includes unused original displacement arithmetic, which should be disclosed in cost reasoning; do not claim measured shader savings from assumed compiler dead-code removal.

B adds four H samples, derives the slope at the original p, and multiplies RGB tone. Original main's point displacement, size and opacity expressions are not intentionally replaced. Center `atan(0,0)` is guarded in extracted H only, a declared proxy convention rather than a baseline-A change. A's actual construction/field metadata and browser parity remain to review at harness handoff.

## Material review request

Sent directly to implementer: generic Gaussian math validates centralSlope but is not independent numerical validation of the actual extracted point-conditioned engine proxy. Requested bounded off-center/overlap H numeric checks or h-versus-h/2 sensitivity, with center/narrow-region limits disclosed. No defect in copied field has been established; evidence gap remains pending implementer response.

## Pending

Frozen harness and actual shader/source identity; unchanged baseline/engine check; field-vs-transfer metadata invariance; slope units and seed treatment documentation; null/reversal/repeat/A↔Stage0 parity captures; fixed coefficients; shader compilation/finite states; eight paired motion recordings with trial-time mapping and delivered frames. No relief-quality, water-realism or performance verdict yet.

## Harness and numerical probe inspection (pre-freeze)

Emerging `main.ts` uses one Points geometry and shares the existing uniform objects between A/B. Transfer switching does not rebuild geometry; seed/resize are explicit rebuild causes. Ambient/auto/safe/polish are off, source replay uses frozen baseline helpers, and manual events are separately logged/clearable. Actual supplied shader sources and FNV/SHA256 values are exported alongside field/transfer settings and code revision. Hashes describe supplied ShaderMaterial source, not a full driver-expanded shader/build attestation.

Independently ran study TypeScript check (exit0) and combined new math/contract plus frozen-baseline replay suite: **15/15 pass**. Final freeze and browser validation remain pending.

Read `evidence/gpu-proxy-probes.txt`: actual GPU extracted H/central derivatives at h=.0025 versus h/2=.00125, two off-center samples each for single t1.25 and pair t2. H is identical between step runs at those positions; max absolute gradient-component change is .000405312, and relative component differences are under approximately .05%. Shader error list is empty in the delivered probe record. This is bounded local sensitivity evidence using the actual evaluator, not an independent proof of global convergence, continuity across seeds, or behavior arbitrarily close to source centers. The generic Gaussian analytic test supplies separate numerical reasoning; copied-source inspection connects H to the engine. These together address the earlier evidence gap for the scoped diagnostic, subject to final source identity/runtime checks.

Probe uses Float32 color target with explicit capability/incomplete-output rejection and restores target/viewport before redrawing the field. Four extra H samples for B are a known cost, not measured production performance.

## Implementation smoke records (not coordinator verdict)

`evidence/desktop-smoke.txt` records exact no-source canvas equality forward/reversed, shared field/base uniforms across transfers, repeat equality, reversal changes, and finite actual-GPU center/near-center output with 20 strong/narrow manual events. Strength is clamped by the unchanged engine; these values are an extreme-input smoke, not physical behavior evidence. `evidence/mobile-smoke.txt` records null/repeat/identity success, reduced-motion held state, 390×844/DPR1 geometry2bbc56f2, no reported shader errors or overflow.

`evidence/parity-result.json` reports one 1440×900 A-versus-Stage0 comparison with exact decoded RGB equality. This supports preliminary A parity for that state; coordinator's full four parity references are still needed. No conclusion drawn from images or recording-system smoke files before primary handoff.

## Frozen source portion

Received final source-freeze/restart handoff. Re-read `main.ts`, README and shader helper; independently reran final study TypeScript check (exit0) and all15 new/baseline tests (pass). `git diff --stat` is empty for tracked files: no production or frozen Stage0 edits. Field metadata now includes all base uniforms and copied tapes; shader metadata also exports actual submitted `gl.getShaderSource` text, link status and hashes, classified as A/B/probe.

**Source portion passes:** no comparison-invalidating defect identified. A remains original material; B shares all original uniform objects and geometry, with additive slope/tone code only. Seed remains fixed across offset samples; original world coordinates, full seed-conditioned warp, source envelope/width, safe/global scaling and capped field are retained. Heights are explicitly a proxy; per-point seeds do not define one smooth sheet. Step/gains/light remain the preregistered constants. Null behavior and planar reversal follow the declared signed transfer. No fallback, new dynamics, alpha/size/displacement changes or coverage normalization were found.

Actual null/parity/repeat/compiled-state gates and clip timing/frame review remain pending coordinator handoff. Source correctness alone cannot support a relief or water-reading verdict.

## Coordinator still matrix: independent validity checks

Read final `output/playwright/stage-1/capture-manifest.json`, `image-metrics.json` and capture/analysis scripts. Active set has24 primary,4 null,4 reverse,4 repeat and4 Stage0 reference PNGs. Independently validated all36 shading-state records: held, no manual events, DPR1, ambient/safe/polish0, fixed coefficients, exact event prefix/recycling and Float32 sources, source hashes matching disk, supplied shader SHA256 values, and regenerated B source exactly equal to injectShading(A). Both actual A/B programs are linked. All12 primary pairs have identical field identity, full field/base uniforms, geometry, engine parameters, viewport/budget, renderer and source revision.

Decoded metrics show10/10 equality gates pass:4 B repeats,4 A↔Stage0 parity pairs,2 null A/B pairs. Error list is empty. Reduced-motion before/after states remain held at0. No still-validity blocker identified.

Whole-canvas mean absolute normalized display-luminance A/B difference spans0…0.0002735803; maximum is mobile pair t2. Mean-darkness shifts are much smaller and can have either sign. Mobile single t3 is pixel-identical A/B. These are descriptive RGB results, not perception thresholds or depth scores. Native `view_image` inspection of mobile single t1.25 A/B and desktop pair t2 B shows essentially the same broad point bands; a compelling relief improvement is not established from those stills. This does not invalidate the nonzero directional response or prove all slope shading ineffective. Paired motion review remains pending.

## Final motion/evidence review

Validated all8 records across `motion-desktop.json` and `motion-mobile.json`: same paired A/B starting field at trial0 and ending field at6, held end, no manual events, source hashes matching disk, monotonic polled wall/trial clocks and no recorded errors. Files are nonempty. Recording uses requested canvas capture30fps + VP8, approximately200ms initial hold, then browser trial0..6; remuxed seekable files preserve the encoded stream, with originals retained. Requested30fps is not evidence of30 presented frames per second.

Inspected delivered native motion frames with `view_image` from all8 clips: mobile single A/B near intended1.25, mobile pair A/B near2, desktop single A/B near2, desktop pair A near2 and B near1.9/2/2.1; also mobile single B near3/5. The sequence supports broad outward progression and later return to the quiet lattice. Pair frames retain broad overlapping bands; no new reflected/coupled phase behavior follows from the tone-only candidate. This reviewer inspected sampled frames and timing manifests, **not continuous browser playback**.

Desktop encoded frames have obvious block/flat-region texture loss compared with exact PNG stills. The three adjacent intended desktop pair-B samples appear unchanged, consistent with duplicate/stale encoded frames or sparse presentation; this cannot establish a stable procedural texture. Approximate time labels are materially uncertain. At recorder wall `playOffset+2s`, the adjacent polled trial values are:

| Clip | Bracketing observed trial values | Poll interval |
|---|---:|---:|
| Desktop single A |1.777…1.977s|234.9ms|
| Desktop single B |1.410…1.827s|330.7ms|
| Desktop pair A |1.762…1.995s|225.9ms|
| Desktop pair B |1.702…1.886s|211.0ms|

These are clock-poll observations, not certified encoded-frame times or GPU measurements. Encoder timestamp origin introduces further uncertainty. They show why nominal t2 A/B video samples cannot be treated as equal field states. Radius/edge differences in those frames must not be attributed to shading. The mobile traces are more closely sampled at that location (roughly89–123ms intervals), but still do not certify frame-exact pairing.

### Reversal and null interpretation

Independently checked all4 reversal records: full field unchanged and planar L exactly negated, with nonidentical forward/reverse decoded RGB. Mean absolute luminance differences are .00016236 desktop single, .00033320 desktop pair, .00017127 mobile single and .00054558 mobile pair. CPU transfer reversal tests independently establish opposite signed modulation about multiplier1. Native reversal still inspection does not establish a strong perceptual depth flip; the visual effect remains subtle. The exact flat null excludes a constant lighting bias.

### Final verdict and useful next decision

**Comparison correctness: PASS.** Same field, seed treatment, original-point coordinate basis, capped proxy/global scaling, fixed coefficients, shader identity/link status, null, A↔Stage0 parity and out-of-order repeats are supported. No remaining comparison-invalidating source defect. The supplied code and captured state justify attributing exact-still differences to tone, not geometry, alpha, wave dynamics or random reseeding.

**Perceptual outcome: unresolved/weak at these gains.** Broad bands remain the dominant impression in inspected native stills and sampled motion frames. A convincing relief/water improvement is not established. Fine texture stability, smooth continuous front motion and comparative temporal benefit are inconclusive because the current recording loses subtle detail and does not align frames exactly. Software rendering provides no hardware/mobile performance conclusion. This is a useful limited result, not a failed instrument or proof that shading can never help.

The strongest alternative remains insufficient signed phase structure in the positive single-band proxy. A bounded next **signed-profile** comparison, with transfer/camera/palette fixed, would discriminate that alternative more directly than rescuing this candidate with a gain sweep, dither or objects. This is a proposal for coordinator decision, not authorization or a selected solver. Preserve exact still/state controls; for any subsequent small temporal effect, use explicit rendered trial timestamps or a common deterministic frame schedule before claiming matched motion improvements. Keep real-time pacing evidence separate from such offline temporal samples.

Stop here for this assignment: protocol11 and independent report12 complete; no new dynamics, object rendering, intro integration or playground implementation performed. The user's end-to-end deliverable remains coordinator-owned future work.
