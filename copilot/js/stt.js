// Live-Spracherkennung (Web Speech API): Auto-Restart, Backoff, On-Device-Modus wenn verfügbar.
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export const supported = () => !!SR;

// 'local' = Audio verlässt das Gerät nicht. Fehlt das Sprachpaket, wird es im Hintergrund
// installiert (braucht User-Geste → Aufruf aus dem Start-Klick) und ab dem nächsten Start genutzt.
async function pickMode(rec, lang) {
  if (!('processLocally' in rec) || typeof SR.available !== 'function') return 'cloud';
  try {
    const opts = { langs: [lang], processLocally: true };
    const status = await SR.available(opts);
    if (status === 'available') { rec.processLocally = true; return 'local'; }
    if (status === 'downloadable' && typeof SR.install === 'function') SR.install(opts).catch(() => {});
  } catch { /* abweichende API-Variante → Cloud */ }
  return 'cloud';
}

export function createRecognizer({ lang, onFinal, onInterim, onState }) {
  let rec = null, active = false, fails = 0, timer = 0, mode = 'cloud';

  function build() {
    const r = new SR();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = e => {
      if (fails) { fails = 0; onState('on', mode); } // nach Störung wieder stabil
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i], txt = res[0].transcript.trim();
        if (res.isFinal) { if (txt) onFinal(txt); }
        else interim += txt + ' ';
      }
      onInterim(interim.trim());
    };

    r.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { active = false; onState('denied'); }
      else if (e.error === 'language-not-supported') { active = false; onState('error', 'Sprache nicht unterstützt'); }
      else if (e.error === 'network') { fails++; onState('unstable'); }
      else if (e.error !== 'no-speech' && e.error !== 'aborted') fails++;
    };

    // Chrome beendet Sessions nach Stille/Zeitlimit → neu starten, bei Fehlern mit Backoff
    r.onend = () => {
      onInterim('');
      if (!active) return onState('off');
      timer = setTimeout(() => {
        if (!active) return;
        try { r.start(); } catch { /* läuft bereits */ }
      }, Math.min(200 * 2 ** fails, 8000));
    };
    return r;
  }

  return {
    async start() {
      if (active) return;
      active = true;
      fails = 0;
      rec = build();
      mode = await pickMode(rec, lang);
      try { rec.start(); onState('on', mode); }
      catch (err) { active = false; onState('error', err.message); }
    },
    stop() {
      active = false;
      clearTimeout(timer);
      try { rec?.stop(); } catch { /* bereits gestoppt */ }
    },
    get active() { return active; },
  };
}
