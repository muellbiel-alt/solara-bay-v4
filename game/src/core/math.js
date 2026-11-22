// Solara Bay: Neon Dynasty (V5) — Deterministic Vector, Angle & World Bounds Math Utilities

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

export function wrapAngle(rad) {
  let a = rad % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function lerpAngle(fromRad, toRad, t) {
  const diff = wrapAngle(toRad - fromRad);
  return wrapAngle(fromRad + diff * clamp(t, 0, 1));
}

export function dist2D(x1, z1, x2, z2) {
  return Math.hypot(x2 - x1, z2 - z1);
}

export function clampWorldPosition(pos, halfExtent = 440) {
  pos.x = clamp(pos.x, -halfExtent, halfExtent);
  pos.z = clamp(pos.z, -halfExtent, halfExtent);
  if (!Number.isFinite(pos.x)) pos.x = 0;
  if (!Number.isFinite(pos.y)) pos.y = 0;
  if (!Number.isFinite(pos.z)) pos.z = 0;
  return pos;
}

export function isPointInBounds(x, z, bounds) {
  return x >= bounds.xMin && x <= bounds.xMax && z >= bounds.zMin && z <= bounds.zMax;
}
