# Asset guide: original vs added SVG files

## Provenance and limitations

`original/previews/*.png` are 11 exact source-package screenshots, useful for visual regression. `original/stitch-studio.html` also contains built-in inline icons for eight template cards, still used by the legacy app. All SVG files under `assets/svg` in this handoff were newly authored for this handoff as conceptual references, using the project's warm paper/mint/green/rust palette. They are not imported third-party assets, fashion flats with verified measurements, or stitch-standard symbol definitions. There are no external image files or font dependencies.

## Index

Garment schematics (200 x 160 SVG):
- `garments/custom.svg` - rectangle reference
- `garments/scarf.svg` - scarf reference
- `garments/blanket.svg` - frame and border reference
- `garments/beanie.svg` - symmetric hat concept
- `garments/shirt.svg` - tee concept
- `garments/sweater.svg` - visibly long hanging sleeves concept
- `garments/socks.svg` - side-view sock concept
- `garments/gloves.svg` - attached glove finger concept

Stitch style concepts (200 x 160 SVG):
- `stitches/stockinette.svg` - overlapping V loop concept
- `stitches/rib.svg` - contracted column concept
- `stitches/purl.svg` - purl bump concept
- `stitches/lace-eyelet.svg` - optional eyelet concept

UI/reference concepts (200 x 160 SVG):
- `ui/body-outline.svg` - generic, uncalibrated avatar silhouette
- `ui/ruler.svg` - schematic measurement cue
- `ui/loupe.svg` - loupe / inspection cue

## How to use

The shell uses four image tags as **preview/reference illustrations**, not visual rendering output. When implementing actual schematics, replace static asset selection with generated SVG paths bound to the garment geometry model. Do not multiply, distort or relabel the static SVG files as if they were measured garment views.

The stitch-style SVGs may help prototype shader/tile visual vocabulary, but should not be used as knitting chart symbols: use Craft Yarn Council chart definitions for chart mode. If a production designer modifies these, keep a separate asset provenance record and ensure resize, stroke contrast, ARIA labels and small-screen legibility.

Suggested future output names:
- `generated-schematic.svg` created from measured geometry;
- `chart-symbols.svg` sourced from documented knitting symbol contract;
- `fabric-atlas` generated raster/canvas texture for display;
- `garment-model.glb` only after model export is implemented and verified.

None of those generated outputs exist in this package.
