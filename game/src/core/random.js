// Solara Bay: Neon Dynasty (V4) — Deterministic Mulberry32 PRNG

export function createPRNG(seed = 42) {
  let state = (seed >>> 0) || 42;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) {
      return min + (max - min) * this.next();
    },
    int(min, max) {
      return Math.floor(this.range(min, max + 1));
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
    reset(newSeed = 42) {
      state = (newSeed >>> 0) || 42;
    },
  };
}

export const worldRng = createPRNG(42);
