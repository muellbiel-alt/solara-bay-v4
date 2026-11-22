# Solara Bay: Neon Dynasty

[![make.fun gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/c/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/muellbiel-alt/solara-bay-v4/rank.svg)](https://make.fun/c/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/muellbiel-alt/solara-bay-v4/reward.svg)](https://make.fun/c/gta6-01)

Built for the [make.fun](https://make.fun) `gta6-01` open-world crime game competition.

**Solara Bay: Neon Dynasty** is a browser-native 3D open-world crime action game running offline on WebGL (`Three.js`). Set across four coastal districts at golden hour, players drive and hijack six vehicle classes, fight through a ten-mission syndicate campaign, coordinate a three-specialist crew, tune cars inside the 3D Costa Customs turntable workshop, and evade a five-star tactical police response supported by roadblocks and helicopter spotlights.

## Architecture (`game/src/`)

- `core/` (`config.js`, `random.js`, `math.js`, `clock.js`, `input.js`, `storage.js`, `simEngine.js`) — World constants, Mulberry32 PRNG, vector/angle bounds utilities, fixed-timestep simulation clock with `visibilitychange`/`blur` pause, keyboard/mouse controls, three-slot `localStorage` career persistence, and headless simulation engine verified via `node:test`.
- `world/` (`textures.js`, `sky.js`, `lighting.js`, `ocean.js`, `foliage.js`, `roads.js`, `buildings.js`, `props.js`, `garage3d.js`, `city3d.js`) — Procedural `THREE.CanvasTexture` generators, golden-hour sunset dome and tuned horizon fog, three-layer lighting, turquoise ocean with surf foam breakers and moored yachts, `THREE.InstancedMesh` curved coconut palms with slanted road shadows, four-lane grained asphalt avenues, Art-Deco and neon glass towers, instanced streetlamps and beach bollards, Pacifica Pier Ferris wheel and Harbor Night Market landmarks, and the Costa Customs 3D turntable bay.
- `effects/` (`particles.js`, `reflections.js`, `trails.js`) — Multi-layered high-contrast fiery explosions with ember sparks and smoke plumes, dusk wet-asphalt siren and brake light specular reflection pools, crimson LED taillight trails, and three-stage nitrous afterburner plumes.
- `entities/` (`carChassis.js`, `vehicles3d.js`, `helicopter3d.js`, `characters3d.js`) — Sculpted aerodynamic sports coupes and police interceptors with fastback glass, flared fenders, rear diffusers, and grounded alloy wheels (`y = 0.00`), SBPD Falcon-1 helicopter with dual-layer volumetric spotlight cone, and articulated 3D character rigs with handheld firearms.
- `systems/` (`traffic.js`, `police.js`, `crew.js`, `combat.js`, `missions.js`, `economy.js`) — Autonomous multi-lane traffic and pedestrian simulation, five-star tactical police dispatch, three crew specialist abilities, four-slot ballistic combat, ten multi-stage story missions, and Costa Customs workshop upgrades.
- `ui/` (`minimap.js`, `dispatchPanel.js`, `weaponWheel.js`, `hud.js`, `menus.js`, `shots.js`) — Sleek translucent corner HUD keeping over 77% of the 3D viewport open, rotating coastal radar, synchronized 4-star dispatch panel, weapon and crew hotbars, portrait comms card, interactive four-district GPS map, and deterministic `?shot=` capture staging.
- `audio/` (`synth.js`, `radio.js`) — Procedural Web Audio synthesizer and three coastal FM radio stations.

## Running Locally

```bash
node serve.ts
# Open http://localhost:8080 in Chrome
```

## Building Dossier Output

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
