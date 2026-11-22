// Solara Bay: Neon Dynasty (V4) — Autonomous Multi-Lane Coastal Traffic & Pedestrian Simulation

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

  // Spawn articulated coastal pedestrians along the sidewalks & night market
  const pedPositions = [
    { x: -13.5, z: -18, role: 'civilian', heading: 0 },
    { x: -13.8, z: 12, role: 'civilian', heading: Math.PI },
    { x: 14.2, z: -26, role: 'civilian', heading: 0 },
    { x: 14.5, z: 8, role: 'civilian', heading: Math.PI },
    { x: -84.5, z: 114, role: 'civilian', heading: 1.2 },
    { x: -67.5, z: 118, role: 'civilian', heading: -1.2 },
  ];

  for (const pp of pedPositions) {
    const ped = createCharacterRig(pp.role);
    ped.position.set(pp.x, 0, pp.z);
    ped.rotation.y = pp.heading;
    ped.userData.baseZ = pp.z;
    ped.userData.walkDir = pp.heading === 0 ? 1 : -1;
    scene.add(ped);
    pedestrians.push(ped);
  }

  return {
    trafficCars,
    pedestrians,
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
        ped.userData.animateWalk(time, 1.1);
      }
    },
  };
}
