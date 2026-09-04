"""Fast smoke checks for the WesleyLink prototype.

These checks deliberately use only Python's standard library so they can run in
CI and on a fresh machine before the application gets its full test suite.
"""
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")

required = [
    'id="splash"',
    'id="menuScreen"',
    'id="mainMenuButton"',
    'class="top-nav"',
    'data-enter',
    'WesleyLink',
    'Goromonzi Circuit',
    'ZEAC',
    'Finance',
    'Calendar',
]
for marker in required:
    assert marker in html, f"missing UI marker: {marker}"

assert 'class="sidebar"' in html, "legacy sidebar markup should remain hidden for fallback styling"
assert ".sidebar { display:none; }" in html, "sidebar must be hidden"
assert "main { margin-left:0; width:100%; }" in html, "workspace must be full-width"
assert html.count('class="top-nav-item') >= 7, "horizontal workspace navigation is incomplete"
for target in ('overview','people','calendar','committees','finance','reports','admin'):
    assert f'data-target="{target}"' in html, f"missing workspace route: {target}"
assert 'function renderWorkspace(target)' in html, "workspace rendering flow is missing"
assert 'background:#fff; color:#111720' in html, "splash screen must be white"
assert 'setTimeout(() => { splash.classList.add' in html, "splash-to-menu transition is missing"
assert '@keyframes logoReveal' in html and '@keyframes orbitDot' in html, "logo motion identity is missing"
assert 'prefers-reduced-motion' in html, "motion accessibility fallback is missing"

if __name__ == "__main__":
    print("WesleyLink static smoke checks passed")
    print(f"Checked {len(required)} required UI markers")
