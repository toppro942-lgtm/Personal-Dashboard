# Dashboard

Persönliches Dashboard für Training, Routinen, Gesundheit und Geld. Eine einzige Datei
(`dashboard.html`), Vanilla JS, kein Build-Schritt. Veröffentlicht als claude.ai-Artifact;
lokal im Browser öffnen funktioniert ebenfalls.

## Tabs

| Tab | Inhalt |
|---|---|
| **Heute** | Aura-Figur und Score (vier Säulen), Tagesaufgaben in zeitlicher Reihenfolge (Morgen ab Wecker, Tagsüber, Abend als Countdown zur Bettzeit), Gewohnheiten, Hobbys, Laster, 12-Wochen-Verlauf |
| **Training** | Plan (Tagesansicht, startet auf heute) · Volumen (Sätze je Muskel vs. MAV) · Sporttest (Dead Hang, Stand and Reach) |
| **Routinen** | Morgen · Abend (T-Minus mit Uhrzeiten für heute) · Mobility · Schlaf |
| **Health** | Tageswerte, CSV-Import aus Google Takeout, 14-Tage-Verläufe |
| **Geld** | Monat (Buchungen, Budgets, CSV-Import) · Vermögen (Verlauf, Zerlegung der Veränderung, Aufteilung) |
| **Wissen** | Ernährung · Looks |

## Abhaken im Heute-Tab

- Antippen = erledigt. `–` rechts = entfällt heute (zählt weder als erledigt noch als offen).
- `Alle ✓` hakt einen ganzen Abschnitt ab; der Hinweis unten bietet „Rückgängig“.
- Fertige Abschnitte klappen zu. Der aktuelle Abschnitt trägt „jetzt“, die nächste offene Aufgabe ist rot markiert.
- Erste Aufgabe ist „Um <Weckzeit> aufstehen“. Die Schlafdauer ist keine eigene Aufgabe, sie folgt aus der Bettzeit am Vorabend.
- Gewohnheiten bekommen eine Tageszeit (Morgen, Tagsüber, Abend) und erscheinen dort in der Liste.

## Aura-Figur

Ersetzt den Ring. Jede Säule verändert ein Merkmal: Körper = Schultern, Arme, Beine, Rumpf;
Geist = Kopfgröße und Gehirn; Persönlichkeit = Haltung und Mund; Seele = Leuchten. Zählweise wie zuvor
(je Säule Anteil erledigter Aufgaben der letzten 14 Tage, Mittel × 10 = Score 0–1000).

## Hebel (oben im Heute-Tab)

Die 1–2 Stellschrauben mit der größten Wirkung, eingeklappt je eine Zeile; Antippen zeigt Wirkkette, Vergleich, Schritt für heute und Begründung. Gesucht wird nur entlang bekannter Wirkketten
(z. B. spät ins Bett → zu wenig Schlaf → schwächere Konzentration → abends wieder spät), die eigenen
Daten bestimmen die Stärke: Erledigungsquote danach (nächster Morgen, Abend oder Folgetag) mit gegen
ohne Auslöser, bei wenigen Tagen vorsichtig geschrumpft, multipliziert mit dem Anteil der Tage, an denen
der Auslöser fehlt. Je Wirkkette höchstens eine Karte. Ohne Datenbeleg (unter 3 Tagen je Gruppe oder kein
Unterschied) steht „nach Plan“ an der Karte.

## Laster

Rückfall = ein Tipp in der Laster-Liste, gilt für den oben gewählten Tag; ein zweiter Tipp oder
„Rückgängig“ nimmt ihn zurück. Serie, Rekord und Anzahl werden aus den Tageseinträgen (`v_<id>`)
berechnet; alte `resets` aus der Config werden mitgelesen.

## Vollbild

Öffnet bei jedem Aufruf automatisch im Vollbild: Versuch beim Laden, sonst bei der ersten Berührung
(Browser verlangen dafür eine Nutzeraktion). „Beenden“ oben rechts gilt nur für den aktuellen Aufruf.
Wo die Umgebung kein Vollbild anbietet (iPhone-Safari, manche App-Ansichten), fehlt der Knopf.

## Speicher

Artifact-Datenbank (`db`-Capability), synchron auf allen Geräten:

- `aura/config`, `aura/mYYYY-MM` – Gewohnheiten, Hobbys, Laster, Haken je Tag (`true`, `false`, `'x'` = entfällt, `v_<id>: true` = Rückfall)
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
