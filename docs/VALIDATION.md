# Stitch Atelier preview-beta verification record

**Date:** November 2026. **Base:** supplied Stitch Studio v0.3 source and scaffold package. See `docs/VALIDATION_SCAFFOLD.md` for the untouched earlier scaffold report.

## Verified in a headless Chromium in-memory page

- **PASS:** `index.html` inline scripts and implemented scaffold scripts parse. Original baseline page and enhanced page both initialize and compute.
- **PASS:** Legacy output regression for all 8 presets (`custom`, `scarf`, `blanket`, `beanie`, `shirt`, `sweater`, `socks`, `gloves`). For each preset the original and enhanced app produce **identical** stitches, rows, width, height, repeat text, status, and displayed formula descriptions.
- **PASS:** Opt-in Studio activation; live template updates; all 8 templates produce non-empty valid geometry parts and labeled construction stages without console/page errors.
- **PASS:** Adult M beanie's crown outline is left/right mirrored to floating-point tolerance. Adult M sweater preview sleeve height equals its source `sleeveRows / rowsPerCm`.
- **PASS:** Source-driven section timeline steps exist for beanie, tops, sock and glove. Sweater layer separation, seek and keyboard arrow selection operate in headless browser.
- **PASS:** Deliberately setting negative swatch stitches clears the experimental garment geometry and displays a visible invalid-state message; restoring a positive value restores the preview.
- **PASS:** 390px mobile viewport has no material horizontal page overflow (measured 1px, within a 2px tolerance). Responsive inspector and controls render; screenshots captured.
- **PASS:** Throw blanket (248 × 396 source stitches/rows), plus Queen preset (448 × 608) updated and rendered with no headless page errors. A Queen change settled within about a second in the local test environment, including scripted waiting; this is **not** a device-independent FPS/performance guarantee.
- **PASS:** Preview includes opt-in label, illustrative/untested markers, current blocked/provisional gauge, source-piece stages, and the classic v0.3 preview remains present.

## Visual evidence

Captured after rendering real Canvas elements (not generated mockups):

- `qa-images/atelier-custom-desktop.png`
- `qa-images/atelier-beanie-desktop.png`
- `qa-images/atelier-blanket-desktop.png`
- `qa-images/atelier-sweater-desktop.png`
- `qa-images/atelier-socks-desktop.png`
- `qa-images/atelier-gloves-desktop.png`
- `qa-images/atelier-sweater-mobile.png`

## Not verified, or not claimed

- **Direct local-server and `file://` browser navigation:** The test Chromium blocks such navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. We therefore used Playwright `page.set_content` with local script/CSS inlining and verified the actual Canvas rendering, data lifecycle and responsive DOM. This is *not* an end-to-end server or asset loading verification.
- **Classic Three.js 3D:** External CDN script was intentionally omitted from the in-memory smoke. The legacy motif box view is not a real garment mesh; its functionality was not retested here.
- **Physically accurate garment or exact knitting chart:** Missing source-level shaping, joining, pickup and heel operations prevent claiming those. The symbol microscope is illustrative.
- **3D garment, mannequin/scan/fit, printable chart/PDF and real textiles:** Not implemented or not verified. The preview PNG is not a print-validated schematic.
- **Manual real-device, accessibility contrast auditing, long-run resource soak, real knitting:** Not run. The use of arrow keys and mobile layout in headless Chromium does not certify WCAG or actual device ergonomics.

## Test reproducibility

```bash
python3 tests/regression.py
python3 tests/browser_smoke.py --screenshots
```

The package preserves the original v0.3 source and eleven original screenshots under `original/` for visual comparison and rollback. All present module files are ES5-compatible classic browser scripts (plus modern syntax already present in baseline) and require no bundler.
