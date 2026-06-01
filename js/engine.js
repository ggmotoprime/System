// ══════════════════════════════════════════════
// ENGINE.JS — Tous les calculs
// ══════════════════════════════════════════════
// ── Helpers dates ──
function toDay() { return new Date().toISOString().substring(0, 10); }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().substring(0, 10);
}
function getWN(date) {
  const d = new Date(date + 'T12:00:00'), j = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - j) / 86400000 + j.getDay() + 1) / 7);
}
function getWS(today, off = 0) {
  const d = new Date(today + 'T12:00:00'), dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1) + off * 7);
  return d.toISOString().substring(0, 10);
}

// ── Helpers scores ──
function scoreDay(d) {
  const x = allData[d] || {};
  return HABITS.filter(h => x[h]).length;
}
function isPerfect(d)  { return scoreDay(d) === HABITS.length; }
function hasStreak(d)  { return scoreDay(d) / HABITS.length >= ST; }

// ── Niveaux PA ──
function levelCost(n)  { return Math.max(25, Math.round(25 * Math.pow(n, 1.4))); }
function paToLevel(pa) {
  let l = 1, r = pa;
  while (l < 100) { const c = levelCost(l); if (r >= c) { r -= c; l++; } else break; }
  return l;
}
function levelProg(pa) {
  const l = paToLevel(pa);
  if (l >= 100) return 100;
  let r = pa;
  for (let i = 1; i < l; i++) r -= levelCost(i);
  return Math.min(100, Math.round(r / levelCost(l) * 100));
}
function paRemain(pa) {
  const l = paToLevel(pa);
  if (l >= 100) return 0;
  let r = pa;
  for (let i = 1; i < l; i++) r -= levelCost(i);
  return levelCost(l) - r;
}

// ── Rang ──
function getRank(xp)    { return RANKS.find(r => xp >= r.min && xp < r.max) || RANKS[RANKS.length - 1]; }
function getRankIdx(xp) { return RANKS.indexOf(getRank(xp)); }
function getRankLetter(xp) {
  const n = getRank(xp).n;
  if (n.startsWith('SSS')) return 'SSS';
  if (n.startsWith('SS'))  return 'SS';
  if (n.startsWith('S'))   return 'S';
  return n.split(' — ')[0].trim();
}

// ── Passifs de rang ──
function hasPassif(id) {
  const lastRankLetter = S.lastRank();
  const rankOrder = ['E','D','C','B','A','S','SS','SSS'];
  const currentRankIdx = rankOrder.indexOf(lastRankLetter);
  return RANKS.slice(0, currentRankIdx + 1).some(r => r.passif && r.passif.id === id);
}

// ── Streak ──
function computeStreak(today) {
  const streakPerfect = (d) => hasPassif('endurance')
    ? scoreDay(d) >= HABITS.length - 1
    : isPerfect(d);

  let s = 0;
  const c = new Date(today + 'T12:00:00');
  while (streakPerfect(c.toISOString().substring(0, 10))) {
    s++;
    c.setDate(c.getDate() - 1);
  }

  let best = 0, run = 0;
  for (const d of Object.keys(allData).sort()) {
    run = streakPerfect(d) ? run + 1 : 0;
    if (run > best) best = run;
  }
  return { streak: s, best };
}

// ── XP / PD ──
function computeQuestXP() {
  let xp = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.match(/^qw\d+_\d+__/)) {
      try {
        const v = JSON.parse(localStorage.getItem(k));
        if (v && v.state === 'done' && v.reward) xp += v.reward;
      } catch {}
    }
  }
  return xp;
}

function computeXP() {
  const dates = Object.keys(allData).sort();
  let xp = 0, run = 0;

  // Passif A : +2 PD par habitude
  const lastRankLetter = S.lastRank();
  const rankOrder = ['E','D','C','B','A','S','SS','SSS'];
  const currentRankIdx = rankOrder.indexOf(lastRankLetter);
  const bonusPerHabit = currentRankIdx >= 4 ? 2 : 0;

  for (const d of dates) {
    const s = scoreDay(d);
    xp += s * (10 + bonusPerHabit);
    if (isPerfect(d)) xp += 150;

    // Streak parfait — bonus tous les 7 jours consécutifs
    if (isPerfect(d)) {
      run++;
    } else {
      run = 0;
    }

    // +300 PD tous les 7 jours parfaits consécutifs
    if (run > 0 && run % 7 === 0) {
      const streakMult = currentRankIdx >= 5 ? 2 : 1; // Passif S
      xp += 300 * streakMult;
    }
    // Bonus supplémentaire à exactement 30j et 100j
    if (run === 30) {
      const streakMult = currentRankIdx >= 5 ? 2 : 1;
      xp += 1000 * streakMult;
    }
    if (run === 100) {
      const streakMult = currentRankIdx >= 5 ? 2 : 1;
      xp += 5000 * streakMult;
    }
  }

  // Passif B : semaines 7/7 ≥ 7/10 → +200 PD
  if (currentRankIdx >= 3) {
    xp += computeMomentumBonus();
  }

  // Boss vaincus
  Object.values(S.boss()).forEach(b => {
    if (b.declared === 'won' && b.reward) xp += b.reward;
  });

  // Quêtes validées
  xp += computeQuestXP();

  // Malus et transactions boutique
  S.malus().forEach(m => { xp -= m.amount; });
  S.tx().forEach(t => { xp -= (t.amount || t.c || 0); });

  // Séquelles actives
  S.sequelles().forEach(seq => {
    if (seq.active && seq.malus && seq.malus.type === 'pd') xp -= seq.malus.value;
  });

  return Math.max(0, xp);
}

function computeMomentumBonus() {
  let bonus = 0;
  const dates = Object.keys(allData).sort();
  if (!dates.length) return 0;
  const firstDate = dates[0];
  const lastDate  = dates[dates.length - 1];
  let cur = getWS(firstDate);
  while (cur <= lastDate) {
    let allGood = true;
    for (let i = 0; i < 7; i++) {
      const d = addDays(cur, i);
      if (!allData[d] || scoreDay(d) < 7) { allGood = false; break; }
    }
    if (allGood) bonus += 200;
    cur = addDays(cur, 7);
  }
  return bonus;
}

// ── PA par sous-attribut — sources détaillées ──
function computeSubPA() {
  const pa = {};
  ATTRIBUTES.forEach(a => a.subs.forEach(s => pa[s.id] = 0));
  const dates = Object.keys(allData).sort();
  let run = 0;

  // Passif A : +2 PA par habitude
  const lastRankLetter = S.lastRank();
  const rankOrder = ['E','D','C','B','A','S','SS','SSS'];
  const currentRankIdx = rankOrder.indexOf(lastRankLetter);
  const bonus = currentRankIdx >= 4 ? 2 : 0;

  for (const d of dates) {
    const day = allData[d] || {};
    const sc = scoreDay(d);

    if (isPerfect(d)) { run++; } else { run = 0; }

    // ── Habitudes → PA recalibrés ──
    if (day['No Scroll']) {
      pa.disc_noscroll += 2 + bonus;
      pa.men_ennui     += 1 + bonus;
    }
    if (day['Sport']) {
      pa.phy_force     += 2 + bonus;
      pa.phy_endurance += 1 + bonus;
    }
    if (day['Pushup']) {
      pa.phy_force     += 2 + bonus;
    }
    if (day['Nutrition']) {
      pa.nut_qualite   += 3 + bonus;
    }
    if (day['Priere']) {
      pa.spi_salat     += 3 + bonus;
    }
    if (day['Coran']) {
      pa.spi_coran     += 3 + bonus;
    }
    if (day['Islam']) {
      pa.spi_ilm       += 2 + bonus;
    }
    if (day['Arabe']) {
      pa.int_arabe     += 3 + bonus;
    }
    if (day['Skill']) {
      pa.int_skill     += 2 + bonus;
    }
    if (day['Chess']) {
      pa.int_echecs    += 3 + bonus;
    }

    // ── Journée parfaite → PA bonus ──
    if (isPerfect(d)) {
      pa.disc_routine  += 3;
      pa.disc_exec     += 2;
      pa.disc_constance+= 1;
      pa.men_impulse   += 2;
      pa.men_stabilite += 1;
      pa.exe_prio      += 3;
      pa.exe_vitesse   += 5;
    }

    // ── Constance quotidienne ──
    pa.disc_constance += 1;
    if (sc >= DS) pa.exe_constance += 1;

    // ── Bonus streak tous les 7j parfaits ──
    if (run > 0 && run % 7 === 0) {
      pa.disc_noscroll  += 8;
      pa.disc_constance += 6;
      pa.men_impulse    += 8;
      pa.men_stabilite  += 4;
      pa.exe_vitesse    += 10;
      pa.exe_constance  += 8;
    }

    // ── Bonus streak 30j ──
    if (run === 30) {
      pa.disc_constance += 15;
      pa.men_stabilite  += 10;
      pa.exe_constance  += 15;
      pa.exe_vitesse    += 20;
    }

    // ── Combos quotidiens ──
    // Combo physique : Sport + Pushup le même jour
    if (day['Sport'] && day['Pushup']) {
      pa.phy_force     += 3;
      pa.phy_endurance += 2;
    }
    // Combo spirituel : Coran + Priere + Islam le même jour
    if (day['Coran'] && day['Priere'] && day['Islam']) {
      pa.spi_salat     += 4;
      pa.spi_coran     += 4;
      pa.spi_ilm       += 3;
      pa.spi_dhikr     += 2;
    }
    // Combo intellectuel : Arabe + Chess + Skill le même jour
    if (day['Arabe'] && day['Chess'] && day['Skill']) {
      pa.int_arabe     += 3;
      pa.int_echecs    += 3;
      pa.int_skill     += 2;
      pa.int_memoire   += 2;
    }
    // Combo discipline : No Scroll + Nutrition le même jour
    if (day['No Scroll'] && day['Nutrition']) {
      pa.disc_noscroll += 2;
      pa.nut_qualite   += 2;
      pa.men_impulse   += 2;
    }
  }

  // ── Boss vaincus → PA sur l'attribut du boss ──
  const bossData = S.boss();
  getBosses().forEach(boss => {
    for (let y = new Date().getFullYear() - 1; y <= new Date().getFullYear(); y++) {
      const key = `w${boss.week}_${y}`;
      const bd = bossData[key];
      if (bd && bd.declared === 'won') {
        const paAmount = BOSS_PA_BY_DIFF[boss.d] || 60;
        const attr = ATTRIBUTES.find(a => a.id === boss.a);
        if (attr) {
          const perSub = Math.floor(paAmount / attr.subs.length);
          attr.subs.forEach(sub => { pa[sub.id] = (pa[sub.id] || 0) + perSub; });
        }
      }
    }
  });

  // ── Quêtes validées → PA sur l'attribut de la quête ──
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.match(/^qw\d+_\d+__/)) continue;
    try {
      const v = JSON.parse(localStorage.getItem(k));
      if (!v || v.state !== 'done') continue;
      const questName = k.split('__').slice(1).join('__');
      const quest = getQuests().find(q => q.n === questName);
      if (!quest) continue;
      const paAmount = QUEST_PA_BY_DIFF[quest.diff] || 30;
      const attr = ATTRIBUTES.find(a => a.id === quest.a);
      if (attr) {
        const perSub = Math.floor(paAmount / attr.subs.length);
        attr.subs.forEach(sub => { pa[sub.id] = (pa[sub.id] || 0) + perSub; });
      }
    } catch {}
  }

  // ── Skills maîtrisés → PA sur l'attribut correspondant ──
  const skillsData = S.skills();
  getSkillCats().forEach(cat => {
    const attrId = SKILL_PA_MAP[cat.cat];
    if (!attrId) return;
    const attr = ATTRIBUTES.find(a => a.id === attrId);
    if (!attr) return;
    cat.items.forEach(skillName => {
      if ((skillsData[skillName] || 0) === 2) {
        const perSub = Math.floor(SKILL_PA_AMOUNT / attr.subs.length);
        attr.subs.forEach(sub => { pa[sub.id] = (pa[sub.id] || 0) + perSub; });
      }
    });
  });

  // ── Séquelles : -5% PA sur l'attribut concerné ──
  S.sequelles().forEach(seq => {
    if (!seq.active || !seq.malus || seq.malus.type !== 'pa_reduction') return;
    const attr = ATTRIBUTES.find(a => a.id === seq.malus.attrId);
    if (!attr) return;
    attr.subs.forEach(sub => {
      pa[sub.id] = Math.floor((pa[sub.id] || 0) * (1 - seq.malus.value));
    });
  });

  return pa;
}

function computeAttrPA() {
  const sub = computeSubPA();
  const attr = {};
  ATTRIBUTES.forEach(a => {
    attr[a.id] = a.subs.reduce((s, x) => s + (sub[x.id] || 0), 0);
  });
  return { attr, sub };
}

// ── Séquelles ──
function updateSequelles(today) {
  const seqs = S.sequelles().filter(s => s.endDate >= today);
  S.saveSequelles(seqs);
  return seqs;
}

function addSequelle(type, bossOrReason, today) {
  const seqs = S.sequelles();
  const endDate = addDays(today, type === 'boss_fail' ? 3 : 2);
  const pdMalus = hasPassif('resilience') ? 150 : 300;
  const seq = {
    id: `seq_${Date.now()}`,
    type,
    name: type === 'boss_fail'
      ? `Blessure — ${bossOrReason}`
      : type === 'streak_break'
      ? 'Brisure de Continuité'
      : 'Séquelle d\'Atrophie',
    startDate: today,
    endDate,
    active: true,
    malus: type === 'boss_fail'
      ? { type: 'pa_reduction', attrId: bossOrReason, value: 0.05 }
      : { type: 'pd', value: pdMalus },
    narrative: type === 'boss_fail'
      ? 'La défaite laisse une trace. Le Système l\'a enregistrée.'
      : type === 'streak_break'
      ? 'La fissure est enregistrée. Elle ne te définit pas — sauf si tu la laisses faire.'
      : 'Absence prolongée. Le Système note la défaillance.',
  };
  seqs.push(seq);
  S.saveSequelles(seqs);
}

// ── Message du Système ──
function getSystemMessage(today) {
  const s = scoreDay(today);
  const pct = s / HABITS.length;
  const { streak } = computeStreak(today);
  const dates = Object.keys(allData).sort();
  const yesterday = addDays(today, -1);
  const bossWon = Object.values(S.boss()).some(b => b.declared === 'won' && b.declaredDate === today);
  const last3 = [1,2,3].map(i => addDays(today, -i));
  const wasWeak = last3.every(d => allData[d] && scoreDay(d) < DS);
  const isComeback = wasWeak && s >= DS;

  let ctx, tone;
  if      (streak >= 30)                                              { ctx = 'streak_30';              tone = 'dramatic'; }
  else if (streak >= 14)                                              { ctx = 'streak_14';              tone = 'dramatic'; }
  else if (streak >= 7)                                               { ctx = 'streak_7';               tone = 'dramatic'; }
  else if (bossWon)                                                   { ctx = 'boss_won';               tone = 'positive'; }
  else if (isPerfect(yesterday) && s < DS && s > 0)                  { ctx = 'first_fail_after_streak'; tone = 'warning';  }
  else if (isComeback)                                                { ctx = 'comeback';               tone = 'positive'; }
  else if (new Date(today + 'T12:00:00').getDay() === 1 && s === 0) { ctx = 'monday_zero';            tone = 'neutral';  }
  else if (isPerfect(today))                                          { ctx = 'perfect';                tone = 'positive'; }
  else if (pct >= 0.7)                                               { ctx = 'high';                   tone = 'positive'; }
  else if (pct >= 0.4)                                               { ctx = 'mid';                    tone = 'neutral';  }
  else if (s === 0)                                                   { ctx = 'zero_morning';           tone = 'neutral';  }
  else                                                                { ctx = 'low';                    tone = 'warning';  }

  const pool = SYSTEM_MESSAGES[ctx] || SYSTEM_MESSAGES.high;
  const msg  = pool[Math.floor(dates.length % pool.length)];
  return { text: msg.replace('{streak}', streak), tone };
}

// ── Titres débloqués ──
function getUnlockedTitles() {
  const today = toDay();
  const { streak, best } = computeStreak(today);
  const xp = computeXP();
  const bossWonCount = Object.values(S.boss()).filter(b => b.declared === 'won').length;
  const dates = Object.keys(allData);
  const habitCounts = {}, habitStreaks = {};
  HABITS.forEach(h => {
    habitCounts[h] = dates.filter(d => allData[d] && allData[d][h]).length;
    let r = 0, b = 0;
    for (const d of dates.sort()) { r = (allData[d] && allData[d][h]) ? r+1 : 0; if(r>b) b=r; }
    habitStreaks[h] = b;
  });
  const ctx = { best, streak, xp, rankIndex: getRankIdx(xp), bossWonCount, habitCounts, habitStreaks, totalDays: dates.length };
  return TITLES.filter(t => t.condition(ctx));
}

// ── Chroniques ──
function updateChronicles(today) {
  const existing = S.chronicles();
  const existingTexts = new Set(existing.map(c => c.key));
  const newEvents = [];
  const dates = Object.keys(allData).sort();
  if (dates.length > 0 && !existingTexts.has('first_day')) {
    newEvents.push({ key:'first_day', date: dates[0], text: 'Le Système s\'éveille. Premier jour enregistré.' });
  }
  const xp = computeXP();
  RANKS.forEach(r => {
    const letter = r.n.split(' — ')[0].trim();
    const key = `rank_${letter}`;
    if (xp >= r.min && !existingTexts.has(key)) {
      newEvents.push({ key, date: today, text: `Rang ${r.e} ${r.n} atteint.` });
    }
  });
  getBosses().forEach(boss => {
    const yr = new Date().getFullYear();
    const bKey = `w${boss.week}_${yr}`;
    const bd = S.boss()[bKey];
    const key = `boss_won_${bKey}`;
    if (bd && bd.declared === 'won' && !existingTexts.has(key)) {
      newEvents.push({ key, date: today, text: `Boss vaincu : ${boss.i} ${boss.n}. +${boss.r} PD.` });
    }
  });
  const { best } = computeStreak(today);
  [7, 14, 30, 50, 100].forEach(n => {
    const key = `streak_${n}`;
    if (best >= n && !existingTexts.has(key)) {
      newEvents.push({ key, date: today, text: `Record de streak : ${n} jours consécutifs.` });
    }
  });
  if (newEvents.length) {
    S.saveChronicles([...existing, ...newEvents].sort((a,b) => a.date.localeCompare(b.date)));
  }
}

// ── Éveil ──
function checkAwakening() {
  const xp = computeXP();
  const currentLetter = getRankLetter(xp);
  const lastLetter    = S.lastRank();
  const rankOrder     = ['E','D','C','B','A','S','SS','SSS'];
  if (!localStorage.getItem('ht_last_rank')) {
    S.saveLastRank(currentLetter);
    return null;
  }
  if (rankOrder.indexOf(currentLetter) > rankOrder.indexOf(lastLetter)) {
    return currentLetter;
  }
  return null;
}

function confirmAwakening(letter) { S.saveLastRank(letter); }

// ── Prophétie ──
function computeProphecy(today) {
  const dates = Object.keys(allData).sort();
  if (dates.length < 7) return null;
  const last14 = dates.slice(-14);
  const avgScore = last14.reduce((a, d) => a + scoreDay(d), 0) / last14.length;
  const dailyPD = avgScore * 10 + (avgScore >= HABITS.length ? 150 / HABITS.length : 0);
  const xp = computeXP();
  const rank = getRank(xp);
  const next = RANKS[RANKS.indexOf(rank) + 1];
  if (!next) return null;
  const pdNeeded = next.min - xp;
  if (pdNeeded <= 0) return null;
  const daysNeeded = Math.ceil(pdNeeded / Math.max(dailyPD, 1));
  const targetDate = addDays(today, daysNeeded);
  const targetDateFmt = new Date(targetDate + 'T12:00:00')
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  return { nextRank: next, daysNeeded, targetDate: targetDateFmt, dailyPD: Math.round(dailyPD), pdNeeded };
}

// ── Saisons ──
function getCurrentSeason(today) {
  const dates = Object.keys(allData).sort();
  if (!dates.length) return null;
  const firstDate = dates[0];
  const daysSinceStart = Math.max(0, Math.round(
    (new Date(today + 'T12:00:00') - new Date(firstDate + 'T12:00:00')) / 86400000
  ));
  const seasonNumber = Math.floor(daysSinceStart / 90) + 1;
  const seasonStart  = addDays(firstDate, (seasonNumber - 1) * 90);
  const seasonEnd    = addDays(seasonStart, 89);
  const daysLeft     = Math.max(0, Math.round(
    (new Date(seasonEnd + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000
  ));
  const daysDone = 90 - daysLeft;
  const pct      = Math.round(daysDone / 90 * 100);
  const seasonNames = ['L\'Éveil','Le Forgeron','Le Chasseur','La Forge du Guerrier','L\'Épreuve','La Maîtrise','La Transcendance','L\'Infini'];
  const name = seasonNames[(seasonNumber - 1) % seasonNames.length];
  const seasonDates = dates.filter(d => d >= seasonStart && d <= today);
  const seasonPerfect = seasonDates.filter(d => isPerfect(d)).length;
  const { streak: seasonStreak } = computeStreak(today);
  const bossWon = Object.values(S.boss()).filter(b => b.declared === 'won').length;
  return { number: seasonNumber, name, start: seasonStart, end: seasonEnd, daysLeft, daysDone, pct, perfect: seasonPerfect, streak: seasonStreak, bossWon };
}

function getActiveSequelles(today) {
  return S.sequelles().filter(s => s.active && s.endDate >= today);
}

// ── Escaper HTML ──
function escAttr(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ══════════════════════════════════════════════
// MOTEUR DE QUÊTES ADAPTATIVES
// ══════════════════════════════════════════════

const HABIT_TO_ATTR = {
  'Sport':      'physique',
  'Pushup':     'physique',
  'Nutrition':  'nutrition',
  'Priere':     'spiritualite',
  'Coran':      'spiritualite',
  'Islam':      'spiritualite',
  'Arabe':      'intelligence',
  'Skill':      'intelligence',
  'Chess':      'intelligence',
  'No Scroll':  'discipline',
};

function getGenQuestsKey(wn, yr) {
  return `ht_gen_quests_${wn}_${yr}`;
}

function getGeneratedQuests(wn, yr) {
  try {
    const raw = localStorage.getItem(getGenQuestsKey(wn, yr));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveGeneratedQuests(wn, yr, data) {
  localStorage.setItem(getGenQuestsKey(wn, yr), JSON.stringify(data));
}

function generateWeeklyQuests(forceRegen = false) {
  const today = toDay();
  const wn = getWN(today);
  const yr = new Date().getFullYear();

  // Si déjà généré cette semaine et pas de force → retourner le cache
  if (!forceRegen) {
    const cached = getGeneratedQuests(wn, yr);
    if (cached && cached.weekNum === wn && cached.year === yr) {
      return cached.quests;
    }
  }

  const allQuests = getQuests();
  const { attr } = computeAttrPA();
  const { streak } = computeStreak(today);
  const dates = Object.keys(allData).sort();

  // ── Données contextuelles ──

  // Score des 7 derniers jours
  const last7 = [];
  for (let i = 1; i <= 7; i++) {
    const d = addDays(today, -i);
    last7.push({ date: d, score: allData[d] ? scoreDay(d) : null });
  }

  // Score moyen des 7 derniers jours (jours trackés uniquement)
  const trackedLast7 = last7.filter(x => x.score !== null);
  const avgScore7 = trackedLast7.length
    ? trackedLast7.reduce((a, x) => a + x.score, 0) / trackedLast7.length
    : 0;

  // Derniers 3 jours — détecter absence
  const last3 = last7.slice(0, 3);
  const absenceLast3 = last3.every(x => x.score === null || x.score === 0);

  // PA par attribut des 7 derniers jours (progression récente)
  const recentPA = {};
  ATTRIBUTES.forEach(a => recentPA[a.id] = 0);
  last7.forEach(({ date }) => {
    if (!allData[date]) return;
    const day = allData[date];
    if (day['Sport'])      { recentPA['physique']      += 3; }
    if (day['Pushup'])     { recentPA['physique']      += 2; }
    if (day['Nutrition'])  { recentPA['nutrition']     += 3; }
    if (day['Priere'])     { recentPA['spiritualite']  += 3; }
    if (day['Coran'])      { recentPA['spiritualite']  += 3; }
    if (day['Islam'])      { recentPA['spiritualite']  += 2; }
    if (day['Arabe'])      { recentPA['intelligence']  += 3; }
    if (day['Skill'])      { recentPA['intelligence']  += 2; }
    if (day['Chess'])      { recentPA['intelligence']  += 3; }
    if (day['No Scroll'])  { recentPA['discipline']    += 2; }
  });

  // Boss actif cette semaine
  const currentBoss = getBossByWeek(wn);
  const bossAttr = currentBoss ? currentBoss.a : null;

  // HP du boss
  let bossHpPct = 100;
  let bossStepsTotal = 0;
  let bossStepsDone = 0;
  if (currentBoss) {
    const bossKey = `w${wn}_${yr}`;
    const bossData = S.boss()[bossKey];
    bossStepsTotal = (currentBoss.s || []).length;
    bossStepsDone = bossData ? (bossData.checks || []).length : 0;
    bossHpPct = bossStepsTotal > 0
      ? Math.max(0, 100 - Math.round(bossStepsDone / bossStepsTotal * 100))
      : 100;
  }

  // Deadline boss (dimanche de la semaine)
  const weekStart = getWS(today, 0);
  const weekEnd = addDays(weekStart, 6);
  const daysUntilEnd = Math.max(0, daysBetween(today, weekEnd));

  // Attribut max et min (pour déséquilibre global)
  const attrIds = ATTRIBUTES.map(a => a.id);
  const attrValues = attrIds.map(id => ({ id, val: attr[id] || 0 }));
  const attrMax = attrValues.reduce((a, b) => b.val > a.val ? b : a);
  const attrMin = attrValues.reduce((a, b) => b.val < a.val ? b : a);

  // ── Application des règles dans l'ordre ──

  const selectedQuests = [];   // quêtes finales
  const usedAttrs = new Set(); // attributs déjà couverts
  const rulesApplied = [];

  // Helper : piocher une quête dans un attribut donné
  function pickQuest(attrId, preferDiff, exclude = []) {
    if (usedAttrs.has(attrId)) return null;
    if (bossAttr && attrId === bossAttr) return null; // règle anti-doublon boss
    const pool = allQuests.filter(q =>
      q.a === attrId &&
      !exclude.includes(q.n) &&
      !selectedQuests.find(s => s.n === q.n)
    );
    if (!pool.length) return null;
    // Priorité à la difficulté demandée, sinon la plus proche
    const byDiff = pool.filter(q => q.diff === preferDiff);
    return byDiff.length ? byDiff[Math.floor(Math.random() * byDiff.length)]
                         : pool[Math.floor(Math.random() * pool.length)];
  }

  function addQuest(quest, rule, multiplier = 1.0) {
    if (!quest) return false;
    if (selectedQuests.find(q => q.n === quest.n)) return false;
    if (usedAttrs.has(quest.a)) return false;
    selectedQuests.push({
      ...quest,
      r: Math.round(quest.r * multiplier),
      generated: true,
      rule,
      xp_multiplier: multiplier,
    });
    usedAttrs.add(quest.a);
    rulesApplied.push(rule);
    return true;
  }

  // ── Règle 3 : Retour après absence ──
  if (absenceLast3 && selectedQuests.length < 5) {
    // Quête facile sur l'attribut avec le moins de PA récents
    const weakest = attrValues
      .filter(a => a.id !== bossAttr && !usedAttrs.has(a.id))
      .sort((a, b) => recentPA[a.id] - recentPA[b.id])[0];
    if (weakest) {
      const q = pickQuest(weakest.id, 'easy');
      addQuest(q, 'comeback', 1.5);
    }
  }

  // ── Règle 4 : Streak long ──
  if (streak >= 14 && avgScore7 >= 8.5 && selectedQuests.length < 5) {
    const candidates = attrIds.filter(id => id !== bossAttr && !usedAttrs.has(id));
    // Choisit l'attribut avec le plus de PA récents (momentum)
    const strongest = candidates
      .map(id => ({ id, val: recentPA[id] }))
      .sort((a, b) => b.val - a.val)[0];
    if (strongest) {
      const q = pickQuest(strongest.id, 'hard');
      addQuest(q, 'streak_challenge', 1.5);
    }
  }

  // ── Règle 5 : Boss en danger ──
  if (currentBoss && bossHpPct > 70 && daysUntilEnd <= 4 && selectedQuests.length < 5) {
    // Boss peu avancé + deadline proche → quête sur l'attribut adjacent au boss
    // On choisit un attribut lié mais différent du boss pour ne pas dupliquer
    const bossRelated = {
      'physique':      'execution',
      'discipline':    'mental',
      'mental':        'discipline',
      'spiritualite':  'intelligence',
      'intelligence':  'execution',
      'nutrition':     'physique',
      'social':        'execution',
      'execution':     'discipline',
    };
    const targetAttr = bossRelated[bossAttr] || 'execution';
    if (!usedAttrs.has(targetAttr)) {
      const q = pickQuest(targetAttr, 'medium');
      addQuest(q, 'boss_danger');
    }
  }

  // ── Règle 6 : Déséquilibre global ──
  if (attrMax.val > 0 && attrMin.val * 2 < attrMax.val && selectedQuests.length < 5) {
    if (attrMin.id !== bossAttr && !usedAttrs.has(attrMin.id)) {
      const q = pickQuest(attrMin.id, 'medium');
      addQuest(q, 'global_imbalance');
    }
  }

  // ── Règle 2 : Rééquilibrage (attribut sans progression 7j) ──
  if (selectedQuests.length < 5) {
    const stagnant = attrIds
      .filter(id => id !== bossAttr && !usedAttrs.has(id) && recentPA[id] === 0)
      .sort((a, b) => (attr[a] || 0) - (attr[b] || 0)); // priorité au plus faible total

    for (const attrId of stagnant) {
      if (selectedQuests.length >= 5) break;
      const q = pickQuest(attrId, 'medium');
      addQuest(q, 'rebalance');
    }
  }

  // ── Remplissage : compléter jusqu'à 5 quêtes ──
  if (selectedQuests.length < 5) {
    // Priorité aux attributs avec le moins de PA total, hors boss
    const remaining = attrIds
      .filter(id => id !== bossAttr && !usedAttrs.has(id))
      .sort((a, b) => (attr[a] || 0) - (attr[b] || 0));

    for (const attrId of remaining) {
      if (selectedQuests.length >= 5) break;
      const q = pickQuest(attrId, 'medium');
      if (addQuest(q, 'fill')) continue;
      // Si medium indisponible, essayer easy puis hard
      const q2 = pickQuest(attrId, 'easy');
      if (addQuest(q2, 'fill')) continue;
      const q3 = pickQuest(attrId, 'hard');
      addQuest(q3, 'fill');
    }
  }

  // ── Sauvegarder ──
  const result = {
    weekNum: wn,
    year: yr,
    generatedAt: today,
    rules_applied: rulesApplied,
    quests: selectedQuests,
  };
  saveGeneratedQuests(wn, yr, result);
  return selectedQuests;
}

// Labels lisibles pour les règles
const RULE_LABELS = {
  comeback:         '🔄 Retour',
  streak_challenge: '🔥 Défi Streak',
  boss_danger:      '⚠️ Sprint Boss',
  global_imbalance: '⚖️ Rééquilibrage',
  rebalance:        '📈 Progression',
  fill:             '⚡ Auto',
};

// ══════════════════════════════════════════════
// RAPPORT HEBDOMADAIRE
// ══════════════════════════════════════════════

function getWeekKey(date) {
  const d = new Date(date + 'T12:00:00');
  const yr = d.getFullYear();
  const wn = getWN(date);
  return `${yr}-W${String(wn).padStart(2,'0')}`;
}

function getReportKey(date) {
  return `weeklyReport_${getWeekKey(date)}`;
}

function getStoredReport(date) {
  try {
    const raw = localStorage.getItem(getReportKey(date));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getAllReports() {
  const reports = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('weeklyReport_')) {
      try {
        const r = JSON.parse(localStorage.getItem(k));
        if (r) reports.push(r);
      } catch {}
    }
  }
  return reports.sort((a, b) => b.weekKey.localeCompare(a.weekKey));
}

function checkAndGenerateReport() {
  const now = new Date();
  const today = toDay();
  const isDimanche = now.getDay() === 0;
  const isAfter18 = now.getHours() >= 18;
  if (!isDimanche || !isAfter18) return false;
  const existing = getStoredReport(today);
  if (existing) return false;
  generateWeeklyReport(today);
  return true; // nouveau rapport généré
}

function generateWeeklyReport(today) {
  const wn = getWN(today);
  const yr = new Date().getFullYear();
  const weekKey = getWeekKey(today);

  // ── Données des 7 derniers jours ──
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    days.push({ date: d, data: allData[d] || null });
  }
  const trackedDays = days.filter(d => d.data !== null);

  // Taux de complétion global
  const totalPossible = days.length * HABITS.length;
  const totalDone = days.reduce((acc, d) => {
    if (!d.data) return acc;
    return acc + HABITS.filter(h => d.data[h]).length;
  }, 0);
  const completionRate = totalPossible > 0 ? totalDone / totalPossible : 0;

  // Habitudes ratées par nom
  const missedCounts = {};
  HABITS.forEach(h => {
    missedCounts[h] = days.filter(d => d.data && !d.data[h]).length
                    + days.filter(d => !d.data).length; // jours non trackés comptent comme ratés
  });

  // Jour avec le plus de ratés
  const dayNames = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const missedByDay = days.map(d => ({
    date: d.date,
    dayName: dayNames[new Date(d.date + 'T12:00:00').getDay()],
    missed: d.data ? HABITS.filter(h => !d.data[h]).length : HABITS.length,
  }));
  const worstDay = missedByDay.reduce((a, b) => b.missed > a.missed ? b : a);

  // ── PA début vs fin de semaine ──
  const weekStart = getWS(today, 0);
  const weekStartDate = addDays(weekStart, -1); // veille du lundi

  // PA total actuel
  const { attr: attrNow, sub: subNow } = computeAttrPA();

  // PA de début de semaine — simulé en excluant les données de cette semaine
  const savedAllData = allData;
  const preWeekData = {};
  Object.keys(allData).forEach(d => {
    if (d < weekStart) preWeekData[d] = allData[d];
  });
  // Calcul temporaire sans les données de la semaine
  const attrStart = {};
  ATTRIBUTES.forEach(a => attrStart[a.id] = 0);

  // Calcul delta PA par attribut
  const attrDelta = {};
  ATTRIBUTES.forEach(a => {
    const paThisWeek = days.reduce((acc, d) => {
      if (!d.data) return acc;
      let pa = 0;
      if (a.id === 'physique')     { if (d.data['Sport']) pa += 3; if (d.data['Pushup']) pa += 2; if (d.data['Sport'] && d.data['Pushup']) pa += 3; }
      if (a.id === 'nutrition')    { if (d.data['Nutrition']) pa += 3; }
      if (a.id === 'spiritualite') { if (d.data['Priere']) pa += 3; if (d.data['Coran']) pa += 3; if (d.data['Islam']) pa += 2; if (d.data['Coran'] && d.data['Priere'] && d.data['Islam']) pa += 13; }
      if (a.id === 'intelligence') { if (d.data['Arabe']) pa += 3; if (d.data['Skill']) pa += 2; if (d.data['Chess']) pa += 3; if (d.data['Arabe'] && d.data['Chess'] && d.data['Skill']) pa += 10; }
      if (a.id === 'discipline')   { if (d.data['No Scroll']) pa += 2; if (isPerfect(d.date)) pa += 6; pa += 1; }
      if (a.id === 'mental')       { if (d.data['No Scroll']) pa += 1; if (isPerfect(d.date)) pa += 3; }
      if (a.id === 'execution')    { if (scoreDay(d.date) >= DS) pa += 1; if (isPerfect(d.date)) pa += 8; }
      return acc + pa;
    }, 0);
    attrDelta[a.id] = paThisWeek;
  });

  const bestAttr = ATTRIBUTES.reduce((a, b) => attrDelta[b.id] > attrDelta[a.id] ? b : a);
  const worstAttrProgression = ATTRIBUTES.reduce((a, b) => attrDelta[b.id] < attrDelta[a.id] ? b : a);

  // ── Boss ──
  const boss = getBossByWeek(wn);
  let bossHpPct = 100, bossStepsDone = 0, bossStepsTotal = 0, bossDeclared = null;
  if (boss) {
    const bossKey = `w${wn}_${yr}`;
    const bossData = S.boss()[bossKey];
    bossStepsTotal = (boss.s || []).length;
    bossStepsDone = bossData ? (bossData.checks || []).length : 0;
    bossHpPct = bossStepsTotal > 0
      ? Math.max(0, 100 - Math.round(bossStepsDone / bossStepsTotal * 100))
      : 100;
    bossDeclared = bossData ? bossData.declared : null;
  }

  // ── Quêtes ──
  const weekQKey = `qw${wn}_${yr}`;
  let questsDone = 0, questsFailed = 0, questsPending = 0;
  const genData = getGeneratedQuests(wn, yr);
  const weekQuests = genData ? genData.quests : [];
  weekQuests.forEach(q => {
    const st = S.getQState(weekQKey, q.n);
    if (st.state === 'done') questsDone++;
    else if (st.state === 'failed') questsFailed++;
    else questsPending++;
  });

  // ── Streak ──
  const { streak, best } = computeStreak(today);

  // Rapport semaine précédente
  const lastWeekDate = addDays(today, -7);
  const lastReport = getStoredReport(lastWeekDate);

  // ══════════════════════════════════════════
  // GÉNÉRATION DES BLOCS TEXTE
  // ══════════════════════════════════════════

  const pct = Math.round(completionRate * 100);
  const trackedCount = trackedDays.length;

  // ── BLOC 1 — CE QUE TU AS CONSTRUIT ──
  let built = '';
  const bestAttrDelta = attrDelta[bestAttr.id];
  const topHabit = HABITS.reduce((a, b) =>
    (days.filter(d => d.data && d.data[b]).length > days.filter(d => d.data && d.data[a]).length) ? b : a
  );
  const topHabitDays = days.filter(d => d.data && d.data[topHabit]).length;

  if (pct >= 80) {
    built = `${pct}% de complétion sur ${trackedCount} jours trackés. `
      + `${bestAttr.emoji} ${bestAttr.name} a le plus progressé cette semaine (+${bestAttrDelta} PA). `
      + `${topHabit} a tenu ${topHabitDays}/7 jours. `
      + (streak >= 7 ? `Streak actuel : ${streak} jours. Le Système enregistre la continuité.` : 'Les données confirment une semaine solide.');
  } else if (pct >= 50) {
    built = `${pct}% de complétion cette semaine. `
      + `${bestAttr.emoji} ${bestAttr.name} reste ton attribut le plus actif (+${bestAttrDelta} PA). `
      + `${topHabit} a été ta base sur ${topHabitDays} jours. `
      + 'Il y a des jours à récupérer, mais la fondation tient.';
  } else {
    built = `${pct}% de complétion. ${trackedCount} jours sur 7 trackés. `
      + `${bestAttr.emoji} ${bestAttr.name} a progressé malgré tout (+${bestAttrDelta} PA). `
      + 'La semaine a résisté. Les données ne jugent pas — elles enregistrent.';
  }

  // ── BLOC 2 — CE QUI A RÉSISTÉ ──
  const hardestHabits = HABITS
    .map(h => ({ h, missed: missedCounts[h] }))
    .filter(x => x.missed >= 3)
    .sort((a, b) => b.missed - a.missed);

  let resisted = '';
  if (!hardestHabits.length) {
    resisted = 'Aucune habitude n\'a résisté 3 fois ou plus. Semaine propre.';
  } else {
    const top = hardestHabits[0];
    resisted = `${top.h} a résisté ${top.missed} fois cette semaine. `;
    if (hardestHabits.length > 1) {
      resisted += `${hardestHabits.slice(1,3).map(x => x.h).join(' et ')} ont aussi résisté. `;
    }
    resisted += `${worstDay.dayName} semble être ton point faible avec ${worstDay.missed} habitude${worstDay.missed > 1 ? 's' : ''} ratée${worstDay.missed > 1 ? 's' : ''}.`;
  }

  // ── BLOC 3 — CE QUE LES DONNÉES DISENT DE TOI ──
  let pattern = '';
  const fastestAttr = ATTRIBUTES.reduce((a, b) => attrDelta[b.id] > attrDelta[a.id] ? b : a);
  const slowestAttr = ATTRIBUTES.reduce((a, b) => attrDelta[b.id] < attrDelta[a.id] ? b : a);
  const stagnantAttrs = ATTRIBUTES.filter(a => attrDelta[a.id] === 0);

  pattern = `${fastestAttr.emoji} ${fastestAttr.name} progresse le plus vite cette semaine. `;
  if (stagnantAttrs.length) {
    pattern += `${stagnantAttrs.map(a => a.emoji + ' ' + a.name).join(', ')} n'ont pas bougé. `;
  }
  if (lastReport) {
    const prevRate = Math.round((lastReport.completionRate || 0) * 100);
    const delta = pct - prevRate;
    if (delta > 5) pattern += `Progression de +${delta}% par rapport à la semaine dernière (${prevRate}%). `;
    else if (delta < -5) pattern += `Baisse de ${Math.abs(delta)}% par rapport à la semaine dernière (${prevRate}%). `;
    else pattern += `Stable par rapport à la semaine dernière (${prevRate}%). `;
  } else {
    pattern += 'Premier rapport disponible — pas de comparaison possible.';
  }

  // ── BLOC 4 — ÉTAT DU COMBAT ──
  let bossStatus = '';
  if (!boss) {
    bossStatus = 'Aucun boss assigné cette semaine.';
  } else if (bossDeclared === 'won') {
    bossStatus = `${boss.i} ${boss.n} — VAINCU. +${boss.r} PD encaissés.`;
  } else if (bossDeclared === 'failed') {
    bossStatus = `${boss.i} ${boss.n} — ÉCHOUÉ. La séquelle est enregistrée.`;
  } else {
    const dmgPerDay = trackedCount > 0 ? bossStepsDone / trackedCount : 0;
    const remainingSteps = bossStepsTotal - bossStepsDone;
    const daysToFinish = dmgPerDay > 0 ? Math.ceil(remainingSteps / dmgPerDay) : 99;
    const weekStart2 = getWS(today, 0);
    const weekEnd = addDays(weekStart2, 6);
    const daysLeft = Math.max(0, daysBetween(today, weekEnd));

    bossStatus = `${boss.i} ${boss.n} — ${bossHpPct}% HP restants. `;
    bossStatus += `${bossStepsDone}/${bossStepsTotal} étapes complétées. `;

    if (daysToFinish <= daysLeft) {
      bossStatus += `À ce rythme, victoire dans ${daysToFinish} jour${daysToFinish > 1 ? 's' : ''}. Dans les temps.`;
    } else if (daysLeft === 0) {
      bossStatus += bossHpPct === 0
        ? 'Toutes les étapes faites. Déclare la victoire.'
        : `Deadline atteinte. ${bossHpPct}% HP restants — déclare le résultat.`;
    } else {
      bossStatus += `Il faut ${daysToFinish} jours à ce rythme mais il reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. En retard.`;
    }
  }

  // ── BLOC 5 — DIRECTIVE ──
  let directive = '';
  const weekStart3 = getWS(today, 0);
  const weekEnd3 = addDays(weekStart3, 6);
  const daysLeft3 = Math.max(0, daysBetween(today, weekEnd3));

  const bossInRetard = boss && !bossDeclared && bossHpPct > 50 && daysLeft3 <= 3;
  const attrBloque = ATTRIBUTES.find(a => attrDelta[a.id] === 0 && (attrNow[a.id] || 0) < 50);
  const jourFaible = worstDay.missed >= 5;
  const enFeu = streak >= 14 && pct >= 85;

  if (bossInRetard) {
    directive = `Le boss ${boss.n} est à ${bossHpPct}% HP avec ${daysLeft3} jour${daysLeft3 > 1 ? 's' : ''} restant${daysLeft3 > 1 ? 's' : ''}. La prochaine semaine commence par le boss.`;
  } else if (attrBloque) {
    directive = `${attrBloque.emoji} ${attrBloque.name} n'a pas bougé cette semaine. La semaine prochaine, une action concrète sur cet attribut avant tout autre.`;
  } else if (jourFaible) {
    directive = `${worstDay.dayName} est ton point de rupture. La semaine prochaine, prépare ce jour différemment — anticipe l'obstacle.`;
  } else if (enFeu) {
    directive = `${streak} jours de streak. ${pct}% de complétion. La semaine prochaine : un boss ou une quête difficile que tu évites depuis trop longtemps.`;
  } else {
    const focusAttr = stagnantAttrs.length ? stagnantAttrs[0] : slowestAttr;
    directive = `Semaine ordinaire. La prochaine : coche ${focusAttr.emoji} ${focusAttr.name} au moins 5 jours sur 7. Pas de grand objectif — juste ça.`;
  }

  // ── Sauvegarde ──
  const report = {
    weekKey,
    generatedAt: new Date().toISOString(),
    completionRate,
    pct,
    streak,
    questsDone,
    questsFailed,
    boss: boss ? { name: boss.n, icon: boss.i, hpPct: bossHpPct, declared: bossDeclared } : null,
    built,
    resisted,
    pattern,
    bossStatus,
    directive,
  };

  localStorage.setItem(getReportKey(today), JSON.stringify(report));
  return report;
}
