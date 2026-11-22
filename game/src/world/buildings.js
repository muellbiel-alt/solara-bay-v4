// Solara Bay: Neon Dynasty (V5) — Art-Deco Coastal Hotels, Neon Skyscrapers & Rooftop Billboards
// Constructs the 4-district architectural skyline with procedural CanvasTexture facades and neon signs.

const THREE = window.THREE;
import { createNeonSignTexture } from './textures.js';

export function buildCityBuildings(cityGroup, atlas) {
  const colliders = [];

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

  const roofMat = new THREE.MeshLambertMaterial({ color: 0x222b3d });
  const facadeMats = atlas.facades.map((tex) => new THREE.MeshLambertMaterial({ map: tex }));
  const crownGoldMat = new THREE.MeshBasicMaterial({ color: 0xffb830, fog: false });
  const crownCyanMat = new THREE.MeshBasicMaterial({ color: 0x24e5ff, fog: false });

  function addTexturedBuilding(x, z, w, h, d, facadeIdx, signIdx = -1, addTier = true) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    const bodyMat = facadeMats[facadeIdx % facadeMats.length];
    const matArray = [bodyMat, bodyMat, roofMat, roofMat, bodyMat, bodyMat];

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matArray);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);

    if (addTier && h >= 18) {
      const tierH = Math.min(8, h * 0.24);
      const tier = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, tierH, d * 0.72), matArray);
      tier.position.y = h + tierH / 2;
      bGroup.add(tier);

      const neonCrown = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.75, 0.55, d * 0.75),
        facadeIdx % 2 === 0 ? crownGoldMat : crownCyanMat
      );
      neonCrown.position.y = h + tierH + 0.25;
      bGroup.add(neonCrown);
    }

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

  // Row 1: Palm Boulevard West Frontage (x = -28)
  blockCentersZ.forEach((bz, idx) => {
    addTexturedBuilding(-28, bz - 17, 19, 22 + (idx % 3) * 5, 24, idx % 3, idx % signTextures.length, true);
    addTexturedBuilding(-28, bz + 17, 19, 18 + ((idx + 1) % 3) * 6, 24, (idx + 2) % 4, (idx + 1) % signTextures.length, true);
  });

  // Row 2: Mid-Block High-Rises (x = -52)
  blockCentersZ.forEach((bz, idx) => {
    addTexturedBuilding(-52, bz - 16, 20, 38 + (idx % 3) * 10, 24, 1, -1, true);
    addTexturedBuilding(-52, bz + 16, 20, 32 + ((idx + 2) % 3) * 9, 24, 5, -1, true);
  });

  // Row 3: Downtown Neon & Harbor Docks Core (x = -104 and x = -126)
  blockCentersZ.forEach((bz, idx) => {
    if (bz <= 40) {
      addTexturedBuilding(-104, bz - 16, 22, 48 + (idx % 3) * 12, 24, 1, 4, true);
      addTexturedBuilding(-104, bz + 16, 22, 42 + ((idx + 1) % 2) * 10, 24, 5, 2, true);
      addTexturedBuilding(-126, bz, 20, 54, 48, 1, -1, true);
    } else {
      addTexturedBuilding(-104, bz - 16, 20, 18, 22, 3, 5, false);
      addTexturedBuilding(-104, bz + 16, 20, 16, 22, 4, 3, false);
    }
  });

  return {
    colliders,
    signTextures,
  };
}
