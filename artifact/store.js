
/* ============================================================
   Health & Finanzen — Speicher liegt in der Artifact-Datenbank.
   Kein Server, kein Terminal: Handy und PC lesen denselben Stand.
   ============================================================ */

const CENT = c => (c / 100).toLocaleString('de-DE', { style:'currency', currency:'EUR' });
const NUM  = (v, d = 0) => v == null ? '–' : Number(v).toLocaleString('de-DE', { maximumFractionDigits:d });
const ESC  = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TODAY = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const NOWMONTH = () => TODAY().slice(0, 7);

const METRICS = {
  steps:        { label:'Schritte',    unit:'',    col:'#3a7bbf' },
  sleep_minutes:{ label:'Schlaf',      unit:'min', col:'#7a5ab5' },
  resting_hr:   { label:'Ruhepuls',    unit:'bpm', col:'#c94535' },
  active_kcal:  { label:'Aktive kcal', unit:'kcal',col:'#b86830' },
  weight_kg:    { label:'Gewicht',     unit:'kg',  col:'#2e9e6a' },
  hrv_ms:       { label:'HRV',         unit:'ms',  col:'#b8922e' }
};

const DEFAULT_CATS = [
  { id:'einkommen', n:'Einkommen',      k:'income',   b:0,     c:'#2e9e6a' },
  { id:'sparen',    n:'Sparen',         k:'saving',   b:0,     c:'#3a7bbf' },
  { id:'lebens',    n:'Lebensmittel',   k:'variable', b:12000, c:'#b8922e' },
  { id:'supp',      n:'Supplements',    k:'variable', b:4000,  c:'#b86830' },
  { id:'gym',       n:'Fitnessstudio',  k:'fixed',    b:3000,  c:'#c94535' },
  { id:'abos',      n:'Abos',           k:'fixed',    b:2000,  c:'#7a5ab5' },
  { id:'handy',     n:'Handy/Internet', k:'fixed',    b:1500,  c:'#7a5ab5' },
  { id:'mobil',     n:'Mobilität',      k:'variable', b:3000,  c:'#3a7bbf' },
  { id:'freizeit',  n:'Freizeit',       k:'variable', b:5000,  c:'#b8922e' },
  { id:'sonst',     n:'Sonstiges',      k:'variable', b:0,     c:'#4f4f4f' }
];

let DB = null, CATS = DEFAULT_CATS, HEALTH = [], TX = [], MONTH = NOWMONTH(), RULES = [];

/* ---------- Statusmeldung ---------- */
function toast(msg, isErr) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast on' + (isErr ? ' err' : '');
  clearTimeout(t._t); t._t = setTimeout(() => { t.className = 'toast'; }, 3800);
}

/* ---------- Sparkline: Flaeche + betonter Endpunkt ---------- */
function spark(points, color, w = 240, h = 44) {
  if (points.length < 2) return '<div class="vn" style="padding:6px 0">Ab zwei Tagen erscheint hier der Verlauf.</div>';
  const vals = points.map(p => p.v), min = Math.min(...vals), max = Math.max(...vals), span = max - min;
  /* Konstante Reihe hat keine Spanne — mittig zeichnen statt am Kartenboden. */
  const y = v => span ? h - (v - min) / span * (h - 8) - 4 : h / 2;
  const xy = points.map((p, i) => [i / (points.length - 1) * w, y(p.v)]);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [ex, ey] = xy[xy.length - 1];
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="spark" role="img" aria-label="Verlauf">
    <path d="${line} L${w},${h} L0,${h} Z" fill="${color}" fill-opacity=".10" stroke="none"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="2.6" fill="${color}"/></svg>`;
}

/* ---------- Datenbank ---------- */
async function initStore() {
  try { DB = (typeof claude !== 'undefined' && claude.use) ? await claude.use('db') : null; }
  catch { DB = null; }

  if (!DB) {
    for (const id of ['hbody', 'fbody', 'wbody']) document.getElementById(id).innerHTML =
      `<div class="unote">Der Speicher dieser Seite ist hier nicht verfügbar. Die Trainings-Tabs
       funktionieren weiter; Health und Finanzen brauchen die gespeicherte Fassung dieser Seite —
       öffne sie über den Link, den Claude dir gegeben hat.</div>`;
    return;
  }
  try {
    await loadSettings();
    await Promise.all([loadHealth(), loadMonth(), loadWealth()]);
    renderHealth(); renderFinance(); renderWealth();
  } catch (e) { toast('Daten konnten nicht geladen werden: ' + (e.message || e), true); }
}

async function loadSettings() {
  const snap = await DB.doc('settings/main').get();
  if (snap.exists) { CATS = snap.data.categories || DEFAULT_CATS; RULES = snap.data.rules || []; }
  else await DB.doc('settings/main').set({ categories: DEFAULT_CATS, rules: [] });
}
const saveSettings = () => DB.doc('settings/main').set({ categories: CATS, rules: RULES });

async function loadHealth() {
  const snap = await DB.collection('health').orderBy('day', 'desc').limit(90).get();
  HEALTH = snap.docs.map(d => d.data).sort((a, b) => a.day < b.day ? -1 : 1);
}

async function loadMonth() {
  const snap = await DB.doc('finance/' + MONTH).get();
  TX = snap.exists ? (snap.data.tx || []) : [];
}
const saveMonth = () => DB.doc('finance/' + MONTH).set({ month: MONTH, tx: TX });

/* ============================ HEALTH ============================ */

const fmtMetric = (key, v) => v == null ? '–'
  : key === 'sleep_minutes' ? `${Math.floor(v / 60)} h ${String(Math.round(v % 60)).padStart(2, '0')} min`
  : NUM(v, key === 'weight_kg' ? 1 : 0) + (METRICS[key].unit ? ' ' + METRICS[key].unit : '');

function renderHealth() {
  const last14 = HEALTH.slice(-14);
  document.getElementById('hcards').innerHTML = Object.entries(METRICS).map(([key, m]) => {
    const pts = last14.filter(d => typeof d[key] === 'number').map(d => ({ day:d.day, v:d[key] }));
    const latest = pts.length ? pts[pts.length - 1] : null;
    const avg = pts.length ? pts.reduce((a, p) => a + p.v, 0) / pts.length : null;
    return `<article class="hcard" style="--m:${m.col}">
      <header>
        <span class="hlabel">${m.label}</span>
        <span class="hmeta">${pts.length ? 'Ø ' + fmtMetric(key, Math.round(avg * 10) / 10) : 'noch nichts erfasst'}</span>
      </header>
      <div class="hvalue">${fmtMetric(key, latest?.v)}</div>
      <div class="hmeta">${latest ? latest.day.split('-').reverse().join('.') : 'Wert oben eintragen'}</div>
      ${spark(pts, m.col)}
    </article>`;
  }).join('');

  const days = HEALTH.length;
  document.getElementById('hcount').textContent =
    days ? `${days} erfasste ${days === 1 ? 'Tag' : 'Tage'}` : 'noch keine Einträge';
}

/* Spaltenerkennung fuer Google-Takeout ("Daily activity metrics.csv"),
   Health-Sync-Exporte und einfache eigene Tabellen. Gesucht wird per
   Teilstring, weil Google die Bezeichner regelmaessig umbenennt. */
const HCOLS = {
  steps:        ['step count','steps','schritte'],
  active_kcal:  ['calories (kcal)','calories','kalorien'],
  resting_hr:   ['min heart rate','resting heart','ruhepuls','average heart rate'],
  weight_kg:    ['average weight','weight (kg)','weight','gewicht'],
  hrv_ms:       ['heart rate variability','hrv'],
  sleep_minutes:['sleeping duration','sleep duration','asleep','schlafdauer','sleep']
};

function importHealthCsv(text) {
  const line = text.split('\n').find(l => l.trim()) || '';
  const delim = [',', ';', '\t'].sort((a, b) => line.split(b).length - line.split(a).length)[0];
  const rows = parseCsv(text, delim);
  const hi = rows.findIndex(r => findCol(r, ['date','datum','tag','day']) >= 0);
  if (hi < 0) return { error:'Keine Datumsspalte gefunden. Erwartet wird eine Tabelle mit einer Spalte „Date" oder „Datum" und je einer Spalte pro Messwert.' };
  const h = rows[hi], di = findCol(h, ['date','datum','tag','day']);
  const map = {};
  for (const [metric, names] of Object.entries(HCOLS)) {
    const i = findCol(h, names);
    if (i >= 0) map[metric] = { i, ms: /duration|dauer/i.test(h[i]) && /\(ms\)|millis/i.test(h[i]) };
  }
  if (!Object.keys(map).length) return { error:'Datumsspalte gefunden, aber keine bekannten Messwerte. Unterstützt: Schritte, Kalorien, Puls, Gewicht, HRV, Schlaf.' };

  const out = [];
  for (const r of rows.slice(hi + 1)) {
    const day = toIso(r[di]);
    if (!day) continue;
    const doc = { day };
    for (const [metric, { i, ms }] of Object.entries(map)) {
      const raw = String(r[i] ?? '').replace(',', '.').trim();
      if (!raw) continue;
      let v = Number(raw);
      if (!Number.isFinite(v) || v === 0) continue;
      if (metric === 'sleep_minutes') v = ms ? v / 60000 : (v > 1440 ? v / 60000 : v);
      doc[metric] = Math.round(v * 10) / 10;
    }
    if (Object.keys(doc).length > 1) out.push(doc);
  }
  return out.length ? { rows: out, metrics: Object.keys(map) }
                    : { error:'Datei gelesen, aber keine verwertbaren Zeilen gefunden.' };
}

async function saveMetric(day, metric, value) {
  const ref = DB.collection('health').doc(day);
  const snap = await ref.get();
  const doc = snap.exists ? { ...snap.data } : { day };
  doc[metric] = value;
  await ref.set(doc);
  const i = HEALTH.findIndex(d => d.day === day);
  if (i >= 0) HEALTH[i] = doc; else HEALTH.push(doc);
  HEALTH.sort((a, b) => a.day < b.day ? -1 : 1);
  renderHealth();
}

async function saveDay(day, values) {
  const ref = DB.collection('health').doc(day);
  const snap = await ref.get();
  const doc = snap.exists ? { ...snap.data, day } : { day };
  Object.assign(doc, values);
  await ref.set(doc);
  const i = HEALTH.findIndex(d => d.day === day);
  if (i >= 0) HEALTH[i] = doc; else HEALTH.push(doc);
  HEALTH.sort((a, b) => a.day < b.day ? -1 : 1);
}

/* ============================ FINANZEN ============================ */

const catById = id => CATS.find(c => c.id === id);

function classify(t) {
  const hay = `${t.c} ${t.p}`.toLowerCase();
  return RULES.find(r => hay.includes(r.pattern.toLowerCase()))?.cat ?? null;
}

/* Betraege durchgehend in ganzen Cent — Float-Arithmetik ist bei Geld eine Fehlerquelle. */
function toCents(raw) {
  let s = String(raw ?? '').replace(/[\s€"']/g, '');
  if (!s) return null;
  const neg = s.startsWith('-') || /^\(.*\)$/.test(s);
  s = s.replace(/[()+-]/g, '');
  const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
  if (lc > ld) s = s.replace(/\./g, '').replace(',', '.');
  else if (ld > lc) s = s.replace(/,/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? (neg ? -1 : 1) * Math.round(n * 100) : null;
}

function toIso(raw) {
  const s = String(raw ?? '').trim();
  let m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})$/);
  if (m) return `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : null;
}

function parseCsv(text, delim) {
  const rows = []; let row = [], field = '', quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) { if (ch === '"') { if (src[i+1] === '"') { field += '"'; i++; } else quoted = false; } else field += ch; }
    else if (ch === '"') quoted = true;
    else if (ch === delim) { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(f => f.trim() !== ''));
}

const COLS = {
  date:   ['buchungstag','buchungsdatum','datum','valuta','booking date','date'],
  amount: ['betrag','amount (eur)','amount','umsatz'],
  party:  ['beguenstigter','begünstigter','zahlungsempfänger','zahlungspflichtige','auftraggeber','partner name','payee','name'],
  purpose:['verwendungszweck','buchungstext','payment reference','reference','description']
};
const findCol = (h, names) => h.findIndex(x => names.some(n => x.toLowerCase().trim().includes(n)));

function importCsv(text) {
  const line = text.split('\n').find(l => l.trim()) || '';
  const delim = [';', ',', '\t'].sort((a, b) => line.split(b).length - line.split(a).length)[0];
  const rows = parseCsv(text, delim);
  /* Bank-Exporte stellen dem Header oft Meta-Zeilen voran — die erste Zeile,
     die Datum UND Betrag enthält, ist der echte Header. */
  const hi = rows.findIndex(r => findCol(r, COLS.date) >= 0 && findCol(r, COLS.amount) >= 0);
  if (hi < 0) return { error:'In dieser Datei sind keine Spalten für Datum und Betrag zu finden. Exportiere die Umsätze als CSV und versuche es erneut.' };
  const h = rows[hi];
  const ci = { d:findCol(h, COLS.date), a:findCol(h, COLS.amount), p:findCol(h, COLS.party), z:findCol(h, COLS.purpose) };
  const seen = new Set(TX.map(t => `${t.d}|${t.a}|${t.c}|${t.p}`));
  let added = 0, dup = 0, skip = 0, other = 0;
  for (const r of rows.slice(hi + 1)) {
    const d = toIso(r[ci.d]), a = toCents(r[ci.a]);
    if (!d || a === null) { skip++; continue; }
    if (d.slice(0, 7) !== MONTH) { other++; continue; }
    const t = { id:'t' + Math.random().toString(36).slice(2, 10), d, a,
                c:(ci.p >= 0 ? r[ci.p] : '').trim(), p:(ci.z >= 0 ? r[ci.z] : '').trim() };
    const key = `${t.d}|${t.a}|${t.c}|${t.p}`;
    if (seen.has(key)) { dup++; continue; }
    seen.add(key); t.cat = classify(t); TX.push(t); added++;
  }
  TX.sort((a, b) => a.d < b.d ? 1 : -1);
  return { added, dup, skip, other };
}

function summarise() {
  let income = 0, expense = 0;
  const per = new Map();
  for (const t of TX) {
    if (t.a > 0) income += t.a; else expense += t.a;
    const k = t.cat || '_';
    const e = per.get(k) || { spent:0, earned:0, n:0 };
    if (t.a < 0) e.spent -= t.a; else e.earned += t.a;
    e.n++; per.set(k, e);
  }
  return { income, expense, net: income + expense, per };
}

function renderFinance() {
  const s = summarise();
  document.getElementById('fkpi').innerHTML = [
    ['Einnahmen', s.income, 'pos'], ['Ausgaben', s.expense, 'neg'],
    ['Saldo', s.net, s.net >= 0 ? 'pos' : 'neg'],
    ['Sparquote', s.income > 0 ? NUM(s.net / s.income * 100, 1) : null, 'neu']
  ].map(([l, v, tone]) => `<div class="kpi ${tone}">
      <div class="kpiv">${l === 'Sparquote' ? (v == null ? '–' : v + ' %') : CENT(v)}</div>
      <div class="kpil">${l}</div></div>`).join('');

  const budgets = CATS.filter(c => c.b > 0).map(c => {
    const e = s.per.get(c.id) || { spent:0, n:0 };
    const pct = Math.min(100, Math.round(e.spent / c.b * 100));
    const tone = e.spent > c.b ? 'over' : e.spent > c.b * 0.8 ? 'near' : 'ok';
    return { c, e, pct, tone };
  }).sort((a, b) => b.e.spent - a.e.spent);

  document.getElementById('fbudget').innerHTML = budgets.map(({ c, e, pct, tone }) => `
    <div class="bud ${tone}">
      <div class="budhead"><span>${ESC(c.n)}</span>
        <span class="budnum">${CENT(e.spent)} <span class="budof">von ${CENT(c.b)}</span></span></div>
      <div class="budtrack"><div class="budfill" style="width:${pct}%"></div></div>
      <div class="hmeta">${e.n ? `${e.n} ${e.n === 1 ? 'Buchung' : 'Buchungen'}` : 'noch nichts gebucht'}${
        e.spent > c.b ? ` · ${CENT(e.spent - c.b)} über Budget` : ''}</div>
    </div>`).join('');

  const opts = sel => ['<option value="">ohne Kategorie</option>',
    ...CATS.map(c => `<option value="${c.id}"${c.id === sel ? ' selected' : ''}>${ESC(c.n)}</option>`)].join('');
  document.getElementById('ftxcat').innerHTML = opts();

  document.getElementById('ftx').innerHTML = TX.length ? TX.map(t => `
    <div class="txrow">
      <div class="txdate">${t.d.slice(8)}.${t.d.slice(5,7)}.</div>
      <div class="txmain"><div class="txparty">${ESC(t.c || 'Ohne Angabe')}</div>
        <div class="hmeta">${ESC(t.p).slice(0, 80) || '—'}</div></div>
      <select class="txcat" data-id="${t.id}" aria-label="Kategorie">${opts(t.cat)}</select>
      <div class="txamt ${t.a < 0 ? 'neg' : 'pos'}">${CENT(t.a)}</div>
      <button class="txdel" data-id="${t.id}" aria-label="Buchung löschen">✕</button>
    </div>`).join('')
    : `<div class="empty">Für ${MONTH.slice(5)}/${MONTH.slice(0,4)} ist noch nichts erfasst.
       Trage oben eine Buchung ein oder lade den CSV-Export deiner Bank hoch.</div>`;

  document.querySelectorAll('.txcat').forEach(el => el.onchange = async e => {
    const t = TX.find(x => x.id === e.target.dataset.id);
    t.cat = e.target.value || null;
    await saveMonth(); renderFinance();
  });
  document.querySelectorAll('.txdel').forEach(el => el.onclick = async e => {
    TX = TX.filter(x => x.id !== e.target.dataset.id);
    await saveMonth(); renderFinance(); toast('Buchung gelöscht');
  });
}

/* ============================ Formulare ============================ */

function wireForms() {
  document.getElementById('hday').value = TODAY();
  document.getElementById('ftxday').value = TODAY();
  document.getElementById('fmonth').value = MONTH;

  document.getElementById('hform').addEventListener('submit', async e => {
    e.preventDefault();
    if (!DB) return toast('Kein Speicher verfügbar', true);
    const f = new FormData(e.target), day = f.get('day'), vals = {};
    for (const key of Object.keys(METRICS)) {
      const raw = String(f.get(key) ?? '').replace(',', '.').trim();
      if (!raw) continue;
      /* Schlaf darf als 8:15 oder als 495 eingetragen werden. */
      if (key === 'sleep_minutes' && raw.includes(':')) {
        const [hh, mm] = raw.split(':');
        vals[key] = (+hh) * 60 + (+mm || 0);
      } else if (Number.isFinite(Number(raw))) vals[key] = Number(raw);
    }
    if (!Object.keys(vals).length) return toast('Mindestens einen Wert eintragen', true);
    try {
      await saveDay(day, vals);
      renderHealth();
      e.target.querySelectorAll('input[type=text],input[type=number]').forEach(i => { i.value = ''; });
      toast(`${Object.keys(vals).length} Wert${Object.keys(vals).length === 1 ? '' : 'e'} gespeichert`);
    } catch (err) { toast('Speichern fehlgeschlagen: ' + (err.message || err), true); }
  });

  document.getElementById('himport').addEventListener('submit', async e => {
    e.preventDefault();
    if (!DB) return toast('Kein Speicher verfügbar', true);
    const file = document.getElementById('hcsv').files[0];
    if (!file) return toast('Erst eine Datei auswählen', true);
    const r = importHealthCsv(await file.text());
    if (r.error) return toast(r.error, true);
    try {
      /* Nur die letzten 90 Tage uebernehmen: aeltere Werte helfen der
         Auswertung nicht und wuerden das Dokumentbudget verbrauchen. */
      const cutoff = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
      const recent = r.rows.filter(d => d.day >= cutoff);
      for (const d of recent) { const { day, ...v } = d; await saveDay(day, v); }
      renderHealth(); e.target.reset();
      toast(`${recent.length} Tage übernommen${r.rows.length > recent.length
        ? ` · ${r.rows.length - recent.length} älter als 90 Tage übersprungen` : ''}`);
    } catch (err) { toast('Import fehlgeschlagen: ' + (err.message || err), true); }
  });

  document.getElementById('fmonth').addEventListener('change', async e => {
    MONTH = e.target.value || NOWMONTH();
    if (!DB) return;
    await loadMonth(); renderFinance();
  });

  document.getElementById('ftxform').addEventListener('submit', async e => {
    e.preventDefault();
    if (!DB) return toast('Kein Speicher verfügbar', true);
    const f = new FormData(e.target), a = toCents(f.get('amount'));
    if (a === null || a === 0) return toast('Betrag prüfen — z. B. -42,35', true);
    const d = f.get('day');
    if (d.slice(0, 7) !== MONTH) return toast(`Das Datum liegt nicht im Monat ${MONTH} — oben den Monat wechseln.`, true);
    TX.push({ id:'t' + Math.random().toString(36).slice(2,10), d, a,
              c:(f.get('party') || '').trim(), p:(f.get('purpose') || '').trim(),
              cat:f.get('category') || null });
    TX.sort((x, y) => x.d < y.d ? 1 : -1);
    try { await saveMonth(); e.target.reset(); document.getElementById('ftxday').value = TODAY();
          renderFinance(); toast('Buchung erfasst'); }
    catch (err) { toast('Speichern fehlgeschlagen: ' + (err.message || err), true); }
  });

  document.getElementById('fimport').addEventListener('submit', async e => {
    e.preventDefault();
    if (!DB) return toast('Kein Speicher verfügbar', true);
    const file = document.getElementById('fcsv').files[0];
    if (!file) return toast('Erst eine Datei auswählen', true);
    const buf = await file.arrayBuffer();
    /* Deutsche Bank-Exporte sind haeufig CP1252: bei Ersatzzeichen neu dekodieren. */
    let text = new TextDecoder('utf-8').decode(buf);
    const REPL = String.fromCharCode(0xFFFD);
    if (text.includes(REPL)) text = new TextDecoder('windows-1252').decode(buf);
    const r = importCsv(text);
    if (r.error) return toast(r.error, true);
    try {
      await saveMonth(); e.target.reset(); renderFinance();
      toast(`${r.added} übernommen${r.dup ? ` · ${r.dup} schon vorhanden` : ''}${
        r.other ? ` · ${r.other} aus anderen Monaten übersprungen` : ''}`);
    } catch (err) { toast('Speichern fehlgeschlagen: ' + (err.message || err), true); }
  });
}

/* Plan-Tabs zuerst — sie brauchen keinen Speicher und stehen sofort. */
renderDayBar(); renderDay('mo'); renderVol(); renderFood();
renderSleep(); renderMob(); renderEve(); renderMor();
wireForms();
wireWealth();
initStore();
