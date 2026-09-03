#!/usr/bin/env python3
"""Baut aus public/ eine Single-File-Fassung fuer die Veroeffentlichung als
Claude-Artifact. Speicher dort ist die Artifact-Datenbank statt des Node-Servers;
die Plan-Tabs sind in beiden Fassungen identisch.

    python3 build-artifact.py            -> artifact/dashboard.html
"""
import re, pathlib, sys

ROOT = pathlib.Path(__file__).parent
OUT  = ROOT / 'artifact'
STORE = OUT / 'store.js'          # DB-Anbindung, gepflegt neben dieser Datei
EXTRA = OUT / 'extra.css'         # Styles fuer Health/Finanzen
TABS  = OUT / 'tabs.html'         # Markup der beiden neuen Tabs

idx = (ROOT / 'public/index.html').read_text(encoding='utf-8')

css = idx[idx.index('<style>') + 7 : idx.index('/* --- Health / Finanzen --- */')]
css = re.sub(r"@import url\('https://fonts\.googleapis\.com[^\n]*\n", '', css)

# Markup der Plan-Tabs inklusive der bereits vorhandenen Buttons fuer Health/Finanzen
body = idx[idx.index('<div class="hdr">') : idx.index('<!-- HEALTH -->')]

data = re.sub(r'^export ', '', (ROOT / 'public/js/plan-data.js').read_text(encoding='utf-8'), flags=re.M)
plan = (ROOT / 'public/js/plan.js').read_text(encoding='utf-8')
plan = re.sub(r"^import \{[^}]*\} from '\./plan-data\.js';\n", '', plan, flags=re.M | re.S)
plan = plan.replace('Object.assign(window, { tab, day, tog });', '')
plan = re.sub(r'export function initPlan\(\) \{.*?\}\n', '', plan, flags=re.S)

FONTS = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=DM+Mono:wght@300;400;500&family=Instrument+Serif&'
         'family=DM+Sans:wght@300;400;500;600;700&display=swap">')

FOOTER = """<div style="text-align:center;padding:16px;border-top:1px solid var(--bd)">
  <div style="font-size:8px;font-family:var(--mono);color:var(--dim);letter-spacing:.3px">
    Israetel 2019 · Maeo 2021/22 · Schoenfeld 2010 · Mah 2011 · Hoppe 2004 · Res 2012
  </div>
</div>"""

html = (f'<title>Sharms Dashboard</title>\n{FONTS}\n<style>\n{css}'
        f'{EXTRA.read_text(encoding="utf-8")}</style>\n\n'
        f'{body}{TABS.read_text(encoding="utf-8")}\n{FOOTER}\n\n'
        f'<script>\n{data}\n{plan}\n{STORE.read_text(encoding="utf-8")}</script>\n')

(OUT / 'dashboard.html').write_text(html, encoding='utf-8')
print(f'artifact/dashboard.html — {len(html):,} Bytes')
