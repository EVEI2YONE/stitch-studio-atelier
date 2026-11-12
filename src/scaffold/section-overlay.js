/* Source-backed construction captions and states for the live preview.
 * Visual labels are drawn outside of detail swatches by fabric-renderer.
 */
(function(root){
 'use strict';
 function drawSections(canvas, garmentPlan, geometry,options){
   return geometry.parts.filter(p=>!options || !options.hiddenParts || !options.hiddenParts.has(p.id))
     .map(p=>({id:p.id,name:p.label,rows:p.rows,stitches:p.stitches,status:p.shaping?'illustrative shaping':'gauge-derived dimensions'}));
 }
 root.StitchStudioScaffold.register('sectionOverlay',{status:'implemented-preview',requirements:'SECT-001, SECT-002 (source-backed section list)',drawSections});
})(window);
