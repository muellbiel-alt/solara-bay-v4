// Solara Bay: Neon Dynasty (V4) — High-Contrast Corner HUD, Minimap Radar & Portrait Dialogue Controller
// Engineered for 768x480 contact sheet legibility while keeping >= 72% of the 3D viewport unobstructed.

import { DISTRICTS, RADIO_STATIONS } from '../core/config.js';

export function createHudController() {
  const els = {
    skyBrand: document.getElementById('sky-brand-badge'),
    hudLayer: document.getElementById('hud-layer'),
    missionTag: document.getElementById('mission-tag'),
    missionTitle: document.getElementById('mission-title'),
    missionStageBadge: document.getElementById('mission-stage-badge'),
    stageSegments: document.getElementById('stage-segments'),
    missionObjective: document.getElementById('mission-objective'),
    missionNext: document.getElementById('mission-next-text'),
    dispatchCount: document.getElementById('dispatch-unit-count'),
    dispatchList: document.getElementById('dispatch-list'),
    dispatchFooter: document.getElementById('dispatch-footer'),
    hudCash: document.getElementById('hud-cash'),
    hudClock: document.getElementById('hud-clock'),
    wantedStars: document.getElementById('wanted-stars'),
    wantedPill: document.getElementById('wanted-status-pill'),
    weaponHotbar: document.getElementById('weapon-hotbar'),
    crewBar: document.getElementById('crew-bar'),
    reticle: document.getElementById('center-reticle'),
    contextPrompt: document.getElementById('context-prompt'),
    contextPromptText: document.getElementById('context-prompt-text'),
    districtName: document.getElementById('hud-district-name'),
    streetName: document.getElementById('hud-street-name'),
    minimapCanvas: document.getElementById('minimap-canvas'),
    dialogueSpeaker: document.getElementById('dialogue-speaker'),
    dialogueRole: document.getElementById('dialogue-role'),
    dialogueLine: document.getElementById('dialogue-line'),
    dialoguePortrait: document.getElementById('dialogue-portrait'),
    radioStation: document.getElementById('hud-radio-station'),
    vehicleName: document.getElementById('hud-vehicle-name'),
    gearBadge: document.getElementById('hud-gear-badge'),
    speedValue: document.getElementById('hud-speed-value'),
    speedUnit: document.getElementById('hud-speed-unit'),
    nitroBadge: document.getElementById('hud-nitro-badge'),
    vehHpFill: document.getElementById('hud-veh-hp-fill'),
    vehHpPct: document.getElementById('hud-veh-hp-pct'),
    nitroFill: document.getElementById('hud-nitro-fill'),
    nitroPct: document.getElementById('hud-nitro-pct'),
  };

  let radioIdx = 0;

  function drawSpeakerPortrait(speakerName) {
    const canvas = els.dialoguePortrait;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 52, 52);

    const isKira = speakerName.includes('KIRA');
    const isMateo = speakerName.includes('MATEO');

    // Warm sunset background
    const bg = ctx.createLinearGradient(0, 0, 0, 52);
    bg.addColorStop(0, isKira ? '#2a163b' : isMateo ? '#162d3b' : '#1b2845');
    bg.addColorStop(1, isKira ? '#ff4d5e' : isMateo ? '#2ee889' : '#24e5ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 52, 52);

    // Shoulders / Jacket
    ctx.fillStyle = isKira ? '#191d2b' : isMateo ? '#d93829' : '#e89d24';
    ctx.fillRect(8, 36, 36, 16);

    // Face
    ctx.fillStyle = '#e0a47a';
    ctx.fillRect(16, 14, 20, 22);

    // Hair & Sunglasses
    ctx.fillStyle = '#111520';
    ctx.fillRect(14, 8, 24, 9);
    if (!isMateo) {
      ctx.fillRect(12, 14, 4, 18);
      ctx.fillRect(36, 14, 4, 18);
    }

    // Aviator shades
    ctx.fillStyle = '#0c121e';
    ctx.fillRect(17, 20, 8, 5);
    ctx.fillRect(27, 20, 8, 5);
    ctx.fillStyle = '#24e5ff';
    ctx.fillRect(18, 21, 6, 2);
    ctx.fillRect(28, 21, 6, 2);

    // Smile / headset mic
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(22, 30, 8, 2);
  }

  function renderMission(mission) {
    if (!mission) return;
    els.missionTag.textContent = `MISSION ${mission.id}/10`;
    els.missionTitle.textContent = mission.title;
    els.missionStageBadge.textContent = `STAGE ${mission.stage}/${mission.totalStages}`;
    els.missionObjective.textContent = mission.objective;
    els.missionNext.textContent = mission.next;

    let segHtml = '';
    for (let i = 1; i <= mission.totalStages; i++) {
      const cls = i < mission.stage ? 'seg done' : i === mission.stage ? 'seg active' : 'seg';
      segHtml += `<span class="${cls}"></span>`;
    }
    els.stageSegments.innerHTML = segHtml;

    els.dialogueSpeaker.textContent = mission.speaker;
    els.dialogueRole.textContent = mission.role;
    els.dialogueLine.textContent = mission.line;
    drawSpeakerPortrait(mission.speaker);
  }

  function renderPoliceDispatch(units, wantedStars) {
    const starSpans = els.wantedStars.querySelectorAll('.star');
    starSpans.forEach((sp, idx) => {
      sp.classList.toggle('active', idx < wantedStars);
    });

    els.dispatchCount.textContent = `${units.length + 1} UNITS · ${wantedStars}★`;
    els.wantedPill.textContent =
      wantedStars >= 4 ? 'AIR-1 & ROADBLOCKS' : wantedStars >= 2 ? 'PURSUIT IN SIGHT' : 'PATROL ALERT';

    const classMap = {
      RAMMING: 'tactic-ramming',
      FLANKING: 'tactic-flanking',
      SPOTLIGHT: 'tactic-spotlight',
      ROADBLOCK: 'tactic-roadblock',
      JAMMED: 'tactic-roadblock',
      BLINDED: 'tactic-flanking',
      FIRING: 'tactic-firing',
    };

    els.dispatchList.innerHTML = units
      .map(
        (u) => `
      <div class="dispatch-row">
        <span class="unit-callsign">${u.callsign}</span>
        <span class="unit-dist">${u.dist} m</span>
        <span class="tactic-badge ${classMap[u.tactic] || 'tactic-ramming'}">${u.tactic}</span>
      </div>`
      )
      .join('');
  }

  function renderWeapons(weapons, activeSlot) {
    els.weaponHotbar.innerHTML = weapons
      .map(
        (w) => `
      <div class="weapon-slot ${w.slot === activeSlot ? 'active' : ''}">
        <span class="wpn-key">${w.slot}</span>
        <span class="wpn-name">${w.name}</span>
        <span class="wpn-ammo">${w.clip === '∞' ? '∞' : `${w.clip}/${w.reserve}`}</span>
      </div>`
      )
      .join('');
  }

  function renderCrew(abilities) {
    els.crewBar.innerHTML = abilities
      .map((ab) => {
        const status =
          ab.activeTimer > 0
            ? 'ACTIVE'
            : ab.timer > 0
              ? `${Math.ceil(ab.timer)}s`
              : 'READY';
        return `
      <div class="crew-pill">
        <span class="crew-pill-top">[${ab.key}] ${ab.title}</span>
        <span class="crew-pill-state">${ab.member} · ${status}</span>
      </div>`;
      })
      .join('');
  }

  function renderMinimap(playerPos, playerHeading, cruisers, time) {
    const canvas = els.minimapCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Slate urban base
    ctx.fillStyle = '#111b2e';
    ctx.fillRect(0, 0, W, H);

    const scale = 0.72;
    const cx = W / 2;
    const cy = H / 2;
    const px = playerPos ? playerPos.x : 0;
    const pz = playerPos ? playerPos.z : 0;

    // Sandy beach & turquoise ocean on East side
    const sandScreenX = cx + (16 - px) * scale;
    ctx.fillStyle = '#e3be82';
    ctx.fillRect(sandScreenX, 0, W, H);
    const oceanScreenX = cx + (38 - px) * scale;
    ctx.fillStyle = '#0c7c96';
    ctx.fillRect(oceanScreenX, 0, W, H);

    // City blocks & road grid
    const avenues = [0, -76, -152, -228];
    const crossStreets = [-240, -160, -80, 0, 80, 160, 240];

    ctx.fillStyle = '#24324d';
    for (const ax of avenues) {
      for (const cz of crossStreets) {
        const bx = cx + (ax - 38 - px) * scale;
        const bz = cy + (cz - 36 - pz) * scale;
        ctx.fillRect(bx - 16, bz - 20, 32, 40);
      }
    }

    // Highlighted roads
    ctx.fillStyle = '#3c4c6b';
    for (const ax of avenues) {
      const rx = cx + (ax - px) * scale;
      ctx.fillRect(rx - 6, 0, 12, H);
    }
    for (const cz of crossStreets) {
      const rz = cy + (cz - pz) * scale;
      ctx.fillRect(0, rz - 5, oceanScreenX, 10);
    }

    // Active GPS route line (Amber-Cyan)
    ctx.strokeStyle = '#ffb830';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 58);
    ctx.lineTo(cx - 34, cy - 58);
    ctx.stroke();

    // Key Map Icons (G = Garage, H = Safehouse, M = Mission)
    const mapIcons = [
      { label: 'M', x: cx, y: 24, bg: '#ffb830', fg: '#090d16' },
      { label: 'G', x: 26, y: cy + 28, bg: '#24e5ff', fg: '#090d16' },
      { label: 'H', x: cx + 22, y: cy - 38, bg: '#2ee889', fg: '#090d16' },
    ];
    for (const ic of mapIcons) {
      ctx.fillStyle = ic.bg;
      ctx.beginPath();
      ctx.arc(ic.x, ic.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ic.fg;
      ctx.font = '900 10px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ic.label, ic.x, ic.y);
    }

    // Police Cruiser Red/Blue Radar Blips
    const pulseRed = Math.sin(time * 16) > 0;
    for (const c of cruisers) {
      const bx = Math.max(12, Math.min(W - 12, cx + (c.position.x - px) * scale));
      const bz = Math.max(12, Math.min(H - 12, cy + (c.position.z - pz) * scale));
      ctx.fillStyle = pulseRed ? '#ff2e4c' : '#24e5ff';
      ctx.beginPath();
      ctx.arc(bx, bz, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Player Directional Arrow in Center
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerHeading + Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6.5, 7);
    ctx.lineTo(0, 3.5);
    ctx.lineTo(-6.5, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  }

  function updateDistrict(playerPos) {
    if (!playerPos) return;
    let current = DISTRICTS[0];
    for (const d of DISTRICTS) {
      if (
        playerPos.x >= d.bounds.xMin &&
        playerPos.x <= d.bounds.xMax &&
        playerPos.z >= d.bounds.zMin &&
        playerPos.z <= d.bounds.zMax
      ) {
        current = d;
        break;
      }
    }
    els.districtName.textContent = current.name;
    els.streetName.textContent = current.street;
  }

  function cycleRadio() {
    radioIdx = (radioIdx + 1) % RADIO_STATIONS.length;
    const st = RADIO_STATIONS[radioIdx];
    els.radioStation.textContent = `${st.name} · ${st.track}`;
    return st;
  }

  return {
    els,
    renderMission,
    renderPoliceDispatch,
    renderWeapons,
    renderCrew,
    renderMinimap,
    updateDistrict,
    cycleRadio,
    updateVehicleReadout(car, onFootMode = false, activeWeapon = null) {
      if (onFootMode && activeWeapon) {
        els.vehicleName.textContent = 'ON FOOT · COMBAT';
        els.gearBadge.textContent = activeWeapon.name;
        els.speedValue.textContent = `${activeWeapon.clip}`;
        if (els.speedUnit) els.speedUnit.textContent = 'CLIP';
        els.nitroBadge.textContent = `RESERVE ${activeWeapon.reserve}`;
      } else if (car) {
        const d = car.userData;
        els.vehicleName.textContent = d.spec.name;
        els.gearBadge.textContent = d.gear || 'S5';
        const displaySpeed = Math.max(0, Math.round(Math.abs(d.speed)));
        els.speedValue.textContent = `${displaySpeed}`;
        if (els.speedUnit) els.speedUnit.textContent = 'KM/H';
        els.nitroBadge.textContent = 'NITRO READY';
        const hpPct = Math.round((d.health / d.maxHealth) * 100);
        els.vehHpFill.style.width = `${hpPct}%`;
        els.vehHpPct.textContent = `${hpPct}%`;
        const nPct = Math.round(d.nitro);
        els.nitroFill.style.width = `${nPct}%`;
        els.nitroPct.textContent = `${nPct}%`;
      }
    },
    setContextPrompt(visible, text = 'JACK KESTREL GT') {
      els.contextPrompt.classList.toggle('hidden', !visible);
      if (visible) els.contextPromptText.textContent = text;
    },
    setReticleVisible(visible) {
      els.reticle.classList.toggle('hidden', !visible);
    },
  };
}
