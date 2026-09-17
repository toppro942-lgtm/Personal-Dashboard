import { api, eur, esc, thisMonth, today } from './api.js';
import { toast } from './health.js';

const $ = s => document.querySelector(s);
let cats = [];

const catOptions = sel => ['<option value="">— nicht kategorisiert —</option>',
  ...cats.map(c => `<option value="${c.id}"${c.id === sel ? ' selected' : ''}>${esc(c.name)}</option>`)].join('');

function renderSummary(s) {
  $('#fkpi').innerHTML = [
    ['Einnahmen', s.income_cents, '#2e9e6a'],
    ['Ausgaben', s.expense_cents, '#c94535'],
    ['Saldo Monat', s.net_cents, s.net_cents >= 0 ? '#2e9e6a' : '#c94535'],
    ['Kontostand', s.balance_cents, '#3a7bbf']
  ].map(([l, v, c]) => `<div class="mac">
      <div class="macv" style="color:${c};font-size:19px">${eur(v)}</div>
      <div class="macl" style="color:${c}">${esc(l)}</div></div>`).join('')
    + `<div class="mac"><div class="macv" style="color:#b8922e;font-size:19px">${s.savings_rate == null ? '–' : s.savings_rate + ' %'}</div>
       <div class="macl" style="color:#b8922e">Sparquote</div></div>`;

  /* Budget-Abgleich nur für Ausgabenkategorien mit gesetztem Budget. */
  $('#fbudget').innerHTML = s.categories.filter(c => c.spent_cents > 0).map(c => {
    const spent = c.spent_cents, budget = c.budget_cents || 0;
    const pct = budget ? Math.min(100, Math.round(spent / budget * 100)) : 0;
    const col = !budget ? '#4f4f4f' : spent > budget ? '#c94535' : spent > budget * 0.8 ? '#b8922e' : '#2e9e6a';
    return `<div class="card" style="border-left:3px solid ${c.color || '#4f4f4f'};padding:11px 14px">
      <div style="display:flex;justify-content:space-between;font-size:12px">
        <span style="color:var(--wh)">${esc(c.category)}</span>
        <span style="font-family:var(--mono);color:${col}">${eur(spent)}${budget ? ` / ${eur(budget)}` : ''}</span></div>
      ${budget ? `<div class="vbw" style="width:100%;margin-top:7px"><div class="vb" style="width:${pct}%;background:${col}"></div></div>` : ''}
      <div class="vn">${c.n} Buchungen${c.kind ? ` · ${esc(c.kind)}` : ''}${c.earned_cents ? ` · ${eur(c.earned_cents)} Eingang` : ''}</div></div>`;
  }).join('') || '<div class="vn">Keine Ausgaben in diesem Monat.</div>';
}

function renderTx(list) {
  $('#ftx').innerHTML = list.length ? list.map(t => `
    <div class="txrow">
      <div class="txdate">${esc(t.booked_on.slice(5))}</div>
      <div class="txmain">
        <div class="txparty">${esc(t.counterparty || '—')}</div>
        <div class="vn">${esc(t.purpose).slice(0, 90)}</div>
      </div>
      <select class="txcat" data-id="${t.id}">${catOptions(t.category_id)}</select>
      <div class="txamt" style="color:${t.amount_cents < 0 ? '#c94535' : '#2e9e6a'}">${eur(t.amount_cents)}</div>
      <button class="txdel" data-id="${t.id}" title="Löschen">✕</button>
    </div>`).join('') : '<div class="vn">Noch keine Buchungen. Manuell erfassen oder CSV importieren.</div>';

  $('#ftx').querySelectorAll('.txcat').forEach(s => s.onchange = async e => {
    try { await api.put(`/api/finance/tx/${e.target.dataset.id}`, { category_id: Number(e.target.value) || null }); await load(); }
    catch (err) { toast(err.message, true); }
  });
  $('#ftx').querySelectorAll('.txdel').forEach(b => b.onclick = async e => {
    if (!confirm('Buchung löschen?')) return;
    await api.del(`/api/finance/tx/${e.target.dataset.id}`); await load();
  });
}

async function load() {
  const month = $('#fmonth').value || thisMonth();
  const [sum, tx] = await Promise.all([
    api.get(`/api/finance/summary?month=${month}`),
    api.get(`/api/finance/tx?from=${month}-01&to=${month}-31&limit=300`)
  ]);
  renderSummary(sum); renderTx(tx.tx);
}

export async function initFinance() {
  cats = (await api.get('/api/finance/categories')).categories;
  $('#fmonth').value = thisMonth();
  $('#fmonth').onchange = load;
  $('#ftxcat').innerHTML = catOptions();
  $('#ftxday').value = today();

  $('#ftxform').addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const cents = Math.round(Number(String(f.get('amount')).replace(',', '.')) * 100);
    if (!Number.isFinite(cents) || cents === 0) return toast('Betrag ungültig', true);
    try {
      await api.post('/api/finance/tx', {
        booked_on: f.get('day'), amount_cents: cents,
        counterparty: f.get('party'), purpose: f.get('purpose'),
        category_id: Number(f.get('category')) || null
      });
      e.target.reset(); $('#ftxday').value = today(); $('#ftxcat').innerHTML = catOptions();
      toast('Buchung erfasst'); await load();
    } catch (err) { toast(err.message, true); }
  });

  $('#fimport').addEventListener('submit', async e => {
    e.preventDefault();
    const file = $('#fcsv').files[0];
    if (!file) return toast('Datei wählen', true);
    /* Bank-Exporte sind oft CP1252 — Heuristik: bei Ersatzzeichen erneut dekodieren. */
    const buf = await file.arrayBuffer();
    let text = new TextDecoder('utf-8').decode(buf);
    if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf);
    try {
      const r = await api.post('/api/finance/import', { text, profile: $('#fprofile').value });
      toast(`${r.imported} importiert · ${r.duplicates} Dubletten · ${r.unparsable} unlesbar`);
      e.target.reset(); await load();
    } catch (err) { toast(err.message, true); }
  });

  await load();
}
