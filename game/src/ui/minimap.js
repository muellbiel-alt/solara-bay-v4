// Solara Bay: Neon Dynasty (V5) — High-Contrast Coastal Minimap Radar & District Telemetry Renderer

import { DISTRICTS } from '../core/config.js';

export function renderCoastalMinimap(canvas, playerPos, playerHeading, cruisers, time) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = '#0e1729';
  ctx.fillRect(0, 0, W, H);

  const scale = 0.72;
  const cx = W / 2;
  const cy = H / 2;
  const px = playerPos ? playerPos.x : 0;
  const pz = playerPos ? playerPos.z : 0;

  // Golden Beach & Vibrant Turquoise Ocean on East Side
  const sandScreenX = cx + (15 - px) * scale;
  ctx.fillStyle = '#e5c185';
  ctx.fillRect(sandScreenX, 0, W, H);
  const oceanScreenX = cx + (31 - px) * scale;
  ctx.fillStyle = '#08a4c4';
  ctx.fillRect(oceanScreenX, 0, W, H);

  // City blocks & road grid
  const avenues = [0, -76, -152, -228];
  const crossStreets = [-240, -160, -80, 0, 80, 160, 240];

  ctx.fillStyle = '#212f4a';
  for (const ax of avenues) {
    for (const cz of crossStreets) {
      const bx = cx + (ax - 38 - px) * scale;
      const bz = cy + (cz - 36 - pz) * scale;
      ctx.fillRect(bx - 16, bz - 20, 32, 40);
    }
  }

  ctx.fillStyle = '#3b4c6e';
  for (const ax of avenues) {
    const rx = cx + (ax - px) * scale;
    ctx.fillRect(rx - 5.5, 0, 11, H);
  }
  for (const cz of crossStreets) {
    const rz = cy + (cz - pz) * scale;
    ctx.fillRect(0, rz - 4.5, oceanScreenX, 9);
  }

  // Active GPS Route Line (Amber-Gold)
  ctx.strokeStyle = '#ffb830';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - 54);
  ctx.lineTo(cx - 32, cy - 54);
  ctx.stroke();

  // Key Map Icons (M = Mission, G = Costa Customs, H = Safehouse)
  const mapIcons = [
    { label: 'M', x: cx, y: 22, bg: '#ffb830', fg: '#090d16' },
    { label: 'G', x: 24, y: cy + 26, bg: '#24e5ff', fg: '#090d16' },
    { label: 'H', x: cx + 20, y: cy - 36, bg: '#2ee889', fg: '#090d16' },
  ];
  for (const ic of mapIcons) {
    ctx.fillStyle = ic.bg;
    ctx.beginPath();
    ctx.arc(ic.x, ic.y, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ic.fg;
    ctx.font = '900 9.5px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ic.label, ic.x, ic.y);
  }

  // Police Cruiser Red/Blue Radar Blips
  const pulseRed = Math.sin(time * 16) > 0;
  for (const c of cruisers) {
    const bx = Math.max(11, Math.min(W - 11, cx + (c.position.x - px) * scale));
    const bz = Math.max(11, Math.min(H - 11, cy + (c.position.z - pz) * scale));
    ctx.fillStyle = pulseRed ? '#ff2e4c' : '#24e5ff';
    ctx.beginPath();
    ctx.arc(bx, bz, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  // Player Directional Arrow in Center
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-playerHeading + Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -8.5);
  ctx.lineTo(6, 6.5);
  ctx.lineTo(0, 3.2);
  ctx.lineTo(-6, 6.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

export function resolveActiveDistrict(playerPos) {
  if (!playerPos) return DISTRICTS[0];
  for (const d of DISTRICTS) {
    if (
      playerPos.x >= d.bounds.xMin &&
      playerPos.x <= d.bounds.xMax &&
      playerPos.z >= d.bounds.zMin &&
      playerPos.z <= d.bounds.zMax
    ) {
      return d;
    }
  }
  return DISTRICTS[0];
}
