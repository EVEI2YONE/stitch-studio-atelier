/* Optional Stitch Atelier interface. The v0.3 chart, 3D motif and downloader
 * are not replaced; this view consumes the read-only plan snapshot.
 */
(function(root){
 'use strict';
 const shell=root.StitchStudioScaffold;
 const $=id=>document.getElementById(id);
 const adapter=shell.get('planAdapter'),geometryModule=shell.get('garmentGeometry');
 const fabric=shell.get('fabricRenderer'),chart=shell.get('chartRenderer');
 const timelineModule=shell.get('constructionTimeline'),inspection=shell.get('inspection');
 const sectionOverlay=shell.get('sectionOverlay');
 const state={enabled:false,geometry:null,timeline:null,inspector:null,mode:'fabric',loupe:'yarn',zoom:1,
   progress:1,showSections:true,showGuides:false,showStitches:true,layerSpread:.48,hiddenParts:new Set(),
   panX:0,panY:0,lastRender:null,drag:null,playTimer:null,raf:0};
 const nformat=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:1});
 function error(message){
   stop();state.geometry=null;state.timeline=null;state.inspector=null;state.lastRender=null;
   $('studioMessage').hidden=false;$('studioMessage').textContent=message||'No valid plan available.';
   $('studioMetrics').textContent='Waiting for valid gauge values';
   $('studioSelection').textContent='No stitch selected';
   $('studioStageText').textContent='Preview unavailable';
   $('studioLayerList').replaceChildren();
   $('studioStepPills').replaceChildren();
   const c=$('studioCanvas'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
   const l=$('studioLoupe'),lc=l.getContext('2d');lc.clearRect(0,0,l.width,l.height);
 }
 function apply(snapshot){
   const plan=adapter.adaptLegacySnapshot(snapshot);
   if(!plan.valid){error('Preview cleared: '+plan.error+'. Correct the swatch measurements to continue.');return;}
   try{
     state.geometry=geometryModule.buildGeometry(plan);
     state.timeline=timelineModule.createTimeline(state.geometry);
     state.inspector=inspection.createInspector(state.geometry);
     state.hiddenParts.clear();state.panX=0;state.panY=0;
     state.progress=1;state.zoom=1;stop();
     $('studioZoom').value=100;$('studioZoomLabel').textContent='100%';
     $('studioTimeline').value=100;$('studioProgress').textContent='100%';
     const g=state.geometry;
     $('studioMetrics').textContent=plan.templateName+' · '+plan.sizeLabel+' / '+nformat(plan.stitchCount)+' sts × '+nformat(plan.rowCount)+' rows';
     $('studioGarmentName').textContent=plan.templateName+' · '+plan.sizeLabel;
     $('studioGauge').textContent=nformat(plan.gauge.stitchesPerCm*10)+' sts / '+nformat(plan.gauge.rowsPerCm*10)+' rows per 10 cm · '+(plan.gauge.state==='blocked-measured'?'blocked gauge':'provisional gauge');
     $('studioMeasurements').textContent=g.measurementNote;
     $('studioMessage').hidden=false;$('studioMessage').textContent='Illustrative garment and texture study. '+(g.warnings.length ? g.warnings.join(' · ') : 'No complete row-by-row shaping data is provided.');
     $('studioAccuracy').textContent='Illustrative · untested';
     buildLayers();buildStages();
     requestDraw();
   }catch(err){error('Preview unavailable: '+err.message);}
 }
 function buildLayers(){
   const list=$('studioLayerList');list.replaceChildren();
   const g=state.geometry;if(!g)return;
   sectionOverlay.drawSections(null,g.sourcePlan,g,{}).forEach(item=>{
     const part=g.parts.find(p=>p.id===item.id);
     const lbl=document.createElement('label');lbl.className='studio-layer';
     const box=document.createElement('input');box.type='checkbox';box.checked=true;box.dataset.part=item.id;
     box.setAttribute('aria-label','Show '+item.name);box.addEventListener('change',()=>{
       if(box.checked)state.hiddenParts.delete(item.id);else state.hiddenParts.add(item.id);
       requestDraw();
     });
     const name=document.createElement('span');name.className='studio-layer-name';name.textContent=item.name;
     const detail=document.createElement('small');detail.textContent=item.stitches+' sts · '+item.rows+' rows';
     lbl.append(box,name,detail);list.append(lbl);
   });
 }
 function buildStages(){
   const host=$('studioStepPills');host.replaceChildren();
   state.timeline.stages.forEach((stage,i)=>{
     const b=document.createElement('button');b.type='button';b.className='studio-step';b.textContent=(i+1)+' · '+stage.label;b.dataset.step=String(i);
     b.addEventListener('click',()=>setProgress((i+.98)/state.timeline.stages.length));
     host.appendChild(b);
   });
 }
 function stop(){
   if(state.playTimer){clearInterval(state.playTimer);state.playTimer=null;}
   if($('studioPlay')){$('studioPlay').textContent='▶ Play';$('studioPlay').setAttribute('aria-pressed','false');}
 }
 function setProgress(p){
   state.progress=Math.min(1,Math.max(0,Number(p)||0));
   $('studioTimeline').value=Math.round(state.progress*1000)/10;
   $('studioProgress').textContent=Math.round(state.progress*100)+'%';
   requestDraw();
 }
 function requestDraw(){
   if(!state.enabled||!state.geometry)return;
   if(state.raf)return;
   state.raf=root.requestAnimationFrame(()=>{state.raf=0;draw();});
 }
 function draw(){
   const g=state.geometry;if(!g||!state.enabled)return;
   const frame=state.timeline.frame(state.progress);
   const spread=state.mode==='layers'?Math.max(.35,state.layerSpread):0;
   const opts={zoom:state.zoom,panX:state.panX,panY:state.panY,
     showSections:state.showSections,showGuides:state.showGuides,
     showStitches:state.showStitches,layerSpread:spread,
     revealed:frame.revealed,hiddenParts:state.hiddenParts,selected:state.inspector.selected};
   state.lastRender=fabric.renderFabric($('studioCanvas'),g,opts);
   if(state.loupe==='chart')chart.renderChart($('studioLoupe'),g.sourcePlan,{geometry:g,selected:state.inspector.selected});
   else fabric.renderLoupe($('studioLoupe'),g,state.inspector.selected,'yarn');
   $('studioStageText').textContent=(frame.stepIndex+1)+' / '+frame.stepCount+' · '+frame.stage.label;
   $('studioStageNote').textContent=frame.stage.description+' · section-level illustration, not actual row-by-row instructions';
   $('studioSelection').textContent=state.inspector.describe();
   $('studioLod').textContent=state.lastRender.levelOfDetail==='loops'?'Detailed loops':(state.lastRender.levelOfDetail==='tiles'?'Adaptive texture':'Material study');
   $('studioZoomLabel').textContent=Math.round(state.zoom*100)+'%';
   document.querySelectorAll('#studioStepPills .studio-step').forEach(b=>b.classList.toggle('current',Number(b.dataset.step)===frame.stepIndex));
 }
 function setZoom(n){
   state.zoom=Math.max(1,Math.min(4.5,Number(n)||1));
   $('studioZoom').value=Math.round(state.zoom*100);
   requestDraw();
 }
 function shiftStage(direction){
   if(!state.timeline)return;
   const len=state.timeline.stages.length;
   const current=state.timeline.frame(state.progress).stepIndex;
   const next=Math.min(len-1,Math.max(0,current+direction));
   setProgress(direction>0?(next+1)/len:(next+0.04)/len);
 }
 function selectPoint(ev){
   if(!state.lastRender)return;
   const bounds=$('studioCanvas').getBoundingClientRect();
   const x=ev.clientX-bounds.left,y=ev.clientY-bounds.top;
   const hit=fabric.hitTest(state.lastRender,x,y);
   if(hit){state.inspector.select(hit);requestDraw();}
 }
 function activate(){
   state.enabled=true;
   $('studioExperience').hidden=false;
   $('studioEnable').hidden=true;
   $('studioDisable').hidden=false;
   $('studioPanel').classList.add('studio-active');
   apply(shell.latestLegacySnapshot||root.StitchStudioShellLatest);
   $('studioCanvas').focus({preventScroll:true});
 }
 function deactivate(){stop();state.enabled=false;$('studioExperience').hidden=true;$('studioEnable').hidden=false;$('studioDisable').hidden=true;$('studioPanel').classList.remove('studio-active');}
 $('studioEnable').addEventListener('click',activate);
 $('studioDisable').addEventListener('click',deactivate);
 $('studioModeFabric').addEventListener('click',()=>{state.mode='fabric';$('studioModeFabric').classList.add('selected');$('studioModeLayers').classList.remove('selected');$('studioExplodeRow').hidden=true;requestDraw();});
 $('studioModeLayers').addEventListener('click',()=>{state.mode='layers';$('studioModeLayers').classList.add('selected');$('studioModeFabric').classList.remove('selected');$('studioExplodeRow').hidden=false;requestDraw();});
 $('studioLoupeYarn').addEventListener('click',()=>{state.loupe='yarn';$('studioLoupeYarn').classList.add('selected');$('studioLoupeChart').classList.remove('selected');requestDraw();});
 $('studioLoupeChart').addEventListener('click',()=>{state.loupe='chart';$('studioLoupeChart').classList.add('selected');$('studioLoupeYarn').classList.remove('selected');requestDraw();});
 $('studioZoom').addEventListener('input',ev=>setZoom(Number(ev.target.value)/100));
 $('studioZoomIn').addEventListener('click',()=>setZoom(state.zoom+.25));
 $('studioZoomOut').addEventListener('click',()=>setZoom(state.zoom-.25));
 $('studioReset').addEventListener('click',()=>{state.panX=0;state.panY=0;setZoom(1);});
 $('studioExplode').addEventListener('input',ev=>{state.layerSpread=Number(ev.target.value)/100;requestDraw();});
 $('studioSections').addEventListener('change',ev=>{state.showSections=ev.target.checked;requestDraw();});
 $('studioGuides').addEventListener('change',ev=>{state.showGuides=ev.target.checked;requestDraw();});
 $('studioStitches').addEventListener('change',ev=>{state.showStitches=ev.target.checked;requestDraw();});
 $('studioTimeline').addEventListener('input',ev=>{stop();setProgress(Number(ev.target.value)/100);});
 $('studioPrev').addEventListener('click',()=>{stop();shiftStage(-1);});
 $('studioNext').addEventListener('click',()=>{stop();shiftStage(1);});
 $('studioPlay').addEventListener('click',()=>{
   if(state.playTimer){stop();return;}
   if(!state.timeline)return;
   if(state.progress>=1)setProgress(0);
   $('studioPlay').textContent='Ⅱ Pause';$('studioPlay').setAttribute('aria-pressed','true');
   state.playTimer=setInterval(()=>{
     const next=Math.min(1,state.progress+.008);
     setProgress(next);
     if(next>=1)stop();
   },55);
 });
 $('studioSavePng').addEventListener('click',()=>{
   if(!state.geometry)return;
   // PNG exports exactly the annotated *illustrative* canvas, not a tested schematic.
   const link=document.createElement('a');
   link.download='stitch-studio-'+state.geometry.templateId+'-illustrative-preview.png';
   link.href=$('studioCanvas').toDataURL('image/png');link.click();
 });
 const main=$('studioCanvas');
 main.addEventListener('pointerdown',ev=>{
   if(!state.enabled)return;
   main.setPointerCapture(ev.pointerId);
   state.drag={x:ev.clientX,y:ev.clientY,panX:state.panX,panY:state.panY,moved:false};
   selectPoint(ev);
 });
 main.addEventListener('pointermove',ev=>{
   if(!state.drag)return;
   const dx=ev.clientX-state.drag.x,dy=ev.clientY-state.drag.y;
   if(Math.abs(dx)+Math.abs(dy)>5)state.drag.moved=true;
   if(state.drag.moved&&state.zoom>1){state.panX=state.drag.panX+dx;state.panY=state.drag.panY+dy;requestDraw();}
 });
 function release(ev){state.drag=null;try{main.releasePointerCapture(ev.pointerId);}catch(_){/* pointer may already be released */}}
 main.addEventListener('pointerup',release);main.addEventListener('pointercancel',release);
 main.addEventListener('keydown',ev=>{
   if(!state.inspector)return;
   const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};
   if(moves[ev.key]){ev.preventDefault();state.inspector.move(...moves[ev.key]);requestDraw();}
   else if(ev.key==='+'||ev.key==='='){ev.preventDefault();setZoom(state.zoom+.25);}
   else if(ev.key==='-'){ev.preventDefault();setZoom(state.zoom-.25);}
   else if(ev.key==='Home'){ev.preventDefault();state.inspector.initial();requestDraw();}
 });
 // Pointer wheel remains normal page scrolling; zoom uses explicit controls.
 if('ResizeObserver' in root)new ResizeObserver(()=>requestDraw()).observe(main);
 else root.addEventListener('resize',requestDraw);
 root.addEventListener('stitchstudio:plan-updated',ev=>{
   shell.latestLegacySnapshot=ev.detail;
   if(state.enabled)apply(ev.detail);
   else if(ev.detail && ev.detail.valid===false)$('studioMetrics').textContent='Preview needs valid measurements';
 });
 if(shell.latestLegacySnapshot||root.StitchStudioShellLatest){
   const snapshot=shell.latestLegacySnapshot||root.StitchStudioShellLatest;
   const p=snapshot && snapshot.plan;
   if(p)$('studioMetrics').textContent=p.templateName+' · '+p.sizeLabel+' / '+p.mainStitches+' sts × '+p.mainRows+' rows';
 }
 root.StitchStudioAtelier={getState:()=>({enabled:state.enabled,progress:state.progress,mode:state.mode,zoom:state.zoom,selected:state.inspector&&state.inspector.selected,geometry:state.geometry}),activate,render:draw,deactivate};
})(window);
