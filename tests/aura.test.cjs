/* Browser-Tests fuer dashboard.html.
   Aufruf: node tests/aura.test.cjs <fall>   (Faelle: syntax regression persist score habits nodb mobile all)
   Die Artifact-Datenbank wird im Browser durch einen Nachbau derselben
   Schnittstelle ersetzt (doc/collection, get/set/update, orderBy/limit/where),
   der seinen Stand in localStorage haelt -- so ueberleben Daten ein Neuladen.
   window.__dbDelay (ms) simuliert die Laufzeit einer echten Datenbankanfrage. */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

const FILE = process.env.DASH_FILE ? path.resolve(process.env.DASH_FILE) : path.resolve(__dirname, '..', 'dashboard.html');
const URL = 'file://' + FILE;
const ALL_IDS = ['train','mob','protein','water','casein','sleep','journal','plan','caff','screen','read',
                 'wake','skinam','hair','skinpm','bed','light','release','outside','grat','breath','hang'];
const BODY_MIND = ['train','mob','protein','water','casein','sleep','hang','journal','plan','caff','screen','read'];

const MOCK = `
(() => {
  const KEY = '__mockdb';
  const wait = () => new Promise(r => setTimeout(r, window.__dbDelay || 0));
  const load = () => JSON.parse(localStorage.getItem(KEY) || '{}');
  const save = o => localStorage.setItem(KEY, JSON.stringify(o));
  const deepFreeze = o => { if (o && typeof o === 'object') { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
  const snap = (p, o) => ({ id: p.split('/').pop(), exists: p in o,
    data: () => (p in o ? deepFreeze(JSON.parse(JSON.stringify(o[p]))) : undefined), metadata:{fromCache:false,hasPendingWrites:false} });
  const merge = (a, b) => { for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) merge(a[k], v);
    else a[k] = JSON.parse(JSON.stringify(v)); } return a; };
  const docRef = p => ({ id: p.split('/').pop(), path: p,
    get: async () => { await wait(); return snap(p, load()); },
    set: async d => { await wait(); if (!d || typeof d !== 'object' || Array.isArray(d)) throw {code:'invalid_argument',message:'body'};
                      const o = load(); o[p] = JSON.parse(JSON.stringify(d)); save(o); },
    update: async d => { await wait(); const o = load(); if (!(p in o)) throw {code:'invalid_argument',message:'missing'}; merge(o[p], d); save(o); },
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

async function open(browser, { mock = true, seed = null, width = 1100, delay = 0, touch = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: touch, isMobile: touch });
  if (delay) await ctx.addInitScript(d => { window.__dbDelay = d; }, delay);
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
    ok('Reihenfolge', tabs.slice(0, 6).join('|') === '✦ Aura|Me|Routine|Trainingstage|Mobility|Sporttest', tabs.join('|'));
    for (let i = 0; i < tabs.length; i++) await page.click(`.tabs .tb >> nth=${i}`);
    await page.click('.tabs .tb >> text=Trainingstage');
    const m = await page.evaluate(() => ({
      day: document.querySelectorAll('#dc .sc').length, dbar: document.querySelectorAll('#dbar .db').length,
      vol: document.querySelectorAll('#vtb tr').length, meals: document.querySelectorAll('#mealgrid .mday').length,
      sleep: document.querySelectorAll('#sgrid .mday').length, mob: document.querySelectorAll('#mobseq .ec').length,
      eve: document.querySelectorAll('#evetl .tlitem').length, mor: document.querySelectorAll('#morlist .morrow').length,
      groom: document.querySelectorAll('#groomlist .gsec').length, fkpi: document.querySelectorAll('#fkpi .kpi').length,
      wkpi: document.querySelectorAll('#wkpi .kpi').length, planOn: document.getElementById('t-plan').classList.contains('on') }));
    ok('Plan-Tabs', m.day === 1 && m.dbar === 7 && m.vol === 15 && m.meals === 7 && m.sleep === 7 && m.mob === 9
      && m.eve === 8 && m.mor === 12 && m.groom === 7 && m.fkpi === 4 && m.wkpi === 4 && m.planOn, JSON.stringify(m));
    /* Health-Eintrag speichern und im Aura-Schlafhaken wiederfinden. */
    await page.click('.tabs .tb >> text=Health');
    await page.fill('#h2', '9:30'); await page.click('#hform button[type=submit]');
    await page.waitForFunction(() => document.querySelector('#hcards').textContent.includes('9 h 30 min'));
    await page.click('.tabs .tb >> text=Aura');
    const sleepAuto = await page.$eval('#autasks [data-id="sleep"]', b => ({ c: b.getAttribute('aria-checked'), t: b.textContent }));
    ok('Schlaf aus Health', sleepAuto.c === 'true' && sleepAuto.t.includes('Health'), JSON.stringify(sleepAuto));
    const eve = await page.$$eval('#evetl .tltime', e => e.map(x => x.textContent.trim()));
    ok('Abend-Zeiten', eve.join('|') === 'T-120 Min|T-90 Min|T-85 Min|T-60 Min|T-30 Min|T-30 Min|T-15 Min|T-0 Min', eve.join('|'));
    const bad = await page.$eval('#evetl', e => e.textContent);
    ok('kein Alttext', !bad.includes('T-25') && !bad.includes('T-75') && !bad.includes('T-45') && !bad.includes('Atemkontrolle'));
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
    return m;
  },

  async persist(browser) {
    const { ctx, page, errors } = await open(browser);
    ok('Aura ist Starttab', await page.$eval('#t-aura', e => e.classList.contains('on')));
    const n = await page.$$eval('#autasks .autask', b => b.length);
    const want = await page.evaluate(() => auDayTasks(AU.today, auInfos()).length);   // 21, an Hang-Tagen 22
    ok('Aufgaben', n === want && (n === 21 || n === 22), `${n}/${want}`);
    await page.click('#autasks [data-id="journal"]');
    await page.waitForFunction(() => { const b = document.querySelector('#autasks [data-id="journal"]');
      return b && b.getAttribute('aria-checked') === 'true' && AU.busy === 0 && AU.pend.size === 0; });
    const meta = await page.textContent('#aumeta');
    ok('Heute 1/n', meta.includes(`Heute 1/${want}`), meta);
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
    await page.waitForFunction(() => { const b = document.querySelector('#autasks [data-id="grat"]'); return b.getAttribute('aria-checked') === 'true' && AU.busy === 0 && AU.pend.size === 0; });
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
    ok('Start heute: kein Rückfall', await page.$eval('#auvices [data-vrel]', b => b.disabled && b.textContent.includes('ab heute')));
    await page.click('#auvices [data-vdel]'); await page.click('#auvices [data-vdel]');
    await page.waitForFunction(() => !document.querySelector('#auvices .aucard'));

    /* Rueckfall an einem Zaehler, der seit 5 Tagen laeuft; danach ist der
       Knopf fuer heute gesperrt -- Mehrfachtipps zaehlen nicht mehrfach. */
    const since = addDays(-5);
    await page.evaluate(s => { const o = JSON.parse(localStorage.getItem('__mockdb'));
      o['aura/config'].vices = [{ id:'v5', name:'Handy im Bett', start:s, since:s, resets:[], best:0 }];
      localStorage.setItem('__mockdb', JSON.stringify(o)); }, since);
    await page.reload();
    await page.waitForFunction(() => !document.getElementById('austat').textContent.includes('geladen'));
    ok('5 Tage', (await page.textContent('#auvices .aubig')).replace(/\s/g, '') === '5Tagefrei');
    await page.click('#auvices [data-vrel]');
    ok('Rückfall armiert', (await page.textContent('#auvices [data-vrel]')) === 'Zähler zurücksetzen?');
    await page.click('#auvices [data-vrel]');
    await page.waitForFunction(() => document.querySelector('#auvices [data-vrel]').textContent === 'Heute zurückgesetzt');
    ok('Rekord 5, 1 Rückfall', (await page.textContent('#auvices .aucard')).includes('Rekord 5 · 1 Rückfall'));
    ok('gesperrt', await page.$eval('#auvices [data-vrel]', b => b.disabled));
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
    await page.waitForFunction(() => { const b = document.querySelector('#autasks [data-id="read"]'); return b.getAttribute('aria-checked') === 'true' && AU.busy === 0 && AU.pend.size === 0; });
    await page.reload();
    await page.waitForFunction(() => !document.getElementById('austat').textContent.includes('geladen'));
    ok('lokal persistent', await page.$eval('#autasks [data-id="read"]', b => b.getAttribute('aria-checked')) === 'true');
    ok('Health-Hinweis', (await page.textContent('#hbody')).includes('nicht verfügbar'));
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
  },

  /* Echte Datenbank-Laufzeit (350 ms je Anfrage): Doppeltipp, schnelle
     Tippfolgen, Tippen waehrend des Speicherns und direkt nach dem Anlegen. */
  async latency(browser) {
    const { ctx, page, errors } = await open(browser, { delay: 350, width: 390, touch: true });
    const state = id => page.$eval(`#autasks [data-id="${id}"]`, b => b.getAttribute('aria-checked'));
    const stored = () => page.evaluate(() => { const t = new Date(), k = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
      return (JSON.parse(localStorage.getItem('__mockdb'))['aura/m' + k.slice(0, 7)] || { days:{} }).days[k]?.t || {}; });

    /* 1) Doppeltipp: Anzeige springt sofort auf aus und bleibt dort. */
    await page.tap('#autasks [data-id="read"]'); await page.waitForTimeout(120); await page.tap('#autasks [data-id="read"]');
    const seen = [];
    for (let i = 0; i < 25; i++) { seen.push(await state('read')); await page.waitForTimeout(100); }
    ok('kein Zurückspringen', seen.every(x => x === 'false'), seen.join(','));
    ok('DB: read aus', (await stored()).read !== true, JSON.stringify(await stored()));

    /* 2) Gewohnheit anlegen und sofort weitertippen. */
    await page.tap('#auhname'); await page.fill('#auhname', 'Kalt duschen'); await page.tap('#auhform button[type=submit]');
    await page.waitForTimeout(150);
    for (const id of ['journal', 'plan', 'caff', 'grat']) { await page.tap(`#autasks [data-id="${id}"]`); await page.waitForTimeout(90); }
    await page.waitForFunction(() => document.querySelectorAll('#auhabits .aucard').length === 1, null, { timeout: 10000 });
    await page.waitForTimeout(4500);
    const s1 = await stored();
    ok('alle vier gespeichert', ['journal','plan','caff','grat'].every(k => s1[k] === true), JSON.stringify(s1));
    ok('alle vier angezeigt', (await Promise.all(['journal','plan','caff','grat'].map(state))).every(x => x === 'true'));
    ok('Eingabe geschlossen', await page.evaluate(() => document.activeElement?.id !== 'auhname'));

    /* 3) Finger liegt auf dem Button, waehrend ein anderer Haken fertig
       speichert und neu gezeichnet wird: der Tipp darf nicht verloren gehen. */
    await page.click('#autasks [data-id="light"]');
    const box = await page.$eval('#autasks [data-id="breath"]', b => { const r = b.getBoundingClientRect(); return { x: r.x + 20, y: r.y + 10 }; });
    await page.mouse.move(box.x, box.y); await page.mouse.down();
    await page.waitForTimeout(1300);                     // Speichern von "light" endet in dieser Zeit
    await page.mouse.up();
    await page.waitForTimeout(1500);
    ok('Tipp überlebt Neuzeichnen', (await state('breath')) === 'true' && (await stored()).breath === true, JSON.stringify(await stored()));

    /* 4) Wiederholtes Anlegen per Doppeltipp erzeugt nur einen Eintrag. */
    await page.fill('#auvname', 'Snooze-Taste');
    await page.tap('#auvform button[type=submit]'); await page.tap('#auvform button[type=submit]').catch(() => {});
    await page.waitForTimeout(2500);
    const n = await page.evaluate(() => JSON.parse(localStorage.getItem('__mockdb'))['aura/config'].vices.length);
    ok('ein Zähler', n === 1, String(n));
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
  },

  /* Me-Tab: Listen, Bearbeiten, Synchronitaet mit dem Aura-Tab. */
  async me(browser) {
    const start = addDays(-20), sessions = [-19, -17, -15, -12, -9, -6, -4, -2].map(addDays);
    const seed = { 'aura/config': { habits: [], vices: [], hobbies: [{ id:'bb1', name:'Badminton', p:'body', start }] } };
    for (const d of sessions) { const m = 'aura/m' + d.slice(0, 7); seed[m] = seed[m] || { month: d.slice(0, 7), days: {} };
      seed[m].days[d] = { t: { b_bb1: true } }; }
    const { ctx, page, errors } = await open(browser, { seed });
    const tabs = await page.$$eval('.tabs .tb', bs => bs.map(b => b.textContent.trim()));
    ok('Me neben Aura', tabs[0] === '✦ Aura' && tabs[1] === 'Me' && !tabs.includes('Grooming') && !tabs.includes('Abend') && !tabs.includes('Morgen'), JSON.stringify(tabs));
    ok('Score ohne Hobby-Tage', (await page.textContent('#auring .num')) === '–');
    await page.click('.tabs .tb >> text=Me');
    ok('Looksmaxxing darunter', (await page.$$('#t-me #groomlist .gsec')).length === 7
      && (await page.textContent('#t-me')).includes('Looksmaxxing'));
    ok('Hobby lvl 3 (8 Sessions)', (await page.textContent('#mehobbies .merow')).includes('lvl 3'), await page.textContent('#mehobbies'));
    ok('Vorschlag Badminton weg', !(await page.$('#mebsug [data-msug="Badminton"]')));

    /* Hobby heute: gespeichert, Score bleibt leer. */
    await page.click('#mehobbies [data-tog="b_bb1"]');
    await page.waitForFunction(() => document.querySelector('#mehobbies [data-tog="b_bb1"]').getAttribute('aria-checked') === 'true'
      && AU.busy === 0 && AU.pend.size === 0);
    const t = iso(new Date());
    const dbm = await page.evaluate(k => JSON.parse(localStorage.getItem('__mockdb'))['aura/m' + k.slice(0, 7)], t);
    ok('Hobby-Session in DB', dbm?.days?.[t]?.t?.b_bb1 === true, JSON.stringify(dbm));
    ok('Score weiter leer', (await page.textContent('#auring .num')) === '–');

    /* Habit ueber Vorschlag in Me anlegen -> im Aura-Tab sichtbar (Karte + Aufgabe in Persönlichkeit). */
    await page.click('#mehsug [data-msug="Augenkontakt halten"]');
    ok('Säule aus Vorschlag', (await page.inputValue('#meaddhp')) === 'pers');
    await page.click('#meaddh button[type=submit]');
    await page.waitForSelector('#mehabits .merow');
    ok('Aura-Karte', (await page.textContent('#auhabits')).includes('Augenkontakt halten'));
    const persTasks = await page.$$eval('#autasks .aupcol', cs => cs[2].textContent);
    ok('Aura-Aufgabe', persTasks.includes('Augenkontakt halten'));
    /* Haken in Me -> Aura-Karte an; Haken in Aura -> Me aus. */
    await page.click('#mehabits .mechk');
    await page.waitForFunction(() => document.querySelector('#auhabits [data-hcheck]')?.classList.contains('on'));
    await page.click('.tabs .tb >> text=Aura');
    await page.click('#auhabits [data-hcheck]');
    await page.waitForFunction(() => document.querySelector('#mehabits .mechk').getAttribute('aria-checked') === 'false');
    await page.click('.tabs .tb >> text=Me');

    /* Umbenennen + Säule ändern per Editor. */
    await page.click('#mehabits .mename');
    await page.waitForSelector('#meedname');
    await page.fill('#meedname', 'Blickkontakt halten'); await page.selectOption('#meedpil', 'soul');
    await page.click('[data-msave]');
    await page.waitForFunction(() => !document.getElementById('meedname') && document.querySelector('#mehabits .men').textContent === 'Blickkontakt halten');
    ok('Aura umbenannt', (await page.$$eval('#autasks .aupcol', cs => cs[3].textContent)).includes('Blickkontakt halten'));

    /* Laster mit Säule in Me -> Aura-Zähler; Editor: Rückfall am Starttag gesperrt; Löschen zweistufig. */
    await page.fill('#meaddvn', 'Doomscrolling'); await page.selectOption('#meaddvp', 'mind');
    await page.click('#meaddv button[type=submit]');
    await page.waitForSelector('#mevices .merow');
    ok('0/90', (await page.textContent('#mevices .merow')).includes('0/90'));
    ok('Aura-Zähler', (await page.textContent('#auvices')).includes('Doomscrolling'));
    await page.click('#mevices .mename');
    ok('Rückfall gesperrt', await page.$eval('[data-mrel]', b => b.disabled));
    await page.click('[data-mdel]');
    ok('armiert', (await page.textContent('[data-mdel]')) === 'Wirklich löschen?');
    await page.click('[data-mdel]');
    await page.waitForFunction(() => !document.querySelector('#mevices .merow') && !document.querySelector('#auvices .aucard'));

    /* Habit + Hobby löschen über Editor. */
    await page.click('#mehabits .mename'); await page.click('[data-mdel]'); await page.click('[data-mdel]');
    await page.waitForFunction(() => !document.querySelector('#mehabits .merow') && !document.querySelector('#auhabits .aucard'));
    await page.click('#mehobbies .mename'); await page.click('[data-mdel]'); await page.click('[data-mdel]');
    await page.waitForFunction(() => !document.querySelector('#mehobbies .merow'));
    const cfg = await page.evaluate(() => JSON.parse(localStorage.getItem('__mockdb'))['aura/config']);
    ok('config leer', !cfg.habits.length && !cfg.vices.length && !cfg.hobbies.length, JSON.stringify(cfg));
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
  },

  async fullscreen(browser) {
    const stub = () => {
      Object.defineProperty(Document.prototype, 'fullscreenEnabled', { get: () => true, configurable: true });
      Element.prototype.requestFullscreen = function () { window.__fs = (window.__fs || 0) + 1; return Promise.resolve(); };
    };
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await ctx.addInitScript(MOCK); await ctx.addInitScript(stub);
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(URL);
    await page.waitForFunction(() => !document.getElementById('austat').textContent.includes('geladen'));
    ok('Knopf sichtbar', await page.$eval('#fsbtn', b => !b.hidden));
    ok('nicht beim Laden', (await page.evaluate(() => window.__fs || 0)) === 0);
    await page.click('#autasks [data-id="read"]');
    ok('erster Tipp', (await page.evaluate(() => window.__fs || 0)) === 1);
    await page.waitForFunction(() => document.querySelector('#autasks [data-id="read"]').getAttribute('aria-checked') === 'true');
    await page.click('#autasks [data-id="plan"]');
    ok('nur einmal', (await page.evaluate(() => window.__fs || 0)) === 1);
    await page.evaluate(() => localStorage.setItem('dash-autofs', '0'));
    await page.reload();
    await page.waitForFunction(() => !document.getElementById('austat').textContent.includes('geladen'));
    await page.click('#autasks [data-id="caff"]');
    ok('abgeschaltet', (await page.evaluate(() => window.__fs || 0)) === 0);
    await page.click('#fsbtn');
    ok('Knopf', (await page.evaluate(() => window.__fs || 0)) === 1 && (await page.evaluate(() => localStorage.getItem('dash-autofs'))) === '1');
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();

    /* Ohne Vollbild-Unterstuetzung: Knopf versteckt, kein Fehler. */
    const o = await open(browser);
    const hidden = await o.page.evaluate(() => document.fullscreenEnabled ? 'n/a' : document.getElementById('fsbtn').hidden);
    ok('ohne API versteckt', hidden === true || hidden === 'n/a', String(hidden));
    await o.ctx.close();
  },

  async sporttest(browser) {
    const { ctx, page, errors } = await open(browser);
    const tabs = await page.$$eval('.tabs .tb', bs => bs.map(b => b.textContent.trim()));
    ok('Sporttest-Tab', tabs[5] === 'Sporttest', JSON.stringify(tabs));
    const T = d => page.evaluate(x => stTasksFor(x).map(t => t.t).join(''), d);
    ok('vor Start keine Aufgabe', (await T('2026-09-29')) === '');
    ok('Mittwoch kein Hang', (await T('2026-10-07')) === '');
    ok('Einstiegstest', (await T('2026-10-02')).includes('Einstiegstest'));
    await page.click('.tabs .tb >> text=Sporttest');
    ok('Mobility-Block', (await page.$$('#mobseq .ec')).length === 9);

    await page.fill('#sthang', 'abc'); await page.click('#stform button[type=submit]');
    ok('ungültig nicht gespeichert', (await page.evaluate(() => ST.log.length)) === 0);
    await page.fill('#stday', '2026-10-01'); await page.fill('#sthang', '1:00'); await page.fill('#streach', '+3');
    await page.click('#stform button[type=submit]');
    await page.waitForFunction(() => ST.log.length === 1 && !ST.busy);
    ok('Karte Hang', (await page.textContent('#stcards')).includes('1:00 min'));
    ok('Karte Reach', (await page.textContent('#stcards')).includes('+3 cm'));
    ok('Basis 5×35 s', (await T('2026-10-02')) === 'Dead Hang: 5 × 35 s', await T('2026-10-02'));
    ok('Testsonntag', (await T('2026-10-11')).startsWith('Testtag'), await T('2026-10-11'));
    ok('Kapazität FR schwer', (await T('2026-11-27')).includes('schwer'), await T('2026-11-27'));
    ok('Kapazität DI 4×45 s', (await T('2026-12-01')) === 'Dead Hang: 4 × 45 s', await T('2026-12-01'));
    ok('Pause vor Test', (await T('2027-03-28')) === '');
    ok('Testtag selbst', (await T('2027-03-30')).includes('Testtag'));
    ok('Plan 4 Phasen', (await page.$$('#stplan .stph')).length === 4);
    ok('Ziel Reach 25', await page.evaluate(() => ST.target.reach === 25 && ST.target.hang === 120));
    const pts = await page.evaluate(() => [stPtsHang(120), stPtsHang(119), stPtsHang(112), stPtsHang(8), stPtsHang(7), stPtsHang(60),
      stPtsReach(25), stPtsReach(30), stPtsReach(24), stPtsReach(23), stPtsReach(15), stPtsReach(2), stPtsReach(1), stPtsReach(0), stPtsReach(-3), stPtsReach(8.5)]);
    ok('Punkte laut PDF', pts.join() === '15,14,14,1,0,7,15,15,14,14,10,3,3,2,1,6', pts.join());
    ok('Tabellen', (await page.$$('#stpts .ptab tr')).length === 15 + 15 && (await page.textContent('#stpts')).includes('+25 cm'));
    ok('Karte Punkte', (await page.textContent('#stcards')).includes('7 / 15 P') && (await page.textContent('#stcards')).includes('4 / 15 P'));

    await page.reload();
    await page.waitForFunction(() => !document.getElementById('austat').textContent.includes('geladen') && ST.log.length === 1);
    ok('persistent', (await page.evaluate(() => JSON.parse(localStorage.getItem('__mockdb'))['tests/main'].log[0].hang)) === 60);
    await page.click('.tabs .tb >> text=Sporttest');
    await page.click('[data-stdel]'); ok('armiert', (await page.textContent('[data-stdel]')) === 'Löschen?');
    await page.click('[data-stdel]');
    await page.waitForFunction(() => ST.log.length === 0 && !ST.busy);
    ok('keine Fehler', !errors.length, errors.join('\n'));
    await ctx.close();
  },

  async routine(browser) {
    const { ctx, page, errors } = await open(browser);
    await page.click('.tabs .tb >> text=Routine');
    ok('Panels', (await page.$$('#r-eve #evetl .tlitem')).length === 8 && (await page.$$('#r-mor #morlist .morrow')).length === 12);
    await page.click('#rsegeve'); ok('Abend sichtbar', await page.$eval('#r-eve', e => !e.hidden) && await page.$eval('#r-mor', e => e.hidden));
    await page.click('#rsegmor'); ok('Morgen sichtbar', await page.$eval('#r-mor', e => !e.hidden) && await page.$eval('#r-eve', e => e.hidden));
    ok('aria', (await page.getAttribute('#rsegmor', 'aria-selected')) === 'true' && (await page.getAttribute('#rsegeve', 'aria-selected')) === 'false');
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
    for (const t of ['Me','Routine','Sporttest','Trainingstage','Health','Finanzen','Vermögen']) {
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
