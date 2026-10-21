// DOM-Rendering. Fremdtext (Transkript, KI-Ausgabe) ausschließlich via textContent → XSS-sicher.
import { LABEL } from './prompts.js';

const $ = s => document.querySelector(s);
const log = $('#log'), card = $('#card'), answer = $('#answer');

export const fmt = ms => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// --- Transkript
function nearBottom() { return log.scrollHeight - log.scrollTop - log.clientHeight < 60; }

export function addSeg(seg, start, onPick) {
  const stick = nearBottom();
  const li = document.createElement('li');
  if (seg.q) li.className = 'q';
  const t = document.createElement('time');
  t.textContent = fmt(seg.t - start);
  li.append(t, document.createTextNode(seg.text));
  li.title = 'Antippen: genau diese Stelle beantworten';
  li.onclick = () => onPick(seg.text);
  log.append(li);
  if (stick) log.scrollTop = log.scrollHeight;
}

export const clearLog = () => log.replaceChildren();
export const setInterim = text => { $('#interim').textContent = text; };

// --- Antwortkarte: Zeilenformat F:/A:/+/B: wird schon während des Streamings strukturiert
const KIND = { 'F:': 'aq', 'A:': 'aa', 'B:': 'ab' };

export function renderAnswer(text) {
  const frag = document.createDocumentFragment();
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const p = document.createElement('p');
    const kind = KIND[line.slice(0, 2).toUpperCase()];
    if (kind) { p.className = kind; p.textContent = line.slice(2).trim(); }
    else if (/^[+•\-–*]/.test(line)) { p.className = 'ap'; p.textContent = line.replace(/^[+•\-–*]\s*/, ''); }
    else p.textContent = line;
    frag.append(p);
  }
  answer.replaceChildren(frag);
}

function setCard(cls, mode, state) {
  card.className = `card ${cls}`;
  $('#mode').textContent = mode;
  $('#state').textContent = state;
}

export function startAnswer(mode, auto) {
  setCard('busy', LABEL[mode] + (auto ? ' · auto' : ''), 'denkt …');
  answer.replaceChildren();
}
export const doneAnswer = ms => setCard('done', $('#mode').textContent, `${(ms / 1000).toFixed(1)} s`);
export const failAnswer = msg => setCard('err', $('#mode').textContent || 'Fehler', msg);

export function notice(msg) {
  setCard('err', 'Hinweis', '');
  const p = document.createElement('p');
  p.className = 'hint';
  p.textContent = msg;
  answer.replaceChildren(p);
}

// --- Statusleiste
const BADGE = {
  on: m => (m === 'local' ? 'lokal' : 'cloud'), off: () => 'aus', unstable: () => 'instabil',
  denied: () => 'kein Mikro', error: () => 'Fehler',
};

export function setRec(state, info) {
  const on = state === 'on' || state === 'unstable';
  const btn = $('#rec');
  btn.textContent = on ? '■ Stop' : '● Start';
  btn.classList.toggle('on', on);
  btn.setAttribute('aria-pressed', String(on));
  const badge = $('#badge');
  badge.textContent = BADGE[state](info);
  badge.dataset.state = state === 'on' ? info : state;
}

export const setClock = ms => { $('#clock').textContent = fmt(ms); };
export const setContext = (fach, thema) => { $('#ctx').textContent = [fach, thema].filter(Boolean).join(' · '); };
