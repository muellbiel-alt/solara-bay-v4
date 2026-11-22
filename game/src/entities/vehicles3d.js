// Solara Bay: Neon Dynasty (V4) — 6-Class Multi-Component 3D Vehicles, Grounded Wheels & Drift Physics
// Every vehicle is built from sculpted multi-part geometry with procedural body/livery textures,
// reflective cabin glass, spoiler, headlights/taillights, 4 alloy wheels resting exactly on y = 0.00
// (zero sinking), and a soft contact shadow plate underneath.

const THREE = window.THREE;
import { VEHICLE_CLASSES } from '../core/config.js';
import { createVehicleBodyTexture } from '../world/textures.js';

export function createVehicleMesh(spec, atlas, customPaintHex = null) {
  const car = new THREE.Group();
  const paintHex = customPaintHex || spec.color;
  const isPolice = Boolean(spec.isPolice);

  const W = spec.width || 2.08;
  const H = spec.height || 1.26;
  const L = spec.length || 4.55;
  const wheelRadius = 0.42;
  const wheelWidth = 0.34;

  // 1. Contact Shadow Plate at y = 0.02 (grounds the vehicle visually on the asphalt)
  const shadowGeo = new THREE.PlaneGeometry(W + 0.55, L + 0.65);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x05080f,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.02;
  car.add(contactShadow);

  // 2. Four Grounded Alloy Wheels (Center at y = wheelRadius so bottom touches y = 0.00 with 0 sinking!)
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 20);
  wheelGeo.rotateZ(Math.PI / 2);
  const treadMat = new THREE.MeshLambertMaterial({ map: atlas.tireTread });
  const rimMat = new THREE.MeshLambertMaterial({ map: atlas.wheelRim });
  const wheelMats = [treadMat, rimMat, rimMat];

  const wheels = [];
  const wheelPositions = [
    { x: -W * 0.48, y: wheelRadius, z: L * 0.31 },
    { x: W * 0.48, y: wheelRadius, z: L * 0.31 },
    { x: -W * 0.48, y: wheelRadius, z: -L * 0.31 },
    { x: W * 0.48, y: wheelRadius, z: -L * 0.31 },
  ];
  for (const wp of wheelPositions) {
    const wMesh = new THREE.Mesh(wheelGeo, wheelMats);
    wMesh.position.set(wp.x, wp.y, wp.z);
    wMesh.castShadow = true;
    car.add(wMesh);
    wheels.push(wMesh);
  }

  // 3. Textured Lower Chassis & Aerodynamic Side Skirts
  const bodyTex = createVehicleBodyTexture(paintHex, spec.accent || '#151b26', isPolice);
  const bodyMat = new THREE.MeshPhongMaterial({
    map: bodyTex,
    shininess: 85,
    specular: new THREE.Color(0xffffff),
  });
  const darkTrimMat = new THREE.MeshLambertMaterial({ color: 0x151a24 });

  const chassisH = H * 0.44;
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(W, chassisH, L * 0.92), bodyMat);
  chassis.position.set(0, wheelRadius + chassisH * 0.42, 0);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  car.add(chassis);

  // Sloped Aerodynamic Front Nose / Hood Wedge
  const nose = new THREE.Mesh(new THREE.BoxGeometry(W * 0.96, chassisH * 0.78, L * 0.26), bodyMat);
  nose.position.set(0, wheelRadius + chassisH * 0.28, L * 0.38);
  nose.rotation.x = 0.14;
  car.add(nose);

  // Front Splitter, Carbon Grille & Rear Diffuser
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(W * 1.02, 0.12, L * 0.98), darkTrimMat);
  splitter.position.set(0, wheelRadius - 0.12, 0);
  car.add(splitter);

  // 4. Reflective Cabin Greenhouse & Wraparound Windshield
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0x101a2e,
    shininess: 120,
    specular: new THREE.Color(0x9be8ff),
  });
  const cabinH = H * 0.44;
  const cabinL = spec.id === 'goliath_van' ? L * 0.72 : L * 0.48;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(W * 0.84, cabinH, cabinL), glassMat);
  cabin.position.set(0, wheelRadius + chassisH * 0.82 + cabinH * 0.36, -L * 0.04);
  car.add(cabin);

  // Painted Roof Panel above cabin
  const roof = new THREE.Mesh(new THREE.BoxGeometry(W * 0.8, 0.09, cabinL * 0.82), bodyMat);
  roof.position.set(0, wheelRadius + chassisH * 0.82 + cabinH * 0.74, -L * 0.04);
  car.add(roof);

  // Side Mirrors
  for (const sx of [-W * 0.48, W * 0.48]) {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.22), bodyMat);
    mirror.position.set(sx, wheelRadius + chassisH * 0.85, L * 0.14);
    car.add(mirror);
  }

  // 5. Rear Carbon Wing Spoiler (for Sports Coupe & Muscle classes)
  if (spec.hasSpoiler) {
    for (const sx of [-W * 0.32, W * 0.32]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.22), darkTrimMat);
      strut.position.set(sx, wheelRadius + chassisH * 0.95, -L * 0.41);
      car.add(strut);
    }
    const wing = new THREE.Mesh(new THREE.BoxGeometry(W * 0.96, 0.08, 0.36), darkTrimMat);
    wing.position.set(0, wheelRadius + chassisH + 0.16, -L * 0.43);
    wing.rotation.x = -0.12;
    car.add(wing);
  }

  // 6. Emissive Dual Headlights & Full-Width Crimson LED Taillight Bar
  const headMat = new THREE.MeshBasicMaterial({ color: 0xfff8d6 });
  for (const hx of [-W * 0.33, W * 0.33]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.08), headMat);
    hl.position.set(hx, wheelRadius + chassisH * 0.4, L * 0.49);
    car.add(hl);
  }

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1e38 });
  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(W * 0.88, 0.16, 0.08), tailMat);
  tailBar.position.set(0, wheelRadius + chassisH * 0.52, -L * 0.465);
  car.add(tailBar);

  // Quad Chrome Exhaust Tips & Nitrous Flame Cones
  const chromeMat = new THREE.MeshLambertMaterial({ color: 0xc8d4e6 });
  const nitroFlames = [];
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x24e5ff,
    transparent: true,
    opacity: 0.88,
  });
  for (const ex of [-W * 0.24, W * 0.24]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.25, 8), chromeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(ex, wheelRadius - 0.05, -L * 0.48);
    car.add(pipe);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.85, 8), flameMat);
    flame.rotation.x = -Math.PI / 2;
    flame.position.set(ex, wheelRadius - 0.05, -L * 0.48 - 0.45);
    flame.visible = false;
    car.add(flame);
    nitroFlames.push(flame);
  }

  // 7. Police Interceptor Roof Siren Bar & Front Push-Bar Bumper
  let sirenRedMesh = null;
  let sirenBlueMesh = null;
  if (isPolice) {
    // Steel Front Ramming Push-Bar
    const bullBar = new THREE.Mesh(new THREE.BoxGeometry(W * 0.72, 0.42, 0.18), darkTrimMat);
    bullBar.position.set(0, wheelRadius + 0.18, L * 0.51);
    car.add(bullBar);

    const roofY = wheelRadius + chassisH * 0.82 + cabinH * 0.83;
    const barCenter = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.26), darkTrimMat);
    barCenter.position.set(0, roofY, -0.05);
    car.add(barCenter);

    sirenRedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.16, 0.28),
      new THREE.MeshBasicMaterial({ color: 0xff1e38 })
    );
    sirenRedMesh.position.set(-0.38, roofY, -0.05);
    car.add(sirenRedMesh);

    sirenBlueMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.16, 0.28),
      new THREE.MeshBasicMaterial({ color: 0x00b8ff })
    );
    sirenBlueMesh.position.set(0.38, roofY, -0.05);
    car.add(sirenBlueMesh);
  }

  car.userData = {
    spec,
    wheels,
    nitroFlames,
    sirenRedMesh,
    sirenBlueMesh,
    bodyMat,
    speed: 0,
    heading: 0,
    steerAngle: 0,
    health: spec.armor || 100,
    maxHealth: spec.armor || 100,
    nitro: 92,
    gear: 'S5',
    setPaint(newHex) {
      bodyMat.map = createVehicleBodyTexture(newHex, spec.accent || '#151b26', isPolice);
      bodyMat.needsUpdate = true;
    },
    setNitroActive(active) {
      for (const fl of nitroFlames) {
        fl.visible = active;
      }
    },
  };

  return car;
}

export function createVehicleManager(scene, atlas) {
  const vehicles = [];

  function spawnVehicle(classId, x, z, heading = 0, customPaint = null) {
    const spec = VEHICLE_CLASSES.find((c) => c.id === classId) || VEHICLE_CLASSES[0];
    const mesh = createVehicleMesh(spec, atlas, customPaint);
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
    data.speed = Math.max(-45, Math.min(topSpeed, data.speed));

    if (nitroOn && throttle > 0) {
      data.nitro = Math.max(0, data.nitro - dt * 18);
      data.setNitroActive(true);
    } else {
      data.nitro = Math.min(100, data.nitro + dt * 6);
      data.setNitroActive(false);
    }

    const turnFactor = Math.min(1, Math.abs(data.speed) / 18) * (handbrake ? 1.35 : 1.0);
    data.heading += steer * data.spec.handling * turnFactor * dt * (data.speed >= 0 ? 1 : -1);

    const moveStep = (data.speed / 3.6) * dt;
    car.position.x += Math.sin(data.heading) * moveStep;
    car.position.z += Math.cos(data.heading) * moveStep;
    car.position.y = 0;
    car.rotation.y = data.heading;

    // Spin grounded wheels
    for (const w of data.wheels) {
      w.rotation.x += moveStep * 2.2;
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
        d.sirenBlueMesh.material.color.setHex(!pulse ? 0x00c8ff : 0x062942);
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
