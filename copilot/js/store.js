// Persistenz via localStorage – jeder Zugriff abgesichert, die App läuft auch ohne Storage.
const NS = 'ucp:';
const STALE_MS = 2 * 3600e3; // nach 2 h Stille beginnt beim nächsten Start eine neue Stunde

export const DEFAULTS = {
  apiKey: '', model: 'claude-opus-5-5', lang: 'de-DE', auto: true,
  fach: '', thema: '', notes: '',
};

function load(name, fallback) {
  try {
    const raw = localStorage.getItem(NS + name);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}

function save(name, value) {
  try { localStorage.setItem(NS + name, JSON.stringify(value)); } catch { /* voll oder blockiert */ }
}

export const loadSettings = () => ({ ...DEFAULTS, ...load('settings', {}) });
export const saveSettings = s => save('settings', s);

// Session: { start, segs: [{t, text, q}], answers: [{t, mode, text}] } – Audio wird nie gespeichert.
export const newSession = () => ({ start: Date.now(), segs: [], answers: [] });
export const loadSession = () => load('session', null) ?? newSession();
export const saveSession = s => save('session', s);

export function isStale(s) {
  const last = s.segs.at(-1)?.t ?? s.start;
  return Date.now() - last > STALE_MS;
}
