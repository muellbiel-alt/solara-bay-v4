// Solara Bay: Neon Dynasty (V6) — Instanced Streetlamps, Coastal Pier, & Grounded Night Market Lanterns
// Uses THREE.InstancedMesh for coastal lamps & bollards, a grounded timber Pacifica Pier pavilion (zero
// floating sky rings), and catenary cross-street lantern cables anchored cleanly in the Harbor Night Market.

const THREE = window.THREE;

function createLanternHaloTexture(rgbStr) {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(48, 48, 4, 48, 48, 46);
  grad.addColorStop(0.0, `rgba(255, 250, 232, 0.92)`);
  grad.addColorStop(0.28, `rgba(${rgbStr}, 0.65)`);
  grad.addColorStop(0.65, `rgba(${rgbStr}, 0.22)`);
  grad.addColorStop(1.0, `rgba(${rgbStr}, 0.0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 96, 96);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function buildCityProps(cityGroup, atlas) {
  const dummy = new THREE.Object3D();

  // 1. Coastal Streetlamps (Poles, Arms & Glowing Warm Bulbs via THREE.InstancedMesh)
  const lampCoords = [];
  for (let z = -220; z <= 220; z += 34) {
    lampCoords.push({ x: -12.2, z, side: -1 });
    lampCoords.push({ x: 12.2, z, side: 1 });
  }

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 6.8, 6);
  const armGeo = new THREE.BoxGeometry(1.8, 0.14, 0.14);
  const bulbGeo = new THREE.SphereGeometry(0.32, 8, 8);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x242e40 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe49c, fog: false });

  const polesInst = new THREE.InstancedMesh(poleGeo, poleMat, lampCoords.length);
  const armsInst = new THREE.InstancedMesh(armGeo, poleMat, lampCoords.length);
  const bulbsInst = new THREE.InstancedMesh(bulbGeo, bulbMat, lampCoords.length);

  lampCoords.forEach((lc, i) => {
    dummy.position.set(lc.x, 3.4, lc.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    polesInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lc.x + (lc.side > 0 ? -0.8 : 0.8), 6.7, lc.z);
    dummy.updateMatrix();
    armsInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lc.x + (lc.side > 0 ? -1.55 : 1.55), 6.55, lc.z);
    dummy.updateMatrix();
    bulbsInst.setMatrixAt(i, dummy.matrix);
  });
  cityGroup.add(polesInst, armsInst, bulbsInst);

  // 2. Illuminated Coastal Promenade Bollards along the Beach Edge (x = 15.8) via THREE.InstancedMesh
  const bollardZ = [];
  for (let z = -220; z <= 220; z += 12) {
    bollardZ.push(z);
  }
  const bolBodyInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.14, 0.16, 1.05, 8),
    poleMat,
    bollardZ.length
  );
  const bolCapInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.22, 8),
    new THREE.MeshBasicMaterial({ color: 0x24e5ff, fog: false }),
    bollardZ.length
  );
  bollardZ.forEach((z, i) => {
    dummy.position.set(15.8, 0.52, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bolBodyInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(15.8, 1.08, z);
    dummy.updateMatrix();
    bolCapInst.setMatrixAt(i, dummy.matrix);
  });
  cityGroup.add(bolBodyInst, bolCapInst);

  // 3. Beach Umbrellas right on the Golden Beach (x = 19..28)
  const umbrellaColors = [0xff4d5e, 0xffb830, 0x24e5ff, 0x2ee889];
  const stickGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6);
  const canopyGeo = new THREE.ConeGeometry(2.05, 0.85, 8);
  for (let z = -200; z <= 200; z += 22) {
    const ux = 19.5 + ((Math.abs(z) * 5) % 8);
    const umb = new THREE.Group();
    umb.position.set(ux, 0, z);
    const stick = new THREE.Mesh(stickGeo, poleMat);
    stick.position.y = 1.25;
    umb.add(stick);
    const canopy = new THREE.Mesh(
      canopyGeo,
      new THREE.MeshBasicMaterial({
        color: umbrellaColors[Math.abs(Math.floor(z / 22)) % umbrellaColors.length],
        fog: false,
      })
    );
    canopy.position.y = 2.48;
    umb.add(canopy);
    cityGroup.add(umb);
  }

  // 4. Pacifica Pier — Grounded Timber Boardwalk, Pilings & Coastal Harbor Beacon Pavilion
  // Keeps the sunset horizon completely unobstructed (zero abstract sky rings).
  const pierGroup = new THREE.Group();
  pierGroup.position.set(46, 0, -105);

  const timberMat = new THREE.MeshLambertMaterial({ color: 0x7a5136 });
  const pilingMat = new THREE.MeshLambertMaterial({ color: 0x453022 });
  const pavilionMat = new THREE.MeshLambertMaterial({ color: 0xe6d4be });
  const roofTerracottaMat = new THREE.MeshLambertMaterial({ color: 0xc2543e });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(52, 0.75, 13.5), timberMat);
  deck.position.y = 2.15;
  pierGroup.add(deck);

  // Support pilings rooted into the bay
  const pilingGeo = new THREE.CylinderGeometry(0.35, 0.4, 3.0, 8);
  for (let px = -22; px <= 22; px += 8.8) {
    for (const pz of [-5.8, 5.8]) {
      const piling = new THREE.Mesh(pilingGeo, pilingMat);
      piling.position.set(px, 1.0, pz);
      pierGroup.add(piling);
    }
  }

  // Warm low-profile pier deck lamp posts
  const pierLampGeo = new THREE.CylinderGeometry(0.1, 0.12, 3.0, 6);
  const pierOrbGeo = new THREE.SphereGeometry(0.24, 8, 8);
  for (let px = -18; px <= 14; px += 10.5) {
    for (const pz of [-5.9, 5.9]) {
      const lPost = new THREE.Mesh(pierLampGeo, poleMat);
      lPost.position.set(px, 4.0, pz);
      pierGroup.add(lPost);
      const lOrb = new THREE.Mesh(pierOrbGeo, bulbMat);
      lOrb.position.set(px, 5.55, pz);
      pierGroup.add(lOrb);
    }
  }

  // Low-profile coastal boat-house pavilion & warm harbor beacon at the pier tip
  const boathouse = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.4, 8.8), pavilionMat);
  boathouse.position.set(19.5, 4.2, 0);
  pierGroup.add(boathouse);

  const bhRoof = new THREE.Mesh(new THREE.ConeGeometry(6.8, 2.2, 4), roofTerracottaMat);
  bhRoof.rotation.y = Math.PI / 4;
  bhRoof.position.set(19.5, 7.0, 0);
  pierGroup.add(bhRoof);

  const pierBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffd166, fog: false })
  );
  pierBeacon.position.set(19.5, 8.25, 0);
  pierGroup.add(pierBeacon);
  cityGroup.add(pierGroup);

  // 5. Harbor Night Market Lantern Plaza, Stacked Shipping Containers & Framed Gantry Crane (Shot 2)
  const marketGroup = new THREE.Group();
  marketGroup.position.set(-76, 0, 120);

  const containerMats = [
    new THREE.MeshLambertMaterial({ map: atlas.containerRed }),
    new THREE.MeshLambertMaterial({ map: atlas.containerBlue }),
    new THREE.MeshLambertMaterial({ map: atlas.containerGold }),
  ];
  const containerGeo = new THREE.BoxGeometry(3.2, 2.8, 7.6);
  const containerOffsets = [
    { x: -17, z: -18, y: 1.4, rot: 0, mat: 0 },
    { x: -17, z: -18, y: 4.2, rot: 0, mat: 1 },
    { x: -17, z: -2, y: 1.4, rot: 0.05, mat: 2 },
    { x: 17, z: -14, y: 1.4, rot: 0, mat: 1 },
    { x: 17, z: -14, y: 4.2, rot: 0, mat: 0 },
    { x: 17, z: 4, y: 1.4, rot: -0.04, mat: 2 },
  ];
  for (const c of containerOffsets) {
    const box = new THREE.Mesh(containerGeo, containerMats[c.mat]);
    box.position.set(c.x, c.y, c.z);
    box.rotation.y = c.rot;
    box.castShadow = true;
    marketGroup.add(box);
  }

  // Harbor Industrial Gantry Arch with cross-bracing & trolley beam
  const craneMat = new THREE.MeshLambertMaterial({ color: 0xd96126 });
  const craneDarkMat = new THREE.MeshLambertMaterial({ color: 0x202a3b });
  const craneGroup = new THREE.Group();
  craneGroup.position.set(0, 0, -34);

  for (const lx of [-11.5, 11.5]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.35, 22, 1.35), craneMat);
    leg.position.set(lx, 11, 0);
    craneGroup.add(leg);

    const footing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 2.6), craneDarkMat);
    footing.position.set(lx, 0.6, 0);
    craneGroup.add(footing);

    // Corner diagonal steel gusset brace under top girder
    const brace = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 0.55), craneDarkMat);
    brace.position.set(lx > 0 ? lx - 1.8 : lx + 1.8, 19.6, 0);
    brace.rotation.z = lx > 0 ? Math.PI / 4 : -Math.PI / 4;
    craneGroup.add(brace);
  }
  const craneBeam = new THREE.Mesh(new THREE.BoxGeometry(31, 1.65, 2.0), craneMat);
  craneBeam.position.set(0, 21.6, 0);
  craneGroup.add(craneBeam);

  const craneRail = new THREE.Mesh(new THREE.BoxGeometry(29, 0.38, 2.25), craneDarkMat);
  craneRail.position.set(0, 20.6, 0);
  craneGroup.add(craneRail);
  marketGroup.add(craneGroup);

  // Grounded Cross-Street Night Market Catenary Cables & Proportional Hanging Paper Lanterns
  // 3 taut sagging spans strictly ahead of the Shot 2 camera (lz = -7, -15, -23) anchored to solid steel posts.
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x151a24, fog: false });
  const capMat = new THREE.MeshLambertMaterial({ color: 0x1b202b });
  const anchorPostMat = new THREE.MeshLambertMaterial({ color: 0x242d3e });
  const anchorPostGeo = new THREE.CylinderGeometry(0.16, 0.2, 8.4, 8);
  const dropCordGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.42, 5);
  const lanternBodyGeo = new THREE.SphereGeometry(0.24, 12, 10);
  lanternBodyGeo.scale(0.95, 1.32, 0.95);
  const lanternCapGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.07, 10);

  const lanternStyles = [
    { body: 0xff3b30, halo: createLanternHaloTexture('255, 68, 48') },   // Warm Crimson Red
    { body: 0xffb830, halo: createLanternHaloTexture('255, 190, 56') },  // Golden Amber
    { body: 0x3ae5ff, halo: createLanternHaloTexture('58, 229, 255') },  // Soft Night-Market Cyan
  ];
  const lanternBodyMats = lanternStyles.map(
    (s) => new THREE.MeshBasicMaterial({ color: s.body, fog: false })
  );
  const lanternHaloMats = lanternStyles.map(
    (s) =>
      new THREE.SpriteMaterial({
        map: s.halo,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      })
  );

  const spanRowsZ = [-7.0, -15.0, -23.0];
  const halfSpan = 12.6;
  const anchorY = 7.75;
  const centerSag = 1.35;
  const hangingLanterns = [];

  spanRowsZ.forEach((lz, rowIdx) => {
    // Solid left & right steel support poles grounding each cable span cleanly into the street edge
    for (const sideX of [-halfSpan, halfSpan]) {
      const post = new THREE.Mesh(anchorPostGeo, anchorPostMat);
      post.position.set(sideX, 4.2, lz);
      marketGroup.add(post);
    }

    // Build smooth downward-sagging catenary curve from left pole (-halfSpan) to right pole (+halfSpan)
    const curvePts = [];
    const curveSamples = 16;
    for (let s = 0; s <= curveSamples; s++) {
      const u = s / curveSamples;
      const x = -halfSpan + u * (halfSpan * 2);
      const norm = x / halfSpan; // -1 .. +1
      const y = anchorY - centerSag * (1 - norm * norm);
      curvePts.push(new THREE.Vector3(x, y, lz));
    }
    const catenaryCurve = new THREE.CatmullRomCurve3(curvePts);
    const cableGeo = new THREE.TubeGeometry(catenaryCurve, 24, 0.042, 6, false);
    const cableMesh = new THREE.Mesh(cableGeo, cableMat);
    marketGroup.add(cableMesh);

    // Suspend 7 proportional night-market lanterns directly from the catenary cable
    const lanternCount = 7;
    for (let k = 0; k < lanternCount; k++) {
      const frac = (k + 1) / (lanternCount + 1); // evenly spaced inside span (0.125 .. 0.875)
      const lx = -halfSpan + frac * (halfSpan * 2);
      const norm = lx / halfSpan;
      const cableY = anchorY - centerSag * (1 - norm * norm);
      const styleIdx = (k + rowIdx) % lanternStyles.length;

      const lanternGroup = new THREE.Group();
      lanternGroup.position.set(lx, cableY, lz);

      // Vertical drop cord attaching lantern cleanly to the cable
      const cord = new THREE.Mesh(dropCordGeo, cableMat);
      cord.position.y = -0.21;
      lanternGroup.add(cord);

      // Top & bottom dark bronze caps
      const topCap = new THREE.Mesh(lanternCapGeo, capMat);
      topCap.position.y = -0.42;
      lanternGroup.add(topCap);

      const botCap = new THREE.Mesh(lanternCapGeo, capMat);
      botCap.position.y = -0.96;
      lanternGroup.add(botCap);

      // Glowing oval lantern body
      const body = new THREE.Mesh(lanternBodyGeo, lanternBodyMats[styleIdx]);
      body.position.y = -0.69;
      lanternGroup.add(body);

      // Soft additive photographic glow halo
      const halo = new THREE.Sprite(lanternHaloMats[styleIdx]);
      halo.position.y = -0.69;
      halo.scale.set(1.85, 1.85, 1);
      halo.renderOrder = 7;
      lanternGroup.add(halo);

      marketGroup.add(lanternGroup);
      hangingLanterns.push({ group: lanternGroup, phase: k * 0.7 + rowIdx * 1.1 });
    }
  });
  cityGroup.add(marketGroup);

  return {
    pierBeacon,
    hangingLanterns,
    update(time) {
      // Gentle coastal breeze lantern sway & subtle pier beacon pulse
      const beaconScale = 0.92 + Math.sin(time * 3.2) * 0.14;
      pierBeacon.scale.setScalar(beaconScale);
      for (const hl of hangingLanterns) {
        hl.group.rotation.z = Math.sin(time * 1.8 + hl.phase) * 0.045;
      }
    },
  };
}
