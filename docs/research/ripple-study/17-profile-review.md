# Stage 2 signed-profile protocol and independent review

2026-10-17 · **FINAL: controlled signed-profile diagnostic passes; native fixed states support clearer successive ripple bands. Continuous water relief and precise phase-motion benefit remain unestablished.** No browser/source/dependency changes, agents or new dynamics experiments performed by reviewer. Earlier pending statements below record review history, superseded by the final sections.

## Bounded protocol

Question: does a signed carrier expose a train of ripple bands while original point transfer A remains fixed? P is untouched engine material. S replaces exactly one original `bump = str*spatial*temporal` with that expression times `cos(2π delta/.14)`. Wavelength=.14 world is preregistered. Original source timing/envelope/warp/strength/width, geometry/seeds, camera, palette and transfer are fixed. Signed bump contributes both scalar field and vector displacement; changed displacement is intentionally part of the profile-model factor. No shading B, dither, objects, extra noise, perspective or coefficient rescue.

Use seed47; single/pair at1.25,2,3s; desktop1440×900 and mobile390×844; actual DPR1; ambient/auto/safe/polish off. Clear manual events, hold exact time and require state equality before/after screenshots. Reuse12 Stage1 A PNGs only with matching source/control/shader/geometry identity. Capture exactly20 new stills:12 S primary,2 S null,2 S repeats and4 P parity (single/pair t2 at each viewport). Compare S null against existing same-viewport Stage1 A null. Repeat S pair t2 in each viewport after later/earlier seeks and profile/scenario detours. No full gain/wavelength sweep.

Four desktop clips P/S × single/pair, trial0..4, same recording settings including predeclared12Mbps bitrate, are a bounded improvement over earlier VP8 capture. Preserve raw recordings, source/controls before and after, actual stop/hold trial time, codec/dimensions, initial hold/play offset and monotonic wall/trial trace. Same bitrate is not a guarantee of identical encoded quality or exact frame correspondence. Use small indexed native frame samples and disclose time uncertainty; do not interpret radius differences at nominal video timestamps as phase-model effects without matched trial evidence. Exact stills remain authoritative for equal-time shape.

## Correctness gates before interpretation

- `controlIdentity` and full control records must agree between P/S: time/seed/scenario, geometry/seeds, sources/tapes/Float32 arrays, all base uniforms, budget/viewport/camera/transfer. `fieldIdentity` SHOULD differ because the profile model differs; do not incorrectly demand same modeled field.
- Source injection must require exactly one original bump marker, reject missing/duplicate anchors and invalid wavelength, preserve original P/fragment/size/opacity, and compile/link both paths without fallback. Export supplied and submitted shader text/hashes plus final source revisions; restart after final bytes before captures.
- Tests show positive/negative/zero carrier values, P bypass, null, finite bounded input, opposite-signed additive cancellation BEFORE cap, coherent-source addition and injection guard failures. Validate output guard implications from original formulas/constants; do not add a silent transfer fix.
- Four decoded P↔Stage1 A parity checks, two S null comparisons and two S replay repeats must be exact on the same renderer or explained/resolved before attributing changes to the carrier. Pure tests do not replace GPU compilation or pixel gates.
- Root/previous studies stay unchanged. No performance/user-preference/water-realism conclusion follows from software renderer or changed darkness/coverage alone.

## Negative field: what the original display can and cannot show

Source authority: `src/engine/rippleFieldMaterial.ts` scalar cap/point size (approximately lines428–443) and tone/opacity (approximately502–513); constants are supplied unchanged. Let H be capped field/sizeBoost with ambient off:

`H = tanh(rawSum × safeMul × globalScale ×1.02)/1.02`.

This caps both signs near±.980392. Scalar contributions add linearly before this cap. Original vector displacement separately sums `dir*bump`, then receives its own vector-length cap; scalar cancellation need not cancel displacement when source directions differ. Neither is stateful fluid coupling.

Original point diameter is `max((3.2 +6.4H +restJitter)*DPR,.5)` with rest jitter approximately±.07 CSS px. At DPR1 the **framebuffer floor starts around H=−.422**, varying approximately−.433…−.411 by seed: solve `(3.2+6.4H+jitter)=.5`. The zero-crossing of the *unclamped* diameter is near−.5, a different threshold; do not confuse them. For DPRd the floor threshold is `H=(.5/d−3.2−jitter)/6.4`. This means a trough can become a tiny dot rather than retain the same sampled area.

Original opacity lift is `max(1+1.25H,0)`; with unchanged opacity .215 and edge mask, alpha reaches0 at H≤−.8, even though a point-size floor remains. Negative H raises the linear tone multiplier `max(1−.62H,0)` above1, but cannot restore a fully transparent point. Negative lobes can therefore appear through lower coverage, brighter/lower-alpha dots or complete disappearance. A thresholded image is not a signed-height map. Tanh, size floor, alpha clamp and overlapping transparent sprites prevent displayed cancellation/additivity from remaining linear.

The initial notification to implementer described the floor loosely as near−.5. This report corrects the exact framebuffer-floor onset to approximately−.422 at DPR1; −.5 is the unclamped zero-diameter threshold. The equations, not the rough notification, are authoritative.

## Emerging source checks

Inspected `studies/ripple-profile/profile.mjs`, tests and main harness. Injection changes one original vertex bump expression; fragment remains original. P/S share uniform objects and geometry, and profile switching does not regenerate sources. `controls` separates shared settings from `profileSettings`; model field identity includes profile intentionally. Source uniforms come from real buffer replay; source ordering/capacity reuse frozen baseline helpers. Manual tape is separate and persistent; clear it for scripted comparisons. Both shader paths compile before exposing API, with errors intended to stop the diagnostic.

Tests have hand-derived cosine sign/zero/period cases and equal-envelope synthetic cancellation; these do not assert that arbitrary spatially separated real sources have equal envelopes or cancel everywhere. No confirmed comparison-invalidating source defect at this emerging stage. Requested bounded negative-output guard tests/docs directly from implementer and informed coordinator.

## Interpretation rubric and decision

Look for multiple alternately modulated bands around the same disturbance, coherent outward phase progression, behavior where fronts overlap, and whether point sampling turns troughs into distracting gaps/speckle. Cite exact still/clip/time/viewport. Separate geometric displacement, sprite coverage and tonal cues. More dark pixels or more connected image components is not more water-like geometry.

Strongest alternative if S improves phase structure but still lacks water reading: original sparse point transfer conceals a continuous relief surface. If S is noisy or weak, do not conclude all signed profiles fail; the specific carrier, narrow envelope, independent per-point conditioning and capped display constrain this candidate. No unbounded wavelength/gain sweep is authorized.

Final categories: valid comparison with specific ripple-train benefit; valid comparison but benefit unresolved/negative; or invalid comparison requiring a bounded control repair. A useful signed-profile result supports an explicit rendering/production choice, not automatic adoption or a solver claim. Intro and separate playground remain required end-to-end deliverables owned by coordinator's next integration assignment.

## Frozen source portion and preliminary verification

Source-freeze/restarted strict5176 handoff received. Independently ran study TypeScript check (exit0) and14 combined profile/replay tests (6 new+8 baseline, all pass). New negativeTransferReference tests cover H0,−.25,−.9 and a DPR2 floor, with rejected zero DPR; metadata explicitly labels its guard values as a CPU reference, not measured per-vertex GPU output. Original shader remains authority for the transfer.

Delivered desktop/mobile smoke records report null/repeat/shared-control equality, no shader errors, both programs linked, separate model identities and different P/S pixels. Mobile reduced motion is held; geometry2bbc56f2 at390×844/DPR1. A preliminary desktop single t2 parity report has0 changed decoded RGB pixels against Stage1 A. These smoke records support readiness, not the final coordinator matrix or a water-realism result.

**Source portion passes:** single marker replacement only, fixed .14 wavelength, original P and fragment/size/alpha code unchanged, signed bump intentionally reaches both scalar and vector sums; shared controls and model identities are correctly separated. No comparison-invalidating defect identified. Await final source-hash/manifests/null/parity/repeats and four short desktop clips.

## Coordinator still evidence

Independent checks on final20-state capture manifest and reused12 Stage1A reference states pass: held clock/no manual events, DPR1, ambient/safe/polish off, fixed wavelength.14, exact current source-file hashes, supplied shader SHA256, S regenerated exactly from P by one bump replacement, identical P/S fragment and linked programs. Reused controls match current sources/tapes/all base uniforms, geometry, viewport/budget and engine parameters; current P shader text equals old A. All8 decoded equality gates pass:4 P parity,2 S null and2 S repeats. Error list empty. Coordinator chose desktop single and mobile pair for two repeats rather than pair at both; bounded repetition coverage remains meaningful and is disclosed here.

Native PNG inspection via view_image: mobile single t1.25 S shows several separated concentric bands around the disturbance, contrasting with old P's broad coverage patch. Desktop single t2 similarly shows narrow nested arcs; desktop/mobile pair states show multiple curved bands and overlap regions rather than one broad darkened area. This supports a spatial ripple-train benefit at these settings. The pale gaps are compatible with the negative-field transfer guards; do not call them measured trough heights or scalar cancellation. Sparse seed-conditioned dots remain obvious, without demonstrated continuous relief/reflection.

Mean darkness drops across sampled S states relative to P. For example desktop pair t2: P.023835/S.012367; mobile pair t2: P.033183/S.013495. These are normalized display-luminance darkness means, not preference or physical depth scores. Mobile single t3 is almost unchanged background in both; by that time much of the expanding field is outside the narrow viewport, so this alone does not establish a different temporal decay.

At nominal speed.84world/s and wavelength.14world, an ideal fixed-location carrier changes at6cycles/s, before angular/width perturbation. Sparse/duplicate video frames can alias that phase even with improved bitrate. Clip timing/presentation must be considered before any coherent-motion acceptance. Await final four clips/frame handoff.

## Final motion evidence and verdict

Four desktop P/S single/pair clips delivered with before/after state, polled wall/trial traces and no recorded errors. Each starts held at0 and records through approximately4s; actual stop times are4.0635,4.0179,4.1317 and4.0781 respectively, so these are not exact matched endpoint samples. Requested capture30fps and same predeclared12Mbps VP8 are recording settings, not measured presentation rates or a controlled production-performance result. Raw clips retained; seekable versions remux without re-encoding.

Inspected native indexed frames from all four clips with view_image: single P/S around intended1.25, S around1.9/2/2.1, pair P/S around2 and S around3. S's separated arcs are visible early; later samples are faint and point/codec texture dominates. The three adjacent nominal S samples do not support fine phase/smoothness claims because timing is approximate and encoded frames can repeat or blur. Review is delivered-frame inspection, not continuous playback. No claim that12Mbps resolves temporal sampling, no new recapture or coefficient tuning requested. Exact fixed states are authoritative for the demonstrated spatial change.

**Validity: PASS.** Shared controls/source events and original transfer are preserved, P parity/null/repeats exact, S differs by the preregistered signed multiplier only. **Observed benefit:** clearer successive narrow bands versus the broad P coverage patch. **Unresolved:** continuous surface relief, convincing water realism, physically interacting waves and smooth fine phase motion. Reduced negative-field coverage is not measured trough depth. No software-renderer speed/battery/mobile performance inference.

This is sufficient evidence to carry the signed phase principle into an explicitly new continuous shaded presentation, if coordinator chooses it. It is not automatic acceptance of point output or proof of the reference's pipeline. No broader study or gain/wavelength rescue is required by this review; proceed to bounded implementation/visual acceptance of the user's surface, intro and playground goal.

## Critical constraints for the proposed production extension

Read `SURFACE-DELIVERY.md` and `src/experience/types.ts`. The continuous mesh is a declared rendering/model extension: speed~.42 rather than diagnostic.84, smooth ambient sum rather than old contours, and true geometric height rather than point-size/alpha proxy. Keep those differences explicit. No mathematical or contract blocker to this direction, provided implementation meets these checks:

1. For a packet `h=E(delta,t) cos(k delta)` derive spatial slope as `[E_delta cos(k delta) − k E sin(k delta)] grad(delta)`, including any spatial attenuation/window derivative. Reusing only the carrier derivative gives incorrect normals. If summed height is smoothly capped, apply the cap derivative to the **whole summed gradient**, including ambient if capped together. A tanh height cap alone does not necessarily bound maximum slope. State height/world units and normal basis consistently with the displaced plane.
2. Regularize radial distance smoothly at the source center and differentiate that same radius; no division-by-zero or arbitrary mismatched center normal. Bound strength/time inputs, source count/lifetime, phase magnitude and packet envelope. Causality/onset should avoid an unintended instantaneous height pop; any attack is a declared production parameter. Test analytic gradients against independent central differences off-center, at regularized center, near cap/overlap and at source activation/expiry.
3. Mesh cell width must resolve the shortest wave in both axes;2samples/cycle is only the aliasing limit, not a good geometric-quality target. Aim for several samples per shortest wavelength (e.g.6–8), declare actual world cell spacing and vertex budget per displayed aspect, then inspect grazing/high-slope specular behavior. Pixel DPR cannot repair under-tessellated geometry. Pause/resume temporal sampling must avoid large phase jumps; remaining browser pacing is not proof of wrong wave equations.
4. Map normalized input through the actual displayed canvas/camera to the water plane. If perspective/tilt is used, screen-normalized XY is not automatically plane-world XY; use inverse projection/ray-plane mapping and a defined behavior outside the mesh. Resize from element bounds with finite nonzero dimensions; avoid rebuilding geometry every frame.
5. One owner for RAF/observer/context listeners/resources; dispose idempotently and prevent all post-dispose callbacks/renders. UI owns pointer/key/preferences per contract. Disturb while paused, hidden/lost or disposed must not queue for a later burst. Clear removes disturbances without changing pause/strength/reseeding; define whether ambient remains. Source expiry/buffer reuse must remain bounded and deterministic enough to test.
6. Keep explicit user pause separate from automatic hidden/offscreen/context suspension. Resume resets wall-clock origin without advancing by the hidden interval; do not accidentally unpause an explicitly paused controller on visibility/context recovery. Cancel preventable background RAF work. Handle context loss with preventDefault/recovery status, and ensure stale restore callbacks cannot resurrect a disposed instance. Initialization failure must not leak a partially created renderer/observer.
7. Validate the synchronous factory/onChange contract, finite setters and status emissions after initialization and actual pause/status changes, never per frame. React StrictMode mount→dispose→mount must not retain extra loops/listeners or shared stale resources. Verify CPU reference and actual shader formulas agree, not just two copies of one mistaken derivative. Preserve UI fallback/retry semantics and keep diagnostics out of product UI.

These are bounded implementation/review constraints, not an additional research program or a realism acceptance claim.
