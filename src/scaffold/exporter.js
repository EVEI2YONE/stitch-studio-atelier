/* exporter: TODO-only module shell. No new feature behavior is implemented.
 * Requirements: EXPORT-001, EXPORT-002
 * Future behavior: Plan a paginated chart with symbols/legend/row numbers and a dimensioned schematic, marking draft/illustrative output. Keep current plain-text download unchanged until validated.
 * Contract notes: docs/ARCHITECTURE.md and docs/REQUIREMENTS.md.
 */
(function (root) {
  'use strict';
  root.StitchStudioScaffold.register('exporter', {
    status: 'not-implemented',
    requirements: 'EXPORT-001, EXPORT-002',
    exportPrintable(garmentPlan, renderSources, options) {
      // TODO: Plan a paginated chart with symbols/legend/row numbers and a dimensioned schematic, marking draft/illustrative output. Keep current plain-text download unchanged until validated.
      // TODO: define inputs/outputs and deterministic error cases before implementation.
      throw new Error('NOT_IMPLEMENTED: exporter.exportPrintable');
    }
  });
})(window);
