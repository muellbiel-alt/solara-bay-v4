// Solara Bay: Neon Dynasty (V4) — 4-Slot Weapon Hotbar, Ballistic Tracers, Muzzle Flashes & Explosions

const THREE = window.THREE;
import { WEAPON_SLOTS } from '../core/config.js';
import { createCharacterRig } from '../entities/characters3d.js';

export function createExplosionEffect(scene, x, y, z, scale = 1.0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  // Core white-gold fireball
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.7 * scale, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xfff3a8 })
  );
  core.position.y = 1.2 * scale;
  group.add(core);

  // Mid orange-coral blast spheres
  const blastOffsets = [
    { x: -1.1, y: 1.5, z: 0.4, r: 1.55, c: 0xff7b24 },
    { x: 1.2, y: 1.4, z: -0.4, r: 1.45, c: 0xff4d2e },
    { x: 0.2, y: 2.4, z: 0.2, r: 1.65, c: 0xff942e },
    { x: -0.6, y: 2.9, z: -0.3, r: 1.35, c: 0x38323c },
    { x: 0.8, y: 3.4, z: 0.3, r: 1.5, c: 0x28242c },
  ];
  for (const b of blastOffsets) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(b.r * scale, 12, 12),
      new THREE.MeshBasicMaterial({
        color: b.c,
        transparent: true,
        opacity: b.y > 2.6 ? 0.78 : 0.92,
      })
    );
    m.position.set(b.x * scale, b.y * scale, b.z * scale);
    group.add(m);
  }

  // Ground scorch & shockwave ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.8 * scale, 3.3 * scale, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffae38,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  scene.add(group);
  return group;
}

export function createBulletTracer(scene, startVec, endVec, colorHex = 0xffe066) {
  const dir = new THREE.Vector3().subVectors(endVec, startVec);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

  const geo = new THREE.CylinderGeometry(0.055, 0.055, len, 6);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: colorHex });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(mid);
  mesh.lookAt(endVec);
  scene.add(mesh);
  return mesh;
}

export function createCombatSystem(scene, audioSynth) {
  const weapons = structuredClone(WEAPON_SLOTS);
  let activeSlot = 3; // KOBRA SMG active by default
  let fireCooldown = 0;

  const activeTracers = [];
  const explosions = [];
  const combatNPCs = [];

  // Spawn Harbor Docks / Night Market firefight combatants & roadblock explosion
  const chaseRoadblockExplosion = createExplosionEffect(scene, -4.6, 0, -29.5, 1.05);
  explosions.push(chaseRoadblockExplosion);

  const harborBlast = createExplosionEffect(scene, -76.2, 0, 96.5, 1.25);
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

  // Persistent firefight tracers for Harbor Night Market ambush
  const firefightTracerPairs = [
    {
      from: new THREE.Vector3(-75.2, 1.32, 124.2),
      to: new THREE.Vector3(-75.8, 1.35, 102.5),
      color: 0xffe46b,
    },
    {
      from: new THREE.Vector3(-79.1, 1.35, 120.8),
      to: new THREE.Vector3(-73.0, 1.32, 102.2),
      color: 0x24e5ff,
    },
    {
      from: new THREE.Vector3(-72.8, 1.35, 102.4),
      to: new THREE.Vector3(-76.5, 1.25, 121.0),
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

  function fireWeapon(originPos, forwardDir) {
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
    const scalePulse = 1 + Math.sin(time * 12) * 0.05;
    for (const ex of explosions) {
      ex.scale.setScalar(scalePulse);
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
