// Solara Bay: Neon Dynasty (V5) — 6-Class Vehicle Manager, Arcade Drift Physics & Carjacking System
// Delegates sculpted aerodynamic 3D chassis construction to carChassis.js and manages live vehicle states.

import { VEHICLE_CLASSES } from '../core/config.js';
import { clamp, wrapAngle } from '../core/math.js';
import { buildSculptedCarChassis } from './carChassis.js';

export function createVehicleMesh(spec, atlas, customPaintHex = null) {
  return buildSculptedCarChassis(spec, atlas, customPaintHex);
}

export function createVehicleManager(scene, atlas) {
  const vehicles = [];

  function spawnVehicle(classId, x, z, heading = 0, customPaint = null) {
    const spec = VEHICLE_CLASSES.find((c) => c.id === classId) || VEHICLE_CLASSES[0];
    const mesh = buildSculptedCarChassis(spec, atlas, customPaint);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = heading;
    mesh.userData.heading = heading;
    scene.add(mesh);
    vehicles.push(mesh);
    return mesh;
  }

  function updateVehiclePhysics(car, input, dt, time) {
    const data = car.userData;
    const throttle = input.getThrottle();
    const steer = input.getSteer();
    const handbrake = input.isHandbrake();
    const nitroOn = input.isNitro() && data.nitro > 5;

    const topSpeed = data.spec.topSpeed * (nitroOn ? 1.25 : 1.0);
    const accel = data.spec.accel * (nitroOn ? 1.55 : 1.0);

    if (throttle !== 0) {
      data.speed += throttle * accel * dt * 2.4;
    } else {
      data.speed *= Math.pow(0.45, dt);
    }
    if (handbrake) {
      data.speed *= Math.pow(0.18, dt);
    }
    data.speed = clamp(data.speed, -45, topSpeed);

    if (nitroOn && throttle > 0) {
      data.nitro = clamp(data.nitro - dt * 18, 0, 100);
      data.setNitroActive(true);
    } else {
      data.nitro = clamp(data.nitro + dt * 6, 0, 100);
      data.setNitroActive(false);
    }

    const turnFactor = Math.min(1, Math.abs(data.speed) / 18) * (handbrake ? 1.35 : 1.0);
    data.heading = wrapAngle(
      data.heading + steer * data.spec.handling * turnFactor * dt * (data.speed >= 0 ? 1 : -1)
    );

    const moveStep = (data.speed / 3.6) * dt;
    car.position.x += Math.sin(data.heading) * moveStep;
    car.position.z += Math.cos(data.heading) * moveStep;
    car.position.y = 0;
    car.rotation.y = data.heading;

    for (const w of data.wheels) {
      w.rotation.x += moveStep * 2.2;
    }
    if (data.trails) {
      data.trails.update(time, data.speed, data.nitroActive);
    }

    const absSpd = Math.abs(data.speed);
    data.gear = absSpd < 25 ? 'S1' : absSpd < 55 ? 'S2' : absSpd < 85 ? 'S3' : absSpd < 115 ? 'S4' : 'S5';
  }

  function animateAllVehicles(time) {
    const pulse = Math.sin(time * 16) > 0;
    for (const v of vehicles) {
      const d = v.userData;
      if (d.sirenRedMesh && d.sirenBlueMesh) {
        d.sirenRedMesh.material.color.setHex(pulse ? 0xff1e38 : 0x550812);
        d.sirenBlueMesh.material.color.setHex(!pulse ? 0x00d0ff : 0x062942);
      }
      if (d.trails) {
        d.trails.update(time, d.speed || 90, d.nitroActive);
      }
    }
  }

  function findNearestJackableVehicle(pos, excludeCar, maxDist = 9.5) {
    let best = null;
    let bestD = maxDist;
    for (const v of vehicles) {
      if (v === excludeCar) continue;
      const dist = v.position.distanceTo(pos);
      if (dist < bestD) {
        bestD = dist;
        best = v;
      }
    }
    return best;
  }

  return {
    vehicles,
    spawnVehicle,
    updateVehiclePhysics,
    animateAllVehicles,
    findNearestJackableVehicle,
  };
}
