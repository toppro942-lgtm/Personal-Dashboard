import { AC, DAYS, TG, S, VOL, MACROS, MEALS, FOODTIPS, TIMING, SLEEP, SLEEPTIPS, MOBSEQ, MOBMILES, EVENING, MORNING } from './plan-data.js';

const $  = (s, r = document) => r.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));

/* ---------- Tabs (Event-Delegation statt inline onclick) ---------- */
export function initTabs() {
  const bar = $('.tabs');
  bar.addEventListener('click', e => {
    const b = e.target.closest('.tb'); if (!b) return;
    bar.querySelectorAll('.tb').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.tc').forEach(x => x.classList.toggle('on', x.id === 't-' + b.dataset.tab));
  });
}

/* ---------- Platzhalter für fehlende Inhalte ---------- */
const missing = what => `<div class="unote">Keine Daten für <b>${esc(what)}</b>. Der Original-Upload von
  <code>dashboard.html</code> war abgeschnitten; diese Inhalte fehlen im Repository.
  Nachtragen in <code>public/js/plan-data.js</code>.</div>`;

/* ---------- Trainingstage ---------- */
let activeDay = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].id;

function renderDayBar() {
  const bar = $('#dbar'); bar.innerHTML = '';
  for (const d of DAYS) {
    const b = el('button', 'db' + (d.id === activeDay ? ' on' : ''));
    b.innerHTML = `<div class="dt">${d.s}</div><div class="dd" style="background:${AC[d.id]}"></div><div class="dn">${esc(d.n)}</div>`;
    b.onclick = () => { activeDay = d.id; renderDayBar(); renderDay(); };
    bar.appendChild(b);
  }
}

function exerciseCard(x) {
  const g = TG[x.tag] || TG.N;
  const c = el('div', 'ec');
  c.style.setProperty('--ac', g.c);
  const metrics = Object.entries(x.m || {})
    .map(([k, v]) => `<div class="mc"><div class="ml">${esc(k)}</div><div class="mv">${esc(v)}</div></div>`).join('');
  c.innerHTML = `
    <div class="eh">
      <div style="flex:1">
        <div class="enr"><div class="en">${esc(x.n)}</div>
          <span class="etg" style="background:${g.b};color:${g.c}">${g.t}</span></div>
        ${x.tr ? `<div class="etr">${esc(x.tr)}</div>` : ''}
      </div>
      <div class="eb"><span class="esb">${esc(x.sets || '')}</span><span class="echv">▾</span></div>
    </div>
    <div class="ebd">
      ${metrics ? `<div class="mr">${metrics}</div>` : ''}
      ${x.u ? `<div class="ub"><div class="ubl" style="color:${g.c}">Ausführung</div><div class="uc">${esc(x.u)}</div></div>` : ''}
      ${x.w ? `<div><div class="wl">Begründung</div><div class="wt">${esc(x.w)}</div></div>` : ''}
      ${x.note ? `<div class="unote">${esc(x.note)}</div>` : ''}
    </div>`;
  c.querySelector('.eh').onclick = () => c.classList.toggle('op');
  return c;
}

function renderDay() {
  const d = S[activeDay], box = $('#dc'); box.innerHTML = '';
  const head = el('div', 'sc');
  head.style.borderTopColor = d.ac;
  head.innerHTML = `<div class="st">
      <div><div class="sdl" style="color:${d.ac}">${esc(d.lb)}</div><div class="stt">${esc(d.ti)}</div></div>
      <div class="mb"><span class="mbg">${esc(d.du)}</span><span class="mbg">${esc(d.rp)}</span><span class="mbg">${esc(d.rr)}</span></div>
    </div>${d.lg ? `<div class="sl">${esc(d.lg)}</div>` : ''}`;
  box.appendChild(head);
  if (!d.ex?.length) { box.insertAdjacentHTML('beforeend', missing(d.lb)); return; }
  box.insertAdjacentHTML('beforeend', '<div class="esl">Übungen</div>');
  d.ex.forEach(x => box.appendChild(exerciseCard(x)));
}

/* ---------- Volumen ---------- */
function renderVolume() {
  const tb = $('#vtb'); tb.innerHTML = '';
  for (const [name, mo, mi, fr, sa, syn, lo, hi, note] of VOL) {
    const total = mo + mi + fr + sa + syn;
    const col = total < lo ? 'var(--yel)' : total > hi ? 'var(--red)' : 'var(--grn)';
    const pct = Math.min(100, Math.round(total / hi * 100));
    tb.insertAdjacentHTML('beforeend', `<tr>
      <td>${esc(name)}${note ? `<div class="vn">${esc(note)}</div>` : ''}</td>
      <td>${mo || '·'}</td><td>${mi || '·'}</td><td>${fr || '·'}</td><td>${sa || '·'}</td><td>${syn || '·'}</td>
      <td style="color:${col};font-weight:500">${total}
        <div class="vbw"><div class="vb" style="width:${pct}%;background:${col}"></div></div></td>
      <td style="color:var(--dim)">${lo}–${hi}</td></tr>`);
  }
}

/* ---------- generische Renderer ---------- */
const noteList = (sel, arr, what) => {
  const box = $(sel); if (!box) return;
  box.innerHTML = arr.length
    ? arr.map(n => `<div class="nt"><div class="ni">${esc(n.i)}</div><div class="ntx">${esc(n.t)}</div></div>`).join('')
    : missing(what);
};

const dayGrid = (sel, arr, what) => {
  const box = $(sel); if (!box) return;
  if (!arr.length) { box.outerHTML = `<div id="${sel.slice(1)}">${missing(what)}</div>`; return; }
  box.innerHTML = arr.map(m => `<div class="mday" style="border-left-color:${m.c || 'var(--bd)'}">
      <div class="mdn" style="color:${m.c || 'var(--dim)'}">${esc(m.d)}</div>
      <div class="mdm">${esc(m.m)}</div><div class="mdt">${esc(m.t)}</div>
      ${(m.tags || []).map(t => `<span class="mdtag" style="background:#1e1e1e;color:${m.c || 'var(--mut)'}">${esc(t)}</span>`).join('')}
    </div>`).join('');
};

function renderMacros() {
  $('#macros').innerHTML = MACROS.map(m => `<div class="mac">
      <div class="macv" style="color:${m.c}">${esc(m.v)}</div>
      <div class="macl" style="color:${m.c}">${esc(m.l)}</div>
      <div class="macs">${esc(m.s)}</div></div>`).join('');
}

function renderMobility() {
  const seq = $('#mobseq');
  seq.innerHTML = MOBSEQ.length
    ? MOBSEQ.map((s, i) => `<div class="morrow"><div class="morn">${i + 1}</div>
        <div class="mortxt"><b>${esc(s.t)}</b> — ${esc(s.d)}</div></div>`).join('')
    : missing('Mobility-Ablauf');
  noteList('#mobmiles', MOBMILES, 'Mobility-Meilensteine');
}

function renderEvening() {
  const tl = $('#evetl');
  tl.innerHTML = EVENING.length
    ? EVENING.map(e => `<div class="tlitem">
        <div class="tldot" style="border-color:${e.c}"></div>
        <div class="tltime" style="color:${e.c}">${esc(e.time)}</div>
        <div class="tltitle">${esc(e.title)}</div>
        ${(e.b || []).map(b => `<div class="tlbullet">${b}</div>`).join('')}</div>`).join('')
    : missing('Abendroutine');
}

function renderMorning() {
  $('#morlist').innerHTML = MORNING.length
    ? MORNING.map((t, i) => `<div class="morrow"><div class="morn">${i + 1}</div>
        <div class="mortxt">${esc(t)}</div></div>`).join('')
    : missing('Morgenroutine');
}

export function initPlan() {
  initTabs();
  renderDayBar(); renderDay(); renderVolume(); renderMacros();
  dayGrid('#mealgrid', MEALS, 'Ernährungs-Wochenplan');
  noteList('#foodtips', FOODTIPS, 'Ernährungs-Optimierungen');
  noteList('#timing', TIMING, 'Nährstoff-Timing');
  dayGrid('#sgrid', SLEEP, 'Schlaf-Wochenplan');
  noteList('#stips', SLEEPTIPS, 'Schlaf-Maßnahmen');
  renderMobility(); renderEvening(); renderMorning();
}
