> **Historical planning document.** This document describes the original scaffold / future requirements before the opt-in Stitch Atelier implementation. For current implementation status, see [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) and [`VALIDATION.md`](VALIDATION.md).

# Detailed enhancement requirements (future implementation only)

All requirement IDs describe planned work, **not completed work**. The shipped shell includes named modules and SVG references only. Severity P0/P1/P2/P3 is relative to this project's delivery sequence.

## Data interface and correctness: P0

**BR-001** Preserve v0.3 gauge/relaxation calculations, template selection, plan download and wording. Given unchanged inputs, legacy results must match the baseline; never silently change construction math during a visual update.

**BR-002** Version the adapter output. Provide `sourceVersion`, `contractVersion`, source measurement units, accuracy status, warnings and explicit separation of body, finished garment and schematic panel measurements. Missing values must remain unknown, not be fabricated.

**BR-003** Support reliable plan-update propagation and invalid state reporting. A failed swatch calculation must not leave the future preview showing stale geometry. Current event is provisional; define error-state contract before implementation.

**BR-004** Define adapter subscription lifecycle, disposal and changed-data semantics; avoid accumulating listeners on redraw and avoid unnecessary re-render when only a cosmetic control changes.

**GEOM-001** Build a geometry contract from measurable component data. For each component, define cm bounds, stitch layout, row allocation, shaping operations and side (front/back/round). Reject unsupported shaping instead of clipping a rectangle and calling it accurate.

**GEOM-002** Hat: mirrored contours around the centerline; matched brim flares; body/brim/crown section positions; crown width must follow actual decrease-round stitch counts. Acceptance: changing cast-on circumference or crown decrease progression changes silhouette consistently and the left/right crown error is within numeric floating-point tolerance when parameters are symmetric.

**GEOM-003** Tops: separate shirt and long-sleeve sweater geometry. Map body circumference to panel circumference, produce front/back/left/right sleeve components and neckline. Sleeve length derives from `sleeveRows / rowsPerCm`, not viewport width or fixed fraction. Acceptance: the default long sleeve is visually longer than the tee; any gauge/size/ease change produces a proportionate measurable outline and labels.

**GEOM-004** Gloves: each finger's circumference/length derives from its own stitches/rows, including web allocations, pickups and thumb gusset. Track input vs allocated vs pickup/held stitches and fail or warn when nonconserving. Acceptance: changing only middle finger length affects that finger, not all four.

**GEOM-005** Socks: represent cuff, leg, heel flap/turn, gusset, foot and toe using genuine sections. Support flattened and side views, with unsupported stitch operations explicitly identified. Do not infer gusset shape from a generic clipped silhouette.

**GEOM-006** Scarf, blanket and custom: preserve swatch-derived stitch aspect ratios. Blanket border widths and rows are derived from plan. Full-length scarf remains measurable even when displayed with a compressed fit-to-window viewport.

**GEOM-007** Every schematic must label what each measurement means, including circumference versus flat width, cm units, pre/post-block state, and shaping assumptions. Display a visible "illustrative / untested" marker when appropriate.

## Knitting chart and textile rendering: P1

**CHART-001** Knitting chart: chart-symbol encoding, symbol legend, row and column labels, color key, RS/WS reading direction, knit flat versus in the round. Clarify orientation and row-origin; follow CYC symbols with source documentation. Data must be derived from real operations or explicitly labeled illustrative.

**CHART-002** Chart crop/zoom/export preserves stitch coordinates; symbols and numbering remain legible without overlapping labels. No arbitrary chart clipping that changes row counts.

**FABRIC-001** Fabric mode visibly differs from chart mode: no chart numerals by default, yarn overlap, coherent shading, distinguishable knit/purl/stockinette/garter/rib. Keep textured fabric colors consistent with existing yarn palette.

**FABRIC-002** Zoom-based rendering: close >= about 7px/stitch use loop paths; mid use cached or simplified tiles; tiny/full-piece use filtered repeating texture and color aggregates. Exact thresholds require profiling, not assumption. Acceptance: default Throw blanket (about 248x396 stitches) is readable and responsive without one unique 3D mesh per stitch.

**FABRIC-003** Render by physical stitch aspect: pixel width and height ratio must reflect per-cm gauge after blocking, preserving garment geometry; display fit-to-panel scale separately from physical proportions.

**FABRIC-004** Stitch dictionary extensibility: rib is visually contracted, cables and lace eyelets can be added behind feature flags, and unavailable stitch constructs are reported as unsupported rather than invented.

**SECT-001** A show/hide sections control marks brim/body/crown, heel/gusset/toe, garment hems/cuffs and blanket borders from real construction section references; labels must not overwhelm textile view.

**SECT-002** Region mapping from screen coordinate to component/row/stitch is testable and shared with chart, fabric, loupe and later 3D UVs.

## Interaction, exports and 3D: P2-P3

**INSPECT-001** Inspector docks next to the garment on desktop and below on narrow displays, or can be moved. It must not obstruct hem/heel/toe/finger. Focus indicator is hidden or replaced with a crosshair when a stitch maps to fewer than a useful number of pixels.

**INSPECT-002** Pointer, touch and keyboard navigation; no unexpected wheel hijacking; announce selected section and stitch, and preserve contrast/label size at phone width.

**EXPORT-001** Export a dimensioned schematic with matching plan units, fitting notes, caveats and version metadata. Do not imply construction verification from a polished PDF.

**EXPORT-002** Export printable chart with chart symbols, rows, repeats, legend and pagination; maintain existing text-plan export unchanged until new exporters are validated.

**3D-001** Replace motif-only boxes with actual garment surfaces (hat shell; body with two sleeves; side sock and glove; hanging scarf/blanket). Use plan-driven dimensions and meaningful assembled components. Mark unsupported 3D patterns as placeholders.

**3D-002** Map knitted texture through UVs; use low-poly meshes for full garments, optional instanced stitch detail only for close-ups. On rerender dispose Three.js geometry, materials and textures. Missing CDN/WebGL must not break 2D/plan use.

**3D-003** Provide rotate, zoom, camera reset, accessible view descriptions and 2D fallback. 3D performance acceptance budgets should be decided using baseline hardware and scene size, not fabricated FPS numbers.

**TIME-001** Animate construction by piece and section, not uniform motif boxes. Expose pause, scrub, current piece/section, and repeatable resume states.

**TIME-002** Where construction is under-specified, use section-level illustrative steps, not a falsely precise row-by-row pattern. Sweater sleeves and sock heel stages must be separately representable.

**FIT-001** Later-stage manually adjustable body measurements, avatar dimension provenance, per-measurement confidence/units and fit-ease display. Keep scan/manual inputs separate from the original gauge engine.

**FIT-002** Later-stage scan/photo input only with calibration, measurement uncertainty, user consent and a stated limitation: a single image is not a trustworthy full 3D body scan. No fit/sizing guarantee.

## Invariants across all future work

- Maintain warm paper / Georgia / mint visual language.
- Keep v0.3 starting-plan, not a tested commercial pattern, language.
- Avoid hidden changes to stitch counts while implementing visual features.
- No coupling of actual garment dimensions to arbitrary preview canvas bounds.
- Fail with explicit unsupported states for unknown stitch manipulation.
- Test all eight presets, default Adult M examples and boundary cases, and accessibility/keyboard use.
