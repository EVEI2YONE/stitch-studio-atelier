from playwright.sync_api import sync_playwright
from pathlib import Path
import re, json
root=Path('/mnt/data/stitch-studio-handoff')
s=(root/'index.html').read_text()
s=re.sub(r'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '',s)
s=re.sub(r'<link rel="stylesheet" href="src/scaffold/studio.css">','<style>'+(root/'src/scaffold/studio.css').read_text()+'</style>',s)
for fp in (root/'src/scaffold').glob('*.js'):
 s=s.replace('<script src="src/scaffold/'+fp.name+'"></script>','<script>'+fp.read_text()+'</script>')
print('inlined kb',len(s)//1024)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1280,'height':900},device_scale_factor=1)
 errors=[];logs=[]
 page.on('pageerror',lambda e: errors.append(str(e)))
 page.on('console',lambda m: logs.append(m.text) if m.type=='error' else None)
 try:
  page.set_content(s,wait_until='load',timeout=25000)
  print('metrics',page.locator('#outStitches').inner_text(), page.locator('#outRows').inner_text())
  page.locator('#studioEnable').click()
  page.wait_for_timeout(600)
  print('state',page.evaluate('window.StitchStudioAtelier.getState().enabled'))
  print('studioStage',page.locator('#studioStageText').inner_text())
  print('studioSelection',page.locator('#studioSelection').inner_text())
  print('studio message',page.locator('#studioMessage').inner_text())
  page.locator('#studioPanel').screenshot(path='/mnt/data/stitch_studio_desktop.png')
  page.locator('#studioModeLayers').click()
  page.locator('#studioTimeline').fill('43')
  page.wait_for_timeout(300)
  print('layers progress',page.locator('#studioProgress').inner_text(),'stage',page.locator('#studioStageText').inner_text())
  print('errors',errors,logs)
 except Exception as e:print('test exception',type(e),str(e)[:1000])
 finally:b.close()
