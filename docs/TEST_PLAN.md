> **Historical planning document.** This document describes the original scaffold / future requirements before the opt-in Stitch Atelier implementation. For current implementation status, see [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) and [`VALIDATION.md`](VALIDATION.md).

# Validation and future test plan

## What the shell itself must pass

1. `original/stitch-studio.html` matches the input ZIP byte-for-byte.
2. All original 11 screenshots exist and match input ZIP bytes.
3. `index.html` contains the original key UI IDs and one read-only bridge emission.
4. All `src/scaffold/*.js` files parse with Node; no TODO renderer is activated.
5. All SVG files parse as XML and all draft contracts parse as JSON.
6. Browser smoke (if available): baseline opens, original v0.3 metrics are populated, changing template changes the scaffold bridge text, no added feature claims completion, 2D preview still appears.
7. ZIP CRC integrity passes.

## Tests required before implementing / enabling features

- **Plan adapter:** unit conversion per 10 cm vs per cm, blocking unchecked, size/ease change, missing component field, no stale plan on invalid input.
- **Geometry:** mirror test for beanie crown; sleeve-length proportion test for tee vs sweater; glove stitch conservation incl. web/pickups; sock geometry visible sections; blanket border dimensions; zero/negative dimensions fail explicitly.
- **Chart:** correct row number direction for flat and round, CYC symbol legend mapping, complex decrease and held stitches flagged if missing from plan, PDF pagination legibility.
- **Fabric:** visually distinct knit/purl/garter/rib at three scales; 5x5 detailed close-up, large Throw 248x396 full piece with no cell-flicker; gauge aspect preserved.
- **Section overlays:** accurate labels and boundaries, no occlusion of critical contours; assistive text.
- **3D:** 3D hat, sweater (4 pieces), socks/gloves, scarf/blanket; camera controls and fallback; WebGL resource cleanup after 100 repaints; benchmark on agreed devices before selecting performance thresholds.
- **Timeline:** heel/gusset and sweater sleeve construction separate; deterministic scrub/replay; honest unsupported state.
- **Exports:** matching dimensions in plan + schematic; symbol key; non-tested disclaimer visible on page one and exported artifact.
- **Accessibility:** keyboard/pointer/touch/zoom 200% and narrow mobile viewport.

Do not mark feature tests PASS while their module is still `NOT_IMPLEMENTED`.
