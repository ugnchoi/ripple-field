# Reference forensics: Sinking into dither 02

Research only; captured 2026-10-16 UTC. No application changes or rendering-provenance claims.

## Result

The reference combines a stable portrait composition, a boat/bird focal object, moving concentric bright/dark bands, asymmetric lighting, and a fine patterned treatment across the scene. A reconstruction that only draws expanding point rings would omit substantial reference behavior. The evidence supports a layered visual description, but cannot identify the original geometry, wave equation, software, or dithering algorithm.

**Preferred working hypothesis:** a shaded scene with an animated radial water-like field, object bob/tilt or scene distortion, and a patterned image treatment. **Confidence:** medium for this visual decomposition, low for any particular implementation. A procedural radial function and a physical water simulation remain observationally compatible; neither is verified.

## Sources and artifacts

Primary public source: [ya_demidov reel Ddorv2xq9b4](https://www.instagram.com/ya_demidov/reel/Ddorv2xq9b4/). The unauthenticated existing browser could play it. Its visible caption is “Sinking into dither 02” and includes CreativeCoding, MotionDesign, Dithering, InteractiveArt and DigitalArt tags. Those are creator-supplied descriptions, not an implementation disclosure. The inspected visible comments include a question about how it was made, with no visible technical answer. Public web-fetch access failed, so observations below derive from the real browser, not search snippets.

All new evidence is under `output/playwright/reference-study/`:

- `page-evidence.txt`: URL, visible main-page text, duration, and capture count.
- `frames.json`: 40 callback-associated timestamps and playback counters, matching `native-00.png` through `native-39.png` in numeric order.
- `native-capture-log.txt`: exact capture command and returned metadata.
- `index.html`: labeled image viewer. Full-size PNGs are authoritative for inspecting the texture.
- `contact-sheet.png`: chronological preview; row-major indices 00, 04, 08, 12, 16, 20, 24, 28, 32, 36, 39. Nearest-neighbor reduction introduces aliasing; do not infer dot size or arrangement from this sheet.
- `roi-metrics.json`, `profile-metrics.json`: image measurements; `analyze.py` and `profiles.py` reproduce them with Python's standard library only.

Existing `output/playwright/playing-0.png`, `playing-1.png`, `playing-2.png` were independently inspected. They show consistent composition and changing inner-region contours around the approximate 1.54, 3.27 and 5.01 s times supplied in the brief. Their historical counters were not independently recovered. Earlier `reference-*.png` seek captures were excluded from temporal inference.

## Capture method and limits

The browser reported a 720 × 1280 source video and duration **10.005333 s**. A forward-playing pass was sampled at targets 0.10 + 0.25n seconds, n=0..39, using `requestVideoFrameCallback`. At each threshold, playback was paused and the video was drawn immediately into a 720 × 1280 canvas; the canvas was then screenshotted at native size. This avoids stale seek screenshots and Instagram UI occlusion. A temporary canvas and video sizing styles were removed after capture; the browser remains on the reference, paused.

Returned callback media times span **0.100000–9.866666 s**. Presented-frame counters advance **1049–1341**, establishing advancing decoded playback. Requested timestamps alternate onto 1/30-second-looking positions, but this does not prove source or authoring frame rate. The maximum absolute callback mediaTime/currentTime discrepancy was **0.032571 s**. Treat each image as callback-associated, not as independently certified to an exact source-frame number. Callback-time canvas drawing gives stronger evidence than setting currentTime alone.

Dropped-frame counters increased from **246 to 492** during this deliberately paused capture process. Therefore these samples support spatial/pose comparisons, not playback smoothness, temporal noise spectrum, precise velocity, or a claim of uninterrupted 30 fps. The last 0.139 s and the wrap boundary were not captured. This is one sampled pass through a compressed social-media video, not raw authoring output.

An initial browser-element screenshot attempt included Instagram overlays; those images were discarded and are not evidence. Canvas screenshotting required no authentication bypass, source download, or pixel export through a CORS restriction.

## Observed visual facts

| Observation | Local evidence | Confidence / qualification |
|---|---|---|
| Portrait framing, dark green/teal field, yellow-green light from upper left, near-black shaded areas; cream/green bright bands | `native-00.png`, `native-20.png`, `native-39.png` | High; appearance after platform decoding, not a recovered palette |
| Stable title near upper left and boxed “02” near lower left; bird perched at the boat's left/front upright | All sampled frames | High for composition; title surroundings still contain moving field pixels |
| Multiple nested curved bands extend well beyond the focal object and leave the image boundaries | Frames 00, 08, 16, 28 | High; image-plane ellipses/curves, not proof of circular world-space geometry |
| Broad bright ridges coexist with dark troughs and irregular inner crests; light is stronger on the left than right | Frames 00, 16, 24, 28 | High; brightness alone cannot be converted into height |
| Fine dot/crosshatch-like and horizontal microstructure covers the background and boat, with clustered dark marks in the boat's underside/reflection-like area | Native images at 100%, especially 00 and 24 | High for visible texture; low for algorithm, coordinate space, palette cardinality, or true dot topology |
| Inner dark/bright contours and the visible boat-interior boundary change materially; left boat/bird anchor also moves vertically | Compare 00, 12, 20, 28, 39 | High for contour motion; ambiguous between bob/tilt, occlusion, geometry deformation and image warp |
| Overall framing and object placement remain similar, and the late pose resembles the early pose | 00 versus 39 | Medium-high; loop-like behavior, not a verified seamless loop or exact period |
| No input cursor, click marker, keyboard response or interaction protocol is visible in the inspected reel | Full sampled pass | High for this evidence only; the InteractiveArt hashtag does not demonstrate the interaction mechanism |

## Spatial and temporal measurements

Coordinates below are native image pixels, origin at upper left. They are screen-space measurements and should not be read as world-space wave parameters.

### Bright-band profiles

For a repeatable coarse estimate, average Rec.709-weighted RGB luminance over x=300..429, smooth vertically with a 13-pixel box, and select four brightest peaks separated by more than 55 px within y=150..539. The search window was selected to avoid the title and most boat geometry. It still contains stylized, textured, nonuniformly illuminated bands. Peak selection can change band identity; it is not optical flow.

| Frame | Callback time (s) | Four selected y peaks |
|---|---:|---|
| 00 | 0.100000 | 228, 322, 415, 504 |
| 08 | 2.100000 | 224, 312, 405, 494 |
| 16 | 4.100000 | 205, 299, 392, 480 |
| 20 | 5.100000 | 191, 284, 377, 468 |
| 28 | 7.100000 | 256, 346, 438, 523 |
| 39 | 9.866666 | 233, 322, 419, 505 |

A visually plausible crest correspondence is **415 → 405 → 392 → 377 → 346 → 322**, an upward shift of about 93 px over 9.77 s. A second is **322 → 312 → 299 → 284 → 256 → 233**, about 89 px. This is consistent with outward phase motion on the upper half of nested rings and spacing around 90–100 px in this strip. The measured paths are correspondences proposed after observing the images, not verified tagged water parcels. They do not establish constant speed, propagation law, amplitude, damping, or fluid conservation. The near-return of the set of peak positions by the end can be explained by one wavelength passing through; it is not evidence that the water itself reverses direction.

### Regional change

Mean absolute RGB channel difference against frame 00, 0–255 units, without registration. ROIs use half-open pixel bounds; exact bounds are in `roi-metrics.json`.

| ROI | Bounds (x0,y0,x1,y1) | Difference at 5.1 s | Difference at 9.866666 s |
|---|---|---:|---:|
| Title region, including moving background | 40,70,300,145 | 7.932 | 5.322 |
| Boxed 02 marker interior | 43,1175,110,1236 | 1.659 | 1.787 |
| Boat and interior | 150,550,560,790 | 28.255 | 9.166 |
| Upper field | 300,180,650,440 | 18.002 | 6.006 |
| Lower field | 180,950,650,1150 | 19.581 | 6.900 |

These measurements show substantial scene evolution despite visually stable typography, and a closer late/early scene resemblance than mid/early resemblance. Compression, tonal changes and fine texture contribute to these values. They are not displacement magnitudes, a segmentation result, or proof that the title was composited in a separate render pass. Even the marker is not pixel-identical across the clip.

## Competing explanations and evidence against the preferred one

| Mechanism hypothesis | Supporting evidence | Strongest alternative / contrary evidence | Confidence | Discriminating evidence or experiment |
|---|---|---|---|---|
| Animated procedural radial field, shaded and patterned | Coherent nested phases; broadly repeating spacing; late pose resembles early; composition remains controlled | A fluid solver or pre-rendered animation can produce the same sequence. Irregular inner folds and boat-local behavior exceed a single clean sine ring | Medium as a reconstruction strategy; unverified provenance | Compare an analytic radial height/shading study against a solver study using the same camera, palette, texture and amplitude; score band trajectories and interior contours separately |
| Physical water simulation interacting with a floating object | Boat-like subject, occluding/reflection-like dark region, curving bright ridges, apparent bob | No observed impulse, collisions, boundary response, dispersion measurement or independent disturbance. A periodic procedural scene explains the clip with fewer required assumptions | Low as an attribution | Author source/breakdown, or a new independently placed impulse with measurable propagation and object response; a passive reel alone cannot supply this |
| Scene-wide image quantization/threshold pattern after shading | Similar fine pattern treatment crosses both object and surrounding field; apparent horizontal/regular microstructure | Could be textured materials, point rendering, baked artwork, multiple passes or platform resampling. Smooth boat gradients coexist with dense patterned areas; “dither” in the title does not identify Bayer/error diffusion/blue noise | Medium for broad patterned treatment; low for a specific filter | Obtain uncompressed stills and compare uniform tone ramps; move camera/objects to distinguish screen-space from surface-space patterns; controlled candidate filters at matching final pixel size |
| Boat is a separate shaded object that bobs or tilts | Bird/left anchor moves together while the title stays positioned; front/inside faces and shading look volumetric | Screen-space displacement of a prepared image, animated masks and painted depth cues can also generate this; apparent inner “deformation” may be water occluding the boat | Medium-low | Camera parallax or author geometry evidence. In reconstruction studies compare rigid bob/tilt, water occlusion and full-image warp independently |
| A 2D/2.5D warped or composited loop | Fixed viewpoint, limited pose change, highly controlled poster-like composition | Curved occlusion and shading may be easier to author with 3D geometry; that ease is not evidence against 2D | Medium as the strongest alternative to a native 3D pipeline | New viewpoint or independent lighting change, or source disclosure. Do not decide from a single compressed camera view |

A short rendered clip cannot reveal whether its authoring scene ran interactively. The browser is playing an ordinary video here. There is no observed basis for attributing Three.js, a point cloud, an FFT solver, a height-field solver, a particular noise source, or a particular dithering matrix.

## Next controlled studies

Keep these as research experiments, not an approved final design:

1. **Macro-motion control:** same fixed camera and untextured neutral scene; compare analytic outward phase animation, a height-field impulse, and a 2D displacement field. Measure upper-band y trajectories, spacing variation, and left/right asymmetry before adding dots. Record whether each can reproduce the approximate one-spacing phase advance across ten seconds.
2. **Object/field separation:** hold the field fixed and compare rigid boat bob/tilt, field-driven occlusion, and image warp. Track bird/left anchor and boat rim independently. A reconstruction should explain why these change while title position remains stable; no boat asset is necessary for the eventual portfolio study.
3. **Texture coordinate test:** identical static grayscale ramp and moving shaded surface; compare regular ordered thresholds, stochastic thresholds and a material/point treatment, all at final display size. Capture static and moving camera conditions. Judge grain size, highlight continuity, dark-region clustering and temporal flicker separately. Do not choose the winner by the creator's title.
4. **Temporal evidence improvement:** obtain an openly available author breakdown or authorized uncompressed source; otherwise record a genuinely continuous pass including wrap with per-frame presentation metadata. This would test loop continuity, short-time noise stability and speed variation. The current paused samples do not settle those questions.

**Decision gate:** use the measured composition, tonal asymmetry, broad phase motion and multiscale texture as reference traits. Keep software provenance, actual fluid dynamics, exact quantization, input behavior, original frame rate and seamless-loop claims unresolved. A technically plausible reconstruction remains a hypothesis until independently supported.
