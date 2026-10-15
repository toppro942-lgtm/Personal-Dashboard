# Sharms Dashboard

Persönliches Dashboard für Training, Routinen, Gesundheit und Geld. Eine einzige Datei
(`dashboard.html`), Vanilla JS, kein Build-Schritt. Veröffentlicht als claude.ai-Artifact;
lokal im Browser öffnen funktioniert ebenfalls.

## Tabs

| Tab | Inhalt |
|---|---|
| **Heute** | Aura-Score (vier Säulen), Tagesaufgaben in zeitlicher Reihenfolge (Morgen ab Wecker, Tagsüber, Abend als Countdown zur Bettzeit), Gewohnheiten, Hobbys, Laster, 12-Wochen-Verlauf |
| **Training** | Plan (Tagesansicht, startet auf heute) · Volumen (Sätze je Muskel vs. MAV) · Sporttest (Dead Hang, Stand and Reach) |
| **Routinen** | Morgen · Abend (T-Minus mit Uhrzeiten für heute) · Mobility · Schlaf |
| **Health** | Tageswerte, CSV-Import aus Google Takeout, 14-Tage-Verläufe |
| **Geld** | Monat (Buchungen, Budgets, CSV-Import) · Vermögen (Verlauf, Zerlegung der Veränderung, Aufteilung) |
| **Wissen** | Ernährung · Looks |

## Abhaken im Heute-Tab

- Antippen = erledigt. `–` rechts = entfällt heute (zählt weder als erledigt noch als offen).
- `Alle ✓` hakt einen ganzen Abschnitt ab; der Hinweis unten bietet „Rückgängig“.
- Fertige Abschnitte klappen zu. Der aktuelle Abschnitt trägt „jetzt“, die nächste offene Aufgabe ist rot markiert.
- Ein Schlafwert im Health-Tab hakt die Schlaf-Aufgabe automatisch ab.
- Gewohnheiten bekommen eine Tageszeit (Morgen, Tagsüber, Abend) und erscheinen dort in der Liste.

## Speicher

Artifact-Datenbank (`db`-Capability), synchron auf allen Geräten:

- `aura/config`, `aura/mYYYY-MM` – Gewohnheiten, Hobbys, Laster, Haken je Tag (`true`, `false`, `'x'` = entfällt)
- `tests/main` – Sporttest
- `health/<YYYY-MM-DD>`, `finance/<YYYY-MM>`, `settings/main`, `assets/<id>`, `wealth/<YYYY-MM>`

Ist die Datenbank nicht erreichbar (z. B. Datei lokal geöffnet), läuft alles mit einem lokalen
Speicher im Browser; der Punkt oben rechts zeigt gelb „nur dieses Gerät“.

## Struktur von `dashboard.html`

`<style>` (Tokens in `:root`), Markup der sechs Tabs, dann ein `<script>` in dieser Reihenfolge:
Plan-Daten (`WEEKPLAN`, `S`, `VOL_*`, `MEALS`, `SLEEP`, `EVE`, `MOR`, `GROOM` …) → Plan-Engine und
Render-Funktionen → Vermögen → Speicher/Health/Finanzen → Heute (Aura) → Listen → Sporttest →
Vollbild → Navigation und Start. Inhalte lassen sich in den Datenblöcken ändern, ohne die
Render-Funktionen anzufassen.
