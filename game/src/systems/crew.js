// Solara Bay: Neon Dynasty (V4) — 3 Active Syndicate Crew Abilities with Cooldowns
// [Z] Elena Vance: EMP Jammer | [X] Mateo Cruz: Nitro Getaway | [C] Kira Solis: Smoke Screen

import { CREW_ABILITIES } from '../core/config.js';

export function createCrewSystem(policeSystem, audioSynth) {
  const states = CREW_ABILITIES.map((ab) => ({
    ...ab,
    timer: 0,
    activeTimer: 0,
  }));

  function activateAbility(keyChar, heroCar) {
    const slot = states.find((s) => s.key === keyChar.toUpperCase());
    if (!slot || slot.timer > 0) return false;

    slot.timer = slot.cooldown;
    slot.activeTimer = 5.0;

    if (slot.id === 'emp_jammer') {
      policeSystem.triggerEmpJam(6.0);
    } else if (slot.id === 'nitro_getaway' && heroCar) {
      heroCar.userData.nitro = 100;
      heroCar.userData.health = Math.min(heroCar.userData.maxHealth, heroCar.userData.health + 25);
      heroCar.userData.speed = Math.max(heroCar.userData.speed, 148);
      heroCar.userData.setNitroActive(true);
    } else if (slot.id === 'smoke_screen') {
      policeSystem.triggerSmokeScreen(6.0);
    }

    if (audioSynth) audioSynth.playCrewTrigger();
    return true;
  }

  function update(dt) {
    for (const s of states) {
      if (s.timer > 0) s.timer = Math.max(0, s.timer - dt);
      if (s.activeTimer > 0) s.activeTimer = Math.max(0, s.activeTimer - dt);
    }
  }

  return {
    getAbilities: () => states,
    activateAbility,
    update,
  };
}
