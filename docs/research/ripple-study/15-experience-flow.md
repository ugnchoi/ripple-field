# Delivery flow and acceptance plan

17 October 2026 · Planning only · Surface renderer/transfer choice pending Stage 1 evidence.

## Outcome and visual authority

Deliver a water-like interactive surface, a short portfolio opening and a dedicated `/water/` playground without Resume content. The opening should invite exploration while the portfolio remains useful immediately; the playground should give visitors uninterrupted room to experiment. Research is an input to delivery, not its completion.

Extend the incumbent pale paper, muted ink, Figtree interface text and serif Resume headline. Use existing spacing, link and button character; let the surface supply the expressive moment. No new scene objects, decorative imagery, brand system, invented achievements or simulation claims. `PRODUCT.md` and `docs/research/ripple-study/DELIVERY.md` are authority. Existing native desktop/mobile context captures establish the current visual world; no new visual implementation was inspected for this plan.

## Visitor flow

| Entry/state | What the visitor sees and can do | Transition |
|---|---|---|
| Portfolio `/`, first ordinary visit | Existing identity, Resume and contact/print actions are present from the first usable render. One restrained, deterministic surface disturbance opens behind the content. A visible text link, **Explore the water**, leads to `/water/`. | Opening settles into the supported resting surface. Scroll, links and print work during the cue. |
| Portfolio while opening runs | A compact **Skip animation** control is available; Escape also ends this cue while it is active. Neither action navigates or suppresses page content. | End the intro's autonomous cue and restore the normal surface state without a flash or content jump. |
| Portfolio return/back navigation | Resume position and ordinary navigation behavior take precedence. Do not replay the opening automatically on each route return or resize. | Keep an in-memory/session “intro completed” flag; loss of storage must not block the page. Direct fragment navigation bypasses the intro. |
| Direct `/water/` entry | Surface fills the available viewport. A small **Water** label, **Back to portfolio** link and restrained controls frame it. No Resume card, biography, contact block or print UI occupies the canvas. | Visitor creates a disturbance immediately; no loader, tutorial gate or required sound. |
| Playground interaction | A brief hint, **Tap or click to make a ripple**, explains the surface. Keyboard instructions appear with keyboard focus/help, without covering the main experiment area. | Hints recede after interaction; controls remain discoverable and operable. |
| Playground exit | **Back to portfolio** navigates to `/`. Browser Back retains its normal meaning. | Dispose playground resources and restore the portfolio without replaying the intro. Do not trap browser history in control changes. |

**Proposed intro budget:** one approximately 1.5–2 second visual phrase, with a hard completion path independent of successful WebGL setup. This is a design target for implementation, not a measured runtime promise. Compose it from the selected surface's own disturbance behavior; do not obscure or animate away factual content. A slow renderer must never hold a visitor behind a progress meter. A dedicated full-screen cover, countdown or fake loading percentage is unnecessary.

## Playground controls and input

Keep one small control group rather than a laboratory parameter panel:

- **Strength:** Gentle / Medium / Strong; default Medium, with bounded values established from the accepted surface. This varies impulse strength, not an unlabeled mix of several effects.
- **Pause / Resume:** freeze/resume the simulation clock and autonomous surface motion. While paused, do not invisibly queue input; show **Paused — resume to make ripples** in the hint area.
- **Clear ripples:** remove active disturbances while retaining the chosen strength and pause state. Use this precise label instead of ambiguous Reset. Clearing must not reseed the surface or restart the intro.
- Optional compact **Two ripples** action only if the selected surface makes a paired disturbance a useful experiment. It emits a defined pair without changing rendering settings. Omit it if it adds clutter or has no distinct observable result.

Expose no solver names, shader uniforms, noise octaves, source-capacity counters or unvalidated “realism” preset. Light direction can remain a research diagnostic unless evidence establishes a useful visitor-facing reason to expose it. Do not promise export/import or persistence in this slice.

On the canvas, primary mouse/pen press or a single tap places a ripple at that location. Exclude UI/link/control presses from spawning. Hover alone should not secretly change the event origin. Drag-to-stir, pressure sensitivity and multitouch are out of the initial scope; they need deliberate rate, gesture and capacity behavior before addition. On `/water/` only, reserve the canvas area for the experiment if touch scrolling must be suppressed; keep controls independently operable and avoid page-wide gesture cancellation. On the Resume route, preserve document scrolling, text selection and link behavior.

Make the playground surface a labeled, visibly focusable interaction region. Enter/Space creates a center disturbance when that region has focus; arrow keys move an optional visible target only if directional targeting is implemented consistently. The minimal keyboard equivalent is a center disturbance, not an invisible pointer inherited from prior mouse use. Do not bind global letter keys or intercept controls, links or editable targets. Tab reaches every control and the exit link; no focus trap. Mobile controls wrap within safe areas and retain comfortable touch targets. A bottom control group must not obscure the main disturbance target or be clipped by the browser toolbar.

## Reduced motion and unavailable effects

With `prefers-reduced-motion`, skip the opening and start the playground held with a plain **Play surface motion** action. Content and settings remain available. Explicit play may start motion, and a nearby Pause remains available; do not resume autonomously after visibility changes. A new preference change to reduced motion pauses the active effect. Manual impulse animation is not silently exempt from this policy: begin held, then let explicit play authorize subsequent surface interaction for the current visit.

Without WebGL, after initialization failure, or after unrecovered context loss, keep a pale static background and all Resume/contact/print/navigation content usable. In the playground show **The interactive surface is unavailable in this browser** with **Try again** and **Back to portfolio**. Do not leave enabled controls that appear to affect a blank surface. Retry is explicit and must not duplicate renderers/listeners. If automatic context restoration is implemented, preserve visitor settings and honor the paused/reduced-motion state; report recovery failure rather than looping indefinitely.

Print/PDF omits canvas, intro, exploration links and experiment controls as appropriate to the existing print layout. Resume facts, ordering, links and intended print function remain unchanged. No future feature or physical-fluid claim belongs in product copy.

## Bounded implementation acceptance

Run one batched desktop/mobile inspection after implementation, fix material defects together, then one confirmation pass. Treat findings requiring additional evidence explicitly; do not substitute more polishing for delivery.

| Check | Required observable result/evidence |
|---|---|
| Direct routes and navigation | Open `/` and `/water/` directly, refresh each, follow the exploration/return links and use browser Back/Forward. No missing route, repeated intro loop, duplicate canvas or Resume content in the playground. Record served-build route behavior. |
| Opening | Normal first load, Skip, Escape, scroll during intro and return visit. Resume is present immediately; no scroll/focus theft, blocked links or layout jump. Record one bounded opening sequence. |
| Experiment controls | Pointer/touch placement, each strength, pause/resume, clear and optional pair. Confirm changes have their labeled meaning; control taps emit no stray ripple; paused inputs are not queued. |
| Keyboard | Tab order and visible focus; Enter/Space on surface; input on controls; exit navigation. No global key capture or trapped focus. |
| Desktop/mobile layout | Inspect at 1440×900 and 390×844, portrait/landscape resize and actual DPR/budget. Check control wrapping, touch reach and content overflow. A narrow browser viewport is layout evidence, not a real touch-device performance result. |
| Motion preference/lifecycle | Reduced-motion initial entry, preference change, explicit play, pause, hidden-tab return and repeated route entry/exit. No unwanted restart; listeners, RAF and renderer resources do not accumulate. Record implementation evidence separately from screenshots. |
| Fallback/recovery | Exercise WebGL unavailability and context-loss/retry path. Static content/navigation remains usable, no endless blank loader or duplicated initialization. |
| Preservation | Compare Resume facts with `docs/resume/resume.json`; verify existing email/phone/profile destinations and print/PDF output. Field-only visual approval does not certify these functions. |
| Surface evidence | Review accepted surface in motion with single/pair and bounded repeated inputs at both layouts. Record coherent fronts, overlap legibility, tonal depth and texture drawbacks separately. Do not declare realism from darkness, one still or reference resemblance. |
| Build/runtime | Relevant logic checks, TypeScript and production build pass; no new shader/runtime errors. Log renderer/browser, limits and actual test device. Software-renderer captures cannot establish real-device frame rate, battery or mobile readiness. |

## Handoff and unresolved choices

This plan supplies the flow and acceptance boundary; it does not select the final surface or authorize app changes in this worker assignment. Coordinator chooses the smallest supported surface change after the Stage 1 motion/validity review, then explicitly assigns integration. The implementer must confirm selected strength bounds, whether the paired action earns its place, intro cue placement, resource lifecycle and deployment route fallback. These are bounded implementation decisions, not reasons to reopen the visual world or begin an unbounded study.

Final delivery requires working intro, working standalone playground, preserved portfolio functions, production-build verification and reviewable browser evidence, followed by the requested Drive package update. Mark anything unmeasured—especially real-device performance—plainly; research completion alone is not product completion.
