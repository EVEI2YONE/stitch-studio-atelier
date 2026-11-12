# Stitch Atelier – implementation handoff

**Scope:** additive, opt-in first pass extending Stitch Studio v0.3. This supersedes the status of the **original scaffold** in `docs/DEVELOPER_HANDOFF.md` and `docs/ORIGINAL_SOURCE_INTEGRATION_HANDOFF.md`. Those files have been preserved as historical source context; they still describe the *pre-implementation* TODO state.

## What changed

- `index.html` now has the full-width opt-in Stitch Atelier user interface and loads `studio.css` and `studio-view.js`. The original v0.3 calculator, templates, preview and download functions remain in place. A successful snapshot includes `valid:true`; a failed calculation dispatches `valid:false` with the error so experimental geometry cannot become stale.
- `planAdapter.adaptLegacySnapshot` implements a `studio-preview-0.1` wrapper. The legacy gauge's `finishedStsPer10Cm` / `finishedRowsPer10Cm` are divided by 10 **once**; the unrounded source swatch is then used where consistent to match the legacy planner precisely, preserving `sourceVersion`, measurement origin, blocked/provisional state, unsupported shaping warnings, garment circumference versus displayed flat projection, source pieces, yarn/pattern settings and a visible disclaimer.
- `garmentGeometry.buildGeometry` converts supported pieces to physical-cm sections with local stitch/row dimensions. Hats use a mirrored crown outline, tops use a separately sourced sleeve length and neckline illustration, gloves use finger-specific rows, socks show labeled heel/gusset/toe regions, flat pieces preserve swatch aspect and blankets have source-backed border stages. **Shape outlines remain illustrative where the legacy plan does not specify operations.**
- `fabricRenderer.renderFabric` draws multiscale textile shading in a single 2D Canvas, with detailed loop splines at sufficient px/stitch and aggregated colors at distant zoom. It clips texture to each piece and limits draw density on giant blankets. Material shading is visual, not a yarn-level physics simulation. It returns a viewport transform for piece/stitch hit tests.
- `constructionTimeline.createTimeline` generates deterministic stage-reveal frames from source pieces (hat brim/body/crown; sweater back/front/sleeves/neckband; sock cuff/leg/heel/gusset/foot/toe; glove cuff/palm/thumb/fingers). It does **not** fabricate exact row-level shaping operations.
- `inspection.createInspector` and the UI provide a docked, touch / pointer / keyboard-accessible per-stitch selection. The microscope renders seven-by-seven stitches as yarn loops or representative knit/purl symbols. `sectionOverlay` exposes source-backed section labels for labels/layer toggles.
- Current PNG export is only an illustrative image (embedded disclaimer). The original text-plan export is unchanged. The TODO printable chart/PDF exporter remains intentionally unimplemented.

## Data and geometry cautions

1. The main v0.3 garment `mainStitches` field is often a **circumference**. The Atelier uses a half-circumference *front-facing projection* when appropriate; this is labeled, not treated as a replacement pattern instruction.
2. The hat crown outline is a symmetric curved illustration **not** an actual per-round stitch-count taper. Its exact decreases are not known. The same distinction applies to sock heel turns, gusset pickups, neck shaping and finger joins.
3. Tops use `sleeveRows / rowsPerCm` for sleeve height. A shared sleeve piece has `make 2` semantics and is shown twice. The exposed neckband is a small visual ring and cannot stand in for a verified pickup chart.
4. The glove's finger stitch allocations can be nonconserving before pickups/web joins. The adapter reports the discrepancy rather than silently making the counts reconcile.
5. The material view chooses its LOD in **rendered pixels per stitch** and aggregates very dense patterns; there is no giant per-stitch 3D mesh. Avoid treating the fitted viewport bounds as garment width/finished measurements.
6. Although some parts are planar rectangles and polygons, the surface type is deliberately `illustrative`. The rough 2D flat faces do not imply full 3D drape or fit accuracy.

## Status of scaffold methods

| Module | Status / boundary |
|---|---|
| `planAdapter` | Runtime adapter implemented for preview; draft canonical JSON schema is not enforced |
| `garmentGeometry` | Physical-cm illustrative surfaces implemented; not a row-accurate garment CAD system |
| `fabricRenderer` | Multiscale Canvas textile shading, loupe and hit testing implemented |
| `chartRenderer` | Illustrative 7×7 stitch symbol sample, **not** an executable chart or CYC validation |
| `sectionOverlay` | Source-backed section-list metadata implemented; visual annotation drawn by fabric renderer |
| `inspection` | Selected stitch selection/movement and accessible dock implemented; no full CAD transforms |
| `constructionTimeline` | Piece/section time-lapse implemented; missing row operations flagged |
| `garment3D` | **Not implemented**; classic motif 3D still fallback |
| `exporter` | **Not implemented**; preview PNG is from the Atelier UI, legacy plan export untouched |
| `bodyModel` | **Deferred**; scans/fit unsupported |

## Suggested next development gates

1. Introduce a canonical shaping operation ledger (increase/decrease per row, held/picked-up stitches, heel turns). Verify stitch conservation before generating exact silhouettes.
2. Move the representative 7×7 chart to a true row/stitch operation chart with validated directional semantics, symbols, legends, crop coordinates and print pagination.
3. Create low-poly physically dimensioned garment surfaces and UV textures in `garment3D`, with WebGL fallback, disposal, and camera controls. Do not convert the v0.3 motif boxes into an alleged accurate knit garment.
4. Consider wide-chart PNG/PDF print output after source operations and page-level disclaimers can be validated. Keep old downloads until then.
5. Test actual Android touch input, mobile CPU and hardware at multiple DPRs; instrument long-duration playback and forced WebGL failures.

## Quick test commands

```bash
python3 tests/regression.py
python3 tests/browser_smoke.py --screenshots
```

No new runtime library was installed. Browser tests require Python Playwright and Chromium and are intentionally in-memory because ordinary navigation to the local server was blocked in the test environment.
