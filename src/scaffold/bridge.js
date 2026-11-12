/* Legacy snapshot listener. Calculation remains in the unchanged v0.3 engine. */
(function (root) {
  'use strict';
  const shell = root.StitchStudioScaffold;
  const statusNode = document.getElementById('scaffoldCurrentPlan');
  function showPlan(snapshot) {
    shell.latestLegacySnapshot = snapshot;
    if (!statusNode) return;
    const plan = snapshot && snapshot.plan;
    if (!plan) {
      statusNode.textContent = 'Preview cleared until the input is valid.';
      return;
    }
    // Compatibility caption for older scaffold markup.
    statusNode.textContent = plan.templateName + ' / ' + plan.sizeLabel +
      ' / ' + plan.mainStitches + ' sts / ' + plan.mainRows +
      ' rows. Optional Stitch Atelier receives this plan.';
  }
  root.addEventListener('stitchstudio:plan-updated', function (ev) {
    showPlan(ev.detail);
  });
  if (root.StitchStudioShellLatest) showPlan(root.StitchStudioShellLatest);
  else showPlan(null);
  // TODO BR-004: add explicit lifecycle teardown and contract validation.
})(window);
