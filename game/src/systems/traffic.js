// Solara Bay: Neon Dynasty (V6) — Autonomous Multi-Lane Coastal Traffic & Living Sidewalk Pedestrians

import { createCharacterRig } from '../entities/characters3d.js';

export function createTrafficSystem(scene, vehicleManager, rng) {
  const trafficCars = [];
  const pedestrians = [];

  const trafficSpecs = [
    { classId: 'mako_muscle', x: -7.2, z: -48, heading: 0, speed: 24, paint: '#ff9d1a' },
    { classId: 'solara_cabrio', x: 7.2, z: -32, heading: Math.PI, speed: 22, paint: '#19c9e8' },
    { classId: 'sunline_taxi', x: 7.2, z: -76, heading: Math.PI, speed: 20, paint: '#f5b81c' },
    { classId: 'goliath_van', x: -76, z: 96, heading: 0.35, speed: 0, paint: '#253042' },
    { classId: 'sunline_taxi', x: -81.8, z: 112.0, heading: 0.15, speed: 0, paint: '#f5b81c' },
  ];

  for (const ts of trafficSpecs) {
    const car = vehicleManager.spawnVehicle(ts.classId, ts.x, ts.z, ts.heading, ts.paint);
    car.userData.isTraffic = true;
    car.userData.cruiseSpeed = ts.speed;
    trafficCars.push(car);
  }

  // Diverse coastal pedestrian outfits (deterministic placement on raised sidewalks y=0.18 & beach y=0.00)
  const coastalPalettes = [
    { jacket: 0xff5e6c, shirt: 0xfff5e4, pants: 0x24344d, skin: 0xdba078, hair: 0x1d1614 },
    { jacket: 0x1ec8e0, shirt: 0xffffff, pants: 0x2c3648, skin: 0xc98a62, hair: 0x14161c },
    { jacket: 0xffb830, shirt: 0x1b2538, pants: 0x233042, skin: 0xe3ac84, hair: 0x2d1e16 },
    { jacket: 0x2ee889, shirt: 0x162030, pants: 0x1f2a3c, skin: 0xd6966e, hair: 0x18181f },
    { jacket: 0xf4f7fc, shirt: 0xff6b57, pants: 0x2d4363, skin: 0xc4855d, hair: 0x221712 },
  ];

  // Spawn articulated coastal pedestrians naturally along Palm Boulevard sidewalks, beach edge & night market
  const pedPositions = [
    // Visible in Shot 1 along West Hotel sidewalk (raised curb y = 0.18)
    { x: -12.8, y: 0.18, z: -38.5, role: 'civilian', heading: 0.15, phase: 0.4, palette: coastalPalettes[0] },
    { x: -13.6, y: 0.18, z: -48.0, role: 'civilian', heading: Math.PI - 0.1, phase: 1.9, palette: coastalPalettes[2] },
    // Visible in Shot 1 along East Oceanfront Promenade sidewalk (y = 0.18) & golden beach edge (y = 0.00)
    { x: 13.9, y: 0.18, z: -36.5, role: 'civilian', heading: Math.PI + 0.12, phase: 1.1, palette: coastalPalettes[1] },
    { x: 18.8, y: 0.0, z: -44.5, role: 'civilian', heading: -0.65, phase: 2.5, palette: coastalPalettes[4] },
    { x: 14.3, y: 0.18, z: -55.5, role: 'civilian', heading: 0.08, phase: 3.2, palette: coastalPalettes[3] },
    // Additional boulevard & Harbor Night Market pedestrians
    { x: -13.5, y: 0.18, z: 12.0, role: 'civilian', heading: Math.PI, phase: 0.7, palette: coastalPalettes[1] },
    { x: 14.5, y: 0.18, z: 8.0, role: 'civilian', heading: 0, phase: 2.1, palette: coastalPalettes[0] },
    { x: -84.5, y: 0.0, z: 114.0, role: 'civilian', heading: 1.2, phase: 1.5, palette: coastalPalettes[2] },
    { x: -67.5, y: 0.0, z: 118.0, role: 'civilian', heading: -1.2, phase: 2.9, palette: coastalPalettes[3] },
  ];

  for (const pp of pedPositions) {
    const ped = createCharacterRig(pp.role, pp.palette);
    ped.position.set(pp.x, pp.y, pp.z);
    ped.rotation.y = pp.heading;
    ped.userData.baseX = pp.x;
    ped.userData.baseY = pp.y;
    ped.userData.baseZ = pp.z;
    ped.userData.baseHeading = pp.heading;
    ped.userData.phase = pp.phase;
    ped.userData.walkDir = Math.cos(pp.heading) >= 0 ? 1 : -1;
    // Pose naturally mid-stride at initial deterministic timestamp
    ped.userData.animateWalk(pp.phase, 1.0);
    scene.add(ped);
    pedestrians.push(ped);
  }

  return {
    trafficCars,
    pedestrians,
    resetForShot() {
      for (const ped of pedestrians) {
        ped.position.set(ped.userData.baseX, ped.userData.baseY, ped.userData.baseZ);
        ped.rotation.y = ped.userData.baseHeading;
        ped.userData.animateWalk(ped.userData.phase, 1.0);
      }
    },
    update(dt, time, paused = false) {
      if (paused) return;
      for (const car of trafficCars) {
        const spd = car.userData.cruiseSpeed || 0;
        if (spd > 0) {
          const step = (spd / 3.6) * dt;
          car.position.x += Math.sin(car.rotation.y) * step;
          car.position.z += Math.cos(car.rotation.y) * step;
          if (car.position.z > 240) car.position.z = -240;
          if (car.position.z < -240) car.position.z = 240;
          for (const w of car.userData.wheels) {
            w.rotation.x += step * 2.1;
          }
        }
      }
      for (const ped of pedestrians) {
        ped.position.z += ped.userData.walkDir * 1.4 * dt;
        if (Math.abs(ped.position.z - ped.userData.baseZ) > 16) {
          ped.userData.walkDir *= -1;
          ped.rotation.y = ped.userData.walkDir > 0 ? 0 : Math.PI;
        }
        ped.userData.animateWalk(time + ped.userData.phase, 1.1);
      }
    },
  };
}
