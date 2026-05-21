// ══════════════════════════════════════════════
// STORAGE.JS — Tout ce qui touche localStorage
// ══════════════════════════════════════════════

const S = {
  db:               () => localStorage.getItem('ht_db'),
  saveDb:           v  => localStorage.setItem('ht_db', v),

  boss:             () => JSON.parse(localStorage.getItem('ht_boss') || '{}'),
  saveBoss:         v  => localStorage.setItem('ht_boss', JSON.stringify(v)),

  tx:               () => JSON.parse(localStorage.getItem('ht_tx') || '[]'),
  saveTx:           v  => localStorage.setItem('ht_tx', JSON.stringify(v)),

  malus:            () => JSON.parse(localStorage.getItem('ht_m4') || '[]'),
  saveMalus:        v  => localStorage.setItem('ht_m4', JSON.stringify(v)),

  skills:           () => JSON.parse(localStorage.getItem('ht_skills') || '{}'),
  saveSkills:       v  => localStorage.setItem('ht_skills', JSON.stringify(v)),

  // Données personnalisées (remplacent les defaults si présentes)
  customBosses:     () => JSON.parse(localStorage.getItem('ht_cb')   || 'null'),
  saveCustomBosses: v  => localStorage.setItem('ht_cb', JSON.stringify(v)),

  customQuests:     () => JSON.parse(localStorage.getItem('ht_cq')   || 'null'),
  saveCustomQuests: v  => localStorage.setItem('ht_cq', JSON.stringify(v)),

  customBonuses:    () => JSON.parse(localStorage.getItem('ht_cbon') || 'null'),
  saveCustomBonuses:v  => localStorage.setItem('ht_cbon', JSON.stringify(v)),

  customMaluses:    () => JSON.parse(localStorage.getItem('ht_cmal') || 'null'),
  saveCustomMaluses:v  => localStorage.setItem('ht_cmal', JSON.stringify(v)),

  customSkillCats:  () => JSON.parse(localStorage.getItem('ht_csk')  || 'null'),
  saveCustomSkillCats:v => localStorage.setItem('ht_csk', JSON.stringify(v)),

  // Séquelles actives
  sequelles:        () => JSON.parse(localStorage.getItem('ht_seq')  || '[]'),
  saveSequelles:    v  => localStorage.setItem('ht_seq', JSON.stringify(v)),

  // Rang précédent (pour détecter les éveils)
  lastRank:         () => localStorage.getItem('ht_last_rank') || 'E',
  saveLastRank:     v  => localStorage.setItem('ht_last_rank', v),

  // Titre équipé
  equippedTitle:    () => localStorage.getItem('ht_title') || '',
  saveEquippedTitle:v  => localStorage.setItem('ht_title', v),

  // Chroniques (événements clés)
  chronicles:       () => JSON.parse(localStorage.getItem('ht_chron') || '[]'),
  saveChronicles:   v  => localStorage.setItem('ht_chron', JSON.stringify(v)),

  // Quêtes (nouveau format par clé semaine)
  getQState: (weekKey, questName) => {
    try {
      const raw = localStorage.getItem(`${weekKey}__${questName}`);
      return raw ? JSON.parse(raw) : { state: 'pending' };
    } catch { return { state: 'pending' }; }
  },
  saveQState: (weekKey, questName, stateObj) => {
    localStorage.setItem(`${weekKey}__${questName}`, JSON.stringify(stateObj));
  },
  clearQStates: (weekKey) => {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(weekKey + '__')) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  },
};

// Accesseurs avec fallback sur les defaults
function getBosses()    { return S.customBosses()    || BOSSES_DEFAULT; }
function getQuests()    { return S.customQuests()    || QUESTS_DEFAULT; }
function getBonuses()   { return S.customBonuses()   || BONUSES_DEFAULT; }
function getMaluses()   { return S.customMaluses()   || MALUSES_DEFAULT; }
function getSkillCats() { return S.customSkillCats() || SKILLS_DATA_DEFAULT; }
