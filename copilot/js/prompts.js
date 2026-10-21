// Prompt-Bausteine: stabiler System-Teil (pro Stunde konstant → cachebar) + Aufgabe je Modus.
const LEVEL = '12. Klasse, Gymnasium in Bayern (LehrplanPLUS, Oberstufe)';

// Kontextfenster je Modus: Sekunden Transkript rückwärts + Zeichen-Obergrenze
export const WINDOW = {
  answer: { sec: 120, chars: 4000 },
  recap: { sec: 300, chars: 9000 },
  contribute: { sec: 240, chars: 7000 },
};

export const LABEL = { answer: 'Antwort', recap: 'Aufholen', contribute: 'Beitrag' };

export function system({ fach, thema, notes }) {
  return [
    `Du bist ein unauffälliger Echtzeit-Assistent für einen Schüler (${LEVEL}) im laufenden Unterricht. Ziel: dem Unterricht folgen und sich mit eigenen, fundierten mündlichen Beiträgen beteiligen.`,
    'Du erhältst ein automatisches Transkript der Spracherkennung: Erkennungsfehler, kaum Satzzeichen, mehrere Sprecher ohne Kennzeichnung (meist die Lehrkraft, teils Mitschüler). Erschließe das Gemeinte aus dem Kontext.',
    '',
    `Fach: ${fach || 'unbekannt – aus dem Transkript erschließen'}`,
    `Thema: ${thema || 'unbekannt – aus dem Transkript erschließen'}`,
    notes ? `Material/Notizen des Schülers:\n<material>\n${notes}\n</material>` : '',
    '',
    'Regeln:',
    '- Fachlich korrekt auf Oberstufenniveau, mit den Fachbegriffen des Fachs.',
    '- Sprechbar: kurze Hauptsätze, natürlicher Schülerton. Der Schüler formuliert selbst – liefere Kern und Argumente, keinen Vortrag.',
    '- Sprache: die Unterrichtssprache des Transkripts (Englischunterricht → Englisch usw.).',
    '- Unklares Transkript oder unsicheres Wissen: mit "unsicher:" kennzeichnen, nichts erfinden.',
    '- Keine Einleitung, kein Markdown. Ausschließlich das vorgegebene Zeilenformat; jede Zeile beginnt mit ihrem Kürzel.',
  ].join('\n');
}

const TASKS = {
  answer: focus => [
    focus
      ? `Aufgabe: Beantworte diese Frage (Wortlaut evtl. fehlerhaft erkannt): «${focus}»`
      : 'Aufgabe: Finde die zuletzt gestellte Frage oder Arbeitsanweisung der Lehrkraft und beantworte sie.',
    'Format:',
    'F: die Frage, max. 12 Wörter',
    'A: Kernantwort, 1–2 Sätze, max. 30 Wörter – sofort sagbar',
    '+ Begründung, Beispiel oder Beleg (2–3 Zeilen, je max. 14 Wörter)',
    'B: 2–4 passende Fachbegriffe, kommagetrennt',
    'Ist keine Frage erkennbar: "F: keine Frage erkannt" und unter A: ein sinnvoller Beitrag zum aktuellen Punkt.',
  ],
  recap: () => [
    'Aufgabe: Der Schüler hat kurz den Faden verloren. Fasse den bisherigen Verlauf so zusammen, dass er sofort wieder einsteigen kann.',
    'Format:',
    'A: worum es gerade geht, 1 Satz',
    '+ 3–4 Kernaussagen/Ergebnisse in zeitlicher Reihenfolge, je max. 14 Wörter',
    '+ "Aufgabe jetzt: …", falls zuletzt eine Arbeitsanweisung gegeben wurde',
    'B: max. 3 neue Fachbegriffe als "Begriff = Kurzdefinition", mit ";" getrennt',
  ],
  contribute: () => [
    'Aufgabe: Schlage einen qualifizierten mündlichen Beitrag vor, mit dem sich der Schüler jetzt einbringen kann – passend zum aktuellen Gesprächsstand, nichts bereits Gesagtes wiederholen.',
    'Format:',
    'F: Anknüpfungspunkt im Gespräch, max. 10 Wörter',
    'A: der Beitrag, 1–2 Sätze, max. 35 Wörter, sprechbar (Verknüpfung, Beispiel, Einwand oder weiterführende Frage)',
    '+ Alternative: ein zweiter, andersartiger Beitrag',
    '+ Bei Nachfrage: ein Satz zur Vertiefung',
    'B: 2–3 Fachbegriffe, die der Beitrag nutzt',
  ],
};

export function user(mode, transcript, focus) {
  return `<transkript>\n${transcript || '(noch leer)'}\n</transkript>\n\n${TASKS[mode](focus).join('\n')}`;
}
