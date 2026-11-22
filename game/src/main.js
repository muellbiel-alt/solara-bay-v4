// Solara Bay: Neon Dynasty (V5) — Main 3D WebGL Engine Bootstrap, Fixed-Timestep Loop & Render Pipeline
// Separates deterministic fixed-step update(dt) from render() and pauses on visibilitychange / blur.

const THREE = window.THREE;
import { CITY_META } from './core/config.js';
import { createPRNG } from './core/random.js';
import { createSimulationClock } from './core/clock.js';
import { createSimState, restartSimulation, stepSimulation } from './core/simEngine.js';
import { createInputController } from './core/input.js';
import { createStorageManager } from './core/storage.js';
import { createTextureAtlas } from './world/textures.js';
import { setupGoldenHourLighting } from './world/lighting.js';
import { buildSolaraCity } from './world/city3d.js';
import { createAsphaltReflectionSystem } from './effects/reflections.js';
import { createVehicleManager } from './entities/vehicles3d.js';
import { createCharacterRig } from './entities/characters3d.js';
import { createPoliceHelicopter } from './entities/helicopter3d.js';
import { createTrafficSystem } from './systems/traffic.js';
import { createPoliceSystem } from './systems/police.js';
import { createCrewSystem } from './systems/crew.js';
import { createCombatSystem } from './systems/combat.js';
import { createMissionSystem } from './systems/missions.js';
import { createEconomySystem } from './systems/economy.js';
import { createHudController } from './ui/hud.js';
import { createMenuController } from './ui/menus.js';
import { applyDeterministicShotStage } from './ui/shots.js';
import { createAudioSynth } from './audio/synth.js';

function bootstrapSolaraBay() {
  const params = new URLSearchParams(window.location.search);
  const seedParam = Number(params.get('seed')) || CITY_META.seed;
  const shotParam = params.get('shot');
  const rng = createPRNG(seedParam);
  const simClock = createSimulationClock({ fixedDt: 1 / 60, maxFrameDelta: 0.05, initialSimTime: 1.25 });
  simClock.bindVisibilityEvents(window, document);
  const coreSimState = createSimState(seedParam);

  const canvas = document.getElementById('game');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (THREE.sRGBEncoding) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.25, 1100);

  // Build Texture Atlas, Golden Hour Lighting, 4-District Coastal City, and Wet-Asphalt Reflections
  const atlas = createTextureAtlas();
  const lighting = setupGoldenHourLighting(scene);
  const city = buildSolaraCity(scene, atlas);
  const reflectionSystem = createAsphaltReflectionSystem(scene);

  // Initialize Core Managers & Entities
  const input = createInputController(canvas);
  const storage = createStorageManager();
  const audioSynth = createAudioSynth();
  const vehicleManager = createVehicleManager(scene, atlas);
  const helicopter = createPoliceHelicopter(scene);

  // Spawn Sculpted Hero Vehicle (Kestrel GT) & Articulated 3D Player Character (Nico Vance)
  const heroCar = vehicleManager.spawnVehicle('kestrel_gt', 1.35, 9.8, Math.PI + 0.14);
  const playerRig = createCharacterRig('player');
  playerRig.position.set(-75.2, 0, 125.0);
  playerRig.visible = false;
  scene.add(playerRig);

  // Initialize Open-World Systems
  const trafficSystem = createTrafficSystem(scene, vehicleManager, rng);
  const policeSystem = createPoliceSystem(scene, vehicleManager, helicopter);
  const crewSystem = createCrewSystem(policeSystem, audioSynth);
  const combatSystem = createCombatSystem(scene, audioSynth);
  const missionSystem = createMissionSystem();
  const economySystem = createEconomySystem(storage, audioSynth);

  let gameMode = 'chase'; // 'chase' | 'onfoot' | 'garage' | 'hub'
  const isShotCapture = Boolean(shotParam);

  const hud = createHudController(audioSynth);
  const menus = createMenuController(economySystem, missionSystem, storage, {
    onSetMode(newMode) {
      if (newMode === 'chase') {
        restartSimulation(coreSimState);
        simClock.reset(1.25);
      }
      applyDeterministicShotStage(newMode, stageContext);
      syncHud(simClock.getSimTime());
    },
    onPaintSelect(hex) {
      economySystem.applyPaint(hex, heroCar, policeSystem);
    },
    onInstallUpgrade() {
      economySystem.installSelectedUpgrade(heroCar);
    },
  });

  const stageContext = {
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
    city,
    setGameMode(m) {
      gameMode = m;
    },
  };

  // Stage initial deterministic scene (defaults to Action-First 4★ Chase Cover)
  applyDeterministicShotStage(shotParam || 'chase', stageContext);

  function syncHud(elapsedTime) {
    const activePos = gameMode === 'onfoot' ? playerRig.position : heroCar.position;
    const activeHeading = gameMode === 'onfoot' ? playerRig.rotation.y : heroCar.rotation.y;
    const units = policeSystem.getDispatchUnits(activePos);

    hud.renderPoliceDispatch(units, policeSystem.getWantedStars());
    hud.renderWeapons(combatSystem.weapons, combatSystem.getActiveSlot());
    hud.renderCrew(crewSystem.getAbilities());
    hud.renderMinimap(activePos, activeHeading, policeSystem.cruisers, elapsedTime);
    hud.updateDistrict(activePos);
    hud.updateVehicleReadout(heroCar, gameMode === 'onfoot', combatSystem.getActiveWeapon());
    document.getElementById('hud-cash').textContent = `$${economySystem.getCash().toLocaleString()}`;
    if (!isShotCapture) {
      document.getElementById('hud-clock').textContent = simClock.formatClock();
    }
  }

  syncHud(1.25);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function handleInteractiveHotkeys() {
    if (input.consumePress('KeyG')) {
      const next = gameMode === 'garage' ? 'chase' : 'garage';
      applyDeterministicShotStage(next, stageContext);
    }
    if (input.consumePress('KeyM') || input.consumePress('Escape')) {
      const next = gameMode === 'hub' ? 'chase' : 'hub';
      applyDeterministicShotStage(next, stageContext);
    }
    if (input.consumePress('KeyF') || input.consumePress('KeyE')) {
      const next = gameMode === 'onfoot' ? 'chase' : 'firefight';
      applyDeterministicShotStage(next, stageContext);
    }
    if (input.consumePress('KeyR')) {
      hud.cycleRadio();
    }
    for (let s = 1; s <= 4; s++) {
      if (input.consumePress(`Digit${s}`)) {
        combatSystem.selectWeapon(s);
      }
    }
    if (input.consumePress('KeyZ')) crewSystem.activateAbility('Z', heroCar);
    if (input.consumePress('KeyX')) crewSystem.activateAbility('X', heroCar);
    if (input.consumePress('KeyC')) crewSystem.activateAbility('C', heroCar);
  }

  // Deterministic fixed-timestep simulation step (strictly separated from render())
  function updateSimulationStep(fixedDt, simTime) {
    stepSimulation(coreSimState, fixedDt, {
      throttle: input.getThrottle(),
      steer: input.getSteer(),
      handbrake: input.isHandbrake(),
      nitro: input.isNitro(),
    });

    if (gameMode === 'chase') {
      const userDriving =
        input.getThrottle() !== 0 || input.getSteer() !== 0 || input.isHandbrake() || input.isNitro();
      if (userDriving) {
        vehicleManager.updateVehiclePhysics(heroCar, input, fixedDt, simTime);
        const camDist = 9.4;
        camera.position.set(
          heroCar.position.x - Math.sin(heroCar.rotation.y) * camDist,
          3.85,
          heroCar.position.z - Math.cos(heroCar.rotation.y) * camDist
        );
        camera.lookAt(
          heroCar.position.x + Math.sin(heroCar.rotation.y) * 14,
          2.1,
          heroCar.position.z + Math.cos(heroCar.rotation.y) * 14
        );
      }
      policeSystem.update(fixedDt, simTime, heroCar.position, !userDriving);
      helicopter.update(simTime, heroCar.position, policeSystem.getWantedStars());
    } else if (gameMode === 'onfoot') {
      const moveZ = input.getThrottle();
      const moveX = input.getSteer();
      if (moveZ !== 0 || moveX !== 0) {
        playerRig.rotation.y += moveX * 2.6 * fixedDt;
        const walkStep = moveZ * 6.5 * fixedDt;
        playerRig.position.x += Math.sin(playerRig.rotation.y) * walkStep;
        playerRig.position.z += Math.cos(playerRig.rotation.y) * walkStep;
        playerRig.userData.animateWalk(simTime, 1.4);
      }
      const nearCar = vehicleManager.findNearestJackableVehicle(playerRig.position, null, 9.5);
      if (nearCar) {
        hud.setContextPrompt(true, `JACK ${nearCar.userData.spec.name}`);
      } else {
        hud.setContextPrompt(false);
      }
      if (input.mouse.firing) {
        combatSystem.fireWeapon(playerRig.position);
      }
    } else if (gameMode === 'garage') {
      heroCar.rotation.y += fixedDt * 0.45;
    }

    trafficSystem.update(fixedDt, simTime, false);
    crewSystem.update(fixedDt);
    combatSystem.update(fixedDt, simTime);
    city.update(fixedDt, simTime);
    vehicleManager.animateAllVehicles(simTime);
    lighting.update(simTime, heroCar.position);
    reflectionSystem.syncWithEntities(heroCar, policeSystem.cruisers, helicopter, simTime);
  }

  function renderScene() {
    renderer.render(scene, camera);
    window.__SOLARA_READY = true;
  }

  window.__setSolaraShot = (shotName) => {
    applyDeterministicShotStage(shotName, stageContext);
    syncHud(1.25);
    renderScene();
  };

  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);
    const rawDelta = (now - lastTime) / 1000;
    lastTime = now;

    handleInteractiveHotkeys();

    if (!isShotCapture && !simClock.isPaused()) {
      const stepsRun = simClock.advance(rawDelta, updateSimulationStep);
      if (stepsRun > 0) {
        syncHud(simClock.getSimTime());
      }
    }

    input.clearFrame();
    renderScene();
  }

  renderScene();
  requestAnimationFrame(animate);
}

bootstrapSolaraBay();
