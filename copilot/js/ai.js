// Claude-Anbindung über das offizielle SDK, direkt aus dem Browser (Key bleibt lokal).
const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.131.0/+esm';

export const MODELS = [
  { id: 'claude-opus-5-5', label: 'Opus 5.5 – beste Qualität' },
  { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5 – ausgewogen' },
  { id: 'claude-haiku-5-5', label: 'Haiku 5.5 – schnellste Antwort, günstigst' },
];

export class AiError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

let sdk = null, client = null, clientKey = '', current = null, seq = 0;

function loadSdk() {
  sdk ??= import(SDK_URL).then(m => m.default, err => { sdk = null; throw err; });
  return sdk;
}

// Vorladen beim Aufnahmestart → erste Antwort ohne SDK-Ladezeit
export const warm = () => { loadSdk().catch(() => {}); };

export function cancel() {
  seq++;
  current?.abort();
  current = null;
}

function toAiError(err, A) {
  if (err instanceof AiError) return err;
  if (err instanceof A.APIUserAbortError) return new AiError('cancelled', 'Abgebrochen');
  if (err instanceof A.AuthenticationError) return new AiError('auth', 'API-Key ungültig.');
  if (err instanceof A.PermissionDeniedError) return new AiError('auth', 'Keine Berechtigung für dieses Modell.');
  if (err instanceof A.RateLimitError) return new AiError('rate', 'Rate-Limit erreicht – kurz warten.');
  if (err instanceof A.APIConnectionError) return new AiError('net', 'Keine Verbindung zur API.');
  if (err instanceof A.APIError) return new AiError('api', `API-Fehler ${err.status ?? ''}: ${err.message}`);
  return new AiError('unknown', err?.message || String(err));
}

/** Streamt eine Antwort. onText(snapshot) bei jedem Delta; neuere Anfragen brechen ältere ab. */
export async function ask({ apiKey, model, system, prompt, onText }) {
  cancel();
  const id = seq;

  let A;
  try { A = await loadSdk(); }
  catch { throw new AiError('sdk', 'SDK nicht ladbar – Internetverbindung prüfen.'); }
  if (id !== seq) throw new AiError('cancelled', 'Abgebrochen');

  if (!client || clientKey !== apiKey) {
    client = new A({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
    clientKey = apiKey;
  }

  // Haiku 5.5 hat keinen serverseitigen Refusal-Fallback → Parameter nur für Opus/Sonnet
  const fallback = !model.startsWith('claude-haiku');
  const stream = client.beta.messages.stream({
    model,
    max_tokens: 4000,
    output_config: { effort: 'low' }, // Latenz vor Tiefe: Antworten sind kurz und mündlich
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
    ...(fallback && { fallbacks: 'default', betas: ['server-side-fallback-2026-07-01'] }),
  });
  current = stream;
  stream.on('text', (_, snapshot) => { if (id === seq) onText(snapshot); });

  try {
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new AiError('refused', 'Anfrage abgelehnt – Frage umformulieren.');
    return msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  } catch (err) {
    throw toAiError(err, A);
  } finally {
    if (current === stream) current = null;
  }
}
