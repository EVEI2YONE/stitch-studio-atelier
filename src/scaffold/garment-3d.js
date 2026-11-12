/* garment-3d: TODO-only module shell. No new feature behavior is implemented.
 * Requirements: 3D-001, 3D-002, 3D-003
 * Future behavior: Create assembled low-poly pieces and map yarn textures using Three.js r128. Keep real stitch counts in mapping. Explicitly dispose resources on re-render. Retain old motif view until new garment preview passes acceptance checks.
 * Contract notes: docs/ARCHITECTURE.md and docs/REQUIREMENTS.md.
 */
(function (root) {
  'use strict';
  root.StitchStudioScaffold.register('garment3D', {
    status: 'not-implemented',
    requirements: '3D-001, 3D-002, 3D-003',
    renderGarment(container, garmentGeometry, textureAtlas, options) {
      // TODO: Create assembled low-poly pieces and map yarn textures using Three.js r128. Keep real stitch counts in mapping. Explicitly dispose resources on re-render. Retain old motif view until new garment preview passes acceptance checks.
      // TODO: define inputs/outputs and deterministic error cases before implementation.
      throw new Error('NOT_IMPLEMENTED: garment3D.renderGarment');
    }
  });
})(window);
