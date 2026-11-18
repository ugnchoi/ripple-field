# Fixed-grid comparison protocol

2026-10-18. Bounded review of the user's corrected direction. This is a visual study for review, not production integration.

## Paired states

At desktop 1440×900 and mobile 390×844, capture each mode at the same three states: quiet field, one ripple, three overlapping ripples. Use identical explicit events, field time, camera, viewport, DPR and grid seed. Also capture one exact repeated C state and verify decoded pixel equality. Record canvas dimensions and point count. Point centers must be invariant under time and mode; no Z deformation.

A = brightness only, fixed size. B = size + brightness with neutral tone. C = B geometry/size/coverage and subtle color. The C color branch should be luminance-preserving in linear RGB so a tonal contrast difference is not confused with a color benefit. Quantization and alpha compositing can still introduce small output differences; document these rather than promise exact perceptual equivalence.

## Visual questions

1. Does each frame read as a fixed, discrete grid, including in bright/dark bands?
2. Do size/brightness produce legible traveling wave fronts and quiet intervals?
3. Does overlap create richer patterns without filling the field into solid patches?
4. Does C add restrained warm/cool variation without distracting from the ripple structure?
5. Is the effect legible at native mobile size, not just a desktop enlargement?

Use a matching crop or clearly labeled enlarged detail to inspect dot size, color and fixed centers. Do not use the rejected continuous mesh as a preferred reference. Compare actual native outputs, not only parameter values or test results.

## Motion and controls

Capture a short actual playback clip. Record software-renderer timing limits. Check mode switching retains the field's phase; pause holds, clear removes manual ripples, replay repeats the scripted event sequence. Test pointer/touch and keyboard on the study canvas, and reduced-motion initial pause. Browser/model lifecycle tests should match the bounded study scope, not repeat the entire portfolio acceptance suite.

## Decision boundary

Perform one batched desktop/mobile visual pass. Correct concrete defects together, then make one confirmation pass. Prepare the comparison for the user. A working study does not establish that its palette is the final aesthetic choice.
