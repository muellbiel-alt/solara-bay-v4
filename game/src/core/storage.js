// Solara Bay: Neon Dynasty (V4) — 3-Slot localStorage Save/Load & Career Progression Manager

const STORAGE_KEY = 'solara_bay_neon_dynasty_v4_saves';

const DEFAULT_SLOTS = [
  {
    slot: 1,
    active: true,
    title: 'SLOT 1 · ACT III — CROWN JEWEL CONVOY',
    district: 'Palm Boulevard',
    cash: 148650,
    respect: 4850,
    rank: 'RANK 7 · KINGPIN',
    missionsDone: 5,
    totalMissions: 10,
    completionPct: 74.5,
    timestamp: '17:45',
    stats: {
      carsStolen: 46,
      copsEscaped: 19,
      syndicateEliminated: 68,
      kmDriven: 84.6,
    },
    upgrades: {
      engine: 3,
      handling: 3,
      armor: 2,
      nitro: 3,
      paint: '#e83128',
    },
  },
  {
    slot: 2,
    active: false,
    title: 'SLOT 2 · ACT II — NIGHT MARKET HEAT',
    district: 'Harbor Docks',
    cash: 64200,
    respect: 2400,
    rank: 'RANK 4 · ENFORCER',
    missionsDone: 3,
    totalMissions: 10,
    completionPct: 44.0,
    timestamp: '19:15',
    stats: {
      carsStolen: 22,
      copsEscaped: 9,
      syndicateEliminated: 31,
      kmDriven: 38.2,
    },
    upgrades: {
      engine: 2,
      handling: 2,
      armor: 1,
      nitro: 1,
      paint: '#19c9e8',
    },
  },
  {
    slot: 3,
    active: false,
    title: 'SLOT 3 · ACT I — DOCKSIDE IGNITION',
    district: 'Terminal 4 Pier',
    cash: 18500,
    respect: 650,
    rank: 'RANK 2 · WHEELMAN',
    missionsDone: 1,
    totalMissions: 10,
    completionPct: 18.5,
    timestamp: '16:30',
    stats: {
      carsStolen: 7,
      copsEscaped: 3,
      syndicateEliminated: 8,
      kmDriven: 12.4,
    },
    upgrades: {
      engine: 1,
      handling: 1,
      armor: 1,
      nitro: 1,
      paint: '#ff9d1a',
    },
  },
];

export function createStorageManager() {
  let slots = structuredClone(DEFAULT_SLOTS);

  function loadAll() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 3) {
          slots = parsed;
        }
      }
    } catch {
      // Fallback to default deterministic slots in restricted contexts
    }
    return slots;
  }

  function persistAll() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    } catch {
      // Ignore storage quota errors in headless mode
    }
  }

  function saveToSlot(slotNumber, gameState) {
    const idx = slots.findIndex((s) => s.slot === slotNumber);
    if (idx === -1) return null;
    slots.forEach((s, i) => {
      s.active = i === idx;
    });
    const target = slots[idx];
    target.cash = gameState.cash ?? target.cash;
    target.respect = gameState.respect ?? target.respect;
    target.district = gameState.district ?? target.district;
    target.missionsDone = gameState.missionsDone ?? target.missionsDone;
    target.completionPct = Number(
      Math.min(100, 15 + target.missionsDone * 8.5 + (gameState.upgradesLevelSum || 10) * 1.7).toFixed(1)
    );
    target.timestamp = gameState.clock ?? '17:48';
    if (gameState.upgrades) {
      target.upgrades = { ...target.upgrades, ...gameState.upgrades };
    }
    if (gameState.stats) {
      target.stats = { ...target.stats, ...gameState.stats };
    }
    persistAll();
    return target;
  }

  function loadFromSlot(slotNumber) {
    loadAll();
    const target = slots.find((s) => s.slot === slotNumber) || slots[0];
    slots.forEach((s) => {
      s.active = s.slot === target.slot;
    });
    persistAll();
    return structuredClone(target);
  }

  function resetCareer() {
    slots = structuredClone(DEFAULT_SLOTS);
    persistAll();
    return structuredClone(slots[0]);
  }

  loadAll();

  return {
    getSlots: () => slots,
    saveToSlot,
    loadFromSlot,
    resetCareer,
  };
}
