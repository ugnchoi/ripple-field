# 31 — Contour visual review

2026-10-20. One bounded independent desktop/mobile pass of the fixed-grid contour study. No renderer edits.

**Conclusion:** the port achieves a substantially more explicit outline treatment than the previous broad ambient bands. Connected, nested and closed-looking dotted paths enclose quiet interiors. The contrast is concentrated on narrow outlines while the faint underlying lattice remains visible. Mobile paths are traceable at native size. This is suitable for user review as the requested contour direction; no generic glow or cloud adjustment is recommended.

## Evidence and method

Separate Playwright CLI session `contour-review`, static build at port 4182, mode C, Quiet scenario, zero resting events. At 1440x900 and 390x844, ran actual animation, captured two native rest frames with a nominal 1.8-second interval, clicked the canvas center and captured after a nominal 0.9-second wait. All six PNGs were inspected: `output/playwright/contour-review/{desktop,mobile}-{rest-0,rest-1,click}.png`. `playback.log` contains state readings and the exact procedure.

Recorded animation times were desktop 0.350/1.867, then click frame 2.800; mobile 0.150/2.067, then click frame 3.083. States are read after screenshots, so these are associated times, not exact presentation timestamps. Rest frame counters advance 17→48 desktop and 18→132 mobile. Both runs have zero resting sources and one source after the click, with no recorded shader errors.

All seven source hashes returned by both pages match the inspected source files. Contour source hash begins `16c95fe6`, field `7dd7b368`, shader `2051741e`.

## Findings

| Criterion | Judgment |
| --- | --- |
| Explicit outlines | Clear. Irregular nested paths, small enclosed islands and larger rounded cells are recognizable; several paths naturally leave the viewport. Visual connectedness means a traceable sequence of dots, not a solid pixel-contiguous stroke or a mathematical proof of closed topology. |
| Quiet interiors | Clear. Most interior areas retain small, faint lattice points rather than filled dark masses. No broad glowing sheet is visible. |
| Tonal contrast | Clear improvement in edge/interior separation. Narrow outlines carry larger/darker dots, and size remains a major signal. Overall color stays muted; this is not a claim of maximum black/white contrast or a measured contrast ratio. |
| Fixed grid | Rows remain regular and dot gaps open. Reported geometry hash stays 5c9789fd on desktop and 247d177a on mobile through rest and click. |
| Mobile line readability | Traceable at 390px width. Stair-stepping and occasional thinning occur where curved paths cross the six-pixel lattice, but the sampled shapes remain recognizable. Some cells are cropped by the narrow viewport. |
| Resting evolution | Paths reshape between running samples while the grid stays fixed. The sampled change is spatial, not uniform whole-screen pulsing. |
| Click legibility | A default centered click around one animation second old adds visible tighter circular bands on both viewports. Those bands coexist with the stronger irregular ambient outlines; the click is detectable but is not uniformly the darkest element at contour crossings. |

## Bounds and recommendation

The click judgment applies only to the inspected default-strength input near one second after activation. Weak inputs and late decaying rings may compete with the now stronger ambient strokes; universal click dominance is not established. That limitation does not block reviewing the requested clearer contour appearance.

Actual browser playback was assessed through sequential native captures, not an uninterrupted human video watch. This pass cannot certify temporal antialiasing, flicker absence, hardware smoothness or physical-device touch performance. Software rendering and the existing animation-step clamp affect wall-clock timing. The original application's contour generator is the design reference; this report does not attribute that method to the external reel.

Recommend presenting the current study for user review with the fixed-grid constraint intact. No further tuning or broader study is needed for this review slice. The original renderer was not edited by this reviewer, and no application integration is implied.
