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

## Implementation delivery (code)

This section records what the reference build does so Phase 6 exit criteria stay traceable.

### Performance budget

| Tier | When | Grid columns (before point-budget clamp) | DPR cap | Approx. point budget |
|------|------|----------------------------------------|---------|----------------------|
| **full** | Default desktop / large memory | `GRID_COLS` (244) | 2.0 | ≤ ~62k vertices |
| **balanced** | `deviceMemory ≤ 4`, or viewport ≥ ~2.52M CSS pixels | ~88% of `GRID_COLS` | 1.5 | ≤ ~48k |
| **efficient** | `prefers-reduced-motion: reduce`, or CSS width under 640px | ~72% of `GRID_COLS` | 1.25 | ≤ ~36k |

Columns are further clamped so `cols × rows(aspect)` stays under the tier budget (`resolvePerformanceBudget` in `src/engine/resolvePerformanceBudget.ts`). Geometry rebuilds only when aspect or resolved column count changes.

### Runtime guards

- **Swell cap**: `MAX_SWELL_SOURCES` (16) matches the vertex shader loop; oldest source is recycled when full (`SwellSourceBuffer`).
- **Uniform uploads**: CPU copies into swell uniforms only after a spawn or `clear()` (`uniformsDirty`), not every frame.
- **Pointer cadence**: `PERF_POINTER_SWELL_MIN_INTERVAL` limits pathological click spam; keyboard remains throttled by `FOREGROUND_KEY_SWELL_MIN_INTERVAL`.
- **Safe zone**: DOM → world bounds for `[data-ripple-safe]` are pushed to uniforms only when the normalized bounds string changes (resize / layout shift).

### Device validation matrix (manual)

| Configuration | Expectation |
|-----------------|-------------|
| Desktop discrete GPU, 1080p–1440p, tier **full** | Baseline smooth interaction; use as golden reference. |
| Integrated laptop GPU, 1440p, tier **balanced** | Coherent look; verify no sustained frame drops during rapid clicks + typing. |
| Mobile / narrow (under 640 CSS px) or reduced motion, tier **efficient** | Lower density + DPR; field should remain readable, quieter motion. |

Unacceptable: sustained jank on **balanced** tier at 1080p on a recent integrated GPU — treat as a regression and lower default caps or shader cost.

## Hand-off to next phase

At the end of Phase 6, the system should be production-safe without any reliance on a polish layer. Phase 7 may add refinement, but only if it clearly improves the approved background behavior.
