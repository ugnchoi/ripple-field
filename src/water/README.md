# Reusable continuous water surface

```ts
import {createWaterSurface} from '@/water';
const controller = createWaterSurface(canvas, {
 paused: false, strength: .7, ambient: true,
 onChange: ({status,paused}) => { /* status/user pause changes only */ },
});
controller.disturb(.5,.5); // normalized displayed-canvas coordinates, top-left origin
controller.setStrength(1);
controller.setPaused(true);
controller.clear();
controller.dispose(); // idempotent; safe to recreate on the SAME canvas
```

Implements the unchanged `src/experience/types.ts` contract. Caller owns CSS dimensions, pointer/keyboard events and motion preferences. Factory owns renderer/geometry/material/source buffers, bounding-rect resize, observers, visibility/context listeners and RAF. It does not attach global pointer or key handlers or expose a product debug global. `getDiagnostics()` is an extra read-only snapshot for explicit verification; do not put its technical fields into product controls.

## Model, fixed parameters and units

World XY spans[-aspect,aspect]×[-1,1] at Z0. Camera is top-down orthographic at Z2, near.1/far10. Normalized input maps to x=(2u−1)aspect,y=1−2v using actual displayed canvas aspect, not window dimensions.

For source i, age a=t−start, q=p−center:

```
r = sqrt(dot(q,q) + .018²)
delta = r − .42a
E = exp(−.5(delta/.18)²)
D = (1−exp(−a/.10)) exp(−.75a) tail(a)
h_i = .014 strength_i D E cos((2π/.14)delta)
```

Tail is1 through age7.5s, then smoothstep-fades to0 at8s. Sources expire at8s. Strength is clamped0…1. Core regularization makes center derivatives finite/zero. The derivative includes BOTH envelope and carrier:

`∇h_i = .014 strength D E [−delta/.18² cos(k delta) − k sin(k delta)] q/r`.

Three small smooth ambient sine waves are optional; amplitudes.0016/.0010/.0006 world, wavelengths.95/.63/.37 world, speeds.10/.08/.06 world/s, normalized directions(1,.3)/(−.4,1)/(.7,−.8), phases.4/2.1/4.2 radians. No random per-frame variation or texture is used.

Total raw height includes ambient and all active sources. Final height `.035 tanh(raw/.035)` world; gradient is total raw gradient times `1−tanh(raw/.035)²`. Vertex height and gradient are evaluated together in one loop. Actual Z displacement and normals use the same capped field. Height cap does NOT bound slope; coherent overload can produce sharper details than the base wavelength.

Material: linear-light colors converted from sRGB base#cad8d0, reflected low#8aa79b/high#edf5f0; normalized light(−.6,.75,1), top-down view(0,0,1). Normal is normalize(−gx,−gy,1). Reflection mix.42, reflected-y smoothstep band±.45, diffuse.74+.26 max(N·L,0), Blinn exponent64/gain.34/tint(1,.99,.94). Three's output color conversion is retained. This is a stylized silver-green environment approximation, not recovered reference scenery or a physical light-transport solver.

All coefficients were declared before first native production capture. No dither, bitmap scenery, objects, reflection render target, postprocess or texture layer. Production wavelength/speed/envelope/material are NEW delivery decisions, not a controlled continuation of the old point-rendering transfer.

## Sampling and lifecycle

Target12mesh cells per shortest(.14world) wavelength; max72kvertices desktop/48knarrow(<640CSSpx), segments16…512 per axis, DPRcap1.75/1.5. Diagnostics record actual world steps and achieved samples/wavelength. Primary1440×900:275×172segments,47,748vertices,12.03samples/cycle;390×844:80×172,14,013vertices,12.04samples/cycle. Long/thin canvases may have less resolution;1200×300 yields about8.96samples/cycle. No all-states alias-free claim: cap-generated steepness/specular lobes can be narrower than the base wave.

Bounded16-source Float32 arrays are reused directly as shader uniforms. Near-identical input within .012world AND .035simulation seconds coalesces into the existing packet, retains its center/start, and caps accumulated strength at1. Spatially or temporally separated inputs remain independent. This explicit input policy prevents duplicate same-frame impulses from creating artificial coherent overload; it is not a slope or material change. New packets use first inactive slot, else first-oldest replacement. Clear removes sources without resetting clock, strength, ambient flag or user pause. No per-frame geometry recreation or own hot-loop object allocation. Geometry changes only when canvas aspect/mesh sampling changes.

User pause is separate from hidden/offscreen/zero-size/context suspension. Suspended/paused/lost/disposed input is ignored, not queued. The source clock freezes during suspension and resets its wall timestamp on resume; visible frame delta is capped.05s to avoid long-task phase jumps. Under slow software rendering this deliberately slows simulation relative to wall time. It is not a claim of measured real-device speed or FPS.

Animation stops entirely for pause/suspension, and for an empty non-ambient surface. Clear while ambient enabled keeps quiet ambient motion. Context loss emits lost and prevents default to permit recovery; restoration reuses state, refreshes GPU resources and emits ready, with no lost-time accumulation. Fatal initialization/shader/render failures release owned resources and report unavailable/throw as appropriate. Ordinary dispose does NOT forceContextLoss, allowing React StrictMode to recreate on the same mounted canvas. Callbacks are deduplicated per instance and never sent per frame. Dispose removes observers/listeners/RAF and cannot resurrect.

## Verification and smoke

```sh
node --test src/water/*.test.mjs
npx tsc --noEmit
pnpm build
pnpm exec vite --config src/water/smoke/vite.config.ts --host 0.0.0.0 --port 5177 --strictPort
# http://localhost:5177/src/water/smoke/
pnpm exec vite build --config src/water/smoke/vite.config.ts
```

Smoke-only `window.waterSmoke` proxies the actual controller, supports remount/disposal, records status changes, and owns test inputs. It is scoped to that separate HTML entry. Evidence under smoke/evidence includes red/green pure math/lifecycle/coalescing tests, native desktop/mobile images, pause/clear/remount/context/IO-offscreen/nested-canvas checks and a16coherent-source overload image.

Known first-pass overload finding before the duplicate-input guard:16same-time/same-center strength1 sources retained rings but showed faceted/jagged specular flanks at12samples/base-cycle. The authorized guard now combines that input burst into one strength1 packet. This fixes the duplicate-input subset; separated/phase-aligned contributions can still accumulate steepness, so the true high-gradient sampling limitation remains documented. Ordinary single.7 captures are smoother. No texture or inconsistent normal-only slope clamp hides this limitation. No real-device GPU/mobile performance or photorealistic-water claim follows from Chromium software rendering.
