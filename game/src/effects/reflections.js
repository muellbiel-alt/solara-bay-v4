// Solara Bay: Neon Dynasty (V5) — Dusk Wet-Asphalt Specular Sheen, Siren & Brake Light Reflections
// Renders wide red/blue police strobe reflection pools, crimson brake reflections, golden sunset road sheen,
// and the Falcon-1 helicopter spotlight ground lock ring across the 4-lane asphalt.

const THREE = window.THREE;

function createRadialGlowPoolTexture(innerRgba, midRgba, outerRgba = 'rgba(0,0,0,0)') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0.0, innerRgba);
  grad.addColorStop(0.52, midRgba);
  grad.addColorStop(1.0, outerRgba);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createAsphaltReflectionSystem(scene) {
  const reflectionGroup = new THREE.Group();

  const redSirenTex = createRadialGlowPoolTexture(
    'rgba(255, 32, 72, 0.85)',
    'rgba(255, 18, 56, 0.42)'
  );
  const blueSirenTex = createRadialGlowPoolTexture(
    'rgba(18, 224, 255, 0.85)',
    'rgba(0, 150, 255, 0.42)'
  );
  const brakeGlowTex = createRadialGlowPoolTexture(
    'rgba(255, 38, 60, 0.82)',
    'rgba(255, 20, 42, 0.34)'
  );
  const spotlightGroundTex = createRadialGlowPoolTexture(
    'rgba(255, 248, 195, 0.62)',
    'rgba(255, 215, 118, 0.26)'
  );
  const sunsetSheenTex = createRadialGlowPoolTexture(
    'rgba(255, 178, 86, 0.32)',
    'rgba(255, 108, 76, 0.14)'
  );

  // 1. Golden-Hour Wet-Asphalt Specular Sheen Strips along Palm Boulevard (x = 0)
  for (let z = -180; z <= 140; z += 42) {
    const sheen = new THREE.Mesh(
      new THREE.PlaneGeometry(19, 34),
      new THREE.MeshBasicMaterial({
        map: sunsetSheenTex,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        fog: false,
      })
    );
    sheen.rotation.x = -Math.PI / 2;
    sheen.position.set(0, 0.026, z);
    sheen.renderOrder = 2;
    reflectionGroup.add(sheen);
  }

  // 2. Hero Car Crimson Taillight / Brake Asphalt Reflection Pool
  const heroBrakePool = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 6.2),
    new THREE.MeshBasicMaterial({
      map: brakeGlowTex,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      fog: false,
    })
  );
  heroBrakePool.rotation.x = -Math.PI / 2;
  heroBrakePool.position.set(1.15, 0.032, -21.8);
  heroBrakePool.renderOrder = 4;
  reflectionGroup.add(heroBrakePool);

  // 3. Falcon-1 Helicopter Spotlight Ground Target Pool on the Boulevard
  const heliSpotPool = new THREE.Mesh(
    new THREE.PlaneGeometry(14.0, 14.0),
    new THREE.MeshBasicMaterial({
      map: spotlightGroundTex,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      fog: false,
    })
  );
  heliSpotPool.rotation.x = -Math.PI / 2;
  heliSpotPool.position.set(-0.5, 0.028, -41.5);
  heliSpotPool.renderOrder = 3;
  reflectionGroup.add(heliSpotPool);

  // 4. Police Cruiser Dual Red & Blue Wet-Asphalt Siren Reflection Pools (up to 4 cruisers)
  const cruiserPools = [];
  for (let i = 0; i < 4; i++) {
    const pair = new THREE.Group();
    const redPool = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 7.6),
      new THREE.MeshBasicMaterial({
        map: redSirenTex,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        fog: false,
      })
    );
    redPool.rotation.x = -Math.PI / 2;
    redPool.position.set(-1.65, 0.031, 0);
    redPool.renderOrder = 4;
    pair.add(redPool);

    const bluePool = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 7.6),
      new THREE.MeshBasicMaterial({
        map: blueSirenTex,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        fog: false,
      })
    );
    bluePool.rotation.x = -Math.PI / 2;
    bluePool.position.set(1.65, 0.031, 0);
    bluePool.renderOrder = 4;
    pair.add(bluePool);

    reflectionGroup.add(pair);
    cruiserPools.push({ pair, redPool, bluePool });
  }

  scene.add(reflectionGroup);

  function syncWithEntities(heroCar, cruisers, helicopter, time = 1.25) {
    if (heroCar) {
      const h = heroCar.rotation.y;
      heroBrakePool.position.set(
        heroCar.position.x - Math.sin(h) * 2.6,
        0.032,
        heroCar.position.z - Math.cos(h) * 2.6
      );
      heroBrakePool.rotation.z = -h;
      heroBrakePool.visible = heroCar.visible;
    }

    if (helicopter && helicopter.mesh) {
      heliSpotPool.visible = helicopter.mesh.visible;
      heliSpotPool.position.set(
        helicopter.mesh.position.x,
        0.028,
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
      cp.redPool.material.opacity = pulse ? 0.94 : 0.48;
      cp.bluePool.material.opacity = !pulse ? 0.94 : 0.48;
    }
  }

  return {
    reflectionGroup,
    heroBrakePool,
    heliSpotPool,
    cruiserPools,
    syncWithEntities,
  };
}
