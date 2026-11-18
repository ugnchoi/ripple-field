# Water surface delivery brief

Active goal: delivered water-like surface, nonblocking intro and separate /water/ experimentation page; no objects. Stage1 shading alone did not establish a useful water improvement. Stage2 signed phases visibly separate bands in fixed native states; its final motion/validity interpretation remains recorded in17/18. The production extension below is a new rendering implementation, not a claim that it is identical to either diagnostic or to the reference.

## Direction

Carry the supported signed crest/trough principle into a continuous, shaded water surface. Point-size/alpha caps hide negative troughs in the legacy output; a continuous mesh with height-derived normals can expose both signs without deleting dots. Use analytic height gradients instead of Stage1's four extra numerical field evaluations. No solver, scene objects, bitmap scenery or new external dependencies are needed for this delivery slice.

The material should visibly respond to slopes and traveling disturbances, with coherent light/dark flanks and a quiet ambient surface. Extend the pale-paper/ink portfolio world with a restrained pale silver/green water material; keep navigation and text legible. No dramatic unrelated dark rebrand, background photo or decorative UI cards. Do not claim photorealism, hydrodynamic simulation or recovered reference provenance. Review actual surface motion and native images before acceptance.

## Model and sampling

Use an explicitly documented signed radial wave packet with damping, bounded strength, safe center handling and superposition before a smooth height cap. A fixed wavelength around the tested0.14 world units and a calmer production speed around0.42 world/s are a declared production parameter decision, not a one-variable diagnostic result. Keep source packet width/decay/height scale fixed before the first final visual pass. Include a small smooth ambient wave sum with analytic gradients, not the old topographic contour transfer. All new coefficients and units must be documented.

Evaluate height and spatial derivatives together at mesh vertices in one source loop; derive normals consistently with displaced height including the cap derivative. Choose mesh sampling to resolve the shortest wave and bound vertex/DPR work at desktop and mobile. Separate scene realism from tessellation/aliasing artifacts. Continuous shading comes first; do not mask a failed surface with a noisy postprocess. A subtle stable texture is optional only after macro-form is visible and must not shimmer with random per-frame noise.

## Interface and lifecycle

Consume the existing read-only contract `src/experience/types.ts`. Engine owns only `src/water/**`; UI worker owns `src/experience/**` and later App/entry wiring. Create a synchronous SurfaceFactory with clear failure semantics. UI owns inputs and preferences; no global pointer/key listeners. Disturb coordinates are normalized top-left0..1. Paused/lost/disposed controllers must not queue new disturbances. Clear removes disturbances without reseeding or changing pause/strength.

Provide bounded reusable source buffers; expire negligible sources; no per-frame geometry recreation or object allocation in the hot loop. Own and release renderer, mesh/geometry/material, observers, context listeners and RAF. Pause while hidden/offscreen, preserve user pause state, avoid a large clock jump on resume. Handle context loss/recovery with meaningful status and fallback. Resize from displayed canvas bounds, not global window dimensions, so intro and playground can share the renderer. A disposal must be idempotent and safe in React StrictMode.

An engine-specific read-only diagnostics method is allowed for browser verification without putting technical counters in product UI. Do not expose a debug global in the shipped app.

## Verification and ownership

Engine worker: implementation with meaningful failing-then-passing no-dependency field/gradient/source-lifecycle tests, browser engine smoke, production TypeScript/build, report19-water-renderer.md. Do not edit legacy engine or frozen studies.

UI worker: generous opening, truthful identity/tagline, immediate Read resume and Explore the water, short skippable cue, return-session/reduced-motion policy; separate no-resume playground, strength/pause/clear and optional paired input; keyboard/touch/fallback/print/navigation. Integrate actual factory only after engine handoff. Resume facts/component remain unchanged.

Reviewer: independent mathematical and lifecycle review, consistency of shader versus CPU reference, finite bounds, source limits, pause/clear/dispose/context behavior; no performance claim from software captures. Source fixes go to owner with reproducer.

Coordinator: final batched desktop/mobile browser flow + native surface/motion review, fix material defects together then one confirmation pass; static-build direct route checks, fallback/context loss, print and preservation evidence. If surface still reads as flat patches or loses coherent fronts, report and fix that substantive gap; do not complete the goal on test counts alone. Deliver runnable code/build plus review materials to existing Drive folder.
