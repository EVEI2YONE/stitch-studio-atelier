# Stitch Studio - Source Integration & Developer Handoff

**Package:** `stitch-studio-scaffold-and-handoff.zip`  
**Source:** user-provided Stitch Studio v0.3 (`stitch-studio.zip`)  
**Handoff date:** November 12, 2026  
**Scope:** How to use the scaffold files, SVG assets, contracts, and TODOs **with the existing app source**.  
**Implementation status:** Existing application operates as before; the new feature layer is a **shell**, not functional garment CAD, textile rendering, 3D fit, or scan support.

> **Read this first:** This handoff explains where each file belongs, which legacy source functions it touches, what to implement in each module, and how to verify integration. Do **not** assume that an SVG reference illustration, a draft JSON schema, or a registered TODO module is an implemented feature.

## 1. Recommended development strategy

**Extend the provided application; do not rebuild it.** Keep its swatch/gauge calculations, construction-plan generation, existing preview modes, and download behavior. Add the missing data-model and renderer modules behind explicit opt-in controls until they are tested.

The current package has two HTML files with different purposes:

| File | Use | Do not do |
|---|---|---|
| `index.html` | **Main working entrypoint.** Contains the legacy v0.3 app plus the additive preview-development shell and its script references. Modify this only when wiring tested features. | Do not replace it wholesale with the unchanged baseline. |
| `original/stitch-studio.html` | **Immutable baseline** for rollback, output comparisons, and understanding original code. | Do not develop new functionality inside this archival copy. |

The 11 files under `original/previews/` are **visual baselines**. They are screenshots, not generated assets for production. The entire original source and screenshots were preserved in the scaffold package.

## 2. Install and open the package alongside source

1. Extract `stitch-studio-scaffold-and-handoff.zip` without flattening directories. The extracted folder is `stitch-studio-handoff/`.
2. Keep **all** subfolders under the same root as `index.html`; the relative script and SVG paths depend on that layout.
3. Open `index.html` to inspect the legacy app with the new **Preview development shell** card. The shell is read-only.
4. For development, start a local static server **inside the extracted `stitch-studio-handoff` folder**:

   ```bash
   cd stitch-studio-handoff
   python3 -m http.server 8000
   ```

   Then visit `http://localhost:8000/` in a browser.
5. Change a garment template or gauge setting. The *Legacy plan bridge* caption should change to the new template / stitch / row summary and end with **`new previews NOT IMPLEMENTED`**. This confirms data is reaching the shell, **not** that any future renderer works.
6. Compare `original/stitch-studio.html` against `index.html` or the original screenshots if the legacy behavior appears to have changed. Three.js r128 is still loaded through an external cdnjs script; offline 3D behavior is not guaranteed.

**If integrating into an existing repository instead of treating this ZIP as the repository:** preserve the legacy entrypoint and add the relative `src/scaffold/`, `assets/svg/`, and `contracts/` directories at the same level as the final HTML file. Carry across only the small additive changes from `index.html` (the shell CSS and markup, the plan event dispatch, and the script tags). Keep the `original/` and `docs/` folders as reference material rather than application runtime dependencies.

### Directory map and ownership

```text
stitch-studio-handoff/
  index.html                       LIVE entrypoint: v0.3 + additive shell
  original/stitch-studio.html      IMMUTABLE v0.3 reference
  original/previews/*.png          11 regression screenshots
  src/scaffold/
    registry.js                    module registration only
    bridge.js                      read-only legacy plan event consumer
    plan-adapter.js                TODO: normalize old plan into new contract
    garment-geometry.js           TODO: measured piece geometry
    chart-renderer.js             TODO: symbol/legend chart
    fabric-renderer.js            TODO: scale-aware textile appearance
    section-overlay.js            TODO: construction regions
    inspection.js                 TODO: loupe and hit testing
    exporter.js                   TODO: printable chart and schematic
    garment-3d.js                 TODO: real garment surfaces in Three.js
    construction-timeline.js      TODO: garment assembly progression
    body-model.js                 DEFERRED: measurements / scan metadata
  contracts/
    garment-plan.draft.schema.json       DRAFT interface, not enforced
    garment-geometry.draft.schema.json   DRAFT interface, not enforced
  assets/
    svg/garments/*.svg            8 illustrative garment icons
    svg/stitches/*.svg            4 illustrative stitch textures
    svg/ui/*.svg                  3 UI cues / body outline
    asset-contact-sheet.png      asset preview sheet
    gallery.html                 visual reference gallery
  docs/
    DEVELOPER_HANDOFF.md         original handoff notes
    REQUIREMENTS.md              detailed BR / GEOM / CHART / ... requirements
    ARCHITECTURE.md              proposed ownership and data path
    ASSET_GUIDE.md               usage and asset provenance
    TEST_PLAN.md                 desired verification cases
    VALIDATION.md                checks that were actually run
    ORIGINAL_PREVIEW_ASSESSMENT.md  initial screenshot assessment
    PRIOR_RESEARCH_RECOMMENDATIONS.md context for design decisions
  manifest.json                  package inventory and source checksum
```

## 3. What already connects to the legacy application

The original runtime remains the source of truth for current calculations:

```text
HTML inputs / selected preset
    -> StitchCore.calculate(data)                 [existing]
    -> currentPlan(...) -> KnitTemplates.buildPlan [existing]
    -> renderPlan(...) + updateView()              [existing]
    -> window.StitchStudioShellLatest              [added: snapshot]
    -> event "stitchstudio:plan-updated"            [added: read-only]
    -> src/scaffold/bridge.js                      [added: caption only]
```

The event is emitted from the existing `render()` function **after** the legacy rendering work. The separate `bridge.js` subscribes to it, and also reads `window.StitchStudioShellLatest` on startup. This startup snapshot is essential because the initial legacy `render()` executes before the separate scaffold scripts load. The scaffold's `registry.js` must load before any TODO module; `bridge.js` currently loads last.

**Current event payload (provisional; not a stable API):** `sourceVersion`, `plan`, `gauge`, `relaxation`, `input`, `templateId`, `sizeId`. All are copied from the legacy runtime without creating the new canonical garment model.

**Two correctness traps:**

- In the exposed `r.gauge`, finished stitch and row gauge values are expressed **per 10 cm**; `currentPlan()` separately constructs `stsCm` and `rowsCm` as **per cm** values for `KnitTemplates.buildPlan`. An adapter must normalize units exactly once and record whether blocked/relaxed measurements were used.
- The legacy `plan.mainStitches` can be the **full circumference** of a hat or garment, not a schematic front-panel width. Its `pieces` array describes construction at a high level and does **not** provide every increase/decrease or heel/finger operation. Preserve unknowns; do not invent rows or divide every circumference by two without knowing construction.

**Existing gap to fix at the first integration gate:** In `render()`, the `catch` block clears the old result/plan and shows an error but does not publish a corresponding shell invalidation event. A downstream geometry preview could display **stale valid geometry** after bad input. Before activating new views, define an invalid/error payload and clear or visually mark the experimental preview when calculation fails.

## 4. Exact source touchpoints (search by symbol)

Line numbers below are approximate for the **scaffold `index.html`**. Use symbol search; do not use them as stable anchors.

| Legacy symbol / area | Approx. location | How the developer should use it |
|---|---|---|
| `StitchCore.calculate` | around 370-405 | Preserve. Produces swatch, gauge, relaxation and validity information. Add baseline tests before touching. |
| `StitchCore.generateChart` | around 477 | Existing motif source; do not mistake its compact repeated motif for garment-wide construction data. |
| `KnitTemplates.TEMPLATES` and `KnitTemplates.buildPlan` | around 500-1147 | Legacy preset math. Consume through adapter; separately document future shaping/math changes. |
| `KnitRender.sectionAtRow` | around 1300 | Current partial section classification; future overlay must use actual section ranges. |
| `KnitRender.garmentPath` | around 1350 | Current hardcoded garment outlines; reference for legacy fallback, not the new canonical geometry. |
| `KnitRender.paintGrid` and stitch helpers | around 1500-1622 | Existing knitted V/purl drawing; useful for a fallback and for initial textile tile experiments. |
| `build3D(chart, colors, progress)` | around 1804 | Existing motif box scene, **not** a garment mesh. Keep until replacement view passes validation. |
| `currentPlan(r, d)` | around 1856 | Converts gauge and calls legacy `buildPlan`. Adapt its output; avoid duplicate engine calculations. |
| `render()` | around 1870; event around 1942 | Source for snapshot/event. Add invalid-state propagation and versioned adapter hookup here only after tests. |
| `paintFabric()`, `paintLoupe()` | around 2006 and 2208 | Existing canvas preview and inspector; preserve until replacement modes are opt-in and tested. |
| `updateView()` | around 2299 | Existing view-mode switch; do **not** call unimplemented modules here. Later add feature-flagged experimental modes. |
| Scaffold external scripts | near end, around 2514-2525 | Loads registration, TODO components and read-only bridge; keep relative paths and load order intact. |

The source still contains the inline legacy modules. The new `src/scaffold/*.js` files are classic browser scripts registering onto `window.StitchStudioScaffold`, not imported ES modules. There is no bundler or backend to install from this package.

## 5. How each new source file should be implemented

**The API names below are existing stub entrypoints.** Today, invoking any of these ten TODO methods throws `NOT_IMPLEMENTED`. Do not expose their controls as working features.

| File / exposed method | Input from existing app | Expected output and work | Gate |
|---|---|---|---|
| `plan-adapter.js` - `planAdapter.adaptLegacySnapshot(snapshot)` | Event snapshot from `bridge.js` | Versioned GarmentPlan; cm gauge; body vs finished vs panel measurements; section ranges; missing operations and uncertainty | A |
| `garment-geometry.js` - `garmentGeometry.buildGeometry(garmentPlan)` | Validated normalized plan | Physical-cm outlines, measured pieces, row-stitch profiles and any supported mesh metadata; explicit unsupported states | B |
| `chart-renderer.js` - `chartRenderer.renderChart(canvas, garmentPlan, options)` | Actual stitch operations, chart orientation | Chart symbols, numeric row/column cues, color key, RS/WS semantics and legend | C |
| `fabric-renderer.js` - `fabricRenderer.renderFabric(canvas, garmentGeometry, options)` | Measured geometry + mapped stitch appearance | Yarn-like stitch texture at near zoom; cached tiles and filtered surface at full zoom | C |
| `section-overlay.js` - `sectionOverlay.drawSections(canvas, garmentPlan, geometry, options)` | Named piece / section ranges | Toggleable, non-obscuring brim, crown, cuff, sleeve, heel, border and other overlays | C |
| `inspection.js` - `inspection.createInspector(garmentGeometry, options)` | Shared hit-test coordinate transforms | Dockable, keyboard/touch accessible stitch inspection; no cover-up of important garment parts | D |
| `exporter.js` - `exporter.exportPrintable(garmentPlan, renderSources, options)` | Validated chart and geometry | Printable, labeled chart / schematic with units, metadata, untested status and pagination | D |
| `garment-3d.js` - `garment3D.renderGarment(container, garmentGeometry, textureAtlas, options)` | Measured piece surfaces / UVs and texture atlas | Low-poly garment view, controls and resource teardown; safe WebGL fallback | E |
| `construction-timeline.js` - `constructionTimeline.createTimeline(garmentPlan)` | Construction graph of pieces and sections | Section/piece-aware frames and a scrub model; never claim missing row operations | E |
| `body-model.js` - `bodyModel.loadBodyMeasurements(source, options)` | Editable manual dimensions initially | Later avatar and source provenance; scanning / fitting remain outside initial scope | F |

The `registry.js` descriptor names use camel case (`planAdapter`, `garmentGeometry`, etc.). The object is available as `window.StitchStudioScaffold`; `describe()` lists registered modules and `get(name)` retrieves a descriptor. Registration alone does not wire a renderer into the preview UI.

### Draft contracts: how to use the JSON files

- `contracts/garment-plan.draft.schema.json`: reference shape for canonical gauge, measurements, component sections and accuracy/status. Its declared `contractVersion` is `draft-0.1` and allowed statuses include `illustrative` and `calculated-unverified`.
- `contracts/garment-geometry.draft.schema.json`: reference shape for physical-cm `pieces`, `outline2d`, optional `mesh3d` and `uvMap`, and warnings.
- Treat both as **draft design contracts**, not validated or runtime-enforced schemas. First implement an adapter and fixtures, agree on the shape, then add schema validation. A green JSON parse does not mean a populated plan is correct.

## 6. SVG assets: usage with app source

All 15 SVGs are **illustrative references authored for the scaffold**, not measured outputs, full knitting instructions, standard chart-symbol definitions, or production 3D assets. Existing inlined template icons inside `KnitTemplates.ICONS` are untouched.

| Asset paths | Use now | Use later |
|---|---|---|
| `assets/svg/garments/{custom,scarf,blanket,beanie,shirt,sweater,socks,gloves}.svg` | Show reference cards, template selection ideas, design targets. Four are already linked in scaffold panel markup. | Replace static outline with **generated SVG/path** from `garmentGeometry`. Never claim the SVG respects gauge or measurements. |
| `assets/svg/stitches/{stockinette,rib,purl,lace-eyelet}.svg` | Appearance sketches for knit loop rendering, previews or docs. | Use as style references for fabric tile generation, not as knitting-chart symbol sources. |
| `assets/svg/ui/{body-outline,loupe,ruler}.svg` | Icons / interaction concept references. | Use body outline only as generic avatar placeholder, loupe/ruler as controls with accessible labels. |
| `assets/asset-contact-sheet.png`, `assets/gallery.html` | Inspect all added assets quickly. | Do not use contact sheet as garment-output data. |

The linked asset paths in `index.html` are relative to the extracted root. For a build system, preserve those paths or update them consistently. If exporting a real schematic in the future, generate its dimensions and curves from `GarmentGeometry` rather than stretching an icon. See `docs/ASSET_GUIDE.md` for provenance and limitations.

## 7. Integration sequence, change boundaries and acceptance gates

### Gate 0 - Baseline and regression harness (no new user-facing feature)

**Edit:** tests and developer tooling; leave original runtime alone.  
**Use:** `original/stitch-studio.html`, `original/previews/`, and `docs/TEST_PLAN.md`.  
**Done when:** all eight templates load, existing gauge outputs/plans/downloads match baseline for fixed fixtures, 2D/rendered views work, and source hashes remain unchanged. Record browser/OS and environment.

### Gate A - Normalize data without changing calculations

**Edit:** `src/scaffold/plan-adapter.js`, bridge/data lifecycle, tests.  
**Read:** `currentPlan`, `KnitTemplates.buildPlan`, draft `GarmentPlan` contract.  
**Done when:** per-10-cm versus per-cm gauge is tested; body, garment and panel measurements are unambiguous; invalid input clears stale future preview state; missing shaping is reported rather than guessed. The legacy UI remains unchanged.

### Gate B - Geometry and schematics before fabric or 3D

**Edit:** `src/scaffold/garment-geometry.js`; create a separate **experimental** schematic view under a feature flag.  
**Read:** legacy `garmentPath`, `plan.pieces`, actual row data when available.  
**Done when:** hat is symmetric; sweater sleeves hang and derive from sleeve rows/row gauge; glove finger dimensions are individually driven and stitch allocations reconcile or warn; every labeled cm dimension is traceable back to the plan. Fill in sock/shirt/flat templates after the first three are correct.

### Gate C - Separate chart from fabric and surface construction

**Edit:** `chart-renderer.js`, `fabric-renderer.js`, `section-overlay.js`.  
**Read:** legacy `paintGrid`, `drawKnitV`, `drawPurl`, `sectionAtRow`.  
**Done when:** chart is a symbol grid with legend and row direction; fabric is a yarn-texture visualization rather than a disguised chart; large blanket renders without one 3D mesh per stitch; overlays show true documented sections only.

### Gate D - Inspector and exports

**Edit:** `inspection.js`, `exporter.js`.  
**Read:** `paintLoupe` and existing download logic.  
**Done when:** the loupe no longer obscures the garment by default; chart coordinates survive zoom/crop; chart and schematic exports are printable and still labeled *starting plan / untested*. Existing download retains its behavior.

### Gate E - True 3D garment and construction timeline

**Edit:** `garment-3d.js`, `construction-timeline.js`; feature-flagged `updateView` path **only after** component tests.  
**Read:** legacy `build3D` and existing Three.js r128 setup.  
**Done when:** hat, top, sock or glove is shown as garment pieces rather than motif boxes; a scarf/blanket uses an appropriately scaled textile surface; camera/reset and fallback work; scene resources are disposed; time-lapse follows pieces and sections, not a false continuous rectangle.

### Gate F - Optional body-model/scan pipeline (not part of the first release)

**Edit:** `body-model.js` and later a deliberate measurement/fit interface.  
**Done when:** manual body dimensions have units and provenance, the displayed garment/measurements are traceable, and scan imports (if supported) have calibration, consent and uncertainty. One photo must not be treated as a complete, accurate 3D scan.

**Feature flags / rollback:** A newly implemented view should be **opt-in** until all fixture and visual tests pass. Retain the old `updateView()`/`build3D()`/Canvas path as a fallback. When switching defaults later, make rollback one documented configuration change, not a source restore.

## 8. Known issues and non-goals to tell the next developer

1. **Plan-vs-picture discrepancy:** legacy rendering fits a clipped grid to a canvas; it does not derive all outlines from row-level shaping. Visual correctness is not established by a plausible silhouette.
2. **Geometry details need validation:** a sweater's front panel and a garment circumference are different quantities; a beanie's decreases must affect its crown profile; the existing glove finger allocation needs reconciliation before knitting instructions can be trusted.
3. **Stale data risk:** when `render()` catches bad input, the shell caption currently can retain the previous valid plan. Fix before connecting a real preview renderer.
4. **No complete textile simulation:** SVGs, yarn V marks, and texture LOD are illustrative. Physical drape, tension and fabric behavior are not proven by this package.
5. **No full 3D garment:** current Three.js scene is a small motif of boxes. The `garment-3d.js` entrypoint is only a stub.
6. **No mannequin/scan/fitting:** the generic body SVG is not a calibrated avatar; scanning has no runtime processing or accuracy guarantee.
7. **Do not rewrite `StitchCore` to fix visuals:** preserve calculation behavior and make math changes independent, reviewed and regression-tested.
8. **3D dependency:** Three.js r128 is loaded from CDN. Missing network or WebGL must not break the gauge/plan/2D workflow.

## 9. Suggested engineering work tickets

| Ticket | Requirement references | Deliverable / review evidence |
|---|---|---|
| T1. Adapter + invalid state | `BR-001..004`, `GEOM-001` | Plan fixtures, units test, schema review, stale-state test |
| T2. Beanie geometry | `GEOM-002`, `GEOM-007` | Symmetry property test, measurement labels, screenshot |
| T3. Sweater + glove geometry | `GEOM-003..004` | Independent sleeve/finger tests; reconciliation warnings |
| T4. Chart / fabric renderers | `CHART-001..002`, `FABRIC-001..004` | Distinct chart and textile screenshots, full-blanket case |
| T5. Section overlay + inspector | `SECT-001..002`, `INSPECT-001..002` | Accessible inspection and no-occlusion interaction test |
| T6. Exports | `EXPORT-001..002` | Print preview, page breaks, notes, retained old download |
| T7. Garment 3D + timeline | `3D-001..003`, `TIME-001..002` | Actual piece-level 3D, dispose, controls and timeline tests |
| T8. Body/scan follow-up | `FIT-001..002` | Separate requirements review, provenance / privacy and calibration plan |

The authoritative acceptance criteria for these tickets are in `docs/REQUIREMENTS.md`. Do not close a ticket based only on a UI card or a registered stub function.

## 10. Verification checklist for the recipient

- [ ] ZIP extracts with the same directories; `index.html` resolves all linked SVG and JS paths.
- [ ] Eight original templates can be selected and the original plan/calculation still behaves as before.
- [ ] Shell status changes on template, size or gauge updates; the new views remain visibly marked TODO.
- [ ] Invalid input has a defined future-preview cleared/error state **before Gate A is promoted**.
- [ ] New adapter tests lock down units and distinguish full circumference from flat width.
- [ ] Every implemented module provides documented inputs, outputs, error/unsupported states and cleanup.
- [ ] New view is feature-flagged; legacy renderers remain available during rollout.
- [ ] Regression captures include beanie, sweater, glove and full-blanket views, plus mobile and no-WebGL cases.
- [ ] Printed outputs retain the disclaimer; no unverified pattern or fit guarantee is presented.
- [ ] All `NOT_IMPLEMENTED` stubs are only marked complete after actual functional and visual verification.

### Verification status at handoff

**PASS, from existing package `docs/VALIDATION.md`:** preservation of source and screenshots byte-for-byte; shell JS parsing; HTML inline script syntax; SVG XML and JSON syntax; one bridge dispatch; mocked bridge update and deliberate stub exceptions; ZIP CRC check.  
**NOT RUN:** full end-to-end browser UI regression, actual yarn/garment rendering, WebGL performance, accessible interaction, physical knit test and printable export verification. Local browser navigation was blocked in the package-building environment.  
**New in this report:** source/file-path reconciliation and a more explicit integration and TODO-to-source map. **No application code was changed by preparing this report.**

## 11. Source documents and starting points

Use these **within the provided package**, in this order:

1. `README.md` - package scope, extraction and opening instructions.
2. `docs/DEVELOPER_HANDOFF.md` - earlier integration notes and handoff assumptions.
3. `docs/REQUIREMENTS.md` - detailed acceptance criteria and stable requirement IDs.
4. `docs/ARCHITECTURE.md` - proposed future data flow and module responsibilities.
5. `contracts/*.draft.schema.json` - provisional interface shape, not runtime validation.
6. `docs/ASSET_GUIDE.md`, `assets/asset-contact-sheet.png` - SVG inventory and correct interpretation.
7. `docs/TEST_PLAN.md`, `docs/VALIDATION.md` - test expectations versus actually executed checks.
8. `docs/ORIGINAL_PREVIEW_ASSESSMENT.md` and `original/previews/*.png` - visible defects and regression evidence.
9. `docs/PRIOR_RESEARCH_RECOMMENDATIONS.md` - context and future-facing approaches.

**Delivery boundary:** This report guides how to use the files with the v0.3 application source. It is not an installation, merge, deployment, or implementation of new rendering features.
