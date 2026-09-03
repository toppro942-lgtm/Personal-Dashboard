import { all, get, run, tx } from '../db.js';
import { bad, notFound } from '../lib/http.js';
import { sha256, randomId } from '../lib/crypto.js';
import { parseCsv, detectDelimiter, mapRows, PROFILES } from '../lib/csv.js';

const isDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d ?? '');
const monthRange = m => {
  if (!/^\d{4}-\d{2}$/.test(m ?? '')) throw bad('month=YYYY-MM erwartet');
  const [y, mo] = m.split('-').map(Number);
  return [`${m}-01`, new Date(Date.UTC(y, mo, 0)).toISOString().slice(0, 10)];
};

export const accounts   = () => all('SELECT * FROM fin_account ORDER BY name');
export const categories = () => all('SELECT * FROM fin_category ORDER BY kind, name');

export const addAccount = b => {
  if (!b.name?.trim()) throw bad('name erforderlich');
  return run('INSERT INTO fin_account (name, kind, currency, opening_cents) VALUES (?, ?, ?, ?)',
    b.name.trim(), b.kind || 'giro', b.currency || 'EUR', Math.round(Number(b.opening_cents) || 0)).lastInsertRowid;
};

export const upsertCategory = b => {
  if (!b.name?.trim()) throw bad('name erforderlich');
  if (b.id) {
    run('UPDATE fin_category SET name = ?, kind = ?, budget_cents = ?, color = ? WHERE id = ?',
      b.name.trim(), b.kind || 'variable', Math.round(Number(b.budget_cents) || 0), b.color || '#4f4f4f', b.id);
    return b.id;
  }
  return run('INSERT INTO fin_category (name, kind, budget_cents, color) VALUES (?, ?, ?, ?)',
    b.name.trim(), b.kind || 'variable', Math.round(Number(b.budget_cents) || 0), b.color || '#4f4f4f').lastInsertRowid;
};

/* Regelbasierte Kategorisierung: erste passende Regel gewinnt.
   Bewusst simpel — deterministisch und nachvollziehbar statt Heuristik. */
const rules = () => all('SELECT r.pattern, r.category_id FROM fin_rule r');
const classify = (t, rs = rules()) => {
  const hay = `${t.counterparty} ${t.purpose}`.toLowerCase();
  return rs.find(r => hay.includes(r.pattern.toLowerCase()))?.category_id ?? null;
};

export const addRule = b => {
  if (!b.pattern?.trim() || !b.category_id) throw bad('pattern und category_id erforderlich');
  const id = run('INSERT INTO fin_rule (pattern, category_id) VALUES (?, ?)', b.pattern.trim(), b.category_id).lastInsertRowid;
  if (b.applyToExisting) {
    for (const t of all('SELECT id, counterparty, purpose FROM fin_tx WHERE category_id IS NULL'))
      if (`${t.counterparty} ${t.purpose}`.toLowerCase().includes(b.pattern.trim().toLowerCase()))
        run('UPDATE fin_tx SET category_id = ? WHERE id = ?', b.category_id, t.id);
  }
  return id;
};

const hashOf = t => sha256([t.account_id, t.booked_on, t.amount_cents, t.counterparty, t.purpose].join('|'));

export function addTx(b) {
  if (!isDay(b.booked_on)) throw bad('booked_on=YYYY-MM-DD erwartet');
  const cents = Math.round(Number(b.amount_cents));
  if (!Number.isFinite(cents)) throw bad('amount_cents (Integer) erwartet');
  const account_id = b.account_id ?? get('SELECT id FROM fin_account ORDER BY id LIMIT 1')?.id;
  if (!account_id) throw bad('Kein Konto vorhanden');
  const t = { account_id, booked_on: b.booked_on, amount_cents: cents,
              counterparty: (b.counterparty || '').trim(), purpose: (b.purpose || '').trim() };
  return run(`INSERT INTO fin_tx (account_id, category_id, booked_on, amount_cents, counterparty, purpose, source, dedupe_hash)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    t.account_id, b.category_id ?? classify(t), t.booked_on, t.amount_cents,
    /* Manuelle Buchungen bekommen einen Zufallssuffix: zwei identische Barzahlungen
       am selben Tag sind legitim und dürfen nicht am UNIQUE-Index scheitern. */
    t.counterparty, t.purpose, b.source || 'manual', `${hashOf(t)}:${randomId(6)}`).lastInsertRowid;
}

export const listTx = q => {
  const from = isDay(q.from) ? q.from : '0000-01-01', to = isDay(q.to) ? q.to : '9999-12-31';
  return all(`SELECT t.*, c.name AS category, c.color FROM fin_tx t
              LEFT JOIN fin_category c ON c.id = t.category_id
              WHERE t.booked_on BETWEEN ? AND ?
              ORDER BY t.booked_on DESC, t.id DESC LIMIT ?`,
    from, to, Math.min(Number(q.limit) || 200, 1000));
};

export const setCategory = (id, category_id) => {
  if (!run('UPDATE fin_tx SET category_id = ? WHERE id = ?', category_id || null, id).changes) throw notFound('Buchung');
};

export const removeTx = id => {
  if (!run('DELETE FROM fin_tx WHERE id = ?', id).changes) throw notFound('Buchung');
};

/* Import: Dedupe über Hash aus Konto+Datum+Betrag+Gegenpartei+Zweck.
   Überlappende Exporte desselben Zeitraums erzeugen damit keine Dubletten. */
export function importCsv({ text, profile = 'generic', account_id, delimiter }) {
  if (!text?.trim()) throw bad('CSV-Text erforderlich');
  if (!PROFILES[profile]) throw bad(`Unbekanntes Profil: ${profile}`);
  const acc = account_id ?? get('SELECT id FROM fin_account ORDER BY id LIMIT 1')?.id;
  if (!acc) throw bad('Kein Konto vorhanden');
  const mapped = mapRows(parseCsv(text, delimiter || detectDelimiter(text)), profile);
  if (mapped.error) throw bad(mapped.error);
  const rs = rules();
  return tx(() => {
    let imported = 0, duplicates = 0;
    for (const r of mapped.rows) {
      const t = { ...r, account_id: acc };
      const hash = hashOf(t);
      if (get('SELECT 1 AS x FROM fin_tx WHERE dedupe_hash = ?', hash)) { duplicates++; continue; }
      run(`INSERT INTO fin_tx (account_id, category_id, booked_on, amount_cents, counterparty, purpose, source, dedupe_hash)
           VALUES (?, ?, ?, ?, ?, ?, 'csv', ?)`,
        acc, classify(t, rs), t.booked_on, t.amount_cents, t.counterparty, t.purpose, hash);
      imported++;
    }
    return { imported, duplicates, unparsable: mapped.skipped.length, profile };
  });
}

export function summary(month) {
  const [from, to] = monthRange(month);
  /* Einnahmen/Ausgaben MÜSSEN pro Buchung getrennt werden, nicht pro Kategorie-Saldo:
     sonst verrechnen sich Gegenbuchungen innerhalb einer Kategorie zu einem
     Nettobetrag und die Ausgabenseite verschwindet. */
  const rows = all(`SELECT COALESCE(c.name, 'Nicht kategorisiert') AS category, c.kind, c.color, c.budget_cents,
                           SUM(t.amount_cents) AS cents,
                           SUM(CASE WHEN t.amount_cents < 0 THEN -t.amount_cents ELSE 0 END) AS spent_cents,
                           SUM(CASE WHEN t.amount_cents > 0 THEN  t.amount_cents ELSE 0 END) AS earned_cents,
                           COUNT(*) AS n
                    FROM fin_tx t LEFT JOIN fin_category c ON c.id = t.category_id
                    WHERE t.booked_on BETWEEN ? AND ? GROUP BY c.id ORDER BY spent_cents DESC`, from, to);
  const tot = get(`SELECT COALESCE(SUM(CASE WHEN amount_cents > 0 THEN amount_cents END), 0) AS income,
                          COALESCE(SUM(CASE WHEN amount_cents < 0 THEN amount_cents END), 0) AS expense
                   FROM fin_tx WHERE booked_on BETWEEN ? AND ?`, from, to);
  const balance = get('SELECT COALESCE(SUM(amount_cents),0) AS c FROM fin_tx').c
                + get('SELECT COALESCE(SUM(opening_cents),0) AS c FROM fin_account').c;
  return {
    month, from, to,
    income_cents: tot.income, expense_cents: tot.expense,
    net_cents: tot.income + tot.expense, balance_cents: balance,
    savings_rate: tot.income > 0 ? Math.round((tot.income + tot.expense) / tot.income * 1000) / 10 : null,
    categories: rows
  };
}
