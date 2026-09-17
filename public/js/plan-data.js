/* Trainingsplan-Daten — unveraendert aus dashboard4.html uebernommen.
   Reine Deklarationen, keine Logik: Inhalte lassen sich hier aendern, ohne
   die Render-Module anzufassen. */

/* Zwei Wochentypen statt eines festen Plans, und sie unterscheiden sich
   nicht nur in der Tagesbelegung, sondern im Oberkoerper-Programm selbst:
   - a (Nicht-Badminton): Sharms 1x + HIIT + Upper A 2x + Lower -- schwere
     Fassung, 2 Arbeitssaetze je Uebung, gewichtete Koerpergewichts-Compounds.
   - b (Badminton): Upper B 3x + Badminton + Lower, kein Sharms -- Frequenz-
     Fassung, 1-2 Saetze je Uebung, maschinenlastig, damit dieselbe Muskulatur
     nach 48h wieder belastbar ist. Wochensumme je Muskel bleibt vergleichbar.
   Farbe und Inhalt haengen jetzt am PROGRAMM (S-Schluessel), nicht mehr am
   Wochentag -- ein Programm behaelt seine Identitaet, auf welchem Wochentag
   es auch liegt. "name" ueberschreibt nur die Anzeige (z.B. "Badminton
   (HIIT)"), das Programm dahinter bleibt dasselbe (S.hiit).
   Anker: die Woche ab Montag 14.09.2026 ist bestaetigt eine Badminton-Woche
   -- welche Woche das jeweils ist, berechnet plan.js daraus fuer "heute". */
export const WEEKPLAN={
 a:[{id:'mo',s:'MO',p:'sharms'},{id:'di',s:'DI',p:'hiit'},{id:'mi',s:'MI',p:'upperA'},
    {id:'do',s:'DO',p:'rest'},{id:'fr',s:'FR',p:'lower'},{id:'sa',s:'SA',p:'upperA'},{id:'so',s:'SO',p:'zone2'}],
 b:[{id:'mo',s:'MO',p:'rest'},{id:'di',s:'DI',p:'upperB'},
    {id:'mi',s:'MI',p:'hiit',name:'Badminton (HIIT)',
     override:'Ersetzt die geplante Studio-HIIT-Einheit vollständig — kein zusätzliches Training an diesem Tag. Eine Einzel- oder Doppelpartie liefert Intervallcharakter und Herz-Kreislauf-Reiz mindestens gleichwertig zum Sprint-Protokoll, das sonst hier stünde. Gleichzeitig liegt Badminton genau zwischen zwei Upper-B-Einheiten und hält den Oberkörper in Bewegung, ohne ihn zu ermüden.'},
    {id:'do',s:'DO',p:'upperB'},{id:'fr',s:'FR',p:'lower'},{id:'sa',s:'SA',p:'upperB'},{id:'so',s:'SO',p:'zone2'}]
};
/* Wie oft das jeweilige Oberkoerper-Programm im Wochentyp vorkommt --
   Quelle fuer die Volumenrechnung, damit Tabelle und Wochenplan nicht
   auseinanderlaufen koennen. Muss zu WEEKPLAN passen. */
export const WEEKFREQ={a:{sharms:1,upperA:2,lower:1},b:{upperB:3,lower:1}};
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

/* Upper A -- 2x pro Woche, nur in der Nicht-Badminton-Woche (MI + SA).
   Niedrigere Frequenz, dafuer volle 2 Arbeitssaetze pro Uebung und die
   schweren gewichteten Koerpergewichts-Compounds (Dip, Klimmzug), die in
   einer Woche mit drei Oberkoerper-Einheiten nicht regenerierbar waeren. */
upperA_chest:{lb:'Upper A',ti:'Brust · Rücken · schwer',ac:'#b8922e',du:'80–90 Min',rp:'RPE 8–9',rr:'5–16 Wdh',
lg:'Mesozyklus Block 1 (September): Brust-Priorität. Upper A läuft 2× in der Nicht-Badminton-Woche (MI + SA) und ist die schwere Fassung: durchgehend 2 Arbeitssätze pro Übung und die beiden gewichteten Körpergewichts-Compounds Dip und Klimmzug, die bei drei Oberkörper-Einheiten pro Woche nicht regenerierbar wären. Brust bekommt hier drei Winkel — Dip (untere Brust), Fliegende (mittlere), Schrägbank (obere) — plus Überzüge für den Brustkorb. Ab Oktober weicht der Dip einem Rückenzug; die Erklärung steht dann in der Rücken-Fassung dieses Tages.',
nt:[{i:'📅',t:'Dieser Tag existiert nur in der Nicht-Badminton-Woche. In der Badminton-Woche übernimmt Upper B mit drei Einheiten statt zwei — gleiche Wochensumme Brust, anders verteilt.'},
{i:'⚡',t:'2 Arbeitssätze pro Übung über 11 Übungen: Das Volumen kommt hier aus der Breite, nicht aus der Satzzahl je Übung. Jeder Satz muss dementsprechend nah ans Muskelversagen.'},
{i:'⚠️',t:'Brust Dip: Deine Notiz "je nach Schulterzustand weglassen" ist die richtige Herangehensweise. Dips belasten das Schultergelenk in der Endposition stark — bei Beschwerden ersatzlos streichen, nicht durch Drücken ersetzen.'}],
ex:[
{n:'Brust Dip (Gewichtet)',t:'Pectoralis major — unterer Anteil · Anteriore Schulter · Trizeps',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'8–11',rs:'2:15',g:'P',
f:'Warm-Up mit Körpergewicht × 8, langsame Exzentrik. Nicht zu tief gehen und nach vorne gebeugt bleiben — deine Notiz. Die Vorbeugung macht daraus eine Brustübung statt einer Trizepsübung. Bei Schulterbeschwerden weglassen.',
y:'Der Dip trainiert die Brust in einer Schulterextensions-Bewegung — biomechanisch einzigartig unter allen Brustübungen, weil kein Drücken diesen Winkel abdeckt. Als erste Übung des Tages steht er im frischesten Zustand, was bei einer Übung mit Zusatzgewicht am Gürtel auch technisch der sicherste Zeitpunkt ist.'},

{n:'Klimmzug (Gewichtet)',t:'Latissimus dorsi · Teres major · Bizeps · Rhomboiden',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'10–12',rs:'2:15',g:'C',
f:'Warm-Up mit Körpergewicht × 2–5, langsame Exzentrik und volle ROM. Am Tiefpunkt vollständige Armstreckung — kein halbes Hängen. Schulterblatt-Depression initiiert die Bewegung, nicht der Bizeps. Alternativ Latzug, falls die Klimmzugstange belegt ist — deine Notiz.',
y:'Die überlegene Latissimus-Übung, weil die Progression über Zusatzgewicht unbegrenzt ist, während der Latzug irgendwann am Körpergewicht als Gegengewicht scheitert. Der volle ROM mit maximaler Dehnung am Tiefpunkt ist der stärkste bekannte Wachstumsreiz für den Lat.'},

{n:'Fliegende (Maschine)',t:'Pectoralis major — mittlerer + sternaler Anteil',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–9',rs:'2:15',g:'I',
f:'Aufrechte Maschine bevorzugen, Sitz eher höher einstellen — deine Notiz. Die höhere Sitzposition verschiebt den Zugwinkel und trifft mehr mittlere bis untere Brustfasern. Am Tiefpunkt 1 Sek maximale Dehnung halten, dann aktiv zusammendrücken.',
y:'Die Maschine hält konstante Zugspannung über den gesamten ROM — anders als freie Kurzhanteln, die am Tiefpunkt entlasten. Nach dem Dip ist die Brust vorermüdet, sodass der Trizeps beim späteren Schrägbankdrücken nicht mehr der limitierende Faktor ist.'},

{n:'T-Bar Rudern — breiter Griff',t:'Rhomboiden · Trapez · Posteriore Schulter · Latissimus',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–8',rs:'2:30',g:'C',
f:'Warm-Up ~40 % × 8. Breiter Griff → Ellenbogen weiter außen → mehr Rhomboiden und hintere Schulter. Schulterblätter aktiv kontrahieren, Shrugs am Ende — deine Notiz.',
y:'Der breite Griff ist die bewusste Gegenposition zum engen Griff in Upper B: breit = Rhomboiden und posteriore Schulter, eng = Latissimus und Teres major. Über beide Wochentypen bekommt der obere Rücken so beide Zugwinkel, statt einen doppelt.'},

{n:'Schrägbankdrücken (Smith Machine)',t:'Pectoralis major — klavikulärer Anteil · Anteriore Schulter · Trizeps',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–8',rs:'2:30',g:'C',
f:'Warm-Up ~50 % × 8. Rumpf anspannen — deine Notiz. Die Smith-Führung erlaubt es, ohne Spotter nah ans Versagen zu gehen, was bei 5–8 Wdh der entscheidende Punkt ist.',
y:'Der klavikuläre Anteil der Brust ist der Bereich, den Dip und Fliegende nicht treffen — beide arbeiten in horizontaler oder absteigender Bahn. Der niedrige Rep-Bereich setzt hier bewusst auf mechanische Spannung als Reiz, nachdem die Brust durch die zwei vorherigen Übungen bereits metabolisch belastet ist.'},

{n:'Überzüge (Kurzhantel) — tief atmen',t:'Latissimus · Pectoralis · Serratus anterior · Rippenknorpel',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'15–20',rs:'2:00',g:'X',
f:'Leichtes Gewicht, hohe Wiederholungen. In der Dehnungsposition (Hantel hinter dem Kopf) maximal tief einatmen und den Brustkorb bewusst weiten — deine Notiz. Beim Zurückführen ausatmen. Die Atmung ist hier wichtiger als das Gewicht.',
y:'Die klassische Rader-Methode zur Thoraxerweiterung. Mit 18 Jahren ist der Rippenknorpel noch formbar und die mediale Clavicula-Epiphyse offen — das ist das biologische Zeitfenster, in dem diese Übung überhaupt strukturell wirken kann. Zusätzlich trainiert sie den Serratus anterior, der die Rippen von innen nach außen drückt.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel — isoliert',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'7–9',rs:'2:30',g:'P',
f:'Warm-Up ~50 % × 7. Lat aktiv anspannen, um den Trapez rauszunehmen — deine Notiz, und sie ist biomechanisch exakt: der angespannte Lat deprimiert das Schulterblatt und verhindert das Hochziehen. Ellenbogen 15° gebeugt.',
y:'Der mediale Deltoid ist der Muskel, der Schulterbreite erzeugt, und er bekommt aus Drückbewegungen fast kein Volumen — Shoulder Press trifft überwiegend den anterioren Anteil. Ohne direktes Seitheben bleibt dieser Bereich unterversorgt, deshalb steht er in jeder Oberkörper-Einheit.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'7–9',rs:'2:15',g:'I',
f:'Warm-Up ~50 % × 7. Am Tiefpunkt den Arm vollständig öffnen und 1 Sek pausieren — dort liegt der Reiz. Am Endpunkt 1 Sek Kontraktion halten. Schultern bleiben an der Auflage.',
y:'Die Preacher-Position fixiert den Oberarm vor dem Körper und trainiert damit den kurzen Kopf in verkürzter Position — der Gegenpol zum Incline Curl. Zusammen mit dem indirekten Volumen aus Klimmzug und T-Bar Rudern liegt der Bizeps an diesem Tag bei 2 direkten und rund 4 indirekten Sätzen.'},

{n:'Trizepsdrücken (Kabel)',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'10–12',rs:'1:30',g:'I',
f:'Warm-Up ~50 % × 12. Nah am Kabelzug stehen, Ellenbogen absolut fixiert am Körper. Vollständige Streckung am Endpunkt, 1 Sek halten.',
y:'Nach Dip und Schrägbankdrücken ist der Trizeps doppelt vorermüdet — die Isolation am Ende schöpft gezielt die Restkapazität aus, statt einen frischen schweren Reiz zu setzen, für den nach zwei Drückbewegungen ohnehin keine Kraft mehr da wäre.'},

{n:'Reverse Curl (Cable) — mit Band',t:'M. brachioradialis · M. brachialis · Unterarm-Extensoren',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'11–14',rs:'1:30',g:'A',
f:'Mit dem Band als Mischung aus Hammer und Reverse Curl — deine Notiz. Handstellung zwischen neutral und proniert. Ellenbogen fixiert, kein Schwung aus der Hüfte.',
y:'Der Brachialis liegt unter dem Bizeps und drückt ihn optisch nach oben — direkter Beitrag zur Armdicke, der über normale Curls kaum zu erreichen ist, weil der Bizeps dort immer dominiert. Die Hybrid-Griffposition trifft Brachioradialis und Brachialis gleichzeitig.'},

{n:'Unterarm-Curls hinter dem Rücken (Langhantel)',t:'Unterarm-Flexoren · M. flexor carpi radialis et ulnaris',s:'2 Sets',w:'1 Arbeitssatz + 1 Drop-Satz',r:'16 + Drop',rs:'0:15',g:'A',
f:'Ein schwerer Satz bis ~16 Wdh, dann ohne Gewichtsreduktion direkt in den Drop-Satz bis zum Versagen (deine Logs zeigen ~4 weitere Wdh). Volle Flexions-ROM, Stange hinter dem Rücken aus den Fingern bis zur vollständigen Beugung rollen.',
y:'Unterarm-Flexoren sind slow-twitch-dominant und reagieren besser auf hohe Wiederholungen mit kurzer Pause als auf schwere Sätze. Starke Griffkraft überträgt sich direkt auf Klimmzug und T-Bar Rudern — deshalb steht die Übung am Ende und nicht davor.'}]},

/* Mesozyklus Block 2 (Oktober): Ruecken-Prioritaet. Der Tausch in Upper A
   ist der Brust Dip -- die vom Nutzer benannte Wechseluebung. An seiner
   Stelle steht das einarmige Kurzhantelrudern, gleiche Satzzahl, gleiche
   Position. Pectoralis faellt pro Einheit von 6 auf 4 Arbeitssaetze,
   Latissimus steigt von 6 auf 8. Siehe VOL_BACK fuer die Wochensumme. */
upperA_back:{lb:'Upper A',ti:'Rücken · Brust · schwer',ac:'#b8922e',du:'80–90 Min',rp:'RPE 8–9',rr:'5–16 Wdh',
lg:'Mesozyklus Block 2 (Oktober): Rücken-Priorität. Der Brust Dip pausiert für die Dauer des Blocks — an seiner Stelle in der Reihenfolge steht jetzt Einarmiges Kurzhantelrudern, das dritte Rückenelement neben Klimmzug und T-Bar. Damit fällt Brust in dieser Einheit von 6 auf 4 Arbeitssätze, Rücken steigt von 6 auf 8 — eine echte Verschiebung, kein bloßes Umsortieren. Der Rest des Tages bleibt unverändert. Dieser Block bleibt über Oktober hinaus aktiv, bis eine dritte Priorität feststeht — kein automatischer Rücksprung zur Brust.',
nt:[{i:'🔁',t:'Der Tausch: Brust Dip raus, Einarmiges Kurzhantelrudern rein — exakt an dessen Position als erste Übung. Das ist der einzige Eingriff, der tatsächlich Volumen zwischen den Muskeln verschiebt.'},
{i:'📅',t:'Dieser Tag existiert nur in der Nicht-Badminton-Woche (MI + SA). In der Badminton-Woche übernimmt Upper B, wo im selben Block der Chest Press dem Rudern weicht.'},
{i:'💪',t:'Ohne den Dip fehlt dem Trizeps eine seiner beiden schweren Vorermüdungen. Das Trizepsdrücken am Ende trifft ihn dadurch frischer — ruhig 2–3 kg mehr auflegen als im Brust-Block.'}],
ex:[
{n:'Einarmiges Kurzhantelrudern',t:'Latissimus dorsi · Rhomboiden · Teres major — unilateral',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'8–10',rs:'2:15',g:'P',
f:'Auf der Bank abgestützt (Knie und Hand derselben Seite), freier Arm hängt vollständig gestreckt. Ellenbogen eng am Körper nach hinten-oben ziehen, am Endpunkt Schulterblatt aktiv retrahieren und 1 Sek halten. Kontrolliert bis zur vollen Dehnung ablassen — nicht fallen lassen.',
y:'Ersetzt den Brust Dip für die Dauer des Rücken-Blocks, an derselben Stelle, an der sonst die erste Brustübung stünde. Unilateral erlaubt einen tieferen Dehnungsweg als jede bilaterale Variante, weil der Rücken nicht durch eine Stangenbreite limitiert wird, und deckt Kraft-Asymmetrien zwischen beiden Seiten auf, die Klimmzug und T-Bar verdecken.'},

{n:'Klimmzug (Gewichtet)',t:'Latissimus dorsi · Teres major · Bizeps · Rhomboiden',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'10–12',rs:'2:15',g:'C',
f:'Warm-Up mit Körpergewicht × 2–5, langsame Exzentrik und volle ROM. Am Tiefpunkt vollständige Armstreckung. Schulterblatt-Depression initiiert die Bewegung. Alternativ Latzug — deine Notiz.',
y:'Steht bewusst nach dem einarmigen Rudern statt davor: Das Rudern braucht Griffkraft in nur einer Hand gleichzeitig, der Klimmzug in beiden. Die umgekehrte Reihenfolge würde den Klimmzug durch Griffermüdung limitieren, bevor der Lat ausgereizt ist.'},

{n:'Fliegende (Maschine)',t:'Pectoralis major — mittlerer + sternaler Anteil',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–9',rs:'2:15',g:'I',
f:'Aufrechte Maschine bevorzugen, Sitz eher höher einstellen — deine Notiz. Am Tiefpunkt 1 Sek maximale Dehnung halten, dann aktiv zusammendrücken.',
y:'Erste von nur noch zwei Brustübungen in diesem Block. Da der Dip als Vorermüdung fehlt, ist die Brust hier frisch — das Gewicht darf entsprechend höher liegen als im Brust-Block, obwohl das Gesamtvolumen für die Brust sinkt.'},

{n:'T-Bar Rudern — breiter Griff',t:'Rhomboiden · Trapez · Posteriore Schulter · Latissimus',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–8',rs:'2:30',g:'C',
f:'Warm-Up ~40 % × 8. Breiter Griff → Ellenbogen weiter außen → mehr Rhomboiden und hintere Schulter. Schulterblätter aktiv kontrahieren, Shrugs am Ende — deine Notiz.',
y:'Dritte Zugbewegung des Tages, jede mit anderem Winkel: einarmig (Sagittalebene, unilateral), Klimmzug (vertikal), T-Bar breit (horizontal, außen). Diese Winkelvielfalt ist der Grund, warum 8 Rückensätze hier mehr bringen als 8 Sätze derselben Übung.'},

{n:'Schrägbankdrücken (Smith Machine)',t:'Pectoralis major — klavikulärer Anteil · Anteriore Schulter · Trizeps',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–8',rs:'2:30',g:'C',
f:'Warm-Up ~50 % × 8. Rumpf anspannen — deine Notiz. Die Smith-Führung erlaubt es, ohne Spotter nah ans Versagen zu gehen.',
y:'Die zweite und letzte Brustübung des Blocks. Mit nur noch zwei Brustübungen ist der obere Anteil der Bereich, der am wenigsten verzichtbar ist — er bekommt aus keiner anderen Bewegung im Plan nennenswertes Volumen, während untere und mittlere Brust indirekt aus den Überzügen mitprofitieren.'},

{n:'Überzüge (Kurzhantel) — tief atmen',t:'Latissimus · Pectoralis · Serratus anterior · Rippenknorpel',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'15–20',rs:'2:00',g:'X',
f:'Leichtes Gewicht, hohe Wiederholungen. In der Dehnungsposition maximal tief einatmen und den Brustkorb bewusst weiten — deine Notiz. Beim Zurückführen ausatmen.',
y:'Blockunabhängig sinnvoll, solange die mediale Clavicula-Epiphyse offen ist. Im Rücken-Block zählt zusätzlich der Latissimus-Anteil der Bewegung stärker: Der Überzug ist die einzige Lat-Übung im Plan, bei der der Ellenbogen fast gestreckt bleibt, der Bizeps also nicht mithelfen kann.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel — isoliert',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'7–9',rs:'2:30',g:'P',
f:'Warm-Up ~50 % × 7. Lat aktiv anspannen, um den Trapez rauszunehmen — deine Notiz. Ellenbogen 15° gebeugt.',
y:'Unverändert gegenüber dem Brust-Block. Der Mesozyklus verschiebt Volumen zwischen Brust und Rücken, nicht zur Schulter — sonst wäre die Priorisierung kein Nullsummenspiel mehr, sondern eine schleichende Gesamtvolumen-Erhöhung.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'7–9',rs:'2:15',g:'I',
f:'Warm-Up ~50 % × 7. Am Tiefpunkt vollständig öffnen und 1 Sek pausieren. Schultern bleiben an der Auflage.',
y:'Im Rücken-Block hat der Bizeps aus drei statt zwei Zugbewegungen indirektes Volumen bekommen. Wenn die Curls sich schwerer anfühlen als sonst, ist das erwartbar — die Satzzahl bleibt trotzdem gleich, reduziere lieber das Gewicht als die Sätze.'},

{n:'Trizepsdrücken (Kabel)',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'10–12',rs:'1:30',g:'I',
f:'Warm-Up ~50 % × 12. Ellenbogen absolut fixiert am Körper, vollständige Streckung am Endpunkt mit 1 Sek Halten.',
y:'Ohne den Dip ist der Trizeps nur noch einfach vorermüdet statt doppelt — hier liegt entsprechend mehr Gewicht drin. Das ist der einzige Muskel, der vom Rücken-Block indirekt profitiert.'},

{n:'Reverse Curl (Cable) — mit Band',t:'M. brachioradialis · M. brachialis · Unterarm-Extensoren',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'11–14',rs:'1:30',g:'A',
f:'Mit dem Band als Mischung aus Hammer und Reverse Curl — deine Notiz. Ellenbogen fixiert, kein Schwung.',
y:'Unverändert gegenüber dem Brust-Block.'},

{n:'Unterarm-Curls hinter dem Rücken (Langhantel)',t:'Unterarm-Flexoren · M. flexor carpi radialis et ulnaris',s:'2 Sets',w:'1 Arbeitssatz + 1 Drop-Satz',r:'16 + Drop',rs:'0:15',g:'A',
f:'Ein schwerer Satz bis ~16 Wdh, dann direkt in den Drop-Satz bis zum Versagen. Volle Flexions-ROM.',
y:'Unverändert gegenüber dem Brust-Block. Im Rücken-Block sind die Unterarme durch die dritte Zugübung stärker vorbelastet — bei Ellenbogenreizung ist das der erste Satz, der entfällt.'}]},

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

/* Upper B -- 3x pro Woche, nur in der Badminton-Woche (DI, DO, SA).
   Hoehere Frequenz, dafuer meist nur 1-2 Arbeitssaetze je Uebung und
   ueberwiegend gefuehrte Maschinen: weniger Stabilisations- und
   Gelenkermuedung, damit dieselbe Muskulatur alle 48h wieder belastbar
   ist. Gleiches Wochenvolumen wie Upper A 2x, anders verteilt. */
upperB_chest:{lb:'Upper B',ti:'Brust · Rücken · Frequenz',ac:'#b8922e',du:'70–80 Min',rp:'RPE 7–9',rr:'5–20 Wdh',
lg:'Mesozyklus Block 1 (September): Brust-Priorität. Upper B läuft 3× in der Badminton-Woche (DI, DO, SA) und ist die Frequenz-Fassung: meist nur 1–2 Arbeitssätze pro Übung und überwiegend geführte Maschinen. Das ist kein reduziertes Training, sondern dieselbe Wochensumme auf drei Einheiten verteilt statt auf zwei — bei dieser Verteilung ist weniger Gelenk- und Stabilisationsermüdung pro Einheit die Voraussetzung dafür, dass dieselbe Muskulatur nach 48 h wieder belastbar ist. Ab Oktober weicht der Chest Press einem Rückenzug.',
nt:[{i:'📅',t:'Dieser Tag existiert nur in der Badminton-Woche, dafür dreimal (DI, DO, SA) mit Badminton am Mittwoch dazwischen. Sharms entfällt in dieser Woche komplett — Schultern und Arme werden hier dreimal statt einmal mitbedient.'},
{i:'🔁',t:'Drei identische Einheiten pro Woche heißt: dieselbe Übung alle 48 h. Nicht jeder Satz muss ans absolute Versagen — 1–2 Wdh Reserve an DI und DO, erst am SA ausreizen. Sonst akkumuliert die Ermüdung über die Woche schneller als die Erholung.'},
{i:'📐',t:'T-Bar Rudern hier mit engem Griff (vs. breit bei Upper A): eng = mehr Latissimus und Teres major, breit = mehr Rhomboiden und hintere Schulter. Bewusste Variation zwischen den beiden Wochentypen.'}],
ex:[
{n:'Fliegende (Maschine)',t:'Pectoralis major — mittlerer + sternaler Anteil',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'8–15',rs:'2:30',g:'P',
f:'Warm-Up ~60 % × 6. Am Tiefpunkt 1 Sek maximale Dehnung halten, dann aktiv zusammendrücken. Der Rep-Bereich darf hier über die drei Einheiten schwanken — deine Logs zeigen 15 und 8 Wdh im selben Training, das ist als Doppelreiz sinnvoll.',
y:'Steht als einzige Brustübung mit zwei vollen Arbeitssätzen am Anfang, weil sie das Schultergelenk am wenigsten belastet — bei drei Einheiten pro Woche ist genau das der limitierende Faktor, nicht die Muskelermüdung. Die Maschine hält konstante Zugspannung über den gesamten ROM.'},

{n:'Shoulder Press (Machine Plates)',t:'Anteriore + mediale Schulter · Trizeps synergistisch',s:'1 Set',w:'1 Arbeitssatz (kein Warm-Up)',r:'6–8',rs:'2:00',g:'C',
f:'Die Fliegenden davor haben Schultergürtel und Brustmuskulatur bereits durchblutet — ein separates Warm-Up entfällt. Ellenbogen leicht vor der Schulterebene halten, das folgt dem natürlichen Humerus-Pfad. Schultern am Gipfelpunkt nicht hochziehen.',
y:'Ein einziger schwerer Satz, dreimal pro Woche, ergibt 3 Sätze für die vordere Schulter — genau der Bereich, der in der Nicht-Badminton-Woche über Sharms abgedeckt wird. Bei 6–8 Wdh steht mechanische Spannung als Reiz im Vordergrund, wofür ein maximal ausgeführter Satz genügt.'},

{n:'Latzug (Kabel)',t:'Latissimus dorsi · Teres major · Bizeps synergistisch',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–9',rs:'2:30',g:'C',
f:'Warm-Up ~45 % × 8. Vollständige Streckung am oberen Punkt — der Lat muss maximal gedehnt sein. Schulterblatt-Depression initiiert die Zugbewegung, nicht der Bizeps. Am Endpunkt 1 Sek halten.',
y:'Ersetzt hier den gewichteten Klimmzug aus Upper A bewusst: Bei drei Einheiten pro Woche wäre der Klimmzug mit Zusatzgewicht die erste Übung, an der Ellenbogen und Bizepssehne überlastet reagieren. Der Latzug liefert denselben vertikalen Zugreiz bei deutlich geringerer Sehnenbelastung.'},

{n:'Chest Press (Maschine)',t:'Pectoralis major — mittlerer Anteil · Anteriore Schulter · Trizeps',s:'2 Sets',w:'1 Warm-Up + 1 Arbeitssatz',r:'8–12',rs:'2:00',g:'I',
f:'Warm-Up ~50 % × 10. Schulterblätter zurück und unten fixiert an der Lehne. Nicht vollständig durchstrecken — die Endposition entlastet die Brust und verlagert alles auf den Trizeps.',
y:'Der horizontale Druckwinkel, den weder Fliegende (Adduktion) noch Schrägbank (aufsteigend) abdecken. Nur ein Arbeitssatz, weil es die dritte Brustbelastung der Einheit ist und die Brust bei drei Einheiten pro Woche ohnehin auf 12 Wochensätze kommt. Dies ist die Übung, die im Rücken-Block dem Rudern weicht.'},

{n:'Schrägbankdrücken (Smith Machine)',t:'Pectoralis major — klavikulärer Anteil · Anteriore Schulter · Trizeps',s:'2 Sets',w:'1 Warm-Up + 1 Arbeitssatz',r:'6–9',rs:'2:30',g:'C',
f:'Warm-Up ~50 % × 6. Ellenbogen abgewinkelt halten, nicht ausgestellt — deine Notiz. Alternativ die Incline Machine Press, falls die Smith belegt ist.',
y:'Der klavikuläre Anteil ist der Brustbereich, der aus keiner anderen Bewegung im Plan Volumen bekommt. Ein Arbeitssatz × 3 Einheiten = 3 Wochensätze, identisch zu Upper A (2 Sätze × 2 Einheiten = 4) — die Frequenzverteilung gleicht sich hier fast exakt aus.'},

{n:'T-Bar Rudern — enger Griff',t:'Latissimus dorsi · Teres major · Rhomboiden',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–10',rs:'2:30',g:'C',
f:'Warm-Up ~45 % × 8. Enger Griff → Ellenbogen nah am Körper → mehr Latissimus und Teres major. Shrugs am Ende — deine Notiz.',
y:'Der enge Griff ist die bewusste Gegenposition zum breiten Griff in Upper A. Zusammen mit dem Latzug ergibt das zwei horizontale bzw. vertikale Zugwinkel pro Einheit, dreimal pro Woche — der Rücken bekommt in dieser Woche mehr Frequenz als die Brust, obwohl das Satzvolumen gleich ist.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel — isoliert',s:'2 Sets',w:'1 Warm-Up + 1 Arbeitssatz',r:'8–10',rs:'2:30',g:'P',
f:'Warm-Up ~50 % × 3–7. Lat aktiv anspannen, um den Trapez rauszunehmen — deine Notiz. Ellenbogen 15° gebeugt, kein Schwung aus dem Rumpf.',
y:'Ein Arbeitssatz × 3 Einheiten = 3 Wochensätze gegenüber 4 in der Nicht-Badminton-Woche. Der Unterschied ist bewusst: Badminton belastet die Schulter über den Überkopfschlag zusätzlich, sodass der mediale Deltoid in dieser Woche indirektes Volumen aus dem Sport bekommt.'},

{n:'Trizepsdrücken einarmig (Kabel) — mit Cuffs',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–11',rs:'1:35',g:'I',
f:'Mit Cuffs statt Griff — deine Notiz. Die Cuffs eliminieren die Griffkraft als limitierenden Faktor, sodass der Trizeps tatsächlich zuerst versagt. Ellenbogen absolut fixiert am Körper, vollständige Streckung am Endpunkt.',
y:'Einarmig verhindert, dass die stärkere Seite die schwächere kompensiert — bei einer Übung mit drei Einheiten pro Woche würde sich eine solche Asymmetrie sonst schnell einschleifen. Nach Chest Press und Schrägbank ist der Trizeps vorermüdet, die Isolation schöpft die Restkapazität aus.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–7',rs:'2:15',g:'I',
f:'Warm-Up ~80 % × 4 — hier ist das Warm-Up bewusst schwer und kurz, weil der Bizeps aus Latzug und T-Bar Rudern bereits vollständig vorbereitet ist. Am Tiefpunkt vollständig öffnen, 1 Sek pausieren.',
y:'5–7 Wdh ist schwer für den Bizeps, aber bei dreimal wöchentlicher Frequenz genau richtig: hohe mechanische Spannung bei niedrigem metabolischem Stress ist die Kombination, die sich innerhalb von 48 h erholt. Hohe Wiederholungen bis zum Brennen würden hier über die Woche akkumulieren.'},

{n:'Reverse Curl (Cable) — mit Band',t:'M. brachioradialis · M. brachialis · Unterarm-Extensoren',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'12',rs:'1:25',g:'A',
f:'Mit dem Band als Mischung aus Hammer und Reverse Curl — deine Notiz. Handstellung zwischen neutral und proniert, Ellenbogen fixiert. Nach dem Preacher Curl ist kein Warm-Up nötig.',
y:'Der Brachialis liegt unter dem Bizeps und drückt ihn optisch nach oben. Die kurze Pause von 1:25 ist hier vertretbar, weil die Übung leicht genug ist, dass die Erholung nicht der limitierende Faktor wird — das hält die Einheit trotz 11 Übungen unter 80 Minuten.'},

{n:'Unterarm-Curls hinter dem Rücken (Langhantel) — Optional',t:'Unterarm-Flexoren · M. flexor carpi radialis et ulnaris',s:'2 Sets',w:'1 Arbeitssatz + 1 Drop-Satz',r:'20 + Drop',rs:'0:15',g:'O',
f:'Optional laut deiner Routine. Ein Satz bis ~20 Wdh, dann direkt in den Drop-Satz bis zum Versagen. Volle Flexions-ROM.',
y:'Als optional markiert, weil die Unterarme in dieser Woche dreimal indirektes Volumen aus Latzug, T-Bar Rudern und Reverse Curl bekommen. Bei Ellenbogen- oder Sehnenreizung ist das der erste Satz, der ersatzlos entfällt — direktes Unterarmtraining ist bei diesem Zugvolumen Feinschliff, keine Notwendigkeit.'}]},

/* Mesozyklus Block 2 (Oktober): Ruecken-Prioritaet. Der Tausch in Upper B
   trifft den Chest Press -- die redundanteste der drei Druckbewegungen,
   da Fliegende (Adduktion) und Schraegbank (klavikulaer) bleiben. An seiner
   Stelle steht das einarmige Kurzhantelrudern mit 2 Saetzen. Pectoralis
   faellt pro Einheit von 4 auf 3, Ruecken steigt von 4 auf 6. */
upperB_back:{lb:'Upper B',ti:'Rücken · Brust · Frequenz',ac:'#b8922e',du:'70–80 Min',rp:'RPE 7–9',rr:'5–20 Wdh',
lg:'Mesozyklus Block 2 (Oktober): Rücken-Priorität. Der Chest Press pausiert für die Dauer des Blocks — an seiner Stelle steht Einarmiges Kurzhantelrudern, das dritte Rückenelement neben Latzug und T-Bar. Brust fällt in dieser Einheit von 4 auf 3 Arbeitssätze, Rücken steigt von 4 auf 6; über drei Einheiten pro Woche sind das 9 statt 12 Brust- und 18 statt 12 Rückensätze. Der Chest Press ist die richtige Übung dafür, weil ihr horizontaler Druckwinkel sich am stärksten mit den beiden verbleibenden Brustübungen überschneidet. Dieser Block bleibt über Oktober hinaus aktiv, bis eine dritte Priorität feststeht.',
nt:[{i:'🔁',t:'Der Tausch: Chest Press raus, Einarmiges Kurzhantelrudern rein. In Upper A weicht stattdessen der Brust Dip — beide Male die Übung, deren Winkel am ehesten von den anderen mitabgedeckt wird.'},
{i:'⚠️',t:'18 Rückensätze pro Woche ist am oberen Rand des sinnvoll Verarbeitbaren. Wenn Griffkraft oder Bizepssehnen nach zwei Wochen nachgeben, streiche zuerst den optionalen Unterarm-Satz, dann einen Satz T-Bar Rudern.'},
{i:'📐',t:'Drei Zugwinkel pro Einheit: Latzug vertikal, T-Bar eng horizontal bilateral, Rudern unilateral. Das ist der Grund, warum das erhöhte Volumen hier wirkt und nicht nur ermüdet.'}],
ex:[
{n:'Fliegende (Maschine)',t:'Pectoralis major — mittlerer + sternaler Anteil',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'8–15',rs:'2:30',g:'I',
f:'Warm-Up ~60 % × 6. Am Tiefpunkt 1 Sek maximale Dehnung halten, dann aktiv zusammendrücken.',
y:'Bleibt als Einstieg stehen, obwohl Brust in diesem Block auf Erhaltung läuft: Die Übung belastet das Schultergelenk am wenigsten und dient damit gleichzeitig als Aufwärmen für die schweren Zugbewegungen danach.'},

{n:'Shoulder Press (Machine Plates)',t:'Anteriore + mediale Schulter · Trizeps synergistisch',s:'1 Set',w:'1 Arbeitssatz (kein Warm-Up)',r:'6–8',rs:'2:00',g:'C',
f:'Ellenbogen leicht vor der Schulterebene halten. Schultern am Gipfelpunkt nicht hochziehen.',
y:'Unverändert gegenüber dem Brust-Block. Der Mesozyklus verschiebt Volumen zwischen Brust und Rücken — die Schulter bleibt außen vor, sonst wäre es keine Priorisierung, sondern eine Volumenerhöhung.'},

{n:'Latzug (Kabel)',t:'Latissimus dorsi · Teres major · Bizeps synergistisch',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'6–9',rs:'2:30',g:'P',
f:'Warm-Up ~45 % × 8. Vollständige Streckung am oberen Punkt. Schulterblatt-Depression initiiert die Zugbewegung. Am Endpunkt 1 Sek halten.',
y:'Erste von drei Zugbewegungen und im Rücken-Block die Prioritätsübung des Tages. Der vertikale Zug ist der Winkel, der den Latissimus in seiner vollen Länge trifft — deshalb steht er vor den beiden Ruderbewegungen, solange die Griffkraft noch vollständig ist.'},

{n:'Einarmiges Kurzhantelrudern',t:'Latissimus dorsi · Rhomboiden · Teres major — unilateral',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'8–10',rs:'2:00',g:'X',
f:'Auf der Bank abgestützt (Knie und Hand derselben Seite), freier Arm hängt vollständig gestreckt. Ellenbogen eng am Körper nach hinten-oben ziehen, am Endpunkt Schulterblatt aktiv retrahieren und 1 Sek halten. Kontrolliert bis zur vollen Dehnung ablassen.',
y:'Ersetzt den Chest Press an exakt dessen Position. Unilateral erlaubt einen tieferen Dehnungsweg als jede bilaterale Variante, weil der Rücken nicht durch eine Stangenbreite limitiert wird, und deckt Kraft-Asymmetrien auf, die Latzug und T-Bar verdecken — bei drei Einheiten pro Woche schleift sich eine solche Asymmetrie sonst besonders schnell ein.'},

{n:'Schrägbankdrücken (Smith Machine)',t:'Pectoralis major — klavikulärer Anteil · Anteriore Schulter · Trizeps',s:'2 Sets',w:'1 Warm-Up + 1 Arbeitssatz',r:'6–9',rs:'2:30',g:'C',
f:'Warm-Up ~50 % × 6. Ellenbogen abgewinkelt halten, nicht ausgestellt — deine Notiz. Alternativ die Incline Machine Press.',
y:'Die einzige verbleibende Druckbewegung neben den Fliegenden, und damit die, die nicht entfallen darf: Der klavikuläre Anteil bekommt aus keiner anderen Bewegung im Plan Volumen. Zusammen mit den Fliegenden bleiben 9 Brustsätze pro Woche — das liegt im Erhaltungsbereich, nicht im Abbau.'},

{n:'T-Bar Rudern — enger Griff',t:'Latissimus dorsi · Teres major · Rhomboiden',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–10',rs:'2:30',g:'C',
f:'Warm-Up ~45 % × 8. Enger Griff → Ellenbogen nah am Körper → mehr Latissimus und Teres major. Shrugs am Ende — deine Notiz.',
y:'Dritte Zugbewegung der Einheit. Steht bewusst nach dem einarmigen Rudern statt davor: Das T-Bar Rudern verlangt beidseitige Griffkraft gleichzeitig, das einarmige nur eine Hand — die umgekehrte Reihenfolge würde den schwereren bilateralen Zug durch Griffermüdung limitieren.'},

{n:'Seitheben (Maschine)',t:'Medialer Deltamuskel — isoliert',s:'2 Sets',w:'1 Warm-Up + 1 Arbeitssatz',r:'8–10',rs:'2:30',g:'P',
f:'Warm-Up ~50 % × 3–7. Lat aktiv anspannen, um den Trapez rauszunehmen — deine Notiz.',
y:'Unverändert gegenüber dem Brust-Block.'},

{n:'Trizepsdrücken einarmig (Kabel) — mit Cuffs',t:'Trizeps — Caput laterale · Caput mediale',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–11',rs:'1:35',g:'I',
f:'Mit Cuffs statt Griff — deine Notiz. Ellenbogen absolut fixiert am Körper, vollständige Streckung am Endpunkt.',
y:'Ohne den Chest Press ist der Trizeps nur noch einfach vorermüdet statt doppelt — hier liegt entsprechend mehr Gewicht drin. Der einzige Muskel, der vom Rücken-Block indirekt profitiert.'},

{n:'Preacher Curl (Maschine)',t:'Bizeps brachii — Caput breve · Brachialis',s:'3 Sets',w:'1 Warm-Up + 2 Arbeitssätze',r:'5–7',rs:'2:15',g:'I',
f:'Warm-Up ~80 % × 4. Am Tiefpunkt vollständig öffnen, 1 Sek pausieren.',
y:'Im Rücken-Block bekommt der Bizeps aus drei statt zwei Zugbewegungen indirektes Volumen, dreimal pro Woche. Wenn die Curls sich schwerer anfühlen, ist das erwartbar — reduziere das Gewicht, nicht die Sätze.'},

{n:'Reverse Curl (Cable) — mit Band',t:'M. brachioradialis · M. brachialis · Unterarm-Extensoren',s:'2 Sets',w:'2 Arbeitssätze (kein Warm-Up)',r:'12',rs:'1:25',g:'A',
f:'Mit dem Band als Mischung aus Hammer und Reverse Curl — deine Notiz. Ellenbogen fixiert.',
y:'Unverändert gegenüber dem Brust-Block.'},

{n:'Unterarm-Curls hinter dem Rücken (Langhantel) — Optional',t:'Unterarm-Flexoren · M. flexor carpi radialis et ulnaris',s:'2 Sets',w:'1 Arbeitssatz + 1 Drop-Satz',r:'20 + Drop',rs:'0:15',g:'O',
f:'Optional. Ein Satz bis ~20 Wdh, dann direkt in den Drop-Satz bis zum Versagen.',
y:'Im Rücken-Block der erste Kandidat zum Streichen: Bei drei Zugbewegungen × drei Einheiten bekommen die Unterarme so viel indirektes Volumen, dass direktes Training eher die Sehnen als den Muskel limitiert.'}]},

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

/* Volumen je EINE Einheit des jeweiligen Programms, nicht pro Woche --
   die Wochensumme rechnet renderVol() ueber WEEKFREQ aus. Das ist noetig,
   weil die beiden Wochentypen seit der Umstellung voellig verschiedene
   Einheiten enthalten: Nicht-Badminton = Sharms 1x + Upper A 2x + Lower 1x,
   Badminton = Upper B 3x + Lower 1x.
   d = direkte Arbeitssaetze, i = indirekte (synergistische) Saetze,
   beide je Einheit. Fehlende Schluessel sind 0.
   VOL_CHEST = Mesozyklus Block 1, VOL_BACK = Block 2; es unterscheiden sich
   nur die fuenf Zeilen, die der Uebungstausch mechanisch betrifft. */
export const VOL_CHEST=[
{m:'Pectoralis',d:{ua:6,ub:4},i:{},mav:[8,16],n:'Upper A: Dip(2)+Fliegende(2)+Schrägbank(2) · Upper B: Fliegende(2)+Chest Press(1)+Schrägbank(1)'},
{m:'Latissimus',d:{ua:4,ub:4},i:{},mav:[8,14],n:'Upper A: Klimmzug(2)+Überzüge(2) · Upper B: Latzug(2)+T-Bar eng(2)'},
{m:'Rhomboiden / Trap',d:{ua:2},i:{ua:2,ub:4},mav:[6,12],n:'Upper A: T-Bar breiter Griff(2) direkt · indirekt aus Klimmzug bzw. Latzug + T-Bar eng'},
{m:'Med. Deltoid',d:{sh:2,ua:2,ub:1},i:{sh:2,ub:1},mav:[6,14],n:'Seitheben in jeder Oberkörper-Einheit · Shoulder Press indirekt'},
{m:'Post. Deltoid',d:{sh:2},i:{ua:2,ub:2},mav:[6,12],n:'Sharms: Reverse Fliegende(2) · T-Bar Rudern indirekt'},
{m:'Bizeps',d:{sh:2,ua:2,ub:2},i:{ua:2,ub:4},mav:[8,14],n:'Preacher Curl in jeder Einheit · alle Zugübungen indirekt'},
{m:'Trizeps',d:{sh:4,ua:2,ub:2},i:{ua:3,ub:3},mav:[6,14],n:'Sharms: JM Press(2)+Pushdown(2) · alle Drückbewegungen indirekt'},
{m:'Unterarm',d:{sh:6,ua:3,ub:3,lo:2},i:{},mav:[6,16],n:'Reverse Curl + Wrist Curl + Extension'},
{m:'Core',d:{sh:4,lo:5},i:{},mav:[4,12],n:'Sharms: Crunch(2)+Beinheben(2) · Lower: Crunch(3)+Beinheben(2)'},
{m:'Obliques',d:{lo:2},i:{},mav:[2,8],n:'Lower: Side Bend(2)'},
{m:'Quadrizeps',d:{lo:4},i:{},mav:[8,16],n:'Beinpresse(2)+Beinstrecken(2) · + Sportarten',sport:1},
{m:'Hamstrings',d:{lo:2},i:{lo:2},mav:[6,12],n:'Beinbeugen(2) · Hyperextension indirekt · + Sportarten',sport:1},
{m:'Gluteus',d:{lo:2},i:{lo:1},mav:[4,12],n:'Hyperextension(2) · + Sportarten',sport:1},
{m:'Adduktoren',d:{lo:2},i:{},mav:[2,8],n:'Hüftadduktion(2)'},
{m:'Waden',d:{lo:2},i:{},mav:[4,10],n:'Wadenpressen(2) · + Sprungsportarten',sport:1}];

export const VOL_BACK=[
{m:'Pectoralis',d:{ua:4,ub:3},i:{},mav:[8,16],n:'Upper A: Fliegende(2)+Schrägbank(2) — Dip pausiert · Upper B: Fliegende(2)+Schrägbank(1) — Chest Press pausiert'},
{m:'Latissimus',d:{ua:6,ub:6},i:{},mav:[8,14],n:'Upper A: Einarm. Rudern(2)+Klimmzug(2)+Überzüge(2) · Upper B: Latzug(2)+T-Bar eng(2)+Einarm. Rudern(2)'},
{m:'Rhomboiden / Trap',d:{ua:2},i:{ua:3,ub:5},mav:[6,12],n:'Upper A: T-Bar breit(2) direkt · zusätzliches indirektes Volumen aus dem einarmigen Rudern'},
{m:'Med. Deltoid',d:{sh:2,ua:2,ub:1},i:{sh:2,ub:1},mav:[6,14],n:'Unverändert — der Block verschiebt nur zwischen Brust und Rücken'},
{m:'Post. Deltoid',d:{sh:2},i:{ua:2,ub:2},mav:[6,12],n:'Sharms: Reverse Fliegende(2) · T-Bar Rudern indirekt'},
{m:'Bizeps',d:{sh:2,ua:2,ub:2},i:{ua:3,ub:6},mav:[8,14],n:'Preacher Curl direkt · drei statt zwei Zugübungen je Einheit indirekt'},
{m:'Trizeps',d:{sh:4,ua:2,ub:2},i:{ua:2,ub:2},mav:[6,14],n:'Weniger indirektes Volumen, weil Dip bzw. Chest Press pausieren'},
{m:'Unterarm',d:{sh:6,ua:3,ub:3,lo:2},i:{},mav:[6,16],n:'Reverse Curl + Wrist Curl + Extension'},
{m:'Core',d:{sh:4,lo:5},i:{},mav:[4,12],n:'Sharms: Crunch(2)+Beinheben(2) · Lower: Crunch(3)+Beinheben(2)'},
{m:'Obliques',d:{lo:2},i:{},mav:[2,8],n:'Lower: Side Bend(2)'},
{m:'Quadrizeps',d:{lo:4},i:{},mav:[8,16],n:'Beinpresse(2)+Beinstrecken(2) · + Sportarten',sport:1},
{m:'Hamstrings',d:{lo:2},i:{lo:2},mav:[6,12],n:'Beinbeugen(2) · Hyperextension indirekt · + Sportarten',sport:1},
{m:'Gluteus',d:{lo:2},i:{lo:1},mav:[4,12],n:'Hyperextension(2) · + Sportarten',sport:1},
{m:'Adduktoren',d:{lo:2},i:{},mav:[2,8],n:'Hüftadduktion(2)'},
{m:'Waden',d:{lo:2},i:{},mav:[4,10],n:'Wadenpressen(2) · + Sprungsportarten',sport:1}];

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
