# Phase 1 — Essential Prototype Foundation

## Purpose

Prove that **analytic soft swells** can drive a **point field** in a visually coherent way. This phase establishes the baseline engine and validates the central interaction model before any stylistic complexity is introduced.

## Dependencies

- Shared architecture and tech stack from `00-overview-and-tech-stack.md`
- Agreement to keep the field model fixed while testing mapping behavior

## Objective

Build a working browser prototype that demonstrates:
- a calm point grid at rest
- a single soft swell triggered by interaction
- multiple swells overlapping with pressure-like behavior
- subtle deformation suitable for background use

## Scope

- Create a uniform point grid
- Implement analytic source spawning
- Evaluate the field per point
- Map the field primarily to **subtle outward displacement**
- Add a small secondary point-size lift
- Support click and keyboard triggering

## Phase deliverables

- Working browser prototype
- Single-swell behavior
- Multi-swell overlap behavior
- Stable interaction loop

## Exit criteria

- A single swell feels soft and spatially coherent
- Two or more swells blend like pressure, not like thin rings
- The grid remains calm enough to sit behind text and UI

## Stage breakdown

### Stage 1.1 — Scene setup

**Goal**
Create the minimal rendering shell for clean visual evaluation.

**Implementation tasks**
- Create the renderer, scene, and orthographic camera
- Add responsive resize handling
- Set a neutral dark background
- Keep layout and UI minimal so the field can be judged clearly

**Checks**
- Scene fills the viewport cleanly
- No camera perspective distortion
- Resize behavior is stable

### Stage 1.2 — Point grid generation

**Goal**
Establish the static point lattice that the field will drive.

**Implementation tasks**
- Generate a uniform lattice in world space
- Store positions in `BufferGeometry`
- Add optional per-point seed attribute for later controlled variation
- Keep density moderate enough for visual clarity and tuning

**Checks**
- Grid feels intentional at rest
- Density is calm, not noisy
- Geometry is generated once and reused

### Stage 1.3 — Shader foundation

**Goal**
Get clean point rendering in place before adding any field logic.

**Implementation tasks**
- Implement a minimal `ShaderMaterial`
- Render clean circular points
- Add soft alpha edge falloff to each point
- Keep colors neutral and low contrast

**Checks**
- Points read as calm and consistent
- Point edges are soft enough to avoid aliasing
- Fragment shader stays intentionally simple

### Stage 1.4 — Source array and update loop

**Goal**
Create the bounded source system that will feed the field.

**Implementation tasks**
- Create a fixed-size active swell array
- Define source data: `center`, `startTime`, `strength`, `width`, `decay`
- Add source recycling when capacity is reached
- Push source data to uniforms each frame

**Checks**
- Source creation is deterministic and bounded
- Recycled sources do not cause visible glitches
- Uniform updates remain lightweight

### Stage 1.5 — Field evaluation

**Goal**
Compute the analytic soft swell field per point.

**Implementation tasks**
- Compute distance from each point to each source center
- Compute the moving radius from elapsed time and shared speed
- Evaluate a soft bump profile centered on the moving radius
- Apply temporal decay
- Sum contributions from active sources

**Checks**
- A single swell reads as a broad, soft moving band
- The field does not collapse into crisp ring graphics
- Multi-source overlap remains smooth

### Stage 1.6 — Grid mapping

**Goal**
Translate field values into visible point behavior.

**Implementation tasks**
- Primary mapping: positional displacement
- Secondary mapping: slight point-size lift
- Keep displacement intentionally subtle
- Avoid brightness theatrics or decorative effects in this phase

**Checks**
- Position-first response feels spatial, not jittery
- Size lift supports presence without becoming dominant
- Background remains compatible with foreground content

### Stage 1.7 — Input plumbing

**Goal**
Validate the interaction model using direct user input.

**Implementation tasks**
- Click or pointerdown spawns a swell at pointer position
- Keydown spawns a swell at a controlled default region or last pointer region
- Add simple strength heuristics for development only
- Ensure rapid repeated input remains visually stable

**Checks**
- Click placement feels direct and predictable
- Typing cadence does not overwhelm the field
- Interaction loop is robust enough to support phase-2 tuning

## Hand-off to next phase

At the end of Phase 1, the team should have a stable baseline that is good enough for field tuning, but intentionally under-styled. The next phase should tune only:
- swell width
- decay
- displacement amount
- accumulation softness
- strength-to-width mapping
