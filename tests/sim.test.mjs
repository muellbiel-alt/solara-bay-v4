// Solara Bay: Neon Dynasty (V5) — Headless Open-World Simulation & Determinism Verification Suite
// Runs 600+ fixed-timestep frames via node:test to verify zero NaNs, world bounds enforcement,
// wanted pursuit & mission progression, visibility pause, and full deterministic state reset.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceMissionStageSim,
  createSimState,
  restartSimulation,
  stepSimulation,
} from '../game/src/core/simEngine.js';
import { createSimulationClock } from '../game/src/core/clock.js';
import { createPRNG } from '../game/src/core/random.js';

function assertFiniteEntity(obj, label) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'number') {
      assert.equal(Number.isFinite(v), true, `${label}.${k} must be finite (got ${v})`);
    }
  }
}

test('Mulberry32 PRNG produces identical sequences for identical seeds', () => {
  const rngA = createPRNG(42);
  const rngB = createPRNG(42);
  for (let i = 0; i < 200; i++) {
    assert.equal(rngA.next(), rngB.next());
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
