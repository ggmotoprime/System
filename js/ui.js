// ══════════════════════════════════════════════
// UI.JS — Rendu de tous les onglets
// ══════════════════════════════════════════════

const ST = 0.7, DS = 7, QPW = 5;
let allData = {}, curDbId = '', weekOff = 0, histFil = 'all', skillCatFilter = 'Tout';
let editMode = false, editModalCtx = null, _confirmCb = null;
let donutCh = null, ringCh = null, ranksOpen = false, curFilter = 'Tout';

// ── NOTION ──
async function fetchAll(dbId) {
  let results = [], cursor;
  for (let i = 0; i < 20; i++) {
    const res = await fetch('/api/notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbId, cursor })
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Erreur ${res.status}`); }
    const data = await res.json();
    results = results.concat(data.results);
    if (!data.has_more) break;
    cursor = data.next_cursor;
  }
  return results;
}

function parsePages(pages) {
  const out = {};
  for (const page of pages) {
    const props = page.properties, dv = props['Date']?.date?.start;
    if (!dv) continue;
    const date = dv.substring(0, 10);
    if (!out[date]) { out[date] = {}; for (const h of HABITS) out[date][h] = false; }
    for (const nk of NOTION_KEYS) {
      const dn = NOTION_NAMES[nk];
      if (props[nk]?.checkbox === true) out[date][dn] = true;
    }
  }
  return out;
}

async function connect() {
  const dbId = document.getElementById('db-input').value.trim().replace(/-/g,'').substring(0,32);
  const err  = document.getElementById('error-msg');
  err.style.display = 'none';
  if (!dbId) { err.textContent = 'Entre ton Database ID.'; err.style.display = 'block'; return; }
  document.getElementById('config-panel').style.display = 'none';
  document.getElementById('loading').style.display = 'flex';
  try {
    const pages = await fetchAll(dbId);
    allData = parsePages(pages);
    curDbId = dbId;
    S.saveDb(dbId);
    showDash();
  } catch(e) {
    document.getElementById('config-panel').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    err.textContent = '❌ ' + e.message;
    err.style.display = 'block';
  }
}

async function refresh() {
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning'); btn.disabled = true;
  try {
    const pages = await fetchAll(curDbId);
    allData = parsePages(pages);
    renderToday();
    renderBoss(toDay());
    renderQuests(toDay());
  } catch(e) { alert('Impossible : ' + e.message); }
  finally { btn.classList.remove('spinning'); btn.disabled = false; }
}

function logout() { localStorage.removeItem('ht_db'); location.reload(); }

function toggleTheme() {
  const h = document.documentElement, n = h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  h.setAttribute('data-theme', n);
  localStorage.setItem('ht_theme', n);
  renderToday();
}

function showDash() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';

  // Vérifier si le contrat doit être affiché
  const needContract = checkAndShowContract();
  if (needContract) {
    setTimeout(() => showContractPopup(), 600);
  }

  // Vérifier si un rapport doit être généré
  const newReport = checkAndGenerateReport();
  if (newReport) {
    showToast('📋 Rapport hebdomadaire généré');
    // Notification sur l'onglet Registre — délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      const reportTab = document.querySelector('[data-tab="report"]');
      if (reportTab) {
        reportTab.innerHTML = '📋 Registre <span style="display:inline-block;width:7px;height:7px;background:#4ade80;border-radius:50%;vertical-align:middle;margin-left:3px;box-shadow:0 0 6px #4ade80;animation:pulse-dot 1.5s infinite;"></span>';
      }
    }, 500);
  }
  // Notification persistante si rapport existe pour cette semaine mais pas encore vu
  else {
    setTimeout(() => {
      const today2 = toDay();
      const existingReport = getStoredReport(today2);
      if (existingReport) {
        const reportTab = document.querySelector('[data-tab="report"]');
        if (reportTab && !reportTab.innerHTML.includes('pulse-dot')) {
          const reportDate = new Date(existingReport.generatedAt);
          const now2 = new Date();
          // Notification si rapport généré dans les dernières 24h
          const hoursDiff = (now2 - reportDate) / 3600000;
          if (hoursDiff < 24) {
            reportTab.innerHTML = '📋 Registre <span style="display:inline-block;width:7px;height:7px;background:#4ade80;border-radius:50%;vertical-align:middle;margin-left:3px;box-shadow:0 0 6px #4ade80;animation:pulse-dot 1.5s infinite;"></span>';
          }
        }
      }
    }, 500);
  }

  const awakening = checkAwakening();
  if (awakening) {
    triggerAwakening(awakening);
  } else {
    renderToday();
    renderRanksPanel();
    updateChronicles(toDay());
    setTimeout(() => { renderBoss(toDay()); renderQuests(toDay()); }, 100);
  }
}

// ── TABS ──
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('tab-' + name);
  if (target) target.classList.add('active');
  if (name === 'attr')      renderAttr();
  if (name === 'skills')    renderSkills();
  if (name === 'guide')     renderGuide();
  if (name === 'bosscal')   renderBossCalendar();
  if (name === 'questlist') renderQuestList();
  if (name === 'history')   renderHistory();
  if (name === 'badges')    renderBadgesPage();
  if (name === 'titles')    renderTitlesPage();
  if (name === 'chronicles') renderChronicles();
  if (name === 'report') {
    renderReportPage();
    // Effacer la notification
    const reportTab = document.querySelector('[data-tab="report"]');
    if (reportTab) reportTab.textContent = '📋 Registre';
  }
  if (name === 'contract') renderContractPage();
  if (name === 'shop')      renderShop();
  if (name === 'stats') {
    renderStats();
    renderWeekScores(toDay());
    renderComparison(toDay());
    renderYearSel();
    renderHeatmap();
    renderFilters();
    renderBars(curFilter);
    renderDonut();
  }
}

// ── ÉVEIL ──
function triggerAwakening(letter) {
  const data = RANK_AWAKENING[letter];
  if (!data) { confirmAwakening(letter); renderToday(); return; }
  const rank = RANKS.find(r => r.n.startsWith(letter + ' '));
  const overlay = document.getElementById('awakening-overlay');
  overlay.innerHTML = `
    <div class="awakening-detected">⚡ ÉVEIL DÉTECTÉ</div>
    <div class="awakening-rank">${rank ? rank.e : '⚔️'}</div>
    <div class="awakening-title">${data.title}</div>
    <div class="awakening-text">${data.text}</div>
    <div class="awakening-unlocks">
      ${(data.unlocks || []).map(u => `<div class="awakening-unlock">✦ ${u}</div>`).join('')}
    </div>
    <button class="awakening-btn" id="awakening-continue">Continuer →</button>`;
  overlay.classList.add('active');
  document.getElementById('awakening-continue').addEventListener('click', () => {
    overlay.classList.remove('active');
    confirmAwakening(letter);
    renderToday();
    renderRanksPanel();
    updateChronicles(toDay());
    setTimeout(() => { renderBoss(toDay()); renderQuests(toDay()); }, 100);
  });
}

// ── TODAY ──
function renderToday() {
  const t = toDay();
  document.getElementById('today-date-sub').textContent =
    new Date(t + 'T12:00:00').toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  renderSystemMsg(t);
  renderSequelles(t);
  renderSeason(t);
  renderRing(t);
  renderTodayChips(t);
  renderThreshold(t);
  renderXP();
  renderProphecy(t);
  renderEquippedTitle();
  // Bouton régénérer visible uniquement en mode édition
  renderRegenBtn(t);
}

function renderRegenBtn(today) {
  const existing = document.getElementById('regen-quest-btn');
  if (existing) existing.remove();
  if (!editMode) return;

  const wn = getWN(today);
  const yr = new Date().getFullYear();
  const cached = getGeneratedQuests(wn, yr);

  const btn = document.createElement('button');
  btn.id = 'regen-quest-btn';
  btn.style.cssText = `
    display:flex;align-items:center;gap:6px;
    background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.3);
    color:#60a5fa;border-radius:9px;font-size:.72rem;font-weight:600;
    padding:.38rem .8rem;cursor:pointer;font-family:'DM Sans',sans-serif;
    margin-bottom:8px;width:100%;justify-content:center;
    transition:all .18s;
  `;

  // Affiche les règles appliquées si déjà généré
  const rulesInfo = cached && cached.rules_applied && cached.rules_applied.length
    ? cached.rules_applied.map(r => RULE_LABELS[r] || r).join(' · ')
    : 'Non généré';

  btn.innerHTML = `
    <span>↻ Régénérer les quêtes</span>
    <span style="font-size:.6rem;color:var(--muted);font-weight:400;">${rulesInfo}</span>
  `;

  btn.addEventListener('click', () => {
    // Efface le cache pour forcer la régénération
    const key = getGenQuestsKey(wn, yr);
    localStorage.removeItem(key);
    generateWeeklyQuests(true);
    renderQuests(today);
    renderRegenBtn(today);
    showToast('⚡ Quêtes régénérées');
  });

  // Insère avant la liste de quêtes
  const questCard = document.getElementById('quest-list');
  if (questCard && questCard.parentNode) {
    questCard.parentNode.insertBefore(btn, questCard);
  }
}

function renderEquippedTitle() {
  const title = S.equippedTitle();
  const el = document.getElementById('equipped-title');
  if (!el) return;
  if (title) {
    el.textContent = `「${title}」`;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

function renderSeason(today) {
  const el = document.getElementById('season-banner');
  if (!el) return;
  const s = getCurrentSeason(today);
  if (!s) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
      <div style="font-size:.62rem;color:#a78bfa;text-transform:uppercase;letter-spacing:.1em;font-weight:600;">
        ⚔️ Saison ${s.number} — ${s.name}
      </div>
      <div style="font-size:.62rem;font-family:'DM Mono',monospace;color:var(--muted);">
        J${s.daysDone}/90 · ${s.daysLeft}j restants
      </div>
    </div>
    <div style="background:var(--surface3);border-radius:4px;height:4px;overflow:hidden;">
      <div style="height:100%;border-radius:4px;background:linear-gradient(90deg,#7c3aed,#a855f7);width:${s.pct}%;transition:width 1s;"></div>
    </div>
    <div style="display:flex;gap:12px;margin-top:6px;font-size:.62rem;color:var(--muted);">
      <span>✅ ${s.perfect} parfaites</span>
      <span>🔥 ${s.streak}j streak</span>
      <span>⚔️ ${s.bossWon} boss</span>
    </div>`;
}

function renderProphecy(today) {
  const el = document.getElementById('prophecy-banner');
  if (!el) return;
  const p = computeProphecy(today);
  if (!p) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.innerHTML = `
    <div style="font-size:.6rem;color:#fbbf24;text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:3px;">
      🔮 Prophétie du Système
    </div>
    <div style="font-size:.76rem;color:var(--text);line-height:1.6;">
      À ce rythme <span style="color:#fbbf24;font-weight:700;">(+${p.dailyPD} PD/j)</span>, 
      tu atteindras le rang 
      <span style="color:${p.nextRank.c};font-weight:700;">${p.nextRank.e} ${p.nextRank.n}</span> 
      dans <span style="color:var(--accent);font-weight:700;">${p.daysNeeded} jours</span> 
      — aux alentours du <span style="color:var(--text2);">${p.targetDate}</span>.
    </div>
    <div style="font-size:.62rem;color:var(--muted);margin-top:3px;">
      Il manque ${p.pdNeeded.toLocaleString()} PD.
    </div>`;
}

function renderSequelles(today) {
  const active = getActiveSequelles(today);
  const container = document.getElementById('sequelles-container');
  if (!container) return;
  container.innerHTML = '';
  if (!active.length) return;
  active.forEach(seq => {
    const daysLeft = Math.max(0, Math.round(
      (new Date(seq.endDate + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000
    ));
    const div = document.createElement('div');
    div.className = 'sequelle-banner';
    div.innerHTML = `
      ⚠️ <strong>${seq.name}</strong> — ${seq.narrative}
      <span class="sequelle-days">${daysLeft}j restant${daysLeft > 1 ? 's' : ''}</span>`;
    container.appendChild(div);
  });
}
function renderSystemMsg(t) {
  const { text, tone } = getSystemMessage(t);
  const el = document.getElementById('system-msg');
  el.className = `system-msg tone-${tone} anim`;
  el.innerHTML = `<div class="system-label">Le Système</div>${text}`;
}

function renderSequelles(today) {
  const active = updateSequelles(today);
  const container = document.getElementById('sequelles-container');
  if (!container) return;
  container.innerHTML = '';
  active.forEach(seq => {
    const daysLeft = daysBetween(today, seq.endDate);
    const div = document.createElement('div');
    div.className = 'sequelle-banner';
    div.innerHTML = `⚠️ <strong>${seq.name}</strong> — ${seq.narrative} <span class="sequelle-days">${daysLeft}j restant${daysLeft > 1 ? 's' : ''}</span>`;
    container.appendChild(div);
  });
}

function renderRing(t) {
  const c = scoreDay(t), p = Math.round(c / HABITS.length * 100);
  const col = p === 100 ? '#22c55e' : p >= 70 ? '#eab308' : p >= 40 ? '#f97316' : '#ef4444';
  document.getElementById('ring-pct').textContent = p + '%';
  document.getElementById('ring-pct').style.color = col;
  document.getElementById('ring-detail').textContent = `${c} / ${HABITS.length}`;
  document.getElementById('ring-sub').textContent = c < HABITS.length ? `Encore ${HABITS.length - c} à faire` : `Complet 🎉`;
  if (ringCh) ringCh.destroy();
  ringCh = new Chart(document.getElementById('ring-chart').getContext('2d'), {
    type: 'doughnut',
    data: { datasets: [{ data: [c, HABITS.length - c], backgroundColor: [col, 'rgba(128,128,128,0.08)'], borderWidth: 0 }] },
    options: { cutout:'82%', plugins:{ legend:{display:false}, tooltip:{enabled:false} }, animation:{ duration:900, easing:'easeOutQuart' } }
  });
}

function renderTodayChips(t) {
  const d = allData[t] || {};
  document.getElementById('today-chips').innerHTML = HABITS.map((h, i) => {
    const done = d[h] === true;
    return `<div class="habit-chip${done?' done':''}" style="${done?`border-color:${COLORS[i]}30;background:${COLORS[i]}08;`:''}">
      <div class="h-dot" style="${done?`background:${COLORS[i]};border-color:transparent;`:`border-color:${COLORS[i]}50;`}"></div>
      <span style="${done?`color:${COLORS[i]};font-weight:600;font-size:.73rem;`:''}">${h}</span></div>`;
  }).join('');
}

function renderThreshold(t) {
  const s = scoreDay(t), b = document.getElementById('threshold-banner');
  let c, tx;
  if (s >= HABITS.length)  { c='success'; tx=`🏆 Journée parfaite — ${s}/${HABITS.length} !`; }
  else if (s >= DS)        { c='success'; tx=`✅ Journée réussie — ${s}/${HABITS.length}`; }
  else                     { c = s>=4?'warn':'fail'; tx=`${s>=4?'⚡':'❌'} ${s}/${HABITS.length} — Seuil : ${DS}/10`; }
  b.className = 'threshold ' + c;
  b.textContent = tx;
}

function renderXP() {
  const xp = computeXP();
  const rank = getRank(xp);
  const next = RANKS[RANKS.indexOf(rank) + 1];
  const prog = next ? Math.round((xp - rank.min) / (next.min - rank.min) * 100) : 100;
  document.getElementById('xp-level').textContent = `${rank.e} ${rank.n}`;
  document.getElementById('rank-pill').textContent = `${rank.e} ${rank.n}`;
  document.getElementById('rank-pill').style.cssText =
    `background:${rank.c}20;color:${rank.c};border:1px solid ${rank.c}40;padding:3px 10px;border-radius:14px;font-size:.68rem;font-weight:700;`;
  document.getElementById('xp-cur').textContent = `${xp.toLocaleString()} PD`;
  document.getElementById('xp-nxt').textContent = next ? `→ ${next.min.toLocaleString()} PD` : 'MAX';
  setTimeout(() => {
    const bar = document.getElementById('xp-bar');
    if (bar) { bar.style.width = prog + '%'; bar.style.background = `linear-gradient(90deg,${rank.c},${next?next.c:rank.c})`; }
  }, 100);
  const dates = Object.keys(allData);
  const bXP = dates.reduce((a,d) => { let x = scoreDay(d)*10; if(isPerfect(d)) x+=150; return a+x; }, 0);
  const boXP = Object.values(S.boss()).filter(b=>b.declared==='won').reduce((a,b)=>a+(b.reward||0),0);
  const qXP  = computeQuestXP();
  const mXP  = S.malus().reduce((a,m)=>a+m.amount,0);
  const tXP  = S.tx().reduce((a,t)=>a+(t.amount||t.c||0),0);
  document.getElementById('xp-breakdown').innerHTML =
    `Habitudes <strong>+${bXP.toLocaleString()}</strong> · Boss <strong>+${boXP.toLocaleString()}</strong> · Quêtes <strong>+${qXP.toLocaleString()}</strong>`
    + (mXP?` · Malus <strong style="color:#f87171">-${mXP.toLocaleString()}</strong>`:'')
    + (tXP?` · Boutique <strong style="color:#f97316">-${tXP.toLocaleString()}</strong>`:'');
  // Passif actif
  const passifEl = document.getElementById('active-passif');
  if (passifEl) {
    const idx = getRankIdx(xp);
    const activePassifs = RANKS.slice(0, idx+1).filter(r => r.passif).map(r => r.passif.desc);
    passifEl.innerHTML = activePassifs.length
      ? activePassifs.map(p => `<div style="font-size:.62rem;color:#a78bfa;margin-top:3px;">✦ ${p}</div>`).join('')
      : '';
  }
}

function toggleRanks() {
  ranksOpen = !ranksOpen;
  document.getElementById('ranks-panel').classList.toggle('open', ranksOpen);
  document.getElementById('ranks-btn').textContent = ranksOpen ? 'Masquer ▴' : 'Rangs ▾';
  if (ranksOpen) renderRanksPanel();
}

function renderRanksPanel() {
  const xp = computeXP();
  document.getElementById('ranks-panel').innerHTML = RANKS.map(r => {
    const isCur = xp >= r.min && xp < r.max, reached = xp >= r.min;
    const prog = r.max === Infinity ? 100 : Math.min(100, Math.round((xp-r.min)/(r.max-r.min)*100));
    return `<div class="rank-row${isCur?' cur':''}">
      <div style="font-size:1.2rem;">${r.e}</div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:.77rem;font-weight:700;color:${r.c};">${r.n}${isCur?' ← Ton rang':''}</div>
          <div style="font-size:.63rem;font-family:'DM Mono',monospace;color:var(--muted);">${r.min.toLocaleString()} PD</div>
        </div>
        <div style="font-size:.62rem;color:var(--muted);margin-top:1px;">${r.d}</div>
        ${r.passif ? `<div style="font-size:.6rem;color:#a78bfa;margin-top:2px;">✦ ${r.passif.desc}</div>` : ''}
        ${isCur ? `<div class="rr-bar"><div class="rr-fill" style="width:${prog}%;background:${r.c};"></div></div>`
          : reached ? `<div style="font-size:.6rem;color:#22c55e;margin-top:2px;">✅ Atteint</div>`
          : `<div style="font-size:.6rem;color:var(--muted);margin-top:2px;">🔒 ${(r.min-xp).toLocaleString()} PD manquants</div>`}
      </div></div>`;
  }).join('');
}

// ── BOSS ──
function getBossByWeek(wn) { return getBosses().find(b => b.week === wn) || null; }

function renderBoss(today) {
  const curWN = getWN(today), yr = new Date().getFullYear();
  const selectedWN = parseInt(localStorage.getItem('ht_boss_wn') || String(curWN));
  const wn = selectedWN, key = `w${wn}_${yr}`;
  const boss = getBossByWeek(wn);
  const bossCard = document.getElementById('boss-card');
  const bossList = getBosses();
  const assignedWeeks = bossList.map(b=>b.week).filter(w=>typeof w==='number').sort((a,b)=>a-b);
  const weekOptions = assignedWeeks.length
    ? assignedWeeks.map(w => { const b=getBossByWeek(w); return `<option value="${w}" ${w===wn?'selected':''}>${b?b.i:''} Sem. ${w} — ${b?b.n:'?'}</option>`; }).join('')
    : `<option value="${curWN}">Sem. ${curWN}</option>`;

  bossCard.innerHTML = `
    <div class="boss-glow"></div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
      <span style="font-size:.62rem;color:#a78bfa;text-transform:uppercase;letter-spacing:.1em;flex-shrink:0;">📅 Semaine</span>
      <select id="boss-week-sel" style="background:rgba(139,92,246,.12);border:1px solid rgba(139,92,246,.3);color:#ede9fe;border-radius:8px;font-size:.72rem;padding:.28rem .55rem;cursor:pointer;flex:1;min-width:0;font-family:'DM Sans',sans-serif;">
        ${weekOptions}
      </select>
      <span style="font-size:.62rem;color:#a78bfa;flex-shrink:0;">(actuelle : ${curWN})</span>
    </div>
    <div class="boss-header">
      <div class="boss-ico" id="boss-icon"></div>
      <div class="boss-meta">
        <div class="boss-week" id="boss-wk"></div>
        <div class="boss-name" id="boss-nm"></div>
        <div style="margin-top:4px;display:flex;align-items:center;gap:6px;">
          <span class="boss-diff" id="boss-diff"></span>
          <button class="qb rst" id="boss-reset-btn" style="font-size:.62rem;padding:2px 7px;">↺ Reset</button>
        </div>
      </div>
    </div>
    <div class="boss-lore" id="boss-lore"></div>
    <div class="boss-cl-wrap"><div class="boss-cl-title">⚔️ Checklist</div><div class="boss-cl" id="boss-cl"></div></div>
    <div style="margin-top:6px;font-size:.72rem;color:#fbbf24;font-weight:600;" id="boss-rew"></div>
    <div class="boss-hp-section">
      <div class="boss-hp-lbl"><span>HP du Boss</span><span id="boss-hp-pct">100%</span></div>
      <div class="boss-hp-track"><div class="boss-hp-fill" id="boss-hp-fill" style="width:100%"></div></div>
    </div>
    <div id="boss-result"></div>`;

  document.getElementById('boss-week-sel').addEventListener('change', e => {
    localStorage.setItem('ht_boss_wn', e.target.value); renderBoss(today);
  });
  document.getElementById('boss-reset-btn').addEventListener('click', () => confirmReset('boss'));

  if (!boss) {
    document.getElementById('boss-icon').textContent = '🔒';
    document.getElementById('boss-wk').textContent = `Semaine ${wn}`;
    document.getElementById('boss-nm').textContent = 'Aucun boss assigné';
    document.getElementById('boss-lore').textContent = 'Cette semaine n\'a pas de boss.';
    return;
  }

  const saved = S.boss();
  if (!saved[key]) saved[key] = { checks:[], declared:null, reward:boss.r };
  const bd = saved[key];
  const dc = {'Normale':'#22c55e','Difficile':'#f97316','Extreme':'#ef4444','Legendaire':'#fbbf24'};
  const col = dc[boss.d] || '#8b5cf6';
  const attr = ATTRIBUTES.find(a => a.id === boss.a);

  document.getElementById('boss-icon').textContent = boss.i;
  document.getElementById('boss-wk').textContent   = `Semaine ${wn}${wn===curWN?' · En cours':''}`;
  document.getElementById('boss-nm').textContent   = boss.n;
  document.getElementById('boss-diff').textContent = boss.d;
  document.getElementById('boss-diff').style.cssText = `background:${col}20;color:${col};border:1px solid ${col}40;padding:2px 9px;border-radius:14px;font-size:.63rem;font-weight:700;`;
  document.getElementById('boss-lore').textContent = boss.l;
  document.getElementById('boss-rew').textContent  = `🏆 +${boss.r} PD · ${attr?attr.emoji+' +PA '+attr.name:''} · +${BOSS_PA_BY_DIFF[boss.d]||60} PA`;

  const clEl = document.getElementById('boss-cl');
  clEl.innerHTML = '';
  (boss.s||[]).forEach((step, i) => {
    const checked = bd.checks.includes(i);
    const div = document.createElement('div');
    div.className = 'boss-ci' + (checked?' checked':'');
    const cb = document.createElement('input'); cb.type='checkbox'; cb.id='bc'+i; cb.checked=checked;
    if (bd.declared) cb.disabled = true;
    cb.addEventListener('change', () => toggleBossCheck(i, key));
    const lbl = document.createElement('label'); lbl.htmlFor='bc'+i; lbl.textContent=step;
    div.appendChild(cb); div.appendChild(lbl); clEl.appendChild(div);
  });

  const done = bd.checks.length, total = (boss.s||[]).length;
  const hp = Math.max(0, 100 - Math.round(done/Math.max(total,1)*100));
  document.getElementById('boss-hp-pct').textContent = hp + '%';
  setTimeout(() => { const f=document.getElementById('boss-hp-fill'); if(f) f.style.width=hp+'%'; }, 200);

  const res = document.getElementById('boss-result');
  res.innerHTML = '';
  if (bd.declared === 'won') {
    res.innerHTML = `<div class="boss-won">⚔️ BOSS VAINCU — +${boss.r} PD !</div>`;
  } else if (bd.declared === 'failed') {
    res.innerHTML = `<div class="boss-failed">💀 Boss échoué cette semaine.</div>`;
  } else if (hp === 0) {
    const btns = document.createElement('div'); btns.className='boss-btns';
    const winBtn = document.createElement('button'); winBtn.className='boss-btn win'; winBtn.textContent='✅ Boss vaincu';
    winBtn.addEventListener('click', () => declareBoss('won', key, boss.r));
    const loseBtn = document.createElement('button'); loseBtn.className='boss-btn lose'; loseBtn.textContent='❌ Échoué';
    loseBtn.addEventListener('click', () => declareBoss('failed', key, boss.a));
    btns.appendChild(winBtn); btns.appendChild(loseBtn); res.appendChild(btns);
  } else {
    res.innerHTML = `<div style="font-size:.67rem;color:#a78bfa;margin-top:5px;text-align:center;">${done}/${total} étapes — ${hp}% HP</div>`;
  }
}

function toggleBossCheck(idx, key) {
  const s = S.boss();
  if (!s[key]) s[key] = { checks:[], declared:null };
  const p = s[key].checks.indexOf(idx);
  if (p > -1) s[key].checks.splice(p,1); else s[key].checks.push(idx);
  S.saveBoss(s); renderBoss(toDay());
}

function declareBoss(result, key, rewardOrAttr) {
  const s = S.boss();
  if (!s[key]) s[key] = { checks:[], declared:null };
  s[key].declared = result;
  s[key].declaredDate = toDay();
  if (result === 'won') {
    s[key].reward = rewardOrAttr;
  } else {
    // Séquelle sur l'attribut du boss
    addSequelle('boss_fail', rewardOrAttr, toDay());
  }
  S.saveBoss(s);
  renderBoss(toDay()); renderXP(); updateChronicles(toDay());
}

// ── QUÊTES ──
function getQKey(today) {
  const wn=getWN(today), yr=new Date().getFullYear();
  return `qw${wn}_${yr}`;
}
function computeQIndices(weekNum) {
  const questList = getQuests();
  if (!questList.length) return [];
  const count = Math.min(QPW, questList.length);
  const idx = [];
  let cursor = ((weekNum*31+7) % questList.length + questList.length) % questList.length;
  let safety = 0;
  while (idx.length < count && safety < questList.length*4) {
    if (!idx.includes(cursor)) idx.push(cursor);
    cursor = (cursor + Math.floor(questList.length/5)+3) % questList.length;
    safety++;
  }
  for (let j=0; j<questList.length && idx.length<count; j++) if(!idx.includes(j)) idx.push(j);
  return idx.slice(0, count);
}

function renderQuests(today) {
  const el = document.getElementById('quest-list');
  if (!el) return;

  const wn = getWN(today);
  const yr = new Date().getFullYear();
  const weekKey = getQKey(today);

  // Utilise les quêtes générées si disponibles, sinon génère
  let quests = generateWeeklyQuests(false);

  // Fallback : si la génération échoue, utiliser l'ancienne méthode
  if (!quests || !quests.length) {
    const questList = getQuests();
    const indices = computeQIndices(wn);
    quests = indices.map(i => questList[i]).filter(Boolean);
  }

  if (!quests.length) {
    el.innerHTML = `<div style="font-size:.78rem;color:var(--muted);text-align:center;padding:1.5rem;">Aucune quête disponible</div>`;
    return;
  }

  el.innerHTML = '';

  quests.forEach(q => {
    if (!q) return;
    const qState = S.getQState(weekKey, q.n);
    const isDone = qState.state === 'done';
    const isFail = qState.state === 'failed';
    const attr = ATTRIBUTES.find(a => a.id === q.a);
    const diffLabel = q.diff === 'easy' ? 'Facile' : q.diff === 'medium' ? 'Moyen' : 'Difficile';
    const paBadge = QUEST_PA_BY_DIFF[q.diff] || 30;

    // Badge de règle si quête générée
    const ruleLabel = q.generated && q.rule ? (RULE_LABELS[q.rule] || '⚡ Auto') : null;
    const multiplierBadge = q.xp_multiplier && q.xp_multiplier > 1
      ? `<span style="font-size:.58rem;background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3);border-radius:6px;padding:1px 6px;font-weight:700;">×${q.xp_multiplier} XP</span>`
      : '';

    const item = document.createElement('div');
    item.className = 'quest-item' + (isDone ? ' q-done' : isFail ? ' q-fail' : '');

    const actsBtns = document.createElement('div');
    actsBtns.className = 'quest-acts';

    if (!isDone && !isFail) {
      const okBtn = document.createElement('button');
      okBtn.className = 'qb ok';
      okBtn.textContent = '✅';
      okBtn.addEventListener('click', () => {
        const reward = Math.round((q.r || 0) * (q.xp_multiplier || 1));
        S.saveQState(weekKey, q.n, { state: 'done', reward });
        renderQuests(today);
        renderXP();
        updateChronicles(toDay());
      });
      const koBtn = document.createElement('button');
      koBtn.className = 'qb ko';
      koBtn.textContent = '❌';
      koBtn.addEventListener('click', () => {
        S.saveQState(weekKey, q.n, { state: 'failed' });
        renderQuests(today);
      });
      actsBtns.appendChild(okBtn);
      actsBtns.appendChild(koBtn);
    }

    const rstBtn = document.createElement('button');
    rstBtn.className = 'qb rst';
    rstBtn.textContent = '↺';
    rstBtn.addEventListener('click', () => {
      localStorage.removeItem(`${weekKey}__${q.n}`);
      renderQuests(today);
      renderXP();
    });
    actsBtns.appendChild(rstBtn);

    item.innerHTML = `
      <div class="quest-hdr">
        <div class="quest-ico">${q.i}</div>
        <div class="quest-nm">${q.n}</div>
        <div style="display:flex;gap:4px;align-items:center;flex-shrink:0;">
          ${ruleLabel ? `<span style="font-size:.56rem;background:rgba(96,165,250,.12);color:#60a5fa;border:1px solid rgba(96,165,250,.25);border-radius:6px;padding:1px 6px;font-weight:600;">${ruleLabel}</span>` : ''}
          <div class="quest-badge ${q.diff}">${diffLabel}</div>
        </div>
      </div>
      <div class="quest-desc">${q.d}</div>
      ${attr ? `<div style="font-size:.6rem;color:var(--muted);margin-bottom:5px;">${attr.emoji} +${paBadge} PA ${attr.name}</div>` : ''}
      <div class="quest-ftr">
        <div class="quest-rew">🏆 +${q.r} PD ${multiplierBadge}${isDone ? ' ✅' : isFail ? ' ❌' : ''}</div>
      </div>`;

    item.querySelector('.quest-ftr').appendChild(actsBtns);
    el.appendChild(item);
  });
}

// ── ATTRIBUTS ──
function getDetailedPASources(attrId) {
  const sources = {
    discipline: [
      '📵 No Scroll → +2 PA Constance · +1 PA Mental/jour',
      '✅ Journée parfaite → +3 PA Routine · +2 PA Exécution',
      '🔥 Streak tous les 7j → +8 PA No Scroll · +6 PA Constance',
      '📅 Chaque jour tracké → +1 PA Constance',
      '⚔️ Boss Ermite, Vide Total, Réveil → gros bonus Routine',
    ],
    physique: [
      '🏃 Sport → +2 PA Force · +1 PA Endurance/jour',
      '💪 Pushup → +2 PA Force/jour',
      '🔥 Combo Sport+Pushup → +3 PA Force · +2 PA Endurance bonus',
      '✅ Streak 7j → +10 PA Vitesse · Streak 30j → +20 PA',
      '⚔️ Boss Centurion, Marathon, Nageur → +PA Technique/Endurance',
    ],
    nutrition: [
      '🥗 Nutrition → +3 PA Qualité repas/jour',
      '🔥 Combo No Scroll+Nutrition → +2 PA Qualité bonus',
      '⚔️ Boss Abstinent Total → +PA Qualité · Composition',
      '📜 Quête nutrition parfaite → +PA Qualité · Cuisinier',
      '🧠 Skills Cuisine → +80 PA répartis sur Cuisinier · Connaissance',
    ],
    spiritualite: [
      '🙏 Prière → +3 PA Salat/jour',
      '📖 Coran → +3 PA Coran/jour',
      '🕌 Islam → +2 PA Connaissance/jour',
      '🔥 Combo Coran+Prière+Islam → +4 PA Salat · +4 PA Coran · +3 PA Ilm · +2 PA Dhikr',
      '⚔️ Boss Moine, Retraite Spirituelle, Récitation → gros bonus Dhikr · Coran',
    ],
    intelligence: [
      '🗣️ Arabe → +3 PA Arabe/jour',
      '🧠 Skill → +2 PA Compétences/jour',
      '♟️ Chess → +3 PA Échecs/jour',
      '🔥 Combo Arabe+Chess+Skill → +3 PA Arabe · +3 PA Échecs · +2 PA Skill · +2 PA Mémoire',
      '⚔️ Boss Polyglotte, Arabophone, Conquerant → gros bonus Arabe · Échecs',
      '🧠 Skills Échecs, Arabe, Mémoire → +80 PA chacun',
    ],
    mental: [
      '📵 No Scroll → +1 PA Gestion ennui/jour',
      '✅ Journée parfaite → +2 PA Impulsions · +1 PA Stabilité',
      '🔥 Streak 7j → +8 PA Impulsions · +4 PA Stabilité',
      '🔥 Combo No Scroll+Nutrition → +2 PA Impulsions bonus',
      '⚔️ Boss Silence, Bain de Glace, Immersion, Stoïque → bonus Résistance · Stabilité',
    ],
    social: [
      '📜 Quêtes Social → +PA répartis sur Aisance · Communication',
      '⚔️ Boss Invisible Social, Exposé, Assertif, Leader → +PA Aisance · Présence',
      '✅ Journées parfaites consécutives → +PA Confiance indirect',
      '💡 Cet attribut se développe principalement via boss et quêtes Social',
    ],
    execution: [
      '📅 Chaque jour ≥ 7/10 → +1 PA Constance',
      '✅ Journée parfaite → +3 PA Priorisation · +5 PA Vitesse',
      '🔥 Streak 7j → +10 PA Vitesse · +8 PA Constance',
      '🔥 Streak 30j → +20 PA Vitesse · +15 PA Constance',
      '⚔️ Boss Tireur, Leader → +PA Finir · Priorisation',
      '💡 Cet attribut se développe surtout par la régularité et les boss',
    ],
  };
  const lines = sources[attrId] || [];
  return lines.map(l => `<div style="padding:1px 0;">• ${l}</div>`).join('');
}
function renderAttr() {
  const { attr, sub } = computeAttrPA();
  document.getElementById('attr-grid').innerHTML = ATTRIBUTES.map(a => {
    const total=attr[a.id]||0, level=paToLevel(total), prog=levelProg(total), remain=paRemain(total);
    const col = level>=80?'#fbbf24':level>=60?'#22c55e':level>=40?'#06b6d4':level>=20?'#a78bfa':a.color;
    // Texte narratif du palier actuel
    const narr = ATTR_NARRATIVES[a.id];
    const paliers = narr ? Object.keys(narr).map(Number).sort((a,b)=>b-a) : [];
    const currentPalier = paliers.find(p => level >= p);
    const narrativeText = currentPalier ? narr[currentPalier] : null;
    // Prochaine action
    const nextAction = getNextActionForAttr(a.id);
    // Sources PA
    const paFromBoss   = computeBossPA(a.id);
    const paFromQuests = computeQuestPAForAttr(a.id);
    const paFromSkills = computeSkillPAForAttr(a.id);
    return `<div class="attr-card" style="border-color:${a.color}18;">
      <div class="attr-hdr">
        <div class="attr-emoji">${a.emoji}</div>
        <div class="attr-title"><div class="attr-name" style="color:${a.color};">${a.name}</div><div class="attr-desc">${a.desc}</div></div>
        <div class="attr-lvl" style="background:${col}20;color:${col};border:1px solid ${col}38;">Niv.${level}</div>
      </div>
      <div class="attr-bar-meta"><span>${total} PA</span><span>${level>=100?'MAX ✅':remain+' PA → Niv.'+(level+1)}</span></div>
      <div class="attr-bar-bg"><div class="attr-bar-fill" style="width:${prog}%;background:${col};"></div></div>
      ${narrativeText ? `<div class="attr-narrative">「${narrativeText}」</div>` : ''}
      <div class="attr-subs">
        ${a.subs.map(s => {
          const sPA=sub[s.id]||0, sLvl=paToLevel(sPA), sProg=levelProg(sPA), sRem=paRemain(sPA);
          const sCol=sLvl>=80?'#fbbf24':sLvl>=50?'#22c55e':sLvl>=25?'#06b6d4':a.color;
          return `<div class="sub-card">
            <div class="sub-hdr"><div class="sub-nm">${s.name}</div><div class="sub-lvl" style="background:${sCol}20;color:${sCol};border:1px solid ${sCol}35;">Niv.${sLvl}</div></div>
            <div class="sub-bar-bg"><div class="sub-bar-fill" style="width:${sProg}%;background:${sCol};"></div></div>
            <div class="sub-pa">${sPA} PA · ${sLvl>=100?'MAX':sRem+' PA → Niv.'+(sLvl+1)} · ${s.desc}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="background:var(--surface2);border-radius:9px;padding:.52rem .75rem;font-size:.65rem;color:var(--text2);margin-bottom:6px;line-height:1.9;">
        <strong style="color:var(--text);">Sources PA — ${a.name} :</strong><br>
        ${getDetailedPASources(a.id)}
        <div style="margin-top:5px;padding-top:5px;border-top:1px solid var(--border);display:flex;gap:12px;flex-wrap:wrap;">
          <span>⚔️ Boss : <strong style="color:#a78bfa;">+${paFromBoss} PA</strong></span>
          <span>📜 Quêtes : <strong style="color:#fbbf24;">+${paFromQuests} PA</strong></span>
          <span>🧠 Skills : <strong style="color:#4ade80;">+${paFromSkills} PA</strong></span>
        </div>
      </div>
      ${nextAction ? `<div class="attr-next-action">→ ${nextAction}</div>` : ''}
      <div class="attr-goal">🎯 <strong>Objectif :</strong> ${a.goal}</div>
    </div>`;
  }).join('');
}

function getNextActionForAttr(attrId) {
  const today = toDay();
  const boss = getBosses().find(b => b.a === attrId && b.week === getWN(today));
  const weekKey = getQKey(today);
  const wn = getWN(today);
  const questIdx = computeQIndices(wn);
  const quest = questIdx.map(i => getQuests()[i]).find(q => q && q.a === attrId);
  const state = quest ? S.getQState(weekKey, quest.n) : null;
  if (boss) {
    const bd = S.boss()[`w${boss.week}_${new Date().getFullYear()}`];
    if (!bd || !bd.declared) return `Boss cette semaine : ${boss.i} ${boss.n} → +${BOSS_PA_BY_DIFF[boss.d]||60} PA si vaincu`;
  }
  if (quest && state && state.state === 'pending') return `Quête disponible : ${quest.i} ${quest.n} → +${QUEST_PA_BY_DIFF[quest.diff]||30} PA`;
  return null;
}

function computeBossPA(attrId) {
  let total = 0;
  const yr = new Date().getFullYear();
  const bossData = S.boss();
  getBosses().forEach(boss => {
    if (boss.a !== attrId) return;
    // Vérifie toutes les années possibles
    for (let y = yr - 1; y <= yr; y++) {
      const bd = bossData[`w${boss.week}_${y}`];
      if (bd && bd.declared === 'won') { total += BOSS_PA_BY_DIFF[boss.d] || 60; }
    }
  });
  return total;
}

function computeQuestPAForAttr(attrId) {
  let total = 0;
  const quests = getQuests();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.match(/^qw\d+_\d+__/)) continue;
    try {
      const v = JSON.parse(localStorage.getItem(k));
      if (!v || v.state !== 'done') continue;
      const qname = k.split('__').slice(1).join('__');
      const quest = quests.find(q => q.n === qname);
      if (quest && quest.a === attrId) total += QUEST_PA_BY_DIFF[quest.diff] || 30;
    } catch {}
  }
  return total;
}

function computeSkillPAForAttr(attrId) {
  let total = 0;
  const skillsData = S.skills();
  getSkillCats().forEach(cat => {
    if (SKILL_PA_MAP[cat.cat] !== attrId) return;
    cat.items.forEach(name => {
      if ((skillsData[name] || 0) === 2) total += SKILL_PA_AMOUNT;
    });
  });
  return total;
}

// ── SKILLS ──
function renderSkills() {
  const ss = S.skills();
  let allItems = [];
  getSkillCats().forEach(cat => cat.items.forEach(name => allItems.push({name, cat:cat.cat, icon:cat.icon})));
  const done=allItems.filter(s=>(ss[s.name]||0)===2).length;
  const prog=allItems.filter(s=>(ss[s.name]||0)===1).length;
  const total=allItems.length;
  const pct=Math.round((done+prog*0.5)/Math.max(total,1)*100);
  document.getElementById('skills-stats').innerHTML = `
    <div class="skill-stat-card"><div class="skill-stat-val" style="color:#4ade80;">${done}</div><div class="skill-stat-lbl">✅ Maîtrisées</div></div>
    <div class="skill-stat-card"><div class="skill-stat-val" style="color:#eab308;">${prog}</div><div class="skill-stat-lbl">⏳ En cours</div></div>
    <div class="skill-stat-card"><div class="skill-stat-val" style="color:var(--muted);">${total-done-prog}</div><div class="skill-stat-lbl">🔒 À faire</div></div>
    <div style="grid-column:1/-1;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:.75rem;">
      <div style="display:flex;justify-content:space-between;font-size:.65rem;color:var(--muted);margin-bottom:5px;"><span>Progression globale</span><span style="font-family:'DM Mono',monospace;color:var(--accent);">${pct}%</span></div>
      <div style="background:var(--surface2);border-radius:4px;height:6px;overflow:hidden;"><div style="width:${pct}%;height:100%;border-radius:4px;background:linear-gradient(90deg,#4ade80,#22c55e);transition:width 1s;"></div></div>
    </div>`;
  const cats=['Tout',...getSkillCats().map(c=>c.cat)];
  const catEl=document.getElementById('skill-cats'); catEl.innerHTML='';
  cats.forEach(c => {
    const btn=document.createElement('button'); btn.className='skill-cat-btn'+(c===skillCatFilter?' active':''); btn.textContent=c;
    btn.addEventListener('click',()=>{ skillCatFilter=c; renderSkills(); }); catEl.appendChild(btn);
  });
  filterSkills();
}

function filterSkills() {
  const ss=S.skills(), q=(document.getElementById('skills-search')||{}).value||'';
  let allItems=[];
  getSkillCats().forEach(cat=>cat.items.forEach(name=>allItems.push({name,cat:cat.cat,icon:cat.icon})));
  const items=allItems.filter(s=>(skillCatFilter==='Tout'||s.cat===skillCatFilter)&&(!q||s.name.toLowerCase().includes(q.toLowerCase())));
  const grid=document.getElementById('skills-grid'); grid.innerHTML='';
  items.forEach(s => {
    const st=ss[s.name]||0, cls=st===2?'done':st===1?'prog':'';
    const stE=st===2?'✅':st===1?'⏳':'○', stL=st===2?'Maîtrisé':st===1?'En cours':'Non commencé', stC=st===2?'#4ade80':st===1?'#eab308':'var(--muted)';
    const paReward = st < 2 ? `+${SKILL_PA_AMOUNT} PA à la maîtrise` : 'PA débloqués ✅';
    const card=document.createElement('div'); card.className='skill-card '+cls;
    card.innerHTML=`
      <div style="display:flex;align-items:flex-start;gap:7px;cursor:pointer;" class="skill-clickable">
        <div style="font-size:1.1rem;flex-shrink:0;margin-top:1px;">${s.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:.75rem;font-weight:600;line-height:1.3;margin-bottom:3px;">${s.name}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:.58rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;">${s.cat}</span>
            <span style="font-size:.65rem;font-weight:700;color:${stC};">${stE} ${stL}</span>
          </div>
          <div style="font-size:.58rem;color:#a78bfa;margin-top:3px;">${paReward}</div>
          ${st>0?`<div style="background:var(--surface3);border-radius:3px;height:3px;overflow:hidden;margin-top:5px;"><div style="height:100%;border-radius:3px;background:${st===2?'#4ade80':'#eab308'};width:${st===2?100:50}%;transition:width .8s;"></div></div>`:''}
        </div>
      </div>
      <div style="position:absolute;top:5px;right:5px;display:flex;gap:2px;">
        <button class="btn-edit-item skill-edit-btn">✏️</button>
        <button class="btn-del-item skill-del-btn">🗑</button>
      </div>`;
    card.querySelector('.skill-clickable').addEventListener('click', () => {
      const prev = ss[s.name]||0;
      cycleSkill(s.name);
      // Si on vient de maîtriser (passage à 2) → notifier
      if (prev === 1) {
        const attrId = SKILL_PA_MAP[s.cat];
        if (attrId) showToast(`🎉 Skill maîtrisé ! +${SKILL_PA_AMOUNT} PA ${attrId}`);
      }
    });
    card.querySelector('.skill-edit-btn').addEventListener('click', e => { e.stopPropagation(); openEditModal('editskill',{name:s.name,cat:s.cat}); });
    card.querySelector('.skill-del-btn').addEventListener('click', e => { e.stopPropagation(); deleteSkillByName(s.name,s.cat); });
    grid.appendChild(card);
  });
}

function cycleSkill(name) {
  const ss=S.skills(); ss[name]=((ss[name]||0)+1)%3; S.saveSkills(ss); filterSkills();
}

function showToast(msg) {
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(74,222,128,.15);border:1px solid rgba(74,222,128,.4);color:#4ade80;border-radius:12px;padding:.6rem 1.2rem;font-size:.78rem;font-weight:600;z-index:800;font-family:"DM Sans",sans-serif;white-space:nowrap;';
  t.textContent=msg; document.body.appendChild(t);
  setTimeout(()=>t.remove(), 3000);
}

// ── TITRES ──
function renderTitlesPage() {
  const unlocked = getUnlockedTitles();
  const unlockedIds = new Set(unlocked.map(t=>t.id));
  const equipped = S.equippedTitle();
  const el = document.getElementById('titles-page');
  if (!el) return;
  el.innerHTML = `
    <div style="font-size:.72rem;color:var(--muted);margin-bottom:1rem;">${unlocked.length} titre${unlocked.length>1?'s':''} débloqué${unlocked.length>1?'s':''} · Clique pour équiper</div>
    <div class="titles-grid">
      ${TITLES.map(t => {
        const isUnlocked = unlockedIds.has(t.id);
        const isEquipped = equipped === t.name;
        return `<div class="title-card ${isEquipped?'equipped':isUnlocked?'unlocked':'locked'}" data-title="${escAttr(t.name)}" ${isUnlocked?'':'style="pointer-events:none;"'}>
          <div class="title-name" style="color:${isEquipped?'#fbbf24':isUnlocked?'var(--text)':'var(--muted)'};">${isEquipped?'👑 ':isUnlocked?'✦ ':'🔒 '}${t.name}</div>
          <div class="title-status">${isEquipped?'Équipé':isUnlocked?'Débloqué':'Verrouillé'}</div>
        </div>`;
      }).join('')}
    </div>`;
  el.querySelectorAll('.title-card.unlocked, .title-card.equipped').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.title;
      S.saveEquippedTitle(equipped === name ? '' : name);
      renderTitlesPage(); renderEquippedTitle();
    });
  });
}

// ── CHRONIQUES ──
function renderChronicles() {
  updateChronicles(toDay());
  const events = S.chronicles();
  const el = document.getElementById('chronicles-page');
  if (!el) return;
  if (!events.length) {
    el.innerHTML = `<div style="font-size:.8rem;color:var(--muted);text-align:center;padding:2rem;">Aucun événement encore. Continue à jouer.</div>`;
    return;
  }
  el.innerHTML = `<div class="card">${events.slice().reverse().map(e => `
    <div class="chronicle-item">
      <div class="chronicle-date">${new Date(e.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</div>
      <div class="chronicle-text">${e.text}</div>
    </div>`).join('')}</div>`;
}

// ── GUIDE ──
function renderGuide() {
  const xp=computeXP(); const {sub}=computeAttrPA();
  const totalPA=Object.values(sub).reduce((a,b)=>a+b,0);
  document.getElementById('guide-content').innerHTML = `
    <div style="font-size:1rem;font-weight:700;margin-bottom:.8rem;">📖 Guide du Système</div>

    <div class="guide-section"><h3>🏆 Points de Discipline (PD) — Rang annuel</h3>
      <table class="guide-table">
        <tr><th>Source</th><th>PD</th></tr>
        <tr><td>1 habitude cochée</td><td><span class="guide-chip pd-chip">+10 PD</span></td></tr>
        <tr><td>Journée parfaite 10/10</td><td><span class="guide-chip pd-chip">+150 PD bonus</span></td></tr>
        <tr><td>Tous les 7 jours parfaits consécutifs</td><td><span class="guide-chip pd-chip">+300 PD</span></td></tr>
        <tr><td>Exactement 30 jours parfaits consécutifs</td><td><span class="guide-chip pd-chip">+1 000 PD bonus</span></td></tr>
        <tr><td>Exactement 100 jours parfaits consécutifs</td><td><span class="guide-chip pd-chip">+5 000 PD bonus</span></td></tr>
        <tr><td>Boss Commune vaincu</td><td><span class="guide-chip pd-chip">+400–500 PD</span></td></tr>
        <tr><td>Boss Rare vaincu</td><td><span class="guide-chip pd-chip">+500–700 PD</span></td></tr>
        <tr><td>Boss Épique vaincu</td><td><span class="guide-chip pd-chip">+700–950 PD</span></td></tr>
        <tr><td>Boss Légendaire vaincu</td><td><span class="guide-chip pd-chip">+900–1 500 PD</span></td></tr>
        <tr><td>Boss Mythique vaincu</td><td><span class="guide-chip pd-chip">+1 500–2 000 PD</span></td></tr>
        <tr><td>Quête Facile validée</td><td><span class="guide-chip pd-chip">+80–150 PD</span></td></tr>
        <tr><td>Quête Moyenne validée</td><td><span class="guide-chip pd-chip">+150–220 PD</span></td></tr>
        <tr><td>Quête Difficile validée</td><td><span class="guide-chip pd-chip">+220–400 PD</span></td></tr>
        <tr><td>Malus / Boutique</td><td><span class="guide-chip" style="background:rgba(248,113,113,.12);color:#f87171;">-PD</span></td></tr>
      </table>
      <div style="margin-top:.8rem;padding:.65rem .8rem;background:var(--surface2);border-radius:8px;font-size:.7rem;color:var(--text2);">
        📊 Ton solde : <strong>${xp.toLocaleString()} PD</strong> · Rang <strong>${getRank(xp).e} ${getRank(xp).n}</strong>
      </div>
    </div>

    <div class="guide-section"><h3>⚔️ Points Attribut (PA) — 3 sources</h3>
      <table class="guide-table">
        <tr><th>Source</th><th>PA</th></tr>
        <tr><td>Habitudes quotidiennes</td><td><span class="guide-chip pa-chip">2–3 PA/jour selon habitude</span></td></tr>
        <tr><td>Combo physique (Sport + Pushup)</td><td><span class="guide-chip pa-chip">+5 PA Physique bonus</span></td></tr>
        <tr><td>Combo spirituel (Coran + Prière + Islam)</td><td><span class="guide-chip pa-chip">+13 PA Spiritualité bonus</span></td></tr>
        <tr><td>Combo intellectuel (Arabe + Chess + Skill)</td><td><span class="guide-chip pa-chip">+10 PA Intelligence bonus</span></td></tr>
        <tr><td>Combo discipline (No Scroll + Nutrition)</td><td><span class="guide-chip pa-chip">+6 PA bonus</span></td></tr>
        <tr><td>Boss Commune vaincu</td><td><span class="guide-chip pa-chip">+60 PA</span></td></tr>
        <tr><td>Boss Rare vaincu</td><td><span class="guide-chip pa-chip">+130 PA</span></td></tr>
        <tr><td>Boss Épique vaincu</td><td><span class="guide-chip pa-chip">+220 PA</span></td></tr>
        <tr><td>Boss Légendaire vaincu</td><td><span class="guide-chip pa-chip">+350 PA</span></td></tr>
        <tr><td>Boss Mythique vaincu</td><td><span class="guide-chip pa-chip">+500 PA</span></td></tr>
        <tr><td>Quête Facile</td><td><span class="guide-chip pa-chip">+30 PA</span></td></tr>
        <tr><td>Quête Moyenne</td><td><span class="guide-chip pa-chip">+60 PA</span></td></tr>
        <tr><td>Quête Difficile</td><td><span class="guide-chip pa-chip">+100 PA</span></td></tr>
        <tr><td>Skill maîtrisé</td><td><span class="guide-chip pa-chip">+80 PA</span></td></tr>
      </table>
      <div style="margin-top:.8rem;padding:.65rem .8rem;background:var(--surface2);border-radius:8px;font-size:.7rem;color:var(--text2);">
        📊 Tes PA totaux : <strong>${totalPA.toLocaleString()} PA</strong>
      </div>
    </div>

    <div class="guide-section"><h3>📅 Temps estimé pour atteindre chaque rang</h3>
      <table class="guide-table">
        <tr><th>Rang</th><th>PD requis</th><th>Moyen 7/10</th><th>Sérieux 9/10</th><th>Parfait 10/10</th></tr>
        <tr><td>🪨 E → 🛡️ D</td><td>2 000</td><td>~29j</td><td>~22j</td><td>~8j</td></tr>
        <tr><td>🛡️ D → ⚔️ C</td><td>6 000</td><td>~86j</td><td>~67j</td><td>~24j</td></tr>
        <tr><td>⚔️ C → 🏹 B</td><td>14 000</td><td>~200j</td><td>~156j</td><td>~56j</td></tr>
        <tr><td>🏹 B → 🔥 A</td><td>28 000</td><td>~400j</td><td>~311j</td><td>~112j</td></tr>
        <tr><td>🔥 A → 💎 S</td><td>50 000</td><td>~714j</td><td>~556j</td><td>~200j</td></tr>
        <tr><td>💎 S → 👑 SS</td><td>80 000</td><td>~2.5ans</td><td>~2ans</td><td>~320j</td></tr>
        <tr><td>👑 SS → ⭐ SSS</td><td>120 000</td><td>~3.5ans</td><td>~2.7ans</td><td>~480j</td></tr>
      </table>
      <div style="margin-top:.8rem;padding:.65rem .8rem;background:var(--surface2);border-radius:8px;font-size:.7rem;color:var(--text2);">
        💡 Avec boss + quêtes réguliers : accélération de 50–70%. Profil Moyen = 7 habitudes/jour en moyenne. Profil Parfait = 10/10 chaque jour.
      </div>
    </div>

    <div class="guide-section"><h3>🔥 Combos quotidiens</h3>
      <table class="guide-table">
        <tr><th>Combo</th><th>Condition</th><th>Bonus PA</th></tr>
        <tr><td>💪 Combo Physique</td><td>Sport + Pushup le même jour</td><td><span class="guide-chip pa-chip">+5 PA Force/Endurance</span></td></tr>
        <tr><td>🌙 Combo Spirituel</td><td>Coran + Prière + Islam le même jour</td><td><span class="guide-chip pa-chip">+13 PA Spiritualité</span></td></tr>
        <tr><td>🧠 Combo Intellectuel</td><td>Arabe + Chess + Skill le même jour</td><td><span class="guide-chip pa-chip">+10 PA Intelligence</span></td></tr>
        <tr><td>⚔️ Combo Discipline</td><td>No Scroll + Nutrition le même jour</td><td><span class="guide-chip pa-chip">+6 PA Discipline/Mental</span></td></tr>
      </table>
    </div>

    <div class="guide-section"><h3>📊 Habitudes → PA détaillés</h3>
      <table class="guide-table">
        <tr><th>Habitude</th><th>PA par jour</th><th>Attribut</th></tr>
        <tr><td>🏃 Sport</td><td><span class="guide-chip pa-chip">+2 Force · +1 Endurance</span></td><td>Physique</td></tr>
        <tr><td>💪 Pushup</td><td><span class="guide-chip pa-chip">+2 Force</span></td><td>Physique</td></tr>
        <tr><td>🥗 Nutrition</td><td><span class="guide-chip pa-chip">+3 Qualité repas</span></td><td>Nutrition</td></tr>
        <tr><td>🙏 Prière</td><td><span class="guide-chip pa-chip">+3 Salat</span></td><td>Spiritualité</td></tr>
        <tr><td>📖 Coran</td><td><span class="guide-chip pa-chip">+3 Coran</span></td><td>Spiritualité</td></tr>
        <tr><td>🕌 Islam</td><td><span class="guide-chip pa-chip">+2 Connaissance</span></td><td>Spiritualité</td></tr>
        <tr><td>🗣️ Arabe</td><td><span class="guide-chip pa-chip">+3 Arabe</span></td><td>Intelligence</td></tr>
        <tr><td>🧠 Skill</td><td><span class="guide-chip pa-chip">+2 Compétences</span></td><td>Intelligence</td></tr>
        <tr><td>♟️ Chess</td><td><span class="guide-chip pa-chip">+3 Échecs</span></td><td>Intelligence</td></tr>
        <tr><td>📵 No Scroll</td><td><span class="guide-chip pa-chip">+2 No Scroll · +1 Gestion ennui</span></td><td>Discipline + Mental</td></tr>
      </table>
    </div>`;
}

// ── BOSS CALENDAR ──
function renderBossCalendar() {
  const today=toDay(), curWN=getWN(today), yr=new Date().getFullYear();
  const saved=S.boss(), bossList=getBosses();
  const container=document.getElementById('bosscal-content'); container.innerHTML='';
  const hdr=document.createElement('div'); hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:.8rem;';
  hdr.innerHTML=`<div><div style="font-size:1rem;font-weight:700;">👹 Boss</div><div style="font-size:.72rem;color:var(--muted);margin-top:2px;">Semaine en cours : ${curWN} · ${bossList.length} boss configurés</div></div>`;
  const addDiv=document.createElement('div'); addDiv.className='edit-actions';
  const addBtn=document.createElement('button'); addBtn.className='btn-add'; addBtn.textContent='➕ Boss';
  addBtn.addEventListener('click',()=>openEditModal('addboss')); addDiv.appendChild(addBtn); hdr.appendChild(addDiv); container.appendChild(hdr);
  if (!bossList.length) { const e=document.createElement('div'); e.style.cssText='text-align:center;padding:2rem;font-size:.8rem;color:var(--muted);'; e.textContent='Aucun boss. Clique sur ➕ Boss.'; container.appendChild(e); return; }
  const sorted=[...bossList].map((b,i)=>({...b,origIdx:i})).sort((a,b)=>(a.week||0)-(b.week||0));
  const list=document.createElement('div'); list.style.cssText='display:flex;flex-direction:column;gap:8px;';
  for (const boss of sorted) {
    const wn=boss.week, key=`w${wn}_${yr}`, bdata=saved[key];
    const isCur=wn===curWN, isPast=typeof wn==='number'&&wn<curWN;
    const dc={'Normale':'#22c55e','Difficile':'#f97316','Extreme':'#ef4444','Legendaire':'#fbbf24'};
    const col=dc[boss.d]||'#8b5cf6';
    let statusTxt='', statusCol='var(--muted)';
    if (bdata&&bdata.declared==='won')    { statusTxt='✅ Vaincu'; statusCol='#4ade80'; }
    else if (bdata&&bdata.declared==='failed') { statusTxt='❌ Échoué'; statusCol='#f87171'; }
    else if (isCur) { statusTxt='⚔️ En cours'; statusCol='#a78bfa'; }
    else if (isPast){ statusTxt='⏭️ Passé'; statusCol='var(--muted)'; }
    else if (typeof wn==='number') { statusTxt='🔒 À venir'; statusCol='var(--muted)'; }
    const row=document.createElement('div');
    row.style.cssText=`background:${isCur?'var(--surface3)':'var(--surface2)'};border:1px solid ${isCur?col+'44':'var(--border)'};border-radius:12px;padding:.8rem;display:flex;align-items:center;gap:10px;`;
    row.innerHTML=`
      <div style="font-size:1.4rem;flex-shrink:0;">${boss.i}</div>
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
          <span style="font-size:.7rem;font-family:'DM Mono',monospace;color:${isCur?col:'var(--muted)'};width:52px;flex-shrink:0;">${typeof wn==='number'?'Sem.'+wn:'Sem.?'}</span>
          <span style="font-size:.78rem;font-weight:700;${isCur?'color:'+col+';':''}">${boss.n}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span style="font-size:.6rem;background:${col}22;color:${col};border:1px solid ${col}38;padding:1px 7px;border-radius:10px;font-weight:700;">${boss.d}</span>
          <span style="font-size:.63rem;font-family:'DM Mono',monospace;color:#fbbf24;">+${boss.r} PD · +${BOSS_PA_BY_DIFF[boss.d]||60} PA</span>
        </div>
      </div>
      <div style="font-size:.68rem;font-weight:700;color:${statusCol};flex-shrink:0;">${statusTxt}</div>
      <div style="display:flex;gap:4px;flex-shrink:0;">
        <button class="btn-edit-item boss-cal-edit">✏️</button>
        <button class="btn-del-item boss-cal-del">🗑</button>
      </div>`;
    row.querySelector('.boss-cal-edit').addEventListener('click',()=>openEditModal('editboss',boss.origIdx));
    row.querySelector('.boss-cal-del').addEventListener('click',()=>deleteBoss(boss.origIdx));
    list.appendChild(row);
  }
  container.appendChild(list);
}

// ── QUEST LIST ──
function renderQuestList() {
  const diffColors={easy:'#22c55e',medium:'#ca8a04',hard:'#ef4444'};
  const diffLabels={easy:'Facile',medium:'Moyen',hard:'Difficile'};
  const attrMap={}; ATTRIBUTES.forEach(a=>attrMap[a.id]=a);
  const container=document.getElementById('questlist-content'); container.innerHTML='';
  const hdr=document.createElement('div'); hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:.8rem;';
  hdr.innerHTML=`<div style="font-size:.72rem;color:var(--muted);">${getQuests().length} quêtes disponibles</div>`;
  const addDiv=document.createElement('div'); addDiv.className='edit-actions';
  const addBtn=document.createElement('button'); addBtn.className='btn-add'; addBtn.textContent='➕ Quête';
  addBtn.addEventListener('click',()=>openEditModal('addquest')); addDiv.appendChild(addBtn); hdr.appendChild(addDiv); container.appendChild(hdr);
  const groups={}; getQuests().forEach((q,i)=>{ if(!groups[q.a]) groups[q.a]=[]; groups[q.a].push({...q,idx:i}); });
  const attrOrder=['physique','spiritualite','nutrition','social','discipline','mental','intelligence','execution'];
  for (const attrId of attrOrder) {
    const qs=groups[attrId]||[]; if(!qs.length) continue;
    const attr=attrMap[attrId]; if(!attr) continue;
    const section=document.createElement('div'); section.style.cssText='background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1rem;margin-bottom:10px;';
    section.innerHTML=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:.8rem;"><span style="font-size:1.2rem;">${attr.emoji}</span><span style="font-size:.82rem;font-weight:700;color:${attr.color};">${attr.name}</span><span style="font-size:.65rem;color:var(--muted);margin-left:auto;">${qs.length} quêtes</span></div>`;
    const qList=document.createElement('div'); qList.style.cssText='display:flex;flex-direction:column;gap:6px;';
    for (const q of qs) {
      const col=diffColors[q.diff], pa=QUEST_PA_BY_DIFF[q.diff]||30;
      const row=document.createElement('div');
      row.style.cssText=`background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:.65rem .8rem;display:flex;align-items:center;gap:8px;`;
      row.innerHTML=`
        <span style="font-size:1rem;flex-shrink:0;">${q.i}</span>
        <div style="flex:1;"><div style="font-size:.76rem;font-weight:600;">${q.n}</div><div style="font-size:.65rem;color:var(--text2);">${q.d}</div></div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:.63rem;background:${col}15;color:${col};border:1px solid ${col}35;padding:1px 7px;border-radius:8px;font-weight:700;margin-bottom:2px;">${diffLabels[q.diff]}</div>
          <div style="font-size:.63rem;color:#fbbf24;font-family:'DM Mono',monospace;">+${q.r} PD</div>
          <div style="font-size:.6rem;color:#a78bfa;">+${pa} PA</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px;flex-shrink:0;">
          <button class="btn-edit-item quest-edit-btn">✏️</button>
          <button class="btn-del-item quest-del-btn">🗑</button>
        </div>`;
      row.querySelector('.quest-edit-btn').addEventListener('click',()=>openEditModal('editquest',q.idx));
      row.querySelector('.quest-del-btn').addEventListener('click',()=>deleteQuest(q.idx));
      qList.appendChild(row);
    }
    section.appendChild(qList); container.appendChild(section);
  }
}

// ── HISTORIQUE ──
function renderHistFilter() {
  const filters=[{id:'all',label:'Tout'},{id:'boss',label:'Boss'},{id:'quest',label:'Quêtes'},{id:'won',label:'✅ Validé'},{id:'failed',label:'❌ Échoué'},{id:'pending',label:'⏳ En cours'}];
  const el=document.getElementById('hist-filter'); el.innerHTML='';
  filters.forEach(f=>{ const btn=document.createElement('button'); btn.className='hf-btn'+(f.id===histFil?' active':''); btn.textContent=f.label; btn.addEventListener('click',()=>{ histFil=f.id; renderHistFilter(); renderHistory(); }); el.appendChild(btn); });
}
function renderHistory() {
  renderHistFilter();
  const items=[];
  Object.entries(S.boss()).forEach(([key,b])=>{ const wn=parseInt(key.match(/^w(\d+)_/)?.[1]||'0'); const bd=getBosses().find(x=>x.week===wn); if(!bd) return; items.push({type:'boss',icon:bd.i,name:bd.n,sub:`Semaine ${wn} · ${bd.d}`,state:b.declared||'pending',date:`Sem. ${wn}`}); });
  for (let i=0;i<localStorage.length;i++) { const k=localStorage.key(i); if(!k||!k.match(/^qw(\d+)_(\d+)__/)) continue; try { const v=JSON.parse(localStorage.getItem(k)); if(!v||v.state==='pending') continue; const m=k.match(/^qw(\d+)_\d+__(.+)$/); if(!m) continue; const wn=parseInt(m[1]),qname=m[2]; const q=getQuests().find(x=>x.n===qname); items.push({type:'quest',icon:q?q.i:'🎯',name:qname,sub:`Quête · Semaine ${wn}`,state:v.state,date:`Sem. ${wn}`}); } catch {} }
  const filtered=items.filter(item=>{ if(histFil==='all') return true; if(histFil==='boss') return item.type==='boss'; if(histFil==='quest') return item.type==='quest'; if(histFil==='won') return item.state==='won'||item.state==='done'; if(histFil==='failed') return item.state==='failed'; if(histFil==='pending') return item.state==='pending'; return true; });
  const el=document.getElementById('hist-list');
  if(!filtered.length){el.innerHTML=`<div style="font-size:.78rem;color:var(--muted);text-align:center;padding:2rem;">Aucun élément</div>`;return;}
  el.innerHTML=filtered.reverse().map(item=>{ const sl=item.state==='won'||item.state==='done'?'✅ Validé':item.state==='failed'?'❌ Échoué':'⏳ En cours'; const sc=item.state==='won'||item.state==='done'?'won':item.state==='failed'?'failed':'pending'; return `<div class="hist-item"><div class="hist-ico">${item.icon}</div><div class="hist-info"><div class="hist-nm">${item.name}</div><div class="hist-sub">${item.sub}</div></div><div class="hist-st ${sc}">${sl}</div><div class="hist-date">${item.date}</div></div>`; }).join('');
}

// ── BADGES ──
function getBadges() {
  const today=toDay(), dates=Object.keys(allData).sort();
  const total=Object.values(allData).reduce((a,d)=>a+HABITS.filter(h=>d[h]).length,0);
  const perfect=dates.filter(d=>isPerfect(d)).length;
  const {streak,best}=computeStreak(today);
  const cc=h=>dates.filter(d=>allData[d]&&allData[d][h]).length;
  const cs=h=>{ let r=0,b=0; for(const d of dates){r=allData[d]&&allData[d][h]?r+1:0;if(r>b)b=r;} return b; };
  const bw=Object.values(S.boss()).filter(b=>b.declared==='won').length;
  const bl=Object.values(S.boss()).filter(b=>b.declared==='failed').length;
  let qw=0; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.match(/^qw\d+_\d+__/)){try{const v=JSON.parse(localStorage.getItem(k));if(v&&v.state==='done')qw++;}catch{}}}
  const sk=S.skills(), skillsDone=Object.values(sk).filter(v=>v===2).length;
  const xp=computeXP(), ri=getRankIdx(xp);
  return [
    {cat:'📅 Régularité'},
    {e:'🔥',n:'Premier Feu',h:'Streak de 7 jours parfaits',ok:best>=7},
    {e:'⚡',n:'Momentum 14j',h:'14 jours parfaits consécutifs',ok:best>=14},
    {e:'🔱',n:'30 Jours',h:'30 jours parfaits consécutifs',ok:best>=30},
    {e:'👑',n:'Centurion',h:'100 jours parfaits consécutifs',ok:best>=100},
    {cat:'⭐ Perfection'},
    {e:'💯',n:'Premier Parfait',h:'Première journée 10/10',ok:perfect>=1},
    {e:'⭐',n:'10 Parfaits',h:'10 journées 10/10',ok:perfect>=10},
    {e:'🌟',n:'30 Parfaits',h:'30 journées 10/10',ok:perfect>=30},
    {e:'✨',n:'100 Parfaits',h:'100 journées 10/10',ok:perfect>=100},
    {cat:'📿 Habitudes'},
    {e:'📖',n:'Dévotion',h:'Coran coché 30 fois',ok:cc('Coran')>=30},
    {e:'🌙',n:'Récitant',h:'Coran coché 100 fois',ok:cc('Coran')>=100},
    {e:'🤲',n:'Prière Constante',h:'Prière cochée 60 fois',ok:cc('Priere')>=60},
    {e:'📵',n:'Focus 14j',h:'No Scroll 14j consécutifs',ok:cs('No Scroll')>=14},
    {e:'🏃',n:'Athlète',h:'Sport 30j consécutifs',ok:cs('Sport')>=30},
    {e:'♟️',n:'Joueur Échecs',h:'Chess coché 30 fois',ok:cc('Chess')>=30},
    {cat:'📊 Volume'},
    {e:'🏅',n:'50 Jours',h:'50 jours trackés',ok:dates.length>=50},
    {e:'🎖️',n:'100 Jours',h:'100 jours trackés',ok:dates.length>=100},
    {e:'💎',n:'200 Jours',h:'200 jours trackés',ok:dates.length>=200},
    {e:'🏆',n:'Légendaire',h:'365 jours trackés',ok:dates.length>=365},
    {e:'💪',n:'500 Completions',h:'500 habitudes cochées',ok:total>=500},
    {e:'🦾',n:'1000 Completions',h:'1000 habitudes cochées',ok:total>=1000},
    {cat:'🏅 Rangs'},
    {e:'🛡️',n:'Rang D',h:'2 000 PD',ok:ri>=1},
    {e:'⚔️',n:'Rang C',h:'6 000 PD',ok:ri>=2},
    {e:'🏹',n:'Rang B',h:'14 000 PD',ok:ri>=3},
    {e:'🔥',n:'Rang A',h:'28 000 PD',ok:ri>=4},
    {e:'💎',n:'Rang S',h:'50 000 PD',ok:ri>=5},
    {cat:'⚔️ Boss et Quêtes'},
    {e:'⚔️',n:'Premier Boss',h:'Vaincre 1 boss',ok:bw>=1},
    {e:'🗡️',n:'5 Boss',h:'Vaincre 5 boss',ok:bw>=5},
    {e:'🔱',n:'10 Boss',h:'Vaincre 10 boss',ok:bw>=10},
    {e:'🛡️',n:'Invaincu',h:'3 boss sans défaite',ok:bw>=3&&bl===0},
    {e:'📜',n:'5 Quêtes',h:'Valider 5 quêtes',ok:qw>=5},
    {e:'📋',n:'15 Quêtes',h:'Valider 15 quêtes',ok:qw>=15},
    {cat:'🧠 Skills'},
    {e:'🌱',n:'Premiers Pas',h:'Maîtriser 5 compétences',ok:skillsDone>=5},
    {e:'📚',n:'Apprenant',h:'Maîtriser 20 compétences',ok:skillsDone>=20},
    {e:'🎓',n:'Expert',h:'Maîtriser 50 compétences',ok:skillsDone>=50},
  ];
}
function renderBadgesPage() {
  const badges=getBadges(); let html='',inGrid=false;
  for (const b of badges) {
    if (b.cat) { if(inGrid){html+='</div>';inGrid=false;} html+=`<div class="badge-cat">${b.cat}</div><div class="badges-grid">`; inGrid=true; }
    else html+=`<div class="badge-card${b.ok?' earned':' locked'}"><div class="badge-hdr"><div class="badge-emoji">${b.e}</div><div class="badge-nm">${b.n}</div><div class="badge-st">${b.ok?'✅':'🔒'}</div></div><div class="badge-how${b.ok?' ok':''}">${b.ok?'Badge obtenu !':b.h}</div></div>`;
  }
  if(inGrid) html+='</div>';
  document.getElementById('badges-page').innerHTML=html;
}

// ── BOUTIQUE ──
function renderShop() {
  const avail=computePD(), xp=computeXP(), ri=getRankIdx(xp);
  document.getElementById('pd-val').textContent=avail.toLocaleString()+' PD';
  document.getElementById('pd-rank').textContent=`Rang : ${getRank(xp).e} ${getRank(xp).n}`;
  const shopGrid=document.getElementById('shop-grid'); shopGrid.innerHTML='';
  getBonuses().forEach((b,i)=>{
    const locked=ri<b.mr||avail<b.c;
    const lockMsg=ri<b.mr?`Rang ${RANKS[b.mr]?RANKS[b.mr].n:'supérieur'} requis`:avail<b.c?`${(b.c-avail).toLocaleString()} PD manquants`:'';
    const card=document.createElement('div'); card.className='shop-card'+(locked?' locked':'');
    card.innerHTML=`<div class="shop-emoji">${b.e}</div><div class="shop-nm">${b.n}</div><div class="shop-cost">-${b.c} PD</div><div class="shop-cond">${b.cond||''}</div>${locked&&lockMsg?`<div class="shop-lock">🔒 ${lockMsg}</div>`:''}<div style="position:absolute;top:5px;right:5px;display:flex;gap:2px;"><button class="btn-edit-item shop-edit-btn">✏️</button><button class="btn-del-item shop-del-btn">🗑</button></div>`;
    if(!locked) card.style.cursor='pointer';
    card.addEventListener('click',e=>{if(!locked&&!e.target.closest('button'))buyBonus(i);});
    card.querySelector('.shop-edit-btn').addEventListener('click',e=>{e.stopPropagation();openEditModal('editbonus',i);});
    card.querySelector('.shop-del-btn').addEventListener('click',e=>{e.stopPropagation();deleteBonus(i);});
    shopGrid.appendChild(card);
  });
  const malusGrid=document.getElementById('malus-grid'); malusGrid.innerHTML='';
  getMaluses().forEach((m,i)=>{
    const card=document.createElement('div'); card.className='shop-card'; card.style.cursor='pointer';card.style.borderColor='rgba(248,113,113,.2)';
    card.innerHTML=`<div class="shop-emoji">${m.e}</div><div class="shop-nm">${m.n}</div><div class="shop-cost" style="color:#f87171;">-${m.c} PD</div><div style="font-size:.58rem;color:#f87171;margin-top:2px;">Enregistrer un écart</div><div style="position:absolute;top:5px;right:5px;display:flex;gap:2px;"><button class="btn-edit-item malus-edit-btn">✏️</button><button class="btn-del-item malus-del-btn">🗑</button></div>`;
    card.addEventListener('click',e=>{if(!e.target.closest('button'))applyMalus(i);});
    card.querySelector('.malus-edit-btn').addEventListener('click',e=>{e.stopPropagation();openEditModal('editmalus',i);});
    card.querySelector('.malus-del-btn').addEventListener('click',e=>{e.stopPropagation();deleteMalus(i);});
    malusGrid.appendChild(card);
  });
  const txs=S.tx(), el=document.getElementById('tx-log');
  if(!txs.length){el.innerHTML=`<div style="font-size:.76rem;color:var(--muted);text-align:center;padding:1rem;">Aucune transaction</div>`;return;}
  el.innerHTML=txs.slice(0,30).map(t=>`<div class="tx-item"><span style="font-size:.9rem;">${t.e||'💀'}</span><span class="tx-desc">${t.n||t.desc||''}</span><span class="tx-amt">-${t.c||t.amount||0} PD</span><span class="tx-date">${t.date||''}</span></div>`).join('');
}

function buyBonus(idx) {
  const b=getBonuses()[idx], avail=computePD();
  if(avail<b.c){alert('PD insuffisants !');return;}
  showConfirmDialog(`Dépenser ${b.c} PD ?`,`${b.e} ${b.n}`,()=>{ const tx=S.tx(); tx.unshift({id:Date.now(),e:b.e,n:b.n,c:b.c,amount:b.c,date:toDay()}); S.saveTx(tx); renderShop(); renderXP(); });
}
function applyMalus(idx) {
  const m=getMaluses()[idx];
  showConfirmDialog('Enregistrer un écart ?',`${m.e} ${m.n} — -${m.c} PD`,()=>{ const mal=S.malus(); mal.push({key:'manual_'+Date.now(),amount:m.c,reason:m.n,date:toDay()}); S.saveMalus(mal); renderShop(); renderXP(); });
}
function computePD() { return computeXP(); }

// ── EDIT MODE ──
function toggleEditMode() {
  editMode=!editMode;
  document.getElementById('dashboard').classList.toggle('edit-mode',editMode);
  document.getElementById('edit-dot').classList.toggle('on',editMode);
  document.getElementById('edit-toggle-btn').classList.toggle('active',editMode);
  document.getElementById('edit-mode-label').textContent=editMode?'✏️ Mode édition actif':'Mode normal';
  document.getElementById('edit-mode-label').style.color=editMode?'#f97316':'var(--muted)';
  const activeTab=document.querySelector('.tab-btn.active');
  if(activeTab) switchTab(activeTab.dataset.tab);
  // Rafraîchit le bouton régénérer selon le mode
  if (document.getElementById('tab-today').classList.contains('active')) {
    renderRegenBtn(toDay());
  }
}

// ── MODAL ──
function openEditModal(type, idxOrData) {
  editModalCtx={type,idx:typeof idxOrData==='number'?idxOrData:null,data:typeof idxOrData==='object'?idxOrData:null};
  const titles={addboss:'➕ Nouveau boss',editboss:'✏️ Modifier boss',addquest:'➕ Nouvelle quête',editquest:'✏️ Modifier quête',addbonus:'➕ Nouveau bonus',editbonus:'✏️ Modifier bonus',addmalus:'➕ Nouveau malus',editmalus:'✏️ Modifier malus',addskill:'➕ Nouveau skill',editskill:'✏️ Modifier skill'};
  document.getElementById('edit-modal-title').textContent=titles[type]||'Modifier';
  const body=document.getElementById('edit-modal-body'), idx=editModalCtx.idx;
  if (type==='addboss'||type==='editboss') {
    const d=type==='editboss'?getBosses()[idx]:{n:'',i:'👹',d:'Difficile',l:'',r:500,a:'discipline',s:[],week:null};
    if(!d){closeEditModal();return;}
    const usedWeeks=getBosses().map((b,i)=>i!==idx?b.week:null).filter(w=>typeof w==='number');
    body.innerHTML=`<div class="m-field"><label>Emoji</label><input id="mf-icon" value="${escAttr(d.i||'👹')}"></div><div class="m-field"><label>Nom</label><input id="mf-name" value="${escAttr(d.n||'')}"></div><div class="m-field"><label>Difficulté</label><select id="mf-diff">${['Normale','Difficile','Extreme','Legendaire'].map(x=>`<option ${d.d===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="m-field"><label>Lore</label><textarea id="mf-lore" rows="3">${escAttr(d.l||'')}</textarea></div><div class="m-field"><label>Récompense PD</label><input id="mf-reward" type="number" value="${d.r||500}"></div><div class="m-field"><label>Attribut</label><select id="mf-attr">${ATTRIBUTES.map(a=>`<option value="${a.id}" ${d.a===a.id?'selected':''}>${a.emoji} ${a.name}</option>`).join('')}</select></div><div class="m-field"><label>Numéro de semaine (1–52)</label><input id="mf-week" type="number" min="1" max="52" value="${typeof d.week==='number'?d.week:''}" placeholder="ex : 23"><div style="font-size:.62rem;color:var(--muted);margin-top:3px;">Semaines prises : ${usedWeeks.length?usedWeeks.sort((a,b)=>a-b).join(', '):'aucune'}</div></div><div class="m-field"><label>Étapes checklist (une par ligne)</label><textarea id="mf-steps" rows="6">${(d.s||[]).join('\n')}</textarea></div>`;
  } else if (type==='addquest'||type==='editquest') {
    const d=type==='editquest'?getQuests()[idx]:{i:'🎯',n:'',d:'',diff:'medium',r:150,a:'execution'};
    if(!d){closeEditModal();return;}
    body.innerHTML=`<div class="m-field"><label>Emoji</label><input id="mf-icon" value="${escAttr(d.i||'🎯')}"></div><div class="m-field"><label>Nom</label><input id="mf-name" value="${escAttr(d.n||'')}"></div><div class="m-field"><label>Description</label><textarea id="mf-desc" rows="2">${escAttr(d.d||'')}</textarea></div><div class="m-field"><label>Difficulté</label><select id="mf-diff"><option value="easy" ${d.diff==='easy'?'selected':''}>Facile</option><option value="medium" ${d.diff==='medium'?'selected':''}>Moyen</option><option value="hard" ${d.diff==='hard'?'selected':''}>Difficile</option></select></div><div class="m-field"><label>Récompense PD</label><input id="mf-reward" type="number" value="${d.r||150}"></div><div class="m-field"><label>Attribut</label><select id="mf-attr">${ATTRIBUTES.map(a=>`<option value="${a.id}" ${d.a===a.id?'selected':''}>${a.emoji} ${a.name}</option>`).join('')}</select></div>`;
  } else if (type==='addbonus'||type==='editbonus') {
    const d=type==='editbonus'?getBonuses()[idx]:{e:'🎁',n:'',c:500,cond:'',mr:0};
    if(!d){closeEditModal();return;}
    body.innerHTML=`<div class="m-field"><label>Emoji</label><input id="mf-icon" value="${escAttr(d.e||'🎁')}"></div><div class="m-field"><label>Nom</label><input id="mf-name" value="${escAttr(d.n||'')}"></div><div class="m-field"><label>Coût PD</label><input id="mf-cost" type="number" value="${d.c||500}"></div><div class="m-field"><label>Condition</label><input id="mf-cond" value="${escAttr(d.cond||'')}"></div><div class="m-field"><label>Rang min (0-7)</label><input id="mf-minrank" type="number" value="${d.mr||0}" min="0" max="7"></div>`;
  } else if (type==='addmalus'||type==='editmalus') {
    const d=type==='editmalus'?getMaluses()[idx]:{e:'💀',n:'',c:300};
    if(!d){closeEditModal();return;}
    body.innerHTML=`<div class="m-field"><label>Emoji</label><input id="mf-icon" value="${escAttr(d.e||'💀')}"></div><div class="m-field"><label>Nom</label><input id="mf-name" value="${escAttr(d.n||'')}"></div><div class="m-field"><label>Pénalité PD</label><input id="mf-cost" type="number" value="${d.c||300}"></div>`;
  } else if (type==='addskill'||type==='editskill') {
    const d=editModalCtx.data||{name:'',cat:getSkillCats()[0]?.cat||'Calisthenics'};
    body.innerHTML=`<div class="m-field"><label>Nom du skill</label><input id="mf-skillname" value="${escAttr(d.name||'')}"></div><div class="m-field"><label>Catégorie</label><select id="mf-skillcat">${getSkillCats().map(c=>`<option value="${escAttr(c.cat)}" ${d.cat===c.cat?'selected':''}>${c.cat}</option>`).join('')}<option value="__new__">➕ Nouvelle catégorie...</option></select></div><div class="m-field" id="mf-newcat-wrap" style="display:none;"><label>Nouvelle catégorie</label><input id="mf-newcat" placeholder="ex: Yoga"></div>`;
    setTimeout(()=>{ const sel=document.getElementById('mf-skillcat'); if(sel) sel.addEventListener('change',()=>{ document.getElementById('mf-newcat-wrap').style.display=sel.value==='__new__'?'block':'none'; }); },50);
  }
  document.getElementById('edit-modal').classList.add('open');
}

function closeEditModal() { document.getElementById('edit-modal').classList.remove('open'); editModalCtx=null; }

function saveEditModal() {
  if(!editModalCtx) return;
  const {type,idx}=editModalCtx;
  const g=id=>{ const el=document.getElementById(id); return el?el.value:''; };
  if (type==='addboss'||type==='editboss') {
    const steps=g('mf-steps').split('\n').map(s=>s.trim()).filter(Boolean);
    const weekVal=parseInt(g('mf-week'));
    const nb={n:g('mf-name'),i:g('mf-icon')||'👹',d:g('mf-diff'),l:g('mf-lore'),r:parseInt(g('mf-reward'))||500,a:g('mf-attr'),s:steps.length?steps:['Compléter le défi'],week:isNaN(weekVal)?null:weekVal};
    if(!nb.n){alert('Nom requis');return;}
    if(typeof nb.week==='number'){const list0=getBosses();const conflict=list0.findIndex((b,i)=>b.week===nb.week&&i!==idx);if(conflict>=0){alert(`La semaine ${nb.week} est déjà assignée au boss "${list0[conflict].n}".`);return;}}
    const list=JSON.parse(JSON.stringify(getBosses()));
    if(type==='editboss'&&idx!==null) list[idx]=nb; else list.push(nb);
    S.saveCustomBosses(list); closeEditModal(); renderBossCalendar(); renderBoss(toDay());
  } else if (type==='addquest'||type==='editquest') {
    const nq={i:g('mf-icon')||'🎯',n:g('mf-name'),d:g('mf-desc'),diff:g('mf-diff'),r:parseInt(g('mf-reward'))||150,a:g('mf-attr')};
    if(!nq.n){alert('Nom requis');return;}
    const list=JSON.parse(JSON.stringify(getQuests()));
    if(type==='editquest'&&idx!==null) list[idx]=nq; else list.push(nq);
    S.saveCustomQuests(list); closeEditModal(); renderQuestList(); renderQuests(toDay());
  } else if (type==='addbonus'||type==='editbonus') {
    const nb={e:g('mf-icon')||'🎁',n:g('mf-name'),c:parseInt(g('mf-cost'))||500,cond:g('mf-cond'),mr:parseInt(g('mf-minrank'))||0};
    if(!nb.n){alert('Nom requis');return;}
    const list=JSON.parse(JSON.stringify(getBonuses()));
    if(type==='editbonus'&&idx!==null) list[idx]=nb; else list.push(nb);
    S.saveCustomBonuses(list); closeEditModal(); renderShop();
  } else if (type==='addmalus'||type==='editmalus') {
    const nm={e:g('mf-icon')||'💀',n:g('mf-name'),c:parseInt(g('mf-cost'))||300};
    if(!nm.n){alert('Nom requis');return;}
    const list=JSON.parse(JSON.stringify(getMaluses()));
    if(type==='editmalus'&&idx!==null) list[idx]=nm; else list.push(nm);
    S.saveCustomMaluses(list); closeEditModal(); renderShop();
  } else if (type==='addskill'||type==='editskill') {
    const skillName=g('mf-skillname').trim(); if(!skillName){alert('Nom requis');return;}
    let catName=g('mf-skillcat'); if(catName==='__new__') catName=g('mf-newcat').trim()||'Divers';
    const cats=JSON.parse(JSON.stringify(getSkillCats()));
    if(type==='editskill'&&editModalCtx.data){const old=cats.find(c=>c.cat===editModalCtx.data.cat);if(old)old.items=old.items.filter(i=>i!==editModalCtx.data.name);}
    let cat=cats.find(c=>c.cat===catName); if(!cat){cat={cat:catName,icon:'🔧',items:[]};cats.push(cat);}
    if(!cat.items.includes(skillName)) cat.items.push(skillName);
    S.saveCustomSkillCats(cats); closeEditModal(); renderSkills();
  }
}

// ── DELETE ──
function deleteBoss(idx)  { showConfirmDialog('Supprimer ce boss ?','Irréversible.',()=>{const list=JSON.parse(JSON.stringify(getBosses()));list.splice(idx,1);S.saveCustomBosses(list);renderBossCalendar();renderBoss(toDay());}); }
function deleteQuest(idx) { showConfirmDialog('Supprimer cette quête ?','',()=>{const list=JSON.parse(JSON.stringify(getQuests()));list.splice(idx,1);S.saveCustomQuests(list);renderQuestList();}); }
function deleteBonus(idx) { showConfirmDialog('Supprimer ce bonus ?','',()=>{const list=JSON.parse(JSON.stringify(getBonuses()));list.splice(idx,1);S.saveCustomBonuses(list);renderShop();}); }
function deleteMalus(idx) { showConfirmDialog('Supprimer ce malus ?','',()=>{const list=JSON.parse(JSON.stringify(getMaluses()));list.splice(idx,1);S.saveCustomMaluses(list);renderShop();}); }
function deleteSkillByName(name,cat) { showConfirmDialog('Supprimer ce skill ?','',()=>{const cats=JSON.parse(JSON.stringify(getSkillCats()));const c=cats.find(x=>x.cat===cat);if(c)c.items=c.items.filter(i=>i!==name);S.saveCustomSkillCats(cats);renderSkills();}); }

// ── CONFIRM ──
function showConfirmDialog(title,desc,cb) { _confirmCb=cb; document.getElementById('confirm-title').textContent=title; document.getElementById('confirm-desc').textContent=desc; document.getElementById('confirm-overlay').classList.add('open'); }
function closeConfirm() { document.getElementById('confirm-overlay').classList.remove('open'); _confirmCb=null; }
function executeConfirm() { const cb=_confirmCb; closeConfirm(); if(cb) cb(); }

// ── RESET ──
function showResetMenu() {
  const opts=[{l:'Reset boss semaine',f:()=>confirmReset('boss')},{l:'Reset quêtes semaine',f:()=>confirmReset('quests')},{l:'Reset boutique',f:()=>confirmReset('transactions')},{l:'Reset TOUT',f:()=>confirmReset('all')}];
  const existing=document.getElementById('reset-menu-popup'); if(existing){existing.remove();return;}
  const menu=document.createElement('div'); menu.id='reset-menu-popup';
  menu.style.cssText='position:fixed;top:90px;right:8px;background:var(--surface3);border:1px solid var(--border2);border-radius:12px;padding:.5rem;z-index:300;min-width:200px;box-shadow:0 4px 24px rgba(0,0,0,.4);';
  opts.forEach((o,i)=>{ const item=document.createElement('div'); item.style.cssText=`padding:.45rem .75rem;border-radius:8px;font-size:.76rem;cursor:pointer;color:${i===3?'#f87171':'var(--text)'};`; item.textContent=o.l; item.addEventListener('click',()=>{o.f();menu.remove();}); menu.appendChild(item); });
  document.body.appendChild(menu);
  setTimeout(()=>document.addEventListener('click',()=>{menu.remove();},{once:true}),100);
}
function confirmReset(type) { const labels={boss:'boss de la semaine',quests:'quêtes de la semaine',transactions:'historique boutique',all:'TOUT le système'}; showConfirmDialog(`Reset ${labels[type]||type} ?`,'Irréversible.',()=>doReset(type)); }
function doReset(type) {
  const t=toDay(), curWN=getWN(t), yr=new Date().getFullYear();
  if(type==='boss'){const selectedWN=parseInt(localStorage.getItem('ht_boss_wn')||String(curWN));const b=S.boss();delete b[`w${selectedWN}_${yr}`];S.saveBoss(b);renderBoss(t);}
  if(type==='quests'){S.clearQStates(getQKey(t));renderQuests(t);}
  if(type==='transactions'){S.saveTx([]);renderShop();}
  if(type==='all'){['ht_boss','ht_q4','ht_m4','ht_tx','ht_seq'].forEach(k=>localStorage.removeItem(k));const toRemove=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.match(/^qw\d+_\d+__/))toRemove.push(k);}toRemove.forEach(k=>localStorage.removeItem(k));}
  renderXP(); renderToday();
}

// ══════════════════════════════════════════════
// REGISTRE DU CHASSEUR — Rapports hebdomadaires
// ══════════════════════════════════════════════

function renderReportPage() {
  const el = document.getElementById('report-page');
  if (!el) return;

  const reports = getAllReports();
  const today = toDay();

  if (!reports.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;">
        <div style="font-size:2rem;margin-bottom:1rem;">📋</div>
        <div style="font-size:.85rem;color:var(--muted);line-height:1.7;">
          Le premier rapport sera généré automatiquement<br>
          le <strong style="color:var(--text);">prochain dimanche après 18h</strong><br>
          à l'ouverture du site.
        </div>
      </div>`;
    return;
  }

  el.innerHTML = '';

  reports.forEach((report, idx) => {
    const isLatest = idx === 0;
    const date = new Date(report.generatedAt);
    const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const pct = Math.round((report.completionRate || 0) * 100);
    const pctColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444';

    const bossChip = report.boss
      ? report.boss.declared === 'won'
        ? `<span style="font-size:.6rem;background:rgba(74,222,128,.12);color:#4ade80;border:1px solid rgba(74,222,128,.25);border-radius:6px;padding:1px 7px;font-weight:700;">⚔️ Boss vaincu</span>`
        : report.boss.declared === 'failed'
        ? `<span style="font-size:.6rem;background:rgba(248,113,113,.12);color:#f87171;border:1px solid rgba(248,113,113,.25);border-radius:6px;padding:1px 7px;font-weight:700;">💀 Boss échoué</span>`
        : `<span style="font-size:.6rem;background:rgba(139,92,246,.12);color:#a78bfa;border:1px solid rgba(139,92,246,.25);border-radius:6px;padding:1px 7px;font-weight:700;">${report.boss.icon} ${report.boss.hpPct}% HP</span>`
      : '';

    const card = document.createElement('div');
    card.style.cssText = `
      background:var(--surface);
      border:1px solid ${isLatest ? 'rgba(74,222,128,.25)' : 'var(--border)'};
      border-radius:16px;
      margin-bottom:10px;
      overflow:hidden;
      ${isLatest ? 'box-shadow:0 0 20px rgba(74,222,128,.06);' : ''}
    `;

    // Header cliquable pour les anciens rapports
    const header = document.createElement('div');
    header.style.cssText = `
      display:flex;align-items:center;justify-content:space-between;
      padding:.85rem 1rem;cursor:${isLatest ? 'default' : 'pointer'};
      gap:8px;flex-wrap:wrap;
    `;
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <div style="font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">
          ${report.weekKey}
        </div>
        <div style="font-size:.72rem;color:var(--text2);">${dateStr}</div>
        ${isLatest ? `<span style="font-size:.6rem;background:rgba(74,222,128,.12);color:#4ade80;border:1px solid rgba(74,222,128,.25);border-radius:6px;padding:1px 7px;font-weight:700;">Dernière semaine</span>` : ''}
        ${bossChip}
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <div style="font-size:1rem;font-weight:700;font-family:'DM Mono',monospace;color:${pctColor};">${pct}%</div>
        ${!isLatest ? `<div style="font-size:.7rem;color:var(--muted);" class="report-chevron">▾</div>` : ''}
      </div>`;

    // Contenu du rapport
    const body = document.createElement('div');
    body.style.cssText = `
      padding:0 1rem 1rem;
      display:${isLatest ? 'block' : 'none'};
    `;

    body.innerHTML = `
      <!-- Stats rapides -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;">
        <div style="background:var(--surface2);border-radius:10px;padding:.6rem;text-align:center;">
          <div style="font-size:1.1rem;font-weight:700;font-family:'DM Mono',monospace;color:${pctColor};">${pct}%</div>
          <div style="font-size:.58rem;color:var(--muted);margin-top:1px;text-transform:uppercase;letter-spacing:.06em;">Complétion</div>
        </div>
        <div style="background:var(--surface2);border-radius:10px;padding:.6rem;text-align:center;">
          <div style="font-size:1.1rem;font-weight:700;font-family:'DM Mono',monospace;color:#f97316;">${report.streak || 0}j</div>
          <div style="font-size:.58rem;color:var(--muted);margin-top:1px;text-transform:uppercase;letter-spacing:.06em;">Streak</div>
        </div>
        <div style="background:var(--surface2);border-radius:10px;padding:.6rem;text-align:center;">
          <div style="font-size:1.1rem;font-weight:700;font-family:'DM Mono',monospace;color:#4ade80;">${report.questsDone || 0}</div>
          <div style="font-size:.58rem;color:var(--muted);margin-top:1px;text-transform:uppercase;letter-spacing:.06em;">Quêtes ✅</div>
        </div>
      </div>

      <!-- Bloc 1 -->
      <div style="margin-bottom:8px;">
        <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;color:#4ade80;font-weight:700;margin-bottom:5px;">
          ▸ Ce que tu as construit
        </div>
        <div style="font-size:.78rem;color:var(--text);line-height:1.7;background:rgba(74,222,128,.05);border:1px solid rgba(74,222,128,.1);border-left:2px solid #4ade80;border-radius:0 8px 8px 0;padding:.65rem .85rem;">
          ${report.built || '—'}
        </div>
      </div>

      <!-- Bloc 2 -->
      <div style="margin-bottom:8px;">
        <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;color:#f87171;font-weight:700;margin-bottom:5px;">
          ▸ Ce qui a résisté
        </div>
        <div style="font-size:.78rem;color:var(--text);line-height:1.7;background:rgba(248,113,113,.05);border:1px solid rgba(248,113,113,.1);border-left:2px solid #f87171;border-radius:0 8px 8px 0;padding:.65rem .85rem;">
          ${report.resisted || '—'}
        </div>
      </div>

      <!-- Bloc 3 -->
      <div style="margin-bottom:8px;">
        <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;color:#60a5fa;font-weight:700;margin-bottom:5px;">
          ▸ Ce que les données disent de toi
        </div>
        <div style="font-size:.78rem;color:var(--text);line-height:1.7;background:rgba(96,165,250,.05);border:1px solid rgba(96,165,250,.1);border-left:2px solid #60a5fa;border-radius:0 8px 8px 0;padding:.65rem .85rem;">
          ${report.pattern || '—'}
        </div>
      </div>

      <!-- Bloc 4 -->
      <div style="margin-bottom:8px;">
        <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;color:#a78bfa;font-weight:700;margin-bottom:5px;">
          ▸ État du combat
        </div>
        <div style="font-size:.78rem;color:var(--text);line-height:1.7;background:rgba(139,92,246,.05);border:1px solid rgba(139,92,246,.1);border-left:2px solid #a78bfa;border-radius:0 8px 8px 0;padding:.65rem .85rem;">
          ${report.bossStatus || '—'}
        </div>
      </div>

      <!-- Bloc 5 — Directive -->
      <div style="background:linear-gradient(135deg,rgba(251,191,36,.08),rgba(245,158,11,.04));border:1px solid rgba(251,191,36,.25);border-radius:12px;padding:.85rem 1rem;">
        <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;color:#fbbf24;font-weight:700;margin-bottom:6px;">
          ⚡ Directive
        </div>
        <div style="font-size:.82rem;color:#fef3c7;line-height:1.7;font-weight:500;">
          ${report.directive || '—'}
        </div>
      </div>
    `;

    card.appendChild(header);
    card.appendChild(body);
    el.appendChild(card);

    // Toggle pour les anciens rapports
    if (!isLatest) {
      header.addEventListener('click', () => {
        const isOpen = body.style.display === 'block';
        body.style.display = isOpen ? 'none' : 'block';
        const chevron = header.querySelector('.report-chevron');
        if (chevron) chevron.textContent = isOpen ? '▾' : '▴';
      });
    }
  });

  // Bouton forcer génération en mode édition
  if (editMode) {
    const forceBtn = document.createElement('button');
    forceBtn.style.cssText = `
      width:100%;background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.3);
      color:#60a5fa;border-radius:10px;padding:.6rem;cursor:pointer;
      font-family:'DM Sans',sans-serif;font-weight:600;font-size:.75rem;margin-top:4px;
    `;
    forceBtn.textContent = '↻ Forcer la génération du rapport (mode édition)';
    forceBtn.addEventListener('click', () => {
      const today = toDay();
      localStorage.removeItem(getReportKey(today));
      generateWeeklyReport(today);
      renderReportPage();
      showToast('📋 Rapport généré');
    });
    el.appendChild(forceBtn);
  }
}
// ══════════════════════════════════════════════
// CONTRAT DU CHASSEUR — UI
// ══════════════════════════════════════════════

function showContractPopup() {
  const overlay = document.getElementById('contract-overlay');
  if (!overlay) return;

  const today = toDay();
  const wn = getWN(today);
  const yr = new Date().getFullYear();
  const boss = getBossByWeek(wn);

  // Options engagement
  const engagementOptions = [
    'Maintenir mon streak',
    boss ? `Vaincre ${boss.i} ${boss.n}` : 'Vaincre le boss actif',
    'Progresser en Discipline',
    'Progresser en Physique',
    'Progresser en Spiritualité',
    'Progresser en Intelligence',
    'Progresser en Mental',
    'Progresser en Nutrition',
    'Progresser en Social',
    'Progresser en Exécution',
    'Compléter ma quête principale',
    'Reprendre après une période difficile',
  ];

  const obstacleOptions = [
    'Manque de temps',
    'Fatigue',
    'Manque de motivation',
    'Environnement peu favorable',
    'Imprévu probable',
    'Distraction digitale',
    'Stress / pression externe',
  ];

  overlay.innerHTML = `
    <div style="
      position:fixed;inset:0;
      background:rgba(0,0,0,.92);
      z-index:950;
      display:flex;align-items:flex-start;justify-content:center;
      padding:1rem;
      overflow-y:auto;
      -webkit-overflow-scrolling:touch;
    " id="contract-inner">
      <div style="
        max-width:440px;width:100%;
        background:var(--surface);
        border:1px solid rgba(251,191,36,.25);
        border-radius:20px;
        padding:1.4rem;
        position:relative;
        margin:auto;
      ">
        <!-- Header -->
        <div style="text-align:center;margin-bottom:1.4rem;">
          <div style="font-size:1.6rem;margin-bottom:.5rem;">📜</div>
          <div style="font-size:.6rem;text-transform:uppercase;letter-spacing:.18em;color:#fbbf24;font-weight:700;margin-bottom:.3rem;">Contrat du Chasseur</div>
          <div style="font-size:1rem;font-weight:700;color:var(--text);">Semaine ${wn} — ${yr}</div>
          <div style="font-size:.7rem;color:var(--muted);margin-top:.2rem;">
            ${new Date(today + 'T12:00:00').toLocaleDateString('fr-FR', { day:'numeric', month:'long' })}
          </div>
        </div>

        <!-- Q1 — Engagement -->
        <div style="margin-bottom:1.2rem;">
          <div style="font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:#fbbf24;font-weight:700;margin-bottom:.6rem;">
            01 — Quel est ton engagement principal cette semaine ?
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;" id="engagement-options">
            ${engagementOptions.map((opt, i) => `
              <label style="display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:.5rem .75rem;cursor:pointer;font-size:.76rem;color:var(--text2);transition:all .15s;" class="contract-option">
                <input type="radio" name="engagement" value="${escAttr(opt)}" style="accent-color:#fbbf24;flex-shrink:0;">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
          <textarea id="engagement-text" placeholder="Précise ou ajoute quelque chose... (optionnel)" style="
            width:100%;margin-top:8px;background:var(--surface2);border:1px solid var(--border2);
            border-radius:10px;color:var(--text);font-family:'DM Sans',sans-serif;
            font-size:.76rem;padding:.6rem .8rem;outline:none;resize:none;height:56px;
            transition:border-color .2s;
          "></textarea>
        </div>

        <!-- Q2 — Obstacle -->
        <div style="margin-bottom:1.2rem;">
          <div style="font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:#f97316;font-weight:700;margin-bottom:.6rem;">
            02 — Quel est ton principal obstacle cette semaine ?
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;" id="obstacle-options">
            ${obstacleOptions.map(opt => `
              <label style="display:flex;align-items:center;gap:8px;background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:.5rem .75rem;cursor:pointer;font-size:.76rem;color:var(--text2);transition:all .15s;" class="contract-option">
                <input type="radio" name="obstacle" value="${escAttr(opt)}" style="accent-color:#f97316;flex-shrink:0;">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
          <textarea id="obstacle-text" placeholder="Précise ou ajoute quelque chose... (optionnel)" style="
            width:100%;margin-top:8px;background:var(--surface2);border:1px solid var(--border2);
            border-radius:10px;color:var(--text);font-family:'DM Sans',sans-serif;
            font-size:.76rem;padding:.6rem .8rem;outline:none;resize:none;height:56px;
            transition:border-color .2s;
          "></textarea>
        </div>

        <!-- Q3 — Énergie -->
        <div style="margin-bottom:1.4rem;">
          <div style="font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:#60a5fa;font-weight:700;margin-bottom:.6rem;">
            03 — Ton niveau d'énergie en ce début de semaine ?
          </div>
          <div style="padding:.5rem 0;">
            <input type="range" id="energy-slider" min="1" max="5" value="3" style="
              width:100%;accent-color:#60a5fa;cursor:pointer;
            ">
            <div style="display:flex;justify-content:space-between;font-size:.62rem;color:var(--muted);margin-top:4px;">
              <span>😞 Épuisé</span>
              <span>😐 Correct</span>
              <span>⚡ Au maximum</span>
            </div>
            <div style="text-align:center;margin-top:8px;" id="energy-display">
              <span style="font-size:1rem;font-weight:700;font-family:'DM Mono',monospace;color:#60a5fa;">3</span>
              <span style="font-size:.72rem;color:var(--text2);"> — Correct</span>
            </div>
          </div>
        </div>

        <!-- Bouton signer -->
        <button id="contract-sign-btn" style="
          width:100%;background:linear-gradient(135deg,#d97706,#f59e0b);
          color:#000;border:none;border-radius:12px;
          font-family:'DM Sans',sans-serif;font-weight:700;font-size:.9rem;
          padding:.85rem;cursor:pointer;transition:opacity .2s;
        ">
          ✍️ Signer le contrat
        </button>
        <div id="contract-error" style="display:none;color:#f87171;font-size:.72rem;text-align:center;margin-top:.5rem;">
          Sélectionne un engagement et un obstacle avant de signer.
        </div>
      </div>
    </div>`;

  overlay.style.display = 'block';

  // Slider énergie
  const slider = document.getElementById('energy-slider');
  const energyLabels = { 1:'😞 Épuisé', 2:'😔 Fatigué', 3:'😐 Correct', 4:'💪 Solide', 5:'⚡ Au maximum' };
  const energyColors = { 1:'#ef4444', 2:'#f97316', 3:'#eab308', 4:'#22c55e', 5:'#4ade80' };

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value);
    const display = document.getElementById('energy-display');
    display.innerHTML = `
      <span style="font-size:1rem;font-weight:700;font-family:'DM Mono',monospace;color:${energyColors[val]};">${val}</span>
      <span style="font-size:.72rem;color:var(--text2);"> — ${energyLabels[val].split(' ').slice(1).join(' ')}</span>`;
  });

  // Style radio sélectionné
  overlay.querySelectorAll('.contract-option input[type=radio]').forEach(radio => {
    radio.addEventListener('change', () => {
      const name = radio.name;
      overlay.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        const label = r.closest('label');
        if (label) {
          label.style.borderColor = r.checked ? (name === 'engagement' ? '#fbbf24' : '#f97316') : 'var(--border)';
          label.style.background = r.checked ? (name === 'engagement' ? 'rgba(251,191,36,.08)' : 'rgba(249,115,22,.08)') : 'var(--surface2)';
          label.style.color = r.checked ? 'var(--text)' : 'var(--text2)';
        }
      });
    });
  });

  // Signer
  document.getElementById('contract-sign-btn').addEventListener('click', () => {
    const engagementChoice = overlay.querySelector('input[name="engagement"]:checked');
    const obstacleChoice   = overlay.querySelector('input[name="obstacle"]:checked');
    const errEl = document.getElementById('contract-error');

    if (!engagementChoice || !obstacleChoice) {
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    const contract = {
      weekKey: getWeekKey(today),
      weekNum: wn,
      year: yr,
      date: today,
      signedAt: new Date().toISOString(),
      engagement_choice: engagementChoice.value,
      engagement_text: (document.getElementById('engagement-text').value || '').trim(),
      obstacle_choice: obstacleChoice.value,
      obstacle_text: (document.getElementById('obstacle-text').value || '').trim(),
      energy: parseInt(slider.value),
      bilan: null,
    };

    saveContract(today, contract);
    overlay.style.display = 'none';
    showToast('✍️ Contrat signé — Bonne semaine.');

    // Notification onglet
    const contractTab = document.querySelector('[data-tab="contract"]');
    if (contractTab) contractTab.textContent = '📜 Contrat ✅';
  });
}

function renderContractPage() {
  const el = document.getElementById('contract-page');
  if (!el) return;

  const contracts = getAllContracts();
  const today = toDay();
  const energyLabels = { 1:'😞 Épuisé', 2:'😔 Fatigué', 3:'😐 Correct', 4:'💪 Solide', 5:'⚡ Au maximum' };
  const energyColors = { 1:'#ef4444', 2:'#f97316', 3:'#eab308', 4:'#22c55e', 5:'#4ade80' };

  if (!contracts.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;">
        <div style="font-size:2rem;margin-bottom:1rem;">📜</div>
        <div style="font-size:.85rem;color:var(--muted);line-height:1.7;">
          Aucun contrat signé pour l'instant.<br>
          Le pop-up apparaît automatiquement<br>
          <strong style="color:var(--text);">chaque lundi matin</strong> à l'ouverture du site.
        </div>
        ${editMode ? `
          <button id="force-contract-btn" style="
            margin-top:1rem;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);
            color:#fbbf24;border-radius:10px;padding:.55rem 1.2rem;cursor:pointer;
            font-family:'DM Sans',sans-serif;font-weight:600;font-size:.75rem;
          ">✍️ Forcer le contrat maintenant</button>
        ` : ''}
      </div>`;

    const forceBtn = document.getElementById('force-contract-btn');
    if (forceBtn) forceBtn.addEventListener('click', showContractPopup);
    return;
  }

  el.innerHTML = '';

  // Bouton forcer en mode édition
  if (editMode) {
    const forceBtn = document.createElement('button');
    forceBtn.style.cssText = `
      width:100%;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);
      color:#fbbf24;border-radius:10px;padding:.5rem;cursor:pointer;
      font-family:'DM Sans',sans-serif;font-weight:600;font-size:.73rem;
      margin-bottom:10px;
    `;
    forceBtn.textContent = '✍️ Forcer un nouveau contrat (mode édition)';
    forceBtn.addEventListener('click', () => {
      // Supprime le contrat de la semaine courante pour permettre la re-signature
      const key = getContractKey(today);
      localStorage.removeItem(key);
      showContractPopup();
    });
    el.appendChild(forceBtn);
  }

  contracts.forEach((contract, idx) => {
    const isLatest = idx === 0;
    const signDate = new Date(contract.signedAt || contract.date + 'T08:00:00');
    const dateStr = signDate.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
    const energy = contract.energy || 3;
    const hasBilan = contract.bilan !== null && contract.bilan !== undefined;

    const card = document.createElement('div');
    card.style.cssText = `
      background:var(--surface);
      border:1px solid ${isLatest ? 'rgba(251,191,36,.3)' : 'var(--border)'};
      border-radius:16px;margin-bottom:10px;overflow:hidden;
      ${isLatest ? 'box-shadow:0 0 20px rgba(251,191,36,.06);' : ''}
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display:flex;align-items:center;justify-content:space-between;
      padding:.85rem 1rem;cursor:${isLatest ? 'default' : 'pointer'};gap:8px;flex-wrap:wrap;
    `;
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <div style="font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">
          ${contract.weekKey}
        </div>
        <div style="font-size:.72rem;color:var(--text2);">${dateStr}</div>
        ${isLatest ? `<span style="font-size:.6rem;background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.25);border-radius:6px;padding:1px 7px;font-weight:700;">Semaine courante</span>` : ''}
        ${hasBilan ? `<span style="font-size:.6rem;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.22);border-radius:6px;padding:1px 7px;font-weight:700;">✅ Bilan disponible</span>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <span style="font-size:.72rem;color:${energyColors[energy]};">${energyLabels[energy]}</span>
        ${!isLatest ? `<div style="font-size:.7rem;color:var(--muted);" class="contract-chevron">▾</div>` : ''}
      </div>`;

    const body = document.createElement('div');
    body.style.cssText = `padding:0 1rem 1rem;display:${isLatest ? 'block' : 'none'};`;

    // Engagement
    const engText = contract.engagement_text
      ? `${contract.engagement_choice} — ${contract.engagement_text}`
      : contract.engagement_choice;

    // Obstacle
    const obsText = contract.obstacle_text
      ? `${contract.obstacle_choice} — ${contract.obstacle_text}`
      : contract.obstacle_choice;

    body.innerHTML = `
      <!-- Engagement -->
      <div style="margin-bottom:8px;">
        <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.1em;color:#fbbf24;font-weight:700;margin-bottom:4px;">
          ✍️ Engagement
        </div>
        <div style="font-size:.78rem;color:var(--text);background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.12);border-left:2px solid #fbbf24;border-radius:0 8px 8px 0;padding:.6rem .8rem;line-height:1.6;">
          ${engText}
        </div>
      </div>

      <!-- Obstacle -->
      <div style="margin-bottom:8px;">
        <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.1em;color:#f97316;font-weight:700;margin-bottom:4px;">
          ⚠️ Obstacle anticipé
        </div>
        <div style="font-size:.78rem;color:var(--text);background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.12);border-left:2px solid #f97316;border-radius:0 8px 8px 0;padding:.6rem .8rem;line-height:1.6;">
          ${obsText}
        </div>
      </div>

      <!-- Énergie -->
      <div style="margin-bottom:${hasBilan ? '12px' : '0'};">
        <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.1em;color:#60a5fa;font-weight:700;margin-bottom:4px;">
          ⚡ Énergie déclarée
        </div>
        <div style="display:flex;align-items:center;gap:10px;background:rgba(96,165,250,.06);border:1px solid rgba(96,165,250,.12);border-left:2px solid #60a5fa;border-radius:0 8px 8px 0;padding:.6rem .8rem;">
          <div style="font-size:1.4rem;font-weight:700;font-family:'DM Mono',monospace;color:${energyColors[energy]};">${energy}/5</div>
          <div style="font-size:.78rem;color:var(--text);">${energyLabels[energy]}</div>
          <div style="flex:1;background:var(--surface3);border-radius:3px;height:5px;overflow:hidden;margin-left:4px;">
            <div style="height:100%;border-radius:3px;background:${energyColors[energy]};width:${energy * 20}%;transition:width .8s;"></div>
          </div>
        </div>
      </div>

      <!-- Bilan si disponible -->
      ${hasBilan ? `
        <div style="background:rgba(74,222,128,.05);border:1px solid rgba(74,222,128,.15);border-radius:12px;padding:.85rem;margin-top:4px;">
          <div style="font-size:.58rem;text-transform:uppercase;letter-spacing:.1em;color:#4ade80;font-weight:700;margin-bottom:8px;">
            📊 Bilan de fin de semaine
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:8px;">
            <div style="background:var(--surface2);border-radius:8px;padding:.5rem;text-align:center;">
              <div style="font-size:.95rem;font-weight:700;font-family:'DM Mono',monospace;color:${contract.bilan.pct >= 70 ? '#4ade80' : contract.bilan.pct >= 50 ? '#eab308' : '#f87171'};">
                ${contract.bilan.pct}%
              </div>
              <div style="font-size:.55rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-top:1px;">Complétion</div>
            </div>
            <div style="background:var(--surface2);border-radius:8px;padding:.5rem;text-align:center;">
              <div style="font-size:.72rem;font-weight:700;color:#f87171;">${contract.bilan.hardestDay}</div>
              <div style="font-size:.55rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-top:1px;">Jour difficile</div>
            </div>
            <div style="background:var(--surface2);border-radius:8px;padding:.5rem;text-align:center;">
              <div style="font-size:.72rem;font-weight:700;color:#60a5fa;">${contract.bilan.perfLabel}</div>
              <div style="font-size:.55rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-top:1px;">Performance</div>
            </div>
          </div>
          <div style="font-size:.76rem;color:var(--text);line-height:1.65;font-style:italic;border-top:1px solid rgba(74,222,128,.12);padding-top:7px;">
            "${contract.bilan.synthese}"
          </div>
        </div>
      ` : `
        <div style="font-size:.66rem;color:var(--muted);text-align:center;padding:.5rem;margin-top:4px;">
          Le bilan sera ajouté automatiquement dimanche soir.
        </div>
      `}
    `;

    card.appendChild(header);
    card.appendChild(body);
    el.appendChild(card);

    if (!isLatest) {
      header.addEventListener('click', () => {
        const isOpen = body.style.display === 'block';
        body.style.display = isOpen ? 'none' : 'block';
        const chevron = header.querySelector('.contract-chevron');
        if (chevron) chevron.textContent = isOpen ? '▾' : '▴';
      });
    }
  });
}
