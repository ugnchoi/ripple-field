# Production grid integration: independent technical review

2026-10-20 · Final bounded source and smoke-browser review: PASS. User-approved production integration; reviewer owns this report only. Root owns actual-UI frozen-build verification and deployment; reviewer additionally owns the separate frozen smoke-browser lifecycle checks below.

## Scope

Review `src/grid` factory and production wiring against `src/experience/types.ts`: deterministic fixed point anchors, bounded click sources and display transfers, production-only imports, pause/hidden/offscreen behavior, context recovery, initialization failure, idempotent disposal and React remount safety. Report concrete findings to engine/root without source edits. Run relevant focused tests only. Prior study acceptance does not itself establish production lifecycle correctness.

## Initial state

At first inspection `src/grid` is absent and `App.tsx` still imports `createWaterSurface`. Engine notified to provide source-ready handoff. No implementation verdict yet.


## Source review

App now imports `createGridSurface` from `@/grid` for opening and playground. Production renderer imports only production-local math/state/shaders and shared UI types. The study reexports production math/shaders; production does not import the study harness. No debug global, pointer or keyboard listener is introduced by the factory. The QA-only `window.gridSmoke` belongs to a separate build entry.

The six-pixel seeded grid remains fixed in XY/Z between viewport-size changes. Mode C, contour configuration and click transfer are shared with the accepted study. Repeated identical viewport sizes regenerate identical anchors; resize changes the lattice dimensions intentionally. DPR changes only renderer resolution/point size and do not need geometry reconstruction. Source capacity is sixteen fixed typed-array slots with deterministic FIFO replacement; same-frame clicks remain independent. No water-renderer duplicate coalescing is inherited. Click coordinate mapping uses canvas aspect; nonfinite/invalid strengths and held-state input are rejected. Clear resets sources without resetting time, strength or user pause.

The factory owns RAF, ResizeObserver, IntersectionObserver, resolution media-query listener, visibility/resize listeners and context events. User pause is independent from automatic suspension. Suspension resets wall-clock origin; .05-second maximum increments prevent resume catch-up but slow simulation under sustained low frame rates. Frame draw copies into sixteen reused Vector4 uniforms; geometry changes only on CSS dimensions. Cleanup cancels RAF, disconnects observers, removes owned listeners, removes points and disposes geometry/material/renderer, guarded against duplicate cleanup and stale callbacks. It avoids forced context loss so the same canvas can remount. Initialization failures clean up and report unavailable. Context restoration reuses CPU source/anchor state, rebuilds GPU material state, and preserves user pause.

Concrete finding fixed by owner before frozen checks: GPU maximum point-size validation was initially only at initialization. It now runs in resize after computing DPR, covering DPR updates and restoration. Low-capability GPUs receive fallback rather than silently clamped oversized marks. No unresolved blocking source finding.

## Independent focused verification

Ran five `src/grid/sourceState.test.mjs` tests: all pass (held-input rejection, resume/lifetime, capacity/FIFO, clear/dispose, normalized mapping). Ran two `src/grid/shared.test.mjs` tests: all pass (study/production identity and ambient-disabled initializer preserving click/projection code). TypeScript check passed during source review. This was not a broad historical-suite rerun.

## Independent actual browser lifecycle

Applied Playwright skill and used isolated session `grid-prod-review`, static smoke server `127.0.0.1:4183`, frozen bundle `index-DWTEpP3T.js` SHA256 `4733cf10974f7ebd37df49e4311238e7013c321a057b4c65eb8c2c8a2dad5f62`. Source/bundle manifest and evidence are in `output/playwright/grid-production-smoke/`.

- `desktop-lifecycle.json`: paused input drops; two active clicks retain anchor hash; pause holds frames/time; clear preserves settings; forced `WEBGL_lose_context` reports lost, rejects input, restores ready with identical clock/hash and preserved user pause.
- `suspension-dpr-dispose.json`: zero-height and actual IntersectionObserver offscreen transitions stop RAF, freeze time and reject input; restoration while user-paused retains pause; 1440×900→390×844 rebuilds one current geometry with deterministic mobile anchors; double disposal stops work; same-canvas remount returns ready with one geometry; stale old controller cannot affect the replacement.
- `dpr-timing.json`: DPR2 plus resize yields 780 device pixels for 390 CSS pixels, preserving anchor hash and geometry build count. Initial pure-CDP DPR test did not update renderer; independent media-query listeners also received no events despite native DPR/matches changing. Therefore resize-path DPR behavior is verified, while automatic OS/display DPR notification is not claimed from this emulation. The initial failed `dprPass` is retained in evidence with this explanation.

Chromium149.0.7827.55 reports ANGLE Vulkan SwiftShader. Ambient-only timed windows measured 20 render calls over 2.1052 wall seconds with +1.0 simulation second at1440×900/DPR1; 62 calls over2.0358 wall seconds with +2.0164 simulation seconds at390×844/DPR1. These counters are renderer calls, not display-presented-frame measurements. Windows were nominally two seconds and sampled before explicit pause redraw. An earlier desktop lifecycle window included pause redraw and is not the clean timing comparison. Software rendering and concurrent browser contention preclude hardware/mobile performance claims.

No page or shader errors were recorded. Console warnings were retained: four ReadPixels-stall warnings and four invalid-object deletion warnings following forced loss/restore/remount cycles (including vertex-array deletion). Recovery and resource-count checks still passed; exact warning attribution is unconfirmed. Do not call the console clean or infer comprehensive GPU leak absence from one-geometry counters.

## Verdict and remaining limits

**PASS for the bounded production-grid source contract and observed smoke lifecycle gates. No blocking functional finding remains.** This includes independent browser evidence rather than relying on prior study acceptance. Actual UI flow/accessibility/touch/fallback integration and deployment remain root-owned. Automatic physical-display DPR notifications, hardware performance, exhaustive resource-leak testing and visual quality across all source overlaps are outside this evidence. Prior contour Jacobian/CPU-versus-GPU precision caveats remain applicable. Only report/evidence artifacts were edited by this reviewer.
