# Phase 5 — Foreground Integration and Composition

## Purpose

Make the system work as a real background behind actual content. This phase is where the effect stops being a graphics prototype and becomes a product-level background system.

## Dependencies

- Core field behavior is approved
- Point-field language is approved
- Controlled irregularity is already bounded and stable

## Objective

Establish a background system that:
- supports headings, text, cards, and controls
- remains felt before it is consciously noticed
- can be configured with safe defaults for real layouts

## Scope

- Test with real foreground blocks
- Tune readability and contrast
- Establish safe intensity ranges

## Phase deliverables

- Background integration guidelines
- Approved foreground-safe defaults
- Example foreground layouts over the field

## Exit criteria

- Text and UI remain clearly legible
- Ripple presence is felt before it is consciously noticed
- The background feels compositional rather than distracting

## Stage breakdown

### Stage 5.1 — Foreground testing

**Goal**
Evaluate the background under realistic product layouts.

**Implementation tasks**
- Test the field under headings, paragraph text, cards or panels, and buttons or controls
- Review the background at both idle and active interaction states
- Capture side-by-side comparisons for multiple layout types

**Checks**
- No major readability loss under active swells
- The grid remains a background layer, not a competing surface
- The composition still feels premium in both sparse and dense layouts

### Stage 5.2 — Contrast tuning

**Goal**
Lock a foreground-safe tonal envelope.

**Implementation tasks**
- Tune base point brightness
- Tune alpha ranges
- Tune any overlay strength if present
- Define a safe tonal range behind content

**Checks**
- Contrast is high enough for readability and low enough for subtlety
- Ripple motion is perceivable without drawing focus away from text
- The system remains visually quiet in the center of attention areas

### Stage 5.3 — Safe-zone tuning

**Goal**
Prevent the background from competing in critical UI regions.

**Implementation tasks**
- Reduce activity beneath high-priority content if needed
- Define global intensity scalars
- Define a quiet mode if the product needs one
- Decide whether content-aware masks or layout-aware damping are necessary

**Checks**
- High-priority content remains protected
- Safe zones do not feel like abrupt holes in the field
- Intensity controls are understandable and easy to tune

### Stage 5.4 — Interaction rhythm tuning

**Goal**
Align the background response with the tone of actual product usage.

**Implementation tasks**
- Adjust keyboard-trigger cadence
- Prevent repeated typing from overwhelming the composition
- Align click response and typing response with product tone
- Define conservative defaults for everyday usage

**Checks**
- Interaction feels responsive but not chatty
- Repeated bursts remain controlled
- The effect still feels ambient rather than performative

## Hand-off to next phase

At the end of Phase 5, the background should be compositionally safe. Phase 6 can then optimize the approved experience without re-opening the core design language.
