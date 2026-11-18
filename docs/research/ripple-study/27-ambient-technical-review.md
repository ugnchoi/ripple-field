# Ambient grid motion: independent technical review

2026-10-19 · Final bounded source review: PASS. Reviewer owns this report only. Scope: CPU/GLSL parity, fixed anchors, deterministic ambient behavior, contribution bounds relative to click ripples. Root owns browser capture and delivery; no broad prior-suite rerun or source edits by reviewer.

## Baseline and gates

Initial inspected source uses two low-amplitude ambient sine terms (.09 and .06) plus the existing signed click packets before the shared tanh cap. The grid anchors, display transfer and click envelope are already separate from this ambient expression.

Final review will check shared coefficients and phase conventions, unchanged position shader path, analytic amplitude bounds and click interaction, plus focused tests. Mathematical boundedness does not prove perceived motion or user preference; those require root's actual playback review.


## Final source and focused verification

Read final `field.mjs`, `shaders.mjs` and the ambient tests. Three frozen shared coefficient records generate both CPU ambient evaluation and the GLSL expression:

| Amplitude | Wave vector (radians/world unit) | Angular frequency | Phase |
|---|---|---|---|
| .22 | (5.6, 2.1) | .85 | .4 |
| .13 | (-3.2, 8.4) | -1.15 | 2.1 |
| .07 | (13, -6) | .95 | 4.2 |

Each term is amplitude × sin(kx·x + ky·y − omega·time + phase). Negative omega is handled consistently in the generated expression. Independently evaluated that generated expression in JavaScript at 500 spatial/time samples against `ambientAt`: maximum error 0. This checks coefficient/phase generation, not GPU floating-point readback. Shared tanh cap and click summation remain consistent with the existing CPU/GLSL path.

Independently ran only the two focused tests selected by `resting field|ambient is bounded`; both pass. They verify nonzero distributed change over sampled one-second intervals, deterministic replay, amplitude and spatial/time continuity bounds. Their wording about visible change is a numeric threshold, not proof of perceived motion. No broad historical suite or live browser session was run.

Grid creation remains the same seeded six-pixel planar lattice. Final position expression remains `projectionMatrix*modelViewMatrix*vec4(position,1.0)`. Ambient values reach ink/diameter transfer only; they do not modify XY/Z. Click parameters, source tape, luminance/diameter/color transfer and normal-free point rendering are unchanged. Ambient requires no extra source events, slots or per-frame geometry allocation; it uses the existing simulation clock, so pause/hidden behavior follows that clock.

## Bounds and click relationship

The raw ambient sum has absolute bound .42. After the .65 tanh cap, ambient-only signal is bounded by .5690751. Resting B/C diameters therefore lie within approximately 2.06882–3.57118 CSS pixels and linear luminance within .314803–.565197. Combined click plus ambient input still obeys the existing full-transfer diameter 1.5–4.14px and luminance .22–.66 bounds, with unchanged C gamut guarantees.

The ambient capped-signal time derivative is bounded by .62 per simulation second. Its shortest sinusoidal wavelength is approximately .43884 world units, longer than the click carrier's .24. This change introduces no finer base spatial wavelength than the existing click field; it is not a universal alias-freedom claim for nonlinear summed output.

For comparison, a strength-1 click's age/envelope factor peaks at approximately .755823 at age .315138 simulation seconds, before spatial envelope/carrier attenuation; a .7-strength click has corresponding factor .529076. Ambient raw bound .42 is consequently substantial rather than negligible. Ambient is not guaranteed subordinate to every click, especially late decaying clicks or local cancellation. The total tanh cap also compresses click contrast where ambient is strong. Actual click legibility and resting-motion quality must be checked in root's playback; this is not a mathematical defect or a request for unbounded retuning.

## Verdict

**PASS for the bounded technical scope: CPU/generated-GLSL ambient parity, fixed anchors, deterministic bounded contribution, unchanged click/display transfer, and focused ambient tests. No blocking source finding.** Coordinator notified of the ambient-versus-click contrast consideration. Root owns native browser playback, final visual judgment and delivery. This report does not claim hardware performance, GPU numerical identity, or user acceptance of the final motion character.
