export class HttpError extends Error {
  constructor(status, message, detail) { super(message); this.status = status; this.detail = detail; }
}
export const bad      = (m, d) => new HttpError(400, m, d);
export const unauth   = (m = 'Nicht angemeldet') => new HttpError(401, m);
export const notFound = (m = 'Nicht gefunden') => new HttpError(404, m);

export function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store'
  });
  res.end(payload);
}

const MAX_BODY = 5 * 1024 * 1024; // CSV-Import darf groß sein, aber nicht unbegrenzt

export function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, 'Request Body zu groß')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export async function readJson(req) {
  const raw = await readBody(req);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw bad('Ungültiges JSON'); }
}

/* Router: Pfad-Muster mit :params, exakte Methode. */
export function createRouter() {
  const routes = [];
  const add = (method, pattern, handler, opts = {}) => {
    const keys = [];
    const rx = new RegExp('^' + pattern.replace(/:([A-Za-z_]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    routes.push({ method, rx, keys, handler, ...opts });
  };
  return {
    get:    (p, h, o) => add('GET', p, h, o),
    post:   (p, h, o) => add('POST', p, h, o),
    put:    (p, h, o) => add('PUT', p, h, o),
    del:    (p, h, o) => add('DELETE', p, h, o),
    match(method, pathname) {
      for (const r of routes) {
        if (r.method !== method) continue;
        const m = pathname.match(r.rx);
        if (!m) continue;
        return { route: r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
      }
      return null;
    }
  };
}
