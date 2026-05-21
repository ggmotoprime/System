// ══════════════════════════════════════════════
// STATS.JS — Onglet statistiques
// ══════════════════════════════════════════════

function renderStats() {
  const t = toDay();
  const { streak, best } = computeStreak(t);
  const total = Object.values(allData).reduce((a, d) => a + HABITS.filter(h => d[h]).length, 0);
  const perfect = Object.keys(allData).filter(d => isPerfect(d)).length;

  document.getElementById('stat-streak').textContent  = streak + 'j';
  document.getElementById('stat-best').textContent    = best + 'j';
  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-perfect').textContent = perfect;

  // Semaine courante
  const now = new Date(t + 'T12:00:00');
  const ws  = new Date(now), dow = ws.getDay();
  ws.setDate(ws.getDate() - (dow === 0 ? 6 : dow - 1));
  let wD = 0, wT = 0;
  for (let d = new Date(ws); d <= now; d.setDate(d.getDate() + 1)) {
    const s = d.toISOString().substring(0, 10);
    if (allData[s]) { wD += HABITS.filter(h => allData[s][h]).length; wT += HABITS.length; }
  }
  document.getElementById('con-week').textContent = (wT > 0 ? Math.round(wD / wT * 100) : 0) + '%';

  // Mois courant
  const ms = new Date(now.getFullYear(), now.getMonth(), 1);
  let mD = 0, mT = 0;
  for (let d = new Date(ms); d <= now; d.setDate(d.getDate() + 1)) {
    const s = d.toISOString().substring(0, 10);
    if (allData[s]) { mD += HABITS.filter(h => allData[s][h]).length; mT += HABITS.length; }
  }
  document.getElementById('con-month').textContent = (mT > 0 ? Math.round(mD / mT * 100) : 0) + '%';

  // Global
  const aD = Object.values(allData).reduce((a, d) => a + HABITS.filter(h => d[h]).length, 0);
  const aT = Object.keys(allData).length * HABITS.length;
  document.getElementById('con-rate').textContent = (aT > 0 ? Math.round(aD / aT * 100) : 0) + '%';

  // Meilleure / pire habitude
  const dates = Object.keys(allData);
  if (!dates.length) return;
  const rates = HABITS.map((h, i) => ({
    h, i, rate: Math.round(dates.filter(d => allData[d][h]).length / dates.length * 100)
  }));
  const bst  = rates.reduce((a, b) => b.rate > a.rate ? b : a);
  const wrst = rates.reduce((a, b) => b.rate < a.rate ? b : a);
  document.getElementById('best-habit').textContent  = bst.h;
  document.getElementById('best-habit').style.color  = COLORS[bst.i];
  document.getElementById('best-pct').textContent    = bst.rate + '%';
  document.getElementById('worst-habit').textContent = wrst.h;
  document.getElementById('worst-habit').style.color = COLORS[wrst.i];
  document.getElementById('worst-pct').textContent   = wrst.rate + '%';
}

function renderWeekScores(today) {
  const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const now  = new Date(today + 'T12:00:00');
  const ws   = new Date(getWS(today, weekOff) + 'T12:00:00');
  const label = weekOff === 0 ? 'Cette semaine' : weekOff === -1 ? 'Semaine dernière' : `Il y a ${Math.abs(weekOff)} sem.`;
  document.getElementById('week-nav-lbl').textContent    = label;
  document.getElementById('week-next').disabled = weekOff >= 0;
  document.getElementById('week-prev').disabled = weekOff <= -20;
  const el = document.getElementById('week-scores');
  el.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws); d.setDate(d.getDate() + i);
    const s = d.toISOString().substring(0, 10);
    const score = allData[s] ? scoreDay(s) : null;
    const pct   = score !== null ? Math.round(score / HABITS.length * 100) : 0;
    const isFuture = d > now;
    const color = pct >= 100 ? '#22c55e' : pct >= 70 ? '#eab308' : pct >= 40 ? '#f97316' : '#ef4444';
    el.innerHTML += `
      <div class="week-row">
        <span class="week-day">${days[i]}</span>
        <div class="week-bar-bg">
          <div class="week-bar-fill" style="width:${isFuture ? 0 : pct}%;background:${color};opacity:${isFuture ? .18 : score === null ? .28 : 1};"></div>
        </div>
        <span class="week-score">${isFuture ? '—' : score !== null ? score + '/10' : '—'}</span>
      </div>`;
  }
}

function renderComparison(today) {
  const now = new Date(today + 'T12:00:00');
  function wAvg(off) {
    const ws = new Date(getWS(today, off) + 'T12:00:00'), we = new Date(ws);
    we.setDate(we.getDate() + 6);
    const end = off === 0 ? now : we;
    let done = 0, total = 0;
    for (let d = new Date(ws); d <= end; d.setDate(d.getDate() + 1)) {
      const s = d.toISOString().substring(0, 10);
      if (allData[s]) { done += scoreDay(s); total += HABITS.length; }
    }
    return total > 0 ? Math.round(done / total * 100) : null;
  }
  function mAvg(off) {
    const ref = new Date(now.getFullYear(), now.getMonth() - off, 1);
    const end  = off === 0 ? now : new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    let done = 0, total = 0;
    for (let d = new Date(ref); d <= end; d.setDate(d.getDate() + 1)) {
      const s = d.toISOString().substring(0, 10);
      if (allData[s]) { done += scoreDay(s); total += HABITS.length; }
    }
    return total > 0 ? Math.round(done / total * 100) : null;
  }
  const tw = wAvg(0), lw = wAvg(-1), tm = mAvg(0), lm = mAvg(1);
  const delta = (a, b) => {
    if (a === null || b === null) return `<span class="comp-delta flat">—</span>`;
    const d = a - b;
    return `<span class="comp-delta ${d > 0 ? 'up' : d < 0 ? 'down' : 'flat'}">${d > 0 ? '+' : ''}${d}%</span>`;
  };
  document.getElementById('comp-grid').innerHTML = `
    <div class="comp-card"><div class="comp-lbl">Cette semaine</div><div class="comp-val">${tw !== null ? tw + '%' : '—'}</div>${delta(tw, lw)}</div>
    <div class="comp-card"><div class="comp-lbl">Sem. dernière</div><div class="comp-val">${lw !== null ? lw + '%' : '—'}</div></div>
    <div class="comp-card"><div class="comp-lbl">Ce mois</div><div class="comp-val">${tm !== null ? tm + '%' : '—'}</div>${delta(tm, lm)}</div>
    <div class="comp-card"><div class="comp-lbl">Mois dernier</div><div class="comp-val">${lm !== null ? lm + '%' : '—'}</div></div>`;
}

function renderYearSel() {
  const sel = document.getElementById('year-sel');
  const cy  = new Date().getFullYear().toString();
  const years = [...new Set(Object.keys(allData).map(d => d.substring(0, 4)))];
  if (!years.includes(cy)) years.push(cy);
  years.sort((a, b) => b - a);
  sel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
  sel.value = cy;
}

function getHeatColor(count) {
  const dk = document.documentElement.getAttribute('data-theme') === 'dark';
  if (count === 0) return dk ? '#161718' : '#e5e7eb';
  if (count <= 2)  return dk ? '#14532d' : '#bbf7d0';
  if (count <= 4)  return dk ? '#15803d' : '#86efac';
  if (count <= 6)  return dk ? '#16a34a' : '#4ade80';
  if (count <= 8)  return dk ? '#22c55e' : '#22c55e';
  return dk ? '#4ade80' : '#16a34a';
}

function renderHeatmap() {
  const year = parseInt(document.getElementById('year-sel').value);
  const ce   = document.getElementById('heatmap-cols');
  const me   = document.getElementById('heatmap-months');
  ce.innerHTML = ''; me.innerHTML = '';
  const start = new Date(year, 0, 1), dow = start.getDay();
  start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));
  const end = new Date(year, 11, 31);
  const tt  = document.getElementById('tooltip');
  let col = null, wc = 0, mp = {}, d = new Date(start);
  while (true) {
    const id = d.getDay() === 0 ? 6 : d.getDay() - 1;
    if (id === 0) {
      col = document.createElement('div'); col.className = 'heatmap-col'; ce.appendChild(col);
      const m = d.getMonth();
      if (d.getFullYear() === year && !mp[m]) mp[m] = wc;
      wc++;
    }
    const cell = document.createElement('div'); cell.className = 'heatmap-cell';
    const ds = d.toISOString().substring(0, 10);
    if (d.getFullYear() === year) {
      const dd  = allData[ds] || {};
      const cnt = HABITS.filter(h => dd[h]).length;
      cell.style.background = getHeatColor(cnt);
      if (isPerfect(ds)) cell.style.outline = '1.5px solid rgba(74,222,128,.6)';
      cell.addEventListener('mouseenter', () => {
        const dn = HABITS.filter(h => dd[h]);
        tt.innerHTML = `<strong>${ds}</strong> · ${cnt}/10${isPerfect(ds) ? ' ⭐' : ''}<br><span style="color:var(--muted);font-size:.64rem;">${dn.length ? dn.join(', ') : 'Aucune'}</span>`;
        tt.style.display = 'block';
      });
      cell.addEventListener('mousemove', e => {
        tt.style.left = (e.clientX + 10) + 'px';
        tt.style.top  = (e.clientY - 42) + 'px';
      });
      cell.addEventListener('mouseleave', () => { tt.style.display = 'none'; });
    } else {
      cell.style.opacity = '0';
    }
    if (col) col.appendChild(cell);
    d.setDate(d.getDate() + 1);
    if (d > end && d.getDay() === 1) break;
  }
  const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
  for (let m = 0; m < 12; m++) {
    const pos = mp[m] || 0, nx = mp[m + 1] || wc;
    const sp = document.createElement('div'); sp.className = 'month-lbl';
    sp.style.width = ((nx - pos) * 12) + 'px';
    sp.textContent = months[m]; me.appendChild(sp);
  }
  const lg = document.getElementById('hm-legend-cells'); lg.innerHTML = '';
  [0, 2, 4, 6, 8, 10].forEach(n => {
    const c = document.createElement('div'); c.className = 'legend-cell';
    c.style.background = getHeatColor(n); lg.appendChild(c);
  });
}

function renderFilters() {
  const el = document.getElementById('filter-row'); el.innerHTML = '';
  Object.keys(CATEGORIES).forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === curFilter ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => { curFilter = cat; renderFilters(); renderBars(cat); });
    el.appendChild(btn);
  });
}

function renderBars(filter) {
  const dates  = Object.keys(allData), total = dates.length || 1;
  const catHabits = CATEGORIES[filter];
  const filtered  = !catHabits ? HABITS : HABITS.filter(h => catHabits.includes(h));
  document.getElementById('bar-list').innerHTML = filtered.map(h => {
    const i     = HABITS.indexOf(h);
    const count = dates.filter(d => allData[d][h]).length;
    const pct   = Math.round(count / total * 100);
    return `
      <div class="bar-row">
        <div class="bar-meta">
          <div class="bar-nw"><div class="bar-dot" style="background:${COLORS[i]}"></div><span>${h}</span></div>
          <div class="bar-right"><span class="bar-cnt">${count}j</span><span class="bar-pct">${pct}%</span></div>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${COLORS[i]}"></div></div>
      </div>`;
  }).join('');
}

function renderDonut() {
  const counts = HABITS.map(h => Object.values(allData).filter(d => d[h]).length);
  const total  = counts.reduce((a, b) => a + b, 0);
  document.getElementById('donut-total').textContent = total;
  if (donutCh) donutCh.destroy();
  donutCh = new Chart(document.getElementById('donut-chart').getContext('2d'), {
    type: 'doughnut',
    data: { labels: HABITS, datasets: [{ data: counts, backgroundColor: COLORS, borderWidth: 0, hoverOffset: 4 }] },
    options: { cutout: '65%', plugins: { legend: { display: false } }, animation: { duration: 700 } }
  });
  document.getElementById('donut-legend').innerHTML = HABITS.map((h, i) =>
    `<div class="legend-item">
      <div class="legend-dot" style="background:${COLORS[i]}"></div>
      <span>${h}</span>
      <span class="legend-count">${counts[i]}</span>
    </div>`
  ).join('');
}
