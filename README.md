# Trainings-Dashboard — Übergabe an Claude Code

## Was das ist
Ein self-contained HTML-Dashboard (Vanilla JS, kein Framework, kein Build-Step) mit folgenden Tabs:
- **Trainingstage** — Sharms, HIIT, Upper A, Rest, Lower, Upper B, Zone 2 (alle Übungen mit Sets/Reps/Pausen/Ausführung/Begründung)
- **Volumen** — Wöchentliches Satzvolumen pro Muskelgruppe mit MAV-Abgleich
- **Ernährung** — Wochenplan, Makros, Nährstoff-Timing
- **Schlaf** — Wochenplan mit Schlafenszeiten, wissenschaftliche Basis
- **Mobility** — PNF-Dehnroutine, Ablauf, Meilensteine
- **Abend** — Countdown-Timeline T-120 bis T-0
- **Morgen** — Feste Schrittfolge + Hydration-Tracking
- **✦ Aura** (Starttab) — Score 0–1000 aus vier Säulen (Körper, Geist, Persönlichkeit, Seele). Tagesaufgaben werden je Datum aus dem Plan abgeleitet (Trainingstag inkl. Wochentyp/Mesozyklus, Schlafzeiten, Morgen-, Abend-, Mobility-, Hautroutine); dazu 22-Tage-Gewohnheiten, 90-Tage-Laster-Zähler, 12-Wochen-Heatmap
- **Grooming · Health · Finanzen · Vermögen** — siehe Live-Artifact

## Aura — Datenmodell
- `aura/config` — `{habits:[{id,name,p,start}], vices:[{id,name,start,since,resets,best}]}`
- `aura/mYYYY-MM` — `{month, days:{'YYYY-MM-DD':{t:{taskId:bool}, tot:{…}}}}` (ein Dokument pro Monat, feldgenaue `update()`-Merges)
- Speicher: Artifact-DB (`claude.use('db')`); lokal geöffnet fällt die Aura auf `localStorage` zurück
- Score: je Säule erledigt/gesamt über die letzten 14 abgeschlossenen Tage, Mittel × 10. Tage vor dem ersten Eintrag zählen nicht.

## Tests
`node tests/aura.test.cjs all` — Playwright (Chromium) mit nachgebauter Artifact-DB: Syntax, Regression aller Tabs, Persistenz, Score-Mathematik, Gewohnheiten/Laster, Fallback ohne DB, 390-px-Layout.

## Struktur
- Single-File HTML: `<style>` im `<head>`, HTML-Grundgerüst im `<body>`, alle Daten + Render-Logik in `<script>` am Ende
- Kein Backend, keine externen Requests — alle Daten sind hart im JS-Array codiert (z.B. `const S = {...}`, `const VOL = [...]`, `const MEALS = [...]`)
- Design-System: CSS-Variablen in `:root` (Farben, Fonts). Dark-Mode, DM Sans / DM Mono / Instrument Serif von Google Fonts
- Tab-Switching und Day-Switching läuft über simple `classList.toggle` — keine Routing-Library

## Geplante Erweiterung (der Grund für den Wechsel zu Claude Code)
Zwei neue Integrationen sind gewünscht, die einen echten Backend-Layer brauchen:

### 1. Google Health / Google Fit Integration
- Braucht OAuth2-Flow gegen Google (Fit API oder Health Connect API je nach Plattform)
- Client-Secret darf niemals im Frontend-Code liegen → Backend nötig (z.B. Node/Express oder Python/FastAPI)
- Sinnvolle erste Datenpunkte: Schritte, Herzfrequenz, Schlafdaten (zum Abgleich mit dem Schlaf-Tab), aktive Kalorien
- Empfehlung: Start mit Read-Only-Scopes, Token-Refresh serverseitig verwalten

### 2. Finanzübersicht
- Je nach Anspruch: entweder echte Banking-API (z.B. über einen Open-Banking-Aggregator) oder simples manuelles Tracking mit eigener kleiner Datenbank (SQLite reicht für den Start)
- Für den Einstieg vermutlich einfacher: manuelles Eintragen + Kategorisierung, later API-Anbindung nachrüsten

### Technischer Vorschlag für Claude Code
- Frontend: Dieses HTML-Dashboard als Basis, ggf. schrittweise zu React/Vite migrieren, wenn die App komplexer wird
- Backend: kleiner Node.js/Express oder Python/FastAPI Server für OAuth-Handling + API-Proxying
- DB: SQLite oder Postgres für Verlaufsdaten (Trainingslogs, Health-Daten-Cache, Finanz-Einträge)
- Env-Variablen für alle Secrets (`.env`, niemals committen)

## Datei
`dashboard.html` — der komplette aktuelle Stand (entspricht dem Live-Artifact), direkt lauffähig durch Öffnen im Browser.
