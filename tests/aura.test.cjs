/* Browser-Tests fuer dashboard.html.
   Aufruf: node tests/aura.test.cjs <fall>   (Faelle: syntax regression persist score habits nodb mobile all)
   Die Artifact-Datenbank wird im Browser durch einen Nachbau derselben
   Schnittstelle ersetzt (doc/collection, get/set/update, orderBy/limit/where),
   der seinen Stand in localStorage haelt -- so ueberleben Daten ein Neuladen. */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

const FILE = path.resolve(__dirname, '..', 'dashboard.html');
const URL = 'file://' + FILE;
const ALL_IDS = ['train','mob','protein','water','casein','sleep','journal','plan','caff','screen','read',
                 'wake','skinam','hair','skinpm','bed','light','release','outside','grat','breath'];
const BODY_MIND = ['train','mob','protein','water','casein','sleep','journal','plan','caff','screen','read'];

const MOCK = `
(() => {
  const KEY = '__mockdb';
  const load = () => JSON.parse(localStorage.getItem(KEY) || '{}');
  const save = o => localStorage.setItem(KEY, JSON.stringify(o));
  const deepFreeze = o => { if (o && typeof o === 'object') { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
  const snap = (p, o) => ({ id: p.split('/').pop(), exists: p in o,
    data: () => (p in o ? deepFreeze(JSON.parse(JSON.stringify(o[p]))) : undefined), metadata:{fromCache:false,hasPendingWrites:false} });
  const merge = (a, b) => { for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) merge(a[k], v);
    else a[k] = JSON.parse(JSON.stringify(v)); } return a; };
  const docRef = p => ({ id: p.split('/').pop(), path: p,
    get: async () => snap(p, load()),
    set: async d => { if (!d || typeof d !== 'object' || Array.isArray(d)) throw {code:'invalid_argument',message:'body'};
                      const o = load(); o[p] = JSON.parse(JSON.stringify(d)); save(o); },
    update: async d => { const o = load(); if (!(p in o)) throw {code:'invalid_argument',message:'missing'}; merge(o[p], d); save(o); },
    delete: async () => { const o = load(); delete o[p]; save(o); } });
  const query = (c, st) => ({
    where: (f, op, v) => query(c, {...st, w:[...(st.w||[]), [f, op, v]]}),
    orderBy: (f, dir='asc') => query(c, {...st, o:[f, dir]}),
    limit: n => query(c, {...st, l:n}),
    get: async () => {
      const o = load();
      let ks = Object.keys(o).filter(k => k.startsWith(c + '/') && k.split('/').length === c.split('/').length + 1);
      if (st.w) ks = ks.filter(k => st.w.every(([f, op, v]) => { const x = o[k][f];
        return op === '==' ? x === v : op === '>=' ? x >= v : op === '<=' ? x <= v : op === '>' ? x > v : op === '<' ? x < v : true; }));
      ks.sort();
      if (st.o) { const [f, dir] = st.o; ks.sort((a, b) => (o[a][f] < o[b][f] ? -1 : o[a][f] > o[b][f] ? 1 : 0) * (dir === 'desc' ? -1 : 1)); }
      if (st.l) ks = ks.slice(0, st.l);
      const docs = ks.map(k => snap(k, o));
      return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata:{fromCache:false,hasPendingWrites:false} };
    } });
  const db = { doc: docRef, collection: c => ({ ...query(c, {}), path: c, doc: id => docRef(c + '/' + (id || Math.random().toString(36).slice(2))),
    add: async d => { const r = docRef(c + '/' + Math.random().toString(36).slice(2)); await r.set(d); return r; } }) };
  window.claude = { use: async name => (name === 'db' ? db : null) };
})();`;

const results = [];
const ok = (name, cond, info = '') => { if (!cond) throw new Error(`${name} fehlgeschlagen ${info}`); };
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

async function open(browser, { mock = true, seed = null, width = 1100 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  /* Fonts nicht aus dem Netz laden: leeres CSS statt Netzwerkfehler im Log. */
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (seed) await ctx.addInitScript(s => { if (!localStorage.getItem('__seeded')) { localStorage.setItem('__mockdb', s); localStorage.setItem('__seeded', '1'); } }, JSON.stringify(seed));
  if (mock) await ctx.addInitScript(MOCK);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => !document.getElementById('austat').textContent.includes('geladen'), null, { timeout: 15000 });
  return { ctx, page, errors };
}

const CASES = {
  async syntax() {
    const html = fs.readFileSync(FILE, 'utf8');
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    ok('scripts vorhanden', scripts.length >= 1);
    scripts.forEach((src, i) => new vm.Script(src, { filename: `inline-${i}.js` }));
    ok('ids eindeutig', (() => { const ids = [...html.matchAll(/\sid="([^"$]+)"/g)].map(m => m[1]);
      const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) console.log('doppelt:', dup); return !dup.length; })());
  },

  async regression(browser) {
    const { ctx, page, errors } = await open(browser);
    await page.waitForFunction(() => document.querySelectorAll('#hcards .hcard').length === 6, null, { timeout: 10000 });
    const tabs = await page.$$eval('.tabs .tb', bs => bs.map(b => b.textContent.trim()));
    ok('12 Tabs', tabs.length === 12, JSON.stringify(tabs));
    for (let i = 0; i < tabs.length; i++) await page.click(`.tabs .tb >> nth=${i}`);
    await page.click('.tabs .tb >> text=Trainingstage');
    const m = await page.evaluate(() => ({
      day: document.querySelectorAll('#dc .sc').length, dbar: document.querySelectorAll('#dbar .db').length,
      vol: document.querySelectorAll('#vtb tr').length, meals: document.querySelectorAll('#mealgrid .mday').length,
      sleep: document.querySelectorAll('#sgrid .mday').length, mob: document.querySelectorAll('#mobseq .ec').length,
      eve: document.querySelectorAll('#evetl .tlitem').length, mor: document.querySelectorAll('#morlist .morrow').length,
      groom: document.querySelectorAll('#groomlist .gsec').length, fkpi: document.querySelectorAll('#fkpi .kpi').length,
      wkpi: document.querySelectorAll('#wkpi .kpi').length, planOn: document.getElementById('t-plan').classList.contains('on') }));
    ok('Plan-Tabs', m.day === 1 && m.dbar === 7 && m.vol === 15 && m.meals === 7 && m.sleep === 7 && m.mob === 8
      && m.eve === 7 && m.mor === 12 && m.groom === 7 && m.fkpi === 4 && m.wkpi === 4 && m.planOn, JSON.stringify(m));
    /* Health-Eintrag speichern und im Aura-Schlafhaken wiederfinden. */
    await page.click('.tabs .tb >> text=Health');
    await page.fill('#h2', '9:30'); await page.click('#hform button[type=submit]');
    await page.waitForFunction(() => document.querySelector('#hcards').textContent.includes('9 h 30 min'));
    await page.click('.tabs .tb >> text=Aura');
    const sleepAuto = await page.$eval('#autasks [data-id="sleep"]', b => ({ c: b.getAttribute('aria-checked'), t: b.textContent }));
    ok('Schlaf aus Health', sleepAuto.c === 'true' && sleepAuto.t.includes('Health'), JSON.stringify(sleepAuto));
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
    return m;
  },

  async persist(browser) {
    const { ctx, page, errors } = await open(browser);
    ok('Aura ist Starttab', await page.$eval('#t-aura', e => e.classList.contains('on')));
    const n = await page.$$eval('#autasks .autask', b => b.length);
    ok('21 Aufgaben', n === 21, String(n));
    await page.click('#autasks [data-id="journal"]');
    await page.waitForFunction(() => { const b = document.querySelector('#autasks [data-id="journal"]');
      return b && b.getAttribute('aria-checked') === 'true' && !b.disabled; });
    const meta = await page.textContent('#aumeta');
    ok('Heute 1/21', meta.includes('Heute 1/21'), meta);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('__mockdb')));
    const t = iso(new Date());
    ok('in DB', stored['aura/m' + t.slice(0, 7)]?.days?.[t]?.t?.journal === true, JSON.stringify(stored['aura/m' + t.slice(0, 7)]));
    await page.reload();
    await page.waitForFunction(() => !document.getElementById('austat').textContent.includes('geladen'));
    ok('nach Reload', await page.$eval('#autasks [data-id="journal"]', b => b.getAttribute('aria-checked')) === 'true');
    /* Abhaken wieder aufheben, gestern nachtragen. */
    await page.click('#autasks [data-id="journal"]');
    await page.waitForFunction(() => document.querySelector('#autasks [data-id="journal"]').getAttribute('aria-checked') === 'false');
    await page.click('#auprev');
    await page.click('#autasks [data-id="grat"]');
    await page.waitForFunction(() => { const b = document.querySelector('#autasks [data-id="grat"]'); return b.getAttribute('aria-checked') === 'true' && !b.disabled; });
    const s2 = await page.evaluate(() => JSON.parse(localStorage.getItem('__mockdb')));
    const y = addDays(-1);
    ok('gestern gespeichert', s2['aura/m' + y.slice(0, 7)]?.days?.[y]?.t?.grat === true);
    ok('heute false', s2['aura/m' + t.slice(0, 7)]?.days?.[t]?.t?.journal === false);
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
  },

  async score(browser) {
    const mk = ids => { const db = {}; for (let i = 1; i <= 14; i++) { const d = addDays(-i), m = 'aura/m' + d.slice(0, 7);
      db[m] = db[m] || { month: d.slice(0, 7), days: {} }; db[m].days[d] = { t: Object.fromEntries(ids.map(x => [x, true])) }; } return db; };
    const read = async page => page.evaluate(() => ({ ring: document.querySelector('#auring .num').textContent,
      lvl: document.querySelector('#auring .lvl').textContent, meta: document.getElementById('aumeta').textContent,
      pil: [...document.querySelectorAll('#aupil .aupv')].map(x => x.textContent),
      heat: [...document.querySelectorAll('#auheat .auc')].filter(c => c.style.background).length }));

    let o = await open(browser, { seed: mk(ALL_IDS) });
    let r = await read(o.page);
    ok('voll = 1000', r.ring === '1000' && r.lvl === 'UNAUFHALTSAM' && r.pil.join() === '100,100,100,100', JSON.stringify(r));
    ok('Serie 14', r.meta.includes('Serie 14 Tage'), r.meta);
    ok('Heatmap', r.heat === 15, String(r.heat));   // 14 Tage + heute
    ok('Delta', /mit heute −\d+/.test(r.meta), r.meta);  // heute nichts erledigt senkt die Projektion
    ok('keine Fehler', !o.errors.length, o.errors.join('\n'));
    await o.ctx.close();

    o = await open(browser, { seed: mk(BODY_MIND) });
    r = await read(o.page);
    ok('halb = 500', r.ring === '500' && r.lvl === 'STABIL' && r.pil.join() === '100,100,0,0', JSON.stringify(r));
    ok('Serie 0', r.meta.includes('Serie 0 Tage'), r.meta);
    ok('keine Fehler', !o.errors.length, o.errors.join('\n'));
    await o.ctx.close();

    o = await open(browser);
    r = await read(o.page);
    ok('leer', r.ring === '–' && r.lvl === 'NOCH KEINE DATEN' && r.heat === 0, JSON.stringify(r));
    await o.ctx.close();
    return 'voll=1000, halb=500, leer=–';
  },

  async habits(browser) {
    const { ctx, page, errors } = await open(browser);
    await page.fill('#auhname', 'Englisch-Podcast <b>C1</b>');
    await page.selectOption('#auhpil', 'mind');
    await page.click('#auhform button[type=submit]');
    await page.waitForSelector('#auhabits [data-hcheck]');
    ok('Name escaped', (await page.textContent('#auhabits .aucard b')) === 'Englisch-Podcast <b>C1</b>');
    const mindN = await page.$$eval('#autasks .aupcol', cs => cs[1].querySelectorAll('.autask').length);
    ok('Geist 6 Aufgaben', mindN === 6, String(mindN));
    await page.click('#auhabits [data-hcheck]');
    await page.waitForFunction(() => document.querySelector('#auhabits [data-hcheck]').classList.contains('on'));
    ok('1/22', (await page.textContent('#auhabits .aubig')).replace(/\s/g, '') === '1/22Tage');
    /* Ein Tipp auf Loeschen darf nichts loeschen. */
    await page.click('#auhabits [data-hdel]');
    ok('armiert', (await page.textContent('#auhabits [data-hdel]')) === 'Wirklich löschen?');
    ok('noch da', (await page.$$('#auhabits .aucard')).length === 1);
    await page.click('#auhabits [data-hdel]');
    await page.waitForFunction(() => !document.querySelector('#auhabits .aucard'));

    await page.click('#auvsug [data-sug="Snooze-Taste"]');
    ok('Vorschlag', (await page.inputValue('#auvname')) === 'Snooze-Taste');
    await page.click('#auvform button[type=submit]');
    await page.waitForSelector('#auvices [data-vrel]');
    ok('0 Tage', (await page.textContent('#auvices .aubig')).replace(/\s/g, '') === '0Tagefrei');
    ok('Vorschlag weg', !(await page.$('#auvsug [data-sug="Snooze-Taste"]')));
    await page.click('#auvices [data-vrel]'); await page.click('#auvices [data-vrel]');
    await page.waitForFunction(() => document.querySelector('#auvices .aucard .hmeta:last-of-type')?.textContent.includes('1 Rückfall')
      || document.querySelector('#auvices').textContent.includes('1 Rückfall'));
    await page.click('#auvices [data-vdel]'); await page.click('#auvices [data-vdel]');
    await page.waitForFunction(() => !document.querySelector('#auvices .aucard'));
    const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('__mockdb'))['aura/config']);
    ok('config leer', cfg.habits.length === 0 && cfg.vices.length === 0, JSON.stringify(cfg));
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
  },

  async nodb(browser) {
    const { ctx, page, errors } = await open(browser, { mock: false });
    ok('lokal', (await page.textContent('#austat')).includes('lokal'));
    await page.click('#autasks [data-id="read"]');
    await page.waitForFunction(() => { const b = document.querySelector('#autasks [data-id="read"]'); return b.getAttribute('aria-checked') === 'true' && !b.disabled; });
    await page.reload();
    await page.waitForFunction(() => !document.getElementById('austat').textContent.includes('geladen'));
    ok('lokal persistent', await page.$eval('#autasks [data-id="read"]', b => b.getAttribute('aria-checked')) === 'true');
    ok('Health-Hinweis', (await page.textContent('#hbody')).includes('nicht verfügbar'));
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
  },

  async mobile(browser) {
    const { ctx, page, errors } = await open(browser, { width: 390 });
    await page.fill('#auhname', 'Ein sehr langer Gewohnheitsname ohne Umbruchmöglichkeiten_xxxxxxxxxxxxxxxx');
    await page.click('#auhform button[type=submit]');
    await page.waitForSelector('#auhabits [data-hcheck]');
    const w = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    ok('kein Querscrollen', w.sw <= w.cw, JSON.stringify(w));
    const others = {};
    for (const t of ['Trainingstage','Health','Finanzen','Vermögen']) {
      await page.click(`.tabs .tb >> text=${t}`);
      others[t] = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    }
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
    return others;
  }
};

(async () => {
  const which = process.argv[2] || 'all';
  const names = which === 'all' ? Object.keys(CASES) : [which];
  if (!names.every(n => CASES[n])) { console.log('unbekannter Fall:', which); process.exit(2); }
  let browser;
  let failed = 0;
  try {
    browser = await pw.chromium.launch();
    for (const n of names) {
      try { const info = await CASES[n](browser); console.log(`PASS ${n}${info ? ' ' + JSON.stringify(info) : ''}`); }
      catch (e) { failed++; console.log(`FAIL ${n}: ${e.message}`); }
    }
  } finally { if (browser) await browser.close(); }
  process.exit(failed ? 1 : 0);
})();
