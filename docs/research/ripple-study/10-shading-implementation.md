# Stage 1 surface-shading diagnostic: implementation handoff

2026-10-17 · Source frozen, implementation ready for independent captures and review. This report establishes an instrument and bounded correctness evidence, not a realistic-water verdict or final intro/playground delivery.

## Entry, files and verification status

**URL:** `http://localhost:5175/studies/ripple-shading/`.

Study-config Vite runs on strict port5175 and was explicitly restarted after final source edits before READY notification. Relevant source SHA256/Git revision is injected at startup; `evidence/final-state.json` records the post-restart state, submitted shader sources and identity. Restart after any later source edit before captures.

Ownership stayed within `studies/ripple-shading/` and this report. New files: `index.html`, `main.ts`, `study.css`, `math.mjs`, `math.d.mts`, `math.test.mjs`, `shader.mjs`, `shader.d.mts`, `shader.test.mjs`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `README.md`, and bounded `evidence/`. Existing app, engine, root config, dependencies and frozen Stage0 sources were not edited. Baseline replay/geometry helpers are imported read-only.

Verified commands:

```sh
node --test studies/ripple-shading/*.test.mjs
node --test studies/ripple-baseline/replay.test.mjs
npx tsc -p studies/ripple-shading/tsconfig.json
pnpm build
pnpm exec vite build --config studies/ripple-shading/vite.config.ts
```

Results: **7/7 new tests**, **8/8 frozen-baseline tests**, TypeScript success, root build success and study build success. Both builds emit the >500kB chunk-size warning; no dependency changes were made. Study output is ignored under its own `dist/`. Root build continues to target the portfolio only.

## Controlled implementation

A creates the exact existing `createRippleFieldMaterial()` shaders, with ambient, automatic events, safe zone and polish disabled. B uses the same material constructor, then guarded study-local shader injection. All original uniform objects are shared between A and B, including source arrays, global scale, point size, opacity and displacement scales. Both use the SAME BufferGeometry. Switching transfer/reversing light does not regenerate geometry, reroll events or change the clock. B adds only a vertex-derived varying and a multiplicative RGB tone term; no source dynamics, alpha, point size or spatial displacement changes.

The study has no Resume or objects. It is surface-only, matching the immediate scope. No new solver, dither, backdrop gradient, perspective, specular assets, wave phases or normal-driven geometry displacement were added. It has no per-frame coverage normalization.

### Exact proxy and coordinate convention

Let p be the original lattice world XY **before** swell displacement, s its fixed seed, t the exact clock, and B_i the existing positive source bumps. The scalar proxy is the existing capped `sizeBoost` expression:

`H(p,s,t) = tanh(globalScale × safeMul × Σ B_i(p,s,t) × 1.02) / 1.02`.

The evaluator is extracted from the current engine vertex main, not reconstructed from a visually similar radial formula. It retains seed-conditioned static warp, full p-dependent angular drift, center/start-time source-width hashing, strength clamp, age-dependent width, Gaussian/shoulder mixture, temporal envelope, safe/global scaling and tanh saturation. Ambient is fixed0, safe-zone disabled, so neither introduces a moving external layer here. Finite differences reevaluate the full expression at each p±h while holding s/t/source history fixed; the static warp and angular dependence are differentiated numerically rather than omitted.

One singular convention is explicit: **only the copied scalar evaluator** uses angle0 when warped source distance≤1e-8 world units. Original `atan(0,0)` is undefined. A and the original core field main remain untouched; the diagnostic does not claim to fix that production singularity or establish a physical normal there.

### Frozen transfer coefficients

These were declared to the coordinator/reviewer before screenshots and never retuned:

| Quantity | Value and meaning |
| --- | --- |
| Central-difference step h | 0.0025 world units (~1.125 CSS px at900px height; ~1.055 at844) |
| Gradient g | `[H(p+(h,0))−H(p−(h,0)), H(p+(0,h))−H(p−(0,h))] / (2h)`; scalar/world |
| Height scale | 0.06 world units per scalar unit; conceptual proxy only, no actual Z motion |
| Normal | `normalize(vec3(−0.06 gx, −0.06 gy, 1))` |
| Planar light Lxy | `(cos35°, sin35°)` normalized; reversal negates planar XY only |
| Tone gain | `tone *= 1 + 0.45 dot(N.xy,Lxy)` before existing output color conversion |

Normal normalization has nonzero Z and a guarded denominator; light normalization is guarded. Flat gradient gives exactly1. The declared multiplier lies within[0.55,1.45]. Reversal is an odd modulation around the existing tone in shader space; output PNG luminance need not average arithmetically because color conversion/alpha compositing are nonlinear. This is not a full Lambert/specular model, and it does not negate a vertical light component.

Four extra H evaluations per B point increase GPU cost; unused displacement calculations in the copied expression can be optimized by the compiler, but no measured cost reduction or real-device budget is claimed.

## API and exported evidence

Full commands/schema/examples are in `studies/ripple-shading/README.md`.

`window.rippleShading` exposes:

- `setState({time,seed,scenario,transfer,reverseLight})`, `seek(t)`, `pause()`, `hold()`, `restart()`, `play()`.
- Cheap `getTime()` and `getState()` for recording polling, avoiding large manifest export per frame.
- `clearManual()`, `addManual(event)`, `setPanelVisible(boolean)`, `awaitReady()`, `exportState()`, explicit diagnostic `probeSlopes(samples)`.

Transfer is `'A'|'B'`; scenario is `'single'|'pair'|'null'`. Single source and simultaneous pair occur at t1, with current scripted strength/width and Stage0 seeded geometry. Trial is0…6s, starts held and auto-holds at6. Exact-boundary events are included; ordering/recycling follows frozen replay helpers and real engine buffer. Manual canvas pointer interaction is opt-in and logged separately; it persists across settings changes, so clear it before scripted/null captures. Seek/restart resets manual cadence. Import is intentionally not promised.

Schema `ripple-shading/v1` separates `fieldIdentity`/`field` (time, geometry, ALL base uniforms, actual Float32 source arrays, scripted/manual/selected tapes and logical slots) from `transferSettings` (mode/reversal/coefficients/light). Metadata also includes viewport/framebuffer/DPR/budget, engine parameters, browser/WebGL identity and source-file revision. Field event/uniform snapshots are copied into exports.

`shaders.A/B` contains actual material-level GLSL strings and FNV1a32/SHA256 hashes; `compiledPrograms` additionally contains actual `gl.getShaderSource` strings after Three.js expansion, submitted-source hashes, A/B identification and link status. This avoids confusing the TS source, injected material text and actual submitted shader. Shader injection throws on contract failure; compile/link failure throws and stops the diagnostic instead of silently substituting dynamics. `awaitReady()` waits for secure-context shader SHA hashing/fonts and renders; presented screenshot correctness still needs coordinator checks.

Reduced-motion preference changes pause playback; explicit seek/Play allows inspection. Production behavior is unchanged. As in Stage0, preserveDrawingBuffer is enabled for canvas inspection and its cost is unmeasured.

## TDD and browser smoke evidence

`evidence/math-red.txt` records five expected failing assertions against minimal math stubs. `evidence/shader-red.txt` records two expected failures against the initial unguarded shader stub. `math-shader-green.txt` records7passing/0failing; `baseline-green.txt` records8passing/0failing.

Meaningful new tests verify central differences against an independently derived analytic Gaussian derivative and h/2 convergence, exact zero-gradient null response, a separately calculated3/4-slope normal response, odd planar-light reversal, finite extreme-gradient tone bounds, invalid math rejection, and failure of missing/duplicated source anchors or invalid injected coefficients. The Gaussian test alone does **not** validate the actual engine proxy; GPU measurements below address that gap.

Bounded smoke used separate named `stage1-engine`/`stage1-parity` browsers, never the coordinator's `stage1-review`. Chromium software WebGL results are appearance/correctness evidence only.

| Check | Observed result / artifact |
| --- | --- |
| Compile/link of both A and B | Both linked, no shader errors; actual expanded vertex source lengths19,439/23,748 characters in inspected runtime |
| Desktop1440×900 DPR1, single t2 A↔Stage0 C00 | **Exact decoded RGB equality**,0changed pixels, max/mean channel diff0; `parity-result.json`, `desktop-A.png`, `stage0-reference.png` |
| Desktop no-source A↔B + reversedB | Exact canvas PNG data-URL equality |
| A↔B field/base-uniform invariance | Equal fieldIdentity and serialized base uniforms at equal state |
| Light reversal | Changes B pixels; unit tests establish signed response law, not an image-space brightness inversion |
| Out-of-order seeks/return | Exact canvas repeats in desktop single and mobile pair smoke |
| Source-capacity/extreme sampled output |20manual events with large finite strength/narrow width, sampled H and slopes finite at h/h2; source strength remains clamped by existing engine |
| Mobile390×844 DPR1 | Shared geometry `2bbc56f2`,65×140points; null/repeat/identity pass; no horizontal overflow; functional controls in `mobile-controls.png` |
| Reduced-motion smoke | Held by default/preference change; explicit t2 inspection succeeds; no production change |

`compare-png.mjs` is a dependency-free Node RGB decoder/comparator for captured noninterlaced8-bit RGB(A) PNG. No image dependency was installed. Desktop parity image comparison is stronger than file-byte equality; other smoke repeats use in-browser canvas data URLs. The coordinator's full decoded still matrix remains independent work.

### Actual GPU h/halfH sensitivity

`probeSlopes` evaluates the extracted GLSL itself in a small Float32 target using shared real uniforms, returning[H,dHdx,dHdy] at h=.0025 and h/2=.00125. It restores/disposes temporary renderer resources and does not change primary coefficients. It throws on unsupported float target or incomplete/nonfinite samples. Queries use explicit seed values; they need not be actual lattice points.

`evidence/gpu-proxy-probes.txt` retains two off-center single queries at t1.25 and two overlap queries at pair t2. H is identical between h settings at each point. The largest measured derivative-component difference was approximately **0.0004053 scalar/world** (single sample x=.15,y=.07,seed=.37); these four sample comparisons show local sensitivity, not a global accuracy/error bound. Source seeds and full p-dependence are held/evaluated as specified. This is distinct from the analytic Gaussian test and is not a measurement of real fluid slope.

Shader console smoke had no resource/shader errors; the software driver emitted ReadPixels GPU-stall warnings. Those warnings and added derivative cost prevent treating these checks as real-device performance evidence.

## Interpretation limits and next step

High confidence: A remains the exact baseline rendering path, B is a controlled tone-only addition with shared field/geometry, tested null/invariance/repeat controls work, and actual sampled GLSL derivatives are finite and locally stable to halving h. This does not establish visual superiority or water realism.

The strongest alternative remains that the existing positive single-band scalar profile lacks the signed phase structure/temporal behavior needed for a water reading. Directional tone can expose relief without supplying missing dynamics; unchanged fine point texture and point-conditioned seed variation may still dominate perception. Evidence against treating this as one smooth physical normal field is the per-point seed dependence and height-proxy mapping itself.

Next discriminating evidence is the coordinator-owned24primary A/B stills plus bounded null/reversal/repeat/parity diagnostics and8 continuous0…6s recordings under report11. Independent motion/native-image review must determine which relief cues are visible and which front/texture issues persist. If mapping does not resolve the water reading, record that result and define the next signed-profile comparison rather than rescuing it with unrelated effects. The eventual realistic-water experience, opening intro and separate experimentation playground remain user goals; this isolated diagnostic is an intermediate implementation decision gate.
