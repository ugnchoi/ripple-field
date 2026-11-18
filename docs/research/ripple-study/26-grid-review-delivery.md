# Fixed-grid comparison — coordinator review and delivery

2026-10-18. This slice implements the user's corrected **fixed 2D grid** direction as an isolated, runnable comparison. It does not integrate a new renderer into the portfolio or establish user approval of the palette. The earlier continuous shaded surface is superseded as a visual direction.

## What is ready

`studies/grid-reflections/` provides A (brightness only), B (size + brightness) and C (B plus restrained color). Point centers stay exactly fixed in XY and Z. Pitch is6CSSpx, matching the incumbent grid spacing; visible diameters are bounded to1.5–4.14CSSpx. All modes share field, input tape, clock, grid/camera and paper background. C alters linear RGB along a zero-luminance tint vector. It is a warm/cool interpretation, not a sampled reference palette.

The study offers quiet/single/three-source-overlap scenarios, replay, pause, clear, scoped pointer/touch and keyboard input, and hide/show controls. It is standalone static HTML/JS with relative assets, using the existing Three.js dependency. The app's current entry and original resume files were not changed in this slice. PRODUCT.md now records the corrected direction to prevent repeating the previous interpretation.

## Visual judgment

Initial matched native review: B reveals curved fronts and pale intervals substantially more clearly than A while preserving separated dots. Initial C gain.008 was too subtle to show a useful color contribution. One bounded adjustment changed C gain to.024; wave motion, size, tone, grid and background remained fixed.

Final C adds discernible muted olive/warm ink, especially in dense arcs. The cooler side remains closer to neutral grey-violet than a distinct teal reflection. B is the stronger demonstrated structural improvement; C is a restrained color option for user review. No claim that C is the final palette or that liquid-reflection character has been fully resolved. No further automatic tuning or integration follows from this review.

## Verified evidence

- Engine six Node built-in tests pass; standalone Vite build passes; independent source/math review passes. No new package or test framework.
-18 final native captures: desktop1440×900/mobile390×844 × quiet0/single1.1/overlap2.3 × A/B/C. All recorded source hashes match current files. Shared events/time/grid controls pass; every point buffer hash stays invariant, Z=0, no shader errors.
-12 A/B images exactly match the initial pass after the C-only change. Final C repeated desktop overlap is exact decoded RGB. Source and pixel integrity are recorded in `integrity.json`.
-Final B→C maximum per-channel differences: desktop17/19/21 and mobile10/19/19 (quiet/single/overlap). Whole-image mean absolute linear luminance differences are about.000066–.000106. Tiny differences from quantization/compositing remain; these metrics establish control, not perceptual preference.
-Pause keeps captured canvas pixels unchanged. Switching mode retains phase/anchors. Clear removes sources while preserving pause/mode. Mobile controls stay inside390×844 and all button/select targets meet44px height.
-Clean emulated-touch context accepts touchscreen.tap and scoped Enter input with no page scrolling/overflow; reduced motion initially pauses. This is browser emulation, not a physical-device claim.
-Actual C playback recording spans about3.54wall seconds and3.27model seconds on the measured software browser. Requested capture30fps is not a hardware performance claim. Source clock caps per-frame delta at.05seconds. The uploaded WebM is remuxed without re-encoding for seeking; raw recording and timing samples are preserved.

Engine lifecycle evidence covers context loss/restoration, ignored paused/lost inputs, fixed-time repeat and rendering teardown. Earlier dev lifecycle metadata includes a documented HMR/startup hash limitation; the final static capture manifests resolve source provenance for the review images. The isolated study is not yet a reusable production controller. See reports23–25 for implementation and independently attributed findings.

The scoped static design detector flags Arial as an overused font in the diagnostic controls. This is retained as a study-only presentation choice; it is not a palette/field defect or a typography change to the portfolio. No further visual polishing was performed after the bounded confirmation pass.

## Delivery

Review folder: https://drive.google.com/drive/folders/14I4fXAVXf69YwlLvLGXc0_AmQGCWvNgQ

Start with `01-matched-grid-comparison.pdf` and `02-color-grid-motion.webm`; the comparison includes native-scale detail crops and mobile examples. `03-runnable-grid-study.zip` is the standalone built study. `04-source-and-evidence.zip` contains study source, reports, final/initial native captures, tests and verification scripts. `00-start-here.txt` explains running it over HTTP and comparing modes at a paused common moment. Local archives are CRC-checked with SHA-256 manifest; uploaded sizes/parents are verified by Drive readback.
