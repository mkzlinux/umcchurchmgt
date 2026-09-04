"""Fast repository checks for the WesleyLink Next.js foundation."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
page = (ROOT / "app/page.tsx").read_text(encoding="utf-8")
layout = (ROOT / "app/layout.tsx").read_text(encoding="utf-8")
package = (ROOT / "package.json").read_text(encoding="utf-8")

for marker in ("'use client'", "WesleyLink", "splash", "login", "menu", "Goromonzi Circuit", "ZEAC"):
    assert marker in page, f"missing Next.js UI marker: {marker}"
for marker in ("next", "react", "@supabase/supabase-js", "build"):
    assert marker in package, f"missing package configuration: {marker}"
assert "Metadata" in layout, "Next metadata is missing"
assert not (ROOT / "index.html").exists(), "legacy static entrypoint should not remain"
print("WesleyLink Next.js smoke checks passed")
