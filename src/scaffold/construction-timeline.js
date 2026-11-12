/* Construction stages, not invented continuous knitting instructions.
 * One stage can contain multiple visible sections; scrub is deterministic.
 */
(function(root){
 'use strict';
 function createTimeline(geometry){
   if(!geometry || !Array.isArray(geometry.stages))throw new Error('Geometry with construction stages required');
   const stages=geometry.stages;
   function frame(progress){
     const p=Math.max(0,Math.min(1,Number(progress)||0));
     const count=stages.length;
     const raw=p*count;
     const current=p===1?count-1:Math.min(count-1,Math.floor(raw));
     const within=p===1?1:raw-current;
     const revealed={};geometry.parts.forEach(part=>{revealed[part.id]=0;});
     stages.forEach((s,i)=>s.partIds.forEach(id=>{if(id in revealed)revealed[id]=i<current?1:i===current?within:0;}));
     return {progress:p,stepIndex:current,stepCount:count,stepProgress:within,stage:stages[current],revealed,completed:p===1};
   }
   return {stages:stages.map(s=>({...s})),frame};
 }
 root.StitchStudioScaffold.register('constructionTimeline',{status:'implemented-preview',requirements:'TIME-001, TIME-002 (section-level illustrations)',createTimeline});
})(window);
