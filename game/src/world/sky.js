// Solara Bay: Neon Dynasty (V5) — Golden-Hour Sunset Sky Dome & Tuned Coastal Horizon Fog
// Uses reduced eastern fog density (0.0011) so the turquoise ocean and coastal skyline stay vivid.

const THREE = window.THREE;

export function createSunsetSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich tropical golden-hour gradient: deep indigo zenith -> royal violet -> coral -> blazing gold horizon
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#121838');
  grad.addColorStop(0.22, '#342664');
  grad.addColorStop(0.44, '#8c3b6e');
  grad.addColorStop(0.64, '#e86458');
  grad.addColorStop(0.84, '#ffa242');
  grad.addColorStop(1.0, '#ffe285');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Glowing golden-hour sun disc & radial halo on the horizon
  const sunX = 520;
  const sunY = 386;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 175);
  sunGlow.addColorStop(0, 'rgba(255, 253, 228, 1)');
  sunGlow.addColorStop(0.24, 'rgba(255, 212, 112, 0.88)');
  sunGlow.addColorStop(0.58, 'rgba(255, 128, 78, 0.36)');
  sunGlow.addColorStop(1, 'rgba(255, 110, 80, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 175, 0, Math.PI * 2);
  ctx.fill();

  // Warm illuminated sunset cloud bands
  ctx.fillStyle = 'rgba(255, 198, 138, 0.22)';
  for (let i = 0; i < 24; i++) {
    const cx = (i * 137) % 1024;
    const cy = 216 + ((i * 53) % 150);
    const rw = 82 + ((i * 29) % 110);
    const rh = 11 + ((i * 11) % 16);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createSkyDomeAndFog(scene) {
  // Light atmospheric sunset fog (0.0011) that preserves crisp turquoise ocean colors on the right
  scene.fog = new THREE.FogExp2(0xdf886a, 0.0011);

  const skyGeo = new THREE.SphereGeometry(760, 32, 20);
  const skyMat = new THREE.MeshBasicMaterial({
    map: createSunsetSkyTexture(),
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyDome);
  return skyDome;
}
