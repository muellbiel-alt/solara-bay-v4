// Solara Bay: Neon Dynasty (V4) — Deterministic ?shot= Staging Director for Real WebGL Captures
// Stages all 4 required screenshots (1-chase-cover.png, 2-firefight.png, 3-garage.png, 4-hub-map.png)
// inside the live 3D engine with exact framing, zero UI overlap on the hero vehicle, and 0 clipping.

export function applyDeterministicShotStage(shotParam, ctx) {
  const {
    camera,
    heroCar,
    playerRig,
    policeSystem,
    helicopter,
    missionSystem,
    combatSystem,
    hud,
    menus,
    city,
    setGameMode,
  } = ctx;

  const shot = (shotParam || 'chase').toLowerCase();

  if (shot === 'chase' || shot === '1' || shot === 'cover' || shot === 'start') {
    // Shot 1: 1-chase-cover.png — 4★ Police Chase on Palm Boulevard at Golden Hour
    setGameMode('chase');
    menus.setScreenMode('chase');
    playerRig.visible = false;
    heroCar.visible = true;

    // Place hero Kestrel GT in dynamic 3/4 drift on the 4-lane grained asphalt (showing alloy wheels, spoiler & nitro!)
    heroCar.position.set(1.15, 0, -24.5);
    heroCar.rotation.y = Math.PI + 0.34;
    heroCar.userData.speed = 138;
    heroCar.userData.gear = 'S5';
    heroCar.userData.nitro = 92;
    heroCar.userData.setNitroActive(true);

    // Position 3 pursuing SBPD Vulture Interceptors right beside/behind hero car + 1 roadblock cruiser ahead
    const c = policeSystem.cruisers;
    if (c[0]) {
      // VIPER-14: Ramming from left-rear flank (fully visible in foreground-left!)
      c[0].position.set(-3.1, 0, -21.2);
      c[0].rotation.y = Math.PI - 0.22;
    }
    if (c[1]) {
      // VIPER-22: Flanking on the right lane (fully visible in mid-right!)
      c[1].position.set(5.2, 0, -26.8);
      c[1].rotation.y = Math.PI + 0.16;
    }
    if (c[2]) {
      // BASTION-4: Roadblock ahead near explosion
      c[2].position.set(-4.2, 0, -56.0);
      c[2].rotation.y = 1.25;
    }
    if (c[3]) {
      // VIPER-31: Chasing in center-left lane
      c[3].position.set(-1.4, 0, -34.0);
      c[3].rotation.y = Math.PI - 0.08;
    }

    // Move roadblock explosion to z = -54 so it frames cleanly down the boulevard
    if (combatSystem.explosions[0]) {
      combatSystem.explosions[0].position.set(-4.6, 0, -53.5);
    }

    // Position SBPD Falcon-1 Helicopter cleanly below top sky title badge with spotlight cone on boulevard
    policeSystem.setWantedStars(4);
    helicopter.setVisible(true);
    helicopter.mesh.position.set(-0.5, 13.4, -49.0);
    helicopter.mesh.rotation.y = 0.12;

    // Set Mission 6/10: Crown Jewel Convoy
    const m = missionSystem.setActiveMission(6);
    hud.renderMission(m);
    hud.setReticleVisible(false);
    hud.setContextPrompt(false);

    // Low 3/4 dynamic chase camera angle framing hero car in lower-center, 3 police cruisers, helicopter, hotel signs & beach palms
    camera.position.set(2.4, 3.55, -14.8);
    camera.lookAt(0.1, 2.15, -48.0);
  } else if (shot === 'firefight' || shot === '2' || shot === 'play') {
    // Shot 2: 2-firefight.png — On-Foot Firefight & Carjacking at Harbor Docks / Night Market
    setGameMode('onfoot');
    menus.setScreenMode('onfoot');
    document.getElementById('sky-brand-badge').classList.add('hidden');

    // Position articulated 3D player character aiming Kobra SMG with muzzle flash & tracers
    playerRig.visible = true;
    playerRig.position.set(-75.4, 0, 125.2);
    playerRig.rotation.y = Math.PI + 0.04;
    playerRig.userData.setAimingPose(true, true);

    // Position parked textured Kestrel GT at a 3/4 angle showing its alloy rims & spoiler right under [E] JACK KESTREL GT
    heroCar.visible = true;
    heroCar.position.set(-71.2, 0, 120.4);
    heroCar.rotation.y = Math.PI - 0.56;
    heroCar.userData.setNitroActive(false);

    // Put a police cruiser near the harbor container blockade explosion
    const c = policeSystem.cruisers;
    if (c[0]) {
      c[0].position.set(-76.0, 0, 99.2);
      c[0].rotation.y = 1.42;
    }

    policeSystem.setWantedStars(3);
    combatSystem.selectWeapon(3); // KOBRA SMG active
    const m = missionSystem.setActiveMission(4); // Mission 4: Night Market Heat
    hud.renderMission(m);
    hud.setReticleVisible(true);
    hud.setContextPrompt(true, 'JACK KESTREL GT');

    // Over-the-shoulder action camera looking past player & Kestrel GT toward tracers & explosion
    camera.position.set(-73.9, 2.52, 130.5);
    camera.lookAt(-75.4, 1.65, 102.0);
  } else if (shot === 'garage' || shot === '3') {
    // Shot 3: 3-garage.png — Costa Customs 3D Garage & Armory Turntable
    setGameMode('garage');
    menus.setScreenMode('garage');
    playerRig.visible = false;
    heroCar.visible = true;

    // Place hero Kestrel GT at a 3/4 showroom angle on the 3D hydraulic turntable platform (showing alloy rims, nose & wing)
    heroCar.position.set(-182.4, 0.22, 120.0);
    heroCar.rotation.y = 2.32;
    heroCar.userData.setNitroActive(false);

    // Frame the car on the left 60% of the viewport so the right-hand Workshop Drawer never overlaps it
    camera.position.set(-176.6, 2.75, 126.2);
    camera.lookAt(-180.4, 1.25, 119.2);
  } else if (shot === 'hub' || shot === '4' || shot === 'map' || shot === 'end') {
    // Shot 4: 4-hub-map.png — Full City Map + 10-Mission Career + 3 Save Slots over 3D Sunset Skyline
    setGameMode('hub');
    menus.setScreenMode('hub');
    playerRig.visible = false;
    heroCar.visible = true;
    heroCar.position.set(1.4, 0, -24.0);

    // Elevated panoramic camera overlooking Palm Boulevard, Hotel Miramar, Pacifica Pier & glowing sunset skyline
    camera.position.set(28.0, 22.0, 32.0);
    camera.lookAt(-24.0, 12.0, -60.0);
  }
}
