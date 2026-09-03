import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.js';

mkdirSync(dirname(config.dbPath), { recursive: true });

export const db = new DatabaseSync(config.dbPath);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');

/* Geldbeträge grundsätzlich als INTEGER-Cent — Float-Arithmetik ist bei
   Finanzdaten eine Fehlerquelle (0.1+0.2 !== 0.3). */
db.exec(`
CREATE TABLE IF NOT EXISTS health_metric (
  id         INTEGER PRIMARY KEY,
  day        TEXT NOT NULL,               -- YYYY-MM-DD (lokal)
  metric     TEXT NOT NULL,               -- steps | resting_hr | sleep_minutes | active_kcal | weight_kg | hrv_ms
  value      REAL NOT NULL,
  unit       TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT 'manual',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(day, metric, source)
);
CREATE INDEX IF NOT EXISTS ix_hm_day ON health_metric(day);

CREATE TABLE IF NOT EXISTS oauth_token (
  provider      TEXT PRIMARY KEY,
  access_enc    TEXT,
  refresh_enc   TEXT,
  expires_at    INTEGER NOT NULL DEFAULT 0,
  scope         TEXT NOT NULL DEFAULT '',
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_state (
  state      TEXT PRIMARY KEY,
  verifier   TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS fin_account (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  kind     TEXT NOT NULL DEFAULT 'giro',  -- giro | cash | savings | depot
  currency TEXT NOT NULL DEFAULT 'EUR',
  opening_cents INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fin_category (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  kind          TEXT NOT NULL DEFAULT 'variable', -- income | fixed | variable | saving
  budget_cents  INTEGER NOT NULL DEFAULT 0,
  color         TEXT NOT NULL DEFAULT '#4f4f4f'
);

CREATE TABLE IF NOT EXISTS fin_tx (
  id           INTEGER PRIMARY KEY,
  account_id   INTEGER NOT NULL REFERENCES fin_account(id) ON DELETE CASCADE,
  category_id  INTEGER REFERENCES fin_category(id) ON DELETE SET NULL,
  booked_on    TEXT NOT NULL,             -- YYYY-MM-DD
  amount_cents INTEGER NOT NULL,          -- negativ = Ausgabe
  counterparty TEXT NOT NULL DEFAULT '',
  purpose      TEXT NOT NULL DEFAULT '',
  source       TEXT NOT NULL DEFAULT 'manual',
  dedupe_hash  TEXT UNIQUE,               -- verhindert Doppel-Import derselben CSV
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_tx_date ON fin_tx(booked_on);
CREATE INDEX IF NOT EXISTS ix_tx_cat  ON fin_tx(category_id);

CREATE TABLE IF NOT EXISTS fin_rule (
  id          INTEGER PRIMARY KEY,
  pattern     TEXT NOT NULL,              -- case-insensitiver Teilstring auf counterparty+purpose
  category_id INTEGER NOT NULL REFERENCES fin_category(id) ON DELETE CASCADE
);
`);

const seed = db.prepare('SELECT COUNT(*) AS n FROM fin_category').get().n;
if (seed === 0) {
  const ins = db.prepare('INSERT INTO fin_category (name, kind, budget_cents, color) VALUES (?, ?, ?, ?)');
  for (const c of [
    ['Einkommen', 'income', 0, '#2e9e6a'], ['Sparen', 'saving', 0, '#3a7bbf'],
    ['Abos', 'fixed', 2000, '#7a5ab5'],    ['Handy/Internet', 'fixed', 1500, '#7a5ab5'],
    ['Lebensmittel', 'variable', 12000, '#b8922e'], ['Supplements', 'variable', 4000, '#b86830'],
    ['Fitnessstudio', 'fixed', 3000, '#c94535'],    ['Mobilität', 'variable', 3000, '#3a7bbf'],
    ['Freizeit', 'variable', 5000, '#b8922e'],      ['Sonstiges', 'variable', 0, '#4f4f4f']
  ]) ins.run(...c);
}
if (db.prepare('SELECT COUNT(*) AS n FROM fin_account').get().n === 0) {
  db.prepare('INSERT INTO fin_account (name, kind) VALUES (?, ?)').run('Girokonto', 'giro');
}

export const all = (sql, ...p) => db.prepare(sql).all(...p);
export const get = (sql, ...p) => db.prepare(sql).get(...p);
export const run = (sql, ...p) => db.prepare(sql).run(...p);
export const tx  = fn => { db.exec('BEGIN'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } };
