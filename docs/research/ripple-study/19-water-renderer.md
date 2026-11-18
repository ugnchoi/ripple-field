# Reusable water renderer: production handoff

2026-10-17 · Actual factory implemented and provisionally source-frozen; integrated native quality acceptance remains coordinator-owned. This replaces the point presentation with a new continuous shaded field; it is not an assertion that either diagnostic or the reference used this pipeline.

## Factory and ownership

`src/water/index.ts` exports `createWaterSurface`, satisfying read-only `src/experience/types.ts` SurfaceFactory. Extended WaterSurfaceController adds read-only getDiagnostics for verification. UI uses the existing contract only; no shipped debug global, global pointer or key handlers. UI worker/coordinator own App/entry/navigation/intro/playground wiring, outside this worker's source ownership.

Owned files: `src/water/{field.mjs,field.d.mts,field.test.mjs,sourceState.mjs,sourceState.d.mts,sourceState.test.mjs,shaders.ts,createWaterSurface.ts,index.ts,README.md,smoke/**}` and this report. No production legacy engine, frozen studies or experience source edits by this worker; no dependencies. Smoke route: `http://localhost:5177/src/water/smoke/` (strict5177). Its separate HTML alone exposes window.waterSmoke.

## Declared production model

All coefficients below were declared before the first production native-image pass. Full equations/units/API/commands are in `src/water/README.md`.

- Orthographic top-down XY extent[-aspect,aspect]×[-1,1], actual height worldZ. Input normalized0…1 top-left maps using the displayed canvas bounds. No perspective or objects.
- Signed packet: regularized radius sqrt(q²+.018²); delta=r−.42age; width.18world; amplitude.014world×strength; wavelength.14world; temporal rise1−exp(−age/.10), decay exp(−.75age), smooth age-only tail7.5…8s. Max16sources, strengths clamped0…1, negligible aged sources expire at8s. This calmer speed and continuous sampling are new production decisions.
- Evaluate height and gradient together in one source loop. Derivative includes Gaussian envelope AND signed carrier, multiplied by q/r. Sum optional ambient+all sources before `.035*tanh(raw/.035)`; multiply total gradient by1−tanh². Center regularization makes center gradient finite/zero. No solver, reflections from boundaries or neighbor state.
- Ambient: three quiet smooth sine waves with amplitudes.0016/.0010/.0006world, wavelengths.95/.63/.37, speeds.10/.08/.06world/s, normalized directions(1,.3)/(−.4,1)/(.7,−.8), phases.4/2.1/4.2rad. Caller ambient=false is respected; clear never toggles it.
- Pale sRGB material base#cad8d0, reflection colors#8aa79b/#edf5f0; light normalized(−.6,.75,1), view+Z. Analytic normal normalized(−gx,−gy,1), reflected-y smoothstep±.45, reflection mix.42, diffuse.74+.26N·L(clamped0), Blinn specular exponent64/gain.34/tint(1,.99,.94), existing Three color conversion. No bitmap, dither, postprocess, objects or texture to conceal weak macroform.

Method context: explicit continuous height and analytic orientation are described in [Mark Finch, GPU Gems chapter1](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models), especially sections1.2/1.2.2. Our packet/damping/cap/material are our own declared model; the chapter is not reference-reel provenance, and its historical performance discussion is not a current budget or validation of this renderer.

## Bounded sampling and source/lifecycle ownership

Target12cells/.14world wavelength; max72kvertices desktop/48k for CSSwidth<640; axis segments16…512; DPRcap1.75/1.5. Actual primary desktop275×172segments =47,748vertices,12.03samples/base-cycle; mobile80×172 =14,013vertices,12.04samples.1200×300 gives about8.96samples. Mesh rebuild is resize/aspect/sampling-only; source arrays are bounded Float32 uniforms reused directly. No own per-frame geometry/object allocation in hot loop.

Model-owned time freezes under explicit pause, hidden/offscreen/zero-size/context suspension. Visibility suspension stays separate from user pause and is not fed back as a permanent user setting. Wall timestamps reset on resume; delta cap.05s avoids long-task phase jumps. Consequently software rendering can run simulation slower than wall time: first desktop1.2wall seconds advanced only.15sim seconds under the measured software environment. This is a documented clock behavior, not a claim of nominal real-device FPS/speed.

Paused/lost/suspended/disposed disturbances are dropped, not queued. Clear preserves clock/user pause/strength/ambient. Animation RAF stops when unnecessary. Context loss emits lost; restoration refreshes resources, preserves state/time and emits ready. Fatal failure cleans partial owned resources and emits unavailable/throws appropriately. Dispose is idempotent, removes RAF/observers/context+visibility+resize listeners, disposes geometry/material/renderer and deliberately avoids forceContextLoss so StrictMode can recreate on the SAME canvas. Status callbacks are per transition/initialization, not per frame.

## Verification evidence

Meaningful test-first outputs retained under `src/water/smoke/evidence/`: field-red.txt (4expected assertion failures), state-red.txt (5expected failures), field-green.txt and all-green.txt. Ten tests pass after the authorized duplicate-input guard:

- Analytic full-field gradient versus independent central finite differences at off-center/center/overlap/ambient states, including derivative of total height cap; signed crests/troughs, finite center and smooth onset/expiry.
- Sampling budgets and shortest-wave resolution at desktop/mobile/long canvas.
- Input drop under pause/suspension/loss; user pause preservation, hidden-time exclusion, source expiration, fixed capacity/oldest reuse, strength bounds, clear invariants, irreversible/idempotent disposal and normalized-coordinate mapping.
- Regression for duplicate-input coalescing:16duplicates become1bounded-strength packet; spatially separated pair, .024world offset and .05s follow-up remain independent; original center/start retained. `coalescing-red.txt` records the new failing assertion before implementation, then all-green.txt records10passing.

Verified successful commands:

```sh
node --test src/water/*.test.mjs  #10pass,0fail
npx tsc --noEmit
pnpm build
pnpm exec vite build --config src/water/smoke/vite.config.ts
```

Root build includes concurrent UI worker's integrated entries and passes; chunk-size warning remains. Source/state tests are no-dependency Node tests. Installed Three.js r174/types were inspected for renderer/shader disposal behavior; no version/API assumptions from unrelated examples.

Scoped actual-browser checks used named water-engine; completed study browsers owned by this worker were closed without touching coordinator sessions. Evidence:

| Check | Observed result / artifact |
| --- | --- |
| Native desktop surface | desktop-first.png/json: continuous silver-green nested bright/dark flanks; source.7 at measured simt.15, no shader errors |
| Native mobile surface | mobile.png/json:390×844,single.7 at simt.45;14,013vertices,onegeometry; not a real-device performance measurement |
| Pause/drop | lifecycle.json: time AND frame count frozen; paused input does not increase source count |
| Clear | zero sources, user pause preserved, ambient=false preserved, no RAF for empty nonambient state |
| Dispose/recreate | double dispose leaves no RAF/sources; SAME-canvas remount ready with one geometry |
| Forced context loss/recovery | lost→ready, preserved paused/time, no lost-input queue; one loss and one restoration; shaderErrors[] |
| Actual IntersectionObserver | offscreen.json: offscreen freezes time/frame count, drops input, resumes without latching user pause |
| Canvas-relative coordinates | widget280×320 inside390-wide viewport maps(.25,.75) to world(−.4375,−.5), proving no window-size input mapping |
| Pre-guard coherent overload | stress.json/stress-mobile.png:16sources,onegeometry/program,no shader error; defect retained below |
| Authorized guarded burst | stress-guard.json/stress-guard-mobile.png:16duplicate calls become1strength1 source atsimt.6, smooth bounded native result |
| Ordinary nearby sequence | ordinary-nearby.json/ordinary-nearby-mobile.png:3medium inputs atsim0/.1/.2 remain3independent, coherent smooth sampled result atsimt.6 |

ReadPixels/software-driver stall warnings occurred; these checks do not establish hardware GPU smoothness, mobile thermal behavior or measured speed. No performance inference is made from occupied memory or software capture throughput.

## Material overload finding and authorized bounded fix

`stress-mobile.png` deliberately applies16same-center/same-time strength1 disturbances at simt.6. Fronts remain concentric/coherent, but specular flanks visibly become jagged/faceted. The ordinary single.7 image is smoother. This confirms the independently noted limitation: a height cap does NOT cap slope, so coherent source sums and cap-generated transitions can contain spatial detail narrower than the base.14world wavelength.12samples/base-cycle is not an all-states alias-free guarantee.

This was notified immediately to the coordinator/reviewer. The coordinator explicitly authorized a bounded input-policy fix, implemented without changing wave/material/sampling coefficients: active packets within **.012world units AND .035simulation seconds** coalesce, retain original center/start, and accumulate strength only up to1. Spatially or temporally separated inputs remain independent. This is declared production interaction policy, not a hidden slope clamp or shading rescue.

The new regression failed before the guard and passes afterward. At simt.6, stress-guard-mobile.png shows the formerly duplicated16call burst as1strength1 packet with smooth flanks in the inspected native image; metadata retains unchanged sampling. The separate ordinary-nearby-mobile.png check retains3medium packets born at0/.1/.2sim seconds with nearby normalized positions(.46,.5),(.5,.52),(.54,.5), and shows coherent smooth flanks in that bounded state. No input was silently dropped from the ordinary sequence.

This only removes the near-duplicate overload subset. Spatially/temporally separated phase-aligned packets can still accumulate steep gradients. The true height-cap/sampling limitation remains; no all-states alias-free or physical-realism claim is made. The old raw overload image is retained rather than presented as the final guarded workload.

## Acceptance boundary

High confidence in explicit math, reusable ownership, ordinary rendered relief and scoped lifecycle gates; no claim of photorealism, hydrodynamics, reference reconstruction, alias-free overload or real-device performance. Independent reviewer20 and coordinator's integrated native/motion/flow/print/direct-route checks own final acceptance. The source is ready for those checks, with the bounded guard verified and residual steepness limitation explicit. Final surface/intro/separate playground delivery is the actual goal; this report is a production handoff, not a research-only endpoint.
