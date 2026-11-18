# Production fixed-grid renderer

`createGridSurface(canvas, options)` implements the existing `SurfaceFactory` contract. `src/App.tsx` supplies it to the portfolio Opening and `/water/` Playground. The original mesh renderer and `src/engine/` remain available as historical code; neither is imported by this application entry.

The accepted contour study's `field.mjs`, `contour.mjs` and `shaders.mjs` are now canonical here. Its original module paths re-export these exact functions; its Vite revision manifest includes the canonical files. The rendering equations, authored contour constants, palette, six-CSS-pixel pitch, seed42, signed click packets and transfer bounds are unchanged. Production uses accepted color mode C, paper #f7f7fb, DPR capped2, and exact stationary XY/Z0 anchors. A resize regenerates the same seeded grid for the new dimensions; time/input never changes anchor buffers. No production debug global exists.

`createVertexShader(true)` is the study shader. The false variant substitutes zero for the raw ambient initializer while preserving click evaluation and projection; it honors SurfaceOptions.ambient. Ambient scalar methods accept CSS viewport height, and the shader uses the actual rounded canvas CSS height. The contour distance estimate intentionally omits the warp Jacobian, as in the original; width is approximate. CPU doubles and GPU float hash/fract can diverge, so exact CPU/GPU pixel parity is not claimed.

## Lifecycle

The factory owns renderer/GPU resources, RAF, canvas context listeners, visibility/resize listeners, ResizeObserver, IntersectionObserver, and a rearmed resolution media query for DPR-only changes. Render work stops on user pause, hidden document, offscreen canvas, zero-size canvas, context loss or disposal. Private suspensions do not change the user's pause preference. Clock resets after suspension; frame delta is capped at .05 seconds, so overloaded software rendering can advance simulation slower than wall time. No real-device pacing claim.

No input is queued while suspended/paused/lost/disposed. User input is normalized relative to the displayed canvas, then mapped to a world of height2 and its current aspect. Input sources are bounded16, independent even at identical coordinates/time, and recycled in insertion order. Each expires after8 simulation seconds. This preserves the study's event behavior rather than borrowing the mesh renderer's duplicate-click coalescing policy. Strength clamps0..1. Empty nonambient surfaces sleep.

Context loss preserves source/time/anchor state and emits `lost`; restoration recompiles GPU state and resumes only if the user was playing and the canvas can draw. UI can instead retry with a new canvas. Failure cleans up and reports `unavailable`. Disposal is idempotent and cancels/removes all owned callbacks/listeners/observers/resources. Ordinary dispose does not force context loss, allowing React StrictMode same-canvas remount. Public mutators become inert after disposal. onChange emits only status/user-pause changes and is isolated from a throwing consumer callback.

Point-size capability is checked against the current capped DPR on every resize, including DPR changes and restore. Maximum required size is8.28 devicepx at DPR2; unsupported hardware follows the unavailable UI path. Canvas CSS dimensions are rounded like the accepted study. Three.js itself handles context resource restoration; no per-frame geometry allocations occur.

`getDiagnostics()` returns read-only snapshots (including sources, state, anchor hashes, shader strings, resource counters and errors) for explicitly connected QA. Hash calculation allocates only on diagnostic calls, never in the frame loop.

## Checks and isolated smoke entry

```sh
node --test src/grid/*.test.mjs studies/grid-reflections/field.test.mjs
npx tsc --noEmit
pnpm build
pnpm exec vite build --config studies/grid-reflections/vite.config.mjs
pnpm exec vite build --config src/grid/smoke/vite.config.mjs
pnpm exec vite --config src/grid/smoke/vite.config.mjs --host 0.0.0.0
```

Smoke URL: http://localhost:5179/ . Its separate build is `src/grid/smoke/dist/index.html` and is excluded from production build inputs. Only this QA entry exposes `window.gridSmoke`: `getDiagnostics()`, `getController()`, `setPaused(bool)`, `setStrength(n)`, `disturb(x,y,strength?)`, `clear()`, `dispose()`, `remount(paused=true,ambient=true)`, `changes()`, and `canvas`. Remount disposes the previous controller and reuses the same canvas. It starts paused. Change `#host` dimensions/position to exercise ResizeObserver/IntersectionObserver. Use `WEBGL_lose_context` on the canvas WebGL2 context to test restore. Root owns final browser evidence; unit tests establish state/math contracts, not browser lifecycle completion by themselves.
