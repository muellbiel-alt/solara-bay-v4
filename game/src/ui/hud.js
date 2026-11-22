// Solara Bay: Neon Dynasty (V5) — Sleek Translucent Corner HUD Orchestrator
// Coordinates Mission Card, Tactical Dispatch, Minimap, Weapon/Crew Hotbars, Portrait Comms,
// and Speedometer/Radio while keeping >= 77% of the 3D city & ocean viewport open.

import { createRadioController } from '../audio/radio.js';
import { renderCoastalMinimap, resolveActiveDistrict } from './minimap.js';
import { renderDispatchAndWanted } from './dispatchPanel.js';
import { renderCrewAbilityBar, renderWeaponHotbar } from './weaponWheel.js';

function drawCharacterPortrait(canvas, speakerName = 'ELENA VANCE') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 52, 52);

  const isKira = speakerName.includes('KIRA');
  const isMateo = speakerName.includes('MATEO');

  const bg = ctx.createLinearGradient(0, 0, 0, 52);
  bg.addColorStop(0, isKira ? '#2a163b' : isMateo ? '#162d3b' : '#1b2845');
  bg.addColorStop(1, isKira ? '#ff4d5e' : isMateo ? '#2ee889' : '#24e5ff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 52, 52);

  ctx.fillStyle = isKira ? '#191d2b' : isMateo ? '#d93829' : '#e89d24';
  ctx.fillRect(8, 36, 36, 16);

  ctx.fillStyle = '#e0a47a';
  ctx.fillRect(16, 14, 20, 22);

  ctx.fillStyle = '#111520';
  ctx.fillRect(14, 8, 24, 9);
  if (!isMateo) {
    ctx.fillRect(12, 14, 4, 18);
    ctx.fillRect(36, 14, 4, 18);
  }

  ctx.fillStyle = '#0c121e';
  ctx.fillRect(17, 20, 8, 5);
  ctx.fillRect(27, 20, 8, 5);
  ctx.fillStyle = '#24e5ff';
  ctx.fillRect(18, 21, 6, 2);
  ctx.fillRect(28, 21, 6, 2);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(22, 30, 8, 2);
}

export function createHudController(audioSynth = null) {
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

  const radio = createRadioController(audioSynth);

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
    drawCharacterPortrait(els.dialoguePortrait, mission.speaker);
  }

  function renderPoliceDispatch(units, wantedStars) {
    renderDispatchAndWanted(els, units, wantedStars);
  }

  function renderWeapons(weapons, activeSlot) {
    renderWeaponHotbar(els.weaponHotbar, weapons, activeSlot);
  }

  function renderCrew(abilities) {
    renderCrewAbilityBar(els.crewBar, abilities);
  }

  function renderMinimap(playerPos, playerHeading, cruisers, time) {
    renderCoastalMinimap(els.minimapCanvas, playerPos, playerHeading, cruisers, time);
  }

  function updateDistrict(playerPos) {
    const current = resolveActiveDistrict(playerPos);
    els.districtName.textContent = current.name;
    els.streetName.textContent = current.street;
  }

  function cycleRadio() {
    const st = radio.cycleNextStation();
    els.radioStation.textContent = radio.formatReadout();
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
