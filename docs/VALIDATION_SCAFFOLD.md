# Scaffold verification record

Date: 2026-11-12

## PASS: Mechanical checks actually performed

- Original v0.3 `stitch-studio.html` compared byte-for-byte to user-supplied ZIP.
- Original 11 PNG preview files compared byte-for-byte to their source ZIP entries.
- All shell JavaScript files parsed by `node --check`.
- All inline script blocks in `index.html` were syntax-checked with Node's JavaScript parser.
- All 15 SVG assets parsed as valid XML; a static contact sheet was generated from them.
- Draft contract files and manifest parsed as JSON.
- Existing key DOM IDs remained present, and the new bridge event emission was inserted once.
- Node VM mock verified read-only initial snapshot, event-driven update, ten registered TODO-only modules, and an explicit NOT_IMPLEMENTED exception when a new renderer is invoked.
- ZIP CRC check passed after packaging.

## NOT_RUN / not proved

- End-to-end browser UI smoke and screenshot regression: NOT_RUN. Chromium is available locally but headless navigation to both `localhost` and `file://` was blocked by the environment's administrator policy; this is a test-environment limitation, not proof of a bug.
- New garment rendering behavior: NOT_IMPLEMENTED, so performance and visual correctness were NOT_TESTED.
- Physical knitting, fit validation, WebGL resource/performance profiling, accessible keyboard/pointer regression, printed exports: NOT_RUN.
- No new dependencies were installed, and no deployment was performed.

## Developer follow-up

1. Run the package on a machine where a browser can open the local folder/site; verify initial v0.3 preview and a changed template/size.
2. Confirm the bridge's read-only text updates; check browser console for errors and assets loading.
3. Implement Gate A first, add test fixtures, and do not activate TODO renderers until tests pass.
4. Document new evidence and change feature status only after functional validation.
