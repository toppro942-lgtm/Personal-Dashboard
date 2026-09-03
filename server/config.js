import { readFileSync, existsSync } from 'node:fs';

/* Minimaler .env-Loader — keine dotenv-Dependency. Bereits gesetzte
   Prozess-Variablen gewinnen (Container/systemd überschreiben die Datei). */
function loadEnvFile(path = '.env') {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (key in process.env) continue;
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    process.env[key] = val;
  }
}
loadEnvFile();

const req = (key, fallback) => {
  const v = process.env[key] ?? fallback;
  if (v === undefined) throw new Error(`Fehlende Env-Variable: ${key} — siehe .env.example`);
  return v;
};

export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || '127.0.0.1',
  dbPath: process.env.DB_PATH || './data/dashboard.db',
  passcodeHash: process.env.DASHBOARD_PASSCODE_HASH || '',
  sessionSecret: req('SESSION_SECRET', 'dev-only-insecure-session-secret'),
  tokenKey: req('TOKEN_KEY', ''.padEnd(64, '0')),
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://127.0.0.1:8787/api/integrations/google/callback',
    get configured() { return Boolean(this.clientId && this.clientSecret); }
  },
  get authEnabled() { return Boolean(this.passcodeHash); }
};
