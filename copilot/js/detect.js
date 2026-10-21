// Heuristische Fragenerkennung für Live-Transkripte (DE/EN) – unabhängig von Satzzeichen,
// da die Spracherkennung kaum welche liefert. False Positives kosten nur einen API-Call.
const END = '(?![\\p{L}])'; // Wortgrenze inkl. Umlaute/ß (\b ist in JS nur ASCII)
const rx = (words, flags = 'iu') => new RegExp(`^(?:${words})${END}`, flags);

const FILLER = new RegExp(
  `^(?:(?:also|okay|ok|gut|so|und|ja|jetzt|nun|na|genau|dann|aber|hm+|äh+m?|well|and|now|right|alright)${END}[\\s,.]*)+`, 'iu');

const W_DE = rx('wer|wen|wem|wessen|was|wann|wo|woher|wohin|woran|worauf|woraus|wobei|wodurch|wofür|wogegen|womit|wonach|worin|worum|worüber|wovon|wovor|wozu|warum|wieso|weshalb|weswegen|wie|welche[rsmn]?|inwiefern|inwieweit');
const W_EN = rx('what|why|how|who|whom|whose|when|where|which');
const V1 = rx('ist|sind|kann|kannst|könnt|könnte|könnten|gibt|weiß|wisst|stimmt|würde|würdet|wäre|muss|soll|sollte|darf|habt|hast|meint|glaubt|findet|denkt|is|are|can|could|do|does|did|would|should');
const PROMPT = /(erklär|erläuter|nenn(?:t|e|en)?\s|beschreib|begründ|definier|vergleich|beurteil|bewert|analysier|interpretier|fass\S* zusammen|wer kann|wer weiß|wer möchte|weiß jemand|kann (?:mir )?jemand|hat jemand|fällt (?:euch|jemandem)|was meint ihr|was denkt ihr|was sagt ihr|explain|describe|any ideas|anyone|what do you think)/iu;

export function isQuestion(text) {
  const s = text.trim();
  if (s.split(/\s+/).length < 3) return false;
  if (/\?\s*$/.test(s)) return true;
  const head = s.replace(FILLER, '');
  return W_DE.test(head) || W_EN.test(head) || V1.test(head) || PROMPT.test(s);
}
