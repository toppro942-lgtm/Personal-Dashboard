const req = async (method, path, body) => {
  const res = await fetch(path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
};

export const api = {
  get:  p => req('GET', p),
  post: (p, b) => req('POST', p, b),
  put:  (p, b) => req('PUT', p, b),
  del:  (p, b) => req('DELETE', p, b)
};

export const eur = cents => (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
export const num = (v, d = 0) => v == null ? '–' : Number(v).toLocaleString('de-DE', { maximumFractionDigits: d });
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
export const thisMonth = () => new Date().toISOString().slice(0, 7);
export const today = () => new Date().toISOString().slice(0, 10);

/* Inline-Sparkline als SVG — keine Chart-Library für 30 Datenpunkte. */
export function sparkline(points, color = '#3a7bbf', w = 220, h = 40) {
  const vals = points.map(p => p.value);
  if (vals.length < 2) return '<div class="vn">zu wenig Daten</div>';
  const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
  const d = points.map((p, i) =>
    `${i ? 'L' : 'M'}${(i / (points.length - 1) * w).toFixed(1)},${(h - (p.value - min) / span * (h - 4) - 2).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:${h}px" role="img" aria-label="Verlauf">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
}
