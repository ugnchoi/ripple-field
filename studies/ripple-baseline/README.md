# Stage 0 baseline study

Isolated development entry. Reuses existing engine material/buffer/budget/constants and the unchanged Resume. No production routes, parameters, app files or dependencies changed.

Run from repository root:

```sh
pnpm exec vite --config studies/ripple-baseline/vite.config.ts --host 0.0.0.0 --port 5174
# http://localhost:5174/studies/ripple-baseline/
node --test studies/ripple-baseline/replay.test.mjs
npx tsc -p studies/ripple-baseline/tsconfig.json
pnpm exec vite build --config studies/ripple-baseline/vite.config.ts
pnpm exec vite preview --config studies/ripple-baseline/vite.config.ts --port 4174
# http://localhost:4174/studies/ripple-baseline/
```

Root `pnpm build` intentionally builds only the portfolio. Study build output lives in ignored `studies/ripple-baseline/dist/`. The study Vite configuration embeds Git HEAD and SHA256 hashes of relevant engine/study files at startup/build; restart after source edits before evidence capture. Root-config dev also serves the HTML but lacks revision injection, so use the study config for review.

## Controls and scenarios

All trials start held at t=0. Condition IDs are `00`, `10`, `01`, `11`: first digit enables ambient, second enables auto. Ambient-off sets `uAmbientScale=0`, including its coordinate coupling; auto-off filters only auto events. Polish stays off. A complete potential auto tape remains in every export. Field-only disables the safe rectangle; unchanged Resume context uses its current clipped safe rectangle. Hold freezes trial time, restart seeks zero, and scrub/number input seeks exact time.

Seeds are uint32 integers. Study geometry copies `src/engine/createPointGridGeometry.ts`, replacing Math.random with a local Mulberry32 stream and supplying all current engine geometry constants. Geometry hashes are FNV1a32 over Float32 position bytes then seed bytes; file identity uses SHA256. Changing conditions does not change geometry. Viewport changes intentionally do.

Script events: `ambient-only` has no scripted impulses; `single` has one at t=1; `pair` has centers x=−0.45/+0.45 at t=1; `delayed-pair` delays the second to t=1.5; `burst` has 20 center events at 1+0.16i (i=0…19), crossing capacity at t=3.56; `edge` has an event at x=0.95×aspect, y=0 at t=1. Script strength uses the engine pointer constant with no jitter. Automatic events retain current count/window, viewport-uniform centers, strength jitter and width multiplier, with independent seeded window streams. The tape lasts 30 seconds.

Manual recording is an explicit checkbox. Pointerdown anywhere outside the panel and keyboard input outside form/editable controls adds logged manual events. Input cadence follows engine thresholds in trial time; seeking/restarting resets throttle clocks. Keyboard uses the last pointerdown location, initially center. Manual events persist across scenario changes and are never folded into scripted events: clear them before scripted captures. UI clicks do not inject events. API `addManual` is unthrottled to support exact event construction.

## Automation API

`window.rippleStudy` is available after initialization:

```js
const api = window.rippleStudy;
api.pause();
api.clearManual();
api.setState({seed:47, condition:'11', scenario:'burst', time:3.81, context:false});
await api.awaitReady(); // fonts + layout and a freshly rendered field; capture presentation separately
api.setPanelVisible(false);
const manifest = api.exportState();
// capture PNG, then verify time/state again
api.seek(25); api.seek(0); api.seek(3.81); // independent of seek history
api.setPanelVisible(true);
api.addManual({time:2, x:0.2, y:0.1, strength:0.85});
const saved = JSON.parse(JSON.stringify(api.exportState()));
api.clearManual();
api.loadState(saved); // rejects incompatible viewport/budget, params, file hashes, geometry or tape
api.play(); // explicit opt-in, including reduced motion; stops at 30s
api.pause();
```

`setState` accepts any subset of `{time, seed, condition, scenario, context}` and holds playback. `seek(t)` holds and clamps finite time to 0…30. `awaitReady()` does not establish screenshot compositing or real-device performance. Import regenerates the expected scene for the saved seed/scenario and validates it against the saved identity before applying; it deliberately refuses cross-viewport/code reconstruction. Imported manual events are restored. The manual-recording checkbox is not enabled by importing a file. Keep scroll fixed for context comparisons; scroll is not restored by import.

`exportState()` returns exact state, parameters, potential/selected tapes, separate manual events, logical source-slot mapping, actual Float32 shader uniform arrays, geometry hash, viewport/applied DPR/budget, reduced-motion flag, browser/WebGL identity, source-file identity and limitations. Events at exact t are included (`<=`). Total order is time ascending, then lexical ID (auto/script/manual IDs); source recycling uses first-free then first-oldest, matching the engine. Full history is replayed into a cleared real buffer on every render. Unused uniform payload is zeroed for canonical metadata after the buffer copy; negative start times still mark inactivity. Logical events retain original double precision; actual uniform arrays show Float32 conversion. Do not compare those values without `Math.fround`.

Reduced motion starts held and pauses when its preference changes. Exact-time inspection and an explicit Play are allowed. Production reduced-motion handling is unchanged. This study enables `preserveDrawingBuffer` for synchronous canvas inspection, unlike production; do not infer production performance from it. All baseline differences are also included in exported limitations.

Primary capture/review protocol: `docs/research/ripple-study/05-stage-0-review-protocol.md`. The coordinator owns the main 56-frame evidence matrix; local evidence here is bounded implementation smoke, not an aesthetic ranking or completed surface-design decision.
