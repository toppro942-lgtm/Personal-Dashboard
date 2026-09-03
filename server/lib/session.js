import { hmac, safeEqual } from './crypto.js';
import { config } from '../config.js';
import { unauth } from './http.js';

const COOKIE = 'pd_session';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const sign = payload => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${hmac(body)}`;
};

export function verify(token) {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i < 1) return null;
  const body = token.slice(0, i);
  if (!safeEqual(token.slice(i + 1), hmac(body))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}

export const parseCookies = header => Object.fromEntries(
  (header || '').split(';').map(c => c.trim()).filter(Boolean)
    .map(c => { const i = c.indexOf('='); return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))]; })
);

export function issue(res, secure) {
  const token = sign({ sub: 'owner', iat: Date.now(), exp: Date.now() + TTL_MS });
  res.setHeader('set-cookie',
    `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${TTL_MS / 1000}${secure ? '; Secure' : ''}`);
}

export const clear = res =>
  res.setHeader('set-cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);

export const sessionOf = req => verify(parseCookies(req.headers.cookie)[COOKIE]);

/* Ohne gesetzten Passcode-Hash läuft das Dashboard offen (nur lokal sinnvoll). */
export function requireAuth(req) {
  if (!config.authEnabled) return { sub: 'owner', anonymous: true };
  const s = sessionOf(req);
  if (!s) throw unauth();
  return s;
}
