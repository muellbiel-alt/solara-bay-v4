// Solara Bay: Neon Dynasty (V6) — Additive Plasma Nitrous Jets & Soft Crimson Taillight Trails
// Replaces hard geometric cones with multi-layered procedural CanvasTexture additive plasma plumes
// and feathered photographic taillight light-streaks (THREE.AdditiveBlending, depthWrite: false).

const THREE = window.THREE;

let cachedPlasmaTex = null;
let cachedNozzleGlowTex = null;
let cachedTailStreakTex = null;

function getPlasmaJetTexture() {
  if (cachedPlasmaTex) return cachedPlasmaTex;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 128, 256);

  // Outer electric cyan-blue feathered plasma envelope (y = 0 nozzle -> y = 256 fading tail)
  for (let y = 0; y < 256; y++) {
    const t = y / 255; // 0 at exhaust exit, 1 at trailing tip
    // Taper radius gently from nozzle flare, expand slightly, then taper smoothly to zero
    const envelope = Math.pow(1 - t, 1.35) * (0.45 + 0.55 * Math.sin(Math.min(1, t * 3.5) * Math.PI * 0.5));
    const halfW = Math.max(2, envelope * 58);
    // Subtle supersonic shock-diamond modulation along the jet axis
    const diamond = 0.84 + 0.16 * Math.pow(Math.sin(t * Math.PI * 5.0), 2);
    const alpha = Math.pow(1 - t, 1.45) * (t < 0.08 ? t / 0.08 : 1.0) * diamond;

    const grad = ctx.createLinearGradient(64 - halfW, y, 64 + halfW, y);
    grad.addColorStop(0.0, 'rgba(0, 95, 255, 0)');
    grad.addColorStop(0.24, `rgba(18, 168, 255, ${(0.44 * alpha).toFixed(3)})`);
    grad.addColorStop(0.42, `rgba(98, 236, 255, ${(0.84 * alpha).toFixed(3)})`);
    grad.addColorStop(0.5, `rgba(242, 253, 255, ${(0.98 * alpha).toFixed(3)})`);
    grad.addColorStop(0.58, `rgba(98, 236, 255, ${(0.84 * alpha).toFixed(3)})`);
    grad.addColorStop(0.76, `rgba(18, 168, 255, ${(0.44 * alpha).toFixed(3)})`);
    grad.addColorStop(1.0, 'rgba(0, 95, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(64 - halfW, y, halfW * 2, 1.5);
  }

  cachedPlasmaTex = new THREE.CanvasTexture(canvas);
  cachedPlasmaTex.needsUpdate = true;
  return cachedPlasmaTex;
}

function getNozzleGlowTexture() {
  if (cachedNozzleGlowTex) return cachedNozzleGlowTex;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.22, 'rgba(160, 245, 255, 0.88)');
  grad.addColorStop(0.52, 'rgba(30, 184, 255, 0.42)');
  grad.addColorStop(1.0, 'rgba(0, 90, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  cachedNozzleGlowTex = new THREE.CanvasTexture(canvas);
  cachedNozzleGlowTex.needsUpdate = true;
  return cachedNozzleGlowTex;
}

function getTaillightStreakTexture() {
  if (cachedTailStreakTex) return cachedTailStreakTex;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 128, 256);
  for (let y = 0; y < 256; y++) {
    const t = y / 255; // 0 right behind taillight, 1 trailing end
    const alpha = Math.pow(1 - t, 1.75) * (t < 0.05 ? t / 0.05 : 1.0);
    const halfW = (0.38 + 0.62 * (1 - t * 0.45)) * 58;

    const grad = ctx.createLinearGradient(64 - halfW, y, 64 + halfW, y);
    grad.addColorStop(0.0, 'rgba(255, 16, 48, 0)');
    grad.addColorStop(0.28, `rgba(255, 24, 58, ${(0.32 * alpha).toFixed(3)})`);
    grad.addColorStop(0.5, `rgba(255, 118, 84, ${(0.76 * alpha).toFixed(3)})`);
    grad.addColorStop(0.72, `rgba(255, 24, 58, ${(0.32 * alpha).toFixed(3)})`);
    grad.addColorStop(1.0, 'rgba(255, 16, 48, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(64 - halfW, y, halfW * 2, 1.5);
  }

  cachedTailStreakTex = new THREE.CanvasTexture(canvas);
  cachedTailStreakTex.needsUpdate = true;
  return cachedTailStreakTex;
}

export function createVehicleTrails(carGroup, width, length, wheelRadius, isPolice = false) {
  const nitroFlames = [];
  const tailTrails = [];

  const plasmaTex = getPlasmaJetTexture();
  const nozzleGlowTex = getNozzleGlowTexture();
  const tailStreakTex = getTaillightStreakTexture();

  const outerPlasmaMat = new THREE.MeshBasicMaterial({
    map: plasmaTex,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });

  const corePlasmaMat = new THREE.MeshBasicMaterial({
    map: plasmaTex,
    color: 0xe8fbff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });

  const nozzleSpriteMat = new THREE.SpriteMaterial({
    map: nozzleGlowTex,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });

  // Dual multi-layer additive plasma nitrous afterburner plumes (zero hard cone edges)
  const jetLen = 1.85;
  const coreLen = 1.15;
  const outerGeo = new THREE.PlaneGeometry(0.62, jetLen);
  const coreGeo = new THREE.PlaneGeometry(0.32, coreLen);

  for (const ex of [-width * 0.245, width * 0.245]) {
    const plume = new THREE.Group();
    plume.position.set(ex, wheelRadius - 0.05, -length * 0.485);

    // 3 intersecting axial planes (0°, 60°, 120°) so plasma reads full and volumetric from any angle
    for (let k = 0; k < 3; k++) {
      const planeOuter = new THREE.Mesh(outerGeo, outerPlasmaMat);
      planeOuter.rotation.x = Math.PI / 2;
      planeOuter.rotation.y = (k * Math.PI) / 3;
      planeOuter.position.z = -jetLen * 0.5;
      planeOuter.renderOrder = 8;
      plume.add(planeOuter);

      if (k < 2) {
        const planeCore = new THREE.Mesh(coreGeo, corePlasmaMat);
        planeCore.rotation.x = Math.PI / 2;
        planeCore.rotation.y = (k * Math.PI) / 2 + Math.PI / 4;
        planeCore.position.z = -coreLen * 0.5;
        planeCore.renderOrder = 9;
        plume.add(planeCore);
      }
    }

    // Bright additive blue-white exhaust nozzle bloom flare
    const nozzleGlow = new THREE.Sprite(nozzleSpriteMat);
    nozzleGlow.position.set(0, 0.02, -0.06);
    nozzleGlow.scale.set(0.72, 0.72, 1);
    nozzleGlow.renderOrder = 10;
    plume.add(nozzleGlow);

    plume.visible = false;
    carGroup.add(plume);
    nitroFlames.push(plume);
  }

  // Soft Additive Crimson Taillight Motion Light-Streaks (feathered edges, zero hard rectangles)
  const trailMat = new THREE.MeshBasicMaterial({
    map: tailStreakTex,
    transparent: true,
    opacity: isPolice ? 0.58 : 0.78,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: false,
  });

  const trailLen = isPolice ? 2.15 : 3.05;
  const horizGeo = new THREE.PlaneGeometry(0.58, trailLen);
  const vertGeo = new THREE.PlaneGeometry(0.34, trailLen * 0.82);

  for (const tx of [-width * 0.33, width * 0.33]) {
    const ribbon = new THREE.Group();
    ribbon.position.set(tx, wheelRadius + 0.28, -length * 0.47);

    const hPlane = new THREE.Mesh(horizGeo, trailMat);
    hPlane.rotation.x = Math.PI / 2;
    hPlane.position.z = -trailLen * 0.5;
    hPlane.renderOrder = 6;
    ribbon.add(hPlane);

    const vPlane = new THREE.Mesh(vertGeo, trailMat);
    vPlane.rotation.x = Math.PI / 2;
    vPlane.rotation.y = Math.PI / 2;
    vPlane.position.z = -trailLen * 0.41;
    vPlane.renderOrder = 6;
    ribbon.add(vPlane);

    carGroup.add(ribbon);
    tailTrails.push(ribbon);
  }

  return {
    nitroFlames,
    tailTrails,
    update(time, speed, nitroActive) {
      const pulse = 0.94 + Math.sin(time * 32) * 0.1;
      const spread = 0.96 + Math.cos(time * 24) * 0.06;
      for (const fl of nitroFlames) {
        fl.visible = Boolean(nitroActive);
        if (nitroActive) {
          fl.scale.set(spread, spread, pulse);
        }
      }
      const showTrails = Math.abs(speed) > 15 || nitroActive;
      for (const tr of tailTrails) {
        tr.visible = showTrails;
      }
    },
  };
}
