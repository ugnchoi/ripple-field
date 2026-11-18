# 34 — Grid integration UI review

2026-10-20. Scoped UI handoff for the approved fixed-grid contour renderer integrated into the portfolio and `/water/`. Engine/App ownership remains with the engine worker. This worker changed only `src/experience/experience.css` and this report.

## Change and result

The stronger contour strokes crossed small role text, the opening hint, name and navigation links, adding avoidable reading noise. One CSS batch gives those text elements a paper-colored background constrained to their content width. The main serif statement remains directly over the field; no large card, decorative object, new copy, or engine change was introduced. The playground's existing paper-backed controls/hint were retained, with the back-navigation link receiving the same small-copy protection.

The final native desktop/mobile confirmation shows clean small copy, clear primary heading hierarchy, visible contour character, and working layout bounds. The opening's links retain #resume and ./water/. At 1440px and 390px the document has no horizontal overflow; the playground fits 1440x900 and 390x844 without vertical overflow in the initial pass. Final hint backing is rgb(247,247,251), width373.375px on desktop and350px on mobile, with the mobile two-line hint ending at y761.5 inside the opening.

## Opening behavior

The existing 1.85-second cue controls ended before the first screenshot after a nominal2.2-second wait on both viewports. The canvas was ready, navigation stayed present, and later screenshots showed the ongoing contour field. No UI timing change was necessary. The existing natural timer ends cue controls without clearing the ripple; the finite renderer disturbance is allowed to decay into ambient motion. Skip/Escape explicitly clear disturbances. This pass checked the visible transition and source contract, not an exact GPU-timed expiry measurement.

## Verification

- Separate `grid-ui-review` Playwright session against static production port4180.
- One batched initial desktop/mobile opening-and-playground pass, one CSS correction, one batched final confirmation. No repeated polish loop.
- Final production assets: `main-DwO-cZlM.js` and `main-u4CqOHHE.css`.
- `npx tsc --noEmit`, `pnpm build`, and all four intro-policy tests pass. Existing >500kB bundle warning remains.
- Evidence: `output/playwright/grid-integration-ui/visual.log`, initial opening/later/playground PNGs, and four `*-final.png` captures. All four final screenshots were visually inspected.

Per coordinator instruction, the final pause/reduced-motion, keyboard/strength/clear, skip/session/fragment, fallback/retry, direct emulated touch, short-landscape and print checks are owned by the coordinator, rather than duplicated here. This report does not claim those final integration results before their completion. Resume component/data, contact links, print rules, SurfaceFactory contract and behavior hooks were not edited by this worker.

## Limits and handoff

Readability was assessed visually at native screenshot size; this is not an exhaustive animated-background contrast audit. Software rendering does not establish hardware frame rate. The design remains deliberately patterned behind the large headline, while smaller functional copy has a stable paper background. No further UI changes are requested. UI source is frozen and ready for the coordinator's final functional verification and publication workflow.
