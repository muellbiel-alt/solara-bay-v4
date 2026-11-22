// Solara Bay: Neon Dynasty (V4) — 5-Star Wanted Escalation & Tactical Police Dispatch System
// Tracks pursuit cruisers, roadblocks, and Falcon-1 Air Unit with real-time distance in meters
// and tactical state badges: RAMMING, FLANKING, SPOTLIGHT, ROADBLOCK.

export function createPoliceSystem(scene, vehicleManager, helicopter) {
  const cruisers = [];

  // Spawn 4 tactical SBPD Interceptor cruisers for active 4-star pursuit & roadblocks
  const unitConfigs = [
    { callsign: 'VIPER-14', x: -3.6, z: 22.5, heading: Math.PI - 0.08, tactic: 'RAMMING', dist: 9 },
    { callsign: 'VIPER-22', x: 3.9, z: 25.0, heading: Math.PI + 0.09, tactic: 'FLANKING', dist: 14 },
    { callsign: 'BASTION-4', x: -4.2, z: -36.0, heading: 1.32, tactic: 'ROADBLOCK', dist: 52 },
    { callsign: 'VIPER-31', x: 5.0, z: 36.0, heading: Math.PI, tactic: 'RAMMING', dist: 24 },
  ];

  for (const uc of unitConfigs) {
    const cruiser = vehicleManager.spawnVehicle('sbpd_interceptor', uc.x, uc.z, uc.heading);
    cruiser.userData.callsign = uc.callsign;
    cruiser.userData.tactic = uc.tactic;
    cruiser.userData.baseDist = uc.dist;
    cruisers.push(cruiser);
  }

  let wantedStars = 4;
  let empJammedTimer = 0;
  let smokeTimer = 0;

  function getDispatchUnits(playerPos) {
    const rows = [
      {
        callsign: 'FALCON-1',
        dist: playerPos
          ? Math.max(18, Math.round(helicopter.mesh.position.distanceTo(playerPos)))
          : 38,
        tactic: empJammedTimer > 0 ? 'JAMMED' : 'SPOTLIGHT',
      },
    ];

    for (const c of cruisers) {
      const d = playerPos
        ? Math.max(5, Math.round(c.position.distanceTo(playerPos)))
        : c.userData.baseDist;
      rows.push({
        callsign: c.userData.callsign,
        dist: d,
        tactic: smokeTimer > 0 ? 'BLINDED' : c.userData.tactic,
      });
    }
    return rows.slice(0, 4);
  }

  return {
    cruisers,
    getWantedStars: () => wantedStars,
    setWantedStars(stars) {
      wantedStars = Math.max(0, Math.min(5, stars));
    },
    triggerEmpJam(duration = 6) {
      empJammedTimer = duration;
    },
    triggerSmokeScreen(duration = 6) {
      smokeTimer = duration;
    },
    getDispatchUnits,
    update(dt, time, playerPos, paused = false) {
      if (empJammedTimer > 0) empJammedTimer = Math.max(0, empJammedTimer - dt);
      if (smokeTimer > 0) smokeTimer = Math.max(0, smokeTimer - dt);
      if (paused || wantedStars === 0 || !playerPos) return;

      for (let i = 0; i < cruisers.length; i++) {
        const c = cruisers[i];
        if (c.userData.tactic === 'ROADBLOCK' || empJammedTimer > 0) continue;
        const dx = playerPos.x + (i % 2 === 0 ? -3.4 : 3.6) - c.position.x;
        const dz = playerPos.z + 10 + i * 4.5 - c.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 2.5) {
          const step = Math.min(dist, 28 * dt);
          c.position.x += (dx / dist) * step;
          c.position.z += (dz / dist) * step;
          c.rotation.y = Math.atan2(dx, dz);
        }
      }
    },
  };
}
