/* RFC4180-toleranter Parser mit konfigurierbarem Delimiter.
   Deutsche Bank-Exporte: Semikolon, CP1252/UTF-8, Komma-Dezimaltrennung, DD.MM.YYYY. */
export function parseCsv(text, delim = ';') {
  const rows = []; let row = [], field = '', quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(f => f.trim() !== ''));
}

export const detectDelimiter = text => {
  const line = text.split('\n').find(l => l.trim()) || '';
  return [';', ',', '\t'].sort((a, b) => line.split(b).length - line.split(a).length)[0];
};

/* "1.234,56" | "-12,34" | "1234.56" -> Integer-Cent. Kein parseFloat auf Geld. */
export function toCents(raw) {
  let s = String(raw ?? '').replace(/[\s€"']/g, '');
  if (!s) return null;
  const neg = s.startsWith('-') || /^\(.*\)$/.test(s);
  s = s.replace(/[()+-]/g, '');
  const lastComma = s.lastIndexOf(','), lastDot = s.lastIndexOf('.');
  if (lastComma > lastDot)      s = s.replace(/\./g, '').replace(',', '.');   // deutsch
  else if (lastDot > lastComma) s = s.replace(/,/g, '');                       // englisch
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return (neg ? -1 : 1) * Math.round(n * 100);
}

export function toIsoDate(raw) {
  const s = String(raw ?? '').trim();
  let m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : null;
}

/* Spalten-Profile. Header-Matching case-insensitiv per Teilstring — Banken
   ändern Bezeichner regelmäßig, exakte Gleichheit wäre zu spröde. */
export const PROFILES = {
  generic:   { date: ['buchungstag', 'datum', 'date', 'valuta'], amount: ['betrag', 'amount', 'umsatz'],
               party: ['beguenstigter', 'begünstigter', 'zahlungspflichtiger', 'auftraggeber', 'name', 'payee'],
               purpose: ['verwendungszweck', 'buchungstext', 'purpose', 'description', 'reference'] },
  dkb:       { date: ['buchungsdatum', 'buchungstag'], amount: ['betrag'],
               party: ['zahlungsempfänger*in', 'zahlungspflichtige*r', 'auftraggeber'], purpose: ['verwendungszweck'] },
  sparkasse: { date: ['buchungstag'], amount: ['betrag'],
               party: ['beguenstigter/zahlungspflichtiger'], purpose: ['verwendungszweck'] },
  n26:       { date: ['booking date', 'datum'], amount: ['amount (eur)', 'amount'],
               party: ['partner name', 'payee'], purpose: ['payment reference', 'reference'] }
};

const findCol = (headers, names) =>
  headers.findIndex(h => names.some(n => h.toLowerCase().trim().includes(n)));

export function mapRows(rows, profileName = 'generic') {
  if (rows.length < 2) return { error: 'CSV enthält keine Datenzeilen' };
  const p = PROFILES[profileName] || PROFILES.generic;
  /* Header ist bei Sparkasse/DKB nicht zwingend Zeile 0 (Meta-Zeilen davor). */
  let hi = rows.findIndex(r => findCol(r, p.date) >= 0 && findCol(r, p.amount) >= 0);
  if (hi < 0) return { error: `Keine Spalten für Datum/Betrag gefunden (Profil "${profileName}")` };
  const h = rows[hi];
  const ci = { date: findCol(h, p.date), amount: findCol(h, p.amount), party: findCol(h, p.party), purpose: findCol(h, p.purpose) };
  const out = [], skipped = [];
  for (const r of rows.slice(hi + 1)) {
    const booked_on = toIsoDate(r[ci.date]);
    const amount_cents = toCents(r[ci.amount]);
    if (!booked_on || amount_cents === null) { skipped.push(r.join(';').slice(0, 120)); continue; }
    out.push({
      booked_on, amount_cents,
      counterparty: (ci.party >= 0 ? r[ci.party] : '')?.trim() || '',
      purpose: (ci.purpose >= 0 ? r[ci.purpose] : '')?.trim() || ''
    });
  }
  return { rows: out, skipped, headerRow: hi };
}
