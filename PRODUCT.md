# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Yoojin Choi's personal portfolio and resume. The user confirmed an expressive, interactive opening and a fixed 2D grid with water-like ripple behavior, plus a separate page without the resume where visitors can freely experience and experiment with the surface.

## Capabilities and Constraints

Existing implementation: frontend-only Vite, React 19 and Three.js; no backend or database. Resume facts come from `docs/resume/resume.json`. Preserve the resume content, contact/profile links and print-to-PDF function. WebGL is required for the interactive field; ensure content remains usable if the effect is unavailable. Use pnpm; the repository has no ESLint or general test framework.

Required delivery: convincing ripple behavior expressed mainly through dot size, brightness and restrained color shifts on anchored grid positions, an intro animation at the portfolio opening, and a dedicated no-resume experimentation page. The continuous shaded mesh delivered on 2026-10-17 was rejected as the visual direction. The user accepted the corrected fixed-grid study on 2026-10-19 and requested visible ambient movement at rest. Keep centers anchored and express this base motion through size, brightness and restrained color; stronger input ripples layer over it. On 2026-10-20 the user requested stronger contrast and explicit shapes, referring to their existing implementation. The committed engine already contains animated, warped-noise contour outlines; reuse that shape language within the anchored study. The user approved integrating this contour grid into the portfolio opening and dedicated playground. Preserve the accepted renderer as the shared source for the study and both site pages. Objects such as boat, bird and rocks are outside current scope; additional objects may be considered after the surface succeeds on its own.

## Evidence on Hand

Research and controlled studies live in `docs/research/ripple-study/` and `studies/`. The public reference is ya_demidov's Sinking into dither 02; its original rendering pipeline is unknown. Native reference samples support visual observations, not software attribution. Stage 0 establishes deterministic fixed-time comparisons; hardware performance and subjective water realism are not established by those results.

## Product Principles

- The visual medium is a flat, discrete grid. Avoid a continuous or glossy 3D-like surface.
- Keep grid centers anchored; size and brightness lead, with subtle cool/warm color variation.
- Ripple behavior comes before decorative objects.
- Test competing explanations with shared inputs before choosing a renderer.
- Preserve truthful portfolio content and working contact/print actions.
- Give visitors a clear way to explore freely without foreground resume content.
- Treat reduced motion, touch input and readable content as part of delivery.
