// Solara Bay: Neon Dynasty (V5) — Headless-Compatible Deterministic Open-World Simulation Core
// Drives pure state updates (vehicle kinematics, pursuit units, traffic lanes, missions, wanted heat,
// and career reset) without requiring DOM or WebGL, enabling both live play and node:test verification.

import { CITY_META, DISTRICTS, STORY_MISSIONS, VEHICLE_CLASSES, WEAPON_SLOTS } from './config.js';
import { clamp, clampWorldPosition, dist2D, wrapAngle } from './math.js';
import { createPRNG } from './random.js';

export function createSimState(seed = CITY_META.seed) {
  const rng = createPRNG(seed);
  const heroSpec = VEHICLE_CLASSES[0];
  const halfWorld = CITY_META.worldSize * 0.45;

  const traffic = [
    { id: 't1', classId: 'mako_muscle', x: -7.2, z: -48, heading: 0, speed: 24 },
    { id: 't2', classId: 'solara_cabrio', x: 7.2, z: -32, heading: Math.PI, speed: 22 },
    { id: 't3', classId: 'sunline_taxi', x: 7.2, z: -76, heading: Math.PI, speed: 20 },
    { id: 't4', classId: 'goliath_van', x: -76, z: 96, heading: 0.35, speed: 0 },
  ];

  const cruisers = [
    { callsign: 'VIPER-14', x: -3.1, z: -21.2, heading: Math.PI - 0.22, tactic: 'RAMMING', speed: 34 },
    { callsign: 'VIPER-22', x: 5.2, z: -26.8, heading: Math.PI + 0.16, tactic: 'FLANKING', speed: 35 },
    { callsign: 'BASTION-4', x: -4.2, z: -56.0, heading: 1.25, tactic: 'ROADBLOCK', speed: 0 },
    { callsign: 'VIPER-31', x: -1.4, z: -34.0, heading: Math.PI - 0.08, tactic: 'RAMMING', speed: 33 },
  ];

  return {
    seed,
    rng,
    time: 1.25,
    ticks: 0,
    halfWorld,
    wantedStars: 4,
    empTimer: 0,
    smokeTimer: 0,
    cash: 148650,
    respect: 4850,
    activeMissionId: 6,
    missionStage: 3,
    missionTotalStages: 4,
    activeDistrict: DISTRICTS[0].name,
    weapons: structuredClone(WEAPON_SLOTS),
    activeWeaponSlot: 3,
    hero: {
      x: 1.15,
      y: 0,
      z: -24.5,
      heading: Math.PI + 0.34,
      speed: 138,
      nitro: 92,
      health: heroSpec.armor,
      maxHealth: heroSpec.armor,
      topSpeed: heroSpec.topSpeed,
      accel: heroSpec.accel,
      handling: heroSpec.handling,
    },
    helicopter: {
      x: -0.5,
      y: 13.4,
      z: -49.0,
      rotorAngle: 0,
    },
    cruisers,
    traffic,
  };
}

export function stepSimulation(state, dt, controls = {}) {
  const stepDt = clamp(Number.isFinite(dt) ? dt : 1 / 60, 0, 0.05);
  state.time += stepDt;
  state.ticks += 1;

  const throttle = clamp(controls.throttle ?? 1, -1, 1);
  const steer = clamp(controls.steer ?? 0, -1, 1);
  const handbrake = Boolean(controls.handbrake);
  const nitroOn = Boolean(controls.nitro) && state.hero.nitro > 5;

  const maxSpd = state.hero.topSpeed * (nitroOn ? 1.22 : 1.0);
  const accel = state.hero.accel * (nitroOn ? 1.48 : 1.0);

  if (throttle !== 0) {
    state.hero.speed += throttle * accel * stepDt * 2.2;
  } else {
    state.hero.speed *= Math.pow(0.5, stepDt);
  }
  if (handbrake) {
    state.hero.speed *= Math.pow(0.2, stepDt);
  }
  state.hero.speed = clamp(state.hero.speed, -45, maxSpd);

  if (nitroOn && throttle > 0) {
    state.hero.nitro = clamp(state.hero.nitro - stepDt * 18, 0, 100);
  } else {
    state.hero.nitro = clamp(state.hero.nitro + stepDt * 6, 0, 100);
  }

  const turnFactor = Math.min(1, Math.abs(state.hero.speed) / 18) * (handbrake ? 1.35 : 1.0);
  state.hero.heading = wrapAngle(
    state.hero.heading + steer * state.hero.handling * turnFactor * stepDt * (state.hero.speed >= 0 ? 1 : -1)
  );

  const moveStep = (state.hero.speed / 3.6) * stepDt;
  state.hero.x += Math.sin(state.hero.heading) * moveStep;
  state.hero.z += Math.cos(state.hero.heading) * moveStep;
  state.hero.y = 0;

  // Keep hero inside coastal city loop bounds
  if (state.hero.z < -260) state.hero.z = 260;
  if (state.hero.z > 260) state.hero.z = -260;
  clampWorldPosition(state.hero, state.halfWorld);

  // Update District lookup
  for (const d of DISTRICTS) {
    if (
      state.hero.x >= d.bounds.xMin &&
      state.hero.x <= d.bounds.xMax &&
      state.hero.z >= d.bounds.zMin &&
      state.hero.z <= d.bounds.zMax
    ) {
      state.activeDistrict = d.name;
      break;
    }
  }

  // Update Timers & Tactical Police Pursuit Units
  if (state.empTimer > 0) state.empTimer = Math.max(0, state.empTimer - stepDt);
  if (state.smokeTimer > 0) state.smokeTimer = Math.max(0, state.smokeTimer - stepDt);

  if (state.wantedStars > 0 && state.empTimer <= 0) {
    for (let i = 0; i < state.cruisers.length; i++) {
      const c = state.cruisers[i];
      if (c.tactic === 'ROADBLOCK') continue;
      const targetX = state.hero.x + (i % 2 === 0 ? -3.2 : 3.4);
      const targetZ = state.hero.z + 8 + i * 4.5;
      const dx = targetX - c.x;
      const dz = targetZ - c.z;
      const d = dist2D(c.x, c.z, targetX, targetZ);
      if (d > 1.5) {
        const cStep = Math.min(d, c.speed * stepDt);
        c.x += (dx / d) * cStep;
        c.z += (dz / d) * cStep;
        c.heading = Math.atan2(dx, dz);
      }
      clampWorldPosition(c, state.halfWorld);
    }
  }

  // Update Falcon-1 Helicopter Pursuit
  state.helicopter.rotorAngle = (state.helicopter.rotorAngle + stepDt * 22) % (Math.PI * 2);
  state.helicopter.x = clamp(state.hero.x + Math.sin(state.time * 0.6) * 4.2, -state.halfWorld, state.halfWorld);
  state.helicopter.z = clamp(state.hero.z - 24 + Math.cos(state.time * 0.4) * 3.0, -state.halfWorld, state.halfWorld);
  state.helicopter.y = 13.4 + Math.sin(state.time * 1.4) * 0.5;

  // Update Autonomous Traffic
  for (const t of state.traffic) {
    if (t.speed > 0) {
      const tStep = (t.speed / 3.6) * stepDt;
      t.x += Math.sin(t.heading) * tStep;
      t.z += Math.cos(t.heading) * tStep;
      if (t.z > 250) t.z = -250;
      if (t.z < -250) t.z = 250;
      clampWorldPosition(t, state.halfWorld);
    }
  }

  return state;
}

export function advanceMissionStageSim(state) {
  if (state.missionStage < state.missionTotalStages) {
    state.missionStage += 1;
  } else {
    const mission = STORY_MISSIONS.find((m) => m.id === state.activeMissionId);
    state.cash += mission ? mission.payout : 25000;
    state.respect += 450;
    state.activeMissionId = Math.min(STORY_MISSIONS.length, state.activeMissionId + 1);
    const nextM = STORY_MISSIONS.find((m) => m.id === state.activeMissionId);
    state.missionStage = 1;
    state.missionTotalStages = nextM ? nextM.totalStages : 4;
  }
  return state;
}

export function restartSimulation(state) {
  const fresh = createSimState(state.seed);
  Object.assign(state, fresh);
  return state;
}
