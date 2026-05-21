// ══════════════════════════════════════════════
// APP.JS — Initialisation et événements
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // ── Thème ──
  const savedTheme = localStorage.getItem('ht_theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  // ── Connexion ──
  document.getElementById('connect-btn').addEventListener('click', connect);
  document.getElementById('db-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') connect();
  });

  // ── Tabs ──
  document.querySelector('.tab-bar').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (btn && btn.dataset.tab) switchTab(btn.dataset.tab);
  });

  // ── Header boutons ──
  document.getElementById('refresh-btn').addEventListener('click', refresh);
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);
  document.getElementById('reset-menu-btn').addEventListener('click', e => {
    e.stopPropagation(); showResetMenu();
  });
  document.getElementById('logout-btn').addEventListener('click', logout);

  // ── Today ──
  document.getElementById('ranks-btn').addEventListener('click', toggleRanks);

  // ── Boss ──
  document.getElementById('reset-quests-btn').addEventListener('click', () => confirmReset('quests'));

  // ── Edit mode ──
  document.getElementById('edit-toggle-btn').addEventListener('click', toggleEditMode);

  // ── Boutons ajout rapide ──
  document.getElementById('add-quest-today-btn').addEventListener('click', () => openEditModal('addquest'));
  document.getElementById('add-skill-btn').addEventListener('click', () => openEditModal('addskill'));
  document.getElementById('add-bonus-btn').addEventListener('click', () => openEditModal('addbonus'));
  document.getElementById('add-malus-btn').addEventListener('click', () => openEditModal('addmalus'));

  // ── Modal édition ──
  document.getElementById('modal-close-btn').addEventListener('click', closeEditModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeEditModal);
  document.getElementById('modal-save-btn').addEventListener('click', saveEditModal);
  document.getElementById('edit-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('edit-modal')) closeEditModal();
  });

  // ── Confirm dialog ──
  document.getElementById('confirm-yes').addEventListener('click', executeConfirm);
  document.getElementById('confirm-no').addEventListener('click', closeConfirm);
  document.getElementById('confirm-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('confirm-overlay')) closeConfirm();
  });

  // ── Stats ──
  document.getElementById('week-prev').addEventListener('click', () => {
    weekOff--; renderWeekScores(toDay());
  });
  document.getElementById('week-next').addEventListener('click', () => {
    weekOff++; renderWeekScores(toDay());
  });
  document.getElementById('year-sel').addEventListener('change', renderHeatmap);
  document.getElementById('skills-search').addEventListener('input', filterSkills);

  // ── Boutique ──
  document.getElementById('clear-tx-btn').addEventListener('click', () => confirmReset('transactions'));

  // ── Attributs ──
  document.getElementById('reset-attr-btn').addEventListener('click', () => confirmReset('attributes'));

  // ── Auto-connexion si DB déjà sauvegardée ──
  const db = S.db();
  if (db) {
    document.getElementById('db-input').value = db;
    curDbId = db;
    connect();
  }
});
