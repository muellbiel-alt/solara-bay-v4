// Solara Bay: Neon Dynasty (V5) — Sculpted Aerodynamic Sports Coupe & Police Interceptor 3D Chassis
// Uses THREE.ExtrudeGeometry side-profile sculpting for a seamless trapezoidal fastback greenhouse,
// sloped aerodynamic wedge hood, flared wheel arches, rear carbon diffuser, and grounded alloy wheels.

const THREE = window.THREE;
import { createVehicleBodyTexture } from '../world/textures.js';
import { createVehicleTrails } from '../effects/trails.js';

function createExtrudedProfile(points2D, width, material) {
  const shape = new THREE.Shape();
  shape.moveTo(points2D[0][0], points2D[0][1]);
  for (let i = 1; i < points2D.length; i++) {
    shape.lineTo(points2D[i][0], points2D[i][1]);
  }
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.04,
    bevelSegments: 2,
  };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Rotate so 2D (x -> +Z forward, y -> +Y up) and extrusion depth centers along X (-width/2 .. +width/2)
  geo.rotateY(Math.PI / 2);
  geo.translate(-width / 2, 0, 0);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function buildSculptedCarChassis(spec, atlas, customPaintHex = null) {
  const car = new THREE.Group();
  const paintHex = customPaintHex || spec.color;
  const isPolice = Boolean(spec.isPolice);
  const isVan = spec.id === 'goliath_van';
  const isCabrio = spec.id === 'solara_cabrio';

  const W = spec.width || 2.08;
  const H = spec.height || 1.24;
  const L = spec.length || 4.55;
  const wheelRadius = 0.42;
  const wheelWidth = 0.35;

  // 1. Soft Contact Shadow Plate at y = 0.016 (anchors tires cleanly to the road surface)
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x04070e,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.56, L + 0.66), shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.016;
  car.add(contactShadow);

  // 2. Four Grounded Machined-Alloy Wheels (Center at y = wheelRadius so bottom touches y = 0.00)
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 22);
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

  // 3. Sculpted Aerodynamic Lower Wedge Body via ExtrudeGeometry + Textured Side Panels
  const bodyTex = createVehicleBodyTexture(paintHex, spec.accent || '#151b26', isPolice);
  const bodyMat = new THREE.MeshPhongMaterial({
    map: bodyTex,
    shininess: 98,
    specular: new THREE.Color(0xffffff),
  });
  const paintSolidMat = new THREE.MeshPhongMaterial({
    color: new THREE.Color(paintHex),
    shininess: 105,
    specular: new THREE.Color(0xffffff),
  });
  const darkTrimMat = new THREE.MeshLambertMaterial({ color: 0x121722 });
  const carbonMat = new THREE.MeshPhongMaterial({ color: 0x1a212e, shininess: 70 });

  const beltY = wheelRadius + H * 0.37;

  // Seamless Extruded Wedge Body Silhouette (raked nose -> sloped hood -> muscular rear haunch -> diffuser)
  const hullPoints = [
    [-L * 0.46, wheelRadius - 0.08],
    [L * 0.47, wheelRadius - 0.1],
    [L * 0.49, wheelRadius + 0.14],
    [L * 0.24, beltY - 0.02],
    [-L * 0.44, beltY + 0.05],
    [-L * 0.48, wheelRadius + 0.18],
  ];
  const sculptedHull = createExtrudedProfile(hullPoints, W * 0.9, paintSolidMat);
  car.add(sculptedHull);

  // Textured Livery Waist Panel (shows SBPD markings or metallic door seam lines)
  const waistBox = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.96, H * 0.34, L * 0.72),
    bodyMat
  );
  waistBox.position.set(0, wheelRadius + H * 0.18, -L * 0.02);
  waistBox.castShadow = true;
  waistBox.receiveShadow = true;
  car.add(waistBox);

  // Muscular Flared Wheel-Arch Fenders over all 4 Wheels
  const fenderGeo = new THREE.BoxGeometry(W * 0.16, H * 0.33, L * 0.27);
  const fenderCoords = [
    { x: -W * 0.44, z: L * 0.31, pitch: 0.06 },
    { x: W * 0.44, z: L * 0.31, pitch: 0.06 },
    { x: -W * 0.45, z: -L * 0.3, pitch: -0.04 },
    { x: W * 0.45, z: -L * 0.3, pitch: -0.04 },
  ];
  for (const fc of fenderCoords) {
    const fMesh = new THREE.Mesh(fenderGeo, paintSolidMat);
    fMesh.position.set(fc.x, wheelRadius + H * 0.18, fc.z);
    fMesh.rotation.x = fc.pitch;
    fMesh.castShadow = true;
    car.add(fMesh);
  }

  // Twin Recessed Carbon Hood Intakes
  for (const vx of [-W * 0.19, W * 0.19]) {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(W * 0.15, 0.04, L * 0.2), carbonMat);
    vent.position.set(vx, beltY - 0.05, L * 0.31);
    vent.rotation.x = 0.14;
    car.add(vent);
  }

  // Front Carbon Aero Splitter, Side Skirts & Multi-Fin Rear Diffuser
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(W * 1.0, 0.08, L * 0.97), carbonMat);
  splitter.position.set(0, wheelRadius - 0.12, 0);
  car.add(splitter);

  for (const fx of [-W * 0.34, -W * 0.12, W * 0.12, W * 0.34]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.24), darkTrimMat);
    fin.position.set(fx, wheelRadius - 0.05, -L * 0.47);
    car.add(fin);
  }

  // 4. Seamless Trapezoidal Fastback Greenhouse via THREE.ExtrudeGeometry (Zero protruding corners!)
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0x0e182b,
    shininess: 145,
    specular: new THREE.Color(0x9beeff),
  });

  const roofTopY = beltY + (isVan ? H * 0.48 : H * 0.38);
  const cabinW = W * 0.76;

  if (!isCabrio) {
    const cabinPoints = isVan
      ? [
          [-L * 0.43, beltY - 0.02],
          [L * 0.24, beltY - 0.02],
          [L * 0.12, roofTopY],
          [-L * 0.41, roofTopY],
        ]
      : [
          [-L * 0.38, beltY],
          [L * 0.22, beltY - 0.03],
          [L * 0.03, roofTopY],
          [-L * 0.17, roofTopY - 0.01],
        ];
    const cabinMesh = createExtrudedProfile(cabinPoints, cabinW, glassMat);
    car.add(cabinMesh);

    // Sculpted Painted Roof Skin & Fastback C-Pillar Trim seamlessly flush with the trapezoidal top
    if (!isVan) {
      const roofPoints = [
        [-L * 0.18, roofTopY - 0.02],
        [L * 0.02, roofTopY - 0.01],
        [L * 0.01, roofTopY + 0.04],
        [-L * 0.19, roofTopY + 0.03],
      ];
      const roofCap = createExtrudedProfile(roofPoints, cabinW * 0.94, isPolice ? new THREE.MeshLambertMaterial({ color: 0xf4f7fc }) : paintSolidMat);
      car.add(roofCap);
    }
  } else {
    // Open Roadster Raked Windshield
    const wsPoints = [
      [L * 0.06, beltY - 0.02],
      [L * 0.22, beltY - 0.02],
      [L * 0.07, roofTopY - 0.04],
      [L * 0.02, roofTopY - 0.04],
    ];
    car.add(createExtrudedProfile(wsPoints, cabinW, glassMat));
  }

  // Aerodynamic Side Mirrors
  for (const sx of [-W * 0.48, W * 0.48]) {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.2), paintSolidMat);
    mirror.position.set(sx, beltY + 0.06, L * 0.14);
    car.add(mirror);
  }

  // 5. High-Downforce Carbon GT Wing Spoiler on Swan-Neck Struts
  if (spec.hasSpoiler) {
    for (const sx of [-W * 0.28, W * 0.28]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.22), carbonMat);
      strut.position.set(sx, beltY + 0.12, -L * 0.41);
      strut.rotation.x = 0.2;
      car.add(strut);
    }
    const wing = new THREE.Mesh(new THREE.BoxGeometry(W * 0.95, 0.065, 0.32), carbonMat);
    wing.position.set(0, beltY + 0.24, -L * 0.43);
    wing.rotation.x = -0.13;
    car.add(wing);

    for (const ex of [-W * 0.475, W * 0.475]) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.36), paintSolidMat);
      plate.position.set(ex, beltY + 0.23, -L * 0.43);
      car.add(plate);
    }
  }

  // 6. Emissive Dual Headlights & Full-Width LED Taillight Bar
  const headMat = new THREE.MeshBasicMaterial({ color: 0xfff9de, fog: false });
  for (const hx of [-W * 0.33, W * 0.33]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.1), headMat);
    hl.position.set(hx, wheelRadius + 0.16, L * 0.485);
    car.add(hl);
  }

  const tailBarMat = new THREE.MeshBasicMaterial({ color: 0xff1a36, fog: false });
  const tailHotMat = new THREE.MeshBasicMaterial({ color: 0xff8c66, fog: false });
  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(W * 0.88, 0.13, 0.08), tailBarMat);
  tailBar.position.set(0, beltY - 0.06, -L * 0.465);
  car.add(tailBar);

  for (const tx of [-W * 0.32, W * 0.32]) {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.09), tailHotMat);
    pad.position.set(tx, beltY - 0.06, -L * 0.468);
    car.add(pad);
  }

  // Quad Chrome Exhaust Tips
  const chromeMat = new THREE.MeshLambertMaterial({ color: 0xd8e2f2 });
  for (const ex of [-W * 0.28, -W * 0.21, W * 0.21, W * 0.28]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.26, 8), chromeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(ex, wheelRadius - 0.05, -L * 0.475);
    car.add(pipe);
  }

  // 7. Taillight Trails & Multi-Layer Nitrous Plumes
  const trails = createVehicleTrails(car, W, L, wheelRadius, isPolice);

  // 8. Police Interceptor Pit-Maneuver Push Bumper & Aerodynamic V-Siren Lightbar
  let sirenRedMesh = null;
  let sirenBlueMesh = null;
  if (isPolice) {
    const bullBar = new THREE.Mesh(new THREE.BoxGeometry(W * 0.74, 0.36, 0.18), darkTrimMat);
    bullBar.position.set(0, wheelRadius + 0.14, L * 0.505);
    car.add(bullBar);

    const barY = roofTopY + 0.07;
    const barMount = new THREE.Mesh(new THREE.BoxGeometry(W * 0.66, 0.06, 0.22), darkTrimMat);
    barMount.position.set(0, barY, -L * 0.08);
    car.add(barMount);

    sirenRedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.13, 0.24),
      new THREE.MeshBasicMaterial({ color: 0xff1a38, fog: false })
    );
    sirenRedMesh.position.set(-0.36, barY + 0.06, -L * 0.08);
    car.add(sirenRedMesh);

    sirenBlueMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.13, 0.24),
      new THREE.MeshBasicMaterial({ color: 0x00d0ff, fog: false })
    );
    sirenBlueMesh.position.set(0.36, barY + 0.06, -L * 0.08);
    car.add(sirenBlueMesh);
  }

  car.userData = {
    spec,
    wheels,
    nitroFlames: trails.nitroFlames,
    tailTrails: trails.tailTrails,
    trails,
    sirenRedMesh,
    sirenBlueMesh,
    bodyMat,
    paintSolidMat,
    speed: 0,
    heading: 0,
    steerAngle: 0,
    health: spec.armor || 100,
    maxHealth: spec.armor || 100,
    nitro: 92,
    nitroActive: false,
    gear: 'S5',
    setPaint(newHex) {
      paintSolidMat.color.set(newHex);
      bodyMat.map = createVehicleBodyTexture(newHex, spec.accent || '#151b26', isPolice);
      bodyMat.needsUpdate = true;
    },
    setNitroActive(active) {
      this.nitroActive = Boolean(active);
      trails.update(1.2, this.speed, this.nitroActive);
    },
  };

  return car;
}
