# Stage 0: surface observations from existing captures

17 October 2026 · Surface-first visual review · No browser use, new captures, source changes or object proposals.

## Finding

The current layers supply two distinguishable ingredients: ambient adds winding contours across the field; impulses add broad circular bands and patches. Their combination supplies spatial complexity, but the inspected stills do not yet establish a convincing water surface. My strongest unresolved perceptual issue is whether the dot-size/darkness treatment makes disturbances read as patches of ink rather than slopes catching light. That is a reviewer hypothesis, not a measured failure or evidence that a fluid solver is required.

**Recommended next discriminator:** an isolated, same-field comparison of the current point transfer against a directional slope-to-tone treatment, using one impulse and a simultaneous pair. Keep objects, new simulation dynamics and a new dither method out of that experiment. Details below.

## Evidence boundary and controls

Applied [the reference-traits rubric](06-reference-traits-review.md), with object coupling excluded under the confirmed surface-first intent in `BRIEF.md`. All image paths below are relative to `output/playwright/stage-0/`. Conditions: C00 ambient off/auto off; C10 ambient on/auto off; C01 ambient off/auto on; C11 both on. Even C00 contains scripted impulses in pair/burst scenarios.

Inspected **24 unique native PNGs** with `view_image`:

- Desktop: early and late, all four conditions; pair C00/C10; burst C00/C11; foreground C00/C11.
- Mobile: early C10; late all four; pair C00/C11; burst C11; foreground C00/C11.

Foreground observations use the current parent-directory PNGs after the coordinator's font/layout recapture; superseded-context files were excluded. Reopened all four foreground examples after that notification.

The manifest gives early=2 s and late=8 s without scripted impulses, pair=2 s after simultaneous events at 1 s, burst=3.81 s, and foreground at late time. A read-only check confirmed equal geometry, parameters, event tape, viewport, revision and sample time within each of the eight primary four-condition groups. Desktop geometry hash is `a85ce90b`; mobile is `2bbc56f2`; applied DPR is 1. Dimensions are 1440×900 and 390×844. The coordinator's `image-metrics.json` records all 16 repeated states as exact RGB matches; I checked those records, not a fresh independent pixel recomputation.

This is a bounded interpretation of fixed states on the recorded SwiftShader renderer. It does not measure temporal continuity, smoothness, input latency, flicker, performance or actual mobile hardware behavior. Cross-viewport comparisons are qualitative: geometry, world-to-screen framing and budget differ.

## What the pixels show

| Evidence | Observed surface contribution | Water-like interpretation and limit |
|---|---|---|
| `desktop-early-C00.png` versus `desktop-early-C10.png`, 2 s; `desktop-late-C00.png` versus `desktop-late-C10.png`, 8 s | C00 is a pale, nearly uniform fine lattice. C10 adds long winding bands of stronger/larger-looking marks and quieter gaps across the canvas. | **Clear spatial organization; high confidence.** Ambient supplies large-scale contour structure without a scripted disturbance. These outlines can suggest an undulating field, but a topographic/graphic interpretation is equally plausible. They do not by themselves show water depth or a traveling front. |
| `desktop-early-C10.png` versus `desktop-late-C10.png`; `mobile-early-C10.png` versus `mobile-late-C10.png` | The two times contain different contour arrangements; on mobile, broad curves are cut by the narrow frame and long diagonal/vertical segments dominate. | **Clear state change; high confidence.** Direction, crest identity and coherent travel are **ambiguous** between just two states six seconds apart. Do not describe these as smooth drifting water or quantify propagation from them. |
| `desktop-late-C00.png` versus `desktop-late-C01.png`; corresponding mobile late pair | Auto-on introduces broad round/arc-shaped patches, notably in the lower/left desktop region and middle/lower mobile field. At early desktop time the added patch is subtler. | **Clear disturbance footprints; high confidence.** The manifest has one selected auto event at 2 s and five at 8 s; their ages and positions matter. These counts are not counts of visibly active fronts. A circular tonal patch suggests an impulse but does not prove radial motion or water mechanics. |
| Desktop early/late C01 versus C11, with C00/C10 controls | C11 retains the winding ambient pattern while adding stronger circular patches. Fine contours cross or sit within those patches; some boundaries are harder to isolate visually. | **Clear combined layering; medium-high confidence.** More structure does not automatically mean more coherent surface. Ambient can enrich an otherwise simple disturbance or compete with its readable boundary. Coordinate coupling, tone/opacity and sampling can explain interaction; no hydrodynamic inference follows. |
| `desktop-pair-C00.png` versus `desktop-pair-C10.png`, 2 s | Two large curved disturbance zones occupy much of the frame; upper/lower arcs and the central overlap can be distinguished. C10 adds winding lines over the same broad composition. | **Clear overlapping footprints; high confidence.** The overlap reads as a broad tonal region rather than an independently resolved train of crests and troughs. This is one pose; collision, cancellation and subsequent front persistence remain unmeasured. |
| `mobile-pair-C00.png` and `mobile-pair-C11.png`, 2 s | Broad arcs cover much of the narrow field, leaving a quieter central area; C11 has additional dark irregular contours. | **Clear large-scale arcs; medium confidence for depth.** Cropping makes complete front shapes less accessible. This does not isolate an ambient effect because both ambient and auto change in this particular pair; the desktop C00/C10 pair supplies the cleaner ambient contrast. |
| `desktop-burst-C00.png`, `desktop-burst-C11.png`, and `mobile-burst-C11.png`, 3.81 s | Dense stronger dots occupy much of the field. Desktop C11 retains dark contour streaks over a broad darkened patch; mobile C11 is dominated by a dense dotted mass with irregular streaks. | **Clear coverage buildup; high confidence.** Individual fronts become less separable in this sampled stress state. “Ink accumulation” is a plausible perceptual reading, not a diagnosed source-buffer defect. C00/C11 changes both factors and cannot assign that difference to either alone. |
| Native early/late versus pair/burst images | Sparse dot marks remain apparent; strong disturbances make them much more prominent. Broad bands remain visible in pair states, while dense burst dots compete with their shape. | **Clear multiscale structure, ambiguous surface depth.** Screenshot clusters cannot reveal whether point centers moved, sprites enlarged or opacity changed. Temporal texture stability is unmeasured. No specific dithering method is demonstrated. |
| Current `desktop-foreground-C00.png`/`C11.png` and `mobile-foreground-C00.png`/`C11.png`, 8 s | Heading placement and line breaks agree visually within each viewport. The full heading is visible on mobile, with its text beginning around x45. The light card conceals most field structure; differences are clearest in exposed margins/header. | **Clear stable sampled hierarchy; high confidence.** This context is weak evidence about surface quality because it hides most of the surface. Static images establish neither motion distraction nor reading-task success; links and interaction were not tested in this review. |

## Quantitative support, not a resemblance score

Coordinator-provided whole-canvas metrics use display-encoded Rec.709 luminance and darkness relative to `#f7f7fb`. The following values were read from `image-metrics.json`; they support coverage observations, not geometry, depth or water quality.

| Sample | Mean darkness | Pixel fraction with darkness >0.08 |
|---|---:|---:|
| Desktop late C00 | 0.01044 | 6.79% |
| Desktop late C10 | 0.01306 | 8.14% |
| Desktop late C01 | 0.01191 | 7.68% |
| Desktop late C11 | 0.01472 | 9.09% |
| Desktop pair C00 | 0.02383 | 14.22% |
| Desktop burst C00 | 0.08759 | 42.62% |
| Desktop burst C11 | 0.09935 | 46.00% |
| Mobile burst C11 | 0.16287 | 68.67% |

Burst values support the visible coverage buildup. They do not establish physical saturation, count active points, or make mobile “worse” by a common pixel criterion. The two viewports expose different portions/scales of the scripted field. Nor does more darkness imply more depth.

## Uncertainty and strongest alternatives

My preferred interpretation is that existing contours and disturbance shapes provide useful surface structure, while their tonal presentation may be limiting the relief/depth cue. **Confidence: medium-low** for that causal hypothesis. A still image cannot show whether motion supplies precisely the missing cue. The strongest alternative is that the field profile/dynamics, rather than its transfer, lacks the repeated phase structure needed for a water-like reading. Another is that extremely pale contrast and close-view dot sampling dominate perception regardless of field model.

Evidence against a simple “mapping is the whole problem” claim: ambient creates intricate outlines but the inspected unscripted frames do not establish a trackable disturbance train, and dense burst states cover such a large region that changing shading alone may not recover separated fronts. Conversely, a solver rewrite is not justified by a pale dotted still: the current pair already contains clear broad arcs, and different shading could reveal their slopes. These are competing explanations, not settled implementation requirements.

Reference surface traits remain contextual evidence: coherent nested phase progression, uneven bright/dark bands and patterned tonal organization were observed in the existing reference samples. Exact palette, period, band count, pixel displacement and source algorithm are not targets. No scene subjects are needed to test those surface traits.

## Next discriminating surface-only study

**Question:** can the same existing disturbance field read as relief rather than dot coverage when its slope changes tone directionally?

Use an isolated study with ambient and auto off, identical seeded sampling, camera, geometry, field parameters, event tape and fixed sample times. Compare the current transfer to one declared candidate that treats the existing scalar disturbance as a **height proxy** and maps its spatial gradient to a fixed directional tonal response. This is a diagnostic shading construction, not recovered physical height or a simulation claim. Keep the point sampler and spatial displacement common. Declare any dot-size/opacity change as part of the transfer; do not silently introduce a new field, lattice, camera, palette or postprocess. Fix candidate gain/lighting before viewing the primary comparison; report coverage so a contrast increase cannot masquerade as better structure.

Limit initial stimuli to one center impulse and one simultaneous pair. Review identical fixed-time sequences spanning emergence, overlap and decay, in both existing viewports. Before preference, ask whether ridge sides have distinguishable light/dark structure, one front can be followed through successive states, and overlap preserves identifiable approaching/outgoing forms instead of only building a dark patch. Fixed stepping can inspect these appearances; smoothness still needs separate evidence. Use native crops to distinguish surface cues from dot merging.

If a comparable-coverage transfer reveals coherent relief with unchanged dynamics, investigate transfer/sampling next. If both transfers remain a single cushioned patch or lose front identity at overlap, a later signed radial-train versus current-profile study becomes the stronger discriminator, with transfer held fixed. Do not infer from either outcome that a stateful fluid solver is necessary. Foreground integration, additional objects and new dithering remain outside this recommendation.

**Coordinator decision:** whether to authorize this bounded transfer diagnostic after the Stage 0 review. No further captures or implementation were performed for this report.
