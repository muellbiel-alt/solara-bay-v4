// Solara Bay: Neon Dynasty (V6) — Art-Deco Coastal Hotels, Neon Skyscrapers & Detailed Rooftops
// Constructs the 4-district architectural skyline with procedural CanvasTexture facades, perimeter parapets,
// vented HVAC chillers, rooftop water towers, telecom antenna masts with red beacons, and rooftop billboards.

const THREE = window.THREE;
import { createPRNG } from '../core/random.js';
import { createNeonSignTexture } from './textures.js';

function createRedBeaconHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0.0, 'rgba(255, 225, 225, 1.0)');
  grad.addColorStop(0.28, 'rgba(255, 42, 60, 0.85)');
  grad.addColorStop(0.7, 'rgba(255, 24, 48, 0.22)');
  grad.addColorStop(1.0, 'rgba(255, 24, 48, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function buildCityBuildings(cityGroup, atlas) {
  const colliders = [];
  const rng = createPRNG(604);

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

  // Shared materials & rooftop detail geometries (reused across all buildings for low draw calls)
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x222b3d });
  const parapetMat = new THREE.MeshLambertMaterial({ color: 0x354259 });
  const facadeMats = atlas.facades.map((tex) => new THREE.MeshLambertMaterial({ map: tex }));
  const hvacMat = new THREE.MeshLambertMaterial({ map: atlas.hvac });
  const steelMat = new THREE.MeshLambertMaterial({ color: 0x2b3648 });
  const tankMat = new THREE.MeshLambertMaterial({ color: 0x6f5a4b });
  const tankCapMat = new THREE.MeshLambertMaterial({ color: 0x3e495c });
  const crownGoldMat = new THREE.MeshBasicMaterial({ color: 0xffb830, fog: false });
  const crownCyanMat = new THREE.MeshBasicMaterial({ color: 0x24e5ff, fog: false });
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff2b3d, fog: false });
  const beaconHaloMat = new THREE.SpriteMaterial({
    map: createRedBeaconHaloTexture(),
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });

  const hvacGeoLarge = new THREE.BoxGeometry(3.4, 1.8, 2.5);
  const hvacGeoSmall = new THREE.BoxGeometry(2.1, 1.35, 1.8);
  const mastBaseGeo = new THREE.BoxGeometry(1.4, 1.2, 1.4);
  const mastPoleGeo = new THREE.CylinderGeometry(0.11, 0.24, 9.5, 6);
  const crossArmGeo = new THREE.BoxGeometry(2.8, 0.16, 0.16);
  const beaconBulbGeo = new THREE.SphereGeometry(0.24, 8, 8);
  const tankBodyGeo = new THREE.CylinderGeometry(1.55, 1.65, 3.2, 12);
  const tankRoofGeo = new THREE.ConeGeometry(1.78, 1.15, 12);
  const tankLegGeo = new THREE.BoxGeometry(0.24, 1.8, 0.24);
  const trussLegGeo = new THREE.BoxGeometry(0.26, 4.6, 0.26);

  function populateRooftopDetails(bGroup, w, d, topY, roofSignIdx, styleVariant) {
    // 1. Raised architectural perimeter parapet wall coping
    const pThick = 0.65;
    const pHeight = 0.95;
    const northSouthGeo = new THREE.BoxGeometry(w, pHeight, pThick);
    const eastWestGeo = new THREE.BoxGeometry(pThick, pHeight, d);

    const pN = new THREE.Mesh(northSouthGeo, parapetMat);
    pN.position.set(0, topY + pHeight * 0.5, -d / 2 + pThick * 0.5);
    const pS = new THREE.Mesh(northSouthGeo, parapetMat);
    pS.position.set(0, topY + pHeight * 0.5, d / 2 - pThick * 0.5);
    const pE = new THREE.Mesh(eastWestGeo, parapetMat);
    pE.position.set(w / 2 - pThick * 0.5, topY + pHeight * 0.5, 0);
    const pW = new THREE.Mesh(eastWestGeo, parapetMat);
    pW.position.set(-w / 2 + pThick * 0.5, topY + pHeight * 0.5, 0);
    bGroup.add(pN, pS, pE, pW);

    // 2. Vented HVAC / Chiller Mechanical Units (2-3 clustered units per roof)
    const hvac1 = new THREE.Mesh(hvacGeoLarge, hvacMat);
    hvac1.position.set(rng.range(-w * 0.24, w * 0.14), topY + 0.9, rng.range(-d * 0.26, d * 0.22));
    bGroup.add(hvac1);

    const hvac2 = new THREE.Mesh(hvacGeoSmall, hvacMat);
    hvac2.position.set(hvac1.position.x + 2.8, topY + 0.675, hvac1.position.z - 0.5);
    bGroup.add(hvac2);

    // 3. Rooftop Water Tank on stilts (alternating coastal/downtown towers for skyline variety)
    if (styleVariant % 2 === 0) {
      const tankGroup = new THREE.Group();
      tankGroup.position.set(-w * 0.22, topY, d * 0.24);
      for (const lx of [-0.95, 0.95]) {
        for (const lz of [-0.95, 0.95]) {
          const leg = new THREE.Mesh(tankLegGeo, steelMat);
          leg.position.set(lx, 0.9, lz);
          tankGroup.add(leg);
        }
      }
      const barrel = new THREE.Mesh(tankBodyGeo, tankMat);
      barrel.position.y = 3.2;
      tankGroup.add(barrel);
      const cap = new THREE.Mesh(tankRoofGeo, tankCapMat);
      cap.position.y = 5.35;
      tankGroup.add(cap);
      bGroup.add(tankGroup);
    }

    // 4. Broadcast / Telecom Antenna Mast with Cross-Arms & Subtle Red Aviation Beacon
    const mastGroup = new THREE.Group();
    const mastScaleY = 0.85 + (styleVariant % 3) * 0.28;
    mastGroup.position.set(w * 0.18, topY, -d * 0.18);
    const mBase = new THREE.Mesh(mastBaseGeo, steelMat);
    mBase.position.y = 0.6;
    mastGroup.add(mBase);

    const mast = new THREE.Mesh(mastPoleGeo, steelMat);
    mast.scale.y = mastScaleY;
    mast.position.y = 1.0 + 4.75 * mastScaleY;
    mastGroup.add(mast);

    const armY = 1.0 + 7.2 * mastScaleY;
    const arm1 = new THREE.Mesh(crossArmGeo, steelMat);
    arm1.position.y = armY;
    const arm2 = new THREE.Mesh(crossArmGeo, steelMat);
    arm2.position.y = armY - 1.5;
    arm2.rotation.y = Math.PI / 2;
    mastGroup.add(arm1, arm2);

    const tipY = 1.0 + 9.6 * mastScaleY;
    const bulb = new THREE.Mesh(beaconBulbGeo, beaconMat);
    bulb.position.y = tipY;
    mastGroup.add(bulb);

    const halo = new THREE.Sprite(beaconHaloMat);
    halo.position.y = tipY;
    halo.scale.set(2.1, 2.1, 1);
    mastGroup.add(halo);
    bGroup.add(mastGroup);

    // 5. Rooftop Neon Billboard mounted on steel trusses facing Palm Boulevard (+X / +Z)
    if (roofSignIdx >= 0) {
      const boardW = Math.min(d * 0.68, 12.5);
      const boardGroup = new THREE.Group();
      boardGroup.position.set(w * 0.34, topY, 0);

      for (const tz of [-boardW * 0.36, 0, boardW * 0.36]) {
        const leg = new THREE.Mesh(trussLegGeo, steelMat);
        leg.position.set(0, 2.3, tz);
        boardGroup.add(leg);
      }
      const signMat = new THREE.MeshBasicMaterial({
        map: signTextures[roofSignIdx % signTextures.length],
        fog: false,
      });
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.6, boardW), signMat);
      board.position.set(0.18, 4.1, 0);
      boardGroup.add(board);
      bGroup.add(boardGroup);
    }
  }

  let buildCounter = 0;

  function addTexturedBuilding(x, z, w, h, d, facadeIdx, signIdx = -1, addTier = true, roofSignIdx = -1) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    const bodyMat = facadeMats[facadeIdx % facadeMats.length];
    const matArray = [bodyMat, bodyMat, roofMat, roofMat, bodyMat, bodyMat];

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matArray);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    let roofTopY = h;
    let roofW = w;
    let roofD = d;

    if (addTier && h >= 18) {
      const tierH = Math.min(7.5, h * 0.22);
      roofW = w * 0.72;
      roofD = d * 0.72;
      const tier = new THREE.Mesh(new THREE.BoxGeometry(roofW, tierH, roofD), matArray);
      tier.position.y = h + tierH / 2;
      tier.castShadow = true;
      bGroup.add(tier);

      const neonCrown = new THREE.Mesh(
        new THREE.BoxGeometry(roofW + 0.5, 0.52, roofD + 0.5),
        facadeIdx % 2 === 0 ? crownGoldMat : crownCyanMat
      );
      neonCrown.position.y = h + tierH + 0.24;
      bGroup.add(neonCrown);

      roofTopY = h + tierH + 0.5;
    }

    // Add rich architectural rooftop details on every skyline building
    populateRooftopDetails(bGroup, roofW, roofD, roofTopY, roofSignIdx, buildCounter++);

    if (signIdx >= 0) {
      const signMat = new THREE.MeshBasicMaterial({
        map: signTextures[signIdx % signTextures.length],
        fog: false,
      });
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 3.8, Math.min(d * 0.78, 15)), signMat);
      signBoard.position.set(w / 2 + 0.3, Math.min(9.5, h - 2.5), 0);
      bGroup.add(signBoard);
    }

    cityGroup.add(bGroup);
    colliders.push({ xMin: x - w / 2, xMax: x + w / 2, zMin: z - d / 2, zMax: z + d / 2 });
  }

  const blockCentersZ = [-200, -120, -40, 40, 120, 200];

  // Row 1: Palm Boulevard West Frontage (x = -28) — prominent in Shot 1 & Shot 4
  blockCentersZ.forEach((bz, idx) => {
    addTexturedBuilding(
      -28,
      bz - 17,
      19,
      22 + (idx % 3) * 5,
      24,
      idx % 3,
      idx % signTextures.length,
      true,
      idx % 2 === 0 ? (idx + 2) % signTextures.length : -1
    );
    addTexturedBuilding(
      -28,
      bz + 17,
      19,
      18 + ((idx + 1) % 3) * 6,
      24,
      (idx + 2) % 4,
      (idx + 1) % signTextures.length,
      true,
      idx % 2 === 1 ? (idx + 1) % signTextures.length : -1
    );
  });

  // Row 2: Mid-Block High-Rises (x = -52) — tall towers framing the left dusk skyline
  blockCentersZ.forEach((bz, idx) => {
    addTexturedBuilding(
      -52,
      bz - 16,
      20,
      38 + (idx % 3) * 10,
      24,
      1,
      -1,
      true,
      idx % 2 === 0 ? 4 : -1
    );
    addTexturedBuilding(
      -52,
      bz + 16,
      20,
      32 + ((idx + 2) % 3) * 9,
      24,
      5,
      -1,
      true,
      idx % 3 === 1 ? 1 : -1
    );
  });

  // Row 3: Downtown Neon & Harbor Docks Core (x = -104 and x = -126)
  blockCentersZ.forEach((bz, idx) => {
    if (bz <= 40) {
      addTexturedBuilding(-104, bz - 16, 22, 48 + (idx % 3) * 12, 24, 1, 4, true, 4);
      addTexturedBuilding(-104, bz + 16, 22, 42 + ((idx + 1) % 2) * 10, 24, 5, 2, true, -1);
      addTexturedBuilding(-126, bz, 20, 54, 48, 1, -1, true, 0);
    } else {
      addTexturedBuilding(-104, bz - 16, 20, 18, 22, 3, 5, false, -1);
      addTexturedBuilding(-104, bz + 16, 20, 16, 22, 4, 3, false, -1);
    }
  });

  return {
    colliders,
    signTextures,
  };
}
