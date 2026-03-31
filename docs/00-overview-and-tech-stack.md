# Ripple Field Background — Overview and Tech Stack

## Project intent

Build an interaction-driven background system where **analytic soft swells** propagate through a **WebGL point/grid field**. The result should feel refined, calm, and premium behind foreground content, with realism coming primarily from the **field behavior itself** rather than from heavy post-processing.

## Agreed design decisions

- Rendering stack: **WebGL / Three.js**
- Primary visual mapping: **dot / grid deformation**
- Ripple model: **analytic sources** rather than simulated height field
- Ripple character: **soft single swell** rather than crisp ring
- Interaction model: swells triggered by **mouse clicks** and **keystrokes**
- Strength mapping: strength affects **thickness / pressure footprint / blending behavior**, **not propagation speed**
- Interference style: **softer pressure-like blending**
- Post-effects: allowed later, but intended to remain **subtle and secondary**

## Recommended tech stack

### Core rendering
- **Three.js** as the rendering layer
- **WebGLRenderer** as the runtime renderer
- **Orthographic camera** in early phases to keep the composition flat, calm, and evaluation-friendly

### Geometry and draw model
- **BufferGeometry** for the point grid
- Single batched **point cloud** rather than many separate objects
- Optional custom per-point attributes:
  - normalized position
  - seed / variation value
  - rest-state metadata if needed later

### Shader layer
- **ShaderMaterial** for custom GPU logic
- **Vertex shader** for field sampling and point deformation
- **Fragment shader** for point appearance only
- Keep the fragment shader intentionally light until late polish phases

### Application shell
- **TypeScript**
- **Vite** or equivalent fast dev server / bundler
- **Plain Three.js module** for the ripple engine
- **React** only if the host product already depends on React for foreground UI

### Interaction and state
- Central bounded array of active swell sources
- Pointer input manager
- Keyboard event manager
- Minimal app-level parameter store for tuning during development

### Optional tooling
- Stats / FPS overlay during tuning
- GUI or control panel for phase-2 tuning only
- Screenshot capture utility for side-by-side visual comparison

### Explicitly out of the initial stack
Avoid in early phases:
- EffectComposer-based post stack
- heavy post-processing
- worker / offscreen migration
- simulated fluid / height-field pipeline

## Final target architecture

### Runtime model
One scene, one point field, one shader-driven material, one bounded active-source system.

### Data flow
1. User input occurs through a click or keypress.
2. A new analytic swell source is spawned.
3. Active source parameters are updated on the CPU.
4. Source uniforms are passed to the shader.
5. The vertex shader samples the field at each point.
6. Points deform according to the sampled field.
7. The fragment shader renders calm, soft points.

### Source model
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

### Rendering responsibilities
**Vertex shader**
- evaluate analytic soft swell contributions per point
- compute primary displacement
- compute secondary size response
- pass minimal varyings to the fragment shader

**Fragment shader**
- render soft circular points
- control point alpha falloff
- keep visual treatment calm and low-contrast

## Working principles

### Aesthetic principles
- Background-first, never effect-first
- Calm and spatial rather than flashy
- Overlap should read as **pressure accumulation**, not ring collision
- Resting state should feel intentional even without active interaction
- Foreground readability is a hard constraint

### Engineering principles
- Keep the **field model stable** while iterating on visual mapping
- Preserve a **constant propagation speed** across impacts
- Treat ripple strength as **wavefront character**, not velocity
- Prefer **single-batch GPU rendering** and lightweight frame logic
- Defer expensive polish work until the base field behavior is approved

## Phase sequence

1. Phase 1 — Essential Prototype Foundation
2. Phase 2 — Motion Language and Pressure Blending
3. Phase 3 — Point Field Visual Language
4. Phase 4 — Controlled Irregularity
5. Phase 5 — Foreground Integration and Composition
6. Phase 6 — Performance Hardening
7. Phase 7 — Optional Subtle Polish Layer

## Cross-phase review checklist

### Background quality
- Does it stay compatible with foreground content?
- Does it remain restrained under repeated input?

### Field credibility
- Does it feel like one coherent medium?
- Do overlaps feel pooled and pressure-like?

### Motion quality
- Is propagation smooth?
- Is fading elegant?
- Is there visible jitter or mechanical timing?

### Visual refinement
- Does it feel premium rather than demonstrative?
- Is the resting state intentional?

### Implementation sustainability
- Is the system still understandable and tunable?
- Are parameters stable rather than fragile?

## Global risks and mitigations

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

## Definition of done

The implementation is complete when:
- the point field has a convincing and calm resting state
- user-triggered swells feel soft, spatial, and pressure-like
- stronger impacts feel broader rather than faster
- overlap remains smooth and premium-looking
- the system sits behind foreground content without distraction
- runtime performance is stable on target devices
- optional polish remains subtle and non-essential
