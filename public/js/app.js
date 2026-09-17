import { initPlan } from './plan.js';
import { initHealth } from './health.js';
import { initFinance } from './finance.js';

/* Plan-Tabs rendern synchron aus lokalen Daten; Health/Finance hängen am Backend
   und dürfen einzeln fehlschlagen, ohne den Rest des Dashboards mitzureißen. */
initPlan();

const guard = (name, fn) => fn().catch(err => {
  const box = document.querySelector(`#t-${name} .ct`);
  if (box) box.insertAdjacentHTML('afterbegin',
    `<div class="unote">Backend nicht erreichbar (${err.message}). Server starten: <code>npm start</code></div>`);
  console.error(name, err);
});

guard('health', initHealth);
guard('fin', initFinance);
