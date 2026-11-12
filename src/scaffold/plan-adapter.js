/* Stitch Studio studio preview adapter. No changes to legacy calculation math.
 * The v0.3 generator does not provide row-level shaping for all garments.
 * Consequently downstream visualizations carry an explicit illustrative status.
 */
(function (root) {
  'use strict';
  const shell = root.StitchStudioScaffold;
  function finitePositive(n) { return Number.isFinite(Number(n)) && Number(n) > 0; }
  function adaptLegacySnapshot(snapshot) {
    if (!snapshot || snapshot.valid === false || !snapshot.plan) {
      return { contractVersion: 'studio-preview-0.1', sourceVersion: (snapshot && snapshot.sourceVersion) || 'stitch-studio-v0.3', valid: false, error: (snapshot && snapshot.error) || 'No valid gauge / construction plan', warnings: [] };
    }
    const p = snapshot.plan, g = snapshot.gauge, input = snapshot.input || {};
    // Source gauge is per TEN cm and rounded to 2 decimals. Normalize it once,
    // then use the original (unrounded) swatch when available so physical-cm
    // dimensions exactly follow the legacy currentPlan() calculations.
    const publishedSts = Number(g && g.finishedStsPer10Cm) / 10;
    const publishedRows = Number(g && g.finishedRowsPer10Cm) / 10;
    const blocked = Boolean(input.useRelaxed);
    const rawSts = Number(input.stitches) / Number(blocked ? input.postWidthCm : input.preWidthCm);
    const rawRows = Number(input.rows) / Number(blocked ? input.postHeightCm : input.preHeightCm);
    const sts = finitePositive(rawSts) && Math.abs(rawSts-publishedSts)<.01 ? rawSts : publishedSts;
    const rows = finitePositive(rawRows) && Math.abs(rawRows-publishedRows)<.01 ? rawRows : publishedRows;
    if (!finitePositive(sts) || !finitePositive(rows) || !finitePositive(p.mainStitches) || !finitePositive(p.mainRows)) {
      return { contractVersion: 'studio-preview-0.1', sourceVersion: snapshot.sourceVersion, valid: false, error: 'Incomplete or invalid plan dimensions', warnings: [] };
    }
    const measured = Boolean(snapshot.relaxation && snapshot.relaxation.measured);
    const round2 = n => Math.round(Number(n) * 100) / 100;
    const circumference = ['hat', 'top', 'sock', 'glove'].includes(p.kind);
    const raw = Array.isArray(p.pieces) ? p.pieces : [];
    const components = raw.map((c, index) => ({
      id: String(c.id || 'piece-' + index), label: String(c.name || c.id || 'Section'),
      sourceStitches: Number(c.stitches) || null, rows: Number(c.rows) || null,
      widthCm: finitePositive(c.widthCm) ? Number(c.widthCm) : null,
      heightCm: finitePositive(c.heightCm) ? Number(c.heightCm) : null,
      shaped: Boolean(c.shaped),
      constructionStatus: c.shaped ? 'illustrative' : 'calculated-unverified',
      sourceNotes: c.notes || '', sections: []
    }));
    const warnings = [];
    if (!measured) warnings.push('Gauge is provisional: no washed / blocked measurement.');
    if (raw.some(c => c.shaped)) warnings.push('Exact row-by-row shaping is not available for every section. Tapers and seam joins are illustrative.');
    if (p.kind === 'glove') {
      const fingers = ['index','middle','ring','pinky'].map(id => raw.find(c => c.id === id));
      const allocated = fingers.reduce((a, c) => a + (c ? Number(c.stitches) || 0 : 0), 0);
      if (allocated !== Number(p.mainStitches)) warnings.push('Finger allocation: ' + allocated + ' of ' + p.mainStitches + ' palm stitches accounted for before pickups / web joins. Join operations are unspecified.');
    }
    if (p.kind === 'sock') warnings.push('Heel turn and gusset pickups lack complete operations: side contours illustrate construction regions only.');
    return {
      contractVersion: 'studio-preview-0.1', sourceVersion: snapshot.sourceVersion || 'stitch-studio-v0.3',
      source: 'legacy-v0.3', valid: true, accuracy: 'illustrative',
      templateId: p.templateId, templateName: p.templateName,
      sizeLabel: p.sizeLabel, kind: p.kind, sourcePlan: p,
      gauge: { stitchesPerCm: sts, rowsPerCm: rows, sourceUnit: 'per-10-cm', normalizedUnit: 'per-cm', state: measured ? 'blocked-measured' : 'provisional' },
      measurements: {
        bodyCm: { circumference: circumference ? Number(input.targetWidthCm) : null },
        finishedCm: { widthOrCircumference: Number(p.knitWidthCm) || null, length: Number(p.finishedHeightCm) || null, isCircumference: circumference },
        panelCm: { flatWidth: circumference ? round2(Number(p.knitWidthCm) / 2) : Number(p.knitWidthCm), source: circumference ? 'circumference projected to front half for illustration' : 'flat fabric width' }
      },
      stitchCount: Number(p.mainStitches), rowCount: Number(p.mainRows),
      fabric: String(input.fabric || 'Stockinette'), repeat: Math.max(1, Number(input.repeat) || 8),
      pattern: String(input.pattern || 'solid'), yarnCount: Math.max(1, Math.min(3, Number(input.yarnCount) || 1)),
      colors: [input.colorA || '#e9d8b8', input.colorB || '#66734f', input.colorC || '#ba7657'],
      construction: components, warnings, disclaimer: p.disclaimer || 'Illustrative starting plan, not a tested knitting pattern.'
    };
  }
  shell.register('planAdapter', { status: 'implemented-preview', requirements: 'BR-002, BR-003', adaptLegacySnapshot });
})(window);
