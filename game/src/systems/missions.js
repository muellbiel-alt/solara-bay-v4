// Solara Bay: Neon Dynasty (V4) — 10-Mission Syndicate Story Director & Dialogue System

import { STORY_MISSIONS } from '../core/config.js';

export function createMissionSystem() {
  const missions = structuredClone(STORY_MISSIONS);
  let currentMissionId = 6; // Mission 6/10: Crown Jewel Convoy active by default

  function getActiveMission() {
    return missions.find((m) => m.id === currentMissionId) || missions[5];
  }

  function setActiveMission(id) {
    const found = missions.find((m) => m.id === id);
    if (found) {
      currentMissionId = found.id;
    }
    return getActiveMission();
  }

  function completeCurrentStage() {
    const m = getActiveMission();
    if (m.stage < m.totalStages) {
      m.stage += 1;
    } else {
      m.completed = true;
      m.rating = 'GOLD';
      const nextM = missions.find((item) => item.id === m.id + 1);
      if (nextM) {
        nextM.rating = 'ACTIVE';
        currentMissionId = nextM.id;
      }
    }
    return getActiveMission();
  }

  return {
    missions,
    getActiveMission,
    setActiveMission,
    completeCurrentStage,
  };
}
