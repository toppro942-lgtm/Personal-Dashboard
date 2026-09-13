
/* ============================================================
   Vermögen — Bestand, Entwicklung und die Frage, warum sie sich
   verändert hat. Monatliche Momentaufnahme statt Kontoanbindung:
   ein Eintrag pro Position und Monat genügt für alle Auswertungen.

   Zerlegung der Monatsveränderung:
     Δ Gesamt = Einzahlungen + Marktbewegung
   Einzahlungen trägst du ein, die Marktbewegung ist der Rest —
   damit ist sie definitionsgemäß korrekt und nicht geschätzt.
   ============================================================ */

/* Kategoriale Palette, gegen die dunkle Fläche geprüft (OKLab-ΔE,
   Farbsehschwächen eingeschlossen). Reihenfolge ist fest: eine
   Anlageklasse behält ihre Farbe, auch wenn andere wegfallen. */
const KINDS = [
  { id:'giro',   n:'Giro & Bargeld', c:'#3987e5' },
  { id:'spar',   n:'Tagesgeld',      c:'#d95926' },
  { id:'etf',    n:'ETF & Fonds',    c:'#199e70' },
  { id:'aktie',  n:'Aktien',         c:'#c98500' },
  { id:'krypto', n:'Krypto',         c:'#d55181' },
  { id:'sonst',  n:'Sonstiges',      c:'#9085e9' }
];
const kindOf = id => KINDS.find(k => k.id === id) || KINDS[5];

/* Zustandsfarben — nur für Gewinn/Verlust, nie als Serienfarbe.
   Jeder so eingefärbte Wert trägt zusätzlich sein Vorzeichen. */
const GAIN = '#0ca30c', LOSS = '#d03b3b', INK = '#ececec';

let ASSETS = [], WEALTH = {};   // WEALTH: { 'YYYY-MM': {v:{}, in:{}} }

const monthLabel = m => ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'][+m.slice(5,7)-1] + ' ' + m.slice(2,4);
const prevMonth = m => { const d = new Date(+m.slice(0,4), +m.slice(5,7) - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };

async function loadWealth() {
  const [a, w] = await Promise.all([
    DB.collection('assets').limit(200).get(),
    DB.collection('wealth').orderBy('month', 'desc').limit(60).get()
  ]);
  ASSETS = a.docs.map(d => d.data()).sort((x, y) => KINDS.findIndex(k => k.id === x.kind) - KINDS.findIndex(k => k.id === y.kind));
  WEALTH = {};
  for (const d of w.docs) { const wd = d.data(); WEALTH[wd.month] = { v: wd.v || {}, in: wd.in || {} }; }
}
const saveMonthWealth = m => DB.doc('wealth/' + m).set({ month: m, ...(WEALTH[m] || { v:{}, in:{} }) });

const sumOf = obj => Object.values(obj || {}).reduce((a, b) => a + (b || 0), 0);
const totalAt = m => WEALTH[m] ? sumOf(WEALTH[m].v) : null;

/* Alle Monate mit Bestand, aufsteigend — die Zeitachse der Auswertung. */
const wealthMonths = () => Object.keys(WEALTH).filter(m => Object.keys(WEALTH[m].v).length).sort();

function attribution(m) {
  const cur = totalAt(m);
  if (cur == null) return null;
  const p = prevMonth(m), before = totalAt(p);
  const inflow = sumOf(WEALTH[m].in);
  if (before == null) return { before:null, inflow, market:null, after:cur, delta:null };
  const delta = cur - before;
  return { before, inflow, market: delta - inflow, after: cur, delta };
}

/* ---------------- Diagramme ----------------
   Gezeichnet wird in echten Pixeln der Containerbreite, nicht in einer
   skalierten viewBox: sonst schrumpft die Beschriftung auf dem Handy mit. */

const CH = { padL:52, padR:14, padT:12, padB:26 };
const tipEl = () => document.getElementById('charttip');

/* Der Tooltip ist position:fixed. Bei fixierten Elementen ist offsetParent
   per Spezifikation null -- ein Zugriff darauf wirft. clientX/clientY sind
   ohnehin bereits Viewport-Koordinaten, genau das Bezugssystem von fixed;
   es braucht also gar keinen Container-Bezug. */
function showTip(html, ev) {
  const t = tipEl();
  t.innerHTML = html; t.classList.add('on');
  const w = t.offsetWidth, h = t.offsetHeight;
  t.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, ev.clientX - w / 2)) + 'px';
  t.style.top  = Math.max(6, ev.clientY - h - 14) + 'px';
}
const hideTip = () => tipEl().classList.remove('on');

function niceTicks(min, max, count = 4) {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / count, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].find(s => s * mag >= raw) * mag;
  const out = [];
  for (let v = Math.floor(min / step) * step; v <= max + step * 0.001; v += step) out.push(v);
  return out;
}
const shortEur = c => {
  const e = c / 100, a = Math.abs(e);
  if (a >= 1000) return (e / 1000).toLocaleString('de-DE', { maximumFractionDigits:1 }) + 'k €';
  return e.toLocaleString('de-DE', { maximumFractionDigits:0 }) + ' €';
};

/* Verlauf des Gesamtvermögens: eine Serie, deshalb keine Legende —
   die Überschrift benennt sie. Fadenkreuz statt Punkt für jeden Wert. */
function drawTrend(box) {
  const months = wealthMonths();
  box.innerHTML = '';
  if (months.length < 2) {
    box.innerHTML = `<div class="empty">Ab dem zweiten erfassten Monat zeichnet sich hier der Verlauf.
      Bisher erfasst: ${months.length}.</div>`;
    return;
  }
  const w = Math.max(280, box.clientWidth), h = 220;
  const pts = months.map(m => ({ m, v: totalAt(m) }));
  const vals = pts.map(p => p.v);
  const lo = Math.min(...vals, 0), hi = Math.max(...vals);
  const ticks = niceTicks(lo, hi);
  const yMin = ticks[0], yMax = ticks[ticks.length - 1];
  const X = i => CH.padL + i / (pts.length - 1) * (w - CH.padL - CH.padR);
  const Y = v => CH.padT + (1 - (v - yMin) / (yMax - yMin || 1)) * (h - CH.padT - CH.padB);

  const grid = ticks.map(t => `<line x1="${CH.padL}" y1="${Y(t).toFixed(1)}" x2="${w - CH.padR}" y2="${Y(t).toFixed(1)}" class="cgrid"/>
    <text x="${CH.padL - 8}" y="${(Y(t) + 3.5).toFixed(1)}" class="ctick" text-anchor="end">${shortEur(t)}</text>`).join('');
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L${X(pts.length-1).toFixed(1)},${Y(yMin).toFixed(1)} L${X(0).toFixed(1)},${Y(yMin).toFixed(1)} Z`;
  const every = Math.ceil(pts.length / 6);
  const xlab = pts.map((p, i) => (i % every === 0 || i === pts.length - 1)
    ? `<text x="${X(i).toFixed(1)}" y="${h - 8}" class="ctick" text-anchor="middle">${monthLabel(p.m)}</text>` : '').join('');
  const last = pts[pts.length - 1];

  box.innerHTML = `<svg width="${w}" height="${h}" role="img"
      aria-label="Gesamtvermögen von ${monthLabel(pts[0].m)} bis ${monthLabel(last.m)}, zuletzt ${CENT(last.v)}">
    ${grid}
    <path d="${area}" fill="${INK}" fill-opacity=".07"/>
    <path d="${line}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${X(pts.length-1).toFixed(1)}" cy="${Y(last.v).toFixed(1)}" r="4" fill="${INK}" stroke="#101010" stroke-width="2"/>
    <text x="${(X(pts.length-1) - 6).toFixed(1)}" y="${(Y(last.v) - 11).toFixed(1)}" class="clabel" text-anchor="end">${CENT(last.v)}</text>
    <line class="ccross" x1="0" y1="${CH.padT}" x2="0" y2="${h - CH.padB}" style="opacity:0"/>
    <rect x="${CH.padL}" y="${CH.padT}" width="${w - CH.padL - CH.padR}" height="${h - CH.padT - CH.padB}" fill="transparent"/>
  </svg>`;

  const svg = box.querySelector('svg'), cross = svg.querySelector('.ccross');
  const move = ev => {
    const r = svg.getBoundingClientRect();
    const i = Math.round((ev.clientX - r.left - CH.padL) / ((w - CH.padL - CH.padR) / (pts.length - 1)));
    const p = pts[Math.max(0, Math.min(pts.length - 1, i))];
    const j = pts.indexOf(p), at = attribution(p.m);
    cross.setAttribute('x1', X(j)); cross.setAttribute('x2', X(j)); cross.style.opacity = 1;
    showTip(`<b>${monthLabel(p.m)}</b><span class="tipv">${CENT(p.v)}</span>${
      at && at.delta != null ? `<span class="tipd" style="color:${at.delta >= 0 ? GAIN : LOSS}">${
        at.delta >= 0 ? '+' : '−'}${CENT(Math.abs(at.delta))} zum Vormonat</span>` : ''}`, ev);
  };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerleave', () => { cross.style.opacity = 0; hideTip(); });
}

/* Aufteilung als ein gestapelter Balken: Anteile vergleichen sich auf
   einer gemeinsamen Länge besser als über Kreissegmente. */
function drawAllocation(box, month) {
  const v = WEALTH[month]?.v || {};
  const rows = ASSETS.map(a => ({ a, val: v[a.id] || 0 })).filter(r => r.val > 0)
    .sort((x, y) => y.val - x.val);
  const total = rows.reduce((s, r) => s + r.val, 0);
  if (!total) {
    box.innerHTML = `<div class="empty">Für ${monthLabel(month)} ist noch kein Bestand erfasst.
      Trage unten bei jeder Position ein, wie viel dort aktuell liegt.</div>`;
    return;
  }
  const seg = rows.map(r => {
    const k = kindOf(r.a.kind), pct = r.val / total * 100;
    return `<div class="allocseg" style="width:${pct}%;background:${k.c}"
       data-tip="${ESC(r.a.name)}|${CENT(r.val)}|${pct.toLocaleString('de-DE',{maximumFractionDigits:1})} %"></div>`;
  }).join('');
  box.innerHTML = `<div class="allocbar">${seg}</div>
    <ul class="alloclist">${rows.map(r => {
      const k = kindOf(r.a.kind);
      return `<li><span class="swatch" style="background:${k.c}"></span>
        <span class="allocname">${ESC(r.a.name)}</span>
        <span class="allocpct">${(r.val / total * 100).toLocaleString('de-DE',{maximumFractionDigits:1})} %</span>
        <span class="allocval">${CENT(r.val)}</span></li>`;
    }).join('')}</ul>`;
  box.querySelectorAll('.allocseg').forEach(el => {
    const [n, v2, p] = el.dataset.tip.split('|');
    el.addEventListener('pointermove', ev => showTip(`<b>${n}</b><span class="tipv">${v2}</span><span class="tipd">${p} des Vermögens</span>`, ev));
    el.addEventListener('pointerleave', hideTip);
  });
}

/* Zerlegung der Monatsveraenderung.
   Bewusst NICHT als Brücke zwischen den Absolutbeständen: eine Veränderung
   von 340 EUR neben einem Bestand von 6 230 EUR waere ein unsichtbarer Strich.
   Gezeigt werden die Bestandteile der Veraenderung, alle ab der Nulllinie —
   damit bleibt die Achse ehrlich und die Groessen sind vergleichbar.
   Die Absolutwerte stehen in den Kennzahlen und im Verlauf darueber. */
function drawWaterfall(box, month) {
  const at = attribution(month);
  if (!at) { box.innerHTML = `<div class="empty">Für ${monthLabel(month)} ist noch kein Bestand erfasst.</div>`; return; }
  if (at.before == null) {
    box.innerHTML = `<div class="empty">${monthLabel(month)} ist der erste erfasste Monat — die Zerlegung
      erscheint, sobald ein Vormonat vorliegt. Bestand aktuell: <b>${CENT(at.after)}</b>.</div>`;
    return;
  }
  const steps = [
    { l:'Einzahlungen',  d:at.inflow, y0:0,         y1:at.inflow },
    { l:'Marktbewegung', d:at.market, y0:at.inflow, y1:at.delta  },
    { l:'Veränderung',   d:at.delta,  y0:0,         y1:at.delta, total:true }
  ];
  const w = Math.max(280, box.clientWidth), h = 220, n = steps.length;
  const slot = (w - CH.padL - CH.padR) / n, bw = Math.min(72, slot * 0.5);
  const vals = steps.flatMap(g => [g.y0, g.y1]).concat(0);
  const ticks = niceTicks(Math.min(...vals), Math.max(...vals));
  const yMin = ticks[0], yMax = ticks[ticks.length - 1];
  const Y = v => CH.padT + 14 + (1 - (v - yMin) / (yMax - yMin || 1)) * (h - CH.padT - CH.padB - 14);
  const cx = i => CH.padL + slot * i + slot / 2;

  const grid = ticks.map(t => `<line x1="${CH.padL}" y1="${Y(t).toFixed(1)}" x2="${w-CH.padR}" y2="${Y(t).toFixed(1)}" class="cgrid"/>
    <text x="${CH.padL-8}" y="${(Y(t)+3.5).toFixed(1)}" class="ctick" text-anchor="end">${shortEur(t)}</text>`).join('');

  const bars = steps.map((g, i) => {
    const top = Math.min(Y(g.y0), Y(g.y1)), bot = Math.max(Y(g.y0), Y(g.y1));
    const fill = g.total ? '#8a8a8a' : (g.d >= 0 ? GAIN : LOSS);
    const label = (g.d >= 0 ? '+' : '−') + CENT(Math.abs(g.d));
    /* Beschriftung ueber positiven, unter negativen Balken — nie im Balken. */
    const ly = g.d >= 0 ? top - 7 : bot + 13;
    const link = i > 0 && !g.total
      ? `<line x1="${(cx(i-1)+bw/2).toFixed(1)}" y1="${Y(steps[i-1].y1).toFixed(1)}"
             x2="${(cx(i)-bw/2).toFixed(1)}" y2="${Y(g.y0).toFixed(1)}" class="cconn"/>` : '';
    return `${link}<rect x="${(cx(i)-bw/2).toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}"
        height="${Math.max(2, bot-top).toFixed(1)}" rx="3" fill="${fill}" class="wbar" data-tip="${g.l}|${label}"/>
      <text x="${cx(i).toFixed(1)}" y="${ly.toFixed(1)}" class="clabel" text-anchor="middle">${label}</text>
      <text x="${cx(i).toFixed(1)}" y="${h-8}" class="ctick" text-anchor="middle">${g.l}</text>`;
  }).join('');

  box.innerHTML = `<svg width="${w}" height="${h}" role="img"
    aria-label="Veränderung im ${monthLabel(month)}: Einzahlungen ${CENT(at.inflow)}, Marktbewegung ${CENT(at.market)}, zusammen ${CENT(at.delta)}">
    ${grid}<line x1="${CH.padL}" y1="${Y(0).toFixed(1)}" x2="${w-CH.padR}" y2="${Y(0).toFixed(1)}" class="czero"/>${bars}</svg>
    <div class="chartnote">${monthLabel(prevMonth(month))} <b>${CENT(at.before)}</b>
      &nbsp;→&nbsp; ${monthLabel(month)} <b>${CENT(at.after)}</b></div>`;
  box.querySelectorAll('.wbar').forEach(el => {
    const [l, v] = el.dataset.tip.split('|');
    el.addEventListener('pointermove', ev => showTip(`<b>${l}</b><span class="tipv">${v}</span>`, ev));
    el.addEventListener('pointerleave', hideTip);
  });
}

/* ---------------- Eingabe ---------------- */

function renderPositions(month) {
  const box = document.getElementById('wpos');
  if (!ASSETS.length) {
    box.innerHTML = `<div class="empty">Noch keine Positionen. Lege unten an, wo dein Geld liegt —
      ein Eintrag pro Konto, Depot oder Wallet. Danach trägst du monatlich nur noch zwei Zahlen je Position ein.</div>`;
    return;
  }
  const st = WEALTH[month] || { v:{}, in:{} };
  box.innerHTML = `<div class="postab"><div class="poshead">
      <span>Position</span><span>Wert jetzt</span><span>davon neu eingezahlt</span><span></span></div>
    ${ASSETS.map(a => { const k = kindOf(a.kind); return `
      <div class="posrow">
        <div class="posname"><span class="swatch" style="background:${k.c}"></span>
          <span><b>${ESC(a.name)}</b><span class="hmeta"> ${k.n}</span></span></div>
        <input class="posin" type="text" inputmode="decimal" data-a="${a.id}" data-f="v"
          value="${st.v[a.id] != null ? (st.v[a.id]/100).toFixed(2).replace('.',',') : ''}" placeholder="0,00" aria-label="Wert ${ESC(a.name)}">
        <input class="posin" type="text" inputmode="decimal" data-a="${a.id}" data-f="in"
          value="${st.in[a.id] != null ? (st.in[a.id]/100).toFixed(2).replace('.',',') : ''}" placeholder="0,00" aria-label="Einzahlung ${ESC(a.name)}">
        <button class="txdel" data-del="${a.id}" aria-label="Position ${ESC(a.name)} löschen">✕</button>
      </div>`; }).join('')}</div>`;

  /* Nach dem Speichern NICHT renderWealth() aufrufen: das baut die ganze
     Positionsliste per innerHTML neu. change feuert beim Verlassen des
     Feldes -- typischerweise, weil man gerade das naechste Feld antippt.
     Genau dieses Feld wuerde dabei zerstoert, der Fokus landet auf <body>,
     die Tastatur klappt zu. Deshalb nur die abgeleiteten Anzeigen
     (Kennzahlen, Diagramme) auffrischen und das eigene Feld formatieren. */
  box.querySelectorAll('.posin').forEach(el => el.addEventListener('change', async e => {
    const raw = e.target.value.trim();
    const c = toCents(raw);
    if (raw && c === null) return toast('Betrag prüfen — z. B. 1250,00', true);
    WEALTH[month] = WEALTH[month] || { v:{}, in:{} };
    const f = e.target.dataset.f, a = e.target.dataset.a;
    if (!raw) delete WEALTH[month][f][a]; else WEALTH[month][f][a] = c;
    try {
      await saveMonthWealth(month);
      e.target.value = raw ? (c / 100).toFixed(2).replace('.', ',') : '';
      renderKpi(month); redrawCharts();
    } catch (err) { toast('Speichern fehlgeschlagen: ' + err.message, true); }
  }));
  box.querySelectorAll('[data-del]').forEach(el => el.onclick = async e => {
    const id = e.target.dataset.del;
    if (!confirm('Position und alle erfassten Werte dazu löschen?')) return;
    await DB.doc('assets/' + id).delete();
    for (const m of Object.keys(WEALTH)) {
      if (WEALTH[m].v[id] != null || WEALTH[m].in[id] != null) {
        delete WEALTH[m].v[id]; delete WEALTH[m].in[id]; await saveMonthWealth(m);
      }
    }
    ASSETS = ASSETS.filter(a => a.id !== id);
    renderWealth(); toast('Position gelöscht');
  });
}

/* Nur die SVG-Diagramme neu zeichnen -- ohne KPI-Kacheln und ohne die
   Eingabezeilen der Positionen anzufassen. Wird vom ResizeObserver
   aufgerufen; die Positionsliste darf dabei NICHT neu gebaut werden,
   sonst verliert ein gerade fokussiertes Eingabefeld den Fokus. */
function redrawCharts() {
  const month = document.getElementById('wmonth').value || NOWMONTH();
  drawTrend(document.getElementById('wtrend'));
  drawAllocation(document.getElementById('walloc'), month);
  drawWaterfall(document.getElementById('wfall'), month);
}

/* Nur die vier Kennzahl-Kacheln. Getrennt von renderWealth(), damit ein
   gespeicherter Wert die Anzeige aktualisieren kann, ohne die
   Eingabefelder darunter anzufassen. */
function renderKpi(month) {
  const at = attribution(month);
  const t = at ? at.after : null;
  document.getElementById('wkpi').innerHTML = [
    ['Gesamtvermögen', t == null ? '–' : CENT(t), 'neu'],
    ['Veränderung', at?.delta == null ? '–' : (at.delta >= 0 ? '+' : '−') + CENT(Math.abs(at.delta)), at?.delta >= 0 ? 'pos' : 'neg'],
    ['davon eingezahlt', at ? (at.inflow >= 0 ? '+' : '−') + CENT(Math.abs(at.inflow)) : '–', 'neu'],
    ['davon Markt', at?.market == null ? '–' : (at.market >= 0 ? '+' : '−') + CENT(Math.abs(at.market)), at?.market >= 0 ? 'pos' : 'neg']
  ].map(([l, v, tone]) => `<div class="kpi ${tone}"><div class="kpiv">${v}</div><div class="kpil">${l}</div></div>`).join('');
}

/* Vollstaendiger Aufbau -- nur bei Ereignissen, die die Zeilenstruktur
   wirklich aendern: Laden, Monatswechsel, Position angelegt oder geloescht. */
function renderWealth() {
  const month = document.getElementById('wmonth').value || NOWMONTH();
  renderKpi(month);
  redrawCharts();
  renderPositions(month);
}

function wireWealth() {
  const wm = document.getElementById('wmonth');
  wm.value = NOWMONTH();
  wm.addEventListener('change', renderWealth);

  /* Auf Touch-Geraeten feuert pointerleave nach einem Antippen nicht
     verlaesslich -- ohne dieses Netz bliebe der Tooltip stehen. */
  addEventListener('pointerup', hideTip);
  addEventListener('pointercancel', hideTip);
  addEventListener('scroll', hideTip, { passive: true });

  document.getElementById('wkindsel').innerHTML =
    KINDS.map(k => `<option value="${k.id}">${k.n}</option>`).join('');

  document.getElementById('wposform').addEventListener('submit', async e => {
    e.preventDefault();
    if (!DB) return toast('Kein Speicher verfügbar', true);
    const f = new FormData(e.target), name = (f.get('name') || '').trim();
    if (!name) return toast('Name fehlt', true);
    const id = 'a' + Math.random().toString(36).slice(2, 10);
    const doc = { id, name, kind: f.get('kind') };
    try {
      await DB.doc('assets/' + id).set(doc);
      ASSETS.push(doc);
      ASSETS.sort((x, y) => KINDS.findIndex(k => k.id === x.kind) - KINDS.findIndex(k => k.id === y.kind));
      e.target.reset(); renderWealth(); toast(`„${name}" angelegt`);
    } catch (err) { toast('Anlegen fehlgeschlagen: ' + err.message, true); }
  });

  /* Beim ersten Rendern ist der Tab ausgeblendet, clientWidth also 0. Der
     Observer zeichnet die Diagramme neu, sobald der Container Breite
     bekommt — und bei jeder echten Groessenaenderung danach (Drehung,
     Fenster). Ruft bewusst NUR redrawCharts() auf, nicht renderWealth():
     Das mobile Tastatur-Einblenden verschiebt auf manchen Geraeten die
     Layout-Breite geringfuegig und loeste hier sonst einen kompletten
     Rebuild der Positions-Eingabefelder aus -- man wurde beim Tippen
     mitten aus dem Feld geworfen. */
  let rt, lastW = 0;
  const ro = new ResizeObserver(entries => {
    const w = Math.round(entries[0].contentRect.width);
    if (!w || Math.abs(w - lastW) < 8) return;
    lastW = w;
    clearTimeout(rt); rt = setTimeout(redrawCharts, 60);
  });
  ro.observe(document.getElementById('wtrend'));
}
