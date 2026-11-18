# Contour-grid portfolio experience

## Structure and identity

The root page opens with a full-viewport interactive surface, Yoojin Choi's existing name, title and tagline, and immediate Read resume and Explore the water links. Resume facts remain sourced from the original JSON and the Resume component is unchanged. The duplicate resume tagline is hidden only on screen and restored in print.

The separate `water/index.html` entry renders only the playground. Relative links and Vite's relative asset base support static hosting at a domain root or a subfolder. No router or service is required.

Typography inherits Figtree for controls and the existing serif family for the opening statement. Paper and ink inherit the portfolio variables, falling back to #f7f7fb and #16181f. The shared grid renderer uses the accepted paper background and restrained warm/cool dot tones. Grid centers stay fixed on a six-CSS-pixel lattice; animated contour outlines and click ripples are expressed through dot size and brightness. Controls use restrained outlines, visible focus indicators and at least 44px button heights. The surface stays uncovered except for actual text and controls.

## Motion and input

The opening cue lasts up to 1.85 seconds and never gates content. A tab-session claim suppresses repeats; direct fragments, history returns and reduced motion skip it. Skip or Escape clears active disturbances. Canvas interaction ends the cue controls, while natural timeout lets the field decay.

Both views enable ambient motion. Reduced-motion preference initially holds the surface and a live change to reduced motion pauses it. Explicit Play remains available. Hiding the document pauses without automatic resume. Only the canvas handles pointer input and Enter/Space; controls do not emit ripples. The opening preserves vertical touch scrolling and pinch zoom; the playground reserves canvas touch gestures for interaction.

Playground strength choices are Gentle (0.35), Medium (0.7) and Strong (1). Clear ripples preserves strength and pause. Keyboard input produces a centered ripple. Pause rejects new disturbances rather than queuing them.

## Lifecycle and fallback

SurfaceCanvas injects the real renderer factory and disposes its controller on replacement or unmount. Retry keys a fresh canvas, which avoids reusing a lost WebGL context. Initialization failure or context loss exposes plain-language status and a Try again action. Portfolio navigation and resume content remain available.

The renderer owns resize, context restoration, scheduling and resources. The UI owns preference handling and scoped input. Diagnostic controls belong only to the renderer smoke page, never the product UI.

## Responsive and print behavior

The opening uses a full small viewport height with naturally flowing content. Playground controls wrap on narrow screens and compact in short landscape. Tested layouts include 1440x900, 390x844 and 844x390. Print hides the opening and playground and preserves the original resume stylesheet and PDF action.

## Evidence and limits

See `docs/research/ripple-study/21-delivery-ui-verification.md` and `output/playwright/delivery-ui/` for functional evidence. Surface realism and final visual judgment are separate from UI function. Browser recordings use a software renderer and do not establish hardware frame rate or universal device support. The production surface now uses the accepted contour-grid equations shared with the study under src/grid. The continuous mesh is no longer mounted by either application route. The contour method comes from the original engine; no physical solver or exact reconstruction of the public reference is claimed. See reports33–35 for current integration evidence.
