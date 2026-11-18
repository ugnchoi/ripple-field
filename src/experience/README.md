# Delivery UI handoff

Opening and Playground receive the real `createWaterSurface` factory from `src/water` through App.tsx. Root renders Opening and the unchanged Resume inside `section#resume`; `water/index.html` selects Playground with `data-page="water"` on its React root. Vite emits both HTML entries, so `/water/` and `/water/index.html` work on static hosts without an SPA rewrite. `base: "./"` and relative navigation (`./water/`, `../`) support hosting under a subfolder.

The legacy bootstrap import and ripple-host element have been removed from the active entry; only the new surface is mounted. Renderer source remains owned separately under `src/water`.

Both components enable supported quiet ambient motion, held initially for reduced motion. The factory contract is in types.ts; renderer owns resize/context lifecycle and resource disposal. SurfaceCanvas owns only scoped canvas pointer/keyboard input. No global pointer/key handlers are added. Canvas coordinates are normalized0..1 with top-left origin; medium strength is0.7 (gentle0.35/strong1). Canvas bounds determine placement; UI controls are siblings so their clicks do not disturb.

Opening is a generous full-viewport surface section with real name/title/tagline from the existing Resume data. Content is never hidden or gated by WebGL. One intro disturbance is claimed per tab session, with storage-denial fallback. A ref retains the claim across StrictMode effect replay. Reduced motion, direct fragments and back/forward entry skip it. Skip/Escape clear only active disturbances; they do not hide the page. User ripple ends the opening cue; natural timeout ends cue controls, leaving the field to decay. Pause and explicit Play remain available. Vertical touch scrolling/pinch zoom are retained in the opening; playground surface reserves touch gestures. Hidden tab pauses without automatically resuming on return.

App wraps Resume with id="resume" to support Read resume and the screen-only duplicate-tagline suppression in experience.css. The original Resume h1 remains in DOM/source and returns unchanged in print. All new experience content is omitted in print. Existing Resume/contact/print functionality still requires integration checks.

Meaningful intro-policy tests use Node's built-in runner and actual TypeScript policy, with no test framework/dependencies:

`node --test src/experience/introPolicy.test.mjs`

`intro-red.log` preserves the failing stub run (2 expected assertion failures); current implementation passes4 tests for one-shot session behavior, reduced motion, direct fragment/history return and denied storage. No tests mirror CSS or renderer forwarding.

SurfaceCanvas catches synchronous factory initialization failure, handles ready/lost/unavailable notifications, offers Retry and disposes the owned controller on retry/factory replacement/unmount. Explicit retry keys the canvas by retry count, replacing a potentially lost DOM canvas before the next factory initialization; ordinary StrictMode effect replay does not change that key. The previous effect disposes its captured controller before the replacement effect creates another. Renderer contract requires dispose idempotence and no event queuing while held. SurfaceCanvas ignores stale callbacks after disposal. Renderer lifecycle and real pointer/touch behavior require browser integration validation.

No browser/UI-flow or final rendering approval is claimed yet: integrated browser work belongs to the coordinator after this wiring handoff. Coordinator should check native1440x900 and390x844 plus short landscape; direct /water/ reload, skip/back/session policy, reduced motion changes, controller retries/context loss, UI clicks versus canvas input, keyboard focus, clear/pause semantics, print and fact/link preservation. The playground has a20rem minimum height to avoid the prior544px landscape constraint.

Verification at source handoff:25 tests pass across intro + frozen baseline/shading/profile suites; `npx tsc --noEmit` and `pnpm build` pass. Existing build emits a >500kB chunk warning. Both HTML entries now emit the integrated application bundle; build success does not certify browser behavior. Scoped Impeccable detector returned an empty findings list. Real integrated desktop/mobile/landscape/fallback/print checks remain mandatory after wiring.
