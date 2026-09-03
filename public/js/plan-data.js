/* Trainingsplan-Daten.
   ACHTUNG: Der Original-Upload von dashboard.html war nach 20116 Bytes abgeschnitten
   (Commit d389b6b). Alles ab S.mo.lg fehlte im Repository und ist nicht rekonstruierbar.
   Erhaltene Fragmente stehen unverändert unten. Fehlende Tage/Übungen sind bewusst leer
   (ex: []) statt erfunden — die UI zeigt dafür einen expliziten Hinweis an.
   Zum Nachtragen: pro Tag `ex` mit {n,tag,tr,sets,m:{...},u,w,note} befüllen. */

export const AC = { mo:'#7a5ab5', di:'#c94535', mi:'#b8922e', do:'#2e9e6a', fr:'#3a7bbf', sa:'#b8922e', so:'#2e9e6a' };

export const DAYS = [
  { id:'mo', s:'MO', n:'Sharms' }, { id:'di', s:'DI', n:'HIIT' },   { id:'mi', s:'MI', n:'Upper A' },
  { id:'do', s:'DO', n:'Rest' },   { id:'fr', s:'FR', n:'Lower' },  { id:'sa', s:'SA', n:'Upper B' },
  { id:'so', s:'SO', n:'Zone 2' }
];

export const TG = {
  C:{ b:'#0e1a26', c:'#3a7bbf', t:'COMPOUND'  }, I:{ b:'#1f1a0a', c:'#b8922e', t:'ISOLATION' },
  P:{ b:'#260e0e', c:'#c94535', t:'PRIORITÄT' }, G:{ b:'#0a1f14', c:'#2e9e6a', t:'GESUNDHEIT' },
  K:{ b:'#180e26', c:'#7a5ab5', t:'CORE'      }, A:{ b:'#1a0e1a', c:'#7a5ab5', t:'ARMGESUND' },
  O:{ b:'#181818', c:'#4f4f4f', t:'OPTIONAL'  }, X:{ b:'#261a0e', c:'#b86830', t:'SPEZIAL' },
  N:{ b:'#181818', c:'#757575', t:'INFO'      }
};

export const S = {
  mo:{ lb:'MO · Sharms', ti:'Schultern · Arme · Core', ac:'#7a5ab5', du:'80–90 Min', rp:'RPE 7–9', rr:'5–16 Wdh',
       lg:'Schultern zuerst (Compound → Isolation), dann Arme, Core als Abschluss. Nach zwei Ruhetagen (SO Zone 2 + Erholung) sind die Schultern vollständig frisch. Die niedrigen Wiederholungszahlen (6–8) bei Shoulder Press und Seitheben setzen', ex:[] },
  di:{ lb:'DI · HIIT',    ti:'Intervalle · Conditioning', ac:'#c94535', du:'30–40 Min', rp:'RPE 8–10', rr:'—',      lg:'', ex:[] },
  mi:{ lb:'MI · Upper A', ti:'Brust · Rücken · Arme',     ac:'#b8922e', du:'70–80 Min', rp:'RPE 7–9',  rr:'6–15 Wdh', lg:'', ex:[] },
  do:{ lb:'DO · Rest',    ti:'Vollständige Regeneration', ac:'#2e9e6a', du:'—',         rp:'—',        rr:'—',        lg:'', ex:[] },
  fr:{ lb:'FR · Lower',   ti:'Beine · Rumpf',             ac:'#3a7bbf', du:'55–65 Min', rp:'RPE 7–9',  rr:'5–12 Wdh', lg:'', ex:[] },
  sa:{ lb:'SA · Upper B', ti:'Brust · Rücken · Schultern',ac:'#b8922e', du:'70–80 Min', rp:'RPE 7–9',  rr:'6–15 Wdh', lg:'', ex:[] },
  so:{ lb:'SO · Zone 2',  ti:'Aerobe Grundlage',          ac:'#2e9e6a', du:'45–60 Min', rp:'RPE 3–4',  rr:'—',        lg:'', ex:[] }
};

/* Volumen: [Muskelgruppe, MO, MI, FR, SA, Synergisten, MAV-min, MAV-max, Notiz] */
export const VOL = [
  ['Vord. Schulter', 4, 0, 0, 2, 4,  6, 12, ''],
  ['Seitl. Schulter',6, 0, 0, 2, 0, 12, 20, ''],
  ['Hint. Schulter', 2, 0, 0, 0, 4, 10, 20, 'inkl. T-Bar Rudern Upper A/B'],
  ['Brust',          0, 4, 0, 6, 0, 10, 22, ''],
  ['Rücken (Lat)',   0, 5, 0, 5, 0, 10, 22, ''],
  ['Bizeps',         4, 2, 0, 2, 4,  8, 20, ''],
  ['Trizeps',        4, 2, 0, 2, 4,  8, 20, ''],
  ['Quadrizeps',     0, 0, 4, 0, 0,  8, 18, 'bewusst unter MAV — Sportlast'],
  ['Hamstrings',     0, 0, 4, 0, 0,  6, 16, 'bewusst unter MAV — Sportlast'],
  ['Waden',          0, 0, 2, 0, 0,  8, 16, 'bewusst unter MAV — Sportlast'],
  ['Core',           3, 0, 2, 0, 0,  6, 16, '']
];

export const MACROS = [
  { v:'3200', l:'kcal',    s:'≈ +400 Überschuss', c:'#c94535' },
  { v:'180g', l:'Protein', s:'≈ 2,2 g/kg',        c:'#3a7bbf' },
  { v:'390g', l:'Carbs',   s:'≈ 4,8 g/kg',        c:'#b8922e' },
  { v:'95g',  l:'Fett',    s:'≈ 1,2 g/kg',        c:'#2e9e6a' }
];

export const MEALS = [];   // [{d:'MO', m:'…', t:'…', tags:['…'], c:'#…'}]
export const FOODTIPS = []; // [{i:'🥛', t:'…'}]
export const TIMING = [];   // [{i:'⏱', t:'…'}]
export const SLEEP = [];    // [{d:'MO', m:'22:30 → 07:00', t:'…', tags:[], c:'#…'}]
export const SLEEPTIPS = [];// [{i:'🌙', t:'…'}]
export const MOBSEQ = [];   // [{t:'Hüftbeuger', d:'…'}]
export const MOBMILES = []; // [{i:'📍', t:'…'}]
export const EVENING = [];  // [{time:'T-120', title:'…', c:'#…', b:['…']}]
export const MORNING = [];  // ['Schritt 1', …]
