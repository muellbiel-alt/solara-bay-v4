// Solara Bay: Neon Dynasty (V5) — High-Contrast Multi-Layer Explosions, Ember Sparks & Ballistic Tracers
// Uses procedural radial-gradient CanvasTexture fireballs (fog: false, renderOrder layered) so blasts
// render with an incandescent white-yellow core, deep crimson-orange fire ring, dark smoke, and sparks.

const THREE = window.THREE;

let cachedFireballTex = null;
let cachedSmokeTex = null;

function getFireballTexture() {
  if (cachedFireballTex) return cachedFireballTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
  grad.addColorStop(0.0, 'rgba(255, 255, 240, 1.0)');
  grad.addColorStop(0.22, 'rgba(255, 232, 92, 1.0)');
  grad.addColorStop(0.48, 'rgba(255, 108, 16, 0.96)');
  grad.addColorStop(0.74, 'rgba(218, 22, 14, 0.85)');
  grad.addColorStop(0.92, 'rgba(72, 12, 14, 0.45)');
  grad.addColorStop(1.0, 'rgba(20, 8, 12, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  cachedFireballTex = new THREE.CanvasTexture(canvas);
  cachedFireballTex.needsUpdate = true;
  return cachedFireballTex;
}

function getSmokeBillowTexture() {
  if (cachedSmokeTex) return cachedSmokeTex;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
  grad.addColorStop(0.0, 'rgba(18, 20, 28, 0.94)');
  grad.addColorStop(0.6, 'rgba(28, 31, 42, 0.78)');
  grad.addColorStop(1.0, 'rgba(28, 31, 42, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  cachedSmokeTex = new THREE.CanvasTexture(canvas);
  cachedSmokeTex.needsUpdate = true;
  return cachedSmokeTex;
}

export function createExplosionEffect(scene, x, y, z, scale = 1.0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  // 1. Dark Charred Ground Scorch Crater + Double Shockwave Rings
  const scorch = new THREE.Mesh(
    new THREE.CircleGeometry(3.8 * scale, 24),
    new THREE.MeshBasicMaterial({
      color: 0x07090e,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      fog: false,
    })
  );
  scorch.rotation.x = -Math.PI / 2;
  scorch.position.y = 0.032;
  group.add(scorch);

  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(1.8 * scale, 3.05 * scale, 28),
    new THREE.MeshBasicMaterial({
      color: 0xffe042,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      fog: false,
    })
  );
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.055;
  group.add(innerRing);

  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(3.15 * scale, 4.45 * scale, 28),
    new THREE.MeshBasicMaterial({
      color: 0xff2a0e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      fog: false,
    })
  );
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.048;
  group.add(outerRing);

  // 2. Rising Dark Charcoal Smoke Plume (behind/above the fire)
  const smokeLobes = [
    { x: -1.1, y: 3.4, z: -0.4, s: 3.4 },
    { x: 1.05, y: 3.7, z: 0.2, s: 3.6 },
    { x: 0.0, y: 4.5, z: -0.2, s: 4.1 },
    { x: -0.35, y: 2.8, z: -0.6, s: 3.2 },
  ];
  for (const sm of smokeLobes) {
    const sSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getSmokeBillowTexture(),
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        fog: false,
      })
    );
    sSprite.position.set(sm.x * scale, sm.y * scale, sm.z * scale);
    sSprite.scale.set(sm.s * scale, sm.s * scale, 1);
    sSprite.renderOrder = 10;
    group.add(sSprite);
  }

  // 3. Multi-Layered High-Contrast Fireball Billboards & Sculpted Flame Tongues
  const fireBillows = [
    { x: 0.0, y: 1.85, z: 0.1, s: 6.4 },
    { x: -1.25, y: 1.55, z: 0.35, s: 4.2 },
    { x: 1.28, y: 1.5, z: 0.25, s: 4.1 },
    { x: 0.1, y: 2.55, z: 0.2, s: 4.5 },
  ];
  const flameSprites = [];
  for (const fb of fireBillows) {
    const fSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getFireballTexture(),
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        fog: false,
      })
    );
    fSprite.position.set(fb.x * scale, fb.y * scale, fb.z * scale);
    fSprite.scale.set(fb.s * scale, fb.s * scale, 1);
    fSprite.renderOrder = 12;
    group.add(fSprite);
    flameSprites.push(fSprite);
  }

  // Sculpted 3D Crimson-Orange Flame Tongues & White-Hot Incandescent Core facing the camera
  const crimsonShell = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.72 * scale, 1),
    new THREE.MeshBasicMaterial({
      color: 0xe6220e,
      transparent: true,
      opacity: 0.86,
      fog: false,
    })
  );
  crimsonShell.position.set(0, 1.58 * scale, -0.15 * scale);
  group.add(crimsonShell);

  const orangeCore = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.36 * scale, 1),
    new THREE.MeshBasicMaterial({ color: 0xff7b14, fog: false })
  );
  orangeCore.position.set(0, 1.5 * scale, 0.48 * scale);
  group.add(orangeCore);

  const whiteCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.92 * scale, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xfffef2, fog: false })
  );
  whiteCore.position.set(0, 1.44 * scale, 1.08 * scale);
  group.add(whiteCore);

  // 4. Flying Burning Ember Sparks & Shrapnel Debris Streaks
  const sparkGeo = new THREE.BoxGeometry(0.18 * scale, 0.18 * scale, 0.72 * scale);
  const sparkWhiteMat = new THREE.MeshBasicMaterial({ color: 0xfff6a8, fog: false });
  const sparkOrangeMat = new THREE.MeshBasicMaterial({ color: 0xff450e, fog: false });
  const debrisMat = new THREE.MeshBasicMaterial({ color: 0x12151e, fog: false });

  const sparks = [];
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2 + (i % 3) * 0.18;
    const radius = (2.0 + (i % 4) * 0.72) * scale;
    const height = (1.0 + ((i * 7) % 5) * 0.75) * scale;
    const mat = i % 3 === 0 ? sparkWhiteMat : i % 3 === 1 ? sparkOrangeMat : debrisMat;
    const sp = new THREE.Mesh(sparkGeo, mat);
    sp.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    sp.lookAt(0, 1.3 * scale, 0);
    group.add(sp);
    sparks.push(sp);
  }

  group.userData = {
    whiteCore,
    orangeCore,
    innerRing,
    outerRing,
    flameSprites,
    sparks,
    update(time) {
      const pulse = 1 + Math.sin(time * 16) * 0.06;
      whiteCore.scale.setScalar(pulse);
      orangeCore.scale.setScalar(1 + Math.cos(time * 14) * 0.05);
      innerRing.scale.setScalar(1 + Math.sin(time * 10) * 0.04);
    },
  };

  scene.add(group);
  return group;
}

export function createBulletTracer(scene, startVec, endVec, colorHex = 0xffe066) {
  const dir = new THREE.Vector3().subVectors(endVec, startVec);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

  const tracerGroup = new THREE.Group();
  tracerGroup.position.copy(mid);
  tracerGroup.lookAt(endVec);

  const coreGeo = new THREE.CylinderGeometry(0.024, 0.024, len, 6);
  coreGeo.rotateX(Math.PI / 2);
  const coreMesh = new THREE.Mesh(
    coreGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfffef2,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  );
  coreMesh.renderOrder = 11;
  tracerGroup.add(coreMesh);

  const glowGeo = new THREE.CylinderGeometry(0.072, 0.072, len, 8);
  glowGeo.rotateX(Math.PI / 2);
  const glowMesh = new THREE.Mesh(
    glowGeo,
    new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.58,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  );
  glowMesh.renderOrder = 10;
  tracerGroup.add(glowMesh);

  scene.add(tracerGroup);
  return tracerGroup;
}
