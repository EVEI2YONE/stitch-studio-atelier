> **Historical planning document.** This document describes the original scaffold / future requirements before the opt-in Stitch Atelier implementation. For current implementation status, see [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) and [`VALIDATION.md`](VALIDATION.md).

# Developer handoff: Stitch Studio enhancement scaffold

Date: 2026-11-12
Target: existing `stitch-studio.zip` v0.3; new artifact is **shell only**.

## 1. Developer quick start

Unzip the bundle. Open `index.html`; it runs the original Stitch Studio v0.3 UI, then shows an extra **Preview development shell** card. For local development, run `python3 -m http.server 8000` in the extracted root and browse to `http://localhost:8000/`. Do not open `original/stitch-studio.html` when assessing the newly added shell: that copy is the unchanged baseline. Three.js r128 is loaded by the original HTML from cdnjs and needs connectivity in 3D mode.

Do not assume any TODO renderer works. The first visible proof of integration is a read-only line such as `Beanie / Adult M / 104 sts / 58 rows. Data connected; new previews NOT IMPLEMENTED.` The exact stitch counts depend on user gauge and template. Change the template or gauge and confirm the line changes; that is all the new feature wiring does.

## 2. ZIP contents and what to use

| Path | Purpose | State |
|---|---|---|
| `index.html` | Runnable legacy app with read-only integration shell card and event bridge | Shell wired; new features not implemented |
| `original/stitch-studio.html` | Unmodified source baseline from supplied ZIP | Original v0.3 |
| `original/previews/*.png` | Eleven observed UI screenshot presets | Unmodified evidence |
| `src/scaffold/registry.js` | Registers future modules by name | Minimal shell mechanism |
| `src/scaffold/bridge.js` | Listens for `stitchstudio:plan-updated`; displays current legacy plan summary | Read-only wiring only |
| `src/scaffold/*.js` other | TODO-only adapters and planned feature entrypoints | Deliberately `NOT_IMPLEMENTED` |
| `contracts/*.draft.schema.json` | Draft data contracts for future plan and geometry output | Design only; not validated at runtime |
| `assets/svg/` | Vector sample garment silhouettes, stitches and UI references | Illustrative assets; not generated from plan |
| `docs/REQUIREMENTS.md` | Tracked requirements and detailed acceptance criteria | Authoring contract |
| `docs/ARCHITECTURE.md` | Future data flow, ownership and migration plan | Proposed design |
| `docs/ASSET_GUIDE.md` | Asset index, usage, limitations and licensing provenance | Reference |
| `docs/TEST_PLAN.md` | Manual/automated checks to create and pass | Verification design |
| `docs/ORIGINAL_PREVIEW_ASSESSMENT.md` | Source handoff originally provided | Evidence |
| `docs/PRIOR_RESEARCH_RECOMMENDATIONS.md` | Earlier research plan | Context; not implementation |

## 3. How the wiring works

The original `render()` in `index.html` continues to call `StitchCore.calculate`, `KnitTemplates.buildPlan`, the original preview renderer, and the plan table. **Only after** those existing steps finish, a short addition assigns `window.StitchStudioShellLatest` and dispatches `stitchstudio:plan-updated`. `src/scaffold/bridge.js` reads that snapshot and updates the read-only caption. Initial load is covered by `StitchStudioShellLatest`; subsequent edits are covered by the event. No new module is called or drawn by this bridge. To avoid accidental double rendering, do not wire the TODO renderers into the legacy `updateView()` until individually implemented and tested.

Provisional event `detail` (not a stable public API):

```js
{
  sourceVersion: 'stitch-studio-v0.3',
  plan: /* original KnitTemplates.buildPlan output */,
  gauge: /* r.gauge in stitches/rows per 10 cm */,
  relaxation: /* legacy measurement result */,
  input: /* current form data */,
  templateId: /* selected legacy ID */,
  sizeId: /* selected legacy size ID */
}
```

**Important unit mismatch:** the exposed `r.gauge` fields are per 10 cm. `KnitTemplates.buildPlan` internally receives a per-cm gauge computed from the swatch (`r.input.stitches / r.input.postWidthCm`, likewise rows). When implementing `planAdapter.adaptLegacySnapshot`, normalize explicitly and write regression checks. Do not multiply or divide gauge twice.

**Important geometry mismatch:** a garment's `mainStitches` may be its full circumference (e.g. a hat or top), not the width of a flat panel. Do not directly map it to a front-view row width. The legacy `pieces` list is a construction summary, not yet complete per-row shaping instructions.

## 4. Work order / integration gates

**Gate A: data contract and correctness** - Add a tested adapter from v0.3 plan shape to `GarmentPlan` draft, including cm units, full vs panel circumference, explicit accuracy flags, per-section row ranges and missing-operation warnings. Preserve `StitchCore` without rewriting its relaxation math. Resolve unallocated glove finger stitches before presenting knitting instructions as authoritative.

**Gate B: dimensioned schematics** - Implement garment geometry for hat, sweater and glove first, then tee, socks, scarf, blanket and custom. Each shape must derive from dimensions/rows and respond to gauge, ease and size. Hat halves mirror. Sweater sleeves use their actual approximately 48 cm length in Adult M default, not a fixed canvas fraction. Finger widths and lengths use separate component counts.

**Gate C: chart and fabric divergence** - Keep a symbol/grid chart for following instructions; keep fabric loops/texture and lighting for appearance. Add scale-based drawing and section boundaries, including a full-blanket case. Chart symbols/legend must be verified against knitting standards. Separate illustrated placeholder imagery from knitting data.

**Gate D: inspection and export** - Add a dockable responsive inspector and printable schematic/chart export. Preserve current download button and disclaimer. Mark all generated, unvalidated instructions clearly.

**Gate E: actual 3D garment** - With tested geometry, map texture to low-poly garment pieces via Three.js, release resources on rebuild, and reveal sections/pieces over time. Keep existing motif view as a fallback until parity is proved.

**Gate F: optional mannequin and scanning** - Out of scope for the initial development cycle. Add manual body dimensions first; scan imports require coordinate system, units, privacy and reliability controls; do not assume one photograph is a reliable measurement source.

## 5. Code locations in the original 119 KB HTML

- `StitchCore.calculate` and `generateChart`: gauge calculations / motif generation, around lines 370-477.
- `KnitTemplates.buildPlan`: preset construction math, around line 650; template definitions around 500-645.
- `KnitRender.garmentPath`: hardcoded silhouette shapes, around line 1320.
- `KnitRender.sectionAtRow`: sections only partially represented, around line 1281.
- `KnitRender.paintGrid`: full-piece and close-up stitch drawing, around line 1490.
- UI `currentPlan`, `render`, `paintFabric`, `paintLoupe`, `updateView`: around 1829, 1843, 1970, 2164 and 2257 respectively.
- Existing 3D motif `build3D`: around line 1777; intended to remain a legacy mode until Gate E.

Positions refer to **original** baseline, not the modified shell file. Search by function names, not line numbers.

## 6. What must NOT be mistaken for completed work

No plan-driven silhouette, stitch chart conventions, textile LOD, sections overlay, multi-piece 3D rendering, construction animation, printable chart export, mannequin fitting, photo-to-scan processing, or body fit inference has been implemented. All relevant stub functions deliberately fail if called. The SVG drawings are stand-ins, not generated outputs. The contracts are hypotheses subject to design review. Use a separate feature flag per renderer as implementation progresses; do not silently replace the original functioning views.

## 7. Source protection, rollback and handoff expectations

- Keep `original/stitch-studio.html` and screenshots immutable; compare SHA-256 before a release.
- Implement and test each stub in isolation; use the provisional bridge as an input until a stable, versioned adapter exists.
- Retain the v0.3 starting-plan disclaimer in UI and exports. Never imply a tested knitting pattern.
- Document gauge conversion, shaping assumptions, unsupported operations and template-specific constraints.
- When ready to switch a preview, preserve original as `legacy` mode, test all eight presets, and ensure a simple rollback switch.
- Report `implemented`, `tested`, `not tested`, and `future` separately; screenshots of the shell do not count as renderer verification.
