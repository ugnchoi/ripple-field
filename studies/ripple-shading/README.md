# Stage 1: surface-shading diagnostic

Separate surface-only study: exact current baseline A versus slope-to-tone B. No production, engine or frozen Stage0 source changes; no dependencies. No new wave dynamics, objects, normal-driven displacement, dither, backdrop gradient, perspective, or per-frame coverage normalization.

## Run and verify

From repository root:

```sh
pnpm exec vite --config studies/ripple-shading/vite.config.ts --host 0.0.0.0 --port 5175 --strictPort
# http://localhost:5175/studies/ripple-shading/
node --test studies/ripple-shading/*.test.mjs
node --test studies/ripple-baseline/replay.test.mjs
npx tsc -p studies/ripple-shading/tsconfig.json
pnpm exec vite build --config studies/ripple-shading/vite.config.ts
pnpm exec vite preview --config studies/ripple-shading/vite.config.ts --port 4175
# http://localhost:4175/studies/ripple-shading/
```

Root `pnpm build` still builds the portfolio only. Study output is ignored under this study's `dist/`. The study Vite config embeds Git HEAD and SHA256 relevant-file hashes at startup/build; restart after any source edit before captures. Use this config rather than the root dev config when collecting source identity.

## Preregistered derivation (coefficients frozen before screenshots)

A constructs the unmodified `createRippleFieldMaterial()` with ambient/auto/polish/safe zone disabled. B constructs the same material and shares ALL original uniform objects with A. Its shader source has guarded additions only: a copied scalar evaluator, a slope varying and a tone multiplier. Points use the same BufferGeometry. A/B/reversal do not regenerate geometry, change scripts or modify base uniforms.

Let p be the **original lattice world XY** (before swell displacement), s the point's seed, and t the exact study clock. H(p,s,t) is the current engine's capped scalar sizeBoost:

`H = tanh(globalScale × safeMul × sum(source bumps) × 1.02) / 1.02`.

The copied evaluator includes current static seed-conditioned domain warp, source angular perturbation, time/radius, source width hash, age tightening, positive Gaussian/shoulder mixture and temporal envelope. Each offset reevaluates the FULL expression, holding s, t and sources fixed, so finite differences include the warp/angle derivative rather than treating warped coordinates as unwarped. Ambient is zero and safe-zone disabled in this diagnostic. Global scale and saturation remain part of H. B's copied evaluator guards dist≤1e-8 by defining angular coordinate0; A and the original core main remain unchanged. Original atan(0,0) is undefined; this is a declared proxy convention at the singular center, not a new wave phase or core-field fix.

Frozen values:

- h = **0.0025 world units** (about 1.125 CSS px at height900, 1.055 CSS px at height844).
- `g = ((H(p+(h,0))−H(p−(h,0)))/(2h), (H(p+(0,h))−H(p−(0,h)))/(2h))` in scalar/world units.
- Height proxy Z = **0.06 world units × H**; no geometry Z is actually changed.
- `N = normalize(vec3(−0.06 gx, −0.06 gy, 1))` in the same orthographic world basis.
- Unit planar light `Lxy = (cos35°, sin35°)`; reversal multiplies Lxy by −1, keeping N.z and the baseline unchanged.
- B multiplies existing **RGB tone only** by `1 + 0.45 dot(N.xy,Lxy)`, before existing output color conversion. Alpha/point size/XY displacement are untouched. Null gradient gives EXACT multiplier1. Nominal multiplier bounds are [0.55,1.45]. There is no constant Lambert illumination bias or whole-light/Z reversal.

H is a nonnegative, point-conditioned visual signal, not verified fluid height. Different point seeds define different local functions; these normals are not samples of one globally smooth physical surface. Four extra scalar evaluations per B point add unmeasured GPU work. This diagnostic cannot add missing signed wave phases, reflections, boundary behavior or interaction dynamics.

## API and exports

```js
const api = window.rippleShading;
await api.awaitReady();
api.clearManual();
api.setState({seed:47, scenario:'pair', time:2, transfer:'B', reverseLight:false});
api.setPanelVisible(false);
const manifest = api.exportState();
// capture; verify state again after presented pixels
api.seek(5); api.seek(0); api.seek(2);
api.setState({transfer:'A'});
api.setState({transfer:'B', reverseLight:true});
api.restart(); // held at0
api.play();    // explicit, clock0..6s; auto-holds at6
api.hold();    // alias pause()
api.getTime(); // cheap number, suitable for recording polling
api.getState(); // cheap {time,seed,scenario,transfer,reverseLight,playing}
```

`setState` accepts a partial state and holds. Time is clamped0…6; seed is uint32. Scenarios are `single` (center source t1), `pair` (sources at x±.45/y0 at t1), `null` (no scripted sources). Uses frozen Stage0 helpers read-only. Source events exactly at t are included; total order is time then lexical ID. Source capacity/recycling is unchanged.

Manual input is an explicit checkbox, canvas-only pointerdown. It logs current-time impulses separately. `addManual({time,x,y,strength,width,decay})` supports exact scripted construction; UI cadence uses the existing pointer threshold in trial time, reset by seek/restart. Manual events persist across settings changes: **clearManual before scripted captures/null controls**. No import promise is made. Restore exported settings via setState and manual events explicitly if needed.

`exportState()` schema `ripple-shading/v1`:

- `state`, `duration`, `playing`, `reducedMotion`, `manualEnabled`.
- `fieldIdentity`: FNV1a32 over deterministic field-only metadata. `field` contains exact time/seed/scenario, geometry hash, actual source Float32 arrays, all base uniform values, scripted/manual/selected tapes, logical slot map, fixed factor flags and baseline shader identity. This stays equal across transfer/light changes at otherwise equal state. Base arrays and event snapshots are copied into the export.
- `transferSettings`: A/B, reversal, all frozen coefficients, actual Lxy and formula. These are deliberately separate from field identity.
- `geometry`, `viewport` including actual DPR/framebuffer/budget, browser/WebGL `renderer`, engine parameters and source-file `revision`.
- `shaders.A/B`: actual ShaderMaterial sources, FNV1a32 UTF8 hashes, SHA256 when secure-context crypto is available. Await awaitReady before requiring SHA256.
- `compiledPrograms`: actual `gl.getShaderSource` strings after Three.js chunk expansion, hashes, A/B identification and link status. This distinguishes material-level injection identity from submitted GPU GLSL identity.
- `shaderErrors` and explicit `limitations`. Injection contracts throw on missing/duplicate/reversed anchors or scalar side effects; compile/link callback throws and stops the diagnostic. No silent substitute dynamics or A-only fallback.

Exports are intentionally large; use cheap getTime/getState per recording frame. `awaitReady` waits for shader hashes/fonts and renders in RAF, not proof that a screenshot has presented those pixels. All studies start held; reduced-motion preference changes pause. Explicit Play/seek remains available. Production reduced-motion behavior is unchanged. preserveDrawingBuffer is enabled for inspection, matching Stage0 study rather than production.

## GPU proxy sensitivity diagnostic

```js
api.setState({scenario:'single',time:1.25,transfer:'B'});
api.probeSlopes([{x:.15,y:.07,seed:.37},{x:-.2,y:.13,seed:.61}]);
api.setState({scenario:'pair',time:2});
api.probeSlopes([{x:0,y:.7,seed:.37},{x:.15,y:.6,seed:.61}]);
```

This explicit diagnostic uses the actual extracted GLSL and shared uniform objects in a small Float32 render target. Each result returns [H,dHdx,dHdy] at h and h/2 plus field identity. It does NOT change primary coefficients, add a visual mode, or tune B based on captures. Samples are point-conditioned queries and need not coincide with actual lattice points. Supports1…16 finite samples/seeds in[0,1]; throws if float rendering is unsupported or output is incomplete/nonfinite. Always restores the main renderer target/viewport and disposes temporary resources. Compare off-center samples; h/halfH disagreement is sensitivity evidence, not a ground-truth derivative error bound.

## Evidence and next gate

Local `evidence/` contains failing/passing Node outputs, actual GPU probes, desktop/mobile smoke, decoded RGB A↔Stage0 parity, screenshots and final state/source identity. `compare-png.mjs` uses only Node built-ins to decode noninterlaced8-bit RGB(A) PNG and compare RGB; no image library was installed.

Coordinator owns the primary24 stills, null/reversal/repeat/parity references and8 continuous clips under report11's protocol. Local smoke verifies a usable controlled instrument; it does not select an aesthetic winner, establish real-device performance, or finish the user's intro/playground deliverables.
