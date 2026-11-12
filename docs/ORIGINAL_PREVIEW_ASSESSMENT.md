# Stitch Studio — Preview assessment and research handoff

**Date:** 11 November 2026
**App:** Stitch Studio v0.3 (`stitch-studio.html` in this package)
**Purpose of this file:** Hand off an accurate, evidence-based assessment of how the garment and stitch previews actually look, and request further research on how they can be improved. The screenshots in `previews/` are the visual record this assessment is based on. Open those photos alongside this note.

This is a starting-plan tool, not a validated commercial pattern generator. Improvements to the preview should stay honest about that.

---

## 1. What is in this package

| Path | What it is |
| --- | --- |
| `stitch-studio.html` | Self-contained app (gauge engine, garment templates, construction plans, 2D / rendered / 3D / timelapse previews). Open it in a browser. |
| `previews/` | 11 screenshots of the current UI, named by what they actually show. |
| `HANDOFF-preview-assessment.md` | This note. |

Preview photos:

1. `01-custom-full.png` — Custom rectangle, full-piece 2D, with the 10×10 loupe.
2. `02-scarf-standard.png` — Scarf, Standard (~20 × 170 cm), laid horizontally, construction plan.
3. `03-blanket-throw.png` — Blanket, Throw, field plus border, construction plan.
4. `04-beanie-adult-m.png` — Beanie, Adult M, full-piece rendered view, loupe, construction plan.
5. `05-shirt-adult-m.png` — Shirt, Adult M, drop-shoulder tee silhouette, construction plan.
6. `06-sweater-adult-m.png` — Sweater, Adult M, intended as a long-sleeve pullover, construction plan.
7. `07-socks-adult-m.png` — Socks, Adult M, side profile (cuff, leg, heel, foot, toe).
8. `08-gloves-adult-m.png` — Gloves, Adult M, fingers connected to the palm, construction plan.
9. `09-2d-5x5-closeup.png` — 2D Chart, 5×5 scope, yarn-like knit V stitches and chart numbers (right-to-left).
10. `10-rendered-5x5-closeup.png` — Rendered Fabric, 5×5 scope, raised Vs and purl bumps.
11. `11-beanie-loupe.png` — Beanie full piece with the 10×10 loupe over the fabric.

Working sources used to build the HTML (on the machine that authored this, not inside the zip): `engine.js` (StitchCore gauge), `knit-studio/templates.js` (KnitTemplates plans), `knit-studio/renderer.js` (KnitRender silhouettes and stitch drawing), `knit-studio/app.js` (UI). The HTML is the four scripts inlined after Three.js r128 from cdnjs.

---

## 2. Accurate assessment of the previewing

The assessment below is from looking at the screenshots, not from intended design. Earlier passes had a blank white panel under the canvas, flat colored squares on 2D close-ups, and glove fingers detached from the palm. Those three are fixed in this build. What follows is how the current previews actually read.

### 2.1 What already works

- **Templates are recognizable.** Custom, scarf, and blanket read as the rectangles they are. The beanie reads as a rounded cap, the shirt as a short-sleeve drop-shoulder tee, the socks as a cuff-to-toe side profile, and the gloves as a hand with four fingers and a thumb. See photos 01–08.
- **Full piece is the default, and it is zoomed out.** The whole design is visible on first view, which was the original problem (the old preview was locked to a small 24–36 × 16 stitch window). Dimensions and stitch counts are labeled on the canvas (for example, scarf 19.64 × 169.98 cm, 40 sts × 449 rows; beanie 51.05 cm knit circumference, 104 stitches).
- **Construction plans match the preview.** Selecting a template fills size fields, shows a section-by-section plan (stitches, rows, cm, and brief how-to notes), and draws a silhouette that agrees with the kind of garment. Plans include an explicit disclaimer that they are gauge-based starting points, not tested, sized knitting patterns. Default sizes observed: Scarf Standard, Blanket Throw (248 sts × 396 rows, ~6 cm border), Beanie Adult M (104 sts; 16 brim / 29 body / 13 crown rows), Shirt and Sweater Adult M, Socks and Gloves Adult M.
- **Inspection tools work.** 5×5, 10×10, Motif, and Full piece scopes; a 50–300% zoom slider; drag-to-pan on close-ups; a 10×10 loupe on the full piece whose highlight follows the pointer and whose inset stays anchored at the lower right (photos 04, 09–11). Chart numbers on close-ups run right-to-left, as in a knitting chart.
- **Close-up stitches now look like knitting.** In 5×5, both 2D and Rendered Fabric draw yarn-like V stitches, not flat squares. Rendered Fabric adds raised oval purl bumps (photos 09 and 10). A fabric-colored ground sits under the Vs so white does not flash between stitches.
- **Gloves are a single connected shape.** Fingers meet the palm with no gap; the thumb branches from the side of the palm (photo 08). An earlier outline left a large white gap under the fingers; that is gone.
- **Layout.** There is no leftover blank canvas under the preview. The caption sits directly under the fabric, and the construction plan follows.

### 2.2 Where the preview is weaker than it looks at first glance

These are real, visible issues, not nits.

**The beanie is lopsided.** In photos 04 and 11 the crown is rounded on the left and falls away on the right, and the brim flares more on the bottom left than the right. A hat should be symmetric. The cause is in `KnitRender.garmentPath` for `kind === 'hat'`: the crown is a single cubic Bézier whose control points are not mirrored (one control sits on the left edge, the other at the center top). That will keep drawing an uneven cap until the path is rewritten as a symmetric pair of curves.

**The sweater does not read as a pullover.** In photo 06 the “Sweater · Adult M” preview is almost the same silhouette as the short-sleeve shirt in photo 05. Sleeves are drawn as horizontal wedges out to the sides of the frame, not as sleeves that hang down the body. In code, shirt and sweater share one path (`kind === 'top' || kind === 'sweater'`); the only difference is `sleeveHang`, `h * 0.08` vs `h * 0.18`. The construction plan already knows the difference — sweater sleeves are 80 sts × 127 rows, about 48 cm long, versus the shirt’s 72 × 53, about 20 cm — but the drawing does not use those numbers. The path is a fixed fraction of the preview box, not of the plan.

**Rendered Fabric at full-piece scale still looks like a chart.** On a beanie or blanket, individual stitches are only a few pixels, so the renderer falls back to simple cell fills (below ~3.2 px) or tiny V marks (3.2–7 px). Photo 04’s full beanie is clearly a colored chart with a clip-path outline, not a piece of knitted fabric. The convincing yarn lives only in the loupe and in 5×5 / 10×10. For a Throw blanket at 248 × 396 stitches, almost the entire full-piece view will be flat cells.

**2D Chart and Rendered Fabric are too alike in close-up.** Photos 09 and 10 are both yarn Vs; Rendered adds purl bumps and slightly richer shading, but a knitter could miss the difference. The two modes should have a clearer job: 2D as a readable chart (symbols, numbers, grid, legend), Rendered as a fabric simulation (yarn, light, structure, maybe a little drape).

**The loupe covers the garment.** In every full-piece photo the 10×10 inset sits on the lower-right of the piece. That is intentional and useful, but it hides the hem, a glove thumb, a sock toe, or a sleeve depending on the template. A research question is how to inspect stitches without eating the silhouette.

**A stray square appears on the sweater.** Photo 06 has a small outlined square to the left of the body. That is the loupe’s on-garment highlight frame. The code hides the frame when it is under 16 px; on this garment it is just large enough to show, and it looks like a leftover box, not a useful marker.

**Glove fingers are generic.** They are attached, which is the important fix, but they are even, cartoon finger stubs. The plan already gives different stitch and row counts for index, middle, ring, pinky, and thumb (photo 08: 8/10/8/8 sts, different row counts). The outline does not follow those counts, and the notes already say the splits are a starting point you should adjust at the hand.

**3D Layers is still a small motif of boxes, not a garment.** The 3D and timelapse views were inherited from the original app and still render a compact stitch motif, not a hat, sweater, or sock in the round. They were not the focus of this pass and were not re-photographed as a finished garment preview. Anyone improving “how it looks” should treat 3D as unfinished work, not as a solved view.

**Section structure is only lightly visible on the fabric.** Brim vs body vs crown, cuff vs leg vs heel, or a blanket border are described in the plan and sometimes hinted (blanket border, rib kind on early rows), but the full-piece picture does not clearly show those construction regions. A knitter looking only at the preview would not see where to change stitch pattern.

**Gauge proportions may be stretched to the box.** The silhouette is fitted into a fixed preview canvas. Stitch cells are `box width / columns` by `box height / rows`, so the stitch aspect ratio follows the frame more than the swatch’s stitches-per-cm vs rows-per-cm. Shaping (crown decreases, toe, neck) is a clip path, not a changing stitch count in the outline. This is a quiet accuracy problem: the plan is gauge-based, the picture is only partly so.

---

## 3. Request for further research

Please research how these previews can be further improved, and come back with recommended approaches, references, and a proposed next pass — not a rewrite for its own sake. The questions below are the brief. Each one should be answered with what good tools and papers already do, what would actually help a knitter using this app, and what is feasible in a single-file browser app that already has a canvas 2D preview and Three.js.

### R1. Drive silhouettes from the construction plan, and make them trustworthy

- How should a 2D flat preview represent a 3D garment so it is instantly recognizable *and* faithful to the plan’s stitch and row counts?
- Fix, or propose a better construction for: a **symmetric beanie** (mirrored crown curves; brim flare equal on both sides); a **pullover whose sleeves hang** and whose sleeve length comes from the plan (127 rows / 48 cm) so it cannot be confused with the tee; **glove fingers** whose widths and lengths follow the per-finger stitch counts.
- Should the outline be a hardcoded path with nicer curves, or a path generated from section measurements (cast-on width, armhole depth, sleeve length, crown decrease rate)? The second would stay accurate when the user edits ease, size, or gauge.
- Compare with how pattern apps, tech-drawing fashion flats, and knitting magazines draw schematics (standard garment schematics with measurements at the edges).

### R2. Separate “chart I can knit from” and “fabric I can imagine”

- What visual language should **2D Chart** use? Research standard knitting-chart practice: right-to-left numbers (already started), row numbers, stitch symbols (Craft Yarn Council / TKGA), a legend, RS vs WS, maybe a color key. When should a close-up stay a chart instead of drawing yarn?
- What would make **Rendered Fabric** convincingly knitted at *every* zoom, including a 248 × 396 throw? Look at yarn-level cloth work (for example Yuksel, Lefebvre, and related yarn-level or stitch-mesh models), industrial knit visualization (knitout, machine-knit simulators), and consumer tools (Stitch Fiddle, Stitch Maps, KnitCompanion, and similar). Which ideas can run in a 2D canvas at interactive frame rates?
- Concrete techniques to evaluate: pre-rendered yarn tiles / mipmaps for sub-3 px stitches; overlapping yarn with twist and a shared lighting direction; rib that actually contracts; a slight fabric drape or fold so a full piece does not look like a sticker; a clearer difference from the chart mode so the two tabs earn their names.

### R3. Show construction, not only color

- How can brim, body, crown, heel, border, and similar sections be visible *on the fabric* without cluttering it? Options to research: subtle region tints, labeled callouts, a “show sections” toggle, a schematic next to the fabric, or a explode/stack view of pieces.
- For hats and socks, should the preview be a flattened chart of the round, a side-view schematic with the pattern mapped on, or both?

### R4. 3D garment preview

- The current 3D view is a grid of boxes for a small motif. Research draping the *actual* chart onto a simple form: a skullcap for the beanie, a drop-shoulder torso for shirt and sweater, a last for the sock, a hand for the glove, a hanging rectangle for scarf and blanket.
- Compare instanced stitch meshes, a displacement-mapped knit shader, and a low-poly mannequin with the chart as a texture. What survives on a large blanket? What is worth doing in Three.js r128 in this single file?
- Time-lapse should eventually build the *garment*, not only a motif, if that can be made readable.

### R5. Gauge-accurate geometry

- Research how to keep each stitch’s pixel aspect equal to `(1 / stitches-per-cm) : (1 / rows-per-cm)` from the user’s swatch, including after relaxation, and how shaping should change the outline (crown decreasing in stitch count, waist shaping, sock gusset) rather than only clipping a rectangle.
- Check the existing plans against published body measurements (Craft Yarn Council standard sizes, typical ease for hats, socks, and gloves) and report where the numbers are reasonable and where they should be revisited. Do not present any of that as a tested pattern.

### R6. Interaction and inspection

- Loupe placement that does not cover the interesting part of the garment (auto-flip to a free corner, a detachable inspector, or a split view).
- Whether the stray highlight frame should be a minimum-size marker, a crosshair, or hidden on full-piece views of large items.
- Export: a printable chart (PDF or PNG) at a useful scale, and a schematic with the same measurements as the plan. Research what knitters actually take to the needles.

### R7. Richer stitch vocabulary (later)

- After the silhouette and fabric questions, research adding structure beyond colorwork diamonds, stripes, and checker: visible rib, a simple cable, a lace eyelet, section-aware stitch patterns (ribbed brim, stockinette body). This should stay a preview of a starting plan, not a full pattern CAD.

---

## 4. Suggested research order

1. **Silhouettes from the plan** (R1) — highest visual payoff; the beanie and sweater are the two that currently mislead.
2. **Chart vs fabric, including full-piece scale** (R2, R3) — this is the heart of “the stitches look basic / too zoomed in,” which is now only half-solved (close-ups are good; the full piece is still a chart).
3. **Gauge-accurate proportions** (R5) — so the picture and the numbers cannot disagree.
4. **Loupe and export** (R6).
5. **3D garment forms** (R4) — worth real research before more modeling work; easy to overbuild.
6. **Richer stitch types** (R7) once the fabric view can show them.

Please report findings with references, a recommended approach for this codebase, and what you would *not* do (dead ends, work that would make the preview look more finished than the plan is trustworthy). A next implementation pass should keep the warm paper / Georgia / mint aesthetic, the existing gauge and relaxation math, the downloadable plan, and the “starting plan, not a tested pattern” language.

---

## 5. Pointers in the code

- **Plans:** `KnitTemplates.buildPlan` — template IDs `custom`, `scarf`, `blanket`, `beanie`, `shirt`, `sweater`, `socks`, `gloves`. Ease defaults: hats and socks −10%, gloves −6%, shirt and sweater +8%. Beanie crown prefers every-other-round decreases if that is not too tall, otherwise every round (this was already corrected once; 13 crown rows on Adult M is the intended result).
- **Outlines:** `KnitRender.garmentPath` — `hat`, `top` / `sweater`, `sock`, `glove`, and rectangles. This is the first place to fix beanie symmetry and sweater sleeve hang.
- **Stitches:** `KnitRender.paintGrid`, `drawKnitV`, `drawPurl`. Detail thresholds: yarn Vs when the cell is ≥ 7 px, mid-detail V marks when ≥ 3.2 px, flat fill below that. Both 2D and Rendered use this on close-ups; Rendered sets `realistic` and maps some rows as purls.
- **UI / loupe / scopes:** `app.js` — `pathKind()`, full-piece default, loupe inset, highlight frame (hidden below 16 px), zoom and pan.
- **3D:** original Three.js box-stitch scene, still driven by a compact motif chart, not `plan.mainStitches × mainRows`.

If a finding would change the meaning of a plan (stitch counts, ease, or construction method), call that out separately from a visual change, and keep the disclaimer in the UI.
