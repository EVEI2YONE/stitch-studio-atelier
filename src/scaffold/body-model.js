/* body-model: TODO-only module shell. No new feature behavior is implemented.
 * Requirements: FIT-001, FIT-002
 * Future behavior: Deferred only: accept editable dimensions first, then optional scan metadata. Never infer full body measurements from a single photo as ground truth; provide provenance, scale and confidence; do not promise physical drape/fit simulation.
 * Contract notes: docs/ARCHITECTURE.md and docs/REQUIREMENTS.md.
 */
(function (root) {
  'use strict';
  root.StitchStudioScaffold.register('bodyModel', {
    status: 'not-implemented',
    requirements: 'FIT-001, FIT-002',
    loadBodyMeasurements(source, options) {
      // TODO: Deferred only: accept editable dimensions first, then optional scan metadata. Never infer full body measurements from a single photo as ground truth; provide provenance, scale and confidence; do not promise physical drape/fit simulation.
      // TODO: define inputs/outputs and deterministic error cases before implementation.
      throw new Error('NOT_IMPLEMENTED: bodyModel.loadBodyMeasurements');
    }
  });
})(window);
