# Phase 6 — Performance Hardening

## Purpose

Ensure stable runtime behavior across devices and under repeated interaction. This phase protects the approved visual system without changing its core identity.

## Dependencies

- The intended composition and interaction behavior are already approved
- The system is still built around a single batched point field
- Performance work should preserve established visual priorities

## Objective

Achieve a production-safe runtime profile that:
- remains smooth under repeated clicks and typing
- stays within an acceptable GPU and CPU budget
- degrades gracefully where needed

## Scope

- Optimize GPU workload
- Cap active source counts
- Tune density and device pixel ratio
- Validate frame stability

## Phase deliverables

- Performance budget
- Optimized parameter presets
- Degradation strategy if needed

## Exit criteria

- Smooth interaction under repeated clicks and typing
- No visible frame instability on target devices
- Acceptable rendering cost at intended viewport sizes

## Stage breakdown

### Stage 6.1 — Geometry and draw-call review

**Goal**
Confirm the scene remains structurally efficient.

**Implementation tasks**
- Maintain single-batch point rendering
- Verify there is no accidental scene growth
- Avoid unnecessary object churn in update loops
- Check that geometry creation remains one-time or infrequent

**Checks**
- Draw-call count stays minimal
- Object allocation patterns do not create frame spikes
- Scene complexity matches the intended architecture

### Stage 6.2 — Shader cost review

**Goal**
Bound the GPU work and simplify where practical.

**Implementation tasks**
- Keep core logic in the vertex shader where practical
- Bound the source loop size
- Keep the fragment shader simple
- Identify any calculations that can be precomputed or reduced

**Checks**
- Shader complexity remains proportional to the approved feature set
- No late-added polish has become expensive by accident
- The approved point density still fits the cost budget

### Stage 6.3 — Density and DPR tuning

**Goal**
Control cost at the screen and device level.

**Implementation tasks**
- Identify acceptable point counts
- Set responsive density rules
- Constrain device pixel ratio where needed
- Define fallback presets for lower-power devices

**Checks**
- Large screens do not become disproportionately expensive
- Lower-power devices still present a coherent experience
- Density changes do not visibly damage the composition

### Stage 6.4 — Runtime guards

**Goal**
Protect the system from pathological interaction patterns.

**Implementation tasks**
- Cap active swells
- Recycle oldest sources cleanly
- Optionally throttle keyboard-driven spawn cadence
- Add simple guardrails for debug controls and tuning panels

**Checks**
- Bursty input remains stable
- Guardrails do not visibly degrade normal interaction
- Source recycling still feels natural

### Stage 6.5 — Device validation

**Goal**
Confirm the production experience on target hardware.

**Implementation tasks**
- Validate on desktop baseline
- Validate on integrated-GPU laptop baseline
- Run a tablet or mobile pass if relevant to the product
- Record acceptable and unacceptable configurations

**Checks**
- The target device matrix is explicitly documented
- The visual experience survives expected hardware variation
- Performance exceptions are understood and bounded

## Hand-off to next phase

At the end of Phase 6, the system should be production-safe without any reliance on a polish layer. Phase 7 may add refinement, but only if it clearly improves the approved background behavior.
