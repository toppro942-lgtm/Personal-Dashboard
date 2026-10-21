# Unterrichts-Copilot

Live-Transkript des Unterrichts → automatische Fragenerkennung → sprechbare Antwort von Claude in ~1–3 s.
Vanilla JS (ES-Module), kein Build-Step, kein Backend.

## Funktionen
| Aktion | Auslöser | Ergebnis |
|---|---|---|
| **Antwort** | automatisch bei erkannter Frage · Taste `A` · Transkriptzeile antippen · eigene Frage eintippen | `F:` erkannte Frage · `A:` Kernantwort (sagbar) · `›` Begründung · Fachbegriffe |
| **Aufholen** | Taste `R` | Verlauf der letzten 5 min, aktuelle Arbeitsanweisung, neue Begriffe |
| **Beitrag** | Taste `B` | Vorschlag für eine eigene Wortmeldung + Alternative + Vertiefung |
| Start/Stop · Abbrechen | `S` · `Esc` | – |

Export der Stunde als Markdown (Transkript + alle KI-Hilfen) im ⚙-Dialog.

## Start
Läuft nur über `http(s)://` (ES-Module, Mikrofon-Freigabe):
- **GitHub Pages:** Repo → Settings → Pages → Branch wählen → `…/copilot/` öffnen (Handy + Laptop).
- **Lokal:** `python3 -m http.server -d copilot 8000` → `http://localhost:8000`.

Einrichtung (⚙): Anthropic API-Key ([Console](https://console.anthropic.com) → API Keys; dort **Ausgabenlimit setzen**), Fach, Thema, optional Material/Notizen (Tafelbild, Buchseite → deutlich treffsicherer).

## Architektur
| Modul | Aufgabe |
|---|---|
| `js/stt.js` | Web Speech API, Auto-Restart mit Backoff, On-Device-Modus (`processLocally`) wenn verfügbar |
| `js/detect.js` | Fragenerkennung ohne Satzzeichen (W-Fragen, Verb-Erststellung, Arbeitsaufträge; DE/EN) |
| `js/prompts.js` | System-Prompt (pro Stunde stabil → Prompt-Caching) + Aufgaben je Modus, Kontextfenster |
| `js/ai.js` | Offizielles Anthropic-SDK (CDN, lazy), Streaming, Abbruch veralteter Anfragen, Fehlerzuordnung |
| `js/ui.js` | Rendering (nur `textContent`), Statusleiste |
| `js/store.js` | Einstellungen + Session in `localStorage` (nur Text, nie Audio) |
| `js/app.js` | Verdrahtung, Auto-Trigger (1,2 s Verzögerung, min. 6 s Abstand), Wake Lock, Shortcuts, Export |

## Modelle & Kosten (Größenordnung pro 45-min-Stunde, ~30–40 Anfragen)
- **Opus 5.5** (Standard): beste Qualität, ≈ 0,40–0,80 $.
- **Haiku 5.5**: schnellste Antwort, ≈ 0,01–0,03 $ – für Echtzeit meist die bessere Wahl.
- Alle Modelle mit `effort: low`; Opus/Sonnet mit serverseitigem Refusal-Fallback.

## Grenzen
- **Browser:** Chrome/Edge (Desktop, Android). iOS Safari: Dauererkennung unzuverlässig.
- **Android:** Chrome spielt bei jedem Neustart der Erkennung einen Systemton → Medien-/Systemtöne stumm schalten. Laptop ist das robustere Gerät.
- **Akustik:** Erkennung über 5 m Distanz ist fehleranfällig; ein externes Mikro (Clip/USB) verbessert sie deutlich.
- **Datenfluss:** Badge `lokal` = Audio bleibt auf dem Gerät; `cloud` = Chrome sendet Audio an Google. An Anthropic geht nur Transkript-Text.

## Rechtlicher Rahmen
Mitschneiden des nichtöffentlich gesprochenen Wortes ohne Einwilligung kann nach **§ 201 StGB** strafbar sein; die Live-Transkription ist rechtlich eine Grauzone. Zusätzlich gelten Hausordnung/Handyregelung der Schule. Empfehlung: Einverständnis der Lehrkraft einholen (z. B. als Lern-/Mitschreibhilfe).
