# Stage 2 signed-profile diagnostic

Run from repository root:

```sh
pnpm exec vite --config studies/ripple-profile/vite.config.ts --host 0.0.0.0 --port 5176 --strictPort
# http://localhost:5176/studies/ripple-profile/
node --test studies/ripple-profile/profile.test.mjs
node --test studies/ripple-baseline/replay.test.mjs
npx tsc -p studies/ripple-profile/tsconfig.json
pnpm exec vite build --config studies/ripple-profile/vite.config.ts
```

P is the untouched original material. S replaces exactly ONE original vertex assignment:

```glsl
float bump = str * spatial * temporal * cos(6.283185307179586 * delta / 0.14);
```

Wavelength0.14 world units was fixed before captures. Missing/duplicate original assignment throws; no alternate dynamics fallback. Fragment shader is byte-identical P/S. Existing point-conditioned warp, width, speed, decay, camera, palette, geometry and all original uniform objects are shared. The signed bump feeds both scalar accumulation and radial vector displacement. Ambient/auto/polish/safe zone/slope shading are off; no objects, new texture or rendering algorithms. This is analytic signed superposition, not a stateful physical-water solver or reference reconstruction.

## API

```js
const a = window.rippleProfile;
await a.awaitReady();
a.clearManual();
a.setState({seed:47,scenario:'pair',time:2,profile:'S'});
a.setPanelVisible(false);
const manifest = a.exportState();
a.seek(5); a.seek(0); a.seek(2);
a.setState({profile:'P'});
a.restart(); a.play(); // shared0..6s clock; coordinator clips use0..4s
a.hold();             // pause alias
a.getTime(); a.getState(); // cheap recording polling
```

State keys: time0…6, seed uint32, scenario `single|pair|null`, profile `P|S`. Settings/seek hold playback; null has no scripted sources, single/pair impulses start at1s. Manual canvas pointer input is explicitly enabled; `addManual(event)` supports exact construction. Manual tape persists: clear it before scripted/null trials. Source ordering, exact-boundary inclusion, geometry and buffer reconstruction reuse frozen Stage0 helpers read-only. No import promise.

Exports (`ripple-profile/v1`) separate:

- `controlIdentity`/`controls`: shared time, geometry, ALL base uniforms, actual Float32 source arrays, scripted/manual/selected tapes and logical slots. Expected identical across P/S.
- `fieldIdentity`/`field`: includes the selected profile and fixed wavelength, so intentionally differs between P/S even when null pixels match.
- `profileSettings`, actual material sources/hashes/SHA256, actual submitted/expanded `compiledPrograms` source/hash/link status, viewport/DPR/budget, renderer identity, engine constants and source-file SHA256 revision.
- `negativeTransferReference`: CPU examples of unchanged output guards using exported constants; explicitly NOT measured GPU field samples.

Use study config and restart after source edits to refresh injected revision hashes. `awaitReady` waits for hashes/fonts/render; coordinator verifies presented screenshots separately. All starts are held; reduced-motion preference changes pause. Explicit play/seek remain available. preserveDrawingBuffer is enabled for inspection. Production and previous studies remain unchanged.

## Negative-field display limits

Scalar cap is odd and tends to ±1/1.02 = ±0.980392. Signed source contributions sum linearly BEFORE that cap. Vector displacement sums signed radial vectors BEFORE its separate magnitude cap; opposing scalar phases do not imply vector cancellation if directions differ.

Original size output is `max((3.2 + 6.4H + jitter)*DPR, .5)` framebuffer pixels; `jitter=(seed−.5)*.14`. Floor onset is `H=(.5/DPR−3.2−jitter)/6.4`, about−.421875 at DPR1/seed.5 (seed range approximately−.433…−.411). H=−.5 is the nominal zero-size threshold ignoring the floor, not the floor onset. Original opacity lift is `max(1+1.25H,0)`, so alpha vanishes at H≤−.8. Negative field also lightens existing tone before output conversion. Thus displayed troughs can shrink/disappear rather than show a linear signed-height image; tanh, size/alpha guards and blending make display nonlinear. No transfer modification masks this limitation.

## Evidence / next gate

Six focused tests have recorded red→green output; eight baseline replay tests remain green. Type-check and root/study builds pass. Desktop P↔frozen Stage1 A decoded RGB is exact; null/repeat/shared-control gates pass desktop/mobile. Primary signed captures and four desktop P/S clips are coordinator-owned. Interpretation and production direction await independent review; final reusable water renderer/intro/playground remain subsequent authorized work, not completed by this study.
