import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { config } from './config.js';
import { createRouter, json, readJson, HttpError, bad, notFound } from './lib/http.js';
import { requireAuth, issue, clear, sessionOf } from './lib/session.js';
import { verifyPasscode } from './lib/crypto.js';
import * as health from './routes/health.js';
import * as finance from './routes/finance.js';
import * as google from './providers/google-fit.js';

const PUBLIC = resolve('public');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.png':'image/png', '.woff2':'font/woff2' };

const r = createRouter();

/* ---------- Auth ---------- */
r.get('/api/auth/me', (req) => ({ authEnabled: config.authEnabled, authenticated: !config.authEnabled || Boolean(sessionOf(req)) }), { open: true });

r.post('/api/auth/login', async (req, res) => {
  const { passcode } = await readJson(req);
  if (!config.authEnabled) return { ok: true, note: 'Kein Passcode konfiguriert — Auth deaktiviert' };
  if (!passcode || !verifyPasscode(passcode, config.passcodeHash)) throw new HttpError(401, 'Falscher Passcode');
  issue(res, req.headers['x-forwarded-proto'] === 'https');
  return { ok: true };
}, { open: true });

r.post('/api/auth/logout', (req, res) => { clear(res); return { ok: true }; }, { open: true });

/* ---------- Health ---------- */
r.get('/api/health/summary', (req, res, p, q) => health.summary(Number(q.get('days')) || 7));
r.get('/api/health/series',  (req, res, p, q) => ({ metric: q.get('metric'), points: health.series({ metric: q.get('metric'), from: q.get('from'), to: q.get('to') }) }));
r.get('/api/health/sources', () => ({ sources: health.sources(), metrics: health.METRICS }));
r.post('/api/health/metrics', async req => ({ upserted: health.upsertMany((await readJson(req)).metrics) }));
r.del('/api/health/metrics', async req => { const b = await readJson(req); return { deleted: health.remove(b.day, b.metric, b.source) }; });

/* ---------- Google-Integration ---------- */
r.get('/api/integrations/google/status', () => google.status());
r.get('/api/integrations/google/connect', (req, res) => { res.writeHead(302, { location: google.buildAuthUrl() }); res.end(); return null; });
r.get('/api/integrations/google/callback', async (req, res, p, q) => {
  if (q.get('error')) throw bad(`Google: ${q.get('error')}`);
  await google.exchangeCode(q.get('code'), q.get('state'));
  res.writeHead(302, { location: '/#health' }); res.end(); return null;
});
r.post('/api/integrations/google/sync', async (req, res, p, q) => {
  const metrics = await google.sync(Math.min(Number(q.get('days')) || 30, 90));
  return { fetched: metrics.length, upserted: metrics.length ? health.upsertMany(metrics) : 0 };
});
r.del('/api/integrations/google', () => { google.disconnect(); return { ok: true }; });

/* ---------- Finanzen ---------- */
r.get('/api/finance/accounts',   () => ({ accounts: finance.accounts() }));
r.post('/api/finance/accounts',  async req => ({ id: finance.addAccount(await readJson(req)) }));
r.get('/api/finance/categories', () => ({ categories: finance.categories() }));
r.post('/api/finance/categories',async req => ({ id: finance.upsertCategory(await readJson(req)) }));
r.post('/api/finance/rules',     async req => ({ id: finance.addRule(await readJson(req)) }));
r.get('/api/finance/tx',         (req, res, p, q) => ({ tx: finance.listTx(Object.fromEntries(q)) }));
r.post('/api/finance/tx',        async req => ({ id: finance.addTx(await readJson(req)) }));
r.put('/api/finance/tx/:id',     async (req, res, p) => { finance.setCategory(Number(p.id), (await readJson(req)).category_id); return { ok: true }; });
r.del('/api/finance/tx/:id',     (req, res, p) => { finance.removeTx(Number(p.id)); return { ok: true }; });
r.post('/api/finance/import',    async req => finance.importCsv(await readJson(req)));
r.get('/api/finance/summary',    (req, res, p, q) => finance.summary(q.get('month') || new Date().toISOString().slice(0, 7)));

/* ---------- Static ---------- */
async function serveStatic(req, res, pathname) {
  const rel = normalize(pathname === '/' ? '/index.html' : pathname).replace(/^(\.\.[/\\])+/, '');
  const file = join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403).end('Forbidden'); return; }   // Path-Traversal
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error('not a file');
    res.writeHead(200, {
      'content-type': MIME[extname(file)] || 'application/octet-stream',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff'
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404');
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'no-referrer');
  try {
    const m = r.match(req.method, url.pathname);
    if (!m) {
      if (url.pathname.startsWith('/api/')) throw notFound('Endpoint');
      return void await serveStatic(req, res, url.pathname);
    }
    if (!m.route.open) requireAuth(req);
    const body = await m.route.handler(req, res, m.params, url.searchParams);
    if (body !== null && !res.writableEnded) json(res, 200, body);
  } catch (e) {
    if (res.writableEnded) return;
    const status = e instanceof HttpError ? e.status : 500;
    if (status >= 500) console.error(`[${req.method} ${url.pathname}]`, e);
    json(res, status, { error: e.message || 'Interner Fehler', detail: e.detail });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Dashboard: http://${config.host}:${config.port}`);
  if (!config.authEnabled) console.warn('WARNUNG: DASHBOARD_PASSCODE_HASH nicht gesetzt — API ist ungeschützt. Nur an 127.0.0.1 binden.');
  if (!config.google.configured) console.log('Hinweis: Google-OAuth nicht konfiguriert (optional).');
});
