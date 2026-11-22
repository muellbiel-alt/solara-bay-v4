// Solara Bay: Neon Dynasty (V6) — Natural Golden-Hour Sunset Sky Dome, Sun Disc & Horizon Scatter
// Aligns atmospheric gradients accurately to the sphere equator (y = 256), paints a warm golden-coral
// sunset sun disc + wide horizon atmospheric glow over the coastal bay, and layers wispy Mulberry32 dusk clouds.

const THREE = window.THREE;
import { createPRNG } from '../core/random.js';

export function createSunsetSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const rng = createPRNG(602);

  // Equator / horizon sits at y = 256 (0.50). Map rich dusk sunset transition across upper hemisphere (0.0 .. 0.52).
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#12183b');
  grad.addColorStop(0.16, '#28255c');
  grad.addColorStop(0.28, '#5f356d');
  grad.addColorStop(0.38, '#b84c6d');
  grad.addColorStop(0.45, '#ef7b5c');
  grad.addColorStop(0.495, '#ffba66');
  grad.addColorStop(0.525, '#ffe09a');
  grad.addColorStop(0.64, '#d47c64');
  grad.addColorStop(1.0, '#1e2c48');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Place natural sunset sun above the coastal turquoise horizon right of Palm Boulevard (-Z / +X azimuth: u ≈ 0.69)
  const sunX = 708;
  const sunY = 231;

  // Wide warm golden-coral atmospheric horizon bloom band wrapping softly around the sun azimuth
  const horizonGlow = ctx.createRadialGradient(sunX, 250, 22, sunX, 250, 235);
  horizonGlow.addColorStop(0.0, 'rgba(255, 214, 128, 0.62)');
  horizonGlow.addColorStop(0.35, 'rgba(255, 146, 86, 0.36)');
  horizonGlow.addColorStop(0.7, 'rgba(235, 92, 86, 0.14)');
  horizonGlow.addColorStop(1.0, 'rgba(235, 92, 86, 0.0)');
  ctx.save();
  ctx.translate(sunX, 250);
  ctx.scale(1.55, 0.48);
  ctx.translate(-sunX, -250);
  ctx.fillStyle = horizonGlow;
  ctx.beginPath();
  ctx.arc(sunX, 250, 235, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Layered solar corona + crisp natural golden-coral sunset sun disc
  const corona = ctx.createRadialGradient(sunX, sunY, 16, sunX, sunY, 82);
  corona.addColorStop(0.0, 'rgba(255, 248, 214, 0.88)');
  corona.addColorStop(0.28, 'rgba(255, 198, 102, 0.56)');
  corona.addColorStop(0.62, 'rgba(255, 118, 76, 0.22)');
  corona.addColorStop(1.0, 'rgba(255, 96, 76, 0.0)');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 82, 0, Math.PI * 2);
  ctx.fill();

  const discGrad = ctx.createLinearGradient(sunX, sunY - 19, sunX, sunY + 19);
  discGrad.addColorStop(0.0, '#fff9d6');
  discGrad.addColorStop(0.55, '#ffc85c');
  discGrad.addColorStop(1.0, '#ff7b47');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 18.5, 0, Math.PI * 2);
  ctx.fill();

  // Secondary subtle warm western afterglow band so Shot 4 skyline hub also catches rich horizon light
  const westGlow = ctx.createRadialGradient(220, 248, 12, 220, 248, 180);
  westGlow.addColorStop(0.0, 'rgba(255, 198, 124, 0.34)');
  westGlow.addColorStop(0.55, 'rgba(255, 118, 92, 0.14)');
  westGlow.addColorStop(1.0, 'rgba(255, 100, 84, 0.0)');
  ctx.fillStyle = westGlow;
  ctx.beginPath();
  ctx.arc(220, 248, 180, 0, Math.PI * 2);
  ctx.fill();

  // Deterministic wispy golden-hour cirrus & coastal dusk cloud streaks
  function drawCloudStreak(cx, cy, rw, rh, topColor, rimColor) {
    for (let p = -2; p <= 2; p++) {
      const px = cx + p * (rw * 0.34);
      const py = cy + Math.abs(p) * (rh * 0.16);
      const prx = rw * (0.58 - Math.abs(p) * 0.1);
      const pry = rh * (0.95 - Math.abs(p) * 0.16);

      // Soft dusk rose-violet upper cloud body
      const topG = ctx.createRadialGradient(px, py - pry * 0.15, 2, px, py, prx);
      topG.addColorStop(0.0, topColor);
      topG.addColorStop(0.65, topColor.replace(/[\d.]+\)$/, '0.09)'));
      topG.addColorStop(1.0, 'rgba(120, 58, 96, 0)');
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, Math.max(0.14, pry / prx));
      ctx.translate(-px, -py);
      ctx.fillStyle = topG;
      ctx.beginPath();
      ctx.arc(px, py, prx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Sunlit golden-peach underside highlight
      const rimG = ctx.createRadialGradient(px, py + pry * 0.35, 1, px, py + pry * 0.35, prx * 0.9);
      rimG.addColorStop(0.0, rimColor);
      rimG.addColorStop(0.6, rimColor.replace(/[\d.]+\)$/, '0.08)'));
      rimG.addColorStop(1.0, 'rgba(255, 190, 120, 0)');
      ctx.save();
      ctx.translate(px, py + pry * 0.35);
      ctx.scale(1, Math.max(0.11, (pry * 0.65) / prx));
      ctx.translate(-px, -(py + pry * 0.35));
      ctx.fillStyle = rimG;
      ctx.beginPath();
      ctx.arc(px, py + pry * 0.35, prx * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 22; i++) {
    const cx = rng.range(24, 1000);
    const cy = rng.range(122, 232);
    const rw = rng.range(54, 128);
    const rh = rng.range(7, 15);
    const nearSun = Math.abs(cx - sunX) < 190;
    const topColor = nearSun ? 'rgba(210, 102, 108, 0.22)' : 'rgba(94, 52, 106, 0.24)';
    const rimColor = nearSun ? 'rgba(255, 224, 148, 0.34)' : 'rgba(255, 174, 120, 0.22)';
    drawCloudStreak(cx, cy, rw, rh, topColor, rimColor);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createSkyDomeAndFog(scene) {
  // Light atmospheric sunset fog (0.0011) preserving crisp turquoise ocean & coastal skyline depth
  scene.fog = new THREE.FogExp2(0xe38f6e, 0.0011);

  const skyGeo = new THREE.SphereGeometry(760, 40, 24);
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
