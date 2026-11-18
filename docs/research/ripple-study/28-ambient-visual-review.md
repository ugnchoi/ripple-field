# 28 — Ambient visual review

2026-10-19. Independent read-only review of the fixed-grid study's traveling ambient bands. No renderer changes.

**Finding:** resting motion is now visible on desktop and mobile. Broad diagonal light/dark regions change location and shape across the fixed dots; the result reads as spatial flow rather than the whole field pulsing in unison. A centered click remains a distinct, locally stronger circular disturbance. The ambient setting is suitable for the requested basic surface movement; no additional tuning is recommended from this bounded review.

## Method and evidence

Used a separate Playwright CLI session, `ambient-review`, on the rebuilt static study at `http://localhost:4182/`. Tested 1440x900 and 390x844, mode C, Quiet scenario with zero events, controls hidden. Let actual requestAnimationFrame playback run; captured four native screenshots per viewport with nominal 1.8-second waits, then clicked the canvas center and captured after a nominal 0.9-second wait. No fixed-time seek or fabricated event tape was used during the running pass.

Evidence is in `output/playwright/ambient-review/`: desktop/mobile-rest-0 through rest-3, desktop/mobile-click, and playback.log. All ten screenshots were visually inspected. Source hashes recorded by both running pages match the current six study source files; field.mjs hash starts `004e434a`, shaders.mjs `2265f437`.

| Check | Desktop | Mobile |
| --- | --- | --- |
| Recorded rest animation times | 0.350, 1.450, 2.550, 3.950 | 0.233, 2.267, 4.200, 6.233 |
| Recorded rest frame counters | 17, 39, 61, 89 | 19, 107, 175, 257 |
| Rest events | Zero throughout | Zero throughout |
| Position hash, including after click | 5c9789fd, unchanged | 247d177a, unchanged |
| Click event count | One | One |
| Recorded shader errors | None | None |

The associated state readings follow screenshots and are approximate screenshot times, not exact GPU presentation timestamps.

## Visual observations

- At rest, both viewports contain gently varying areas of smaller/lighter and larger/darker dots. Their boundaries are visible at native scale without click events. Mobile has fewer broad regions within its width, but movement is still spatially legible.
- Across running samples, diagonal boundaries and pale gaps shift relative to stationary rows. Different parts of the screen gain and lose coverage at different phases. This is stronger evidence for traveling texture than for a global synchronized brightness pulse.
- Dot gaps stay open and the grid remains flat. There is no visible mesh displacement or continuous shaded sheet.
- The click creates tighter concentric bands and a locally stronger contrast change against the broader ambient field. The background continues to contribute broad variation, but does not visually erase the click front in the inspected frames. This is a local qualitative hierarchy judgment for the default-strength click around one animation second after input, not a claim that every ambient pixel is dimmer than every click pixel. Weaker or late-stage decaying clicks were not tested here; they may blend into the substantial broad ambient variation, so click dominance is not established across all strengths and ages.
- Existing muted warmth/cool-neutral variation remains secondary to size and brightness. No new color-direction judgment is needed for this ambient-only change.

## Limits

This was actual browser playback assessed through sequential native captures, not an uninterrupted human video watch. It supports visible rest-state evolution and spatial differentiation, not smoothness, exact speed, or physical fluid behavior. The software renderer advances desktop animation time more slowly than elapsed wall time because the existing frame-step clamp caps long frames; do not infer production hardware performance from these waits. Mobile viewport emulation is not physical-device testing. Final delivery recordings belong to the coordinator. Scope remains the study, without automatic portfolio integration.
