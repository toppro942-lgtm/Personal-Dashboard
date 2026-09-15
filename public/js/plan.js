/* Render-Engine der Plan-Tabs — nur teilweise noch aus dashboard4.html:
   der Wochentag-Kalender wechselt jetzt alle 14 Tage zwischen zwei
   Belegungen (WEEKPLAN.a/.b), Trainingsinhalt kommt aus S nach
   Programm-Identitaet, nicht mehr nach Wochentag. */
import { TG, S, WEEKPLAN, REF_BADMINTON_MONDAY, MESO_SCHEDULE, MESO_DEFAULT, VOL_CHEST, VOL_BACK, MEALS, FOODTIPS, TIMING, SLEEP, STIPS, MOBSEQ, MOBMILES, EVE, MOR, HYDRATION } from './plan-data.js';

/* Mesozyklus: welche Muskelgruppe im Kalendermonat priorisiert wird.
   Betrifft nur upperA/upperB -- resolveProgram() biegt genau diese beiden
   Schluessel auf ihre Blockvariante um, alle anderen Programme (Sharms,
   HIIT, Rest, Lower, Zone 2) reichen unveraendert durch. */
function activeMesoBlock(date=new Date()){
  const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
  return MESO_SCHEDULE[key]||MESO_DEFAULT;
}
const BLOCKED_PROGRAMS=['upperA','upperB'];
function resolveProgram(key){
  return BLOCKED_PROGRAMS.includes(key) ? S[`${key}_${activeMesoBlock()}`] : S[key];
}

/* Montag der jeweiligen Kalenderwoche, auf Mitternacht normiert. */
function mondayOf(date){
  const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  const wd=d.getDay(); // 0=So..6=Sa
  d.setDate(d.getDate()+(wd===0?-6:1-wd));
  return d;
}
/* Woche des Ankerdatums (bestaetigt Badminton) und jede zweite danach/davor
   gilt als Badminton-Woche -- ueber die Differenz in ganzen Wochen, nicht
   die Kalenderwochennummer, damit es auch ueber Jahreswechsel stabil bleibt. */
function isBadmintonWeek(date=new Date()){
  const [y,m,day]=REF_BADMINTON_MONDAY;
  const diffDays=Math.round((mondayOf(date)-new Date(y,m,day))/86400000);
  return (((Math.round(diffDays/7))%2)+2)%2===0;
}
const getWeekPlan=()=>WEEKPLAN[isBadmintonWeek()?'b':'a'];

function renderDayBar(){
  const plan=getWeekPlan();
  document.getElementById('dbar').innerHTML=plan.map((d,i)=>{
    const prog=resolveProgram(d.p),ac=prog.ac,name=d.name||prog.lb;
    return `<button class="db${i===0?' on':''}" onclick="day('${d.id}',this)" style="border-bottom-color:${i===0?ac:'transparent'}">
      <div class="dt">${d.s}</div>
      <div class="dd" style="background:${ac};opacity:${i===0?1:.2}"></div>
      <div class="dn" style="color:${i===0?ac:'var(--dim)'}">${name}</div>
    </button>`;
  }).join('');
}

function renderDay(id){
  const entry=getWeekPlan().find(d=>d.id===id);
  const d=resolveProgram(entry.p),ac=d.ac,label=`${entry.s} · ${entry.name||d.lb}`;
  /* Ersetzt (z.B. Badminton statt Studio-HIIT): Metrik-Badges, Notizen und
     Uebungsliste des Studio-Programms gelten fuer diesen Tag nicht -- statt
     erfundener Badminton-Kennzahlen nur der Ersetzungs-Hinweis. */
  if(entry.override){
    document.getElementById('dc').innerHTML=`<div class="sc" style="border-top-color:${ac}">
      <div class="st"><div>
        <div class="sdl" style="color:${ac}">${label}</div>
        <div class="stt">${d.ti}</div></div>
      </div><div class="sl">${entry.override}</div></div>`;
    return;
  }
  let h=`<div class="sc" style="border-top-color:${ac}">
    <div class="st"><div>
      <div class="sdl" style="color:${ac}">${label}</div>
      <div class="stt">${d.ti}</div></div>
      <div class="mb">${[d.du,d.rp,d.rr].filter(x=>x!=='—').map(x=>`<div class="mbg">${x}</div>`).join('')}</div>
    </div><div class="sl">${d.lg}</div></div>`;
  d.nt.forEach(n=>h+=`<div class="nt"><div class="ni">${n.i}</div><div class="ntx">${n.t}</div></div>`);
  h+=`<div class="esl">Übungen · antippen für Details</div>`;
  d.ex.forEach((e,i)=>{
    const g=TG[e.g],uid=`x${id}${i}`;
    h+=`<div class="ec" id="${uid}" style="--ac:${ac}">
      <div class="eh" onclick="tog('${uid}')">
        <div style="flex:1;min-width:0">
          <div class="enr"><span class="en">${e.n}</span>
          <span class="etg" style="background:${g.b};color:${g.c}">${g.t}</span></div>
          <div class="etr">${e.t}</div>
        </div>
        <div class="eb">
          <div class="esb">${e.s}${e.r&&e.r!=='—'?' · '+e.r:''}</div>
          ${e.rs?`<div class="esb" style="color:${ac}">⏱ ${e.rs}</div>`:''}
          <div class="echv">▼</div>
        </div>
      </div>
      <div class="ebd">
        ${e.w?`<div class="unote">📊 ${e.w}</div>`:''}
        <div class="ub" style="border:1px solid ${ac}33">
          <div class="ubl" style="color:${ac}">${e.w?'Ausführung & Warm-Up':'Anweisung'}</div>
          <div class="uc">→ ${e.f}</div>
        </div>
        <div><div class="wl">Begründung</div><div class="wt">${e.y}</div></div>
      </div></div>`;
  });
  document.getElementById('dc').innerHTML=h;
}

function renderVol(){
  const block=activeMesoBlock(), VOL=block==='back'?VOL_BACK:VOL_CHEST;
  const info=document.getElementById('mesoinfo');
  const monatsname=new Date().toLocaleDateString('de-DE',{month:'long',year:'numeric'});
  if(info) info.innerHTML=block==='back'
    ? `<b>Aktiver Mesozyklus: Rücken-Priorität</b> (${monatsname}) — Brust Dip pausiert zugunsten von Einarmigem Kurzhantelrudern in Upper B.`
    : `<b>Aktiver Mesozyklus: Brust-Priorität</b> (${monatsname}) — Standardplan, Brust Dip aktiv.`;
  document.getElementById('vtb').innerHTML=VOL.map(r=>{
    const tot=r.mo+r.mi+r.fr+r.sa+r.syn,[lo,hi]=r.mav;
    const ok=tot>=lo&&tot<=hi,over=tot>hi;
    const col=over?'#c94535':ok?'#2e9e6a':r.sport?'#3a7bbf':'#b8922e';
    const pct=Math.min(100,(tot/hi)*100);
    return `<tr>
      <td><div>${r.m}${r.sport?' <span style="color:#3a7bbf;font-size:9px">🏃</span>':''}</div>
      <div class="vbw"><div class="vb" style="width:${pct}%;background:${col}"></div></div>
      <div class="vn">${r.n}</div></td>
      ${[r.mo,r.mi,r.fr,r.sa].map(v=>`<td style="color:${v>0?'var(--tx)':'var(--bd)'};${v>0?'font-weight:500':''}">${v>0?v:'—'}</td>`).join('')}
      <td style="color:${r.syn>0?'var(--dim)':'var(--bd)'}">${r.syn>0?r.syn:'—'}</td>
      <td style="color:${col};font-weight:700;font-size:14px">${tot}</td>
      <td style="color:var(--dim);font-size:10px">${lo}–${hi}</td></tr>`;
  }).join('');
}

function renderFood(){
  document.getElementById('macros').innerHTML=[
    {v:'2,0–2,2',l:'g Protein/kg',c:'#c94535',s:'4–5 Mahlzeiten'},
    {v:'4–6',l:'g KH/kg',c:'#b8922e',s:'Trainingstage höher'},
    {v:'0,8–1,0',l:'g Fett/kg',c:'#2e9e6a',s:'Testosteron-Basis'},
    {v:'+300–500',l:'kcal Überschuss',c:'#3a7bbf',s:'0,25–0,5 %/Woche'}
  ].map(m=>`<div class="mac"><div class="macv" style="color:${m.c}">${m.v}</div>
    <div class="macl" style="color:${m.c}">${m.l}</div><div class="macs">${m.s}</div></div>`).join('');

  document.getElementById('mealgrid').innerHTML=MEALS.map(m=>`
    <div class="mday" style="border-left-color:${m.c}">
      <div class="mdn" style="color:${m.c}">${m.d} · ${m.tr}</div>
      <div class="mdm">${m.m}</div>
      <div>${m.tags.map(t=>`<span class="mdtag" style="background:${m.c}22;color:${m.c}">${t}</span>`).join('')}</div>
      <div class="mdt" style="margin-top:8px">${m.o}</div>
    </div>`).join('');

  document.getElementById('foodtips').innerHTML=FOODTIPS.map(t=>`
    <div class="card" style="display:flex;gap:12px">
      <div style="font-size:16px;flex-shrink:0;line-height:1.4">${t.i}</div>
      <div><div style="font-size:12px;font-weight:600;color:var(--wh);margin-bottom:4px">${t.n}</div>
      <div style="font-size:11px;color:var(--mut);line-height:1.75">${t.t}</div>
      <div style="font-family:var(--mono);font-size:9px;color:var(--grn);margin-top:5px">${t.s}</div></div>
    </div>`).join('');

  document.getElementById('timing').innerHTML=`<div class="card">${TIMING.map(t=>`
    <div style="display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--bd)">
      <div style="font-family:var(--mono);font-size:10px;color:${t.c};min-width:130px;flex-shrink:0">${t.t}</div>
      <div style="font-size:11px;color:var(--mut);line-height:1.7">${t.d}</div>
    </div>`).join('')}</div>`;
}

function renderSleep(){
  document.getElementById('sgrid').innerHTML=SLEEP.map(d=>`
    <div class="mday" style="border-left-color:${d.c}">
      <div class="mdn" style="color:${d.c}">${d.d} · ${d.tr}</div>
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px">
        <div style="font-family:var(--srf);font-size:24px;color:var(--wh)">↑ ${d.w}</div>
        <div style="font-family:var(--mono);font-size:10px;padding:2px 7px;border-radius:3px;background:${d.c}22;color:${d.c}">${d.s}</div>
      </div>
      <div style="font-size:10px;color:var(--dim)">Zubettgeh-Ziel <strong style="color:var(--tx);font-family:var(--mono)">${d.b} Uhr</strong></div>
    </div>`).join('');

  document.getElementById('stips').innerHTML=STIPS.map(t=>`
    <div class="card" style="display:flex;gap:12px">
      <div style="font-size:16px;flex-shrink:0;line-height:1.4">${t.i}</div>
      <div><div style="font-size:12px;font-weight:600;color:var(--wh);margin-bottom:4px">${t.n}</div>
      <div style="font-size:11px;color:var(--mut);line-height:1.75">${t.t}</div>
      <div style="font-family:var(--mono);font-size:9px;color:var(--grn);margin-top:5px">${t.s}</div></div>
    </div>`).join('');
}

function tab(id,b){
  document.querySelectorAll('.tc').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('.tb').forEach(x=>x.classList.remove('on'));
  document.getElementById('t-'+id).classList.add('on');b.classList.add('on');
}

function day(id,b){
  document.querySelectorAll('.db').forEach(x=>{
    x.classList.remove('on');x.style.borderBottomColor='transparent';
    x.querySelector('.dd').style.opacity='.2';x.querySelector('.dn').style.color='var(--dim)';
  });
  const ac=resolveProgram(getWeekPlan().find(d=>d.id===id).p).ac;
  b.classList.add('on');b.style.borderBottomColor=ac;
  b.querySelector('.dd').style.opacity='1';b.querySelector('.dn').style.color=ac;
  renderDay(id);
}

function tog(id){document.getElementById(id).classList.toggle('op')}

function renderMob(){
  document.getElementById('mobseq').innerHTML=MOBSEQ.map((s,i)=>`
    <div class="ec" style="--ac:${s.c}">
      <div style="padding:13px 15px;display:flex;gap:12px;align-items:flex-start">
        <div style="width:22px;height:22px;border-radius:50%;background:${s.c}22;color:${s.c};display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:10px;flex-shrink:0;margin-top:2px">${i+1}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600;color:var(--wh);margin-bottom:3px">${s.n}</div>
          <div style="font-family:var(--mono);font-size:10px;color:${s.c};margin-bottom:6px">${s.x}</div>
          <div style="font-size:11px;color:var(--mut);line-height:1.7">${s.d}</div>
        </div>
      </div>
    </div>`).join('');

  document.getElementById('mobmiles').innerHTML=`<div class="card"><div style="display:flex;flex-direction:column">
    ${MOBMILES.map((m,i)=>`
    <div style="display:flex;gap:12px;padding:10px 0;${i<MOBMILES.length-1?'border-bottom:1px solid var(--bd)':''}">
      <div style="font-family:var(--mono);font-size:10px;color:var(--pur);min-width:70px;flex-shrink:0">${m.m}</div>
      <div>
        <div style="font-size:12px;font-weight:600;color:var(--wh);margin-bottom:3px">${m.t}</div>
        <div style="font-size:11px;color:var(--mut);line-height:1.7">${m.d}</div>
      </div>
    </div>`).join('')}
  </div></div>`;
}

function renderEve(){
  document.getElementById('evetl').innerHTML=EVE.map(e=>`
    <div class="tlitem">
      <div class="tldot" style="border-color:${e.c};color:${e.c}"></div>
      <div class="tltime" style="color:${e.c}">${e.t}</div>
      <div class="tltitle">${e.ti}</div>
      ${e.b.map(x=>`<div class="tlbullet">· ${x}</div>`).join('')}
    </div>`).join('');
}

function renderMor(){
  document.getElementById('morlist').innerHTML=MOR.map((m,i)=>{
    const txt = typeof m==='string' ? m : m.t;
    const sub = typeof m==='object' && m.sub ? m.sub : null;
    return `<div class="morrow">
      <div class="morn">${i+1}</div>
      <div class="mortxt">${txt}${sub?`<ul class="substep">${sub.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}</div>
    </div>`;
  }).join('')+`
    <div class="card" style="margin-top:12px;border-left:3px solid var(--blu)">
      <div style="font-family:var(--mono);font-size:9px;letter-spacing:1.5px;color:var(--blu);text-transform:uppercase;margin-bottom:8px">💧 Hydration-Tracking</div>
      <div style="font-size:11px;color:var(--mut);line-height:1.9">
        ${HYDRATION.mor}<br>${HYDRATION.meal}<br>${HYDRATION.school}
      </div>
    </div>`;
}

/* Grooming: reines Nachschlagewissen. Bewusst als Text-Sektionen und nicht
   als Checkliste -- was taeglich abzuhaken ist, steht in den Routine-Tabs. */
function renderGroom(){
  document.getElementById('groomlist').innerHTML=GROOM.map(g=>`
    <section class="gsec" style="--gc:${g.c}">
      <div class="gsect">${g.t}</div>
      <div class="glead">${g.lead}</div>
      ${(g.sub||[]).map(b=>`
        <div class="gblock">
          <div class="gh">${b.h}</div>
          <ul class="gl">${b.li.map(x=>`<li>${x}</li>`).join('')}</ul>
        </div>`).join('')}
      ${g.quote?`<div class="gquote"><div class="gqh">${g.quote.h}</div><div class="gqt">\u201E${g.quote.t}\u201C</div></div>`:''}
      ${g.warn?`<div class="gwarn">${g.warn}</div>`:''}
      ${g.note?`<div class="gnote">${g.note}</div>`:''}
    </section>`).join('');
}

/* Das Original-Markup nutzt inline onclick (tab/day/tog). Module haben kein
   globales Scope, deshalb werden genau diese drei Handler exponiert. */
Object.assign(window, { tab, day, tog });

export function initPlan() {
  renderDayBar(); renderDay('mo'); renderVol(); renderFood();
  renderSleep(); renderMob(); renderEve(); renderMor(); renderGroom();
}
