"""Headless in-memory browser smoke for the extracted Stitch Studio package.

This uses Playwright page.set_content because direct navigation can be blocked
by local browser policy. It faithfully inlines existing classic scripts and CSS
and deliberately omits the external Three.js CDN script; therefore it verifies
2D/Atelier flows but NOT the classic 3D CDN runtime.

Usage: python tests/browser_smoke.py [--screenshots]
"""
from pathlib import Path
import re
import sys
import json
import hashlib
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SCREENSHOTS='--screenshots' in sys.argv


def bundle(path):
    text=path.read_text()
    text=text.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>','')
    if path.name=='index.html':
        text=text.replace('<link rel="stylesheet" href="src/scaffold/studio.css">','<style>'+ (ROOT/'src/scaffold/studio.css').read_text() +'</style>')
        for script in (ROOT/'src/scaffold').glob('*.js'):
            text=text.replace('<script src="src/scaffold/'+script.name+'"></script>','<script>'+script.read_text()+'</script>')
    return text


def plan_metrics(page):
    return [page.locator('#'+name).inner_text() for name in ('outStitches','outRows','outWidth','outHeight')]

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1)
    console=[]; errors=[]
    page.on('console',lambda e:console.append(e.text) if e.type=='error' else None)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(bundle(ROOT/'index.html'),wait_until='load')
    page.locator('#studioEnable').click()
    page.wait_for_timeout(300)
    assertions=[]
    if SCREENSHOTS:
        page.locator('#studioPanel').screenshot(path=str(ROOT/'docs/qa-images/atelier-custom-desktop.png'))
    for template in ['custom','scarf','blanket','beanie','shirt','sweater','socks','gloves']:
        page.locator('[data-template="'+template+'"]:not(.view-controls *)').click()
        page.wait_for_timeout(200)
        g=page.evaluate('window.StitchStudioAtelier.getState().geometry')
        assert g and g['templateId']==template, (template,g)
        assert len(g['stages'])>0,template
        assert all(q['w']>0 and q['h']>0 and q['stitches']>0 and q['rows']>0 for q in g['parts']),template
        assert page.locator('#studioMessage').is_visible(),template
        assertions.append({'template':template,'metrics':plan_metrics(page),'stages':len(g['stages']),'parts':len(g['parts'])})
        if SCREENSHOTS and template in ('beanie','sweater','socks','gloves','blanket'):
            page.locator('#studioPanel').screenshot(path=str(ROOT/f'docs/qa-images/atelier-{template}-desktop.png'))
        if template=='beanie':
            crown=next(part for part in g['parts'] if part['id']=='crown')
            left=crown['points'][:19];right=crown['points'][19:][::-1]
            assert len(left)==len(right)
            assert all(abs(a[0]+b[0]-1)<1e-10 and abs(a[1]-b[1])<1e-10 for a,b in zip(left,right)), 'hat crown is not mirrored'
        if template=='sweater':
            sl=next(part for part in g['parts'] if part['id']=='left-sleeve')
            assert abs(sl['h']-g['sourcePlan']['sourcePlan']['sleeveRows']/g['gauge']['rowsPerCm'])<1e-9,'sleeve height mismatch'
        if template=='blanket':
            page.locator('#studioLoupeChart').click()
            assert '• = purl' in page.locator('.studio-symbol-legend').inner_text()
            page.locator('#studioLoupeYarn').click()
    # Timeline scrub, layer switch and selection movement
    page.locator('[data-template="sweater"]:not(.view-controls *)').click()
    page.locator('#studioModeLayers').click()
    page.locator('#studioExplode').fill('74')
    page.locator('#studioTimeline').fill('38')
    page.wait_for_timeout(150)
    state=page.evaluate('window.StitchStudioAtelier.getState()')
    assert .37 < state['progress'] < .39 and state['mode']=='layers'
    page.locator('#studioCanvas').focus()
    before=page.evaluate('window.StitchStudioAtelier.getState().selected')
    page.keyboard.press('ArrowRight')
    after=page.evaluate('window.StitchStudioAtelier.getState().selected')
    assert after['col']==before['col']+1, 'keyboard stitch navigation failed'
    # Invalid input must invalidate adapter and clear old geometry.
    page.locator('#stitches').fill('-1')
    page.locator('#stitches').dispatch_event('input')
    page.wait_for_timeout(150)
    assert page.evaluate('window.StitchStudioAtelier.getState().geometry') is None,'stale preview geometry not cleared'
    assert 'Preview cleared' in page.locator('#studioMessage').inner_text()
    page.locator('#stitches').fill('22');page.locator('#stitches').dispatch_event('input')
    page.wait_for_timeout(150)
    assert page.evaluate('window.StitchStudioAtelier.getState().geometry') is not None
    # Test mobile stacking and touch-safe controls.
    page.set_viewport_size({'width':390,'height':844})
    page.wait_for_timeout(180)
    if SCREENSHOTS:
        page.locator('#studioPanel').screenshot(path=str(ROOT/'docs/qa-images/atelier-sweater-mobile.png'))
    horizontal=page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
    assert horizontal<=2, 'mobile horizontal overflow '+str(horizontal)
    assert not errors, errors
    assert not console, console
    print(json.dumps({'status':'PASS','templates':assertions,'browserErrors':errors,'consoleErrors':console,'mobileHorizontalOverflow':horizontal},indent=2))
    browser.close()
