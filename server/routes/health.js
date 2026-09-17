import { all, get, run, tx } from '../db.js';
import { bad } from '../lib/http.js';

export const METRICS = {
  steps:         { unit: 'count', label: 'Schritte' },
  resting_hr:    { unit: 'bpm',   label: 'Ruhepuls' },
  sleep_minutes: { unit: 'min',   label: 'Schlaf' },
  active_kcal:   { unit: 'kcal',  label: 'Aktive kcal' },
  weight_kg:     { unit: 'kg',    label: 'Gewicht' },
  hrv_ms:        { unit: 'ms',    label: 'HRV' }
};

const isDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d ?? '');
const daysAgo = n => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

/* Upsert pro (day, metric, source): erneute Syncs korrigieren Werte,
   statt Duplikate anzulegen. Manuelle Einträge überschreiben Sync-Werte nicht. */
export function upsertMany(rows) {
  if (!Array.isArray(rows) || !rows.length) throw bad('metrics[] erwartet');
  return tx(() => {
    let n = 0;
    for (const r of rows) {
      if (!isDay(r.day)) throw bad(`Ungültiges Datum: ${r.day}`);
      if (!METRICS[r.metric]) throw bad(`Unbekannte Metrik: ${r.metric}`);
      const value = Number(r.value);
      if (!Number.isFinite(value)) throw bad(`Ungültiger Wert für ${r.metric}`);
      run(`INSERT INTO health_metric (day, metric, value, unit, source, updated_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(day, metric, source) DO UPDATE
             SET value = excluded.value, unit = excluded.unit, updated_at = datetime('now')`,
        r.day, r.metric, value, r.unit || METRICS[r.metric].unit, r.source || 'manual');
      n++;
    }
    return n;
  });
}

export const series = ({ metric, from, to }) => {
  if (!METRICS[metric]) throw bad(`Unbekannte Metrik: ${metric}`);
  return all(`SELECT day, value, unit, source FROM health_metric
              WHERE metric = ? AND day BETWEEN ? AND ? ORDER BY day`,
    metric, isDay(from) ? from : daysAgo(30), isDay(to) ? to : daysAgo(-1));
};

/* Kennzahlen-Übersicht: letzter Wert + 7-Tage-Mittel je Metrik.
   Bei mehreren Quellen pro Tag gewinnt der zuletzt geschriebene Eintrag. */
export function summary(days = 7) {
  const from = daysAgo(days - 1);
  const rows = all(
    `SELECT metric, day, value, unit, source FROM health_metric hm
      WHERE day >= ?
        AND updated_at = (SELECT MAX(updated_at) FROM health_metric x WHERE x.day = hm.day AND x.metric = hm.metric)
      ORDER BY day`, from);
  const out = {};
  for (const key of Object.keys(METRICS)) {
    const r = rows.filter(x => x.metric === key);
    out[key] = {
      label: METRICS[key].label, unit: METRICS[key].unit,
      latest: r.at(-1)?.value ?? null, latestDay: r.at(-1)?.day ?? null,
      avg: r.length ? Math.round(r.reduce((a, b) => a + b.value, 0) / r.length * 10) / 10 : null,
      count: r.length, source: r.at(-1)?.source ?? null,
      points: r.map(x => ({ day: x.day, value: x.value }))
    };
  }
  return { from, to: daysAgo(0), metrics: out };
}

export const remove = (day, metric, source) =>
  run('DELETE FROM health_metric WHERE day = ? AND metric = ? AND source = ?', day, metric, source ?? 'manual').changes;

export const sources = () => all('SELECT source, COUNT(*) AS n, MAX(day) AS last_day FROM health_metric GROUP BY source');
