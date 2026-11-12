# Stitch Studio v0.3 - targeted garment and stitch preview improvement plan

Date: 2026-11-11
Input: supplied `stitch-studio.zip` and `HANDOFF-preview-assessment.md`.
Status: source inspection and screenshot review completed; representative template calculations executed in Node.js; browser interaction/performance tests NOT_RUN. Recommendations below are not a tested knitting pattern.

## Decision

Preserve the existing single-file UI, gauge and relaxation calculator, template selection, warm paper/Georgia/mint theme, plan download, and starting-plan disclaimer. Prioritize plan-driven 2D garment schematics and a visibly distinct multi-scale knitted-fabric renderer. Do not build a full yarn-physics engine or mannequin-fitting pipeline in the next pass.

## Observations confirmed from source and supplied screenshots

- `KnitRender.garmentPath` (~line 1320): hat crown is a single asymmetric cubic curve; sweater and top share a near-identical shape with hardcoded `sleeveHang` rather than using `plan.sleeveRows` or `sleeveLen`.
- `KnitRender.aspectFor` (~line 1467): garment preview proportions are fixed by garment type (hat 0.95, sweater 1.38, top 1.02, sock 1.05, glove 0.78). They do not follow the physical cm dimensions of the relevant knitted pieces.
- `KnitRender.paintGrid` (~line 1490): cell dimensions are `box.w/cols` and `box.h/rows`; below 3.2 px the renderer falls back to flat color blocks. Shaped crown / toe rows are not represented as changing stitch counts; the rectangle is merely clipped.
- `KnitRender.sectionAtRow` (~line 1281): hat regions are distinguished, but sock rows after the cuff are all returned as leg and glove rows after the cuff as palm, so sections such as heel/toe/fingers do not have a faithful mapping in the fabric view.
- `KnitRender.stitchKind` (~line 1169) renders garter as purl throughout. Garter texture should be treated as alternating ridges, not simply a field of identical purl bumps.
- `paintFabric` (~line 1970) maps `mainStitches` across the entire drawn silhouette, even when the plan's main count is a circumference, but the shape is a front/side projection. This is not a physically consistent panel mapping.
- `build3D` (~line 1777) creates one BoxGeometry and MeshLambertMaterial per motif cell; geometry/material are not disposed when child objects are removed, creating a likely GPU resource leak on rebuild. The 3D content is a motif, not a garment.
- `paintLoupe` (~line 2164) places the inspector in the bottom-right of the same canvas, obscuring clothing contours on small previews.
- Representative Node.js plan evaluation with blocked swatch 22 stitches / 10.8 cm and 28 rows / 10.6 cm, repeat 8: scarf 40x449; blanket 248x396; beanie 104x58 (16 brim, 29 body, 13 crown); shirt 224 body stitches x 174 body rows; sweater 224 x 175 and sleeves 80x127; sock 40x128 total timeline rows; glove 40 main stitches x 68 main rows. Finger allocation: 8+10+8+8 = 34 of 40 main-hand stitches; the remaining six require explicit web / pickup allocation before knit-ready instructions are claimed.

## Proposed model contract

Do not use one global `mainStitches x mainRows` rectangle for every piece. Keep a `GarmentPlan` containing:

- gauge: blocked/relaxed stitches per cm and rows per cm (same existing math);
- body measurements vs finished measurements vs schematic panel measurements, with units;
- components: body front, body back, sleeve pair, cuff, hat tube/crown, sock leg/heel/gusset/foot/toe, glove palm/fingers/thumb;
- for each component: rows, active stitch counts per row, operations (knit/purl/increase/decrease/cast-on/bind-off/hold/pickup), physical cm coordinates, section markers, and color/stitch pattern mapping;
- presentation: 2D flattened chart, dimensioned schematic, textile surface, 3D mesh/timeline; use the same geometry contract for all four;
- explicit accuracy metadata: schematic-only, calculated/unverified, or tested pattern (not supported in v0.3).

The source of truth for shape is the component and its measurements, not a hardcoded Bézier path with stretched grid cells. The path can still be drawn with Bézier curves, but its control points must be generated from construction measurements.

## Priorities and acceptance checks

### P0: silhouettes and geometry
1. Make hat left/right contour mirror-symmetric, matching brim width on both sides. Crown width must follow actual decrease progression, not a rectangular chart clip.
2. Produce a separate shirt and sweater silhouette; the sweater's 127-row / ~48-cm sleeves hang down at an angle from the armhole, with arm width from sleeve stitches; shirt sleeves use their shorter plan value.
3. Size glove fingers from each finger's stitch circumference and row length, while explicitly allocating finger-web stitches and labeling unverified split assumptions.
4. Draw garment schematics with annotations for chest circumference, folded front width (about half chest circumference), body length, armhole, sleeve length, cuff, and neck opening as available.
5. Recheck preview geometry after changing swatch gauge, size and ease. Physical dimensions and plan values must not contradict each other.

### P1: separate charts from textile appearance
1. 2D chart mode: symbols and legend for at least knit, purl, yarn over, k2tog, ssk, decrease/no-stitch; bottom-up row labels; correct row reading direction for flat vs in-the-round knitting. Until actual shaping operations exist, keep "illustrative chart" labeling.
2. Rendered fabric mode: no chart numerals; overlapping loop silhouettes, dark ambient creases, consistent directional highlights, optional subtle yarn twist/fuzz; knitted rib, garter and stockinette should visually differ.
3. Multi-scale: detailed yarn loops above ~7 px; cached tile atlas or simplified strokes at intermediate zoom; filtered color+texture at full-piece zoom. Test 248x396 blanket without rendering nearly 100k independent 3D meshes.
4. Add `Show construction sections` toggle with boundaries and labels; implement per-piece region mapping for socks/gloves rather than assigning all rows to leg/palm.

### P2: interaction and delivery
1. Move loupe to a docked side inspector (responsive: below preview on phone), or allow a drag-detachable panel; avoid canvas overlays on a selected contour.
2. Replace tiny outlined focus square with a cursor crosshair or hide it when the mapping is too small to be meaningful.
3. Export a paginated printable instruction chart with symbols, row/column numbers, legend and repeats, plus a measurement-labeled garment schematic; retain the existing plain-text plan download.
4. Add deterministic screenshot regression tests for all eight presets at 100% zoom and 5x5 close-up; assert geometry symmetry and coordinate-to-stitch hit testing.

### P3: true 3D (after P0-P2)
1. Build a low-poly garment mesh per component (cylinder/rounded dome for hat; simple torso and two sleeves; tubes/branched surfaces for socks/gloves; hanging surface for scarf/blanket).
2. Map the 2D rendered textile as CanvasTexture with actual stitch coordinates and UVs; separate the material from the simplified cloth geometry.
3. Use a row/section-aware timeline and reveal correct components rather than another motif cube per frame. Expose a pause, scrubber and section name.
4. Optional closeup instanced stitches only where visible. Release geometry, materials and textures on update. Consider a mannequin only after panel placement, fit and seam topology are coherent.

## Sizing cross-check (guidelines only)

- Beanie Adult M head circumference 56 cm is inside CYC's adult woman 53-58.5 cm and adult man 56-61 cm ranges. -10% ease is a plausible starting assumption, not a universal standard.
- Sweater/Shirt Adult M chest 101 cm is within CYC adult men's medium range 96.5-101.5 cm but closer to the lower end of CYC women's large range 101.5-106.5 cm. The name "Adult M" should therefore indicate which measurement system is being used or simply be a custom named preset.
- Sock Adult M foot circumference 23 cm and foot length 25 cm correspond to values in the CYC adult foot charts, but the size should be defined by measurements rather than a generalized gender-neutral label.
- Glove Adult M 20 cm hand circumference and 19 cm length are near CYC woman's large / man's small measurements, not a universal adult medium.
- Drop shoulder sleeve and armhole dimensions should be validated as a pair, not solely against age or size tables. The current fixed +8% chest ease is a user-editable heuristic. Finger splits, toe decreases, heel turns, and crown schedules remain unvalidated.

## What not to do

- Do not replace the gauge math with photo-estimated body dimensions or simulate physical fit from one portrait.
- Do not present charts produced by clipped visual grids as knit-ready shaping instructions.
- Do not allocate one Three.js Mesh/BoxGeometry/material for each stitch on a full blanket.
- Do not introduce full 3D yarn/cloth simulation, parametric avatar fitting, or image-to-knittable-CAD conversion in this iteration.
- Do not silently claim that an illustrative schematic is a tested pattern.

## Research references (consulted 2026-11-11)

1. Craft Yarn Council, Schematics: https://craftyarncouncil.com/standards/schematics
2. Craft Yarn Council, Knit chart symbols: https://www.craftyarncouncil.com/standards/knit-chart-symbols
3. Craft Yarn Council, Head measurements: https://craftyarncouncil.com/standards/head-circumference-chart
4. Craft Yarn Council, Women's sizes: https://www.craftyarncouncil.com/standards/woman-size
5. Craft Yarn Council, Men's sizes: https://www.craftyarncouncil.com/standards/man-size
6. Craft Yarn Council, Foot sizes: https://www.craftyarncouncil.com/standards/foot-size-charts
7. Craft Yarn Council, Hand sizes: https://www.craftyarncouncil.com/standards/hand-size-charts
8. Stitch Maps, chart construction: https://stitch-maps.com/about/faq/
9. Stitch Fiddle, printable chart/legend export: https://www.stitchfiddle.com/en/help/1pe3-3svb1t/download-print
10. knitCompanion, row tracking: https://www.knitcompanion.com/
11. Yuksel et al., Stitch Meshes, SIGGRAPH 2012: https://www.cs.cornell.edu/projects/stitchmeshes/
12. Kaldor et al., Simulating Knitted Cloth at the Yarn Level, SIGGRAPH 2008: https://www.cs.cornell.edu/~srm/publications/SG08-knit.html
13. Khattar et al., A Texture-Free Multi-Scale Model for Surface-Based Rendering of Knitted Fabrics, published Apr. 2026: https://doi.org/10.1111/cgf.70356
14. Three.js canvas textures: https://threejs.org/manual/pages/canvas-textures.html
15. Three.js instanced meshes: https://threejs.org/docs/pages/InstancedMesh.html
16. Three.js resource disposal: https://threejs.org/manual/pages/how-to-dispose-of-objects.html
17. Carnegie Mellon Textiles Lab, Knitout: https://textiles.cs.cmu.edu/projects/on-demand-knitting/

## Verification and status

Source of record for code findings: the uploaded `stitch-studio/stitch-studio.html` in v0.3 ZIP, static inspection. Screenshot evidence: supplied `previews/01-11` images. Smoke check: Node.js executed the inline template logic using gauge 22/10.8 stitches per cm and 28/10.6 rows per cm, eight-stitch repeat and the default template size/ease settings; output was inspected. No modified app was produced. No visual/browser-based regression suite, performance benchmark, knitter fit test, physical swatch evaluation or knitted-pattern validation was run.
