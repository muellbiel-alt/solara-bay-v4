// Solara Bay: Neon Dynasty (V6) — Soft Additive Wet-Asphalt Specular Reflections
// Uses feathered longitudinal wet-pavement gradients with THREE.AdditiveBlending and Mulberry32
// micro-grain modulation so siren strobes, brake light trails, plasma nitro, and sunset sheen
// melt smoothly into the dusk asphalt without hard circles or harsh planes.

const THREE = window.THREE;
import { createPRNG } from '../core/random.js';

function createSoftWetGlowTexture(coreRgb, midRgb, seed = 404, elongated = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const rng = createPRNG(seed);

  ctx.clearRect(0, 0, 256, 256);

  // Smooth Gaussian-like multi-stop radial bloom
  ctx.save();
  if (elongated) {
    ctx.translate(128, 128);
    ctx.scale(0.86, 1.0);
    ctx.translate(-128, -128);
  }
  const grad = ctx.createRadialGradient(128, 128, 4, 128, 128, 122);
  grad.addColorStop(0.0, `rgba(${coreRgb}, 0.78)`);
  grad.addColorStop(0.22, `rgba(${coreRgb}, 0.44)`);
  grad.addColorStop(0.52, `rgba(${midRgb}, 0.18)`);
  grad.addColorStop(0.78, `rgba(${midRgb}, 0.05)`);
  grad.addColorStop(1.0, `rgba(${midRgb}, 0.0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  ctx.restore();

  // Subtle deterministic wet-asphalt micro-streak specular breakup (masks edge artifacts)
  ctx.globalCompositeOperation = 'destination-in';
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = 256;
  maskCanvas.height = 256;
  const mctx = maskCanvas.getContext('2d');
  mctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
  mctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i++) {
    const x = rng.range(16, 240);
    const y = rng.range(16, 240);
    const w = rng.range(4, 18);
    const h = rng.range(12, 42);
    const bright = rng.next() > 0.45;
    mctx.fillStyle = bright ? 'rgba(255, 255, 255, 0.24)' : 'rgba(180, 180, 180, 0.16)';
    mctx.fillRect(x, y, w, h);
  }
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createAsphaltReflectionSystem(scene) {
  const reflectionGroup = new THREE.Group();

  const redSirenTex = createSoftWetGlowTexture('255, 36, 74', '220, 16, 52', 701, true);
  const blueSirenTex = createSoftWetGlowTexture('26, 212, 255', '0, 128, 255', 702, true);
  const brakeGlowTex = createSoftWetGlowTexture('255, 52, 68', '215, 18, 42', 703, true);
  const nitroGlowTex = createSoftWetGlowTexture('92, 236, 255', '18, 152, 255', 704, true);
  const spotlightGroundTex = createSoftWetGlowTexture('255, 246, 202', '255, 205, 112', 705, false);
  const sunsetSheenTex = createSoftWetGlowTexture('255, 174, 96', '255, 108, 78', 706, true);

  function makeAdditiveMat(map, opacity) {
    return new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
  }

  // 1. Subtle Golden-Hour Wet-Asphalt Specular Sheen along Palm Boulevard (x = 0)
  for (let z = -180; z <= 140; z += 44) {
    const sheen = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 38),
      makeAdditiveMat(sunsetSheenTex, 0.28)
    );
    sheen.rotation.x = -Math.PI / 2;
    sheen.position.set(0, 0.024, z);
    sheen.renderOrder = 2;
    reflectionGroup.add(sheen);
  }

  // 2. Hero Car Soft Crimson Brake Reflection + Additive Blue Nitro Underglow Streak
  const heroBrakePool = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 7.6),
    makeAdditiveMat(brakeGlowTex, 0.62)
  );
  heroBrakePool.rotation.x = -Math.PI / 2;
  heroBrakePool.position.set(1.15, 0.03, -21.8);
  heroBrakePool.renderOrder = 4;
  reflectionGroup.add(heroBrakePool);

  const heroNitroPool = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 6.4),
    makeAdditiveMat(nitroGlowTex, 0.72)
  );
  heroNitroPool.rotation.x = -Math.PI / 2;
  heroNitroPool.position.set(1.15, 0.032, -21.2);
  heroNitroPool.renderOrder = 5;
  reflectionGroup.add(heroNitroPool);

  // 3. Falcon-1 Helicopter Soft Volumetric Ground Lock Pool on the Boulevard
  const heliSpotPool = new THREE.Mesh(
    new THREE.PlaneGeometry(15.5, 15.5),
    makeAdditiveMat(spotlightGroundTex, 0.56)
  );
  heliSpotPool.rotation.x = -Math.PI / 2;
  heliSpotPool.position.set(-0.5, 0.026, -41.5);
  heliSpotPool.renderOrder = 3;
  reflectionGroup.add(heliSpotPool);

  // 4. Police Cruiser Soft Wet-Asphalt Red & Blue Strobe Reflection Pools (up to 4 cruisers)
  const cruiserPools = [];
  for (let i = 0; i < 4; i++) {
    const pair = new THREE.Group();
    const redPool = new THREE.Mesh(
      new THREE.PlaneGeometry(7.8, 10.2),
      makeAdditiveMat(redSirenTex, 0.62)
    );
    redPool.rotation.x = -Math.PI / 2;
    redPool.position.set(-1.55, 0.029, -0.4);
    redPool.renderOrder = 4;
    pair.add(redPool);

    const bluePool = new THREE.Mesh(
      new THREE.PlaneGeometry(7.8, 10.2),
      makeAdditiveMat(blueSirenTex, 0.62)
    );
    bluePool.rotation.x = -Math.PI / 2;
    bluePool.position.set(1.55, 0.029, -0.4);
    bluePool.renderOrder = 4;
    pair.add(bluePool);

    reflectionGroup.add(pair);
    cruiserPools.push({ pair, redPool, bluePool });
  }

  scene.add(reflectionGroup);

  function syncWithEntities(heroCar, cruisers, helicopter, time = 1.25) {
    if (heroCar) {
      const h = heroCar.rotation.y;
      const sinH = Math.sin(h);
      const cosH = Math.cos(h);
      heroBrakePool.position.set(
        heroCar.position.x - sinH * 2.9,
        0.03,
        heroCar.position.z - cosH * 2.9
      );
      heroBrakePool.rotation.z = -h;
      heroBrakePool.visible = heroCar.visible;

      heroNitroPool.position.set(
        heroCar.position.x - sinH * 3.15,
        0.032,
        heroCar.position.z - cosH * 3.15
      );
      heroNitroPool.rotation.z = -h;
      heroNitroPool.visible = Boolean(heroCar.visible && heroCar.userData && heroCar.userData.nitroActive);
    }

    if (helicopter && helicopter.mesh) {
      heliSpotPool.visible = helicopter.mesh.visible;
      heliSpotPool.position.set(
        helicopter.mesh.position.x,
        0.026,
        helicopter.mesh.position.z + 6.2
      );
    }

    const pulse = Math.sin(time * 16) > 0;
    for (let i = 0; i < cruiserPools.length; i++) {
      const cp = cruiserPools[i];
      const cruiser = cruisers && cruisers[i];
      if (!cruiser) {
        cp.pair.visible = false;
        continue;
      }
      cp.pair.visible = true;
      cp.pair.position.set(cruiser.position.x, 0, cruiser.position.z);
      cp.pair.rotation.y = cruiser.rotation.y;
      cp.redPool.material.opacity = pulse ? 0.68 : 0.34;
      cp.bluePool.material.opacity = !pulse ? 0.68 : 0.34;
    }
  }

  return {
    reflectionGroup,
    heroBrakePool,
    heroNitroPool,
    heliSpotPool,
    cruiserPools,
    syncWithEntities,
  };
}
