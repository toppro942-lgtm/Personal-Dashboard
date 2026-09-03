/* Google-Fit-Adapter.
   WARNUNG: Die Fit REST API ist seit 2024 deprecated (Shutdown 2026 angekündigt);
   Health Connect bietet KEINE REST-Schnittstelle. Diese Datei ist deshalb bewusst
   ein austauschbarer Adapter hinter dem generischen Ingest-Endpoint
   (POST /api/health/metrics) — fällt Fit weg, bleibt der Rest des Systems intakt. */

import { config } from '../config.js';
import { encrypt, decrypt, pkce, randomId } from '../lib/crypto.js';
import { get, run } from '../db.js';
import { HttpError } from '../lib/http.js';

export const PROVIDER = 'google';
const AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIT_BASE  = 'https://www.googleapis.com/fitness/v1/users/me';

export const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.body.read'
];

export function buildAuthUrl() {
  if (!config.google.configured) throw new HttpError(503, 'GOOGLE_CLIENT_ID/SECRET nicht konfiguriert');
  const { verifier, challenge } = pkce();
  const state = randomId();
  run('DELETE FROM oauth_state WHERE created_at < ?', Date.now() - 10 * 60_000);
  run('INSERT INTO oauth_state (state, verifier, created_at) VALUES (?, ?, ?)', state, verifier, Date.now());
  const u = new URL(AUTH_URL);
  u.search = new URLSearchParams({
    client_id: config.google.clientId, redirect_uri: config.google.redirectUri,
    response_type: 'code', scope: SCOPES.join(' '), access_type: 'offline',
    prompt: 'consent', include_granted_scopes: 'true',
    state, code_challenge: challenge, code_challenge_method: 'S256'
  }).toString();
  return u.toString();
}

async function tokenRequest(params) {
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: config.google.clientId, client_secret: config.google.clientSecret, ...params })
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new HttpError(502, `Google Token-Endpoint: ${body.error_description || body.error || r.status}`);
  return body;
}

const store = (t, keepRefresh) => run(
  `INSERT INTO oauth_token (provider, access_enc, refresh_enc, expires_at, scope, updated_at)
   VALUES (?, ?, ?, ?, ?, datetime('now'))
   ON CONFLICT(provider) DO UPDATE SET access_enc=excluded.access_enc,
     refresh_enc=COALESCE(excluded.refresh_enc, oauth_token.refresh_enc),
     expires_at=excluded.expires_at, scope=excluded.scope, updated_at=datetime('now')`,
  PROVIDER, encrypt(t.access_token), t.refresh_token ? encrypt(t.refresh_token) : keepRefresh ?? null,
  Date.now() + (t.expires_in ?? 3600) * 1000, t.scope || SCOPES.join(' ')
);

export async function exchangeCode(code, state) {
  const row = get('SELECT verifier FROM oauth_state WHERE state = ?', state);
  run('DELETE FROM oauth_state WHERE state = ?', state);           // State ist Einweg
  if (!row) throw new HttpError(400, 'Ungültiger oder abgelaufener OAuth-State');
  const t = await tokenRequest({
    grant_type: 'authorization_code', code,
    redirect_uri: config.google.redirectUri, code_verifier: row.verifier
  });
  if (!t.refresh_token) throw new HttpError(502, 'Kein refresh_token erhalten — Zugriff unter myaccount.google.com/permissions entfernen und erneut verbinden');
  store(t);
}

export const status = () => {
  const row = get('SELECT expires_at, scope, updated_at FROM oauth_token WHERE provider = ?', PROVIDER);
  return {
    configured: config.google.configured, connected: Boolean(row),
    expiresAt: row?.expires_at ?? null, scope: row?.scope ?? '', updatedAt: row?.updated_at ?? null,
    deprecationNotice: 'Google Fit REST API ist deprecated (Shutdown 2026). Alternative Quellen über POST /api/health/metrics anbinden.'
  };
};

export const disconnect = () => run('DELETE FROM oauth_token WHERE provider = ?', PROVIDER);

async function accessToken() {
  const row = get('SELECT * FROM oauth_token WHERE provider = ?', PROVIDER);
  if (!row) throw new HttpError(409, 'Google nicht verbunden');
  if (row.expires_at > Date.now() + 60_000) return decrypt(row.access_enc);
  const t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: decrypt(row.refresh_enc) });
  store(t, row.refresh_enc);
  return t.access_token;
}

async function fitFetch(path, init = {}) {
  const r = await fetch(FIT_BASE + path, {
    ...init,
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...init.headers }
  });
  if (!r.ok) throw new HttpError(502, `Google Fit ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

const DAY_MS = 86_400_000;
const isoDay = ms => new Date(ms).toISOString().slice(0, 10);
const point  = b => b.dataset?.[0]?.point ?? [];

/* Aggregation liefert Tages-Buckets; Schlaf kommt aus der Sessions-API,
   weil Sleep-Segmente über Mitternacht laufen und Buckets sie zerschneiden. */
export async function sync(days = 30) {
  const end = Date.now(), start = end - days * DAY_MS;
  const metrics = [];

  const aggregate = async (dataTypeName, metric, unit, pick) => {
    const res = await fitFetch('/dataset:aggregate', {
      method: 'POST',
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName }],
        bucketByTime: { durationMillis: DAY_MS },
        startTimeMillis: start, endTimeMillis: end
      })
    });
    for (const b of res.bucket ?? []) {
      const pts = point(b);
      if (!pts.length) continue;
      const value = pick(pts);
      if (value == null || !Number.isFinite(value)) continue;
      metrics.push({ day: isoDay(Number(b.startTimeMillis)), metric, value, unit, source: 'google_fit' });
    }
  };

  const sum = f => pts => pts.reduce((a, p) => a + (f(p) ?? 0), 0);
  const avg = f => pts => { const v = pts.map(f).filter(Number.isFinite); return v.length ? v.reduce((a, b) => a + b) / v.length : null; };

  await aggregate('com.google.step_count.delta', 'steps',       'count', sum(p => p.value?.[0]?.intVal));
  await aggregate('com.google.calories.expended', 'active_kcal','kcal',  sum(p => p.value?.[0]?.fpVal));
  await aggregate('com.google.heart_rate.bpm',    'resting_hr', 'bpm',   avg(p => p.value?.[0]?.fpVal));
  await aggregate('com.google.weight',            'weight_kg',  'kg',    avg(p => p.value?.[0]?.fpVal));

  const s = await fitFetch(`/sessions?startTime=${new Date(start).toISOString()}&endTime=${new Date(end).toISOString()}&activityType=72`);
  const byDay = new Map();
  for (const sess of s.session ?? []) {
    const mins = (Number(sess.endTimeMillis) - Number(sess.startTimeMillis)) / 60_000;
    /* Zuordnung auf den Aufwachtag — so vergleichbar mit dem Schlaf-Tab. */
    const day = isoDay(Number(sess.endTimeMillis));
    byDay.set(day, (byDay.get(day) ?? 0) + mins);
  }
  for (const [day, mins] of byDay)
    metrics.push({ day, metric: 'sleep_minutes', value: Math.round(mins), unit: 'min', source: 'google_fit' });

  return metrics;
}
