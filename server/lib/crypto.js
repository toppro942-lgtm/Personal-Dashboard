import { randomBytes, createCipheriv, createDecipheriv, createHmac, timingSafeEqual, scryptSync, createHash } from 'node:crypto';
import { config } from '../config.js';

const keyBuf = () => {
  const k = Buffer.from(config.tokenKey, 'hex');
  if (k.length !== 32) throw new Error('TOKEN_KEY muss 64 Hex-Zeichen (32 Byte) sein');
  return k;
};

/* OAuth-Refresh-Tokens niemals im Klartext in der DB: AES-256-GCM. */
export function encrypt(plain) {
  if (plain == null) return null;
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', keyBuf(), iv);
  const enc = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), enc].map(b => b.toString('base64url')).join('.');
}

export function decrypt(blob) {
  if (!blob) return null;
  const [iv, tag, enc] = blob.split('.').map(p => Buffer.from(p, 'base64url'));
  const d = createDecipheriv('aes-256-gcm', keyBuf(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
}

export const hmac = (data, secret = config.sessionSecret) =>
  createHmac('sha256', secret).update(data).digest('base64url');

export function safeEqual(a, b) {
  const ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/* Passcode-Format: scrypt$<salt-hex>$<hash-hex> */
export function hashPasscode(passcode, salt = randomBytes(16).toString('hex')) {
  return `scrypt$${salt}$${scryptSync(passcode, salt, 64).toString('hex')}`;
}

export function verifyPasscode(passcode, stored) {
  const [alg, salt, hash] = String(stored).split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  return safeEqual(scryptSync(passcode, salt, 64).toString('hex'), hash);
}

/* PKCE (S256) — Pflicht für öffentliche wie vertrauliche Clients bei Google. */
export function pkce() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export const randomId = (n = 16) => randomBytes(n).toString('base64url');
export const sha256 = s => createHash('sha256').update(s).digest('hex');
