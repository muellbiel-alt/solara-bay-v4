// Solara Bay: Neon Dynasty (V6) — Headless Open-World Simulation, Asset & Determinism Verification Suite
// Runs 600+ fixed-timestep frames via node:test to verify zero NaNs, world bounds enforcement,
// wanted pursuit & mission progression, visibility pause, full deterministic state reset,
// offline compliance across game/src/, and V6 VFX/world module integrity.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  advanceMissionStageSim,
  createSimState,
  restartSimulation,
  stepSimulation,
} from '../game/src/core/simEngine.js';
import { createSimulationClock } from '../game/src/core/clock.js';
import { createPRNG } from '../game/src/core/random.js';

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url));

function assertFiniteEntity(obj, label) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'number') {
      assert.equal(Number.isFinite(v), true, `${label}.${k} must be finite (got ${v})`);
    }
  }
}

function collectFilesRecursive(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'vendor') continue;
      out.push(...collectFilesRecursive(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

test('Mulberry32 PRNG produces identical sequences for identical seeds and stays in [0, 1)', () => {
  const rngA = createPRNG(42);
  const rngB = createPRNG(42);
  for (let i = 0; i < 200; i++) {
    const a = rngA.next();
    const b = rngB.next();
    assert.equal(a, b);
    assert.ok(a >= 0 && a < 1, `PRNG sample out of bounds: ${a}`);
  }
  const rngSkyA = createPRNG(602);
  const rngSkyB = createPRNG(602);
  for (let i = 0; i < 64; i++) {
    assert.equal(rngSkyA.range(10, 120), rngSkyB.range(10, 120));
  }
});

test('600 frames of fixed-timestep driving, nitro, and police pursuit stay finite and inside world bounds', () => {
  const state = createSimState(42);
  const dt = 1 / 60;

  for (let frame = 0; frame < 600; frame++) {
    const steer = Math.sin(frame * 0.05) * 0.65;
    const nitro = frame % 120 < 45;
    const handbrake = frame % 180 === 90;
    stepSimulation(state, dt, { throttle: 1, steer, nitro, handbrake });

    assertFiniteEntity(state.hero, `hero@frame${frame}`);
    assertFiniteEntity(state.helicopter, `helicopter@frame${frame}`);
    assert.ok(Math.abs(state.hero.x) <= state.halfWorld, 'Hero x within world bounds');
    assert.ok(Math.abs(state.hero.z) <= state.halfWorld, 'Hero z within world bounds');
    assert.equal(state.hero.y, 0, 'Hero vehicle stays grounded at y = 0.00');

    for (const c of state.cruisers) {
      assertFiniteEntity(c, `cruiser_${c.callsign}@frame${frame}`);
      assert.ok(Math.abs(c.x) <= state.halfWorld, 'Cruiser x within world bounds');
      assert.ok(Math.abs(c.z) <= state.halfWorld, 'Cruiser z within world bounds');
    }

    for (const t of state.traffic) {
      assertFiniteEntity(t, `traffic_${t.id}@frame${frame}`);
      assert.ok(Math.abs(t.x) <= state.halfWorld, 'Traffic x within world bounds');
      assert.ok(Math.abs(t.z) <= state.halfWorld, 'Traffic z within world bounds');
    }
  }

  assert.equal(state.ticks, 600);
  assert.ok(state.time > 10.0);
});

test('Mission progression and restartSimulation cleanly advance and reset full career state', () => {
  const state = createSimState(42);
  const initialX = state.hero.x;
  const initialZ = state.hero.z;
  const initialCash = state.cash;

  for (let i = 0; i < 120; i++) {
    stepSimulation(state, 1 / 60, { throttle: 1, steer: 0.25, nitro: true });
  }
  advanceMissionStageSim(state); // Stage 3 -> 4
  assert.equal(state.missionStage, 4);
  advanceMissionStageSim(state); // Completes Mission 6 -> Mission 7 + payout
  assert.equal(state.activeMissionId, 7);
  assert.ok(state.cash > initialCash);

  restartSimulation(state);
  assert.equal(state.ticks, 0);
  assert.equal(state.activeMissionId, 6);
  assert.equal(state.missionStage, 3);
  assert.equal(state.wantedStars, 4);
  assert.equal(state.cash, initialCash);
  assert.equal(state.hero.x, initialX);
  assert.equal(state.hero.z, initialZ);
});

test('SimulationClock clamps frame spikes and pauses cleanly on blur', () => {
  const clock = createSimulationClock({ fixedDt: 1 / 60, maxFrameDelta: 0.05, initialSimTime: 0 });
  let steps = 0;
  clock.advance(2.5, () => {
    steps++;
  });
  assert.equal(steps, 3, 'Large 2.5s frame spike is clamped to 0.05s (3 fixed steps)');

  clock.setPaused(true);
  const pausedSteps = clock.advance(0.05, () => {
    steps++;
  });
  assert.equal(pausedSteps, 0, 'Zero simulation steps execute while paused');
});

test('V6 game assets stay 100% offline and include additive VFX, rooftop details, catenary lanterns, and 3D garage textures', () => {
  const gameFiles = collectFilesRecursive(join(ROOT_DIR, 'game'));
  assert.ok(gameFiles.length >= 35, 'Expected modular game/ source tree');

  for (const filePath of gameFiles) {
    const content = readFileSync(filePath, 'utf8');
    assert.equal(/https?:\/\//i.test(content), false, `Unexpected external URL in ${filePath}`);
  }

  const trailsSrc = readFileSync(join(ROOT_DIR, 'game/src/effects/trails.js'), 'utf8');
  assert.match(trailsSrc, /AdditiveBlending/, 'Nitro plasma and taillight trails use AdditiveBlending');
  assert.match(trailsSrc, /depthWrite:\s*false/, 'Nitro plasma disables depthWrite');

  const reflectionsSrc = readFileSync(join(ROOT_DIR, 'game/src/effects/reflections.js'), 'utf8');
  assert.match(reflectionsSrc, /AdditiveBlending/, 'Wet-asphalt reflections use AdditiveBlending');

  const propsSrc = readFileSync(join(ROOT_DIR, 'game/src/world/props.js'), 'utf8');
  assert.match(propsSrc, /CatmullRomCurve3/, 'Night market lanterns hang on catenary cables');
  assert.equal(/TorusGeometry\(13\.5/.test(propsSrc), false, 'Abstract floating sky rings removed');

  const garageSrc = readFileSync(join(ROOT_DIR, 'game/src/world/garage3d.js'), 'utf8');
  assert.match(garageSrc, /atlas\.garageWall/, 'Garage walls use textured industrial material');
  assert.match(garageSrc, /atlas\.toolCabinet/, 'Garage includes textured rolling tool chests');
  assert.match(garageSrc, /atlas\.hydraulicPillar/, 'Garage includes textured hydraulic lift columns');

  const charsSrc = readFileSync(join(ROOT_DIR, 'game/src/entities/characters3d.js'), 'utf8');
  assert.match(charsSrc, /shoulderYoke/, 'Character rigs include structured jacket shoulders');
  assert.match(charsSrc, /AdditiveBlending/, 'Character muzzle flashes use additive starburst');
});
