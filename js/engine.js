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
  const xp = computeXP();
  const rank = getRank(xp);
  const idx = getRankIdx(xp);
  // Passif cumulatif : si rang >= celui qui débloque le passif
  return RANKS.slice(0, idx + 1).some(r => r.passif && r.passif.id === id);
}

// ── Streak ──
function computeStreak(today) {
  let s = 0;
  const c = new Date(today + 'T12:00:00');

  // Passif D : 9/10 compte comme parfait pour le streak
  const streakPerfect = (d) => hasPassif('endurance')
    ? scoreDay(d) >= HABITS.length - 1
    : isPerfect(d);

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

  // Passif A : +2 PA par habitude
  const bonusPerHabit = hasPassif('mastery') ? 2 : 0;

  for (const d of dates) {
    const s = scoreDay(d);
    xp += s * (10 + bonusPerHabit);
    if (isPerfect(d)) xp += 150;
    run = isPerfect(d) ? run + 1 : 0;

    // Passif S : bonus streak doublé
    const streakMult = hasPassif('ascension') ? 2 : 1;
    if (run === 7)   xp += 300  * streakMult;
    if (run === 30)  xp += 1000 * streakMult;
    if (run === 100) xp += 5000 * streakMult;
  }

  // Passif B : semaines 7/7 ≥ 7/10 → +200 PD
  if (hasPassif('momentum')) {
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
  // Compte les semaines où tous les 7 jours ont score >= 7
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

// ── PA par sous-attribut ──
function computeSubPA() {
  const pa = {};
  ATTRIBUTES.forEach(a => a.subs.forEach(s => pa[s.id] = 0));
  const dates = Object.keys(allData).sort();
  let run = 0, s7done = false, s30done = false;

  // Passif A : +2 PA par habitude
  const bonus = hasPassif('mastery') ? 2 : 0;

  for (const d of dates) {
    const day = allData[d] || {};
    const sc = scoreDay(d);

    if (isPerfect(d)) { run++; } else { run = 0; s7done = false; s30done = false; }

    // Habitudes → PA (+ bonus passif A)
    if (day['No Scroll']) { pa.disc_noscroll += 3 + bonus; pa.men_ennui += 2 + bonus; pa.men_impulse += 1; }
    if (isPerfect(d))     { pa.disc_routine += 3; pa.disc_exec += 2; pa.disc_constance += 1; pa.men_impulse += 2; pa.men_stabilite += 1; pa.exe_prio += 3; pa.exe_vitesse += 5; }
    if (run === 7  && !s7done)  { pa.disc_noscroll += 8; pa.disc_constance += 6; pa.men_impulse += 8; pa.men_stabilite += 4; pa.exe_vitesse += 10; pa.exe_constance += 8; s7done = true; }
    if (run === 30 && !s30done) { pa.disc_constance += 15; pa.men_stabilite += 10; pa.exe_constance += 15; pa.exe_vitesse += 20; s30done = true; }

    pa.disc_constance += 1;
    if (sc >= DS) pa.exe_constance += 1;

    if (day['Sport'])     { pa.phy_force += 1 + bonus; pa.phy_endurance += 1 + bonus; }
    if (day['Pushup'])    { pa.phy_force += 2 + bonus; }
    if (day['Nutrition']) { pa.nut_qualite += 4 + bonus; pa.nut_compo += 1; }
    if (day['Priere'])    { pa.spi_salat += 3 + bonus; pa.spi_dhikr += 1; }
    if (day['Coran'])     { pa.spi_coran += 3 + bonus; }
    if (day['Islam'])     { pa.spi_ilm += 2 + bonus; }
    if (day['Arabe'])     { pa.int_arabe += 3 + bonus; }
    if (day['Skill'])     { pa.int_skill += 2 + bonus; }
    if (day['Chess'])     { pa.int_echecs += 4 + bonus; }
  }

  // ── Boss vaincus → PA sur l'attribut du boss ──
  const bossData = S.boss();
  getBosses().forEach(boss => {
    const yr = new Date().getFullYear();
    const key = `w${boss.week}_${yr}`;
    const bd = bossData[key];
    if (bd && bd.declared === 'won') {
      const paAmount = BOSS_PA_BY_DIFF[boss.d] || 60;
      const attr = ATTRIBUTES.find(a => a.id === boss.a);
      if (attr) {
        // Répartit les PA équitablement sur les sous-attributs
        const perSub = Math.floor(paAmount / attr.subs.length);
        attr.subs.forEach(sub => { pa[sub.id] = (pa[sub.id] || 0) + perSub; });
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
        // Skill maîtrisé : bonus PA une fois
        const perSub = Math.floor(SKILL_PA_AMOUNT / attr.subs.length);
        attr.subs.forEach(sub => { pa[sub.id] = (pa[sub.id] || 0) + perSub; });
      }
    });
  });

  // Séquelles : -5% PA sur l'attribut concerné
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

  // Passif C : malus boss réduit
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
  const { streak, best } = computeStreak(today);
  const dates = Object.keys(allData).sort();
  const yesterday = addDays(today, -1);
  const bossWon = Object.values(S.boss()).some(b => b.declared === 'won' && b.declaredDate === today);

  // Calcule si c'est un retour après 3+ jours faibles
  const last3 = [1,2,3].map(i => addDays(today, -i));
  const wasWeak = last3.every(d => allData[d] && scoreDay(d) < DS);
  const isComeback = wasWeak && s >= DS;

  // Détermine contexte
  let ctx, tone;
  if      (streak >= 30)                                   { ctx = 'streak_30';             tone = 'dramatic'; }
  else if (streak >= 14)                                   { ctx = 'streak_14';             tone = 'dramatic'; }
  else if (streak >= 7)                                    { ctx = 'streak_7';              tone = 'dramatic'; }
  else if (bossWon)                                        { ctx = 'boss_won';              tone = 'positive'; }
  else if (isPerfect(yesterday) && s < DS && s > 0)        { ctx = 'first_fail_after_streak'; tone = 'warning'; }
  else if (isComeback)                                     { ctx = 'comeback';              tone = 'positive'; }
  else if (new Date(today + 'T12:00:00').getDay() === 1 && s === 0) { ctx = 'monday_zero'; tone = 'neutral'; }
  else if (isPerfect(today))                               { ctx = 'perfect';              tone = 'positive'; }
  else if (pct >= 0.7)                                     { ctx = 'high';                 tone = 'positive'; }
  else if (pct >= 0.4)                                     { ctx = 'mid';                  tone = 'neutral'; }
  else if (s === 0)                                        { ctx = 'zero_morning';         tone = 'neutral'; }
  else                                                     { ctx = 'low';                  tone = 'warning'; }

  const pool = SYSTEM_MESSAGES[ctx] || SYSTEM_MESSAGES.high;
  const msg = pool[Math.floor(dates.length % pool.length)]; // pseudo-aléatoire déterministe

  // Remplace {streak} si présent
  return { text: msg.replace('{streak}', streak), tone };
}

// ── Titres débloqués ──
function getUnlockedTitles() {
  const today = toDay();
  const { streak, best } = computeStreak(today);
  const xp = computeXP();
  const bossWonCount = Object.values(S.boss()).filter(b => b.declared === 'won').length;
  const dates = Object.keys(allData);
  const habitCounts = {};
  const habitStreaks = {};
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

  // Premier jour
  const dates = Object.keys(allData).sort();
  if (dates.length > 0 && !existingTexts.has('first_day')) {
    newEvents.push({ key:'first_day', date: dates[0], text: 'Le Système s\'éveille. Premier jour enregistré.' });
  }

  // Changements de rang (vérifie chaque palier)
  const xp = computeXP();
  RANKS.forEach(r => {
    const letter = r.n.split(' — ')[0].trim();
    const key = `rank_${letter}`;
    if (xp >= r.min && !existingTexts.has(key)) {
      newEvents.push({ key, date: today, text: `Rang ${r.e} ${r.n} atteint.` });
    }
  });

  // Boss vaincus
  getBosses().forEach(boss => {
    const yr = new Date().getFullYear();
    const bKey = `w${boss.week}_${yr}`;
    const bd = S.boss()[bKey];
    const key = `boss_won_${bKey}`;
    if (bd && bd.declared === 'won' && !existingTexts.has(key)) {
      newEvents.push({ key, date: today, text: `Boss vaincu : ${boss.i} ${boss.n}. +${boss.r} PD.` });
    }
  });

  // Streaks records
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
  if (rankOrder.indexOf(currentLetter) > rankOrder.indexOf(lastLetter)) {
    return currentLetter; // nouveau rang à afficher
  }
  return null;
}

function confirmAwakening(letter) {
  S.saveLastRank(letter);
}

// ── Escaper HTML ──
function escAttr(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
