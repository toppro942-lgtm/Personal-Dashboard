# Personal Dashboard

Trainings-, Health- und Finanz-Dashboard. **Zero-Dependency** Node-Backend (`node:http` + `node:sqlite`),
Vanilla-ES-Module im Frontend, kein Build-Step.

```bash
node --version          # >= 22.5.0 erforderlich (node:sqlite)
cp .env.example .env
npm run init:secrets    # erzeugt Passcode-Hash, SESSION_SECRET, TOKEN_KEY -> in .env übernehmen
npm start               # http://127.0.0.1:8787
```

---

## Architekturentscheidungen

| Entscheidung | Begründung |
|---|---|
| `node:http` statt Express | Kein Dependency-Baum, keine Supply-Chain-Fläche, kein `npm install`. Der Router (`server/lib/http.js`) ist 30 Zeilen. |
| `node:sqlite` statt `better-sqlite3` | Kein nativer Build, keine Toolchain, keine ABI-Bindung an eine Node-Version. Experimental-Flag ist ab 22.5 nicht nötig. |
| Provider-Adapter statt Fit-Direktbindung | Die Google **Fit REST API ist deprecated** (Shutdown 2026); Health Connect hat **keine** REST-Schnittstelle. Fällt Fit weg, bleibt das System über `POST /api/health/metrics` funktionsfähig. |
| CSV-Import statt PSD2-Aggregator | Open-Banking-Zugang erfordert Vertrag, KYC und laufende Kosten. Bank-Exporte liefern dieselben Daten ohne Abhängigkeit. |
| Geld als `INTEGER` Cent | Float-Arithmetik ist bei Finanzdaten eine Fehlerquelle (`0.1 + 0.2 !== 0.3`). Es gibt keinen `REAL`-Betrag im Schema. |
| ES-Module pro Domäne | Ein Fehler in `finance.js` erfordert kein Regenerieren von `plan.js`. `app.js` isoliert Backend-Fehler pro Tab. |

## Struktur

```
public/
  index.html            Shell: CSS, Markup, 9 Tabs
  js/plan-data.js       Trainings-/Ernährungs-/Schlafdaten (rein deklarativ)
  js/plan.js            Render-Engine für die Plan-Tabs
  js/api.js             fetch-Wrapper, Formatierung, SVG-Sparkline
  js/health.js          Health-Tab + Google-Integration-UI
  js/finance.js         Finanz-Tab: KPIs, Budgets, Buchungen, CSV-Upload
  js/app.js             Einstiegspunkt, fehlertolerante Initialisierung
server/
  index.js              HTTP-Server, Routing, Static-Serving
  config.js             .env-Loader ohne dotenv
  db.js                 Schema + Seed (SQLite, WAL)
  lib/{crypto,http,session,csv}.js
  routes/{health,finance}.js
  providers/google-fit.js
  scripts/gen-secrets.js
```

## API

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/auth/login` · `/api/auth/logout` · `GET /api/auth/me` | Single-User-Session (HttpOnly-Cookie, HMAC-signiert) |
| `GET`  | `/api/health/summary?days=14` | Letzter Wert + Ø je Metrik, inkl. Punktreihe |
| `GET`  | `/api/health/series?metric=&from=&to=` | Rohserie |
| `POST` | `/api/health/metrics` | Bulk-Upsert `{metrics:[{day,metric,value,source}]}` — **der generische Ingest-Pfad für beliebige Quellen** |
| `GET`  | `/api/integrations/google/{status,connect,callback}` | OAuth2 + PKCE |
| `POST` | `/api/integrations/google/sync?days=30` | Fit-Aggregation → `health_metric` |
| `GET`/`POST` | `/api/finance/{accounts,categories,tx,rules}` | Stammdaten und Buchungen |
| `POST` | `/api/finance/import` | CSV-Import `{text, profile}` |
| `GET`  | `/api/finance/summary?month=YYYY-MM` | KPIs, Budget-Abgleich, Kategorie-Split |

Metriken: `steps`, `resting_hr`, `sleep_minutes`, `active_kcal`, `weight_kg`, `hrv_ms`.
CSV-Profile: `generic`, `dkb`, `sparkasse`, `n26` (Header-Erkennung per Teilstring, Meta-Zeilen vor dem Header werden übersprungen).

## Sicherheit

- Refresh-Tokens **AES-256-GCM-verschlüsselt** in der DB (`TOKEN_KEY`), niemals im Klartext.
- OAuth2 mit **PKCE (S256)** und Einweg-`state` (TTL 10 Min).
- Passcode als **scrypt**-Hash; Vergleich `timingSafeEqual`.
- Server bindet per Default an `127.0.0.1`. Ohne `DASHBOARD_PASSCODE_HASH` ist die API ungeschützt — der Server warnt beim Start.
- Client-Secret liegt ausschließlich serverseitig. `.env` ist gitignored.
- Static-Serving mit Path-Traversal-Schutz und `nosniff`.

## Herkunft der Plan-Inhalte

Der erste Upload von `dashboard.html` war bei 20 116 Bytes abgeschnitten (Commit `d389b6b`) und warf
einen `SyntaxError`. Die vollständige Fassung (76 555 B) wurde nachgereicht und ist übernommen:
Daten in `public/js/plan-data.js`, Render-Funktionen unverändert in `public/js/plan.js`, nur als
ES-Modul gekapselt. Das Original-Markup nutzt inline `onclick` — die drei Handler `tab`, `day`, `tog`
werden dafür bewusst auf `window` exponiert.

## Nächste Schritte

1. Health-Quelle wählen: Fit-OAuth (befristet nutzbar) oder eine Android-Automation, die Health-Connect-Werte per `POST /api/health/metrics` pusht — die stabilere Variante.
2. Korrelationsansicht: Schlafdauer gegen Trainingstag und Volumen.
3. Wiederkehrende Buchungen als Regel-Templates statt Einzelerfassung.
