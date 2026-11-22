// Solara Bay: Neon Dynasty (V4) — Costa Customs 3D Garage & Full City Map / Career / Save Hub Menus

import { DISTRICTS } from '../core/config.js';
import { PAINT_SWATCHES } from '../systems/economy.js';

export function createMenuController(economySystem, missionSystem, storageManager, callbacks) {
  const garageOverlay = document.getElementById('garage-overlay');
  const hubOverlay = document.getElementById('hub-overlay');
  const hudLayer = document.getElementById('hud-layer');
  const skyBrand = document.getElementById('sky-brand-badge');

  function renderGarageUI() {
    const cashEl = document.getElementById('garage-cash');
    if (cashEl) cashEl.textContent = `$${economySystem.getCash().toLocaleString()}`;

    const stats = economySystem.getVehicleStats();
    const statsEl = document.getElementById('garage-stat-bars');
    if (statsEl) {
      statsEl.innerHTML = Object.values(stats)
        .map(
          (st) => `
        <div class="g-stat-row">
          <span>${st.label}</span>
          <div class="g-stat-track"><div class="g-stat-fill" style="width:${st.pct}%"></div></div>
          <span style="text-align:right;color:#ffb830">${st.valText}</span>
        </div>`
        )
        .join('');
    }

    const swatchesEl = document.getElementById('garage-paint-swatches');
    if (swatchesEl) {
      const curHex = economySystem.getActivePaint();
      swatchesEl.innerHTML = PAINT_SWATCHES.map(
        (sw) => `
        <button class="paint-btn ${sw.hex === curHex ? 'active' : ''}"
                data-hex="${sw.hex}"
                style="background:${sw.hex}">
          ${sw.name}
        </button>`
      ).join('');
      swatchesEl.querySelectorAll('.paint-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          callbacks.onPaintSelect(btn.getAttribute('data-hex'));
          renderGarageUI();
        });
      });
    }

    const listEl = document.getElementById('garage-upgrade-list');
    if (listEl) {
      listEl.innerHTML = economySystem
        .getUpgrades()
        .map(
          (u) => `
        <div class="upg-item ${u.selected ? 'selected' : ''}" data-id="${u.id}">
          <span class="upg-badge">${u.badge}</span>
          <span class="upg-name">${u.name}</span>
          <span class="upg-price ${u.owned ? 'owned' : ''}">${u.owned ? '✓ INSTALLED' : `$${u.price.toLocaleString()}`}</span>
        </div>`
        )
        .join('');
      listEl.querySelectorAll('.upg-item').forEach((row) => {
        row.addEventListener('click', () => {
          economySystem.selectUpgrade(row.getAttribute('data-id'));
          renderGarageUI();
        });
      });
    }
  }

  function drawFullCityMapCanvas() {
    const canvas = document.getElementById('hub-map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Deep coastal background
    ctx.fillStyle = '#091526';
    ctx.fillRect(0, 0, W, H);

    // Turquoise Ocean & Golden Beach on East
    ctx.fillStyle = '#e5c185';
    ctx.fillRect(W - 88, 0, 22, H);
    ctx.fillStyle = '#0c7c96';
    ctx.fillRect(W - 66, 0, 66, H);

    // Pacifica Pier on East Coast
    ctx.fillStyle = '#8c5a38';
    ctx.fillRect(W - 68, 72, 38, 12);

    // 4 Color-Coded Districts
    const districtBoxes = [
      { name: 'INDUSTRIAL', sub: 'Refinery & Foundry', x: 10, y: 14, w: 84, h: 282, color: 'rgba(46, 232, 137, 0.22)', border: '#2ee889' },
      { name: 'DOWNTOWN NEON', sub: 'Aurelia Financial Core', x: 100, y: 14, w: 108, h: 142, color: 'rgba(36, 229, 255, 0.22)', border: '#24e5ff' },
      { name: 'HARBOR DOCKS', sub: 'Night Market & Customs', x: 100, y: 162, w: 108, h: 134, color: 'rgba(255, 77, 94, 0.22)', border: '#ff4d5e' },
      { name: 'PALM BLVD', sub: 'Oceanfront Strip', x: 214, y: 14, w: 74, h: 282, color: 'rgba(255, 184, 48, 0.24)', border: '#ffb830' },
    ];

    for (const db of districtBoxes) {
      ctx.fillStyle = db.color;
      ctx.fillRect(db.x, db.y, db.w, db.h);
      ctx.strokeStyle = db.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(db.x, db.y, db.w, db.h);
    }

    // Street grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = 4;
    for (const rx of [93, 152, 211, 258]) {
      ctx.beginPath();
      ctx.moveTo(rx, 10);
      ctx.lineTo(rx, H - 10);
      ctx.stroke();
    }
    for (const ry of [62, 110, 159, 210, 258]) {
      ctx.beginPath();
      ctx.moveTo(10, ry);
      ctx.lineTo(W - 72, ry);
      ctx.stroke();
    }

    // District labels
    for (const db of districtBoxes) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(db.x + 4, db.y + 8, db.w - 8, 18);
      ctx.fillStyle = db.border;
      ctx.font = '900 9.5px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(db.name, db.x + db.w / 2, db.y + 20);
    }

    // Active GPS Waypoint Route Line
    ctx.strokeStyle = '#ffb830';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(258, 178);
    ctx.lineTo(258, 78);
    ctx.lineTo(W - 45, 78);
    ctx.stroke();
    ctx.setLineDash([]);

    // Interactive Location Markers (Missions, Garage, Safehouse, Armory, Precinct)
    const markers = [
      { tag: 'M6', x: 258, y: 112, bg: '#ffb830', fg: '#090d16' },
      { tag: 'G', x: 148, y: 224, bg: '#24e5ff', fg: '#090d16' },
      { tag: 'H', x: 258, y: 78, bg: '#2ee889', fg: '#090d16' },
      { tag: 'A', x: 52, y: 185, bg: '#ff4d5e', fg: '#ffffff' },
      { tag: 'P', x: 152, y: 85, bg: '#5a9cff', fg: '#090d16' },
    ];
    for (const mk of markers) {
      ctx.fillStyle = mk.bg;
      ctx.beginPath();
      ctx.arc(mk.x, mk.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = mk.fg;
      ctx.font = '900 9.5px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mk.tag, mk.x, mk.y);
    }
  }

  function renderHubUI() {
    drawFullCityMapCanvas();

    const missionListEl = document.getElementById('hub-mission-list');
    if (missionListEl) {
      missionListEl.innerHTML = missionSystem.missions
        .map((m) => {
          const stateClass = m.completed ? 'done' : m.rating === 'ACTIVE' ? 'active' : '';
          return `
          <div class="hm-item ${stateClass}">
            <span>${m.id}. ${m.title}</span>
            <span class="hm-rank">${m.rating}</span>
          </div>`;
        })
        .join('');
    }

    const slots = storageManager.getSlots();
    const activeSlot = slots.find((s) => s.active) || slots[0];

    const metricsEl = document.getElementById('hub-career-metrics');
    if (metricsEl && activeSlot) {
      metricsEl.innerHTML = `
        <div class="metric-box"><span class="metric-val">$${economySystem.getCash().toLocaleString()}</span><span class="metric-lbl">SYNDICATE CASH</span></div>
        <div class="metric-box"><span class="metric-val">${activeSlot.stats.carsStolen}</span><span class="metric-lbl">CARS HIJACKED</span></div>
        <div class="metric-box"><span class="metric-val">${activeSlot.stats.copsEscaped}</span><span class="metric-lbl">PURSUITS EVADED</span></div>
        <div class="metric-box"><span class="metric-val">${activeSlot.stats.kmDriven} KM</span><span class="metric-lbl">DISTANCE DRIVEN</span></div>
      `;
    }

    const savesEl = document.getElementById('hub-save-slots');
    if (savesEl) {
      savesEl.innerHTML = slots
        .map(
          (s) => `
        <div class="save-slot-card ${s.active ? 'active' : ''}">
          <div>
            <div class="ss-title">${s.title}</div>
            <div class="ss-meta">${s.completionPct}% · ${s.missionsDone}/10 Missions · $${s.cash.toLocaleString()} · ${s.district}</div>
          </div>
          <div class="ss-actions">
            <button class="btn-slot save" data-slot="${s.slot}">SAVE</button>
            <button class="btn-slot load" data-slot="${s.slot}">LOAD</button>
          </div>
        </div>`
        )
        .join('');

      savesEl.querySelectorAll('.btn-slot.save').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slotNum = Number(btn.getAttribute('data-slot'));
          storageManager.saveToSlot(slotNum, {
            cash: economySystem.getCash(),
            respect: economySystem.getRespect(),
          });
          renderHubUI();
        });
      });

      savesEl.querySelectorAll('.btn-slot.load').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slotNum = Number(btn.getAttribute('data-slot'));
          const loaded = storageManager.loadFromSlot(slotNum);
          if (loaded) {
            economySystem.setCash(loaded.cash);
            callbacks.onPaintSelect(loaded.upgrades.paint);
            renderHubUI();
          }
        });
      });
    }
  }

  // Wire buttons
  const btnInstall = document.getElementById('btn-garage-install');
  if (btnInstall) {
    btnInstall.addEventListener('click', () => {
      callbacks.onInstallUpgrade();
      renderGarageUI();
    });
  }

  const btnExitGarage = document.getElementById('btn-garage-exit');
  if (btnExitGarage) {
    btnExitGarage.addEventListener('click', () => callbacks.onSetMode('chase'));
  }

  const btnContinue = document.getElementById('btn-hub-continue');
  if (btnContinue) {
    btnContinue.addEventListener('click', () => callbacks.onSetMode('chase'));
  }

  const btnOpenGarage = document.getElementById('btn-hub-garage');
  if (btnOpenGarage) {
    btnOpenGarage.addEventListener('click', () => callbacks.onSetMode('garage'));
  }

  const btnRestart = document.getElementById('btn-hub-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      const fresh = storageManager.resetCareer();
      economySystem.setCash(fresh.cash);
      callbacks.onSetMode('chase');
    });
  }

  function setScreenMode(mode) {
    garageOverlay.classList.toggle('hidden', mode !== 'garage');
    hubOverlay.classList.toggle('hidden', mode !== 'hub');
    hudLayer.classList.toggle('hidden', mode === 'garage' || mode === 'hub');
    skyBrand.classList.toggle('hidden', mode !== 'chase');

    if (mode === 'garage') renderGarageUI();
    if (mode === 'hub') renderHubUI();
  }

  return {
    setScreenMode,
    renderGarageUI,
    renderHubUI,
  };
}
