# Stage 0: reproducible baseline and layer isolation

Authorized by user's “please proceed to next steps” on 17 October 2026. This supersedes the research-only implementation prohibition for the isolated study below. Homepage and existing engine behavior remain unchanged.

## Question
How much of the current field's appearance comes from ambient contours, spontaneous swells, and the way these combine? Establish a trustworthy comparison before introducing alternative wave models or dither techniques.

## Scope
Build a development study entry under `studies/ripple-baseline/`, using existing Three.js engine exports. No app-route redesign, production engine changes, new dependencies, or source parameter retuning. An isolated seeded geometry generator may copy the existing geometry algorithm with attribution, preserving the current parameter values. Study CSS is functional laboratory UI, not a new portfolio identity.

## Required controls and evidence
- Four conditions: ambient off/auto off, ambient on/auto off, ambient off/auto on, ambient on/auto on. Current polish stays off. Same geometry, seed, clock, event tape and output dimensions in all comparisons.
- Deterministic fixed-time capture/replay: scene state at t must be independent of previous seek order. Hold/replay, restart, time scrub, seed, preset condition and event scenario controls. Export JSON state/event log with exact engine parameters, geometry hash, viewport/DPR, browser/renderer identity and study limitations. No global Math.random patching or changes to existing engine exports.
- Stimuli: ambient only, single center impulse, simultaneous pair, delayed pair, burst crossing the 16-source reuse threshold, edge impulse; a fixed five-per-ten-second automatic event tape follows the current distributions. Manual events must be logged and replayable, and clearly separate from scripted trials.
- Isolated field and an optional unchanged Resume foreground context. Context is a readability check, not pixel-identical production bootstrap or a user study. Document all baseline differences (seeded sources, clock, manual jitter, source ordering and harness integration).
- Reduced-motion mode must pause autonomous playback by default. Fixed-time inspection is allowed on explicit request. Do not silently claim the current production reduced-motion behavior changed.
- Surface at desktop 1440x900 and mobile 390x844; DPR and actual budget recorded. Browser software-renderer results are appearance evidence only, not actual mobile/GPU performance.
- Meaningful no-dependency tests for event boundary selection, out-of-order seek/replay, source capacity/recycling and deterministic seeds. Record failing then passing evidence for the study logic. Do not add a project-wide test framework.

## Ownership
- Engine audit worker: study implementation, study-local tests, and `04-baseline-implementation.md` only. Own `studies/ripple-baseline/` until handoff. Report runnable URL, automation API and changed files to coordinator.
- Rendering worker: `05-stage-0-review-protocol.md` only. Define bounded comparison metrics, candidate-independent controls and report caveats; review implementation after handoff when assigned. Do not touch study source or browser sessions yet.
- Reference worker: `06-reference-traits-review.md` only. Synthesize what the reference does and does not justify, in reviewer-friendly language with frame references and practical observable targets. No further browsing required unless it resolves a specific gap; do not re-capture an unbounded sequence.
- Coordinator: integration, independent checks/captures, synthesis and review delivery. No worker may change another worker's files.

## Completion criteria
Study compiles, deterministic logic checks pass, and real-browser checks demonstrate repeatability and separation of all four conditions without shader/console errors. Independent reviewer inspects controls and inference limits. Capture paired desktop/mobile evidence and report substantive findings with reproducible state, not an aesthetic winner selected by intuition. Stop before new surface algorithms or homepage integration.

## Reporting
Use the coordinator notification protocol in BRIEF.md. Notify immediately when blocked or ready for review. No acknowledgment loops or additional workers.
