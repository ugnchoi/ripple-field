# 24 — Fixed-grid reflection direction

2026-10-18. Read-only reference review following the user's rejection of the continuous surface. Scope: fixed 2D grid, mostly unchanged point positions, size and brightness as dominant channels, with restrained color variation. Only this report is authored by this reviewer; no renderer/UI changes.

## Evidence revisited

Viewed original 720x1280 reference frames `output/playwright/reference-study/native-00.png`, `native-20.png` and `native-39.png` at native resolution. Their callback-associated times are 0.1, 5.1 and 9.866666 seconds, as recorded in report 01. Also viewed original-grid captures `output/playwright/stage-0/desktop-early-C00.png` and `desktop-burst-C11.png`, and checked the existing point material source. These historical captures describe the original grid treatment, not the newer proposed A/B/C study.

No reel download or new external research. The reference is compressed decoded video; its exact palette, geometry, dithering algorithm and authoring pipeline are unknown. Previously rising dropped-frame counters prohibit smoothness claims from this sample set.

## Observed traits, separated from interpretation

| Native reference observation | Confidence | Restrained fixed-grid interpretation, proposed rather than recovered |
| --- | --- | --- |
| Dark green/teal field, warmer yellow/olive illumination toward the upper-left, pale cream/mint bright bands. Broad color placement is coherent, not a field of independent rainbow dots. | High for visible appearance; no calibrated palette extraction. | Keep palette narrow. Let a spatially coherent cool/warm tint follow the same reflection signal as brightness. Do not randomize hue at every dot or animate the entire background color. |
| Several broad nested curved bands cross the frame boundaries. Bright and dark regions have unequal widths, and illumination varies around an arc. | High spatially. | Evaluate directional light/dark shoulders and quiet intervals between fronts; avoid equally bright complete circles as the only cue. Positions can remain fixed while the sampled brightness field advances. |
| Fine stipple/microstructure stays apparent inside bright and dark regions. Strong bright arcs do not turn the entire image into a continuous smooth material. | High at native size; exact microstructure origin unknown. | Keep dots individually separable, including under overlapping inputs. A changing aggregate dot coverage can describe the broad field without drawing a continuous filled sheet. |
| Inner bands bend and differ from the outer bands; the boat/interior contributes additional dark masses. | High spatially; causes unknown. | Seek modest asymmetry and variation in band breadth. Do not import the boat's shadow or occlusion into a surface-only field, and do not infer a physical fluid solver. |
| Across frames 00/20/39, macro arcs change while composition remains stable. | High for sampled change, not continuous playback quality. | Move the tone/size pattern across stable sample centers. The new user requirement supplies the fixed lattice; these frames do not prove that the reference itself uses fixed points. |

## Original grid observations

The early capture has a legible fine lattice on pale paper with restrained grey-violet dot coverage. The burst capture increases dot size/darkness over broad areas; points become densely packed and individual fronts are harder to distinguish. These views support retaining the grid identity while limiting peak coverage. They do not establish that a particular size cap will be optimal on mobile.

The historical material supports point-size and opacity/tone modulation and also includes positional displacement. Therefore “return to the original grid” should preserve its discrete appearance, not automatically retain every old deformation term. Fixed centers are the newly specified design constraint.

## Bounded proposals for A/B/C

A is brightness only; B adds size; C adds restrained color to B. Keep input events, times, camera, grid pitch, center positions, background and transfer curves identical wherever a variant does not explicitly change them.

- **Size proposal:** start with visible diameters around 0.22–0.72 of local pitch, maintaining open gaps at the maximum. These are suggested study bounds, not reference measurements; review antialiased native output before accepting them. Size is area-sensitive: doubling diameter roughly quadruples covered area, so B can become denser without improving reflection legibility.
- **Tonal proposal:** establish clear light/dark shoulders, a quiet baseline and readable separated fronts first. On pale paper, smaller/lighter dots can represent light regions and larger/darker dots dark regions. This polarity is a design translation, not a literal reproduction of the reference's bright-on-dark field. Do not label larger dots “highlights” merely because size increased.
- **Color proposal:** preserve the paper and use low-chroma teal/green plus a restrained olive/warm direction in dot ink. An exploratory OKLCH chroma ceiling around 0.035 is a starting bound, not a selected palette. Match B's lightness/alpha/size, and verify final composited luminance because color conversion and alpha can shift it. C should preserve B's structure when desaturated. No exact hex values are claimed as sampled from the reference.
- **Spatial proposal:** hold centers exactly fixed for this comparison, with no perspective or height displacement. Prefer coherent variation over independent per-dot flicker. Existing randomization should be held identical across variants if retained at all.

These suggestions were sent to the engine worker before capture. They are optional starting points for a controlled comparison, not an instruction to expand the experiment.

## Review gate for matching captures

Judge four outcomes separately: (1) lattice remains recognizable at native desktop/mobile size; (2) moving fronts and their intervening gaps remain distinguishable, including overlap; (3) B improves spatial reading beyond merely darkening the image; (4) C adds restrained tonal variety without becoming the primary visual signal. The strongest acceptable result must satisfy the user's fixed-grid requirement even if a continuous shading treatment looks more conventionally watery.

Do not assign a winner before viewing matched native A/B/C captures. Initial observations above are complete; comparative review remains pending the coordinator's capture handoff.

## First matched A/B/C review

Viewed all 18 native PNGs in `output/playwright/grid-reflections/`: desktop/mobile × quiet/single/overlap × A/B/C. The coordinator's manifest supplies matching times 0/1.1/2.3 seconds and the shared three-source overlap. Also inspected a 4x nearest-neighbor enlargement of the identical mobile overlap crop (x90–210, y240–360), B left/C right; enlargement is for pixel inspection, not native perceptibility. No motion sequence was reviewed in this pass.

**A → B:** B produces a substantial improvement in the visibility of curved fronts and the quiet intervals between them in single and overlap views. In A, the same patterns remain faint beneath an almost uniform lattice; B reveals both stronger dot coverage and weaker/paler intervals, so the result is more than a uniform darkening. Dot rows remain recognizable and gaps remain open. The overlap becomes a patterned field of alternating regions rather than the dense, largely filled mass in the historical burst capture. This supports size plus brightness as the working basis, without proving liquid realism from stills alone.

**B → C:** No useful additional color variety is resolved at native desktop or mobile size. Both read predominantly neutral grey-violet on paper. In the enlarged crop, C has at most a slight tonal warmth; there is no clear warm/cool regional contribution that would justify a perceptual win. It would be misleading to select C simply because its pixels differ.

The coordinator's `paired-analysis.json` confirms a small nonzero change: maximum channel difference is 6–7/255 on desktop and 3–6/255 on mobile, with whole-frame mean absolute luminance difference about 0.000035–0.000056. Those measurements support preservation of B's luminance, not visibility or usefulness of C's color. They were read from the coordinator's analysis rather than independently recomputed here.

**Concise recommendation:** retain B's size/brightness mapping and fixed lattice. Make one bounded C-only chroma adjustment, preserving B's size, luminance, grid and events and leaving A/B unchanged. Require warm/cool regions to be discernible at native 390px while remaining secondary to fronts and dot size. The earlier conservative color bound was insufficient after tiny-dot coverage and compositing; treat it as an unsuccessful starting proposal. Review the matched adjusted C against existing B before selecting it. No new dynamics, displacement or broad study is needed.

## Final bounded C confirmation

The first-pass images discussed above are now preserved under `output/playwright/grid-reflections/initial-pass/`. Top-level captures were replaced by the final static-build confirmation with C color gain 0.024 (previously 0.008); A/B's model is unchanged. Reviewed final desktop/mobile overlap B and C at native size, plus final mobile single C and desktop quiet C.

**Resolved:** C now has a discernible muted olive/warm cast relative to B, especially in denser arcs. It remains subordinate to dot size and the broad brightness pattern. The lattice, open dot gaps and light/dark band structure remain recognizable; the color increase does not turn the field into a continuous material.

**Still ambiguous:** the cooler side reads mainly neutral grey-violet rather than a clearly identifiable teal reflection. C provides subtle color variety, but these stills do not establish that the color makes the field read more like liquid, or that warm/cool reflection regions become easier to interpret. The strongest demonstrated gain remains A → B's size modulation.

**Final recommendation:** present B and final C as honest review alternatives: B is the clearer evidence-backed structural improvement; C adds now-visible restrained warmth with similar structure. Do not declare C an automatic winner or integrate it into the app without the user's review. No further tuning or broader study is recommended in this pass.

The coordinator regenerated `paired-analysis.json` after the final capture. Final C differs from B by maximum channel values of 17/19/21 on desktop and 10/19/19 on mobile (quiet/single/overlap); mean absolute luminance difference is approximately 0.000066–0.000106. The earlier smaller figures above apply only to the initial pass. `integrity.json` records exact equality of all 12 A/B images with the initial set, an exact final C repeat and agreement of all 18 source manifests with final files. These numerical checks support a controlled color-only comparison; they do not establish a perceptual advantage. Final judgment remains: discernible muted warmth, tentative cool reflection variety, suitable for user review without declaring a winner. This completes report 24's bounded comparative review.
