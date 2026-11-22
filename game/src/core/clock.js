// Solara Bay: Neon Dynasty (V5) — Fixed-Timestep Simulation Clock & Visibility Pause Controller
// Separates deterministic fixed-step update(dt) from render() and pauses on tab blur or hidden state.

import { clamp } from './math.js';

export function createSimulationClock(options = {}) {
  const fixedDt = options.fixedDt || 1 / 60;
  const maxFrameDelta = options.maxFrameDelta || 0.05;
  let accumulator = 0;
  let simTime = options.initialSimTime ?? 1.25;
  let paused = false;
  let inGameMinutes = 17 * 60 + 45; // 17:45 Golden Hour

  function bindVisibilityEvents(targetWindow, targetDoc) {
    if (!targetWindow || !targetDoc) return;
    targetDoc.addEventListener('visibilitychange', () => {
      paused = targetDoc.hidden;
      if (paused) accumulator = 0;
    });
    targetWindow.addEventListener('blur', () => {
      paused = true;
      accumulator = 0;
    });
    targetWindow.addEventListener('focus', () => {
      paused = false;
    });
  }

  function advance(rawDeltaSeconds, stepCallback) {
    if (paused) return 0;
    const clamped = clamp(Number.isFinite(rawDeltaSeconds) ? rawDeltaSeconds : 0, 0, maxFrameDelta);
    accumulator += clamped;
    let steps = 0;
    while (accumulator >= fixedDt && steps < 6) {
      simTime += fixedDt;
      inGameMinutes = (inGameMinutes + fixedDt * 0.5) % 1440;
      if (stepCallback) stepCallback(fixedDt, simTime);
      accumulator -= fixedDt;
      steps++;
    }
    return steps;
  }

  function formatClock() {
    const hrs = Math.floor(inGameMinutes / 60) % 24;
    const mins = Math.floor(inGameMinutes % 60);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  function reset(initialSimTime = 1.25) {
    accumulator = 0;
    simTime = initialSimTime;
    inGameMinutes = 17 * 60 + 45;
    paused = false;
  }

  return {
    fixedDt,
    getSimTime: () => simTime,
    isPaused: () => paused,
    setPaused(v) {
      paused = Boolean(v);
      if (paused) accumulator = 0;
    },
    bindVisibilityEvents,
    advance,
    formatClock,
    reset,
  };
}
