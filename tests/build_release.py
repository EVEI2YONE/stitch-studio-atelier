"""Recreate release manifest and distributable ZIP from this source tree."""
from pathlib import Path
import hashlib
import json
import zipfile
import sys
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT.parent/'Stitch_Studio_Atelier_Enhanced_v0_4.zip'
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
paths=sorted(p for p in ROOT.rglob('*') if p.is_file() and p.name!='manifest.json' and '__pycache__' not in p.parts)
manifest={
 'package':'Stitch Studio Atelier enhanced v0.4 beta',
 'release_date':'2026-11-11 (US Eastern)',
 'source':'user-provided Stitch Studio v0.3 + integration scaffold',
 'scope':'Opt-in adaptive knit-texture and construction-preview implementation; no changes to underlying knitting calculations',
 'implemented':['adapter and invalid-state clearing','physical-cm illustrative geometry for all eight templates','multiscale canvas yarn shading','stitch inspector with keyboard/touch','source-piece layers','stage-level construction time-lapse','illustrative PNG export','responsive interface'],
 'not_implemented':['verified complete knitting chart operations','true low-poly 3D garment + UV mapping','physical yarn drape','PDF/print chart pagination','body scan and fit guarantees'],
 'original_source_sha256':sha(ROOT/'original/stitch-studio.html'),
 'files':[{'path':str(p.relative_to(ROOT)), 'sha256':sha(p),'bytes':p.stat().st_size} for p in paths]
}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
with zipfile.ZipFile(OUT,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=8) as z:
 for p in sorted(list(ROOT.rglob('*'))):
  if p.is_file() and '__pycache__' not in p.parts:
   z.write(p,arcname=str(Path('stitch-studio-atelier')/p.relative_to(ROOT)))
with zipfile.ZipFile(OUT) as z:
 assert z.testzip() is None
 print('ZIP validated:',OUT,'entries:',len(z.infolist()),'bytes:',OUT.stat().st_size)
 print('original baseline sha256:',manifest['original_source_sha256'])
