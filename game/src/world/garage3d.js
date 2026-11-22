// Solara Bay: Neon Dynasty (V6) — Detailed Costa Customs 3D Workshop Bay & Illuminated Turntable
// Industrial corrugated/brick textured bay walls with yellow-black hazard dado stripe, overhead LED studio
// light bars casting crisp roof highlights, rolling red-black tool chests, diagnostic ECU cart, stacked
// alloy-rimmed spare tires, textured hydraulic lift pillars, and reflective dark epoxy floor.

const THREE = window.THREE;

function createTelemetryScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#091422';
  ctx.fillRect(0, 0, 256, 160);

  ctx.strokeStyle = '#24e5ff';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 152);

  // ECU Dyno Curve Grid
  ctx.strokeStyle = 'rgba(36, 229, 255, 0.22)';
  ctx.lineWidth = 1;
  for (let x = 24; x < 240; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 34);
    ctx.lineTo(x, 126);
    ctx.stroke();
  }
  for (let y = 34; y <= 126; y += 23) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(234, y);
    ctx.stroke();
  }

  // Glowing power & torque curves
  ctx.strokeStyle = '#2ee889';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(24, 118);
  ctx.quadraticCurveTo(120, 62, 228, 42);
  ctx.stroke();

  ctx.strokeStyle = '#ffb830';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(24, 102);
  ctx.quadraticCurveTo(132, 48, 228, 66);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 16px monospace';
  ctx.fillText('ECU DYNO · 740 HP', 18, 24);
  ctx.fillStyle = '#24e5ff';
  ctx.font = '700 13px monospace';
  ctx.fillText('TWIN-TURBO BOOST: 24 PSI', 18, 146);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

function createCeilingLightGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 32, 4, 128, 32, 120);
  grad.addColorStop(0.0, 'rgba(240, 250, 255, 0.95)');
  grad.addColorStop(0.45, 'rgba(130, 225, 255, 0.36)');
  grad.addColorStop(1.0, 'rgba(50, 160, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function buildCostaCustomsGarage(cityGroup, atlas, signTextures) {
  const garageBay = new THREE.Group();
  garageBay.position.set(-180, 0, 120);

  // 1. Reflective Dark Charcoal Epoxy Workshop Floor
  const gFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshPhongMaterial({
      map: atlas.garageFloor,
      shininess: 78,
      specular: new THREE.Color(0x5b7699),
    })
  );
  gFloor.rotation.x = -Math.PI / 2;
  gFloor.position.y = 0.02;
  gFloor.receiveShadow = true;
  garageBay.add(gFloor);

  // 2. Textured Industrial Workshop Walls (Corrugated Steel + Hazard Dado + Masonry Wainscot)
  const gWallMat = new THREE.MeshLambertMaterial({ map: atlas.garageWall });
  const darkSteelMat = new THREE.MeshLambertMaterial({ color: 0x1a2230 });
  const brushedSteelMat = new THREE.MeshPhongMaterial({ color: 0x526178, shininess: 90 });

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 11.2, 0.8), gWallMat);
  backWall.position.set(0, 5.6, -11);
  garageBay.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 11.2, 30), gWallMat);
  leftWall.position.set(-12.2, 5.6, 0);
  garageBay.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 11.2, 30), gWallMat);
  rightWall.position.set(12.2, 5.6, 0);
  garageBay.add(rightWall);

  // Structural vertical wall pilasters along back & left walls for architectural depth
  const pilasterGeo = new THREE.BoxGeometry(0.65, 11.2, 0.65);
  for (const px of [-11.5, -6.2, -0.8, 4.6, 10.0]) {
    const pil = new THREE.Mesh(pilasterGeo, darkSteelMat);
    pil.position.set(px, 5.6, -10.55);
    garageBay.add(pil);
  }
  for (const pz of [-6.0, 0.0, 6.0]) {
    const pil = new THREE.Mesh(pilasterGeo, darkSteelMat);
    pil.position.set(-11.75, 5.6, pz);
    garageBay.add(pil);
  }

  // 3. Industrial Workshop Ceiling, Steel Trusses & Overhead Bright LED Light Bars (visibly framed at y = 7.2)
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshLambertMaterial({ color: 0x121824 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8.4;
  garageBay.add(ceiling);

  const ledTubeMat = new THREE.MeshBasicMaterial({ color: 0xf7fcff, fog: false });
  const ledGlowMat = new THREE.MeshBasicMaterial({
    map: createCeilingLightGlowTexture(),
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });

  // 3 rows of suspended bright linear studio LED light bars illuminating Kestrel GT roof & bay
  for (const lz of [-5.8, -1.6, 2.6]) {
    const truss = new THREE.Mesh(new THREE.BoxGeometry(24, 0.36, 0.32), darkSteelMat);
    truss.position.set(0, 7.65, lz);
    garageBay.add(truss);

    for (const lx of [-7.4, -2.6, 2.2]) {
      const housing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 0.42), darkSteelMat);
      housing.position.set(lx, 7.36, lz);
      garageBay.add(housing);

      const ledBar = new THREE.Mesh(new THREE.BoxGeometry(3.38, 0.11, 0.28), ledTubeMat);
      ledBar.position.set(lx, 7.26, lz);
      garageBay.add(ledBar);

      const halo = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.4), ledGlowMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.set(lx, 7.16, lz);
      garageBay.add(halo);
    }
  }

  // 4. Illuminated Costa Customs Neon Sign (mounted flush in front of wall pilasters & clear of right UI drawer)
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.05, 0.24), darkSteelMat);
  signFrame.position.set(-5.7, 5.45, -10.12);
  garageBay.add(signFrame);

  const garageSign = new THREE.Mesh(
    new THREE.PlaneGeometry(6.15, 1.84),
    new THREE.MeshBasicMaterial({ map: signTextures[3], fog: false })
  );
  garageSign.position.set(-5.7, 5.45, -9.98);
  garageBay.add(garageSign);

  // 5. Detailed Red-Black Rolling Mechanic Tool Cabinets, Workbench & Pegboard Rack
  const cabinetSideMat = new THREE.MeshLambertMaterial({ color: 0xb31b29 });
  const cabinetFrontMat = new THREE.MeshLambertMaterial({ map: atlas.toolCabinet });
  const cabinetMats = [
    cabinetSideMat,
    cabinetSideMat,
    brushedSteelMat,
    darkSteelMat,
    cabinetFrontMat,
    cabinetSideMat,
  ];
  const casterGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.1, 10);
  casterGeo.rotateZ(Math.PI / 2);

  for (const cx of [-6.9, -4.3, -1.7]) {
    const cabGroup = new THREE.Group();
    cabGroup.position.set(cx, 0, -9.55);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.82, 1.15), cabinetMats);
    cab.position.y = 1.04;
    cab.castShadow = true;
    cabGroup.add(cab);

    // Stainless top tray lip
    const topLip = new THREE.Mesh(new THREE.BoxGeometry(2.28, 0.1, 1.24), brushedSteelMat);
    topLip.position.y = 1.98;
    cabGroup.add(topLip);

    // 4 heavy-duty rolling caster wheels resting flush on floor
    for (const wx of [-0.9, 0.9]) {
      for (const wz of [-0.42, 0.42]) {
        const wheel = new THREE.Mesh(casterGeo, darkSteelMat);
        wheel.position.set(wx, 0.11, wz);
        cabGroup.add(wheel);
      }
    }
    garageBay.add(cabGroup);
  }

  // Wall-mounted steel tool pegboard with wrench silhouettes above the tool benches
  const pegboard = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.45, 0.12), darkSteelMat);
  pegboard.position.set(-4.4, 3.18, -10.48);
  garageBay.add(pegboard);

  const wrenchGeo = new THREE.BoxGeometry(0.14, 0.78, 0.08);
  for (let i = 0; i < 8; i++) {
    const tool = new THREE.Mesh(wrenchGeo, brushedSteelMat);
    tool.position.set(-6.9 + i * 0.72, 3.18, -10.36);
    tool.scale.y = 0.65 + (i % 3) * 0.25;
    garageBay.add(tool);
  }

  // Rolling ECU Dyno Telemetry Monitor Cart along the left wall
  const cartGroup = new THREE.Group();
  cartGroup.position.set(-10.5, 0, -4.8);
  cartGroup.rotation.y = 0.62;
  const cartBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.35, 0.75), darkSteelMat);
  cartBase.position.y = 0.72;
  cartGroup.add(cartBase);
  const monitorHousing = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.86, 0.12), darkSteelMat);
  monitorHousing.position.set(0, 1.95, 0);
  cartGroup.add(monitorHousing);
  const monitorScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.12, 0.72),
    new THREE.MeshBasicMaterial({ map: createTelemetryScreenTexture(), fog: false })
  );
  monitorScreen.position.set(0, 1.95, 0.07);
  cartGroup.add(monitorScreen);
  garageBay.add(cartGroup);

  // 6. Prominent Stack of 4 Spare Performance Tires with Alloy Rims + Pressurized N2O Bottles (clear foreground-left)
  const spareTireGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.38, 22);
  const spareMats = [
    new THREE.MeshLambertMaterial({ map: atlas.tireTread }),
    new THREE.MeshLambertMaterial({ map: atlas.wheelRim }),
    new THREE.MeshLambertMaterial({ map: atlas.wheelRim }),
  ];

  // 3 horizontally stacked spare alloy wheels in clear open left bay foreground
  for (let t = 0; t < 3; t++) {
    const tire = new THREE.Mesh(spareTireGeo, spareMats);
    tire.position.set(-9.55 + (t % 2) * 0.05, 0.21 + t * 0.38, 0.65);
    tire.rotation.y = t * 0.65;
    tire.castShadow = true;
    garageBay.add(tire);
  }
  // 4th spare alloy wheel propped upright leaning cleanly against the stack showing full alloy spoke rim
  const leaningTire = new THREE.Mesh(spareTireGeo, spareMats);
  leaningTire.rotation.z = Math.PI / 2 - 0.22;
  leaningTire.rotation.y = 0.72;
  leaningTire.position.set(-8.62, 0.56, 1.15);
  leaningTire.castShadow = true;
  garageBay.add(leaningTire);

  // Twin Pressurized Cyan Nitrous Oxide (N2O) Bottles next to left wall behind dyno cart
  const n2oMat = new THREE.MeshPhongMaterial({ color: 0x0ec6e8, shininess: 110 });
  const tankGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.35, 14);
  const valveGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.26, 10);
  for (const nz of [-6.9, -6.25]) {
    const tank = new THREE.Mesh(tankGeo, n2oMat);
    tank.position.set(-10.6, 0.7, nz);
    garageBay.add(tank);
    const valve = new THREE.Mesh(valveGeo, brushedSteelMat);
    valve.position.set(-10.6, 1.48, nz);
    garageBay.add(valve);
  }

  // 7. Illuminated 3D Hydraulic Turntable Platform & Textured Heavy-Duty Lift Pillars
  const turntable = new THREE.Group();
  turntable.position.set(-2.6, 0, 0.2);

  const deckSideMat = new THREE.MeshPhongMaterial({ color: 0x161f2e, shininess: 70 });
  const deckTopMat = new THREE.MeshPhongMaterial({
    map: atlas.turntableDeck,
    shininess: 92,
    specular: new THREE.Color(0x88b4e6),
  });
  const baseDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(4.45, 4.78, 0.22, 40),
    [deckSideMat, deckTopMat, deckSideMat]
  );
  baseDisc.position.y = 0.11;
  baseDisc.receiveShadow = true;
  turntable.add(baseDisc);

  const neonRing = new THREE.Mesh(
    new THREE.TorusGeometry(4.48, 0.11, 12, 44),
    new THREE.MeshBasicMaterial({ color: 0xffb830, fog: false })
  );
  neonRing.rotation.x = Math.PI / 2;
  neonRing.position.y = 0.22;
  turntable.add(neonRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.25, 0.045, 8, 40),
    new THREE.MeshBasicMaterial({ color: 0x24e5ff, fog: false })
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.23;
  turntable.add(innerRing);

  // Heavy-Duty Textured Hydraulic Lift Columns framed wide at px = -5.6, +4.4 so back sign stays 100% unobstructed
  const pillarMat = new THREE.MeshLambertMaterial({ map: atlas.hydraulicPillar });
  for (const px of [-5.6, 4.4]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.56, 6.2, 0.56), pillarMat);
    post.position.set(px, 3.1, -3.9);
    post.castShadow = true;
    turntable.add(post);

    const footPlate = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 1.15), darkSteelMat);
    footPlate.position.set(px, 0.07, -3.9);
    turntable.add(footPlate);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.24, 0.76), darkSteelMat);
    cap.position.set(px, 6.26, -3.9);
    turntable.add(cap);

    // Folded steel hydraulic lift swing arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.18, 0.22), darkSteelMat);
    arm.position.set(px > 0 ? px - 0.78 : px + 0.78, 0.52, -3.55);
    arm.rotation.y = px > 0 ? 0.35 : -0.35;
    turntable.add(arm);
  }

  // Overhead hydraulic lift gantry cross-bar connecting the two pillars cleanly above the neon sign
  const liftCrossbar = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.32, 0.42), darkSteelMat);
  liftCrossbar.position.set(-0.6, 6.32, -3.9);
  turntable.add(liftCrossbar);

  // 8. Three-Point Studio Lighting (Overhead LED Key + Warm Golden Rim + Cool Front-Left Specular Fill)
  const keyLight = new THREE.PointLight(0xf4faff, 2.35, 28);
  keyLight.position.set(-2.6, 6.6, 1.0);
  garageBay.add(keyLight);

  const rimLight = new THREE.PointLight(0xffcb82, 1.55, 24);
  rimLight.position.set(-8.2, 4.6, -5.8);
  garageBay.add(rimLight);

  const fillLight = new THREE.PointLight(0x7ae2ff, 0.95, 22);
  fillLight.position.set(2.5, 3.8, 5.4);
  garageBay.add(fillLight);

  garageBay.add(turntable);
  cityGroup.add(garageBay);

  return {
    garageBay,
    turntable,
    garageBayPos: new THREE.Vector3(-182.6, 0.22, 120.2),
  };
}
