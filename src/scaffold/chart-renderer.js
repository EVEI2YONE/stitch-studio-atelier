/* Representative stitch-color + knit/purl symbol map only.
 * Source motifs have no full row-level chart operations; the map explicitly
 * does not pretend to be a CYC-standard or knittable instruction chart.
 */
(function(root){
 'use strict';
 function renderChart(canvas,garmentPlan,options){
   const renderer=root.StitchStudioScaffold.get('fabricRenderer');
   if(!renderer || !options || !options.geometry || !options.selected) throw new Error('Geometry and selected stitch required for chart sample');
   renderer.renderLoupe(canvas,options.geometry,options.selected,'chart');
   return {status:'illustrative',symbolLegend:{'V':'knit sample','•':'purl sample'},readDirection:'right-to-left on RS rounds; flat rows alternate',verifiedInstructions:false};
 }
 root.StitchStudioScaffold.register('chartRenderer',{status:'implemented-preview',requirements:'CHART-001 (illustrative sample only)',renderChart});
})(window);
