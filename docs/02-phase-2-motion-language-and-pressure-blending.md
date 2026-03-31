# Phase 2 — Motion Language and Pressure Blending

## Purpose

Tune the prototype until it behaves like a **coherent medium** rather than a visible effect. This phase defines the motion language of the system and locks the core feel of ripple overlap.

## Dependencies

- Phase 1 baseline prototype is working and stable
- The field model stays fixed during this phase
- No new stylistic layers are added until behavior is approved

## Objective

Approve a motion profile where:
- overlap feels pooled and cushioned
- stronger impacts feel broader rather than faster
- decay feels elegant and non-mechanical

## Scope

- Refine swell shape
- Refine decay behavior
- Refine overlap accumulation
- Tune displacement magnitude and timing

## Phase deliverables

- Approved swell profile
- Approved blending behavior
- Defined parameter ranges for strength, width, and decay

## Exit criteria

- Overlap feels pooled and cushioned
- Stronger impacts feel broader rather than faster
- Decay feels elegant and non-mechanical

## Stage breakdown

### Stage 2.1 — Swell profile tuning

**Goal**
Find the broad soft-swell profile that best matches the desired pressure field.

**Implementation tasks**
- Compare a broad Gaussian-like profile, a bell-shaped band profile, and softened-shoulder variants
- Keep propagation speed constant across all variants
- Focus on the field shape itself, not point styling

**Checks**
- A single swell reads as a soft single swell, not a crisp ring
- The wavefront has enough body to feel substantial without becoming muddy

### Stage 2.2 — Decay tuning

**Goal**
Make fade-out feel elegant and calm.

**Implementation tasks**
- Test exponential-style decay
- Test eased decay envelopes
- Explore strength-linked persistence without changing speed
- Define the baseline decay curve and safe range

**Checks**
- Swells do not disappear abruptly
- Stronger impacts feel longer-lived but still restrained
- No visible mechanical stepping in the fade-out

### Stage 2.3 — Strength mapping

**Goal**
Finalize how impact strength affects presence.

**Implementation tasks**
- Define how strength influences width
- Define how strength affects displacement footprint
- Define how strength affects point-size lift
- Define whether strength affects lifespan or decay softness

**Checks**
- Stronger impacts feel broader and more spatially consequential
- Strength never reads as velocity
- Weak and strong inputs still belong to the same visual world

### Stage 2.4 — Blending tuning

**Goal**
Shape the overlap behavior so it feels like pressure buildup.

**Implementation tasks**
- Tune accumulation so overlap reads as pooled pressure buildup
- Avoid bright additive hotspots
- Avoid hard interference lines
- Tune any upper bounds or normalization needed to preserve softness

**Checks**
- Two swells merge naturally
- Rapid repeated input does not create glare or clutter
- Overlap remains the most premium part of the effect

### Stage 2.5 — Motion restraint pass

**Goal**
Pull the system back to a background-safe level after tuning.

**Implementation tasks**
- Reduce movement that feels noisy or effect-forward
- Re-check the field under repeated clicks and typing
- Narrow the approved parameter range to the calmest successful subset

**Checks**
- Motion remains legible but understated
- The background still supports foreground content
- The approved motion profile is stable enough for point-style exploration

## Hand-off to next phase

At the end of Phase 2, the field behavior should be considered stable. Phase 3 should explore visual language without changing:
- propagation speed
- approved width behavior
- approved decay behavior
- approved blending behavior
