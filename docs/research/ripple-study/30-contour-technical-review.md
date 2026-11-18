# Anchored contour port: independent technical review

2026-10-20 · Final bounded technical review: PASS. Scope: provenance from `src/engine/rippleFieldMaterial.ts`, CPU/GLSL parity limitations, viewport thickness, derivative approximation, fixed anchors and bounded dot footprints. Reviewer owns this report only; root owns browser/delivery.

## Original-method inspection

Read original `ambHash`, analytic gradient noise, rotated fBm, warp fBm and `ambientSurface`. The method warps a noise domain, folds scalar height into level-set distance, and uses a gradient-normalized approximate pixel distance to draw contour bands. This is source provenance, not a claim about any external visual reference's implementation.

Important retained-method caveat: `gradU = n.yz * (A_NOISE_F * A_LEVELS)` omits the domain-warp Jacobian in the contour-distance denominator, not just in the returned drift gradient. Exact chain propagation would include the transpose of the warp Jacobian before conversion to world/screen units. A literal port can give approximate local pixel thickness, but cannot claim exact uniform screen-space width from this expression. This finding was sent to the implementer before final handoff.


## Provenance and equation review

Independently extracted the noise/fBm/ambientSurface helper block from `git show 4841159:src/engine/rippleFieldMaterial.ts` and compared it with the embedded GLSL helper block in `contour.mjs`: byte-identical after trimming surrounding whitespace. Shared generated defines supply the port's explicit parameters. This verifies local source ancestry, not equivalence to the original whole renderer: original displacement, opacity and other surrounding transfers are not ported.

CPU hash, quintic interpolation and analytic gradient expressions follow the shader equations. CPU rotation and inverse-transpose accumulation agree with GLSL column-major matrix conventions. Both implementations use the same offset (137,219), oppositely traveling warp samples, two-octave settings, level folding, denominator floor and smoothstep profile. CPU comparisons must pass actual CSS height; the default 900 is not a viewport-independent reference.

No numerical GPU parity claim is justified: JavaScript double precision and shader float arithmetic can yield different hash/fract values, particularly in the large-offset hash domain. The copied formulas and shared configuration establish intended equation consistency; GPU output still requires actual capture. README explicitly records this limitation and qualifies inherited explanatory comments.

## Thickness and derivative chain

Shader uses `worldPerPx=2/uHeight`, matching the orthographic study coordinate mapping and CPU `2/height`. CSS units, not backing-buffer/device pixels, control nominal contour thickness. At fixed world coordinates/noise state and away from the denominator floor, doubling viewport height doubles estimated distance in pixels. Thus the mask expands in world units on a shorter viewport while retaining its nominal CSS width target. Device pixel ratio is handled separately by point sizing.

Width 8.1 is a half-width cutoff in estimated contour distance: nominal full support 16.2 CSSpx, and the full-strength core extends ±2.025px (4.05px total), followed by a soft edge. These are transfer thresholds, not measured geometric widths. Domain-warp Jacobian omission, the first-order distance estimate, extrema and the 1e-4 denominator floor prevent exact constant-width guarantees. The floor also means height-proportional distance scaling ceases near sufficiently weak gradients. No dot drift uses the returned gradient in this port.

## Fixed anchors, bounds and clicks

Final position remains `projectionMatrix*modelViewMatrix*vec4(position,1.0)`. Contour sampling affects only the scalar used for ink and point size; grid generation remains the fixed seeded planar lattice. Click coordinates are not domain-warped. Signed click packet formula and accepted display transfer are unchanged.

Mask stays in [0,1], so raw ambient `-.24+mask` lies in [-.24,.76]. After tanh(raw/.65), its resting signal lies approximately [-.353319,.824025]. B/C resting diameter is approximately 2.35362–3.90771 CSSpx and linear luminance .258714–.517730. With click overlap, the existing full-transfer limits remain 1.5–4.14px diameter at pitch6, leaving a nominal minimum 1.86px gap between neighboring point footprints; final C gamut bounds remain unchanged. These point-footprint gaps do not promise contours never visually merge or alias. Strong contour regions can compress added click contrast through the shared cap; root judges native legibility.

## Focused verification and verdict

Independently ran only the three selected tests matching `contour|CSS distance`: all pass. They cover bounded sparse-mask samples and temporal reshaping, CSS-height distance scaling including the floor exception, and unchanged click-only response/accepted point bounds. Sparse occupancy at selected CPU sample positions is not proof of GPU loop topology or full visual quality. No broad previous suite, browser session or source edits were performed.

**PASS for the bounded source scope: verified local GLSL provenance, consistent CPU/shader equations with explicit float caveat, viewport-aware approximate thickness, fixed anchors and bounded display transfer. No blocking technical finding.** README correctly discloses inherited Jacobian omission and stale/historical evidence limitations. Native shape clarity, motion, click legibility and performance remain root's browser/delivery responsibilities. This is not a physical-water or universal alias-freedom claim.
