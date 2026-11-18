# Stage 2 signed-profile implementation handoff

2026-10-17 · Source frozen and ready. URL: `http://localhost:5176/studies/ripple-profile/`. Strict5176 study-config server was explicitly restarted after final source bytes, before READY. No source work remains in this assignment; primary captures/motion and production selection belong to the coordinator.

## Controlled change

P uses the exact unchanged engine material. S applies a guarded replacement of its single bump assignment:

`bump = strength × spatialEnvelope × temporalEnvelope × cos(2π × delta / 0.14)`.

Wavelength **0.14 world units** was declared before screenshots and never tuned. Delta already includes existing point-conditioned warp/angular perturbation. All remaining parameters, envelope, temporal decay, propagation speed, geometry, seeds, source tape and sampler stay fixed. Both materials share ALL original uniform objects; their fragment shader is identical. Signed bump feeds scalar sum and vector displacement through the original code. No slope shading, palette changes, dither, backdrop, scene objects or solver were introduced. Ambient, auto, polish and safe zone are disabled. P/S toggles do not reseed or alter inputs.

This analytic signed field supplies alternating phase structure within the original moving envelope. It does not exchange neighbor state, simulate water physics or establish reference provenance. A local fixed-position carrier has nominal frequency0.84/0.14=6cycles/s before warp/envelope effects; inspect actual motion/fine texture rather than inferring calmness from stills.

## Display interpretation and caps

Signed scalar bumps sum linearly **before** the existing odd tanh cap; opposite equal phases can cancel there. Radial vectors also sum signed bumps, but different source directions mean scalar cancellation need not cancel displacement. Scalar/vector soft caps, sprite overlap and alpha blending make displayed response nonlinear.

With ambient off, capped scalar H tends to±1/1.02=±0.980392. Unchanged point output:

- Framebuffer diameter: `max((3.2 + 6.4H + jitter) × DPR, .5)`, with jitter=(seed−.5)×.14.
- Floor onset: `H=(.5/DPR−3.2−jitter)/6.4`, nominal−.421875 at DPR1/seed.5; full seed range about−.433…−.411. **−.5 is the unclamped zero-size threshold, not floor onset.**
- Opacity lift: `max(1 + 1.25H, 0)`, then current base opacity/min1 clamp. Alpha is zero at H≤−.8.
- Negative H lightens existing tone, but decreasing size/alpha can dominate. Troughs can become sparse or invisible; a dark/light band is not a direct signed-height measurement.

These guards were documented and tested without silently changing the transfer. `negativeTransferReference` in exports records CPU examples from actual constants (not measured GPU output): at H0, diameter3.2/alpha.215; H−.25, diameter1.6/alpha.1478125; H−.5, diameter.5/alpha.080625; H≤−.8, alpha0 at DPR1/seed.5.

## Files and API

Owned files only: new `studies/ripple-profile/{index.html,main.ts,study.css,profile.mjs,profile.d.mts,profile.test.mjs,tsconfig.json,vite.config.ts,.gitignore,README.md,evidence/}` and this report. Existing production, engine, Stage0 and Stage1 files were not edited; seeded helpers were reused read-only. No dependencies installed. Build output is study-local/ignored.

`window.rippleProfile`: `setState({time,seed,scenario:'single'|'pair'|'null',profile:'P'|'S'})`, `seek`, `hold/pause`, `play`, `restart`, cheap `getTime/getState`, `clearManual/addManual`, `setPanelVisible`, `awaitReady`, `exportState`. Trial0…6s enables reuse of established controls; coordinator movies use0…4s. Starts held; reduced-motion changes pause; explicit inspection remains available. Opt-in canvas pointer input logs separate manual tape; clear it before scripted captures. No import promise.

Schema `ripple-profile/v1` separates equal **controlIdentity/controls** (time, geometry, ALL base uniforms, actual Float32 source arrays, tapes/slots) from intentionally profile-dependent **fieldIdentity/field**. It also exports profile/wavelength, actual material shaders/FNV/SHA256, actual expanded submitted GL sources/hash/link status, viewport/DPR/budget, renderer identity, engine constants and file SHA256 revision. Source/geometry/time invariance is distinct from changed field dynamics. AwaitReady is not proof of screenshot compositing. Full runnable commands/API are in the study README.

## Verification

Meaningful compact TDD: five assertions failed against initial stubs for signed lobes on both sides of zero, P/null/crest preservation, precap linear cancellation, finite/invalid input guards, missing/duplicate shader assignment guards. They passed after implementation. A sixth negative-transfer test failed against its stub and then passed; it documents existing size-floor/alpha cutoff behavior via an export-used CPU reference. No large replay suite was duplicated.

Verified:

```sh
node --test studies/ripple-profile/profile.test.mjs       # 6pass,0fail
node --test studies/ripple-baseline/replay.test.mjs       # 8pass,0fail
npx tsc -p studies/ripple-profile/tsconfig.json            # success
pnpm build                                              # success, chunk-size warning
pnpm exec vite build --config studies/ripple-profile/vite.config.ts # success
```

Evidence: `profile-red.txt`, `negative-transfer-red.txt`, `profile-green.txt`, `baseline-green.txt`, `desktop-smoke.json`, `mobile-smoke.json`, `parity-result.json` and screenshots under study `evidence/`. Final post-restart export and source identity checks are retained there. Browser smoke used its own `stage2-engine`, not coordinator sessions.

| Gate | Observed result |
| --- | --- |
| P↔frozen Stage1 A, desktop1440×900/DPR1/single t2 | **Exact decoded RGB**,0changed pixels,max/mean channel difference0; reused previous dependency-free PNG comparator read-only |
| Desktop null P/S | Exact canvas data-URL equality |
| Shared controls/source arrays across P/S | Equal controlIdentity and source arrays; model fieldIdentity intentionally differs |
| Actual output/model distinction | P/S disturbance pixels differ; neither is called a visual winner |
| Desktop out-of-order seek return | Exact canvas repeat |
| Both GPU programs | Linked; zero shader errors in smoke |
| Mobile390×844/DPR1/pair t2 | Null/repeat/control gates pass; shared hash2bbc56f2,65×140points; no horizontal overflow |
| Reduced-motion preference | Held; explicit fixed-time inspection works |

The software driver emits ReadPixels stall warnings. These captures establish local correctness/appearance only, not real mobile/GPU performance. Pure tests establish signed math and guard behavior, not measured per-vertex rendered trough heights. Original core atan(0,0) behavior is deliberately untouched.

## Decision boundary

Strongest remaining alternative: point-size/opacity sampling may still conceal signed relief or read as animated dot bands even if fronts gain phase structure. Evidence against a physical-height interpretation includes nonlinear trough visibility and seed-conditioned field variation. Positive and signed profiles can be valid controlled candidates without either being convincing water.

Next: coordinator's12signed primary stills, small null/repeat diagnostics and4desktop P/S single/pair movies, then independent source/visual review. Use that result for the explicit production direction and reusable surface/intro/no-resume playground assignment. Do not prolong this into another broad study or claim the final user experience is finished here.
