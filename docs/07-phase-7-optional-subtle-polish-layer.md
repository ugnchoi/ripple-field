# Phase 7 — Optional Subtle Polish Layer

## Purpose

Add minimal finishing treatment only if the field and grid already work without it. This phase is optional and must stay secondary to the field behavior.

## Dependencies

- Phases 1 through 6 are complete
- The background is already successful with polish disabled
- The team can compare on/off states objectively

## Objective

Apply restrained finishing touches that:
- increase refinement without changing the core identity
- stay visually quiet behind foreground content
- never compensate for weak field behavior

## Scope

- Restrained, secondary enhancements only
- No effect should compensate for weak field behavior

## Phase deliverables

- Optional polish layer spec
- On/off comparison demonstrating real value

## Exit criteria

- Polish increases refinement without changing the core identity
- Disabling polish still leaves a strong background system

## Candidate additions

- Extremely subtle tonal lift near stronger swells
- Faint compositional vignette
- Restrained edge softening
- Minimal depth cueing if it helps composition

## Explicit non-goals

- Dramatic bloom
- Cinematic blur
- Chromatic tricks
- Post-processing that becomes the main attraction

## Stage breakdown

### Stage 7.1 — Polish candidate review

**Goal**
Decide which finishing treatments are worth testing at all.

**Implementation tasks**
- Identify the smallest set of candidate additions
- Reject any candidate whose primary role is spectacle
- Keep the starting list short enough for disciplined comparison

**Checks**
- Every candidate has a clear compositional purpose
- No candidate changes the perceived category of the effect

### Stage 7.2 — Controlled implementation pass

**Goal**
Add polish without destabilizing the approved system.

**Implementation tasks**
- Implement each polish candidate behind a clear toggle
- Keep default strengths extremely low
- Preserve the no-polish baseline for side-by-side review

**Checks**
- Core field behavior and point language remain unchanged
- Performance cost is measurable and acceptable
- Individual polish layers can be disabled cleanly

### Stage 7.3 — Comparative review

**Goal**
Determine whether polish creates real value.

**Implementation tasks**
- Review on/off comparisons under real foreground content
- Re-test repeated input and idle states
- Decide whether each layer stays, gets reduced, or gets removed

**Checks**
- The polished version is genuinely more refined
- The polished version is not more distracting
- Any improvement is durable, not novelty-driven

### Stage 7.4 — Final default selection

**Goal**
Lock final defaults and optional variants.

**Implementation tasks**
- Define default polish settings
- Define a fully minimal mode if needed
- Document when polish should be disabled in product contexts

**Checks**
- Defaults are conservative
- The background remains background-first
- Product teams can understand when to use or skip polish

## Implementation delivery (code)

### Candidates implemented (all gated)

| Layer | Role | Shader hook |
|-------|------|----------------|
| **Tonal lift** | Extra `rgb` gain ∝ `vField²` on strong swells only | Fragment, `uPolishTonalK` |
| **Vignette** | Screen-space corner darkening via `gl_FragCoord` (no extra pass) | Fragment, `uPolishVignetteK` / floor |
| **Edge softening** | Slightly widens point disc outer smoothstep | Fragment, `uPolishEdgeSoft` |
| **Depth cueing** | Mild darkening toward frustum corners in world XY | Vertex `vDepthAtten`, `uPolishDepthK` |

Per-layer enable flags live in `uPolishLayers` (`Vector4`: tonal, vignette, edge, depth). The demo keeps all four at `1` when polish is on; products can zero a component to drop a layer without shader edits.

### Defaults and toggles

- **`POLISH_DEFAULT_ENABLED`**: `false` — baseline remains the unpolished field.
- **Demo**: checkbox **Subtle polish** sets `uPolishMaster`; **`prefers-reduced-motion: reduce`** forces master off regardless of checkbox.
- **Tuning**: strengths in `constants.ts` under Phase 7 (`POLISH_*`).

### Performance

Polish adds only a few branches and one screen-space multiply per visible fragment; no bloom, blur, or extra draw passes.

## Completion note

The project should still be considered complete even if this phase is skipped. The success of the system depends on the field, the grid, and the composition—not on optional finishing treatment.
