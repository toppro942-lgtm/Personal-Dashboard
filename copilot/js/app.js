// Orchestrierung: Spracherkennung → Fragenerkennung → Claude → Antwortkarte.
import * as store from './store.js';
import { isQuestion } from './detect.js';
import { createRecognizer, supported } from './stt.js';
import * as ai from './ai.js';
import * as P from './prompts.js';
import * as ui from './ui.js';

const AUTO_DELAY = 1200; // ms nach erkannter Frage warten (Lehrkraft formuliert oft nach)
const AUTO_GAP = 6000;   // ms Mindestabstand zwischen Auto-Anfragen (Kostenbremse)

const $ = s => document.querySelector(s);
const dlg = $('#cfg');

let cfg = store.loadSettings();
let session = store.loadSession();
let rec = null, autoTimer = 0, lastAuto = 0, wake = null, clock = 0;

const persist = () => store.saveSession(session);

// --- Transkript
function onFinal(text) {
  const seg = { t: Date.now(), text, q: isQuestion(text) };
  session.segs.push(seg);
  persist();
  ui.addSeg(seg, session.start, pick);
  if (seg.q && cfg.auto) scheduleAuto();
}

function scheduleAuto() {
  clearTimeout(autoTimer);
  const delay = Math.max(AUTO_DELAY, lastAuto + AUTO_GAP - Date.now());
  autoTimer = setTimeout(() => { lastAuto = Date.now(); run('answer', null, true); }, delay);
}

const pick = text => run('answer', text);

function context(mode) {
  const { sec, chars } = P.WINDOW[mode];
  const from = Date.now() - sec * 1000;
  let segs = session.segs.filter(s => s.t >= from);
  if (segs.length < 3) segs = session.segs.slice(-6); // nach Stille trotzdem letzte Äußerungen
  return segs.map(s => `[${ui.fmt(s.t - session.start)}] ${s.text}`).join('\n').slice(-chars);
}

// --- KI-Anfrage
async function run(mode, focus = null, auto = false) {
  if (!cfg.apiKey) { ui.notice('API-Key fehlt – unter ⚙ eintragen.'); openCfg(); return; }
  clearTimeout(autoTimer);
  const t0 = performance.now();
  ui.startAnswer(mode, auto);
  try {
    const text = await ai.ask({
      apiKey: cfg.apiKey,
      model: cfg.model,
      system: P.system(cfg),
      prompt: P.user(mode, context(mode), focus),
      onText: ui.renderAnswer,
    });
    ui.renderAnswer(text);
    ui.doneAnswer(performance.now() - t0);
    session.answers.push({ t: Date.now(), mode, text });
    persist();
  } catch (e) {
    if (e.code === 'cancelled') return; // durch neuere Anfrage ersetzt oder per Esc gestoppt
    ui.failAnswer(e.message);
    if (e.code === 'auth') openCfg();
  }
}

// --- Aufnahme
async function toggleRec() {
  if (rec?.active) return rec.stop();
  if (!supported()) return ui.notice('Spracherkennung nicht verfügbar – Chrome oder Edge verwenden.');
  if (store.isStale(session)) { session = store.newSession(); ui.clearLog(); persist(); }
  if (!session.segs.length) session.start = Date.now();
  rec = createRecognizer({ lang: cfg.lang, onFinal, onInterim: ui.setInterim, onState });
  ai.warm();
  await rec.start();
}

function onState(state, info) {
  ui.setRec(state, info);
  if (state === 'denied') ui.notice('Mikrofon blockiert – Berechtigung in der Adressleiste erlauben.');
  if (state === 'error') ui.notice(`Spracherkennung: ${info}`);
  const on = state === 'on' || state === 'unstable';
  clearInterval(clock);
  if (on) {
    lockScreen();
    clock = setInterval(() => ui.setClock(Date.now() - session.start), 1000);
  } else {
    wake?.release().catch(() => {});
    wake = null;
  }
}

// Bildschirm wach halten – sonst stoppt die Erkennung beim Display-Timeout
async function lockScreen() {
  if (wake && !wake.released) return;
  try { wake = await navigator.wakeLock?.request('screen'); } catch { /* nicht unterstützt */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && rec?.active) lockScreen();
});

// --- Einstellungen
function openCfg() {
  if (dlg.open) return;
  const f = dlg.querySelector('form');
  for (const [k, v] of Object.entries(cfg)) {
    const input = f.elements[k];
    if (!input) continue;
    if (input.type === 'checkbox') input.checked = v; else input.value = v;
  }
  dlg.returnValue = '';
  dlg.showModal();
}

dlg.addEventListener('close', () => {
  if (dlg.returnValue !== 'ok') return;
  const f = dlg.querySelector('form');
  const prev = cfg;
  cfg = {
    ...cfg,
    ...Object.fromEntries(['apiKey', 'model', 'lang', 'fach', 'thema', 'notes'].map(k => [k, f.elements[k].value.trim()])),
    auto: f.elements.auto.checked,
  };
  store.saveSettings(cfg);
  ui.setContext(cfg.fach, cfg.thema);
  if (rec?.active && prev.lang !== cfg.lang) { rec.stop(); setTimeout(toggleRec, 300); }
});

function newLesson() {
  if (!confirm('Transkript und Antworten dieser Stunde löschen?')) return;
  ai.cancel();
  session = store.newSession();
  persist();
  ui.clearLog();
  ui.setClock(0);
  ui.notice('Neue Stunde angelegt.');
}

function exportMd() {
  const d = new Date(session.start);
  const at = t => ui.fmt(t - session.start);
  const md = [
    `# Mitschrift${cfg.fach ? ` ${cfg.fach}` : ''} – ${d.toLocaleDateString('de-DE')}`,
    cfg.thema ? `Thema: ${cfg.thema}\n` : '',
    '## Transkript',
    ...session.segs.map(s => `- \`${at(s.t)}\` ${s.q ? '**[Frage]** ' : ''}${s.text}`),
    '',
    '## KI-Hilfen',
    ...session.answers.map(a => `### ${at(a.t)} · ${P.LABEL[a.mode]}\n${a.text}\n`),
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
  a.download = `Mitschrift_${(cfg.fach || 'Unterricht').replace(/\W+/g, '_')}_${d.toISOString().slice(0, 10)}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// --- Bedienung
$('#rec').onclick = toggleRec;
$('#gear').onclick = openCfg;
$('#export').onclick = exportMd;
$('#reset').onclick = newLesson;
document.querySelectorAll('[data-mode]').forEach(b => { b.onclick = () => run(b.dataset.mode); });
$('#askf').onsubmit = e => {
  e.preventDefault();
  const q = $('#ask').value.trim();
  if (!q) return;
  $('#ask').value = '';
  $('#ask').blur();
  run('answer', q);
};

const KEYS = { a: () => run('answer'), r: () => run('recap'), b: () => run('contribute'), s: toggleRec };
document.addEventListener('keydown', e => {
  if (dlg.open || e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select')) return;
  if (e.key === 'Escape') {
    if ($('#card').classList.contains('busy')) { ai.cancel(); ui.failAnswer('abgebrochen'); }
    return;
  }
  const fn = KEYS[e.key.toLowerCase()];
  if (fn) { e.preventDefault(); fn(); }
});

// --- Init
$('#model').append(...ai.MODELS.map(m => new Option(m.label, m.id)));
ui.setContext(cfg.fach, cfg.thema);
ui.setRec('off');
if (!store.isStale(session)) {
  session.segs.forEach(s => ui.addSeg(s, session.start, pick));
  const last = session.answers.at(-1);
  if (last) ui.renderAnswer(last.text);
  if (session.segs.length) ui.setClock(session.segs.at(-1).t - session.start);
}
if (!cfg.apiKey) openCfg();
