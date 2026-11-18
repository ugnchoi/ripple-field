# Defined contour shapes — 2026-10-20

The user requested stronger contrast and explicit shapes, noting an existing implementation. Confirmed the original contour method in committed src/engine/rippleFieldMaterial.ts (4841159). Adapted its noise/warp/contour helpers into the isolated anchored study. Original engine files remain unchanged.

Nine source tests and standalone build pass. Fresh static-build desktop1440×900/mobile390×844 checks show ambient motion with no events, unchanged position hashes, exact paused pixels and no shader errors. All seven embedded source hashes match current files. Independent technical and visual reviews are reports30 and31. Click fronts remain visible, though contour strokes stay prominent at crossings; weaker/late clicks were not certified to dominate.

Motion clip is10.18seconds of actual canvas capture (10.05modelseconds over10.53seconds of workflow), not a synthetic fixed-time video. Capture is software-browser evidence, not physical-device performance. The original method retains approximate gradient-based contour width and floating-point CPU/GPU noise differences.

Review folder: https://drive.google.com/drive/folders/1p09LXdIHFl-A9D7cvVWeA5unctoc06Vt

Contains motion, matched before/after images, runnable study and source/evidence. Previous delivered versions remain preserved. Four initial uploads were verified through exact size and destination-parent metadata readback. Source bundle readback follows packaging. This remains pre-integration.
