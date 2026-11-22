// Solara Bay: Neon Dynasty (V5) — Deterministic ?shot= Staging Director for Real WebGL Captures
// Stages all 4 required screenshots (1-chase-cover.png, 2-firefight.png, 3-garage.png, 4-hub-map.png)
// with sculpted vehicles, wet-asphalt siren reflections, high-contrast blasts, and turquoise ocean clarity.

export function applyDeterministicShotStage(shotParam, ctx) {
  const {
    camera,
    heroCar,
    playerRig,
    policeSystem,
    helicopter,
    missionSystem,
    combatSystem,
    reflectionSystem,
    hud,
    menus,
    setGameMode,
  } = ctx;

  const shot = (shotParam || 'chase').toLowerCase();

  if (shot === 'chase' || shot === '1' || shot === 'cover' || shot === 'start') {
    // Shot 1: 1-chase-cover.png — 4★ Police Chase on Palm Boulevard at Golden Hour
    setGameMode('chase');
    menus.setScreenMode('chase');
    playerRig.visible = false;
    heroCar.visible = true;

    // Sculpted Kestrel GT in dynamic 3/4 drift showing fastback greenhouse, flared fenders, rims & 3-layer nitro
    heroCar.position.set(1.15, 0, -24.5);
    heroCar.rotation.y = Math.PI + 0.34;
    heroCar.userData.speed = 138;
    heroCar.userData.gear = 'S5';
    heroCar.userData.nitro = 92;
    heroCar.userData.setNitroActive(true);

    // 3 pursuing SBPD Interceptors + 1 roadblock cruiser ahead
    const c = policeSystem.cruisers;
    if (c[0]) {
      c[0].position.set(-3.1, 0, -21.2);
      c[0].rotation.y = Math.PI - 0.22;
    }
    if (c[1]) {
      c[1].position.set(5.2, 0, -26.8);
      c[1].rotation.y = Math.PI + 0.16;
    }
    if (c[2]) {
      c[2].position.set(-4.2, 0, -56.0);
      c[2].rotation.y = 1.25;
    }
    if (c[3]) {
      c[3].position.set(-1.4, 0, -34.0);
      c[3].rotation.y = Math.PI - 0.08;
    }

    if (combatSystem.explosions[0]) {
      combatSystem.explosions[0].position.set(-4.6, 0, -53.5);
    }

    policeSystem.setWantedStars(4);
    helicopter.setVisible(true);
    helicopter.mesh.position.set(-0.5, 13.4, -49.0);
    helicopter.mesh.rotation.y = 0.12;

    const m = missionSystem.setActiveMission(6);
    hud.renderMission(m);
    hud.setReticleVisible(false);
    hud.setContextPrompt(false);

    // Dynamic chase framing showing hero coupe, cruisers, helicopter, hotels on left, and turquoise ocean & curved palms on right
    camera.position.set(2.15, 3.65, -14.6);
    camera.lookAt(1.35, 2.15, -48.0);
  } else if (shot === 'firefight' || shot === '2' || shot === 'play') {
    // Shot 2: 2-firefight.png — On-Foot Firefight & Carjacking at Harbor Docks / Night Market
    setGameMode('onfoot');
    menus.setScreenMode('onfoot');
    document.getElementById('sky-brand-badge').classList.add('hidden');

    playerRig.visible = true;
    playerRig.position.set(-75.4, 0, 125.2);
    playerRig.rotation.y = Math.PI + 0.04;
    playerRig.userData.setAimingPose(true, true);

    heroCar.visible = true;
    heroCar.position.set(-71.2, 0, 120.4);
    heroCar.rotation.y = Math.PI - 0.56;
    heroCar.userData.speed = 0;
    heroCar.userData.setNitroActive(false);

    const c = policeSystem.cruisers;
    if (c[0]) {
      c[0].position.set(-76.0, 0, 99.2);
      c[0].rotation.y = 1.42;
    }

    // Keep Wanted consistently at 4★ across both active gameplay shots
    policeSystem.setWantedStars(4);
    combatSystem.selectWeapon(3);
    const m = missionSystem.setActiveMission(4);
    hud.renderMission(m);
    hud.setReticleVisible(true);
    hud.setContextPrompt(true, 'JACK KESTREL GT');

    camera.position.set(-73.9, 2.52, 130.5);
    camera.lookAt(-75.4, 1.65, 102.0);
  } else if (shot === 'garage' || shot === '3') {
    // Shot 3: 3-garage.png — Costa Customs 3D Garage & Armory Turntable
    setGameMode('garage');
    menus.setScreenMode('garage');
    playerRig.visible = false;
    heroCar.visible = true;

    heroCar.position.set(-182.4, 0.22, 120.0);
    heroCar.rotation.y = 2.32;
    heroCar.userData.speed = 0;
    heroCar.userData.setNitroActive(false);

    camera.position.set(-176.6, 2.75, 126.2);
    camera.lookAt(-180.4, 1.25, 119.2);
  } else if (shot === 'hub' || shot === '4' || shot === 'map' || shot === 'end') {
    // Shot 4: 4-hub-map.png — Full City Map + 10-Mission Career + 3 Save Slots over 3D Sunset Skyline
    setGameMode('hub');
    menus.setScreenMode('hub');
    playerRig.visible = false;
    heroCar.visible = true;
    heroCar.position.set(1.4, 0, -24.0);

    camera.position.set(28.0, 22.0, 32.0);
    camera.lookAt(-24.0, 12.0, -60.0);
  }

  if (reflectionSystem) {
    reflectionSystem.syncWithEntities(heroCar, policeSystem.cruisers, helicopter, 1.25);
  }
}
