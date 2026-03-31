# Ripple Field Background — Implementation Plan

## 1. Project Intent

Build an interaction-driven background system where **analytic soft swells** propagate through a **WebGL point/grid field**. The effect should feel refined, calm, and premium under foreground content, with realism coming primarily from the **field behavior itself** rather than heavy post-processing.

### Agreed design decisions
- Rendering stack: **WebGL / Three.js**
- Primary visual mapping: **dot / grid deformation**
- Ripple model: **analytic sources** rather than simulated height field
- Ripple character: **soft single swell** rather than crisp ring
- Interaction model: swells triggered by **mouse clicks** and **keystrokes**
- Strength mapping: strength affects **thickness / pressure footprint / blending behavior**, **not propagation speed**
- Interference style: **softer pressure-like blending**
- Post-effects: allowed later, but intended to remain **subtle and secondary**

---

## 2. Recommended Tech Stack

### 2.1 Core rendering
- **Three.js** as the rendering layer
- **WebGLRenderer** as the runtime renderer
- **Orthographic camera** for early phases to keep the composition flat, calm, and evaluation-friendly

### 2.2 Geometry and draw model
- **BufferGeometry** for the point grid
- Single batched **point cloud** rather than many separate objects
- Optional custom per-point attributes:
  - normalized position
  - seed / variation value
  - rest-state metadata if needed later

### 2.3 Shader layer
- **ShaderMaterial** for custom GPU logic
- **Vertex shader** for field sampling and point deformation
- **Fragment shader** for point appearance only
- Keep the fragment shader intentionally light until late polish phases

### 2.4 Application shell
Recommended baseline:
- **TypeScript**
- **Vite** or equivalent fast dev server/bundler
- **Plain Three.js module** for the ripple engine
- **React** only if the host product already depends on React for foreground UI

Recommended architecture rule:
- Keep the **ripple engine framework-agnostic**
- Keep the **foreground app shell separable** from the rendering core

### 2.5 Interaction and state
- Central bounded array of active swell sources
- Pointer input manager
- Keyboard event manager
- Minimal app-level parameter store for tuning during development

### 2.6 Optional tooling
- Stats / FPS overlay during tuning
- GUI or control panel for phase-2 tuning only
- Screenshot capture utility for side-by-side visual comparison

### 2.7 Not in the initial stack
Avoid in early phases:
- EffectComposer-based post stack
- heavy post-processing
- worker/offscreen migration
- simulated fluid / height-field pipeline

---

## 3. Final Target Architecture

### 3.1 Runtime model
One scene, one point field, one shader-driven material, one bounded active-source system.

### 3.2 Data flow
1. User input occurs (click or keypress)
2. A new analytic swell source is spawned
3. Active source parameters are updated on the CPU
4. Source uniforms are passed to the shader
5. The vertex shader samples the field at each point
6. Points deform according to the sampled field
7. The fragment shader renders calm, soft points

### 3.3 Source model
Each active source should contain:
- `center`
- `startTime`
- `strength`
- `width`
- `decay`

Global/shared parameters:
- `propagationSpeed`
- field shaping constants
- blending constants
- optional irregularity constants

### 3.4 Rendering responsibilities
**Vertex shader**
- evaluate analytic soft swell contributions per point
- compute primary displacement
- compute secondary size response
- pass minimal varyings to the fragment shader

**Fragment shader**
- render soft circular points
- control point alpha falloff
- keep visual treatment calm and low-contrast

---

## 4. Working Principles

### 4.1 Aesthetic principles
- Background-first, never effect-first
- Calm and spatial rather than flashy
- Overlap should read as **pressure accumulation**, not ring collision
- Resting state should feel intentional even without active interaction
- Foreground readability is a hard constraint

### 4.2 Engineering principles
- Keep the **field model stable** while iterating on visual mapping
- Preserve a **constant propagation speed** across impacts
- Treat ripple strength as **wavefront character**, not velocity
- Prefer **single-batch GPU rendering** and lightweight frame logic
- Defer expensive polish work until the base field behavior is approved

---

## 5. Phase Plan Overview

| Phase | Objective | Main Output |
|---|---|---|
| Phase 1 | Validate field + mapping | Essential working prototype |
| Phase 2 | Tune motion language + blending | Stable pressure-like behavior |
| Phase 3 | Choose point-field visual language | Approved rest-state grid and point mapping |
| Phase 4 | Add controlled irregularity | Organic but still art-directed field |
| Phase 5 | Integrate with foreground content | Production-ready compositional behavior |
| Phase 6 | Harden performance | Stable runtime on target devices |
| Phase 7 | Optional subtle polish | Restrained finishing layer |

---

## 6. Detailed Phases and Stages

## Phase 1 — Essential Prototype Foundation

### Objective
Prove that analytic soft swells can drive a point field in a visually coherent way.

### Scope
- Create a uniform point grid
- Implement analytic source spawning
- Evaluate the field per point
- Map the field primarily to **subtle outward displacement**
- Add small secondary point-size lift
- Support click and keyboard triggering

### Deliverables
- Working browser prototype
- Single-swell behavior
- Multi-swell overlap behavior
- Stable interaction loop

### Exit criteria
- A single swell feels soft and spatially coherent
- Two or more swells blend like pressure, not like thin rings
- The grid remains calm enough to sit behind text and UI

### Stages
#### Stage 1.1 — Scene setup
- Create renderer, scene, camera
- Add responsive resize handling
- Set a neutral dark background
- Keep the layout minimal for clean evaluation

#### Stage 1.2 — Point grid generation
- Generate a uniform lattice in world space
- Store positions in BufferGeometry
- Add optional per-point seed attribute for later controlled variation

#### Stage 1.3 — Shader foundation
- Implement a minimal shader material
- Render clean circular points
- Add soft alpha edge falloff to each point
- Keep colors neutral and low contrast

#### Stage 1.4 — Source array + update loop
- Create a fixed-size active swell array
- Add source recycling when capacity is reached
- Push source data to uniforms each frame

#### Stage 1.5 — Field evaluation
- Compute distance from each point to each source center
- Compute the moving radius from elapsed time and shared speed
- Evaluate a soft bump profile centered on the moving radius
- Apply temporal decay
- Sum contributions from active sources

#### Stage 1.6 — Grid mapping
- Primary mapping: positional displacement
- Secondary mapping: slight point-size lift
- Keep displacement intentionally subtle

#### Stage 1.7 — Input plumbing
- Click / pointerdown spawns a swell at pointer position
- Keydown spawns a swell at a controlled default region or last pointer region
- Add simple strength heuristics for development only

---

## Phase 2 — Motion Language and Pressure Blending

### Objective
Tune the system until it behaves like a coherent medium rather than a visible effect.

### Scope
- Refine swell shape
- Refine decay behavior
- Refine overlap accumulation
- Tune displacement magnitude and timing

### Deliverables
- Approved swell profile
- Approved blending behavior
- Defined parameter ranges for strength, width, and decay

### Exit criteria
- Overlap feels pooled and cushioned
- Stronger impacts feel broader rather than faster
- Decay feels elegant and non-mechanical

### Stages
#### Stage 2.1 — Swell profile tuning
Compare and tune:
- broad Gaussian-like profile
- bell-shaped band profile
- softened-shoulder variants

#### Stage 2.2 — Decay tuning
Test and compare:
- exponential-style decay
- eased decay envelopes
- strength-linked persistence

#### Stage 2.3 — Strength mapping
Define how strength influences:
- width
- displacement footprint
- point-size lift
- lifespan / decay softness

#### Stage 2.4 — Blending tuning
Tune accumulation so overlap reads as:
- pooled pressure buildup
- not bright additive hotspots
- not hard interference lines

#### Stage 2.5 — Motion restraint pass
Reduce any movement that makes the background feel noisy or effect-forward

---

## Phase 3 — Point Field Visual Language

### Objective
Choose how the point field looks at rest and how it reacts under the already-approved field model.

### Scope
- Evaluate point appearance and grid character
- Choose the rest-state language
- Decide whether points remain perfect circles or evolve slightly

### Deliverables
- Approved point style
- Approved grid density and spacing model
- Approved primary / secondary mapping mix

### Exit criteria
- Background feels intentional at rest
- Ripple response remains visible but non-dominant
- Point treatment feels premium rather than gimmicky

### Stages
#### Stage 3.1 — Rest-state grid exploration
Compare:
- strict Cartesian grid
- softened regular grid
- slightly staggered grid

#### Stage 3.2 — Mapping exploration
Compare:
- displacement only
- displacement + size
- displacement + size + restrained brightness

#### Stage 3.3 — Point appearance exploration
Compare:
- perfect circular points
- softened-edge circles
- very slight point deformation (only if visually justified)

#### Stage 3.4 — Density and spacing tuning
- Find the calmest density that still reads as a field
- Avoid moire-like visual noise under motion
- Validate behavior on large and small viewports

---

## Phase 4 — Controlled Irregularity

### Objective
Break excessive perfection without losing art direction.

### Scope
- Add subtle irregularity to the field itself
- Keep it integrated into the swell behavior rather than as a decorative overlay

### Deliverables
- Controlled irregularity layer
- Approved noise / warp parameter ranges

### Exit criteria
- Ripples feel less mechanically perfect
- Shapes remain coherent and calm
- Irregularity is visible only in aggregate, not as obvious wobble

### Stages
#### Stage 4.1 — Spatial warp tests
- slight coordinate warp
- restrained contour drift
- very small directional bias variation

#### Stage 4.2 — Thickness variation tests
- local width modulation
- per-source asymmetry controls
- strength-linked breadth changes

#### Stage 4.3 — Variation strategy
- define per-source randomization rules
- define per-grid subtle variation rules
- keep all variation bounded and art-directable

#### Stage 4.4 — Overlap validation
- confirm irregularity does not produce dirty intersections
- confirm repeated typing remains calm

---

## Phase 5 — Foreground Integration and Composition

### Objective
Make the system work as a real background behind actual content.

### Scope
- Test with real foreground blocks
- Tune readability and contrast
- Establish safe intensity ranges

### Deliverables
- Background integration guidelines
- approved foreground-safe defaults
- example foreground layouts over the field

### Exit criteria
- Text and UI remain clearly legible
- Ripple presence is felt before it is consciously noticed
- The background feels compositional rather than distracting

### Stages
#### Stage 5.1 — Foreground testing
Test under:
- headings
- paragraph text
- cards / panels
- buttons and other controls

#### Stage 5.2 — Contrast tuning
- base point brightness
- alpha ranges
- overlay strength if any
- safe tonal range behind content

#### Stage 5.3 — Safe-zone tuning
- reduce activity beneath high-priority content if needed
- define global intensity scalars
- define quiet mode if the product needs one

#### Stage 5.4 — Interaction rhythm tuning
- adjust keyboard-trigger cadence
- prevent repeated typing from overwhelming the composition
- align interaction response with product tone

---

## Phase 6 — Performance Hardening

### Objective
Ensure stable runtime behavior across devices and under repeated interaction.

### Scope
- optimize GPU workload
- cap active source counts
- tune density and device pixel ratio
- validate frame stability

### Deliverables
- performance budget
- optimized parameter presets
- degradation strategy if needed

### Exit criteria
- Smooth interaction under repeated clicks and typing
- No visible frame instability on target devices
- Acceptable rendering cost at intended viewport sizes

### Stages
#### Stage 6.1 — Geometry and draw-call review
- maintain single-batch point rendering
- verify there is no accidental scene growth
- avoid unnecessary object churn

#### Stage 6.2 — Shader cost review
- keep core logic in the vertex shader where practical
- bound the source loop size
- keep the fragment shader simple

#### Stage 6.3 — Density and DPR tuning
- identify acceptable point counts
- set responsive density rules
- constrain device pixel ratio where needed

#### Stage 6.4 — Runtime guards
- cap active swells
- recycle oldest sources
- optionally throttle keyboard-driven spawn cadence

#### Stage 6.5 — Device validation
- desktop baseline
- integrated-GPU laptop baseline
- tablet/mobile pass if relevant to the product

---

## Phase 7 — Optional Subtle Polish Layer

### Objective
Add minimal finishing treatment only if the field and grid already work without it.

### Scope
- restrained, secondary enhancements only
- no effect should compensate for weak field behavior

### Deliverables
- optional polish layer spec
- on/off comparison demonstrating real value

### Exit criteria
- polish increases refinement without changing the core identity
- disabling polish still leaves a strong background system

### Candidate additions
- extremely subtle tonal lift near stronger swells
- faint compositional vignette
- restrained edge softening
- minimal depth cueing if it helps composition

### Explicit non-goals
- dramatic bloom
- cinematic blur
- chromatic tricks
- post-processing that becomes the main attraction

---

## 7. Cross-Phase Review Checklist

Use the same review criteria in every phase.

### 7.1 Background quality
- Does it stay compatible with foreground content?
- Does it remain restrained under repeated input?

### 7.2 Field credibility
- Does it feel like one coherent medium?
- Do overlaps feel pooled and pressure-like?

### 7.3 Motion quality
- Is propagation smooth?
- Is fading elegant?
- Is there visible jitter or mechanical timing?

### 7.4 Visual refinement
- Does it feel premium rather than demonstrative?
- Is the resting state intentional?

### 7.5 Implementation sustainability
- Is the system still understandable and tunable?
- Are parameters stable rather than fragile?

---

## 8. Risks and Mitigations

### Risk 1 — Ripple reads as a ring effect rather than a pressure field
**Mitigation**
- keep the swell broad
- soften shoulders
- avoid high-contrast band edges

### Risk 2 — Overlap becomes noisy or hotspot-like
**Mitigation**
- cap secondary brightness response
- tune accumulation carefully
- prefer pooled deformation over dramatic amplification

### Risk 3 — Background competes with content
**Mitigation**
- keep displacement small
- reduce base contrast
- test continuously with real foreground layouts

### Risk 4 — Excessive perfection makes the field feel synthetic
**Mitigation**
- add controlled irregularity only after the core behavior is approved

### Risk 5 — Visual polish hides weak field behavior
**Mitigation**
- do not start polish work before Phase 7
- keep field-only comparisons available throughout development

---

## 9. Recommended Working Order

1. Lock core prototype behavior
2. Tune pressure-like blending
3. Choose final point/grid language
4. Add controlled irregularity
5. Test under real content
6. Harden performance
7. Add only minimal polish if still needed

---

## 10. Definition of Done

The implementation is complete when:
- the point field has a convincing and calm resting state
- user-triggered swells feel soft, spatial, and pressure-like
- stronger impacts feel broader rather than faster
- overlap remains smooth and premium-looking
- the system sits behind foreground content without distraction
- runtime performance is stable on target devices
- optional polish remains subtle and non-essential

---

## 11. Immediate Next Step

Move from the essential prototype into **Phase 2: Motion Language and Pressure Blending**, using the current prototype as the baseline while keeping the field model fixed and tuning only:
- swell width
- decay
- displacement amount
- accumulation softness
- strength-to-width mapping
