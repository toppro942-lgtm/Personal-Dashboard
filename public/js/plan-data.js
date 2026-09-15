/* Trainingsplan-Daten — unveraendert aus dashboard4.html uebernommen.
   Reine Deklarationen, keine Logik: Inhalte lassen sich hier aendern, ohne
   die Render-Module anzufassen. */

/* Zwei Wochentypen statt eines festen Plans: alle 14 Tage ersetzt Badminton
   das Studio-HIIT am Mittwoch, und die uebrigen Tage ruecken entsprechend.
   Farbe und Inhalt haengen jetzt am PROGRAMM (S-Schluessel), nicht mehr am
   Wochentag -- ein Programm behaelt seine Identitaet, auf welchem Wochentag
   es auch liegt. "name" ueberschreibt nur die Anzeige (z.B. "Badminton
   (HIIT)"), das Programm dahinter bleibt dasselbe (S.hiit).
   Anker: die Woche ab Montag 14.09.2026 ist bestaetigt eine Badminton-Woche
   -- welche Woche das jeweils ist, berechnet plan.js daraus fuer "heute". */
export const WEEKPLAN={
 a:[{id:'mo',s:'MO',p:'sharms'},{id:'di',s:'DI',p:'hiit'},{id:'mi',s:'MI',p:'upperA'},
    {id:'do',s:'DO',p:'rest'},{id:'fr',s:'FR',p:'lower'},{id:'sa',s:'SA',p:'upperB'},{id:'so',s:'SO',p:'zone2'}],
 b:[{id:'mo',s:'MO',p:'upperA'},{id:'di',s:'DI',p:'rest'},
    {id:'mi',s:'MI',p:'hiit',name:'Badminton (HIIT)',
     override:'Ersetzt die geplante Studio-HIIT-Einheit vollständig — kein zusätzliches Training an diesem Tag. Eine Einzel- oder Doppelpartie liefert Intervallcharakter und Herz-Kreislauf-Reiz mindestens gleichwertig zum Sprint-Protokoll, das sonst hier stünde.'},
    {id:'do',s:'DO',p:'sharms'},{id:'fr',s:'FR',p:'lower'},{id:'sa',s:'SA',p:'upperB'},{id:'so',s:'SO',p:'zone2'}]
};
export const REF_BADMINTON_MONDAY=[2026,8,14]; // Jahr, Monat 0-basiert, Tag

/* Mesozyklus: welche Muskelgruppe pro Kalendermonat priorisiert wird.
   Betrifft nur Upper A/B -- Sharms, Lower, HIIT/Badminton, Rest und
   Zone 2 sind vom Block unabhaengig. Nur die vom Nutzer festgelegten
   Monate stehen hier; jeder andere Monat faellt auf den Brust-Standard
   zurueck, bis eine weitere Rotation definiert wird. */
export const MESO_SCHEDULE={'2026-09':'chest','2026-10':'back'};
/* Haelt den zuletzt geplanten Block, statt nach Oktober grundlos auf
   Block 1 zurueckzuspringen -- eine echte Rotation braeuchte eine dritte
   Vorgabe, kein automatisches Zuruecksetzen. */
export const MESO_DEFAULT='back';

export const TG={C:{b:'#0e1a26',c:'#3a7bbf',t:'COMPOUND'},I:{b:'#1f1a0a',c:'#b8922e',t:'ISOLATION'},
P:{b:'#260e0e',c:'#c94535',t:'PRIORITÄT'},G:{b:'#0a1f14',c:'#2e9e6a',t:'GESUNDHEIT'},
K:{b:'#180e26',c:'#7a5ab5',t:'CORE'},A:{b:'#1a0e1a',c:'#7a5ab5',t:'ARMGESUND'},
O:{b:'#181818',c:'#4f4f4f',t:'OPTIONAL'},X:{b:'#261a0e',c:'#b86830',t:'SPEZIAL'},
N:{b:'#181818',c:'#757575',t:'INFO'}};

export const S={
sharms:{lb:'Sharms',ti:'Schultern · Arme · Core',ac:'#7a5ab5',du:'80–90 Min',rp:'RPE 7–9',rr:'5–16 Wdh',
lg:'Schultern zuerst (Compound → Isolation), dann Arme, Core als Abschluss. Nach zwei Ruhetagen (SO Zone 2 + Erholung) sind die Schultern vollständig frisch. Die niedrigen Wiederholungszahlen (6–8) bei Shoulder Press und Seitheben setzen auf mechanische Spannung als primären Reiz.',
nt:[{i:'🎯',t:'Preacher Curl bei 5–7 Wdh: Ungewöhnlich niedrig für Bizeps, aber wissenschaftlich valide — schwere Curls erzeugen hohe mechanische Spannung. Der Bizeps erhält zusätzlich hohes indirektes Volumen aus allen Zugübungen.'},
{i:'💪',t:'Trizeps bekommt mit JM Press + Pushdown 4 direkte Arbeitssätze am Sharms-Tag — dein stärkster Trizeps-Reiz der Woche.'},
{i:'🔬',t:'Archer-Bewegung bei Reverse Fliegende: Erweitert den ROM gegenüber der Standardausführung und erzeugt mehr Dehnung in der posterioren Schulter.'}],
ex:[
{n:'Shoulder Press (Machine Plates)',t:'Anteriore + mediale Schulter · Trizeps synergistisch',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–8',rs:'2:30',g:'C',
f:'Warm-Up mit ~50 % des Arbeitsgewichts, 10 Wdh. Ellenbogen leicht vor der Schulterebene halten — folgt dem natürlichen Humerus-Pfad. Schultern am Gipfelpunkt nicht hochziehen.',
y:'Niedriger Rep-Bereich (6–8) maximiert mechanische Spannung — der primäre Hypertrophie-Mechanismus. Maschine eliminiert Stabilisationsarbeit, sodass der volle Reiz auf dem Deltamuskel landet.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel — isoliert',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–8',rs:'2:30',g:'P',
f:'Warm-Up ~40 % × 15 Wdh. Lat aktiv anspannen → Schulterblatt deprimiert → Trapez deaktiviert. Deine Technik-Notiz ist exakt korrekt. Ellenbogen 15° gebeugt.',
y:'Schweres Seitheben (6–8 Wdh) ist ungewöhnlich, aber effektiv: Der mediale Deltoid reagiert auf hohe mechanische Spannung. Kombiniert mit den höheren Wiederholungen in Upper A/B (3–9) bekommst du beide Reiztypen über die Woche.'},

{n:'Einarmig Fliegende Reverse (Kabel) — Archer',t:'Posteriorer Deltamuskel · Infraspinatus · Teres minor',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'12–15',rs:'1:25',g:'G',
f:'Warm-Up ~30 % × 15. Archer-Bewegung: Der Arm zieht wie beim Bogenschießen weit nach hinten-außen. Am Endpunkt aktiv außenrotieren und 1 Sek halten. Einarmig = maximaler ROM ohne Kompensation.',
y:'Die Archer-Variante erweitert den Bewegungsradius deutlich gegenüber der bilateralen Ausführung — mehr Dehnung in der Startposition, stärkere Kontraktion am Endpunkt. Zusammen mit dem T-Bar Rudern (4 indirekte Sätze) liegt die hintere Schulter jetzt bei 6 Sätzen/Woche im MAV.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–7',rs:'2:15',g:'P',
f:'Warm-Up ~40 % × 12. Am Tiefpunkt Arm vollständig öffnen, 1 Sek pausieren. Am Endpunkt 1 Sek Kontraktion halten. Schultern bleiben an der Auflage.',
y:'5–7 Wdh ist schwer für Bizeps — erzeugt maximale mechanische Spannung. Der Preacher trainiert den kurzen Kopf in verkürzter Position. 3× pro Woche (MO, MI, SA) = optimale Frequenz.'},

{n:'Trizepsdrücken (Kabel) — unilateral',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'8–12',rs:'2:00',g:'I',
f:'Warm-Up ~35 % × 12. Nah am Kabelzug stehen, Ellenbogen absolut fixiert am Körper. Vollständige Streckung am Endpunkt — 1 Sek halten. Einarmig eliminiert Kompensation durch die stärkere Seite.',
y:'Unilateral vor JM Press: Der Trizeps wird isoliert vorermüdet, bevor die schwere Compound-Bewegung kommt. Pre-Exhaustion-Prinzip — stellt sicher, dass beim JM Press der Trizeps limitiert, nicht die Schulter.'},

{n:'JM Press (Barbell)',t:'Trizeps brachii — alle 3 Köpfe · Anteriore Schulter',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–10',rs:'2:15',g:'C',
f:'Warm-Up ~50 % × 8. Schulterbreiter Griff. Stange Richtung Kinn absenken (nicht senkrecht zur Brust) — das ist der JM-Bewegungspfad. Ellenbogen eng am Körper. Trizeps-Stretch am Tiefpunkt spüren, dann explosiv drücken.',
y:'JM Press = Hybrid aus Skull Crusher und engem Bankdrücken. Höchste Lastkapazität aller Trizeps-Übungen bei geringerem Ellenbogen-Stress als Skull Crusher. Zusammen mit dem Pushdown ergibt das 4 direkte Trizeps-Arbeitssätze — dein stärkster Trizeps-Tag.'},

{n:'Reverse Curl (Cable) — mit Band',t:'M. brachioradialis · M. brachialis · Unterarm-Extensoren',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'8–9',rs:'2:00',g:'A',
f:'Mit dem Band als Mischung aus Reverse und Hammer Curl. Neutrale bis pronierte Handstellung. Ellenbogen fixiert. Die Hybrid-Position aktiviert Brachioradialis und Brachialis gleichzeitig stärker als eine reine Variante.',
y:'Der Brachialis liegt unter dem Bizeps und drückt ihn optisch nach oben — direkter Beitrag zur Armdicke. Die Band-Variante erlaubt eine Griffposition zwischen Hammer (neutral) und Reverse (proniert), was beide Muskeln optimal trifft.'},

{n:'Negativ Crunch (Gewichtet)',t:'Rectus abdominis — oberer Anteil · Obliquus externus',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'9–10',rs:'2:15',g:'K',
f:'Gewicht hinter dem Kopf halten — verlängert den Hebelarm erheblich. Betonung auf der exzentrischen (negativen) Phase: 3–4 Sek kontrolliert zurücklegen. Das ist der wertvollste Teil der Bewegung.',
y:'Negativ-betontes Bauchtraining mit Zusatzgewicht ist deutlich effektiver als Standard-Crunches: Der Rectus abdominis reagiert wie jeder andere Muskel auf progressive Überlastung. Das Gewicht hinter dem Kopf maximiert das Drehmoment.'},

{n:'Beinheben am Barren',t:'Rectus abdominis — unterer Anteil · Hüftbeuger',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'12–16',rs:'2:00',g:'K',
f:'Beine gestreckt für maximalen Hebelarm. Am Gipfelpunkt das Becken leicht nach hinten kippen (posterior tilt) — sonst arbeitet primär der Hüftbeuger statt des unteren Rektus.',
y:'Ergänzt den Negativ Crunch (oberer Anteil) um den unteren Rektus. Zusammen 4 direkte Core-Sätze am Sharms-Tag.'},

{n:'Unterarm-Curls hinter dem Rücken (Langhantel)',t:'Unterarm-Flexoren · M. flexor carpi radialis et ulnaris',s:'2 Sets',w:'2 Arbeitssätze · Rest-Pause-Protokoll',r:'10–14 + RP',rs:'0:15',g:'A',
f:'Dein Protokoll: Gewicht für ~12–15 saubere Wdh wählen → 10–15 Sek Pause (3–5 tiefe Atemzüge) → 3–5 weitere Wdh → das Ganze 3–4× wiederholen. Volle Flexions-ROM.',
y:'Unterarm-Flexoren sind slow-twitch-dominant und reagieren optimal auf Rest-Pause: erhöht die effektiven Wiederholungen pro Satz erheblich ohne Gewichtssteigerung. Starker Griff überträgt sich direkt auf Klimmzüge und Rudern.'},

{n:'Wrist Extension sitzend (Langhantel)',t:'Unterarm-Extensoren · M. extensor carpi radialis/ulnaris',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'10–15',rs:'1:00',g:'A',
f:'Am hüfthohen Kabel. Unterarme aufgelegt, nur Handgelenk-Extension. Langsame Exzentrik für Sehnenanpassung.',
y:'Balanciert das hohe Wrist-Curl-Volumen. Bei 16 Unterarm-Sätzen pro Woche ist der Gegenspieler entscheidend für Epicondylitis-Prävention (Tennisarm).'}]},

hiit:{lb:'HIIT',ti:'Anaerob · VO₂max',ac:'#c94535',du:'35–45 Min',rp:'RPE 9–10',rr:'6–8 Intervalle',
lg:'Sharms-Muskeln (Schultern, Arme) brauchen keine Ausdauerkapazität → kein Interferenzeffekt mit dem Krafttag davor. Mit knapp 24h Abstand zum nächsten Kraft-Tag klingt der AMPK-Peak vorher ab, das mTOR-Signal ist dann wieder frei.',
nt:[{i:'🔄',t:'Protokoll A (Wingate) und B (Norwegische 4×4) wöchentlich wechseln — unterschiedliche Adaptationsmechanismen.'},
{i:'🏃',t:'Wenn du an diesem Tag ohnehin Sport treibst (Badminton, Fußball etc.), kann das HIIT ersetzen — Intervallcharakter ist bei Rückschlagsportarten ohnehin gegeben.'}],
ex:[
{n:'Aufwärmen (10 Min, Pflicht)',t:'Herzfrequenz progressiv auf 75–80 % HFmax',s:'10 Min',w:'',r:'—',rs:'',g:'N',
f:'Laufen, Radfahren oder Rudern — progressiv aufbauen. Kalte Sprints reduzieren Spitzenleistung um ~15 % und erhöhen Verletzungsrisiko deutlich.',
y:'Synovialflüssigkeit in die Gelenke, Herzfrequenz voraktivieren, neuromuskuläres Priming.'},
{n:'Protokoll A — Wingate-Sprints (ungerade Wochen)',t:'Anaerobe Kapazität · Laktattoleranz · Typ-IIx-Fasern',s:'8 Intervalle',w:'',r:'30 Sek ALL-OUT / 90 Sek aktiv',rs:'1:30',g:'P',
f:'Intervall 1 mit 90 % beginnen, ab Nr. 2 volle Intensität. Erste 3–5 Sek aufbauen, dann Vollgas. Bike oder Rudergerät bevorzugen — geringeres Verletzungsrisiko als Laufsprints.',
y:'Stimuliert phosphokreatinen und laktaziden Stoffwechsel. Typ-IIx-Fasern werden maximal rekrutiert — diese sind für Explosivität in deinen Sportarten (Badminton, Volleyball) direkt relevant.'},
{n:'Protokoll B — Norwegische 4×4 (gerade Wochen)',t:'VO₂max · Schlagvolumen · Kardiovaskuläres System',s:'4 Intervalle',w:'',r:'4 Min @ 90–95 % HFmax / 3 Min aktiv',rs:'3:00',g:'C',
f:'Ziel-HF 90–95 %. Minute 1–2 aufbauen, Minute 3–4 halten. In der Erholungsphase weiterbewegen — beschleunigt Laktatclearance.',
y:'Helgerud et al. (2007): effektivstes bekanntes Protokoll für VO₂max-Steigerung. Maximiert die Zeit bei über 90 % Herzkapazität.'},
{n:'Cool-Down (8–10 Min, Pflicht)',t:'Aktive Laktatelimination · Parasympathikus',s:'8–10 Min',w:'',r:'—',rs:'',g:'N',
f:'Nie abrupt stoppen. Aktive Erholung beschleunigt die Laktatclearance etwa 3× gegenüber Stillstand.',
y:'Parasympathisches Nervensystem schneller reaktivieren → bessere Erholung bis zur nächsten Einheit.'}]},

upperA_chest:{lb:'Upper A',ti:'Brust · Rücken · Compound',ac:'#b8922e',du:'80–90 Min',rp:'RPE 8–9',rr:'3–11 Wdh',
lg:'Mesozyklus Block 1 (September): Brust-Priorität. Sehr niedrige Wiederholungszahlen bei den Compound-Bewegungen (Schrägbank 4–6, T-Bar 3–8) — das ist ein kraftorientierter Hypertrophie-Tag mit maximaler mechanischer Spannung. Fliegende als Pre-Exhaustion-Einstieg stellt sicher, dass beim Schrägbankdrücken die Brust limitiert. Ab Oktober übernimmt der Rücken die Priorität — dann siehst du hier die andere Fassung dieses Tages.',
nt:[{i:'📐',t:'Fliegende zuerst: Pre-Exhaustion. Die Brust ist voraktiviert, sodass beim Schrägbankdrücken nicht der Trizeps zuerst versagt.'},
{i:'⚡',t:'T-Bar Rudern bei 3–8 Wdh mit engem Griff: Sehr schwer. Der enge Griff verlagert den Reiz stärker auf Lat und Teres major (vs. breiter Griff in Upper B → mehr Rhomboiden).'},
{i:'🔬',t:'4 Sets Seitheben = 3 Arbeitssätze. Zusammen mit Upper B (3) und Sharms (2) ergibt das 8 direkte Sätze für den medialen Deltoid.'}],
ex:[
{n:'Fliegende (Maschine)',t:'Pectoralis major — sternaler + mittlerer Anteil',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'7–10',rs:'2:30',g:'I',
f:'Warm-Up ~50 % × 10. Pre-Exhaustion-Prinzip: Brust isoliert erschöpfen. Am Tiefpunkt maximale Pectoralis-Dehnung — 1 Sek halten. Dann aktiv zusammendrücken.',
y:'Als Einstiegsübung sorgt die Isolation dafür, dass die Brust in den nachfolgenden Drückbewegungen der limitierende Faktor ist. Die Maschine hält konstante Zugspannung über den gesamten ROM — anders als freie Kurzhanteln, die am Tiefpunkt entlasten.'},

{n:'Latzug (Kabel)',t:'Latissimus dorsi · Teres major · Bizeps synergistisch',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'8–12',rs:'2:30',g:'C',
f:'Warm-Up ~45 % × 10. Vollständige Streckung am oberen Punkt — der Lat muss maximal gedehnt sein. Schulterblatt-Depression initiiert die Zugbewegung, nicht der Bizeps. Am Endpunkt 1 Sek halten.',
y:'Vertikales Zugmuster als Basis der Rückenbreite. Die Dehnungsphase am oberen Umkehrpunkt ist der stärkste Wachstumsstimulus für den Latissimus.'},

{n:'Iso-Laterales Rudern von oben',t:'Latissimus · Teres major · Rhomboiden · Posteriore Schulter',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'8–12',rs:'2:00',g:'C',
f:'Iso-lateral = jede Seite unabhängig. Nach dem Latzug ist der Lat bereits vorermüdet — hier geht es um zusätzliches Volumen mit anderem Winkel. Am Endpunkt Schulterblatt aktiv retrahieren.',
y:'Die unabhängige Seitenführung deckt Kraft-Asymmetrien auf, die bei bilateralem Training unbemerkt bleiben. Der Zugwinkel von oben trifft den Lat anders als der Latzug — Multi-Angle-Prinzip.'},

{n:'Schrägbankdrücken (Smith Machine)',t:'Pectoralis major — klavikulärer Anteil · Anteriore Schulter · Trizeps',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'4–6',rs:'2:30',g:'P',
f:'Warm-Up ~55 % × 8. Abgewinkelte Ellenbogen (nicht 90° ausgestellt) — schont das Schultergelenk erheblich. Am Tiefpunkt kontrolliert dehnen, dann kraftvoll drücken.',
y:'4–6 Wiederholungen sind der klassische Kraftbereich — maximale mechanische Spannung, der stärkste Einzelfaktor für Hypertrophie. Die Smith-Führung erlaubt es, in diesem schweren Bereich ohne Spotter sicher zu arbeiten.'},

{n:'T-Bar Rudern — enger Griff',t:'Latissimus · Teres major · Rhomboiden · Posteriore Schulter · Trapez',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'3–8',rs:'2:30',g:'P',
f:'Warm-Up ~50 % × 10. Enger Griff → Ellenbogen näher am Körper → mehr Lat und Teres major. Shrugs am Ende der Bewegung für Trapez-Aktivierung. Rücken neutral, keine Rumpfstreckung als Schwung.',
y:'3–8 Wdh macht das zur schwersten Rückenübung der Woche. Wichtig für die Volumenrechnung: T-Bar Rudern trainiert die hintere Schulter substanziell mit — zusammen mit Upper B ergibt das 4 indirekte Posterior-Delt-Sätze, wodurch dieser Muskel jetzt im MAV liegt.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel',s:'4 Sets',w:'1 Warm-Up + 3 Arbeitssätze',r:'3–9',rs:'2:30',g:'P',
f:'Warm-Up ~40 % × 12. Lat anspannen um Trapez rauszunehmen — deine Technik-Notiz. Der Rep-Bereich 3–9 erlaubt schwere Sätze am Anfang und höhere Wiederholungen bei Ermüdung.',
y:'3 Arbeitssätze hier + 3 in Upper B + 2 in Sharms = 8 direkte Sätze/Woche. Der mediale Deltoid ist der wichtigste Muskel für optische Schulterbreite und verträgt hohes Volumen.'},

{n:'Single Arm Triceps Pushdown (Cable) — mit Cuffs',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–11',rs:'1:35',g:'I',
f:'Warm-Up ~35 % × 12. Mit Cuffs statt Griff — eliminiert Unterarm-Beteiligung und isoliert den Trizeps stärker. Ellenbogen fixiert, volle Streckung am Endpunkt.',
y:'Cuffs sind ein unterschätztes Detail: Ohne Griffkraft-Limitation kann der Trizeps bis zum echten Versagen arbeiten. Nach dem Schrägbankdrücken ist er bereits vorermüdet — die Isolation schöpft die Restkapazität aus.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–7',rs:'2:15',g:'I',
f:'Warm-Up ~40 % × 12. Identische Ausführung wie am Sharms-Tag. Am Tiefpunkt vollständig öffnen, 1 Sek pausieren.',
y:'Zweiter von drei Preacher-Curl-Tagen. Der Bizeps hat bereits erhebliches indirektes Volumen aus Latzug, Iso-Rudern und T-Bar Rudern erhalten — die direkte Arbeit am Ende ist der gezielte Zusatzreiz.'},

{n:'Reverse Curl (Cable) — mit Band',t:'Brachioradialis · Brachialis',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'8–9',rs:'1:25',g:'A',
f:'Mit Band als Mischung aus Hammer und Reverse Curl. Ellenbogen fixiert, neutrale bis pronierte Handstellung.',
y:'Zweiter Brachialis-Tag. Der Brachialis ist der stärkste Ellenbogenbeuger und trägt direkt zur Armdicke bei, da er den Bizeps nach oben drückt.'},

{n:'Unterarm-Curls hinter dem Rücken — Optional',t:'Unterarm-Flexoren',s:'2 Sets',w:'2 Arbeitssätze · Rest-Pause',r:'4–16',rs:'0:15',g:'O',
f:'Optional laut deiner Routine. Rest-Pause-Protokoll wie am Sharms-Tag. Bei Erschöpfung nach dem schweren Compound-Volumen kann diese Übung entfallen.',
y:'Zweiter Unterarm-Tag der Woche. Bei bereits 16 Unterarm-Sätzen wöchentlich ist die optionale Handhabung sinnvoll — Priorität liegt auf Recovery.'}]},

/* Mesozyklus Block 2 (Oktober): Ruecken-Prioritaet. Gleiche zehn Uebungen
   wie im Brust-Block, umsortiert -- Ruecken zuerst in der Einheit, solange
   ZNS und Griffkraft frisch sind. Die eigentliche Volumenverschiebung
   (Brust runter, Ruecken rauf) passiert nicht hier, sondern drueben bei
   Upper B ueber den Dip-Tausch. Hier aendert sich nur die Reihenfolge. */
upperA_back:{lb:'Upper A',ti:'Rücken · Brust · Compound',ac:'#b8922e',du:'80–90 Min',rp:'RPE 8–9',rr:'3–11 Wdh',
lg:'Mesozyklus Block 2 (Oktober): Rücken-Priorität. Latzug und Iso-Rudern eröffnen jetzt die Einheit, solange Griffkraft und Nervensystem frisch sind — genau die Logik, die im September für die Brust galt, jetzt umgekehrt. Die Satzzahlen bleiben hier unverändert; die tatsächliche Volumenverschiebung zwischen Brust und Rücken passiert drüben bei Upper B über den Dip-Tausch.',
nt:[{i:'🔄',t:'Reihenfolge gedreht: Rücken zuerst, Brust danach. Die Pre-Exhaustion-Logik der Fliegenden entfällt dadurch für diesen Block — sie kommt jetzt als Übergang nach dem Rückenblock, nicht mehr als Einstieg.'},
{i:'⚡',t:'T-Bar Rudern bei 3–8 Wdh mit engem Griff: unverändert der schwerste Rückenreiz der Woche. Enger Griff = mehr Lat und Teres major (vs. breiter Griff in Upper B → mehr Rhomboiden).'},
{i:'🔬',t:'4 Sets Seitheben = 3 Arbeitssätze, unverändert. Zusammen mit Upper B (3) und Sharms (2) weiterhin 8 direkte Sätze für den medialen Deltoid — der Block ändert nichts an der Schulter.'}],
ex:[
{n:'Latzug (Kabel)',t:'Latissimus dorsi · Teres major · Bizeps synergistisch',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'8–12',rs:'2:30',g:'C',
f:'Warm-Up ~45 % × 10. Vollständige Streckung am oberen Punkt — der Lat muss maximal gedehnt sein. Schulterblatt-Depression initiiert die Zugbewegung, nicht der Bizeps. Am Endpunkt 1 Sek halten.',
y:'Eröffnet jetzt die Einheit statt an zweiter Stelle zu stehen — der Lat bekommt den frischesten Zustand des Tages. Die Dehnungsphase am oberen Umkehrpunkt ist der stärkste Wachstumsstimulus für den Latissimus.'},

{n:'Iso-Laterales Rudern von oben',t:'Latissimus · Teres major · Rhomboiden · Posteriore Schulter',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'8–12',rs:'2:00',g:'C',
f:'Iso-lateral = jede Seite unabhängig. Direkt nach Latzug, solange die Zugkraft noch frisch ist. Am Endpunkt Schulterblatt aktiv retrahieren.',
y:'Zweite Rückenübung des Blocks, jetzt an Position 2 statt 3 — mehr Kraftreserve für den zusätzlichen Winkel. Die unabhängige Seitenführung deckt Kraft-Asymmetrien auf, die bei bilateralem Training unbemerkt bleiben.'},

{n:'Fliegende (Maschine)',t:'Pectoralis major — sternaler + mittlerer Anteil',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'7–10',rs:'2:30',g:'I',
f:'Warm-Up ~50 % × 10. Nach zwei Rückenübungen ist die Zugmuskulatur vorermüdet — die Brust startet jetzt frisch in ihren Teil der Einheit. Am Tiefpunkt maximale Pectoralis-Dehnung — 1 Sek halten.',
y:'Übernimmt hier die Rolle des Übergangs zur Brust statt der Pre-Exhaustion-Einleitung. Die Maschine hält konstante Zugspannung über den gesamten ROM — auch bei reduzierter Frische noch ein sauberer Reiz.'},

{n:'Schrägbankdrücken (Smith Machine)',t:'Pectoralis major — klavikulärer Anteil · Anteriore Schulter · Trizeps',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'4–6',rs:'2:30',g:'P',
f:'Warm-Up ~55 % × 8. Abgewinkelte Ellenbogen (nicht 90° ausgestellt) — schont das Schultergelenk erheblich. Am Tiefpunkt kontrolliert dehnen, dann kraftvoll drücken.',
y:'Bleibt bei 4–6 Wdh im klassischen Kraftbereich, jetzt aber nach zwei Rückenübungen und der Brust-Isolation — bewusst spätere Position im Erhaltungs-Block der Brust. Die Smith-Führung sichert das auch bei reduzierter Frische ab.'},

{n:'T-Bar Rudern — enger Griff',t:'Latissimus · Teres major · Rhomboiden · Posteriore Schulter · Trapez',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'3–8',rs:'2:30',g:'P',
f:'Warm-Up ~50 % × 10. Enger Griff → Ellenbogen näher am Körper → mehr Lat und Teres major. Shrugs am Ende der Bewegung für Trapez-Aktivierung. Rücken neutral, keine Rumpfstreckung als Schwung.',
y:'3–8 Wdh macht das weiterhin zur schwersten Rückenübung der Woche — jetzt als dritte statt vierte Rückenbewegung. T-Bar Rudern trainiert die hintere Schulter substanziell mit; zusammen mit Upper B ergibt das weiterhin 4 indirekte Posterior-Delt-Sätze.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel',s:'4 Sets',w:'1 Warm-Up + 3 Arbeitssätze',r:'3–9',rs:'2:30',g:'P',
f:'Warm-Up ~40 % × 12. Lat anspannen um Trapez rauszunehmen — deine Technik-Notiz. Der Rep-Bereich 3–9 erlaubt schwere Sätze am Anfang und höhere Wiederholungen bei Ermüdung.',
y:'3 Arbeitssätze hier + 3 in Upper B + 2 in Sharms = weiterhin 8 direkte Sätze/Woche. Der Block ändert nichts an der Schulter-Planung.'},

{n:'Single Arm Triceps Pushdown (Cable) — mit Cuffs',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–11',rs:'1:35',g:'I',
f:'Warm-Up ~35 % × 12. Mit Cuffs statt Griff — eliminiert Unterarm-Beteiligung und isoliert den Trizeps stärker. Ellenbogen fixiert, volle Streckung am Endpunkt.',
y:'Nach dem Schrägbankdrücken bereits vorermüdet — die Isolation schöpft die Restkapazität aus. Unverändert gegenüber dem Brust-Block.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–7',rs:'2:15',g:'I',
f:'Warm-Up ~40 % × 12. Identische Ausführung wie am Sharms-Tag. Am Tiefpunkt vollständig öffnen, 1 Sek pausieren.',
y:'Zweiter von drei Preacher-Curl-Tagen. Der Bizeps hat bereits erhebliches indirektes Volumen aus Latzug, Iso-Rudern und T-Bar Rudern erhalten — unverändert gegenüber dem Brust-Block.'},

{n:'Reverse Curl (Cable) — mit Band',t:'Brachioradialis · Brachialis',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'8–9',rs:'1:25',g:'A',
f:'Mit Band als Mischung aus Hammer und Reverse Curl. Ellenbogen fixiert, neutrale bis pronierte Handstellung.',
y:'Zweiter Brachialis-Tag. Unverändert gegenüber dem Brust-Block.'},

{n:'Unterarm-Curls hinter dem Rücken — Optional',t:'Unterarm-Flexoren',s:'2 Sets',w:'2 Arbeitssätze · Rest-Pause',r:'4–16',rs:'0:15',g:'O',
f:'Optional laut deiner Routine. Rest-Pause-Protokoll wie am Sharms-Tag. Bei Erschöpfung nach dem schweren Compound-Volumen kann diese Übung entfallen.',
y:'Zweiter Unterarm-Tag der Woche. Unverändert gegenüber dem Brust-Block.'}]},

rest:{lb:'Rest',ti:'Vollständige Erholung',ac:'#2e9e6a',du:'Kein Training',rp:'—',rr:'—',
lg:'Nach mehreren aufeinanderfolgenden Trainingstagen ist systemische Ermüdung akkumuliert. Dieser Ruhetag bestimmt direkt die Qualität der beiden folgenden Einheiten.',
nt:[{i:'📊',t:'HRV morgens messen (liegend, vor dem Aufstehen). Über 10 % unter deinem Basiswert: nur Spaziergang. Über 15 % darunter: vollständige Ruhe und Schlaf priorisieren.'},
{i:'🍽️',t:'Kalorienaufnahme nicht reduzieren. Muskelreparatur läuft an Ruhetagen auf Hochtouren — der Bedarf ist praktisch identisch mit Trainingstagen.'},
{i:'🏸',t:'Falls du hier eine Sportart einschieben willst (Badminton, Radfahren): unproblematisch, solange die Intensität moderat bleibt. Das ist funktionale aktive Erholung.'}],
ex:[
{n:'Optionaler Spaziergang',t:'Parasympathikus · Kapilläre Durchblutung',s:'20–30 Min',w:'',r:'—',rs:'',g:'O',
f:'Kein Schwitzen, keine nennenswerte Herzfrequenz-Erhöhung. Ziel ist erhöhter Blutfluss in reparierenden Geweben ohne neuen Trainingsreiz.',
y:'Leichte Bewegung fördert Sauerstoff- und Nährstoffzufuhr in reparierende Muskulatur. Supercompensation findet in dieser Phase statt.'},
{n:'Statisches Dehnen + PNF',t:'ROM-Erhalt · Muskelspannungsreduktion',s:'15–20 Min',w:'',r:'—',rs:'',g:'O',
f:'Pectoralis, Latissimus, posteriore Schulter, Unterarme je 60–90 Sek. PNF-Technik: 6 Sek isometrisch anspannen, ausatmen, dann tiefer in die Dehnung.',
y:'PNF-Dehnen erzielt messbar tiefere ROM-Gewinne als passives Dehnen. An Ruhetagen (nicht vor dem Krafttraining) ist statisches Dehnen gut evidenziert.'}]},

lower:{lb:'Lower',ti:'Beine · Core',ac:'#3a7bbf',du:'75–85 Min',rp:'RPE 7–9',rr:'5–18 Wdh',
lg:'Kompakter Beintag mit schwerem Fokus: Beinpresse bei 5–8 Wdh ist bewusst der niedrige Rep-Bereich einmal pro Woche. Ergänzt durch Core und Rumpfstabilität. Das Beinvolumen ist bewusst moderat gehalten, da deine Sportarten kontinuierlich Beinreiz liefern.',
nt:[{i:'🏃',t:'Bewusst niedrigeres Beinvolumen: Badminton, Beachvolleyball, Fußball, Wandern, Radfahren, Schlittschuh und Surfen liefern kontinuierlich Sprung-, Sprint- und Ausdauerreize. Sportartspezifische Belastung ist funktional oft wertvoller als isoliertes Maschinenvolumen.'},
{i:'⚡',t:'Beinpresse bei 5–8 Wdh: Der niedrige Rep-Bereich einmal wöchentlich hat echte Vorteile — Rekrutierung hochschwelliger motorischer Einheiten, Sehnenanpassung, neuronale Effizienz.'},
{i:'🎯',t:'Hyperextension mit niedrigem Polster: Deine Notiz "aus dem Arsch ziehen" ist technisch korrekt — tiefes Polster verlagert den Hebel Richtung Hüftextension und damit auf den Gluteus statt auf den unteren Rücken.'}],
ex:[
{n:'Beinbeugen sitzend',t:'Hamstrings — Biceps femoris in Dehnungsposition',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–15',rs:'2:15',g:'P',
f:'Warm-Up ~40 % × 12. Sitzend = Hüfte gebeugt = Biceps femoris in gestreckterem Segment. 1 Sek Kontraktion in der Beugung halten, 2 Sek exzentrisch bremsen.',
y:'Maeo et al. (2021) zeigten: Seated Leg Curl erzeugt signifikant mehr Hamstring-Hypertrophie als die liegende Variante, weil die Hüftbeugung den Muskel in gestreckterer Position arbeiten lässt.'},

{n:'Beinpresse',t:'Quadrizeps · Gluteus maximus · Adduktoren',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–8',rs:'2:45',g:'P',
f:'Zweistufiges Warm-Up: ~50 % × 8, dann ~70 % × 3. Schwer mit wenigen Wiederholungen — deine Notiz. Fußposition mittig für balancierten Reiz. 3 Sek Absenken, kurze Pause in der Tiefe.',
y:'Der niedrige Rep-Bereich (5–8) einmal pro Woche rekrutiert hochschwellige motorische Einheiten, die bei 12–15 Wdh kaum erreicht werden. Zusätzlich: Sehnen- und Bindegewebsanpassung, die direkt auf deine Sprungsportarten überträgt.'},

{n:'Beinstrecken',t:'Quadrizeps — alle 4 Köpfe, Rectus femoris isoliert',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–7',rs:'2:30',g:'I',
f:'Warm-Up ~40 % × 15. 2 Sek Pause in der vollständigen Streckung, 2 Sek exzentrisch absenken. Der Rectus femoris wird hier deutlich stärker aktiviert als bei der Beinpresse.',
y:'Der Rectus femoris verläuft über Hüfte und Knie und wird bei der Beinpresse (Hüfte gebeugt) kaum trainiert. Das Beinstrecken schließt diese Lücke gezielt.'},

{n:'Hüftadduktion',t:'Adduktorengruppe — M. adductor magnus, longus, brevis',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'10',rs:'2:00',g:'X',
f:'Kontrollierte Bewegung, 1 Sek Kontraktion am Endpunkt halten. Volle ROM — auch die Dehnungsposition ausnutzen.',
y:'Adduktoren sind bei Richtungswechseln (Badminton, Fußball, Volleyball) hochbelastet und ein häufiger Ort von Zerrungen. Direktes Training ist für dich mit diesem Sportprofil echte Verletzungsprophylaxe — nicht nur Ästhetik.'},

{n:'Wadenpressen (Maschine)',t:'Gastrocnemius · Soleus',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'12–15',rs:'2:00',g:'I',
f:'Volle ROM: Ferse maximal absenken und 2 Sek in der Dehnung halten, dann maximale Plantarflexion mit 2 Sek Halten am Gipfelpunkt. Kein Schwung.',
y:'Wadenvolumen ist niedrig gehalten, weil deine Sportarten (Badminton, Volleyball, Schlittschuh, Wandern) die Waden kontinuierlich hoch belasten. Die Dehnungspause ist wichtig für die Achillessehnengesundheit bei diesem Sprungvolumen.'},

{n:'Hyperextension (Gewichtet)',t:'Gluteus maximus · Erector spinae · Hamstrings',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6',rs:'2:30',g:'P',
f:'Polster recht niedrig einstellen — dann kommt die Bewegung aus der Hüfte statt aus dem unteren Rücken. Deine Notiz "aus dem Arsch ziehen" beschreibt das exakt. Am oberen Endpunkt Gluteus 1 Sek maximal kontrahieren. Keine Überstreckung der Lendenwirbelsäule.',
y:'Die einzige Hüftextensions-Übung im Plan — damit der Hauptstimulus für den Gluteus. Das niedrige Polster ist entscheidend: Es verlagert den Drehpunkt zur Hüfte und macht daraus eine Gluteus-Übung statt einer Rückenstrecker-Übung.'},

{n:'Side Bend',t:'Obliquus externus et internus · Quadratus lumborum',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'18',rs:'1:30',g:'K',
f:'Kontrollierte laterale Flexion, keine Rotation. Volle ROM in beide Richtungen. Höhere Wiederholungen (18) passen zum Stabilisatorcharakter.',
y:'Schräge Bauchmuskeln sind bei Rotationssportarten (Badminton, Volleyball, Surfen) funktional zentral. Der Quadratus lumborum stabilisiert zusätzlich die Lendenwirbelsäule bei einseitiger Belastung.'},

{n:'Negativ Crunch (Gewichtet)',t:'Rectus abdominis — oberer Anteil',s:'4 Sets',w:'1 Warm-Up + 3 Arbeitssätze',r:'8–10',rs:'2:00',g:'K',
f:'Gewicht hinter dem Kopf. Betonung auf der exzentrischen Phase: 3–4 Sek kontrolliert zurücklegen. 3 Arbeitssätze machen das zum Haupt-Core-Reiz der Woche.',
y:'Negativ-betontes Bauchtraining mit progressiver Überlastung. Die exzentrische Phase erzeugt den größten mikrostrukturellen Reiz — beim Bauch genauso wie bei jedem anderen Muskel.'},

{n:'Beinheben am Barren',t:'Rectus abdominis — unterer Anteil · Hüftbeuger',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'12',rs:'2:00',g:'K',
f:'Beine gestreckt für maximalen Hebelarm. Posterior tilt am Gipfelpunkt für den unteren Rektus.',
y:'Zusammen mit Negativ Crunch und Side Bend deckt der Lower-Tag alle Rumpfebenen ab: Flexion, laterale Flexion und untere Rektus-Aktivierung.'},

{n:'Unterarm-Curls hinter dem Rücken — Optional',t:'Unterarm-Flexoren',s:'2 Sets',w:'2 Arbeitssätze · Rest-Pause',r:'4–16',rs:'0:15',g:'O',
f:'Optional. Rest-Pause-Protokoll. Am Lower-Tag ist der Oberkörper frisch — hier kannst du Unterarme ohne Interferenz trainieren.',
y:'Dritter Unterarm-Tag. Der Lower-Tag ist strategisch günstig dafür, weil keine Griffkraft für andere Übungen benötigt wird.'}]},

upperB_chest:{lb:'Upper B',ti:'Brust · Rücken · Variation',ac:'#b8922e',du:'85–95 Min',rp:'RPE 7–9',rr:'5–12 Wdh',
lg:'Mesozyklus Block 1 (September): Brust-Priorität. Upper B hat höheres Brustvolumen als Upper A (6 vs. 4 Arbeitssätze) und ergänzt die Winkel: Dip (untere Brust), Fliegende (mittlere Brust), Schrägbank (obere Brust). Dazu die Überzüge als Brustkorb-Erweiterung. Der Rep-Bereich liegt etwas höher als bei Upper A. Ab Oktober weicht der Dip einem Rückenzug — die Erklärung steht dann in der Rücken-Fassung dieses Tages.',
nt:[{i:'🫁',t:'Überzüge mit tiefem Atmen: Die klassische Rader-Methode zur Thoraxerweiterung. Mit 18 Jahren ist der Rippenknorpel noch formbar — das ist wissenschaftlich das Zeitfenster, in dem diese Übung überhaupt strukturell wirken kann.'},
{i:'📐',t:'T-Bar Rudern hier mit breitem Griff (vs. eng bei Upper A): Breiter Griff = mehr Rhomboiden und hintere Schulter, enger Griff = mehr Lat. Bewusste Variation über die Woche.'},
{i:'⚠️',t:'Brust Dip: Deine Notiz "je nach Schulterzustand weglassen" ist die richtige Herangehensweise. Dips belasten das Schultergelenk in der Endposition stark — bei Beschwerden ersatzlos streichen.'}],
ex:[
{n:'Brust Dip (Gewichtet)',t:'Pectoralis major — unterer Anteil · Anteriore Schulter · Trizeps',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'8–12',rs:'2:15',g:'C',
f:'Warm-Up mit Körpergewicht × 8, langsame Exzentrik. Nicht zu tief gehen und nach vorne gebeugt bleiben — deine Notiz. Die Vorbeugung macht daraus eine Brustübung statt einer Trizepsübung. Bei Schulterbeschwerden weglassen.',
y:'Der Dip trainiert die Brust in einer Schulterextensions-Bewegung — biomechanisch einzigartig unter allen Brustübungen. Die begrenzte Tiefe schützt das Schultergelenk, ohne den Reiz wesentlich zu reduzieren.'},

{n:'Klimmzug (Gewichtet)',t:'Latissimus dorsi · Teres major · Bizeps · Rhomboiden',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–12',rs:'2:30',g:'P',
f:'Warm-Up mit Körpergewicht × 5, langsame Exzentrik und volle ROM. Am Tiefpunkt vollständige Armstreckung — kein halbes Hängen. Schulterblatt-Depression initiiert die Bewegung.',
y:'Die überlegene Latissimus-Übung durch unbegrenzte Progression via Zusatzgewicht. Der volle ROM mit maximaler Dehnung am Tiefpunkt ist der stärkste Wachstumsreiz für den Lat.'},

{n:'Fliegende (Maschine)',t:'Pectoralis major — mittlerer + sternaler Anteil',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'7–11',rs:'2:15',g:'I',
f:'Aufrechte Maschine bevorzugen, Sitz eher höher einstellen — deine Notiz. Die höhere Sitzposition verschiebt den Zugwinkel und trifft mehr mittlere bis untere Brustfasern. Am Tiefpunkt 1 Sek Dehnung halten.',
y:'Die Sitzhöhe ist ein unterschätzter Parameter: Sie bestimmt, welcher Pectoralis-Bereich primär arbeitet. Höherer Sitz = Zugbahn tendenziell abwärts = mehr sternaler Anteil.'},

{n:'Überzüge — tief atmen',t:'Latissimus · Pectoralis · Serratus anterior · Rippenknorpel',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'15–20',rs:'2:00',g:'X',
f:'Leichtes Gewicht, hohe Wiederholungen. In der Dehnungsposition (Hantel hinter dem Kopf) maximal tief einatmen und den Brustkorb bewusst weiten. Beim Zurückführen ausatmen. Die Atmung ist hier wichtiger als das Gewicht.',
y:'Die klassische Rader-Methode zur Thoraxerweiterung. Mit 18 Jahren ist der Rippenknorpel noch formbar und die mediale Clavicula-Epiphyse offen — dies ist das biologische Zeitfenster, in dem diese Übung strukturell wirken kann. Zusätzlich trainiert sie den Serratus anterior, der die Rippen von innen nach außen drückt.'},

{n:'T-Bar Rudern — breiter Griff',t:'Rhomboiden · Trapez · Posteriore Schulter · Latissimus',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–9',rs:'2:30',g:'C',
f:'Warm-Up ~50 % × 10. Breiter Griff → Ellenbogen weiter außen → mehr Rhomboiden und hintere Schulter. Shrugs am Ende, Schulterblätter aktiv kontrahieren.',
y:'Der breite Griff verlagert den Reiz gegenüber Upper A (enger Griff) deutlich Richtung Rhomboiden und posteriore Schulter. Diese beiden T-Bar-Tage liefern zusammen 4 indirekte Sätze für die hintere Schulter — der Grund, warum dieser Muskel jetzt im MAV liegt.'},

{n:'Schrägbankdrücken (Smith Machine)',t:'Pectoralis major — klavikulärer Anteil · Anteriore Schulter · Trizeps',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–10',rs:'2:30',g:'C',
f:'Warm-Up ~55 % × 8. Rumpf anspannen — deine Notiz. Der Rep-Bereich ist etwas höher als bei Upper A (4–6), was einen anderen Reiztyp setzt.',
y:'Gleiche Übung wie Upper A, aber höherer Rep-Bereich. Über die Woche bekommt die obere Brust damit sowohl schwere mechanische Spannung (MI) als auch metabolischen Stress (SA) — beide Hypertrophie-Mechanismen abgedeckt.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel',s:'4 Sets',w:'1 Warm-Up + 3 Arbeitssätze',r:'6–9',rs:'2:30',g:'P',
f:'Warm-Up ~40 % × 12. Lat anspannen um Trapez rauszunehmen. 3 Arbeitssätze wie bei Upper A.',
y:'Insgesamt 8 direkte Seitheben-Arbeitssätze pro Woche über drei Tage verteilt. Der mediale Deltoid ist der entscheidende Muskel für Schulterbreite und verträgt dieses Volumen problemlos.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–7',rs:'2:15',g:'I',
f:'Warm-Up ~40 % × 12. Dritter Preacher-Curl-Tag der Woche. Am Tiefpunkt vollständig öffnen.',
y:'3× wöchentlich Preacher Curl bei 5–7 Wdh: hohe Frequenz mit schwerer Last. Zusammen mit dem indirekten Volumen aus Klimmzügen und T-Bar Rudern erreicht der Bizeps 12 Sätze/Woche.'},

{n:'Trizepsdrücken (Kabel)',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–12',rs:'1:30',g:'I',
f:'Warm-Up ~35 % × 12. Ellenbogen fixiert, vollständige Streckung am Endpunkt mit 1 Sek Halten.',
y:'Nach Dip und Schrägbankdrücken ist der Trizeps bereits doppelt vorermüdet. Die Isolation am Ende schöpft die Restkapazität gezielt aus.'},

{n:'Reverse Curl (Cable) — mit Band',t:'Brachioradialis · Brachialis · Unterarm-Extensoren',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'10–15',rs:'1:30',g:'A',
f:'Mit Band als Mix aus Hammer und Reverse Curl. Ellenbogen fixiert, Handstellung zwischen neutral und proniert.',
y:'Dritter Brachialis-Tag. Die Hybrid-Griffposition trifft Brachioradialis und Brachialis gleichzeitig — effizienter als zwei separate Übungen.'},

{n:'Unterarm-Curls hinter dem Rücken (Langhantel)',t:'Unterarm-Flexoren',s:'2 Sets',w:'2 Arbeitssätze · Rest-Pause',r:'4–16',rs:'0:15',g:'A',
f:'Rest-Pause-Protokoll wie an den anderen Tagen. Letzter Unterarm-Tag vor der nächsten Ruhephase.',
y:'Vierter Unterarm-Tag. Bei insgesamt 16 Sätzen pro Woche liegt das Volumen am oberen MAV-Rand — beobachte die Ellenbogensehnen und reduziere bei Reizungen.'}]},

/* Mesozyklus Block 2 (Oktober): Ruecken-Prioritaet. Der eigentliche
   Volumen-Tausch: Brust Dip (2 Arbeitssaetze) faellt weg, ein drittes
   Ruecken-Element kommt an dieselbe Stelle in der Reihenfolge -- dieselbe
   Position in der Einheit, umgekehrter Reiz. Pectoralis faellt dadurch von
   10 auf 8 Saetze/Woche (unterer MAV-Rand), Latissimus steigt von 8 auf
   10 (oberer MAV-Rand). Siehe VOL_BACK fuer die Tabelle. */
upperB_back:{lb:'Upper B',ti:'Rücken · Brust · Variation',ac:'#b8922e',du:'85–95 Min',rp:'RPE 7–9',rr:'5–12 Wdh',
lg:'Mesozyklus Block 2 (Oktober): Rücken-Priorität. Der Brust Dip pausiert für die Dauer des Blocks — an seiner Stelle in der Reihenfolge steht jetzt Einarmiges Kurzhantelrudern, das dritte Rückenelement neben Klimmzug und T-Bar. Damit fällt Brust von 10 auf 8 Sätze/Woche (unterer MAV-Rand), Rücken steigt von 8 auf 10 (oberer MAV-Rand) — eine echte Verschiebung, kein bloßes Umsortieren. Dieser Block bleibt über Oktober hinaus aktiv, bis eine dritte Priorität feststeht — kein automatischer Rücksprung zur Brust.',
nt:[{i:'🔁',t:'Der Tausch: Brust Dip raus, Einarmiges Kurzhantelrudern rein — exakt an dessen Position als Übung 3. Das ist der einzige Eingriff, der tatsächlich Volumen zwischen den Muskeln verschiebt; alles andere in diesem Block ist nur umsortiert.'},
{i:'🫁',t:'Überzüge mit tiefem Atmen: unverändert die Rader-Methode zur Thoraxerweiterung. Mit 18 Jahren ist der Rippenknorpel noch formbar — das gilt unabhängig vom aktiven Block.'},
{i:'📐',t:'T-Bar Rudern hier weiterhin mit breitem Griff (vs. eng bei Upper A): mehr Rhomboiden und hintere Schulter. Jetzt an zweiter statt fünfter Stelle — mehr Kraftreserve für den Griff.'}],
ex:[
{n:'Klimmzug (Gewichtet)',t:'Latissimus dorsi · Teres major · Bizeps · Rhomboiden',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–12',rs:'2:30',g:'P',
f:'Warm-Up mit Körpergewicht × 5, langsame Exzentrik und volle ROM. Am Tiefpunkt vollständige Armstreckung — kein halbes Hängen. Schulterblatt-Depression initiiert die Bewegung.',
y:'Eröffnet jetzt die Einheit statt an zweiter Stelle zu stehen — die überlegene Latissimus-Übung bekommt den frischesten Zustand des Tages. Der volle ROM mit maximaler Dehnung am Tiefpunkt ist der stärkste Wachstumsreiz für den Lat.'},

{n:'T-Bar Rudern — breiter Griff',t:'Rhomboiden · Trapez · Posteriore Schulter · Latissimus',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–9',rs:'2:30',g:'C',
f:'Warm-Up ~50 % × 10. Breiter Griff → Ellenbogen weiter außen → mehr Rhomboiden und hintere Schulter. Shrugs am Ende, Schulterblätter aktiv kontrahieren.',
y:'Zweite Rückenübung des Blocks, direkt nach Klimmzug statt an fünfter Stelle — mehr Kraftreserve für den schweren Zug. Der breite Griff verlagert den Reiz gegenüber Upper A (enger Griff) Richtung Rhomboiden und posteriore Schulter.'},

{n:'Einarmiges Kurzhantelrudern',t:'Latissimus dorsi · Rhomboiden · Teres major — unilateral',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'8–10',rs:'2:00',g:'X',
f:'Auf der Bank abgestützt (Knie und Hand derselben Seite), freier Arm hängt vollständig gestreckt. Ellenbogen eng am Körper nach hinten-oben ziehen, am Endpunkt Schulterblatt aktiv retrahieren und 1 Sek halten. Kontrolliert bis zur vollen Dehnung ablassen.',
y:'Ersetzt den Brust Dip für die Dauer des Rücken-Blocks — dritte Rückenübung an derselben Stelle in der Reihenfolge, an der sonst die erste Brustübung stünde. Unilateral erlaubt einen tieferen Dehnungsweg als jede bilaterale Variante, weil der Rücken nicht durch eine Stangenbreite limitiert wird, und deckt Kraft-Asymmetrien zwischen beiden Seiten auf, die Klimmzug und T-Bar nicht zeigen.'},

{n:'Fliegende (Maschine)',t:'Pectoralis major — mittlerer + sternaler Anteil',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'7–11',rs:'2:15',g:'I',
f:'Aufrechte Maschine bevorzugen, Sitz eher höher einstellen — deine Notiz. Die höhere Sitzposition verschiebt den Zugwinkel und trifft mehr mittlere bis untere Brustfasern. Am Tiefpunkt 1 Sek Dehnung halten.',
y:'Nach drei Rückenübungen der Einstieg in den Brustteil der Einheit — bewusst später, weil Brust in diesem Block auf Erhaltungsvolumen läuft. Die Sitzhöhe bleibt der entscheidende Parameter für den Faserbereich.'},

{n:'Überzüge — tief atmen',t:'Latissimus · Pectoralis · Serratus anterior · Rippenknorpel',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'15–20',rs:'2:00',g:'X',
f:'Leichtes Gewicht, hohe Wiederholungen. In der Dehnungsposition (Hantel hinter dem Kopf) maximal tief einatmen und den Brustkorb bewusst weiten. Beim Zurückführen ausatmen. Die Atmung ist hier wichtiger als das Gewicht.',
y:'Unverändert gegenüber dem Brust-Block — die Rader-Methode zur Thoraxerweiterung ist blockunabhängig sinnvoll, solange die mediale Clavicula-Epiphyse offen ist. Zusätzlich trainiert sie den Serratus anterior.'},

{n:'Schrägbankdrücken (Smith Machine)',t:'Pectoralis major — klavikulärer Anteil · Anteriore Schulter · Trizeps',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–10',rs:'2:30',g:'C',
f:'Warm-Up ~55 % × 8. Rumpf anspannen — deine Notiz. Der Rep-Bereich ist etwas höher als bei Upper A (4–6), was einen anderen Reiztyp setzt.',
y:'Letzte Brustübung des Blocks statt der zweiten — bewusst spät positioniert, solange Brust auf Erhaltungsvolumen läuft. Der Rep-Bereich bleibt höher als bei Upper A für metabolischen statt mechanischen Reiz.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel',s:'4 Sets',w:'1 Warm-Up + 3 Arbeitssätze',r:'6–9',rs:'2:30',g:'P',
f:'Warm-Up ~40 % × 12. Lat anspannen um Trapez rauszunehmen. 3 Arbeitssätze wie bei Upper A.',
y:'Insgesamt weiterhin 8 direkte Seitheben-Arbeitssätze pro Woche. Der Block ändert nichts an der Schulter-Planung.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–7',rs:'2:15',g:'I',
f:'Warm-Up ~40 % × 12. Dritter Preacher-Curl-Tag der Woche. Am Tiefpunkt vollständig öffnen.',
y:'Unverändert gegenüber dem Brust-Block. Zusammen mit dem indirekten Volumen aus Klimmzügen, T-Bar Rudern und jetzt auch dem einarmigen Rudern erreicht der Bizeps in diesem Block eher mehr als 12 Sätze/Woche.'},

{n:'Trizepsdrücken (Kabel)',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–12',rs:'1:30',g:'I',
f:'Warm-Up ~35 % × 12. Ellenbogen fixiert, vollständige Streckung am Endpunkt mit 1 Sek Halten.',
y:'Nach Schrägbankdrücken vorermüdet — ohne den Dip diesmal nur einfach statt doppelt vorermüdet. Unverändert sonst gegenüber dem Brust-Block.'},

{n:'Reverse Curl (Cable) — mit Band',t:'Brachioradialis · Brachialis · Unterarm-Extensoren',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'10–15',rs:'1:30',g:'A',
f:'Mit Band als Mix aus Hammer und Reverse Curl. Ellenbogen fixiert, Handstellung zwischen neutral und proniert.',
y:'Unverändert gegenüber dem Brust-Block.'},

{n:'Unterarm-Curls hinter dem Rücken (Langhantel)',t:'Unterarm-Flexoren',s:'2 Sets',w:'2 Arbeitssätze · Rest-Pause',r:'4–16',rs:'0:15',g:'A',
f:'Rest-Pause-Protokoll wie an den anderen Tagen. Letzter Unterarm-Tag vor der nächsten Ruhephase.',
y:'Unverändert gegenüber dem Brust-Block.'}]},

zone2:{lb:'Zone 2',ti:'Aerobe Basis · Erholung',ac:'#2e9e6a',du:'40–60 Min',rp:'RPE 4–5',rr:'60–70 % HFmax',
lg:'Niedrigste Intensität der Woche, aktive Erholung vor der nächsten Einheit. Die AMPK-Aktivierung ist minimal, sodass kein Interferenzeffekt mit dem Krafttag davor entsteht.',
nt:[{i:'🫁',t:'Nasenatemtest: Du musst vollständige Sätze sprechen können. Keuchst du, bist du zu schnell. Zone 2 fühlt sich unangenehm langsam an.'},
{i:'🚴',t:'Radfahren, Wandern oder lockeres Surfen zählen hier vollwertig. Deine Sportarten decken Zone 2 teilweise ohnehin ab — nutze das.'},
{i:'📅',t:'Dein natürlicher Deload alle ~6 Wochen durch Urlaub oder Krankheit ersetzt einen formalen Deload. Bei frühen Übertrainingssignalen: Intensität an den Upper-Tagen um 40 % reduzieren, Zone 2 beibehalten.'}],
ex:[
{n:'Laufen / Radfahren / Rudern',t:'PGC-1α-Aktivierung · Mitochondriogenese · Fettoxidation',s:'40–60 Min',w:'',r:'kontinuierlich',rs:'',g:'N',
f:'5 Min sehr leicht starten. Nasenatmung aufrechterhalten, Herzfrequenz zwischen 60–70 % HFmax. Nutze die Zeit als mentalen Reset der Woche.',
y:'Zone 2 aktiviert PGC-1α, den Masterregulator der Mitochondriogenese. Mehr Mitochondrien bedeuten bessere aerobe Kapazität, effizientere Fettoxidation und schnellere Laktatclearance — überträgt sich direkt auf deine Sportarten.'},
{n:'Statisches Dehnen — optional',t:'Wochenabschluss · ROM-Erhalt',s:'15 Min',w:'',r:'—',rs:'',g:'O',
f:'Alle Muskelgruppen der Woche systematisch durchgehen: Pectoralis, Latissimus, posteriore Schulter, Unterarme, Hüftbeuger, Hamstrings, Waden. Je 60–90 Sek.',
y:'Wochenabschluss-Ritual. Signalisiert dem Nervensystem den vollständigen Übergang in den Erholungsmodus vor der nächsten Einheit.'}]}};

/* VOL_CHEST = Mesozyklus Block 1 (September). VOL_BACK = Block 2 (Oktober),
   nur die zwei mechanisch betroffenen Zeilen unterscheiden sich: Pectoralis
   (SA verliert den Dip, -2) und Latissimus (SA gewinnt das einarmige
   Rudern, +2) -- exakt der Tausch aus upperB_back, sonst nichts geraten. */
export const VOL_CHEST=[
{m:'Pectoralis',mo:0,mi:4,fr:0,sa:6,syn:0,mav:[8,16],n:'MI: Fliegende(2)+Schrägbank(2) · SA: Dip(2)+Fliegende(2)+Schrägbank(2)'},
{m:'Latissimus',mo:0,mi:4,fr:0,sa:4,syn:0,mav:[8,14],n:'MI: Latzug(2)+Iso-Rudern(2) · SA: Klimmzug(2)+Überzüge(2)'},
{m:'Rhomboiden / Trap',mo:0,mi:2,fr:0,sa:2,syn:4,mav:[6,12],n:'T-Bar(2) je Upper · Latzug/Klimmzug → 4 indir.'},
{m:'Med. Deltoid',mo:2,mi:3,fr:0,sa:3,syn:2,mav:[6,14],n:'Seitheben MO(2)+MI(3)+SA(3) · Shoulder Press → 2 indir.'},
{m:'Post. Deltoid',mo:2,mi:0,fr:0,sa:0,syn:4,mav:[6,12],n:'Reverse Fliegende(2) · T-Bar Rudern MI+SA → 4 indir. ✓'},
{m:'Bizeps',mo:2,mi:2,fr:0,sa:2,syn:6,mav:[8,14],n:'Preacher 3× · alle Zugübungen → 6 indir.'},
{m:'Trizeps',mo:4,mi:2,fr:0,sa:2,syn:4,mav:[6,14],n:'MO: JM Press(2)+Pushdown(2) · Drücken → 4 indir.'},
{m:'Unterarm',mo:6,mi:4,fr:2,sa:4,syn:0,mav:[6,16],n:'Reverse Curl + Wrist Curl + Extension'},
{m:'Core',mo:4,mi:0,fr:5,sa:0,syn:0,mav:[4,12],n:'MO: Crunch(2)+Beinheben(2) · FR: Crunch(3)+Beinheben(2)'},
{m:'Obliques',mo:0,mi:0,fr:2,sa:0,syn:0,mav:[2,8],n:'Side Bend(2)'},
{m:'Quadrizeps',mo:0,mi:0,fr:4,sa:0,syn:0,mav:[8,16],n:'Beinpresse(2)+Beinstrecken(2) · + Sportarten',sport:1},
{m:'Hamstrings',mo:0,mi:0,fr:2,sa:0,syn:2,mav:[6,12],n:'Beinbeugen(2) · Hyperext → 2 indir. · + Sportarten',sport:1},
{m:'Gluteus',mo:0,mi:0,fr:2,sa:0,syn:1,mav:[4,12],n:'Hyperextension(2) · + Sportarten',sport:1},
{m:'Adduktoren',mo:0,mi:0,fr:2,sa:0,syn:0,mav:[2,8],n:'Hüftadduktion(2)'},
{m:'Waden',mo:0,mi:0,fr:2,sa:0,syn:0,mav:[4,10],n:'Wadenpressen(2) · + Sprungsportarten',sport:1}];

export const VOL_BACK=[
{m:'Pectoralis',mo:0,mi:4,fr:0,sa:4,syn:0,mav:[8,16],n:'MI: Fliegende(2)+Schrägbank(2) · SA: Fliegende(2)+Schrägbank(2) — Dip pausiert im Rücken-Block'},
{m:'Latissimus',mo:0,mi:4,fr:0,sa:6,syn:0,mav:[8,14],n:'MI: Latzug(2)+Iso-Rudern(2) · SA: Klimmzug(2)+Überzüge(2)+Einarmiges Rudern(2)'},
{m:'Rhomboiden / Trap',mo:0,mi:2,fr:0,sa:2,syn:4,mav:[6,12],n:'T-Bar(2) je Upper · Latzug/Klimmzug → 4 indir.'},
{m:'Med. Deltoid',mo:2,mi:3,fr:0,sa:3,syn:2,mav:[6,14],n:'Seitheben MO(2)+MI(3)+SA(3) · Shoulder Press → 2 indir.'},
{m:'Post. Deltoid',mo:2,mi:0,fr:0,sa:0,syn:4,mav:[6,12],n:'Reverse Fliegende(2) · T-Bar Rudern MI+SA → 4 indir. ✓'},
{m:'Bizeps',mo:2,mi:2,fr:0,sa:2,syn:7,mav:[8,14],n:'Preacher 3× · alle Zugübungen inkl. einarmiges Rudern → 7 indir.'},
{m:'Trizeps',mo:4,mi:2,fr:0,sa:2,syn:4,mav:[6,14],n:'MO: JM Press(2)+Pushdown(2) · Drücken → 4 indir.'},
{m:'Unterarm',mo:6,mi:4,fr:2,sa:4,syn:0,mav:[6,16],n:'Reverse Curl + Wrist Curl + Extension'},
{m:'Core',mo:4,mi:0,fr:5,sa:0,syn:0,mav:[4,12],n:'MO: Crunch(2)+Beinheben(2) · FR: Crunch(3)+Beinheben(2)'},
{m:'Obliques',mo:0,mi:0,fr:2,sa:0,syn:0,mav:[2,8],n:'Side Bend(2)'},
{m:'Quadrizeps',mo:0,mi:0,fr:4,sa:0,syn:0,mav:[8,16],n:'Beinpresse(2)+Beinstrecken(2) · + Sportarten',sport:1},
{m:'Hamstrings',mo:0,mi:0,fr:2,sa:0,syn:2,mav:[6,12],n:'Beinbeugen(2) · Hyperext → 2 indir. · + Sportarten',sport:1},
{m:'Gluteus',mo:0,mi:0,fr:2,sa:0,syn:1,mav:[4,12],n:'Hyperextension(2) · + Sportarten',sport:1},
{m:'Adduktoren',mo:0,mi:0,fr:2,sa:0,syn:0,mav:[2,8],n:'Hüftadduktion(2)'},
{m:'Waden',mo:0,mi:0,fr:2,sa:0,syn:0,mav:[4,10],n:'Wadenpressen(2) · + Sprungsportarten',sport:1}];

export const MEALS=[
{d:'Montag',c:'#7a5ab5',tr:'Sharms',m:'Resteessen / Clean-Out-the-Fridge Pasta / Schupfnudelpfanne / Brotzeit',
tags:['Flexibel','KH-Basis'],
o:'Flexibler Tag — passt gut nach dem Sharms-Training. Achte darauf, dass mindestens eine Proteinquelle dabei ist: Käse zur Brotzeit, Ei zur Schupfnudelpfanne oder Hackfleisch in der Pasta. Bei reiner Pasta oder Brotzeit fehlen sonst schnell 30–40 g Protein.'},
{d:'Dienstag',c:'#c94535',tr:'HIIT',m:'Hähnchen-Curry mit Quinoa',
tags:['Protein','Komplexe KH','Antioxidantien'],
o:'Ideal für den HIIT-Tag. Quinoa liefert vollständiges Aminosäureprofil plus langsame Kohlenhydrate zur Glykogen-Wiederauffüllung. Kurkuma im Curry wirkt antiinflammatorisch — relevant nach der hohen oxidativen Belastung durch Sprintintervalle. Tipp: Kokosmilch statt Sahne für mehr MCTs.'},
{d:'Mittwoch',c:'#b8922e',tr:'Upper A',m:'Suppe / Linseneintopf / Kartoffeln mit Spinat und Ei',
tags:['Pflanzl. Protein','Eisen','Ballaststoffe'],
o:'An deinem schwersten Krafttag ist das die kritischste Mahlzeit der Woche. Linsen liefern Eisen und Protein, aber das Aminosäureprofil ist nicht optimal. Ergänze unbedingt: Ei zum Linseneintopf, oder Quark als Nachtisch. Vitamin C (Paprika, Zitrone) verbessert die Eisenaufnahme aus Linsen und Spinat erheblich.'},
{d:'Donnerstag',c:'#2e9e6a',tr:'Rest',m:'Chili con carne / Bauerntopf / Bolognese',
tags:['Protein','Eisen','B-Vitamine'],
o:'Perfekt für den Ruhetag: Hackfleisch liefert Kreatin, Eisen und B12. Die Bohnen im Chili bringen Ballaststoffe und zusätzliches Protein. Ruhetage sind nicht Kalorien-Sparetage — Muskelreparatur läuft hier auf Hochtouren.'},
{d:'Freitag',c:'#3a7bbf',tr:'Lower',m:'Lachsfilet im Ofen / Lachsnudeln / Schlemmerfilet',
tags:['Omega-3','Protein','Vitamin D'],
o:'Die wertvollste Mahlzeit der Woche für Regeneration. Omega-3 (EPA/DHA) wirkt antiinflammatorisch und verbessert nachweislich die mTOR-Signalisierung. Lachs liefert zusätzlich Vitamin D — direkt relevant für Testosteronproduktion und Knochenwachstum in deinem Alter.'},
{d:'Samstag',c:'#b8922e',tr:'Upper B',m:'Wraps / Grillen',
tags:['Protein','Fette','Vitamin C'],
o:'Gut nach dem längsten Trainingstag. Beim Grillen: Fleisch nicht verkohlen lassen (HCA/PAK-Bildung). Wraps mit viel Gemüse und einer Joghurt-Basis statt Mayo. Vollkorn-Wraps für langsamere Kohlenhydrate.'},
{d:'Sonntag',c:'#2e9e6a',tr:'Zone 2',m:'Hackfleischgericht (Nudelauflauf, Roulade, Hack-Bällchen)',
tags:['Protein','B-Vitamine','Eisen'],
o:'Solide Basis vor der neuen Trainingswoche. Nudelauflauf mit Käse liefert zusätzlich Casein — passt gut zur Wochenend-Erholung. Rindfleisch bevorzugen für höheren Kreatin- und Eisengehalt.'}];

export const FOODTIPS=[
{i:'🥛',n:'Dairy-Protein täglich — der IGF-1-Hebel',
t:'Milchprotein (Casein und Whey) stimuliert die körpereigene IGF-1-Produktion stärker als jede andere Proteinquelle. Hoppe et al. (2004) zeigten bei Jugendlichen einen direkten Zusammenhang zwischen Milchkonsum und IGF-1-Spiegel. In deinem Alter — mit noch offener medialer Clavicula-Epiphyse — ist das direkt relevant für Knochen- und Muskelwachstum. Praktisch: 500 g Magerquark oder 500 ml Milch täglich zusätzlich zum Essensplan.',
s:'Hoppe et al., 2004 — Milchkonsum und IGF-1 bei Adoleszenten'},
{i:'🍚',n:'Kohlenhydrat-Timing an schweren Tagen',
t:'An Mittwoch (Upper A) und Samstag (Upper B) mit den schwersten Compound-Sätzen: 60–90 Min vor dem Training komplexe Kohlenhydrate (Haferflocken, Reis, Vollkornbrot). Direkt nach dem Training schnelle Kohlenhydrate plus Protein für maximale Glykogen-Resynthese. Der Montag (flexibler Tag) eignet sich gut für höhere Kohlenhydratmengen aus Pasta oder Schupfnudeln.',
s:'Glykogen-Superkompensation — Sportphysiologie-Standard'},
{i:'🥩',n:'Protein auf 4–5 Mahlzeiten verteilen',
t:'Bei 2,0–2,2 g/kg Körpergewicht: gleichmäßig über den Tag verteilen statt in ein bis zwei großen Portionen. Jede Mahlzeit sollte mindestens 2,5 g Leucin enthalten (Leucin-Schwellenwert für maximale Muskelproteinsynthese) — das entspricht etwa 30–40 g hochwertigem Protein. Dein Wochenplan deckt das abends gut ab; achte auf Frühstück und Mittagessen.',
s:'Leucin-Schwellenwert · Moore et al., 2015'},
{i:'🌙',n:'Casein vor dem Schlafen',
t:'20–40 g Casein (Magerquark, Milch, Käse) 30–60 Min vor dem Einschlafen erhöht die Muskelproteinsynthese über Nacht signifikant. Casein wird langsam verdaut und liefert über 6–8 Stunden kontinuierlich Aminosäuren. In Kombination mit deinen 8,5–9h Schlaf ist das einer der effizientesten Hebel überhaupt.',
s:'Res et al., 2012 — Nächtliche Proteinsynthese'},
{i:'📈',n:'Kalorienüberschuss: +300–500 kcal',
t:'Für maximale Hypertrophie mit 18 Jahren ist ein moderater Überschuss nötig. Zu aggressiv (über +700) führt zu unverhältnismäßiger Fettzunahme. Wichtig: IGF-1 fällt bei Kaloriendefizit deutlich ab — Diäten sind in dieser Wachstumsphase kontraproduktiv. Kontrolliere über Körpergewicht: 0,25–0,5 % Zunahme pro Woche ist der Zielkorridor.',
s:'Slater & Phillips, 2011 — Energiebilanz und Hypertrophie'},
{i:'🥬',n:'Mikronährstoff-Lücken schließen',
t:'Dein Plan ist proteinreich und ausgewogen, aber achte auf: Zink (15 mg/Tag — Testosteronsynthese, in Fleisch und Nüssen), Magnesium (Schlafqualität, in Vollkorn und Nüssen), Vitamin D3 (2000–4000 IE, besonders Winter). Gemüsemenge: mindestens 400 g täglich für Mikronährstoffdichte und Ballaststoffe.',
s:'Prasad, 2013 — Zink und Testosteron'}];

export const TIMING=[
{t:'Aufwachen',c:'#b8922e',d:'Erste Mahlzeit innerhalb 60–90 Min. Protein plus Kohlenhydrate. Beispiel: Haferflocken mit Quark und Beeren, oder Rührei mit Vollkornbrot.'},
{t:'60–90 Min vor Training',c:'#c94535',d:'Komplexe Kohlenhydrate plus moderates Protein. Fett niedrig halten (verlangsamt die Magenentleerung). Kein Ballaststoff-Überschuss direkt vorher.'},
{t:'Direkt nach Training',c:'#2e9e6a',d:'30–40 g schnelles Protein (Whey oder Milch) plus schnelle Kohlenhydrate. Das anabole Fenster ist breiter als früher angenommen, aber die Glykogen-Resynthese läuft in den ersten 2h am schnellsten.'},
{t:'Hauptmahlzeit abends',c:'#3a7bbf',d:'Dein Wochenplan. Vollwertig mit Protein, Gemüse und Kohlenhydraten. 2–3h vor dem Schlafengehen, damit die Verdauung den Schlaf nicht stört.'},
{t:'30–60 Min vor Schlaf',c:'#7a5ab5',d:'20–40 g Casein (Magerquark oder Milch). Leicht verdaulich, keine schweren Fette. Optional mit Magnesium kombinieren.'}];

export const SLEEP=[
{d:'Montag',w:'07:25',tr:'Sharms',b:'22:45',s:'8h 40min',c:'#7a5ab5'},
{d:'Dienstag',w:'06:45',tr:'HIIT',b:'22:00',s:'8h 45min',c:'#c94535'},
{d:'Mittwoch',w:'06:45',tr:'Upper A',b:'22:00',s:'8h 45min',c:'#b8922e'},
{d:'Donnerstag',w:'06:45',tr:'Rest',b:'22:00',s:'8h 45min',c:'#2e9e6a'},
{d:'Freitag',w:'06:45',tr:'Lower',b:'22:00',s:'8h 45min',c:'#3a7bbf'},
{d:'Samstag',w:'08:00',tr:'Upper B',b:'22:45',s:'9h 15min',c:'#b8922e'},
{d:'Sonntag',w:'08:00',tr:'Zone 2',b:'22:45',s:'9h 15min',c:'#2e9e6a'}];

export const STIPS=[
{i:'🧠',n:'Circadianer Rhythmus mit 18',t:'Mit 18 ist der natürliche Schlafrhythmus am stärksten nach hinten verschoben. Melatonin steigt 1–2h später als bei Erwachsenen — früh einzuschlafen ist biologisch schwerer. Die Abend-Routine ist deshalb in deinem Alter noch wichtiger.',s:'Roenneberg et al., 2012'},
{i:'📱',n:'Kein Bildschirm 60–90 Min vor Schlaf',t:'Blaues Licht hemmt Melatonin um bis zu 50 % für bis zu 3 Stunden. Bei ohnehin verzögerter Melatonin-Sekretion hat das bei dir besonders starken Effekt. Night-Mode reduziert das Problem, eliminiert es aber nicht.',s:'Blume et al., 2019'},
{i:'🌡️',n:'Raumtemperatur 18–20 °C',t:'Der Kerntemperatur-Abfall um 1–1,5 °C ist das stärkste physiologische Einschlafsignal. Räume über 22 °C verlängern die Einschlafzeit und reduzieren den Tiefschlafanteil messbar.',s:'Harding et al., 2019'},
{i:'🏋️',n:'Training-Abstand zum Schlaf',t:'HIIT und schweres Krafttraining erhöhen Cortisol und Kerntemperatur für 2–4 Stunden. Mindestabstand: HIIT 3h, Krafttraining 2h. Zone 2 am Sonntag stört den Schlaf praktisch nicht.',s:'Stutz et al., 2019'},
{i:'☕',n:'Koffein-Cutoff 13–14 Uhr',t:'Halbwertszeit 5–7 Stunden. Bei Ziel-Einschlafzeit 22:00 Uhr bedeutet ein Kaffee um 15 Uhr noch etwa 125 mg aktives Koffein zur Schlafenszeit. Reduziert den Tiefschlafanteil auch ohne spürbare Wachheit.',s:'Drake et al., 2013'},
{i:'⏰',n:'Konstanz — max. 1h Abweichung',t:'Social Jet Lag über 1h zwischen Werktag und Wochenende dysreguliert den zirkadianen Rhythmus. Deine Zubettgehzeiten liegen jetzt in einem Fenster von nur 45 Minuten (22:00 bis 22:45) — das ist der Teil, den du selbst steuerst, und er sitzt. Die Aufwachzeiten spreizen mit 75 Min (8:00 statt 6:45) knapp über die Grenze: akzeptabel, aber nicht weiter ausdehnen.',s:'Roenneberg et al., 2012'}];

// RENDER

export const MOBSEQ=[
{n:'4-7-8 Atmung',x:'× 4',d:'Neurale Entspannung als Einstieg. 4 Sek einatmen, 7 Sek halten, 8 Sek ausatmen. Senkt den sympathischen Tonus, bevor die eigentliche Dehnarbeit beginnt.',c:'#7a5ab5'},
{n:'Thorakale Extension',x:'2 Min über der Rolle',d:'Rolle quer unter die Brustwirbelsäule, Hände hinter dem Kopf, kontrolliert nach hinten öffnen und wandern. Gegenmaßnahme zum nach vorn rotierten Schultergürtel und eingesunkenen Brustkorb — vor dem Dehnen, weil eine aufgerichtete BWS alle folgenden Positionen sauberer macht.',c:'#c94535'},
{n:'Kinn-Retraktion',x:'3 × 10',d:'Kinn gerade nach hinten schieben (\'Doppelkinn machen\'), Blick bleibt waagerecht, kein Nicken. Arbeitet direkt gegen die Kopfvorschubhaltung — bei langem Hals ist deren optischer Effekt überproportional groß.',c:'#3a7bbf'},
{n:'Hüftflexoren',x:'Kniender Ausfallschritt PNF × 3/Seite + liegender Quad-Stretch 2×45s',d:'Kniender Ausfallschritt mit PNF-Protokoll (8s an, 30s halten, ×3), danach liegender Quad-Stretch als statischer Abschluss.',c:'#c94535'},
{n:'Hamstrings',x:'Liegend mit Band PNF × 3/Seite + Vorwärtsbeuge 2×60s',d:'Liegende Position mit Band für kontrollierten Widerstand im PNF-Zyklus, danach Vorwärtsbeuge zur beidseitigen Integration.',c:'#b8922e'},
{n:'Adduktoren',x:'Grätsch-Sitz 2×90s + Schmetterling PNF × 3',d:'Grätsch-Sitz als lange statische Haltung, danach Schmetterling-Position im PNF-Zyklus für die mediale Oberschenkelmuskulatur.',c:'#2e9e6a'},
{n:'Hüftkapsel',x:'Figure-4 je 90s/Seite',d:'Figure-4-Position für Kapsel- und Außenrotatoren-Mobilität. Lange statische Haltezeit statt PNF, da die Hüftkapsel selbst nicht kontrahierbar ist.',c:'#3a7bbf'},
{n:'Spagat-Einstieg',x:'erst ab Monat 3–4, progressiv',d:'Erst hinzufügen, wenn die vorherigen Elemente ausreichend Grundbeweglichkeit geschaffen haben. Zu früher Einstieg erhöht das Verletzungsrisiko ohne Zeitvorteil.',c:'#7a5ab5'}];

export const MOBMILES=[
{m:'Monat 2',t:'Neural',d:'Der Dehnungsreflex passt sich an — die PNF-Kontraktionsphase wird als weniger bedrohlich erkannt, wodurch tiefere Positionen ohne Widerstand möglich werden.'},
{m:'Monat 5',t:'Faszien',d:'Bindegewebige Anpassung setzt ein. Die Veränderungen sind jetzt strukturell, nicht mehr nur neural — der Fortschritt wird stabiler und hält auch bei Trainingspausen.'},
{m:'Monat 9',t:'Boden-Kontakt',d:'Erste Annäherung an Boden-Kontakt in den Zielpositionen. Der Übergang von neuraler zu vollständig struktureller Anpassung ist hier meist abgeschlossen.'},
{m:'Monat 12',t:'Vollspagat',d:'Realistischer Zielzeitpunkt bei konsequenter täglicher Ausführung über 12 Monate.'}];

export const EVE=[
{t:'T-120 Min',ti:'System-Reset & Fokus',c:'#7a5ab5',
b:['<b>Brain Dump:</b> Gedanken auslagern, Kopf leeren.','<b>Kalender-Struktur:</b> Den nächsten Tag taktisch durchplanen. Kontrolle minimiert Cortisol-Spitzen.']},
{t:'T-90 Min',ti:'Anaboler Input',c:'#c94535',
b:['<b>Nährstoffversorgung:</b> 30–40g Casein. Sichert die Muskelproteinsynthese über Nacht.','<b>Flüssigkeitsstopp:</b> Keine weitere Hydratation, um nächtliche Weckreize zu eliminieren.']},
{t:'T-75 Min',ti:'Wärme & Nervensystem',c:'#b8922e',
b:['<b>Warme Dusche:</b> Initiiert Vasodilatation. Der anschließende rasche Abfall der Körperkerntemperatur signalisiert dem Gehirn: Zeit für Melatonin.','<b>Magnesium-Einnahme:</b> Optimal Magnesium-Glycinat. Senkt die neuronale Erregbarkeit, verbessert die Schlafqualität, stützt die Testosteron-Optimierung.','<b>Kopfhaut ab jetzt lufttrocknen:</b> Minoxidil folgt erst zu Beginn der Badroutine bei T-25 — rund 50 Minuten Abstand statt der vorher knappen 20–30.']},
{t:'T-45 Min',ti:'Physische Optimierung',c:'#2e9e6a',
b:['<b>Dehnen + Haltung:</b> Gezielte Mobilisation zur muskulären Entspannung — deine PNF-Routine, eingeleitet durch thorakale Extension und Kinn-Retraktion.','<b>Atemkontrolle:</b> 5 Minuten tiefe Bauchatmung. Schaltet das System aktiv in den parasympathischen Modus.']},
{t:'T-25 Min',ti:'Bad, Haut & Lüften',c:'#3a7bbf',
b:['<b>Fenster auf:</b> Stoßlüften startet, bevor du ins Bad gehst — der Raum kühlt, während du ohnehin beschäftigt bist. Beim Rauskommen schließen, Ziel 16–18 °C.','<b>Minoxidil zuerst:</b> gleich zu Beginn der Badroutine. Die Kopfhaut ist seit der Dusche rund 50 Minuten trocken — genau der Abstand, den das Präparat braucht.','<b>Zahnhygiene:</b> inkl. Zahnseide für systemische Entzündungsminimierung, Toilettengang.','<b>Haut — Cleanser:</b> Gel-Cleanser, danach vollständig trocken tupfen.','<b>Haut — EpiDuo:</b> erbsengroß aufs ganze Gesicht, ausdrücklich erst auf trockene Haut. Feucht aufgetragen steigt die Reizung deutlich.','<b>Bei Trockenheit:</b> Feuchtigkeitscreme mit Ceramiden + Niacinamid dünn davor und danach (Sandwich-Methode).']},
{t:'T-15 Min',ti:'Ruhiger Ausklang',c:'#7a5ab5',
b:['<b>Journaling:</b> Tag abschließen, offene Gedanken auslagern.','<b>Lesen:</b> Papier statt Bildschirm, warmes gedämpftes Licht.','Kein Planen mehr — das lief bereits bei T-120. Hier geht es ausschließlich ums Runterfahren.']},
{t:'T-0 Min',ti:'Regeneration',c:'#2e9e6a',
b:['<b>Licht-Eliminierung:</b> Absolute Dunkelheit, Raum auf 16–18 °C. Kühle Umgebung essentiell für die Testosteron-Ausschüttung.','<b>Zahnschutz:</b> Boxer-Mundschutz einsetzen — letzter Handgriff.','<b>Schlaf:</b> Vollständige Systemabschaltung. Wachstum und Hormonproduktion laufen auf Hochtouren.']}];

/* Eintraege sind entweder ein String oder {t, sub:[]} mit Unterschritten. */
export const MOR=[
'Direkt aufstehen',
'Bett machen',
'1,5L Flasche aus Keller ins Zimmer holen — Kontrollpunkt: sammeln sich über Zeit mehrere Flaschen an, läuft etwas falsch',
'Zügig richtig anziehen',
'Wasser trinken + Sonne/Licht bekommen',
'Nervous System Release (springen, schwingen)',
'Frühstück herrichten',
{t:'Hygiene + Haut',sub:[
 'Gel-Cleanser, lauwarm — derselbe wie abends',
 'Sonnenschutz LSF 50, chemisch-leicht oder Hybrid. Täglich, auch bewölkt — Pflicht, solange EpiDuo läuft, und der einzige Wirkstoff mit garantiertem Langzeiteffekt']},
'Frühstück genießen + Supplements',
'Journaling — was ich glaube und warum, Zukunftsplanung, Dankbarkeit',
{t:'Klo + Haare stylen',sub:[
 'Handtuchtrocken: Sea Salt Spray oder Volumenmousse in den Ansatz',
 'Föhnen auf mittlerer Stufe, Kopf vorgebeugt, danach mit den Fingern in Zielrichtung',
 'Matte Clay oder Fiber, haselnussgroß, in den Handflächen komplett verreiben, von hinten nach vorne einarbeiten — nie von oben auftragen',
 'Kein Gel, kein Wax mit Glanz: Glanz lässt feines Haar dünner wirken']},
'Spaziergang / Fahrrad draußen'];

export const HYDRATION={
mor:'1,5L Flasche → soll bis Mittags leer sein',
meal:'Zu jeder Mahlzeit 1–2 Gläser',
school:'1L Flasche in der Schule'
};

/* Grooming-Tab: Nachschlagewissen, das nicht in eine Tagesroutine gehoert.
   Die taeglich auszufuehrenden Schritte stehen bewusst NICHT hier, sondern in
   MOR (Haut morgens, Haare), EVE (Haut abends) und MOBSEQ (Haltung) --
   eine Quelle pro Schritt, damit nichts auseinanderlaeuft.
   Struktur: {t, c, lead, sub:[{h, li:[]}], quote:{h,t}, warn, note} */
export const GROOM=[
{t:'Haut',c:'#3a7bbf',
 lead:'Milde entzündliche Akne, Talgporen, Rötung. Vier Produkte, nicht mehr — jeder zusätzliche Wirkstoff erhöht nur das Reizrisiko, ohne den Verlauf zu beschleunigen.',
 sub:[
  {h:'Morgens',li:['Sanfter Gel-Cleanser, pH-hautneutral, tensidarm','Sonnenschutz LSF 50, chemisch-leicht oder Hybrid']},
  {h:'Abends',li:['Gleicher Cleanser','EpiDuo, erbsengroß aufs ganze Gesicht','Bei Trockenheit: Feuchtigkeitscreme mit Ceramiden + Niacinamid, dünn, davor und danach (Sandwich-Methode)']},
  {h:'Rasur',li:['Alle 3–4 Tage — der Bartwuchs ist zu licht für Konturenarbeit','Folienrasierer (Foil Shaver), trocken, ohne Druck — nicht Klinge, nicht Rotationsrasierer','Über akut entzündeten Stellen nicht aufdrücken, sondern umfahren','Danach ausschließlich Feuchtigkeitspflege, kein alkoholhaltiges Aftershave auf entzündeter Haut','Scherfolie regelmäßig reinigen und jährlich tauschen — eine stumpfe Folie reißt, statt zu schneiden']},
  {h:'Warum Folienrasierer statt Klinge',li:['Eine Klinge zieht über entzündete Papeln, öffnet sie und verteilt Keime über das Gesicht. Das ist bei Akne der stärkste einzelne Reiztreiber der Rasur.','Der übliche Vorteil der Klinge ist die höhere Gründlichkeit — und der ist bei blondem, lichtem Wuchs praktisch wertlos. Entfernt werden soll der ungepflegte Eindruck, nicht das letzte Stoppelrestchen.','Damit entfällt das einzige Argument für die Klinge, während das Argument gegen sie bestehen bleibt.','Folie statt Rotation, weil Folienköpfe für feines, flach anliegendes Haar auf flächigen Partien gebaut sind; Rotationsköpfe zielen auf groben, längeren Wuchs.']}],
 warn:'Nicht machen: Peelingtücher, Alkohol-Gesichtswasser, Ausdrücken, Zink-Eigenmedikation.',
 note:'Wenn nach 12 Wochen keine Besserung eintritt: Hautarzt — nicht Produktwechsel.'},

{t:'Haare',c:'#b8922e',
 lead:'Feines, glattes Haar. Hier entscheidet das Produkt mehr als die Technik — die Reihenfolge steht als Schritt in der Morgenroutine.',
 sub:[
  {h:'Ablauf',li:['Handtuchtrocken: Sea Salt Spray oder Volumenmousse in den Ansatz','Föhnen auf mittlerer Stufe, Kopf vorgebeugt, danach mit den Fingern in Zielrichtung','Matte Clay oder Fiber, haselnussgroß, in den Handflächen komplett verreiben, von hinten nach vorne einarbeiten — nicht von oben auftragen']}],
 quote:{h:'Barbier-Ansage — wörtlich vorlesen',t:'Low Taper an den Seiten, Ansatz unter der Schläfe, 0,5 auf 1,5 auslaufend, Ohren bedeckt lassen. Oben 7 cm, stark texturiert mit Point Cutting, Fransenkante nach vorn getragen. Nacken weich auslaufend, keine Blocklinie.'},
 warn:'Kein Gel, kein Wax mit Glanz. Glanz lässt feines Haar dünner wirken.'},

{t:'Augenbrauen',c:'#7a5ab5',
 lead:'Die gerade Grundform ist bei langem Gesicht funktional richtig — ein hoher Bogen würde die Vertikale zusätzlich betonen. Form beibehalten, nicht in einen Bogen zwingen.',
 sub:[
  {h:'Entfernen',li:['Streuhaare am Nasenrücken zwischen den Brauen','Einzelne Haare deutlich unterhalb der Brauenlinie am Lid','Sonst nichts']},
  {h:'Nicht entfernen',li:['Haare oberhalb der Braue. Der obere Rand definiert die Dicke — wer dort zupft, verliert Substanz und bekommt eine dünne Linie']},
  {h:'Grenzen',li:['Startpunkt: senkrecht über dem inneren Augenwinkel','Endpunkt: diagonale Linie Nasenflügel–äußerer Augenwinkel','Liegt aktuell etwa dort — kein Handlungsbedarf']},
  {h:'Methode',li:['Pinzette, einzeln, bei Tageslicht','Kein Threading — nimmt zu viel weg, die Form ist bereits korrekt','Trimmen mit Kamm und Schere nur bei Haaren über 1 cm']},
  {h:'Der eigentliche Hebel: Kontrast',li:['Brauengel oder Seife transparent, Haare nach oben-außen gekämmt → sofort mehr Dichte-Eindruck, null Risiko','Henna oder Brauenfarbe, maximal einen halben Ton dunkler als das Haar (aschbraun, nie schwarz oder rotstichig), beim Friseur, hält 3–4 Wochen']}],
 warn:'Zu dunkel gefärbt wirkt es bei heller Haut sofort aufgesetzt. Im Zweifel die Gel-Variante.',
 note:'Formal sind die Brauen in Ordnung — das Defizit ist farblich, nicht geometrisch.'},

{t:'Bart',c:'#b86830',
 lead:'Aktuell: nein. Blonder, lückenhafter Oberlippenflaum liest sich nicht als Bart, sondern als ungepflegter Rest. Sauber rasiert wirkt die Kieferlinie klarer.',
 sub:[
  {h:'Neu bewerten mit 21–23',li:['Falls Wangendichte dazukommt: kurzer Vollbart, 5–8 mm','Hohe Halslinie, zwei Finger über dem Adamsapfel','Wangenlinie natürlich belassen, nicht rasieren']}],
 note:'Ein Bart wäre ein echter Hebel — er verbreitert das untere Gesichtsdrittel. Derzeit nur biologisch nicht verfügbar.'},

{t:'Kleidung & Farbe',c:'#2e9e6a',
 lead:'Kühl-heller Typ. Die Farbwahl liefert den Kontrast, den das Gesicht selbst nicht mitbringt.',
 sub:[
  {h:'Tragen',li:['Marine, Petrol, Waldgrün, Bordeaux, kühles Grau, reines Weiß','Schwarz als Akzent, nicht als Grundton']},
  {h:'Meiden',li:['Beige, Camel, Sand, Blassgelb, Hellbraun','Sie liegen farblich zu nah an der eigenen Haut und lassen fahl wirken']},
  {h:'Ausschnitt & Kragen',li:['Langer, schlanker Hals → höher schließender Rundhals, Henley, Polo mit stehendem Kragen, im Winter feiner Rollkragen','Kein tiefer V-Ausschnitt, keine weiten Rundhälse — beide verlängern den Hals weiter']},
  {h:'Silhouette',li:['Die Schulterbreite ist der limitierende Faktor, nicht das Gewicht','Schulternaht sitzt auf dem Schulterknochen, nicht darüber hinaus','Overshirts, Harringtons, Bomberjacken; feste Stoffe wie Oxford, Denim, Cord statt weicher Jerseys','Horizontale Elemente oben: Streifen, Kontrastkragen']},
  {h:'Passform Hose',li:['Straight Leg oder Slim Straight, Saum knapp auf dem Schuh','Kein Skinny, kein Baggy','Weite Sweatpants sind bei 188 cm Schlanktyp die schlechteste Wahl: sie verschlucken die Beine und verstärken Länge ohne Masse']}]},

{t:'Haltung & Fotos',c:'#c94535',
 lead:'Kopf leicht vorgeschoben, Schultern nach vorn rotiert, Brustkorb dadurch eingesunken. Bei langem Hals ist der Effekt überproportional sichtbar — der größte optische Einzelfaktor, noch vor Frisur und Brille.',
 sub:[
  {h:'Im Training',li:['Zugvolumen zu Druckvolumen mindestens 2:1 — Rudern, Face Pulls, Reverse Flys, Klimmzüge hoch priorisiert','Seitheben 3×/Woche mit hohen Wiederholungen: der direkteste Hebel für Schulterbreite']},
  {h:'Täglich',li:['Thorakale Extension über der Rolle, 2 Minuten','Kinn-Retraktion 3×10 gegen die Kopfvorschubhaltung','Beides steht als fester Schritt in der Mobility-Routine — kein separater Termin nötig']},
  {h:'Auf Fotos',li:['Kinn leicht nach vorn und minimal nach unten — nicht anheben, das zeigt die Nasenlöcher','Kamera auf Augenhöhe oder minimal darüber','Selfies von unten verkürzen die Stirn und verbreitern Nase und Kiefer']}]},

{t:'Zeithorizont',c:'#4f4f4f',
 lead:'Was wann Wirkung zeigt — damit nach drei Wochen nichts abgebrochen wird, das noch gar nicht wirken konnte.',
 sub:[
  {h:'4 Wochen — Schnitt + Brauenkontrast',li:['Textured Fringe mit Low Taper, dazu Brauengel oder dezente Tönung','Beide Maßnahmen adressieren dasselbe Kernthema: fehlender horizontaler Rahmen und fehlender Kontrast in einem hellen, langen Gesicht']},
  {h:'6 Monate — Haltung, Schultern, Haut',li:['Alle drei laufen parallel und brauchen Zeit','Adapalen zeigt nach 12 Wochen belastbare Ergebnisse','Deltoid- und Rückenaufbau nach 4–6 Monaten, Haltungskorrektur ebenfalls','Kein Shortcut, aber die dauerhaftesten Effekte']}]}];
