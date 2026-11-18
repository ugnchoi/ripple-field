# Integrated delivery verification

2026-10-17. Coordinator final report. The implementation is a new analytic continuous water approximation, not reconstruction proof for the reference reel.

## Delivered behavior

- Portfolio opening uses the existing identity, role and tagline over the water surface. Resume and water navigation are available immediately. A short once-per-session disturbance is skippable; Escape, direct fragments, history return and reduced-motion policies are explicit.
- `/water/` is a separate static entry without the foreground resume. Tap/click and focused Enter/Space create disturbances. Gentle/Medium/Strong, Pause/Play and Clear are available. User pause remains separate from renderer suspension.
- Production uses a continuous signed height field with height-consistent gradients, bounded source arrays and owned renderer lifecycle. No scene objects, bitmap scenery, postprocess or new dependencies were added. Original Resume component, data and print stylesheet are unchanged.
- Near-identical impulses within .012 world units and .035 **simulation** seconds coalesce into one source with strength capped at1. Center/start are retained. Spatially or temporally separated inputs remain independent. This bounded input policy prevents the exact instantaneous stack found in stress review; it does not guarantee smoothness for every possible overlap.

## Reproducible checks

Coordinator logs under `output/playwright/water-delivery/`:

- `final-tests.txt`:35/35 Node built-in tests pass:10 production field/source lifecycle,4 intro policy,8 baseline replay,7 shading diagnostic,6 signed profile diagnostic. Meaningful field-gradient, signed/null/center/cap, source bounds/expiry, pause/suspension/clear/dispose and coalescing checks are included.
- `final-build.txt`: `pnpm build` passes (`tsc && vite build`), emits both `dist/index.html` and `dist/water/index.html`. Existing >500kB bundle advisory remains; main JS724.37kB (198.67kB gzip), CSS87.18kB (42.61kB gzip). No dependency/lockfile changes.
- `final-diff-check.txt`: `git diff --check` passes.
- `static-build-checks.json`: actual Chromium navigation and reload checks pass at static host root and under `/review/`: portfolio→water→direct refresh→portfolio; exactly one canvas; no Resume/PDF button on water; print hides opening and restores original resume headline. No page errors recorded. Route/print checks preceded the engine-only input guard; final build and walkthrough recheck final ordinary integration.
- `design-detector.json`: scoped static UI scan returned no findings. Native visual/browser inspection supplies the separate visual evidence.
- `resume-print.pdf`: actual production print output. Source preservation checked with `git diff --exit-code` for Resume/data/stylesheet and legacy renderer files.

UI worker report21 and `output/playwright/delivery-ui/` supply opening policy, pause/clear/strength, keyboard, reduced-motion,390×844 portrait,844×390 landscape, context-loss retry, unavailable-WebGL fallback, native stills and motion checks. Engine report19 and `src/water/smoke/evidence/` supply actual controller lifecycle, offscreen/nested-canvas, context and stress evidence. Independent report20 distinguishes its own source/math review from attributed browser evidence.

## Native observations and boundaries

Coordinator inspected opening-desktop and water-desktop native captures: navigation/headline remain readable; water renders continuous shaded concentric relief with coherent bright/dark flanks rather than the old point gaps. Mobile/landscape layouts fit with legible controls. Final production opening cue and two-source overlap captures show readable text and coherent continuous relief. The 29.24-second whole-page walkthrough decodes correctly and includes opening, water input, overlap, pause, clear and return. Guarded 16-duplicate mobile stress becomes one bounded source without the former staircase highlights; three nearby medium sources at 0/.1/.2 simulation seconds remain distinct and smooth at .6 seconds. These bounded native states and the independent report20 review pass. UI report21 records 14 final functional checks passing on the frozen static build; the earlier live reload reset was isolated to development HMR.

All browser GPU evidence uses Chromium software rendering. This does not establish real-device frame pacing or mobile GPU performance. The .05s frame delta cap can slow model time when rendering is slow. Coherent overlaps and narrow canvases can expose mesh/specular artifacts. Do not claim photorealism, a fluid solver, recovered reference provenance or all-state alias freedom.

## Delivery

The final Drive child folder is inside the existing research-review folder. It contains a review guide, HTTP-run instructions, runnable static build, source/research archive, browser/engine evidence and whole-page walkthrough. Per-file sizes/parents are checked after upload; ZIP CRCs and SHA-256 manifest are generated locally. No production deployment is claimed.

Review folder: https://drive.google.com/drive/folders/1EAE_MDXlex0dNzcFJ25e09VosC773wjl

Start with the two-page `00-review-guide.pdf`, then `05-experience-walkthrough.webm`. The build ZIP contains `dist/`; run `python3 -m http.server 8080 --directory dist` after extracting.
