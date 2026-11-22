// Solara Bay: Neon Dynasty (V4) — Costa Customs 3D Garage Upgrade Shop, Armory & Safehouse Economy

export const PAINT_SWATCHES = [
  { id: 'solar_crimson', name: 'SOLAR CRIMSON', hex: '#e83128' },
  { id: 'cobalt_neon', name: 'COBALT NEON', hex: '#19c9e8' },
  { id: 'amber_gold', name: 'SOLARA GOLD', hex: '#ff9d1a' },
  { id: 'emerald_viper', name: 'EMERALD VIPER', hex: '#1fd678' },
];

export const GARAGE_UPGRADES = [
  { id: 'twin_turbo', badge: '+24 KM/H', name: 'STAGE 3 TWIN-TURBO V8 ECU', price: 14500, stat: 'topSpeed', owned: true },
  { id: 'coilover_kit', badge: '+18% GRIP', name: 'APEX CARBON COILOVER SUSPENSION', price: 9800, stat: 'handling', owned: true },
  { id: 'kevlar_armor', badge: '+50% HULL', name: 'SYNDICATE KEVLAR CHASSIS PLATING', price: 16200, stat: 'armor', owned: false, selected: true },
  { id: 'direct_nitro', badge: '2X SURGE', name: 'DIRECT-PORT NITROUS INJECTION', price: 12400, stat: 'nitro', owned: true },
  { id: 'kobra_ammo', badge: 'ARMORY', name: 'KOBRA SMG + BREACHER 12G CRATE', price: 3200, stat: 'weapons', owned: true },
  { id: 'heavy_vest', badge: '100 ARM', name: 'TACTICAL BALLISTIC BODY ARMOR', price: 1800, stat: 'vest', owned: false },
];

export function createEconomySystem(storageManager, audioSynth) {
  let cash = 148650;
  let respect = 4850;
  let activePaintHex = '#e83128';
  const upgrades = structuredClone(GARAGE_UPGRADES);

  const vehicleStats = {
    topSpeed: { label: 'TOP SPEED', pct: 92, valText: '168 KM/H' },
    handling: { label: 'HANDLING', pct: 88, valText: 'S-CLASS' },
    armor: { label: 'ARMOR HULL', pct: 84, valText: 'STAGE 2' },
    nitro: { label: 'NITRO SYSTEM', pct: 95, valText: 'TWIN-N2O' },
  };

  function selectUpgrade(upgradeId) {
    for (const u of upgrades) {
      u.selected = u.id === upgradeId;
    }
  }

  function installSelectedUpgrade(heroCar) {
    const target = upgrades.find((u) => u.selected) || upgrades.find((u) => !u.owned);
    if (!target || target.owned || cash < target.price) return false;

    cash -= target.price;
    target.owned = true;
    respect += 350;

    if (target.stat === 'armor') {
      vehicleStats.armor.pct = 100;
      vehicleStats.armor.valText = 'MAXED';
      if (heroCar) {
        heroCar.userData.maxHealth = 160;
        heroCar.userData.health = 160;
      }
    }
    if (audioSynth) audioSynth.playUpgradeInstall();
    storageManager.saveToSlot(1, { cash, respect });
    return true;
  }

  function applyPaint(hex, heroCar, policeSystem) {
    activePaintHex = hex;
    if (heroCar) {
      heroCar.userData.setPaint(hex);
    }
    if (policeSystem) {
      policeSystem.setWantedStars(0);
    }
    if (audioSynth) audioSynth.playUpgradeInstall();
  }

  return {
    getCash: () => cash,
    setCash: (v) => { cash = v; },
    getRespect: () => respect,
    getActivePaint: () => activePaintHex,
    getUpgrades: () => upgrades,
    getVehicleStats: () => vehicleStats,
    selectUpgrade,
    installSelectedUpgrade,
    applyPaint,
  };
}
