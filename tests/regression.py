"""Compare original v0.3 against opt-in-enhanced entrypoint for all presets.

Uses in-memory Chromium pages to avoid local-server policy restrictions; external
Three.js CDN is omitted because the calculator does not require it.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]

def bundle(filename):
    text=(R/filename).read_text().replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>','')
    if filename=='index.html':
        text=text.replace('<link rel="stylesheet" href="src/scaffold/studio.css">','<style>'+(R/'src/scaffold/studio.css').read_text()+'</style>')
        for f in (R/'src/scaffold').glob('*.js'):
            text=text.replace('<script src="src/scaffold/'+f.name+'"></script>','<script>'+f.read_text()+'</script>')
    return text

with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    results={}
    for version,file in [('baseline','original/stitch-studio.html'),('enhanced','index.html')]:
        page=b.new_page(viewport={'width':1100,'height':900})
        page.set_content(bundle(file),wait_until='load')
        per={}
        for name in ['custom','scarf','blanket','beanie','shirt','sweater','socks','gloves']:
            page.locator('[data-template="'+name+'"]:not(.view-controls *)').click()
            fields=('outStitches','outRows','outWidth','outHeight','outRepeats','status','formula1','formula2','formula3')
            per[name]=tuple(page.locator('#'+f).inner_text() for f in fields)
        results[version]=per
        page.close()
    b.close()
    for k in results['baseline']:
        assert results['baseline'][k]==results['enhanced'][k],k
    print('PASS: 8/8 preset legacy calculations, status and formula outputs identical to archived original.')
