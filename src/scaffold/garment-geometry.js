/* Measured 2D construction illustrations for the Studio Preview.
 * All dimensions are cm; physical gauge is independent of canvas resolution.
 * The source omits individual increase/decrease operations: never label the
 * resulting crown/finger/heel curves as row-accurate knitting directions.
 */
(function (root) {
  'use strict';
  const shell = root.StitchStudioScaffold;
  const rect = [[0,0],[1,0],[1,1],[0,1]];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function buildGeometry(plan) {
    if (!plan || !plan.valid) throw new Error('A valid studio-preview plan is required.');
    const P = plan.sourcePlan, S = plan.gauge.stitchesPerCm, R = plan.gauge.rowsPerCm;
    const source = id => plan.construction.find(p => p.id === id) || null;
    const rHeight = p => (p && p.rows ? p.rows/R : 0);
    const parts = [], stages = [];
    let width = 1, height = 1;
    function add(id, label, x, y, w, h, c, options) {
      options = options || {};
      if (!(w > 0 && h > 0) || ![x,y,w,h].every(Number.isFinite)) return null;
      const part = {
        id, label, x, y, w, h,
        points: options.points || rect, section: options.section || id,
        stitchStyle: options.style || 'body',
        // Displayed front of an in-the-round tube spans HALF its circumference.
        stitches: options.stitches || Math.max(1, Math.round(((c && c.sourceStitches) || P.mainStitches) / (options.half ? 2 : 1))),
        rows: options.rows || (c && c.rows) || Math.max(1, Math.round(h * R)),
        rowOrigin: options.rowOrigin || 0,
        stitchOrigin: options.stitchOrigin || 0,
        back: Boolean(options.back),
        shaping: Boolean(options.shaping || (c && c.shaped)),
        readDirection: options.readDirection || 'bottom-up',
        surfaceStatus: 'illustrative',
        stageIndex: parts.length
      };
      parts.push(part); return part;
    }
    function stage(label, partIds, desc) { stages.push({ id: 'stage-'+stages.length, label, partIds: Array.isArray(partIds) ? partIds : [partIds], description: desc || 'Illustrative construction step' }); }

    if (P.kind === 'flat' || P.kind === 'rectangle') {
      width = P.mainStitches / S;
      height = P.mainRows / R;
      const border = source('border'), field = source('field');
      if (plan.templateId === 'blanket' && border && field) {
        const bH = clamp(border.rows/R, 0, height*.40);
        add('cast-on-border','Cast-on border',0,height-bH,width,bH,border,{stitches:P.mainStitches,style:'edge',rowOrigin:0});
        add('field','Pattern field',0,bH,width,Math.max(.1,height-2*bH),field,{stitches:P.mainStitches,rows:field.rows,style:'body',rowOrigin:border.rows});
        add('bind-off-border','Finishing border',0,0,width,bH,border,{stitches:P.mainStitches,style:'edge',rowOrigin:P.mainRows-border.rows});
        stage('Cast on + lower border',['cast-on-border'],'First border rows from the source plan');
        stage('Work the field',['field'],'Patterned center, side borders remain illustrative');
        stage('Finish the border',['bind-off-border'],'Final border rows from the source plan');
      } else {
        const c = source('body');
        add('fabric',plan.templateName,0,0,width,height,c,{stitches:P.mainStitches,rows:P.mainRows});
        stage('Work the fabric',['fabric'],'Single flat piece: progress reveals approximate completed rows');
      }
    } else if (P.kind === 'hat') {
      width = P.mainStitches/(S*2);
      const brim = source('brim'), body=source('body'), crown=source('crown');
      const bh=rHeight(brim), mh=rHeight(body), ch=rHeight(crown);
      height = bh+mh+ch;
      const crownProfile = [];
      const steps = 18;
      for(let i=0;i<=steps;i++) {
        const t=i/steps;
        const half=(.055 + .445*Math.pow(Math.sin(t*Math.PI/2),.78));
        crownProfile.push([.5-half,t]);
      }
      for(let i=steps;i>=0;i--) {
        const t=i/steps;
        const half=(.055 + .445*Math.pow(Math.sin(t*Math.PI/2),.78));
        crownProfile.push([.5+half,t]);
      }
      add('brim','Brim · rib',0,ch+mh,width,bh,brim,{stitches:Math.round(P.mainStitches/2),style:'rib',rowOrigin:0});
      add('hat-body','Stockinette body',0,ch,width,mh,body,{stitches:Math.round(P.mainStitches/2),rowOrigin:brim.rows});
      add('crown','Crown decrease zone',0,0,width,ch,crown,{points:crownProfile,stitches:Math.round(P.mainStitches/2),rows:crown.rows,rowOrigin:brim.rows+body.rows,shaping:true});
      stage('Cast on + brim','brim','Rib rows recorded in the plan');
      stage('Work the body','hat-body','Even rounds up to the crown');
      stage('Shape the crown','crown','Symmetric visual taper only: decrease-round count is not fully specified');
    } else if (P.kind === 'top') {
      const body=source('body'), front=source('front'), back=source('back'), sleeve=source('sleeve'), neck=source('neckband');
      const bodyWidth=P.mainStitches/(S*2), bodyHeight=P.mainRows/R;
      const sleeveH=rHeight(sleeve), sleeveFlat=(sleeve ? sleeve.sourceStitches : (P.sleeveStitches||P.mainStitches*.35))/(S*2);
      const sleeveBox=sleeveFlat*1.58;
      const gap=0.25;
      const bx=sleeveBox+gap;
      const sy=Math.max(1.2,bodyHeight*.045);
      const shapeL=[[.72,0],[1,.045],[.88,.25],[.50,1],[.08,1],[0,.26],[.12,.08]];
      const shapeR=shapeL.map(p=>[1-p[0],p[1]]).reverse();
      width=bodyWidth+2*(sleeveBox+gap);
      height=Math.max(bodyHeight,sy+sleeveH);
      // A U-neck in the facing fabric is illustrative: exact neckline shaping
      // isn't present in the v0.3 row-level source.
      const neckW=Math.min(bodyWidth*.36,23);
      const neckDepth=Math.min(7,bodyHeight*.105);
      const nStart=.5-neckW/(2*bodyWidth), nEnd=.5+neckW/(2*bodyWidth);
      const neckLine=[];
      for(let i=0;i<=16;i++){
        const t=i/16;neckLine.push([nStart+(nEnd-nStart)*t,neckDepth*Math.sin(Math.PI*t)/bodyHeight]);
      }
      const facing=[[0,0],...neckLine,[1,0],[1,1],[0,1]];
      // The visual back face shares the neckline cutout so it cannot fill
      // the front's open collar on the flat projection.
      add('back','Back panel',bx+.5,.65,bodyWidth,bodyHeight-.65,back,{points:facing,stitches:Math.round(P.mainStitches/2),rows:P.mainRows,back:true});
      add('front','Front panel',bx,0,bodyWidth,bodyHeight,front,{points:facing,stitches:Math.round(P.mainStitches/2),rows:P.mainRows});
      add('left-sleeve','Left sleeve',gap,sy,sleeveBox,sleeveH,sleeve,{points:shapeL,stitches:Math.round(sleeve.sourceStitches/2),rows:sleeve.rows,shaping:true});
      add('right-sleeve','Right sleeve',bx+bodyWidth-gap,sy,sleeveBox,sleeveH,sleeve,{points:shapeR,stitches:Math.round(sleeve.sourceStitches/2),rows:sleeve.rows,shaping:true});
      // U-shaped rib band hugs the upper fabric edge; it is not a calibrated
      // neckline-pickup operation.
      const band=Math.min(2.5,bodyHeight*.045),nbH=neckDepth+band,nbW=neckW;
      const bandPoints=[];
      for(let i=0;i<=16;i++){const t=i/16;bandPoints.push([t,(neckDepth*Math.sin(Math.PI*t)+band)/nbH]);}
      for(let i=16;i>=0;i--){const t=i/16;bandPoints.push([t,(neckDepth*Math.sin(Math.PI*t))/nbH]);}
      add('neckband','Neckband',bx+(bodyWidth-nbW)/2,0,nbW,nbH,neck,{points:bandPoints,stitches:Math.max(8,Math.round(nbW*S)),rows:neck?neck.rows:Math.round(nbH*R),style:'rib'});
      stage('Work the back','back','Back section is illustrative; body stitches were cast on in the round');
      stage('Work the front','front','Front shaping and neckline are not a complete chart');
      stage('Knit sleeve one','left-sleeve','Sleeve length from recorded sleeve rows / row gauge');
      stage('Knit sleeve two','right-sleeve','Second sleeve shown independently');
      stage('Join + neckband','neckband','Assembly / pickup counts require verification');
    } else if (P.kind === 'sock') {
      const cuff=source('cuff'), leg=source('leg'), heel=source('heel'), gusset=source('gusset'), foot=source('foot'), toe=source('toe');
      const depth=P.mainStitches/(S*2), legH=rHeight(cuff)+rHeight(leg);
      const heelW=Math.max(depth*.63,rHeight(heel)*.75), toeLen=rHeight(toe);
      const footLen=Math.max(3,Number(P.finishedHeightCm)||rHeight(foot)+toeLen);
      width=Math.max(depth+footLen,depth+12); height=legH+depth*1.25;
      add('cuff','Cuff',0,0,depth,rHeight(cuff),cuff,{stitches:Math.round(P.mainStitches/2),style:'rib',readDirection:'top-down'});
      add('leg','Leg',0,rHeight(cuff),depth,rHeight(leg),leg,{stitches:Math.round(P.mainStitches/2),readDirection:'top-down'});
      add('heel','Heel turn',0,legH,depth,depth*.95,heel,{points:[[0,0],[1,0],[1,.68],[.8,1],[.28,1],[0,.72]],stitches:Math.round(heel.sourceStitches/2),shaping:true});
      add('gusset','Gusset',depth*.45,legH+depth*.16,heelW,depth*.84,gusset,{points:[[0,0],[1,.45],[.75,1],[0,1]],stitches:Math.round(P.mainStitches/2),shaping:true});
      add('foot','Foot',depth,legH+depth*.10,Math.max(1,footLen-toeLen),depth*.82,foot,{stitches:Math.round(P.mainStitches/2),rows:foot.rows,readDirection:'top-down'});
      add('toe','Toe',depth+Math.max(1,footLen-toeLen),legH+depth*.10,toeLen,depth*.82,toe,{points:[[0,0],[.65,.08],[1,.43],[1,.56],[.65,.92],[0,1]],stitches:Math.round(P.mainStitches/2),shaping:true,readDirection:'top-down'});
      stage('Rib the cuff','cuff','Cuff-down ribbed section');stage('Knit the leg','leg','Even rounds');
      stage('Turn the heel','heel','Heel shape illustrative; short rows missing');
      stage('Shape the gusset','gusset','Pickups and decreases not fully defined');
      stage('Work the foot','foot','Length taken from plan');stage('Close the toe','toe','Toe decrease count illustrative');
    } else if (P.kind === 'glove') {
      const cuff=source('cuff'), palm=source('palm'), gusset=source('gusset');
      const handW=P.mainStitches/(S*2), cuffH=rHeight(cuff), palmH=rHeight(palm)+rHeight(gusset);
      const fingNames=['index','middle','ring','pinky']; const fingers=fingNames.map(source);
      const allFingerH=fingers.map(rHeight), tallest=Math.max(...allFingerH);
      const thumb=source('thumb'), thH=rHeight(thumb);
      const thumbW=Math.max(2,(thumb ? thumb.sourceStitches : 8)/(S*2));
      width=handW+thumbW*.80;
      height=tallest+palmH+cuffH;
      const fingerSpace=handW/4; let x=0;
      fingNames.forEach((name,i)=>{
        const c=fingers[i], fh=allFingerH[i];
        add(name,(c && c.label)||name,x,tallest-fh,fingerSpace*.96,fh,c,{stitches:Math.max(3,Math.round(c.sourceStitches/2)),rows:c.rows,points:[[.07,1],[.07,.13],[.2,0],[.80,0],[.93,.13],[.93,1]],shaping:true});
        x+=fingerSpace;
      });
      add('palm','Palm',0,tallest,handW,palmH,palm,{stitches:Math.round(P.mainStitches/2),rows:(palm.rows+gusset.rows)});
      add('thumb','Thumb',handW-thumbW*.25,tallest+palmH*.18,thumbW,thH,thumb,{points:[[.1,1],[0,.25],[.14,0],[.82,0],[1,.22],[.83,1]],stitches:Math.max(4,Math.round(thumb.sourceStitches/2)),shaping:true});
      add('cuff','Cuff',0,tallest+palmH,handW,cuffH,cuff,{stitches:Math.round(P.mainStitches/2),style:'rib'});
      stage('Cast on cuff','cuff','Cuff rounds');stage('Palm + gusset','palm','Thumb increase operations are approximate');
      stage('Work thumb','thumb','Held stitches and pickups need verification');
      fingNames.forEach(n=>stage('Knit '+n+' finger',n,'Finger dimensions from its own source rows, joins approximate'));
    } else throw new Error('Unsupported template kind: '+P.kind);

    if (!parts.length) throw new Error('No measurable sections available for illustration.');
    // Normalize to include any translated/overhanging parts without changing their cm dimensions.
    const minX=Math.min(0,...parts.map(p=>p.x)); const minY=Math.min(0,...parts.map(p=>p.y));
    if(minX<0||minY<0) parts.forEach(p=>{p.x-=minX;p.y-=minY;});
    width=Math.max(width,...parts.map(p=>p.x+p.w));
    height=Math.max(height,...parts.map(p=>p.y+p.h));
    return { templateId:plan.templateId, templateName:plan.templateName, sizeLabel:plan.sizeLabel,
      widthCm:width, heightCm:height, parts, stages,
      gauge:plan.gauge, sourcePlan:plan, accuracy:'illustrative',
      warnings:plan.warnings.slice(),
      measurementNote: ['hat','top','sock','glove'].includes(P.kind)
        ? 'Flat-facing construction illustration · knit circumference '+Number(P.knitWidthCm).toFixed(1)+' cm'
        : 'Flat fabric '+(P.mainStitches/S).toFixed(1)+' cm wide · '+(P.mainRows/R).toFixed(1)+' cm long'
    };
  }
  shell.register('garmentGeometry', { status:'implemented-preview', requirements:'GEOM-001..007 (illustrative where shaping unspecified)', buildGeometry });
})(window);
