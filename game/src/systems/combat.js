// Solara Bay: Neon Dynasty (V5) — 4-Slot Weapon Inventory, Ballistic Combat & Explosion Orchestrator
// Uses effects/particles.js for high-contrast fiery explosions and glowing ballistic tracers.

const THREE = window.THREE;
import { WEAPON_SLOTS } from '../core/config.js';
import { createCharacterRig } from '../entities/characters3d.js';
import { createBulletTracer, createExplosionEffect } from '../effects/particles.js';

export { createBulletTracer, createExplosionEffect };

export function createCombatSystem(scene, audioSynth) {
  const weapons = structuredClone(WEAPON_SLOTS);
  let activeSlot = 3; // KOBRA SMG active by default
  let fireCooldown = 0;

  const activeTracers = [];
  const explosions = [];
  const combatNPCs = [];

  // Spawn Palm Boulevard roadblock explosion & Harbor Night Market blockade blast
  const chaseRoadblockExplosion = createExplosionEffect(scene, -4.6, 0, -29.5, 1.08);
  explosions.push(chaseRoadblockExplosion);

  const harborBlast = createExplosionEffect(scene, -76.2, 0, 96.5, 1.28);
  explosions.push(harborBlast);

  // Spawn articulated enemies & police officers in Harbor Docks Night Market (for Shot 2 & live play)
  const npcSpecs = [
    { role: 'ally', x: -79.4, z: 121.5, heading: Math.PI, aiming: true },
    { role: 'police', x: -79.2, z: 103.5, heading: 0.12, aiming: true },
    { role: 'syndicate', x: -72.8, z: 102.0, heading: -0.18, aiming: true },
    { role: 'syndicate', x: -75.8, z: 99.5, heading: 0.05, aiming: true },
  ];

  for (const ns of npcSpecs) {
    const npc = createCharacterRig(ns.role);
    npc.position.set(ns.x, 0, ns.z);
    npc.rotation.y = ns.heading;
    npc.userData.setAimingPose(ns.aiming, true);
    scene.add(npc);
    combatNPCs.push(npc);
  }

  // Persistent firefight tracers aligned directly to the horizontal gun barrels in Shot 2
  const firefightTracerPairs = [
    {
      from: new THREE.Vector3(-75.78, 1.44, 123.95),
      to: new THREE.Vector3(-75.8, 1.38, 101.2),
      color: 0xffe46b,
    },
    {
      from: new THREE.Vector3(-79.77, 1.44, 120.25),
      to: new THREE.Vector3(-73.0, 1.38, 102.2),
      color: 0x24e5ff,
    },
    {
      from: new THREE.Vector3(-72.45, 1.44, 103.25),
      to: new THREE.Vector3(-76.5, 1.32, 121.0),
      color: 0xff5e6c,
    },
  ];
  for (const tp of firefightTracerPairs) {
    activeTracers.push(createBulletTracer(scene, tp.from, tp.to, tp.color));
  }

  function selectWeapon(slotNumber) {
    const found = weapons.find((w) => w.slot === slotNumber);
    if (found) activeSlot = found.slot;
    return getActiveWeapon();
  }

  function getActiveWeapon() {
    return weapons.find((w) => w.slot === activeSlot) || weapons[2];
  }

  function fireWeapon() {
    if (fireCooldown > 0) return false;
    const wpn = getActiveWeapon();
    fireCooldown = wpn.fireRate;
    if (typeof wpn.clip === 'number' && wpn.clip > 0) {
      wpn.clip -= 1;
      if (wpn.clip === 0 && wpn.reserve > 0) {
        const reload = Math.min(30, wpn.reserve);
        wpn.clip = reload;
        wpn.reserve -= reload;
      }
    }
    if (audioSynth) audioSynth.playGunshot();
    return true;
  }

  function update(dt, time) {
    if (fireCooldown > 0) fireCooldown = Math.max(0, fireCooldown - dt);
    for (const ex of explosions) {
      if (ex.userData && ex.userData.update) {
        ex.userData.update(time);
      }
    }
  }

  return {
    weapons,
    combatNPCs,
    explosions,
    activeTracers,
    getActiveSlot: () => activeSlot,
    getActiveWeapon,
    selectWeapon,
    fireWeapon,
    update,
  };
}
