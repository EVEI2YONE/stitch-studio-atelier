/* Keyboard/touch compatible mapping for the docked stitch inspector. */
(function(root){
 'use strict';
 function createInspector(geometry){
   let selected=null;
   function select(next){
     if(!next)return selected;
     const part=geometry.parts.find(p=>p.id===next.partId);
     if(!part)return selected;
     selected={partId:part.id,col:Math.max(0,Math.min(part.stitches-1,Math.round(next.col))),row:Math.max(0,Math.min(part.rows-1,Math.round(next.row)))};
     return selected;
   }
   function move(dx,dy){
     if(!selected)return null;
     return select({...selected,col:selected.col+dx,row:selected.row+dy});
   }
   function initial(){
      const preferred=geometry.parts.find(p=>p.id==='front'||p.id==='hat-body'||p.id==='field'||p.id==='fabric'||p.id==='palm'||p.id==='foot')||geometry.parts[0];
      return select({partId:preferred.id,col:Math.floor(preferred.stitches/2),row:Math.floor(preferred.rows/2)});
   }
   function describe(){
     if(!selected)return 'No stitch selected';
     const part=geometry.parts.find(p=>p.id===selected.partId);
     return part.label+' · stitch '+(part.stitches-selected.col)+' of '+part.stitches+' (right to left) · row '+(part.rowOrigin+selected.row+1)+' · '+geometry.sourcePlan.gauge.state;
   }
   initial();return {get selected(){return selected;},select,move,initial,describe};
 }
 root.StitchStudioScaffold.register('inspection',{status:'implemented-preview',requirements:'INSPECT-001, INSPECT-002',createInspector});
})(window);
