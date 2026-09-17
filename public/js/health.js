import { api, num, esc, sparkline, today } from './api.js';

const $ = s => document.querySelector(s);
const COLORS = { steps:'#3a7bbf', resting_hr:'#c94535', sleep_minutes:'#7a5ab5',
                 active_kcal:'#b86830', weight_kg:'#2e9e6a', hrv_ms:'#b8922e' };

const fmt = (key, v) => v == null ? '–'
  : key === 'sleep_minutes' ? `${Math.floor(v / 60)}h ${String(Math.round(v % 60)).padStart(2, '0')}m`
  : num(v, key === 'weight_kg' ? 1 : 0);

function renderCards(sum) {
  $('#hcards').innerHTML = Object.entries(sum.metrics).map(([key, m]) => `
    <div class="card" style="border-left:3px solid ${COLORS[key]}">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <div class="macl" style="color:${COLORS[key]}">${esc(m.label)}</div>
        <div class="vn">${m.count ? `Ø7 ${fmt(key, m.avg)}` : 'keine Daten'}</div>
      </div>
      <div class="macv" style="margin:6px 0 2px">${fmt(key, m.latest)}</div>
      <div class="vn">${m.latestDay ? `${esc(m.latestDay)} · ${esc(m.source || '')}` : '—'}</div>
      ${sparkline(m.points, COLORS[key])}
    </div>`).join('');
}

async function renderGoogle() {
  const s = await api.get('/api/integrations/google/status');
  $('#gstatus').innerHTML = `
    <div class="unote">${esc(s.deprecationNotice)}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
      <span class="mbg">${s.configured ? (s.connected ? '● verbunden' : '○ nicht verbunden') : '○ nicht konfiguriert'}</span>
      ${s.configured && !s.connected ? '<a class="btn" href="/api/integrations/google/connect">Google verbinden</a>' : ''}
      ${s.connected ? '<button class="btn" id="gsync">Jetzt synchronisieren</button><button class="btn danger" id="gdis">Trennen</button>' : ''}
    </div>`;
  $('#gsync')?.addEventListener('click', async e => {
    e.target.disabled = true; e.target.textContent = 'Synchronisiere …';
    try { const r = await api.post('/api/integrations/google/sync?days=30'); toast(`${r.upserted} Werte übernommen`); await load(); }
    catch (err) { toast(err.message, true); } finally { e.target.disabled = false; e.target.textContent = 'Jetzt synchronisieren'; }
  });
  $('#gdis')?.addEventListener('click', async () => { await api.del('/api/integrations/google'); renderGoogle(); });
}

export function toast(msg, isErr) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast on' + (isErr ? ' err' : '');
  clearTimeout(t._t); t._t = setTimeout(() => t.className = 'toast', 3500);
}

async function load() { renderCards(await api.get('/api/health/summary?days=14')); }

export async function initHealth() {
  $('#hday').value = today();
  $('#hform').addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      await api.post('/api/health/metrics', { metrics: [{
        day: f.get('day'), metric: f.get('metric'), value: Number(f.get('value')), source: 'manual' }] });
      e.target.reset(); $('#hday').value = today();
      toast('Gespeichert'); await load();
    } catch (err) { toast(err.message, true); }
  });
  await Promise.all([load(), renderGoogle()]);
}
