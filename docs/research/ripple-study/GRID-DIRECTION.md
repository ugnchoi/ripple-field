# Corrected direction — fixed 2D grid

2026-10-18. The user rejected the continuous shaded water surface produced on 2026-10-17. That delivery is superseded as a visual direction, even though its lifecycle/UI checks passed.

The user's clarified intent is a flat grid whose positions mostly stay anchored. Dot size and brightness should carry the motion. Subtle color variation should suggest features of liquid reflections without glossy 3D-like surface shading or dramatic color changes. No boats, birds, rocks or other foreground scene objects.

## Current slice

Produce an isolated, runnable comparison in `studies/grid-reflections/` before integrating a replacement into the portfolio. Keep the existing opening/playground flows available for later reuse, but do not treat the rejected mesh as the aesthetic foundation.

Three modes share exactly the same grid, field, inputs, camera, timing and background:

- A: brightness variation only; fixed dot diameter.
- B: size plus brightness; neutral color.
- C: same B size/brightness response, with restrained cool/warm hue variation.

For this comparison use zero XY/Z animation of point centers, stronger than the user's allowance of small movement, so the visual contribution of size/tone/color is unambiguous. Preserve discrete marks and visible gaps in all modes. Avoid negative-size/alpha disappearance from the legacy transfer and avoid per-frame randomness. Color changes must not inadvertently change luminance enough to become a second contrast experiment.

## Review contract

Capture matching moments for a quiet field, one disturbance and overlap, at desktop and mobile sizes. Include fixed-time repeats and actual playback evidence; software playback does not establish hardware frame pacing. Report reference observations separately from proposed interpretation. Native reference frames are available under `output/playwright/reference-study/`.

The goal of this slice is a concrete direction for user review, not a claim that the user has approved the palette or that the original reference's algorithm has been recovered. Deliver the runnable study, concise comparison and supporting evidence to a new Drive child folder clearly marked as the corrected grid direction. Preserve earlier packages as history.
