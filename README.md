# Stitch Studio – Stitch Atelier preview beta

A working enhancement of the provided **Stitch Studio v0.3 Gauge Lab**. The original calculator, templates, construction-plan table, classic 2D/Rendered Fabric tabs, classic 3D motif demo and text-plan download are preserved. The new **Stitch Atelier** is an explicitly **opt-in, illustrative** visual preview.

## Run the application

1. Extract the ZIP **without flattening**. Keep `src/scaffold/` and other directories beside `index.html`.
2. Open `index.html` in Chrome, Edge or Firefox. If local-file restrictions interfere with the scripts, run a static server from the extracted directory: `python3 -m http.server 8000`, then open `http://localhost:8000/`.
3. At the top of the app, choose **✦ Enable enhanced preview**. The classic app remains available below and can be used when the Atelier is disabled.
4. Pick a template and size, edit gauge or yarn colors. The enhanced preview updates from the original gauge engine's snapshot without recalculating knitting math.

The app is entirely client-side. The existing classic Three.js motif demo uses a CDN; an internet connection and WebGL may be necessary for the original 3D tab. The new Stitch Atelier Canvas view does **not** need Three.js.

## Explore the new preview

- **Textile view:** an entire item composed of measured or explicitly illustrative sections, with adaptive knitted yarn shading. Zoom from 100% to 450%, select a stitch on the garment, and drag to pan after zooming.
- **Stitch microscope:** a docked seven-by-seven close-up with individual knit / purl yarn loops. Switch to a **representative symbol map** (V / •) to examine the same selected region. This symbol map is not a verified knitting chart.
- **Layered pieces:** see and isolate construction components, including sweater sleeves, beanie brim/body/crown, sock heel/gusset/toe, glove fingers and flat-fabric borders. Use the layer-separation slider to fan the 2D surfaces apart visually.
- **Construction in motion:** play, pause, seek, or jump between named construction steps. Future sections remain faint outlines until revealed. Time-lapse is section/piece based because the source does not include all row-by-row operations.
- **On/off controls:** section labels, yarn detail, row guides, and individual piece checkboxes. Save the currently displayed **illustrative** preview to PNG. The original downloadable text plan still works separately.

**Keyboard:** Focus the large garment canvas; arrow keys move the selected stitch, `+`/`-` zoom and `Home` returns selection to the main region. Zoom is handled by visible buttons/slider rather than hijacking ordinary page scrolling. Pointer/touch selection is supported.

## Important distinction: illustration versus knitting instructions

The geometry is sized in physical centimetres from normalized washed / blocked gauge when available. A circular garment's flat front view is **not** a second circumference measurement. The legacy v0.3 plans lack full shaping and join operations for crown decreases, necklines, sweater sleeves, glove finger webs, heel turns and gussets. Those portions are labelled **illustrative / untested**; they must not be used as verified machine-knit instructions or a fit guarantee.

The Atelier is **2.5D Canvas**, not a physical cloth simulation or a true 3D garment mesh. Original 3D Layers / Time-lapse tabs still show a compact motif-box demo. No photo/scan or mannequin/fit pipeline is included. The high-level JSON schemas in `contracts/` remain drafts, not authoritative runtime schemas.

## What is where

| Path | Purpose |
|---|---|
| `index.html` | Running v0.3 app plus the opt-in Atelier UI, plan event and invalid-state propagation |
| `src/scaffold/studio.css` | Responsive warm-paper / mint Atelier styling |
| `src/scaffold/studio-view.js` | Preview controller, zoom/pan/touch/keyboard, layer controls, playback and PNG export |
| `src/scaffold/plan-adapter.js` | Per-10-cm to per-cm adapter; source provenance and uncertainty |
| `src/scaffold/garment-geometry.js` | Measured 2D profiles for eight templates, with honest shaping placeholders |
| `src/scaffold/fabric-renderer.js` | Canvas yarn shading, adaptive LOD, hit testing and microscope |
| `src/scaffold/chart-renderer.js` | Representative knit / purl symbol sample |
| `src/scaffold/construction-timeline.js` | Stage-level sequence and deterministic progress frames |
| `src/scaffold/inspection.js`, `section-overlay.js` | Docked selection and source-backed section names |
| `src/scaffold/garment-3d.js`, `exporter.js`, `body-model.js` | Still-unimplemented future modules; not activated |
| `original/stitch-studio.html` | **Untouched** v0.3 reference for regression comparison |
| `original/previews/` | Eleven original visual baselines |
| `docs/qa-images/` | Screenshots from the enhanced in-memory headless browser smoke |
| `tests/` | Optional Playwright browser smoke and original-vs-enhanced regression scripts |

## Validation and developer notes

Start with `docs/IMPLEMENTATION_NOTES.md`, `docs/VALIDATION.md`, and `docs/REQUIREMENTS.md`. To run the optional automated checks with Python Playwright and Chromium installed:

```bash
python3 tests/regression.py
python3 tests/browser_smoke.py --screenshots
```

The browser tests inline local CSS and scripts because direct navigation to `localhost` / `file://` was blocked in the test environment. They do not test CDN-dependent classic 3D. For full runtime verification, repeat on an ordinary browser where local or static-server navigation is permitted.
