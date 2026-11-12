> **Historical planning document.** This document describes the original scaffold / future requirements before the opt-in Stitch Atelier implementation. For current implementation status, see [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) and [`VALIDATION.md`](VALIDATION.md).

# Architecture - proposed, not implemented

## Legacy-to-next data path

```
existing HTML inputs
  -> StitchCore.calculate()              [EXISTS - unchanged]
  -> KnitTemplates.buildPlan()           [EXISTS - unchanged]
  -> stitchstudio:plan-updated event     [NEW - read-only bridge]
  -> planAdapter.adaptLegacySnapshot()   [TODO - versioned contract]
  -> GarmentPlan (draft schema)           [TODO - true source of truth]
  -> garmentGeometry.buildGeometry()     [TODO - per-piece shapes]
  -> chartRenderer / fabricRenderer      [TODO - separate renderers]
  -> garment3D / constructionTimeline    [TODO - after geometry tests]
  -> inspector / exporter                [TODO - shared coordinates]
  -> bodyModel                           [DEFERRED - optional]
```

`index.html` still runs the legacy rendering path unchanged. All arrows after the read-only event are **planned**, not executing.

## Contract details

- `sourceVersion` identifies legacy data; a new `contractVersion` identifies canonical structure, independent of UI mode.
- Gauge: preserve stitches-per-cm and rows-per-cm plus blocked/provisional state. Legacy summary fields use per-10-cm units and must be normalized exactly once.
- Measurements: separate body, finished garment and flat panel dimensions. Avoid treating head circumference, body circumference or sleeve circumference as flattened width.
- Components: named `front`, `back`, `leftSleeve`, `rightSleeve`, `crown`, `brim`, `heel`, `gusset`, `toe`, `thumb`, individual glove fingers, etc. Each component has sections, row progression, count constraints and explicit unknown operations.
- Geometry: physical cm coordinates are canonical. Viewport fitting is one-way projection, not a modifier of garment dimensions. No implicit stretched cell ratio.
- Textile: yarn color/pattern references stitch coordinates and geometry surfaces; a cache can be rebuilt when pattern or zoom changes.
- Quality metadata: `illustrative` or `calculated-unverified`; do not silently imply tested pattern status.

## Future mode integration

The first working new renderer should be introduced as an explicit opt-in experimental view beside legacy 2D and rendered preview. Do NOT edit `KnitRender.garmentPath` and also add competing geometry in a second place; choose one source of truth before switching default. Once parity and correctness are verified, route all views through the plan adapter and retire hardcoded clipping paths safely.

Before enabling a new module: define function inputs/outputs, errors, cleanup, unit handling, stale-data behavior, feature flags, and no-WebGL fallback; implement deterministic test fixtures. Do not enable its button while its module still throws `NOT_IMPLEMENTED`.

## Extension module ownership

| Stub | Planned owner / contract |
|---|---|
| `plan-adapter.js` | Transform and validate legacy plan snapshots; explicit missing operations |
| `garment-geometry.js` | Physical piece shapes, row profiles, schematic coordinates |
| `chart-renderer.js` | Standards-aligned knitting chart symbols and legend |
| `fabric-renderer.js` | Scale-adaptive yarn visual shading and texture atlas |
| `section-overlay.js` | Labeled section bounds shared by all previews |
| `garment-3d.js` | Low-poly meshes, UVs, disposal and camera |
| `construction-timeline.js` | Piece/section-aware sequence; scrubbing contracts |
| `inspection.js` | Loupe, hit testing, accessibility and responsive placement |
| `exporter.js` | Printable charts and dimensioned schematics |
| `body-model.js` | Future measurement input/scan provenance, no fitting yet |

No third-party knit CAD engine is installed. Existing Three.js is a legacy CDN dependency; the extension shell does not add runtime libraries.
