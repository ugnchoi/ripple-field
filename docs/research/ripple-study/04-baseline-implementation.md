# Stage 0 isolated baseline implementation

2026-10-17 · Implementation ready for independent review/capture. This is not a completed surface-design selection or a claim of reference fidelity.

## Runnable entry and ownership

`http://localhost:5174/studies/ripple-baseline/`

Dev server uses the study Vite config, strict port 5174, and was explicitly restarted after final source edits at approximately 11:45 UTC to refresh injected source hashes. The root portfolio dev server/config remain unchanged. Start/build/test commands and full API contract are in `studies/ripple-baseline/README.md`.

Changed files are contained in `studies/ripple-baseline/` plus this report. No existing app, engine, root config, lockfile or dependency changes. Study-local build output is ignored. The engine material, SwellSourceBuffer, budget and constants are imported unchanged. The optional foreground is the unchanged Resume component. No objects, boat or bird were introduced; future decisions remain surface-first.

Files: `index.html`, `main.tsx`, `study.css`, `replay.mjs`, `replay.d.mts`, `replay.test.mjs`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `README.md`, and bounded implementation evidence in `evidence/`.

## What is implemented

- Four conditions `00/10/01/11`, first digit ambient, second auto. Ambient factor sets existing `uAmbientScale`, including ambient-to-swell coordinate coupling; auto factor filters only auto events. Full potential auto tape is retained for every condition. Polish remains off; no parameter retuning.
- A seeded local copy of the existing lattice-generation algorithm receives current constants. Separate Mulberry32 streams produce reproducible geometry and window-local automatic tapes. No global random patching.
- Exact-time hold/seek/restart, play to 30s, seed, condition, scripted scenario, manual recording, optional Resume context, JSON download/import, collapsible/hideable panel. Every render reconstructs the real buffer from the full selected tape, so seeking order cannot retain future sources.
- Script scenarios: no scripted impulses (`ambient-only`), single center t1, simultaneous pair t1, delayed pair t1/t1.5, 20-event burst t1…4.04, edge t1. Automatic tape has five viewport-uniform sources per ten-second window with current strength-jitter/width distributions.
- Manual pointer/key inputs are explicitly enabled, retained in a separate log and replayed with scripted sources. UI controls do not trigger them. Cadence resets on seeking/restart. Manual events persist until explicitly cleared, including across condition/scenario changes.
- Export records full exact state, current parameters/uniforms, original-double event tapes, selected events, logical slot map, actual Float32 source arrays, geometry hash, viewport/framebuffer/DPR/budget, browser/WebGL identity, source-file SHA256/Git identity, reduced-motion state and limitations. FNV1a32 geometry hash covers Float32 positions then seeds.
- Exported inactive uniform payload is canonicalized after the existing buffer copy; active data remains actual shader Float32 values. Logical source events retain doubles; compare via Math.fround when checking against uniforms.
- JSON import checks exact viewport/budget, parameters, source-file identity and regenerated expected geometry/tape for imported seed/scenario before applying. Incompatible imports are rejected with an explicit error rather than silently reconstructed. Manual events round-trip. Scroll position and the manual-recording checkbox are intentionally not restored; hold scroll fixed for context captures.
- All trials start held. A reduced-motion preference change pauses playback and reapplies the existing budget. Exact-time inspection and explicit Play remain available. No production reduced-motion behavior was changed.

## Automation contract

`window.rippleStudy` exposes `setState`, `seek`, `play`, `pause`, `addManual`, `clearManual`, `exportState`, `loadState`, `setPanelVisible`, and `awaitReady`.

```js
const api = window.rippleStudy;
api.clearManual();
api.setState({seed:47, condition:'11', scenario:'burst', time:3.81, context:false});
await api.awaitReady();
api.setPanelVisible(false);
const manifest = api.exportState();
```

`setState` holds and accepts a partial state; `seek` holds and clamps finite time to 0…30. Exact-boundary events are included (`event.time <= time`); ordering is time then lexical ID. Source buffer recycling uses first-free then first-oldest, with first-index tie handling. Auto events can evict scripted sources when auto is enabled; this remains an experimental outcome. `awaitReady` waits for fonts and renders in RAF; it does not prove screenshot compositing. The coordinator must verify presented pixels and exported state as specified in report 05.

## Verification evidence

Meaningful replay tests were written before implementation. Six assertions failed against minimal stubs, then all six passed after implementing the replay/seed/tape/geometry logic. Review identified two additional defects to guard: historical inactive payload and incompatible imports. Both new assertions failed against no-op stubs, then passed after fixes. These red/green outputs are retained in:

- `studies/ripple-baseline/evidence/node-red-initial.txt` — 0/6 passing, six expected assertions.
- `studies/ripple-baseline/evidence/node-red-review.txt` — six passing, two new expected assertions failing.
- `studies/ripple-baseline/evidence/node-green.txt` — 8/8 passing, zero failures.

The tests cover exact event boundaries, auto filtering, out-of-order replay, first-oldest/tie recycling, deterministic seeds/geometry, window-local auto-tape prefix stability/distribution bounds, burst capacity crossing, canonical inactive payload, and rejection of mismatched experiment metadata. There is no root test script/framework; this is the complete study Node suite, with no dependencies added.

Commands verified successfully:

```sh
node --test studies/ripple-baseline/replay.test.mjs
npx tsc -p studies/ripple-baseline/tsconfig.json
pnpm build
pnpm exec vite build --config studies/ripple-baseline/vite.config.ts
```

Both builds report the existing style of >500kB chunk warning. Root build completed, study build completed. No ESLint exists in this repository.

Bounded browser smoke used its own named `stage0-engine` session, not the coordinator's `stage0-review` or reference browser. Chromium used software WebGL. Verified:

| Check | Result / measured state |
| --- | --- |
| Desktop 1440×900, DPR1, all four conditions, burst t3.81 | Same geometry hash `a85ce90b`; 240×150 = 36,000 points; selected events 18 with auto off / 20 with auto on |
| Desktop backward/forward/condition detours then direct return | Exact canvas PNG data-URL equality in all four conditions |
| Actual engine slot arrays | Active source startTime, centerX and strength match logical slots via Math.fround |
| Canonical inactive state | Entire exported uniforms equal after burst→no-events return |
| Manual import round-trip | One manual event retained after clear/import; viewport-tampered import rejected |
| Manual cadence after reverse seek | Pointer events at t5 then seek0 produce logged times `[5,0]`, confirming reset |
| Mobile 390×844, DPR1, all four conditions, no-scripted t8 | Same geometry hash `2bbc56f2`; 65×140 = 9,100 points; exact canvas repeats; auto-off 0 events / auto-on 5 events |
| Mobile reduced motion + Resume | Held at explicitly selected t8, efficient budget, valid clipped safe bounds; no document horizontal overflow |

These checks use in-browser canvas data-URL equality, not the coordinator's decoded screenshot comparison. Different four-condition outputs were observed; their magnitude/meaning is reserved for the paired capture analysis. `evidence/mobile-smoke.png` shows functional responsive controls/context. `evidence/final-identity.txt` records post-restart source identity and reduced-motion startup state.

The clean initial render after favicon correction had no shader errors or resource errors. Software driver can emit a ReadPixels GPU-stall warning. Two later synthetic smoke events dispatched on Window instead of an Element produced a test-script target error; corrected smoke dispatches on the canvas and actual UI controls. This was not a spontaneous shader failure. The coordinator should use fresh console listeners for independent review.

## Baseline differences and limitations

The study is a controlled reconstruction using current engine exports, not the production bootstrap. Geometry/sources are seeded; scripted/manual strengths omit random jitter; ordering is explicit; clock is exact; old windows are replayed rather than skipped/caught up by a live RAF. Existing app background uses unseeded randomness. Current constants are unchanged.

The study enables `preserveDrawingBuffer` for synchronous canvas inspection, unlike production. Its performance cost is unmeasured. Context imports Resume CSS/font rather than the full production entry and uses the study safe-zone integration; panel overlays the field unless hidden. Reduced motion is held in this study; production still permits manual swells. Exported limitations preserve these distinctions. File hashes are captured at server startup, so any later source edit requires a restart before captures.

No real-device GPU/mobile performance, reference-algorithm provenance, perceived water depth, reading-task outcome or preferred design is established. Canvas equality in one software renderer does not guarantee cross-platform equality. Surface motion, transfer-function interpretation and visual quality still require independent review. The main 56-frame capture/metrics matrix and final review are coordinator-owned and remain separate from this implementation handoff.
