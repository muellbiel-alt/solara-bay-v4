// Solara Bay: Neon Dynasty (V4) — 4-District Dense Coastal 3D Metropolis & Costa Customs Garage Builder
// Zero empty land: builds Palm Boulevard, Downtown Neon, Harbor Docks & Night Market, Industrial Yard,
// coconut palm groves, beach umbrellas, Pacifica Pier & Ferris Wheel, gantry cranes, and 3D Garage bay.

const THREE = window.THREE;
import { createNeonSignTexture } from './textures.js';

export function buildSolaraCity(scene, atlas) {
  const cityGroup = new THREE.Group();
  const colliders = [];

  // Base urban concrete foundation (eliminates any raw empty dirt/grass gaps)
  const baseGeo = new THREE.PlaneGeometry(1100, 1100);
  const baseMat = new THREE.MeshLambertMaterial({ map: atlas.sidewalk });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.rotation.x = -Math.PI / 2;
  baseMesh.position.set(-140, -0.04, 0);
  baseMesh.receiveShadow = true;
  cityGroup.add(baseMesh);

  // 1. Coastal Sandy Beach & Shimmering Turquoise Ocean (East side of Palm Boulevard)
  const sandGeo = new THREE.PlaneGeometry(54, 960);
  const sandMat = new THREE.MeshLambertMaterial({ map: atlas.sand });
  const sandMesh = new THREE.Mesh(sandGeo, sandMat);
  sandMesh.rotation.x = -Math.PI / 2;
  sandMesh.position.set(42, -0.02, 0);
  sandMesh.receiveShadow = true;
  cityGroup.add(sandMesh);

  const oceanGeo = new THREE.PlaneGeometry(520, 1100);
  const oceanMat = new THREE.MeshPhongMaterial({
    map: atlas.ocean,
    shininess: 90,
    specular: new THREE.Color(0xffd088),
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.rotation.x = -Math.PI / 2;
  oceanMesh.position.set(320, -0.18, 0);
  cityGroup.add(oceanMesh);

  // 2. 4-Lane Textured Avenues & Cross Streets with Zebra Crosswalk Intersections
  const avenuesX = [0, -76, -152, -228];
  const crossZ = [-240, -160, -80, 0, 80, 160, 240];
  const roadMat = new THREE.MeshLambertMaterial({ map: atlas.road });
  const crossMat = new THREE.MeshLambertMaterial({ map: atlas.crosswalk });
  const swMat = new THREE.MeshLambertMaterial({ map: atlas.sidewalk });

  for (const ax of avenuesX) {
    const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(22, 840), roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(ax, 0.0, 0);
    roadMesh.receiveShadow = true;
    cityGroup.add(roadMesh);

    // Raised textured sidewalks flanking both sides of every avenue
    for (const side of [-13.5, 13.5]) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(5, 0.18, 840), swMat);
      sw.position.set(ax + side, 0.09, 0);
      sw.receiveShadow = true;
      cityGroup.add(sw);
    }
  }

  const crossRoadTex = atlas.road.clone();
  crossRoadTex.needsUpdate = true;
  const crossRoadMat = new THREE.MeshLambertMaterial({ map: crossRoadTex });
  for (const cz of crossZ) {
    const cRoad = new THREE.Mesh(new THREE.PlaneGeometry(340, 20), crossRoadMat);
    cRoad.rotation.x = -Math.PI / 2;
    cRoad.rotation.z = Math.PI / 2;
    cRoad.position.set(-120, 0.01, cz);
    cityGroup.add(cRoad);

    for (const ax of avenuesX) {
      const ix = new THREE.Mesh(new THREE.PlaneGeometry(22.4, 22.4), crossMat);
      ix.rotation.x = -Math.PI / 2;
      ix.position.set(ax, 0.025, cz);
      cityGroup.add(ix);
    }
  }

  // 3. Sculpted Coconut Palm Trees, Cast Shadows, Streetlamps & Beach Umbrellas
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7c5338 });
  const frondMat = new THREE.MeshLambertMaterial({ color: 0x2e8f4e, side: THREE.DoubleSide });
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x0d121c,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });

  function addPalmTree(x, z, scale = 1.0, castRoadShadow = false) {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);

    // Segmented curved trunk
    for (let s = 0; s < 5; s++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28 * (1 - s * 0.08), 0.35 * (1 - s * 0.08), 1.85, 7),
        trunkMat
      );
      seg.position.set(Math.sin(s * 0.25) * 0.35, 0.9 + s * 1.75, 0);
      seg.rotation.z = -s * 0.04;
      palm.add(seg);
    }

    // Crown of 8 arched palm fronds
    const topY = 9.2;
    const topX = 0.45;
    for (let f = 0; f < 8; f++) {
      const angle = (f * Math.PI * 2) / 8;
      const frondPivot = new THREE.Group();
      frondPivot.position.set(topX, topY, 0);
      frondPivot.rotation.y = angle;

      const leaf = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 0.72), frondMat);
      leaf.position.set(1.65, -0.35, 0);
      leaf.rotation.z = -0.32;
      frondPivot.add(leaf);
      palm.add(frondPivot);
    }

    // Dramatic golden-hour shadow projected across the sidewalk/asphalt
    if (castRoadShadow) {
      const shTrunk = new THREE.Mesh(new THREE.PlaneGeometry(11.5, 0.55), shadowMat);
      shTrunk.rotation.x = -Math.PI / 2;
      shTrunk.rotation.z = 0.22;
      shTrunk.position.set(-5.4, 0.03, 1.2);
      palm.add(shTrunk);

      const shCrown = new THREE.Mesh(new THREE.CircleGeometry(2.4, 10), shadowMat);
      shCrown.rotation.x = -Math.PI / 2;
      shCrown.position.set(-10.8, 0.03, 2.4);
      palm.add(shCrown);
    }

    palm.scale.setScalar(scale);
    cityGroup.add(palm);
  }

  // Line Palm Boulevard (both sides) and the Beach Promenade with lush palms
  for (let z = -260; z <= 260; z += 18) {
    addPalmTree(13.2, z, 1.05, true);
    addPalmTree(26.5, z + 7, 0.95, false);
    if (Math.abs(z % 80) > 14) {
      addPalmTree(-13.2, z + 4, 0.98, false);
    }
  }

  // Coastal Streetlamps with warm glowing bulbs
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x263042 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe094 });
  for (let z = -220; z <= 220; z += 36) {
    for (const side of [-12.2, 12.2]) {
      const lamp = new THREE.Group();
      lamp.position.set(side, 0, z);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.8, 6), poleMat);
      pole.position.y = 3.4;
      lamp.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.14, 0.14), poleMat);
      arm.position.set(side > 0 ? -0.8 : 0.8, 6.7, 0);
      lamp.add(arm);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), bulbMat);
      bulb.position.set(side > 0 ? -1.55 : 1.55, 6.55, 0);
      lamp.add(bulb);
      cityGroup.add(lamp);
    }
  }

  // Colorful Beach Umbrellas, Lounge Chairs & Pacifica Pier Ferris Wheel on the Coast
  const umbrellaColors = [0xff4d5e, 0xffb830, 0x24e5ff, 0x2ee889];
  for (let z = -200; z <= 200; z += 26) {
    const umb = new THREE.Group();
    umb.position.set(36 + ((Math.abs(z) * 7) % 14), 0, z);
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 6), poleMat);
    stick.position.y = 1.3;
    umb.add(stick);
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(2.1, 0.85, 8),
      new THREE.MeshLambertMaterial({ color: umbrellaColors[Math.abs(z / 26) % umbrellaColors.length] })
    );
    canopy.position.y = 2.55;
    umb.add(canopy);
    cityGroup.add(umb);
  }

  // Pacifica Pier & Lit Ferris Wheel Landmark extending over the ocean at z = -110
  const pierGroup = new THREE.Group();
  pierGroup.position.set(68, 0, -110);
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(64, 0.8, 16),
    new THREE.MeshLambertMaterial({ color: 0x754e34 })
  );
  deck.position.y = 2.2;
  pierGroup.add(deck);
  const wheelRing = new THREE.Mesh(
    new THREE.TorusGeometry(14, 0.55, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffb830 })
  );
  wheelRing.position.set(16, 17.5, 0);
  pierGroup.add(wheelRing);
  const wheelInner = new THREE.Mesh(
    new THREE.TorusGeometry(9, 0.35, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0x24e5ff })
  );
  wheelInner.position.set(16, 17.5, 0);
  pierGroup.add(wheelInner);
  cityGroup.add(pierGroup);

  // 4. Dense Textured Buildings, Art-Deco Hotels, Neon Skyscrapers & Billboards
  const signConfigs = [
    { title: 'HOTEL MIRAMAR', sub: 'SOLARA OCEANFRONT RESORT', bg: '#12182b', border: '#ff4d5e', text: '#ffb830' },
    { title: 'VELVET REEF', sub: 'ROOFTOP LOUNGE & CLUB', bg: '#14112b', border: '#24e5ff', text: '#ff5e7e' },
    { title: 'SOLARA GRAND', sub: 'CASINO & PENTHOUSE SUITES', bg: '#191424', border: '#ffb830', text: '#24e5ff' },
    { title: 'COSTA CUSTOMS', sub: 'PERFORMANCE TUNING · BAY 4', bg: '#0d1926', border: '#2ee889', text: '#ffb830' },
    { title: 'AURELIA TOWER', sub: 'SYNDICATE FINANCIAL CORE', bg: '#0c162b', border: '#24e5ff', text: '#ffffff' },
    { title: 'NIGHT MARKET', sub: 'HARBOR LANTERN PROMENADE', bg: '#1f1124', border: '#ffb830', text: '#2ee889' },
  ];
  const signTextures = signConfigs.map((cfg) =>
    createNeonSignTexture(cfg.title, cfg.sub, cfg.bg, cfg.border, cfg.text)
  );

  function addTexturedBuilding(x, z, w, h, d, facadeIdx, signIdx = -1, addTier = true) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    const facadeTex = atlas.facades[facadeIdx % atlas.facades.length];
    const bodyMat = new THREE.MeshLambertMaterial({ map: facadeTex });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x222b3d });

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [
      bodyMat,
      bodyMat,
      roofMat,
      roofMat,
      bodyMat,
      bodyMat,
    ]);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    // Stepped Art-Deco / Penthouse upper tier + glowing neon crown
    if (addTier && h >= 18) {
      const tierH = Math.min(8, h * 0.24);
      const tier = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, tierH, d * 0.72), [
        bodyMat,
        bodyMat,
        roofMat,
        roofMat,
        bodyMat,
        bodyMat,
      ]);
      tier.position.y = h + tierH / 2;
      bGroup.add(tier);

      const neonCrown = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.75, 0.55, d * 0.75),
        new THREE.MeshBasicMaterial({ color: facadeIdx % 2 === 0 ? 0xffb830 : 0x24e5ff })
      );
      neonCrown.position.y = h + tierH + 0.25;
      bGroup.add(neonCrown);
    }

    // Glowing Storefront / Rooftop Neon Signboard
    if (signIdx >= 0) {
      const signMat = new THREE.MeshBasicMaterial({ map: signTextures[signIdx % signTextures.length] });
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.8, Math.min(d * 0.78, 15)), signMat);
      signBoard.position.set(w / 2 + 0.3, Math.min(9.5, h - 2.5), 0);
      bGroup.add(signBoard);
    }

    cityGroup.add(bGroup);
    colliders.push({ xMin: x - w / 2, xMax: x + w / 2, zMin: z - d / 2, zMax: z + d / 2 });
  }

  // Row 1: Palm Boulevard West Frontage (x = -28) — Boutique Art-Deco Hotels & Clubs with Neon Signs
  const blockCentersZ = [-200, -120, -40, 40, 120, 200];
  blockCentersZ.forEach((bz, idx) => {
    addTexturedBuilding(-28, bz - 17, 19, 22 + (idx % 3) * 5, 24, idx % 3, idx % signTextures.length, true);
    addTexturedBuilding(-28, bz + 17, 19, 18 + ((idx + 1) % 3) * 6, 24, (idx + 2) % 4, (idx + 1) % signTextures.length, true);
  });

  // Row 2: Mid-Block High-Rises (x = -52) — Creates deep skyline silhouette behind Palm Boulevard
  blockCentersZ.forEach((bz, idx) => {
    addTexturedBuilding(-52, bz - 16, 20, 38 + (idx % 3) * 10, 24, 1, -1, true);
    addTexturedBuilding(-52, bz + 16, 20, 32 + ((idx + 2) % 3) * 9, 24, 5, -1, true);
  });

  // Row 3: Downtown Neon & Harbor Docks Core (x = -104 and x = -126)
  blockCentersZ.forEach((bz, idx) => {
    if (bz <= 40) {
      // Downtown Neon Towering Skyscrapers
      addTexturedBuilding(-104, bz - 16, 22, 48 + (idx % 3) * 12, 24, 1, 4, true);
      addTexturedBuilding(-104, bz + 16, 22, 42 + ((idx + 1) % 2) * 10, 24, 5, 2, true);
      addTexturedBuilding(-126, bz, 20, 54, 48, 1, -1, true);
    } else {
      // Harbor Docks & Night Market District (z > 60)
      addTexturedBuilding(-104, bz - 16, 20, 18, 22, 3, 5, false);
      addTexturedBuilding(-104, bz + 16, 20, 16, 22, 4, 3, false);
    }
  });

  // 5. Harbor Night Market Lantern Plaza & Shipping Container Docks (at x = -76, z = 100..150 for Shot 2)
  const marketGroup = new THREE.Group();
  marketGroup.position.set(-76, 0, 120);

  const containerMats = [
    new THREE.MeshLambertMaterial({ map: atlas.containerRed }),
    new THREE.MeshLambertMaterial({ map: atlas.containerBlue }),
    new THREE.MeshLambertMaterial({ map: atlas.containerGold }),
  ];

  // Stacked Shipping Containers flanking the Harbor Docks road
  const containerOffsets = [
    { x: -17, z: -18, y: 1.4, rot: 0, mat: 0 },
    { x: -17, z: -18, y: 4.2, rot: 0, mat: 1 },
    { x: -17, z: -2, y: 1.4, rot: 0.05, mat: 2 },
    { x: 17, z: -14, y: 1.4, rot: 0, mat: 1 },
    { x: 17, z: -14, y: 4.2, rot: 0, mat: 0 },
    { x: 17, z: 4, y: 1.4, rot: -0.04, mat: 2 },
  ];
  for (const c of containerOffsets) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 7.6), containerMats[c.mat]);
    box.position.set(c.x, c.y, c.z);
    box.rotation.y = c.rot;
    box.castShadow = true;
    marketGroup.add(box);
  }

  // Towering Orange Harbor Gantry Crane in the background of Shot 2
  const craneMat = new THREE.MeshLambertMaterial({ color: 0xff6e26 });
  const craneGroup = new THREE.Group();
  craneGroup.position.set(0, 0, -34);
  for (const lx of [-11, 11]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.4, 24, 1.4), craneMat);
    leg.position.set(lx, 12, 0);
    craneGroup.add(leg);
  }
  const craneBeam = new THREE.Mesh(new THREE.BoxGeometry(34, 1.8, 2.2), craneMat);
  craneBeam.position.set(2, 23.5, 0);
  craneGroup.add(craneBeam);
  marketGroup.add(craneGroup);

  // Overhead Glowing Night Market String Lanterns
  const lanternColors = [0xff4d5e, 0xffb830, 0x24e5ff, 0x2ee889];
  for (let lz = -22; lz <= 22; lz += 8) {
    for (let lx = -9; lx <= 9; lx += 3) {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        new THREE.MeshBasicMaterial({ color: lanternColors[Math.abs(lx + lz) % lanternColors.length] })
      );
      lantern.position.set(lx, 6.2 - Math.cos((lx / 10) * Math.PI) * 0.65, lz);
      marketGroup.add(lantern);
    }
  }
  cityGroup.add(marketGroup);

  // 6. Costa Customs 3D Workshop & Hydraulic Turntable Bay (at x = -180, z = 120 for Shot 3)
  const garageBay = new THREE.Group();
  garageBay.position.set(-180, 0, 120);

  // Tiled studio floor & walls
  const gFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 28),
    new THREE.MeshLambertMaterial({ map: atlas.garageFloor })
  );
  gFloor.rotation.x = -Math.PI / 2;
  gFloor.position.y = 0.02;
  garageBay.add(gFloor);

  const gWallMat = new THREE.MeshLambertMaterial({ color: 0x162033 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 0.8), gWallMat);
  backWall.position.set(0, 6, -11);
  garageBay.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 28), gWallMat);
  leftWall.position.set(-12, 6, 0);
  garageBay.add(leftWall);

  // Glowing Costa Customs Neon Sign inside the Workshop
  const garageSign = new THREE.Mesh(
    new THREE.PlaneGeometry(11.5, 3.4),
    new THREE.MeshBasicMaterial({ map: signTextures[3] })
  );
  garageSign.position.set(-2.2, 6.6, -10.4);
  garageBay.add(garageSign);

  // Red Mechanic Tool Cabinets & 4-Post Hydraulic Lift Pillars
  const cabinetMat = new THREE.MeshLambertMaterial({ color: 0xd92b3a });
  for (const cx of [-8.5, -5.2, 3.8]) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.2), cabinetMat);
    cab.position.set(cx, 1.1, -9.6);
    garageBay.add(cab);
  }

  // Illuminated 3D Hydraulic Turntable Platform
  const turntable = new THREE.Group();
  turntable.position.set(-2.4, 0, 0);

  const baseDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 4.7, 0.22, 32),
    new THREE.MeshLambertMaterial({ color: 0x222c40 })
  );
  baseDisc.position.y = 0.11;
  turntable.add(baseDisc);

  const neonRing = new THREE.Mesh(
    new THREE.TorusGeometry(4.45, 0.1, 10, 36),
    new THREE.MeshBasicMaterial({ color: 0xffb830 })
  );
  neonRing.rotation.x = Math.PI / 2;
  neonRing.position.y = 0.22;
  turntable.add(neonRing);

  // 2 Hydraulic Lift Posts behind the turntable so the vehicle profile stays 100% unobstructed
  const postMat = new THREE.MeshLambertMaterial({ color: 0xf5b82e });
  for (const px of [-3.8, 3.8]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.8, 0.45), postMat);
    post.position.set(px, 2.4, -2.8);
    turntable.add(post);
  }

  // Warm overhead garage work light
  const garageLight = new THREE.PointLight(0xffcf88, 1.8, 26);
  garageLight.position.set(-2.4, 7.5, 3);
  garageBay.add(garageLight);

  garageBay.add(turntable);
  cityGroup.add(garageBay);

  scene.add(cityGroup);

  return {
    cityGroup,
    colliders,
    oceanMesh,
    turntable,
    garageBayPos: new THREE.Vector3(-182.4, 0.22, 120),
    update(dt, time) {
      if (atlas.ocean) {
        atlas.ocean.offset.x = (time * 0.03) % 1;
        atlas.ocean.offset.y = (time * 0.04) % 1;
      }
      wheelRing.rotation.z = time * 0.18;
      wheelInner.rotation.z = -time * 0.18;
    },
  };
}
