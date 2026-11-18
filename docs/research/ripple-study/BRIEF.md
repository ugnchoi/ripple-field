# Ripple experience research

Status: research only. Coordinator: main chat. User requested independent agents in visible separate chats, systematic study, and no rushed implementation.

## Objective
Understand the visual and temporal mechanisms of https://www.instagram.com/ya_demidov/reel/Ddorv2xq9b4/ before choosing how to enhance the personal portfolio opening and ripple field. Preserve existing resume facts and functions. No application edits during this phase.

## Evidence already available
- Reference title from public page: Sinking into dither 02, by ya_demidov.
- `output/playwright/playing-0.png`, `playing-1.png`, `playing-2.png`: browser captures during verified playback around 1.54, 3.27, 5.01 seconds. Playback frame counters advanced (532, 585, 637). Inspect these files yourself.
- `output/playwright/reference-*.png`: earlier seek captures appeared nearly identical; do not rely on these for temporal inference.
- `/tmp/ripple-inspo.html`: fetched public page, if still available.
- `/tmp/ripple-playwright.json`: Chromium configuration. Existing Playwright CLI default browser is at Instagram. Reference-forensics worker exclusively owns this session. Other workers must not navigate or close it.
- Three.js shader and buffer implementation under `src/engine/`; integration in `src/bootstrapRippleField.ts`.

## Research discipline
Clearly separate observed facts, measured facts, hypotheses, unknowns, and proposed experiments. The previous chat's claims about implementation are hypotheses. Do not equate visible rings with physically simulated water or apparent dithering with a specific algorithm. No bypassing authentication. Use primary sources for technical attribution. Cite exact source URLs and local code lines.

Each worker writes one report in its assigned file. Include strongest alternative explanation, evidence against your preferred explanation, confidence, and the next discriminating experiment. A technically plausible reconstruction is not verified provenance. No application changes, dependencies, new agent delegation, final design selection, or production promises.

## Ownership
- Reference forensics: `docs/research/ripple-study/01-reference-forensics.md`, artifacts under `output/playwright/reference-study/` only; exclusive browser CLI default session.
- Rendering research: `docs/research/ripple-study/02-rendering-research.md` only; browser-free public source research.
- Engine audit: `docs/research/ripple-study/03-engine-audit.md` only; read-only application inspection.
- Coordinator: this brief, synthesis, evidence review and communications.

## Decision gates
1. Establish trustworthy reference observations.
2. Compare competing mechanism hypotheses and current-engine constraints.
3. Define a small controlled experiment matrix and measurable acceptance criteria.
4. Only then select studies to build; homepage redesign remains a later step.

## Worker reporting protocol (17 October update)

Coordinator thread: `01a1447f-db0d-7521-b6da-919d1a4f2fc8` (Revamp site).

For every future assigned work unit, send a concise notification directly to the coordinator using `mcp__codex_tui__send_message_to_thread` when complete or blocked. Include status (DONE/BLOCKED), assignment name, report/artifact paths, key findings, uncertainties and any decision needed. Send a progress message for a material finding or changed ETA; do not send routine heartbeat messages. The coordinator may additionally check status with wait_threads/read_thread. Do not rely solely on the worker's final response appearing in its own chat. If the messaging tool fails, record the failure and report through the available channel. Notification receipts do not request new research; avoid acknowledgment loops. The coordinator assigns follow-up work explicitly.

## Confirmed surface-first intent (17 October)

The user's immediate aim is the best implementation of a ripple surface that feels like water. Boat and bird imagery are not implementation targets. Study the reference's surface behavior independently from its subjects. Additional objects, possibly a rock, may be considered only after the surface itself is convincing. Keep object rendering and object/field coupling out of the current implementation scope. Evaluate the surface on coherent traveling fronts, disturbance overlap, depth/tonal cues, fine-texture stability and interaction response; do not treat any unmeasured quality as achieved.

## Active delivery goal (17 October, continued)

Achieve a realistic water-surface experience with an intro animation at the opening of the portfolio. Add a separate page without foreground resume content where users can freely experience and experiment with the surface. Research gates guide delivery; research artifacts alone do not complete this goal. Keep objects deferred. Stage 1 diagnostic remains isolated until its evidence is reviewed; then implement the strongest justified surface direction, intro and playground with bounded browser verification.
