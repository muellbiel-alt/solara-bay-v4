// Solara Bay: Neon Dynasty (V4) — 3-Layer Golden-Hour Sunset Sky Dome, Directional Shadows & FogExp2

const THREE = window.THREE;

function createSunsetSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich tropical golden-hour gradient: deep indigo zenith -> magenta coral -> blazing amber horizon
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#161b3d');
  grad.addColorStop(0.22, '#3a2a68');
  grad.addColorStop(0.42, '#8f3f72');
  grad.addColorStop(0.62, '#e8685c');
  grad.addColorStop(0.82, '#ffa447');
  grad.addColorStop(1.0, '#ffe082');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Glowing golden-hour sun disc & halo on the horizon
  const sunX = 520;
  const sunY = 390;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 170);
  sunGlow.addColorStop(0, 'rgba(255, 252, 220, 1)');
  sunGlow.addColorStop(0.25, 'rgba(255, 210, 110, 0.85)');
  sunGlow.addColorStop(0.6, 'rgba(255, 130, 80, 0.35)');
  sunGlow.addColorStop(1, 'rgba(255, 110, 80, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 170, 0, Math.PI * 2);
  ctx.fill();

  // Warm sunset cloud bands
  ctx.fillStyle = 'rgba(255, 195, 135, 0.22)';
  for (let i = 0; i < 24; i++) {
    const cx = (i * 137) % 1024;
    const cy = 220 + ((i * 53) % 150);
    const rw = 80 + ((i * 29) % 110);
    const rh = 12 + ((i * 11) % 16);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function setupGoldenHourLighting(scene) {
  // Exponential horizon fog blending distant skyscrapers into warm sunset haze
  scene.fog = new THREE.FogExp2(0xe2886b, 0.0021);

  // Procedural Sky Dome
  const skyGeo = new THREE.SphereGeometry(720, 32, 20);
  const skyMat = new THREE.MeshBasicMaterial({
    map: createSunsetSkyTexture(),
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyDome);

  // Layer 1: Hemisphere Light (warm coral-gold sky, deep slate asphalt bounce)
  const hemiLight = new THREE.HemisphereLight(0xffc696, 0x2a354d, 0.96);
  hemiLight.position.set(0, 120, 0);
  scene.add(hemiLight);

  // Layer 2: Low-Angle Golden Hour Directional Sun Light
  const sunLight = new THREE.DirectionalLight(0xffae52, 1.38);
  sunLight.position.set(140, 95, -180);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 480;
  const d = 140;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  // Layer 3: Dynamic Accent Lights (Police Siren Strobe & Street Glow)
  const sirenRedLight = new THREE.PointLight(0xff1e42, 2.4, 38);
  sirenRedLight.position.set(-4, 4, 16);
  scene.add(sirenRedLight);

  const sirenBlueLight = new THREE.PointLight(0x00b4ff, 2.4, 38);
  sirenBlueLight.position.set(4, 4, 18);
  scene.add(sirenBlueLight);

  return {
    skyDome,
    hemiLight,
    sunLight,
    sirenRedLight,
    sirenBlueLight,
    update(time, focusPos) {
      if (focusPos) {
        skyDome.position.x = focusPos.x;
        skyDome.position.z = focusPos.z;
      }
      const pulse = Math.sin(time * 14);
      sirenRedLight.intensity = pulse > 0 ? 2.8 : 0.4;
      sirenBlueLight.intensity = pulse <= 0 ? 2.8 : 0.4;
    },
  };
}
