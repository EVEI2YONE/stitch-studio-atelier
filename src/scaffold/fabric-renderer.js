/* Multi-scale canvas yarn rendering. Deliberately 2.5D: no physical fabric drape.
 * Zoomed stitches use overlapping spline strokes; distant stitches are
 * aggregated for large garments instead of allocating mesh-per-stitch.
 */
(function (root) {
 'use strict';
 const shell = root.StitchStudioScaffold;
 const cache = new Map();
 function tones(hex) {
   if(cache.has(hex)) return cache.get(hex);
   const rgb=root.KnitRender.parseHex(hex);
   const to=(m,a=1)=>root.KnitRender.css(root.KnitRender.shade(rgb,m),a);
   const result={base:to(-.03),light:to(.32),dark:to(-.32),deep:to(-.55),ground:to(-.20),sheen:to(.45,.72)};
   cache.set(hex,result); return result;
 }
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function path(ctx,part) {
   const p=part.points;
   ctx.beginPath();
   p.forEach((xy,i)=> {const x=part.x+xy[0]*part.w, y=part.y+xy[1]*part.h; if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
   ctx.closePath();
 }
 function stitchColor(plan,col,row) {
   const i=root.KnitRender.colorAt(col,row,{pattern:plan.pattern,repeat:plan.repeat,yarnCount:plan.yarnCount});
   return plan.colors[i]||plan.colors[0];
 }
 function styleFor(part,plan,col,row){
   if(part.stitchStyle==='rib')return col%4<2?'knit':'purl';
   if(part.stitchStyle==='edge')return 'purl';
   return root.KnitRender.stitchKind(col,row,plan.fabric,'body');
 }
 // `cw` / `ch` are real world centimetres. Caller has transformed ctx to world cm.
 function knit(ctx,cx,cy,cw,ch,t,kind,detail){
   const hw=cw*.35, hh=ch*.37;
   if(kind==='purl') {
      ctx.fillStyle=t.ground;
      ctx.fillRect(cx-cw*.48,cy-ch*.48,cw*.96,ch*.96);
      ctx.beginPath();ctx.ellipse(cx,cy+ch*.08,hw*1.25,hh*.55,0,0,Math.PI*2);
      ctx.fillStyle=t.deep;ctx.fill();
      ctx.beginPath();ctx.ellipse(cx,cy-ch*.05,hw*1.15,hh*.56,0,0,Math.PI*2);
      ctx.fillStyle=t.base;ctx.fill();
      ctx.beginPath();ctx.ellipse(cx-hw*.1,cy-ch*.14,hw*.74,hh*.18,0,0,Math.PI*2);
      ctx.fillStyle=t.sheen;ctx.fill();
      return;
   }
   // Dark undercrossing and softly tapered yarn legs.
   ctx.strokeStyle=t.deep; ctx.lineCap='round';ctx.lineJoin='round';
   ctx.lineWidth=Math.min(cw*.43,ch*.32);
   ctx.beginPath();ctx.moveTo(cx-hw*.9,cy-hh*1.22);
   ctx.bezierCurveTo(cx-hw*.75,cy-hh*.22,cx-hw*.17,cy+hh*.84,cx,cy+hh*1.04);
   ctx.stroke();
   ctx.strokeStyle=t.dark;ctx.beginPath();ctx.moveTo(cx+hw*.9,cy-hh*1.22);
   ctx.bezierCurveTo(cx+hw*.75,cy-hh*.22,cx+hw*.17,cy+hh*.84,cx,cy+hh*1.04);
   ctx.stroke();
   ctx.lineWidth=Math.min(cw*.30,ch*.24);
   ctx.strokeStyle=t.base;ctx.beginPath();ctx.moveTo(cx-hw*.9,cy-hh*1.23);
   ctx.bezierCurveTo(cx-hw*.75,cy-hh*.16,cx-hw*.22,cy+hh*.65,cx,cy+hh*1.03);
   ctx.stroke();
   ctx.strokeStyle=t.light;ctx.beginPath();ctx.moveTo(cx+hw*.87,cy-hh*1.20);
   ctx.bezierCurveTo(cx+hw*.75,cy-hh*.18,cx+hw*.22,cy+hh*.65,cx,cy+hh*1.04);
   ctx.stroke();
   if(detail) {
     ctx.strokeStyle=t.sheen;ctx.lineWidth=Math.min(cw*.072,ch*.071);
     ctx.beginPath();ctx.moveTo(cx-hw*.85,cy-hh*.98);
     ctx.bezierCurveTo(cx-hw*.74,cy-hh*.13,cx-hw*.25,cy+hh*.65,cx-hw*.075,cy+hh*.86);
     ctx.stroke();
     ctx.beginPath();ctx.moveTo(cx+hw*.82,cy-hh*.96);
     ctx.bezierCurveTo(cx+hw*.74,cy-hh*.16,cx+hw*.25,cy+hh*.65,cx+hw*.08,cy+hh*.86);
     ctx.stroke();
   }
 }
 function rounded(ctx,x,y,w,h,r){
   ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
 }
 function prepare(canvas) {
   const cssW=Math.max(260,Math.round(canvas.clientWidth||700)), cssH=Math.max(250,Math.round(canvas.clientHeight||455));
   const dpr=clamp(root.devicePixelRatio||1,1,2);
   const bw=Math.round(cssW*dpr),bh=Math.round(cssH*dpr);
   if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}
   const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
   return {ctx,cssW,cssH};
 }
 function backdrop(ctx,w,h){
   const bg=ctx.createLinearGradient(0,0,w,h);
   bg.addColorStop(0,'#fcfaf6');bg.addColorStop(.55,'#f4f0e8');bg.addColorStop(1,'#e7eee5');
   ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
   ctx.save();ctx.strokeStyle='rgba(77,98,69,.045)';ctx.lineWidth=1;
   for(let x=0;x<w;x+=26){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
   for(let y=0;y<h;y+=26){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
   ctx.restore();
   const light=ctx.createRadialGradient(w*.25,h*.18,4,w*.45,h*.45,w*.75);
   light.addColorStop(0,'rgba(255,255,255,.49)');light.addColorStop(1,'rgba(255,255,255,0)');
   ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
 }
 function renderFabric(canvas,geometry,options){
   const {ctx,cssW,cssH}=prepare(canvas);
   options=options||{};
   const plan=geometry.sourcePlan;
   backdrop(ctx,cssW,cssH);
   const zoom=clamp(Number(options.zoom)||1,1,4.5);
   // Fit physical cm, leaving space for annotation. Zoom alters ONLY the viewport.
   const baseScale=Math.min((cssW-84)/Math.max(1,geometry.widthCm),(cssH-100)/Math.max(1,geometry.heightCm));
   const scale=baseScale*zoom;
   const ox=(cssW-geometry.widthCm*scale)/2+(options.panX||0);
   const oy=(cssH-geometry.heightCm*scale)/2+(options.panY||0)+5;
   const reveal=options.revealed || Object.fromEntries(geometry.parts.map(p=>[p.id,1]));
   let drawn=0, detailed=0, grouped=0;
   const hitParts=[];
   ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
   geometry.parts.forEach((part,i)=>{
     const amount=clamp(reveal[part.id]??0,0,1);
     if(options.hiddenParts && options.hiddenParts.has(part.id))return;
     if(amount<=0){
       // Future stages are translucent outlines so the construction sequence
       // retains garment context without pretending stitches have been made.
       ctx.save();path(ctx,part);ctx.fillStyle='rgba(108,133,105,.027)';ctx.fill();
       ctx.setLineDash([3/scale,5/scale]);ctx.strokeStyle='rgba(81,116,86,.27)';
       ctx.lineWidth=1.3/scale;ctx.stroke();ctx.restore();
       return;
     }
     // Layer offset is a visual separation, explicitly NOT a physical measurement.
     const spread=options.layerSpread ? clamp(Number(options.layerSpread),0,1)*Math.max(1,geometry.widthCm*.052) : 0;
     const dir= i%2 ? 1 : -1;
     const dx=spread*dir*(.3+i*.16),dy=spread*i*.20;
     ctx.save();ctx.translate(dx,dy);
     ctx.save();path(ctx,part);
     ctx.shadowColor='rgba(28,40,27,.29)';ctx.shadowBlur=15/scale;ctx.shadowOffsetX=2.5/scale;ctx.shadowOffsetY=9/scale;
     ctx.fillStyle=tones(plan.colors[0]).ground;ctx.fill();ctx.restore();
     // Full piece must be clipped to its measurable (or marked illustrative) outline.
     ctx.save();path(ctx,part);ctx.clip();
     ctx.beginPath();
     const revealHeight=part.h*amount;
     const revealY=part.readDirection==='top-down'?part.y:part.y+part.h-revealHeight;
     ctx.rect(part.x,revealY,part.w,revealHeight);ctx.clip();
     const cellW=part.w/Math.max(1,part.stitches),cellH=part.h/Math.max(1,part.rows);
     const pixelMin=Math.min(cellW,cellH)*scale;
     const total=part.stitches*part.rows;
     const stride= (pixelMin<1.25)? Math.max(1,Math.ceil(2.15/Math.max(.02,pixelMin))) : 1;
     const doLoops=pixelMin>=7 && total<50000 && options.showStitches!==false;
     const mid=pixelMin>=2 && options.showStitches!==false;
     // Dark valleys make the knitted texture feel interlocked even in small previews.
     const t0=tones(plan.colors[0]);
     ctx.fillStyle=t0.ground;ctx.fillRect(part.x,part.y,part.w,part.h);
     for(let y=0;y<part.rows;y+=stride){
       // In the visual, top is the largest stitch-row value.
       const r=part.rowOrigin+part.rows-1-y;
       const cy=part.y+(y+.5)*cellH;
       if(cy<revealY-cellH||cy>revealY+revealHeight+cellH)continue;
       for(let x=0;x<part.stitches;x+=stride){
         const c=x+part.stitchOrigin;
         const col=stitchColor(plan,c,r);
         const t=tones(col);
         const px=part.x+x*cellW,py=part.y+y*cellH;
         if(doLoops){
           ctx.fillStyle=t.ground;ctx.fillRect(px,py,cellW+.02,cellH+.02);
           knit(ctx,px+cellW*.5,py+cellH*.5,cellW,cellH,t,styleFor(part,plan,c,r),pixelMin>=12);
           detailed++;
         } else if(mid){
           ctx.fillStyle=t.ground;ctx.fillRect(px,py,cellW+.04,cellH+.04);
           ctx.fillStyle=t.base;ctx.beginPath();
           if(styleFor(part,plan,c,r)==='purl'){
             ctx.ellipse(px+cellW*.5,py+cellH*.5,cellW*.34,cellH*.19,0,0,Math.PI*2);
           }else{
             ctx.moveTo(px+cellW*.15,py+cellH*.14);ctx.lineTo(px+cellW*.5,py+cellH*.84);ctx.lineTo(px+cellW*.85,py+cellH*.14);ctx.lineTo(px+cellW*.63,py+cellH*.14);ctx.lineTo(px+cellW*.5,py+cellH*.51);ctx.lineTo(px+cellW*.38,py+cellH*.14);
           }
           ctx.closePath();ctx.fill();
           grouped++;
         } else {
           ctx.fillStyle=t.base;ctx.fillRect(px,py,Math.min(cellW*stride+cellW*.09,part.x+part.w-px),Math.min(cellH*stride+cellH*.09,part.y+part.h-py));grouped++;
         }
       }
     }
     // Directional shallow folds/volume are intentionally decorative, not drape simulation.
     const surface=ctx.createLinearGradient(part.x,part.y,part.x+part.w,part.y);
     surface.addColorStop(0,'rgba(18,31,25,.15)');surface.addColorStop(.16,'rgba(255,255,255,.05)');surface.addColorStop(.48,'rgba(255,255,255,.08)');surface.addColorStop(.83,'rgba(40,55,37,.04)');surface.addColorStop(1,'rgba(23,35,28,.23)');
     ctx.fillStyle=surface;ctx.fillRect(part.x,part.y,part.w,part.h);
     if(options.showGuides){
       ctx.strokeStyle='rgba(255,255,255,.50)';ctx.lineWidth=.8/scale;ctx.setLineDash([4/scale,5/scale]);
       const step=Math.max(1,Math.round(part.rows/10));
       for(let rr=step;rr<part.rows;rr+=step){const yy=part.y+(rr/part.rows)*part.h;ctx.beginPath();ctx.moveTo(part.x,yy);ctx.lineTo(part.x+part.w,yy);ctx.stroke();}
       ctx.setLineDash([]);
     }
     ctx.restore();
     path(ctx,part);ctx.strokeStyle=part.back?'rgba(51,69,54,.34)':'rgba(40,58,43,.55)';ctx.lineWidth=Math.max(.5/scale,part.w*.005);ctx.stroke();
     ctx.restore();
     hitParts.push({part,dx,dy,amount}); drawn++;
   });
   ctx.restore();
   // Annotate only named source sections, using the outside/bottom dock instead of covering yarn.
   ctx.save();
   ctx.font='700 11px ui-sans-serif,system-ui,sans-serif';ctx.textBaseline='middle';
   ctx.fillStyle='#46634e';ctx.fillText('STUDIO / TEXTILE STUDY',18,23);
   ctx.font='600 10px ui-sans-serif,system-ui,sans-serif';ctx.fillStyle='#6e806c';
   ctx.fillText('ILLUSTRATIVE · NOT A TESTED PATTERN',18,42);
   ctx.textAlign='right';ctx.fillStyle='#465b4b';
   ctx.fillText((zoom*100).toFixed(0)+'%  ·  '+geometry.widthCm.toFixed(1)+' × '+geometry.heightCm.toFixed(1)+' cm viewport bounds',cssW-17,cssH-16);
   if(options.showSections){
     ctx.font='650 10px ui-sans-serif,system-ui,sans-serif';
     hitParts.forEach(({part,dx,dy},i)=>{
       if(part.w*scale<44||part.h*scale<17)return;
       const cx=ox+(part.x+part.w/2+dx)*scale,cy=oy+(part.y+part.h/2+dy)*scale;
       const text=part.label.length>17?part.label.slice(0,16)+'…':part.label;
       const tw=ctx.measureText(text).width;
       rounded(ctx,cx-tw/2-9,cy-10,tw+18,20,7);ctx.fillStyle='rgba(255,253,246,.92)';ctx.fill();
       ctx.strokeStyle='rgba(73,107,77,.24)';ctx.lineWidth=1;ctx.stroke();
       ctx.textAlign='center';ctx.fillStyle='#2c4935';ctx.fillText(text,cx,cy+.5);
     });
   }
   if(options.selected){
      const part=geometry.parts.find(p=>p.id===options.selected.partId);
      if(part){
         const hp=hitParts.find(h=>h.part.id===part.id);
         if(hp){
           const xx=ox+(part.x+hp.dx+(options.selected.col+.5)*part.w/part.stitches)*scale;
           const yy=oy+(part.y+hp.dy+(part.rows-options.selected.row-.5)*part.h/part.rows)*scale;
           if(xx>8&&yy>8&&xx<cssW-8&&yy<cssH-8){
             ctx.strokeStyle='rgba(255,255,255,.93)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(xx,yy,5.5,0,Math.PI*2);ctx.stroke();
             ctx.strokeStyle='#b46e4d';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(xx-12,yy);ctx.lineTo(xx-5,yy);ctx.moveTo(xx+5,yy);ctx.lineTo(xx+12,yy);ctx.moveTo(xx,yy-12);ctx.lineTo(xx,yy-5);ctx.moveTo(xx,yy+5);ctx.lineTo(xx,yy+12);ctx.stroke();
           }
         }
      }
   }
   ctx.restore();
   return {cssW,cssH,scale,ox,oy,hitParts,renderedParts:drawn,detailStitches:detailed,aggregatedCells:grouped,levelOfDetail:detailed?'loops':grouped?'tiles':'base'};
 }
 function pointInPoly(x,y,part){
   const pts=part.points;let inside=false;
   for(let i=0,j=pts.length-1;i<pts.length;j=i++){
     const a=pts[i],b=pts[j];const yi=a[1],yj=b[1];
     if(((yi>y)!==(yj>y))&&(x<(b[0]-a[0])*(y-yi)/(yj-yi)+a[0]))inside=!inside;
   }
   return inside;
 }
 function hitTest(info,x,y){
   if(!info)return null;
   const X=(x-info.ox)/info.scale,Y=(y-info.oy)/info.scale;
   for(let j=info.hitParts.length-1;j>=0;j--){
     const {part,dx,dy,amount}=info.hitParts[j];
     const u=(X-part.x-dx)/part.w,v=(Y-part.y-dy)/part.h;
     if(u<0||u>1||v<0||v>1||!pointInPoly(u,v,part))continue;
     if(part.readDirection==='top-down'?v>amount:v<1-amount)continue;
     const col=clamp(Math.floor(u*part.stitches),0,part.stitches-1);
     const row=clamp(part.rows-1-Math.floor(v*part.rows),0,part.rows-1);
     return {partId:part.id,col,row};
   }
   return null;
 }
 function renderLoupe(canvas,geometry,selected,mode){
   const {ctx,cssW:w,cssH:h}=prepare(canvas);
   ctx.fillStyle='#f9f7f0';ctx.fillRect(0,0,w,h);
   if(!geometry||!selected)return;
   const part=geometry.parts.find(p=>p.id===selected.partId);if(!part)return;
   const plan=geometry.sourcePlan;
   const count=7;
   const margin=30;
   // Texture close-up keeps the measured stitch aspect from gauge.
   const physH=1/plan.gauge.rowsPerCm,physW=1/plan.gauge.stitchesPerCm;
   const cell=Math.min((w-2*margin)/count,(h-2*margin)/count);
   const ratio=physW/physH;
   const cw=ratio>1?cell:cell*ratio,ch=ratio>1?cell/ratio:cell;
   const ox=(w-count*cw)/2,oy=(h-count*ch)/2;
   for(let iy=0;iy<count;iy++)for(let ix=0;ix<count;ix++){
     const col=selected.col+ix-3,row=selected.row+3-iy;
     const x=ox+ix*cw,y=oy+iy*ch;
     if(col<0||row<0||col>=part.stitches||row>=part.rows){ctx.fillStyle='#eeeae0';ctx.fillRect(x+.5,y+.5,cw-.8,ch-.8);continue;}
     const sourceRow=part.rowOrigin+row, sourceCol=part.stitchOrigin+col;
     const hex=stitchColor(plan,sourceCol,sourceRow);
     ctx.fillStyle=tones(hex).ground;ctx.fillRect(x,y,cw+.3,ch+.3);
     if(mode==='chart') {
       ctx.fillStyle=tones(hex).base;ctx.fillRect(x+1,y+1,cw-2,ch-2);
       ctx.fillStyle='#26352c';ctx.font='700 '+Math.min(21,cw*.6)+'px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';
       ctx.fillText(styleFor(part,plan,sourceCol,sourceRow)==='purl'?'•':'V',x+cw*.5,y+ch*.53);
       ctx.strokeStyle='rgba(44,60,47,.20)';ctx.lineWidth=.7;ctx.strokeRect(x+.3,y+.3,cw-.6,ch-.6);
     } else {
       const kind=styleFor(part,plan,sourceCol,sourceRow);
       if(kind==='purl')root.KnitRender.drawPurl(ctx,x+cw*.5,y+ch*.5,Math.min(cw,ch)*.82,hex);
       else root.KnitRender.drawKnitV(ctx,x+cw*.5,y+ch*.5,Math.min(cw,ch)*.82,hex);
     }
   }
   ctx.strokeStyle='#b3694e';ctx.lineWidth=2;ctx.strokeRect(ox+3*cw+1,oy+3*ch+1,cw-2,ch-2);
   ctx.font='600 10px ui-sans-serif,system-ui,sans-serif';ctx.fillStyle='#526e53';ctx.textAlign='left';
   ctx.fillText(mode==='chart'?'SYMBOL MAP · representative motif':'YARN STRUCTURE · close study',12,17);
 }
 shell.register('fabricRenderer',{status:'implemented-preview',requirements:'FABRIC-001..004',renderFabric,renderLoupe,hitTest,stitchColor,styleFor});
})(window);
