# Solara Bay: Neon Dynasty

[![make.fun gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/c/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/muellbiel-alt/solara-bay-v4/rank.svg)](https://make.fun/c/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/muellbiel-alt/solara-bay-v4/reward.svg)](https://make.fun/c/gta6-01)

Built for the [make.fun](https://make.fun) `gta6-01` open-world crime game competition.

**Solara Bay: Neon Dynasty** is an offline browser 3D open-world crime action game built on WebGL (`Three.js` r128 bundled locally at `game/vendor/three.min.js`). Set across four coastal districts at golden hour, it features six driveable and hijackable vehicle classes, a ten-mission syndicate campaign, three crew abilities, on-foot ballistic combat, a 3D Costa Customs workshop bay, and a five-star police pursuit system with roadblocks and helicopter air support.

## Architecture (`game/src/`)

- `core/` (`config.js`, `random.js`, `math.js`, `clock.js`, `input.js`, `storage.js`, `simEngine.js`) — District, vehicle, weapon, and mission definitions, deterministic Mulberry32 PRNG, vector/bounds helpers, fixed-timestep simulation clock with `visibilitychange`/`blur` pause, input handling, three-slot `localStorage` career saves, and headless simulation state verified with `node:test`.
- `world/` (`textures.js`, `sky.js`, `lighting.js`, `ocean.js`, `foliage.js`, `roads.js`, `buildings.js`, `props.js`, `garage3d.js`, `city3d.js`) — Procedural `THREE.CanvasTexture` generators, golden-hour sunset dome with horizon scatter and Mulberry32 dusk clouds, three-layer lighting, turquoise ocean with sunset reflection path, surf breakers, and yachts, `THREE.InstancedMesh` curved palms with slanted road shadows, four-lane asphalt avenues, textured Art-Deco and glass towers with rooftop parapets, HVAC units, water tanks, antenna beacons, and neon billboards, instanced coastal streetlamps and bollards, Pacifica Pier boardwalk pavilion, Harbor Night Market catenary lantern spans and gantry arch, and the textured Costa Customs 3D workshop bay (corrugated/brick walls with hazard dado, overhead LED light bars, tool chests, ECU dyno cart, spare alloy tires, hydraulic lift columns, and illuminated turntable).
- `effects/` (`particles.js`, `reflections.js`, `trails.js`) — Multi-layered explosions with smoke plumes and ember sparks, additive ballistic tracers, soft additive wet-asphalt siren, brake, and nitro specular reflections, feathered crimson taillight trails, and layered additive blue-white plasma nitrous jets.
- `entities/` (`carChassis.js`, `vehicles3d.js`, `helicopter3d.js`, `characters3d.js`) — Extruded sports coupes and police interceptors with fastback glass, flared fenders, rear diffusers, and grounded alloy wheels (`y = 0.00`), SBPD Falcon-1 helicopter with volumetric spotlight cone, and articulated 3D character rigs with jacket shoulders, collars, waist belts, multi-part firearms, and additive starburst muzzle flashes.
- `systems/` (`traffic.js`, `police.js`, `crew.js`, `combat.js`, `missions.js`, `economy.js`) — Autonomous multi-lane traffic and sidewalk/beach pedestrians, five-star police dispatch with tactical unit states, crew specialist abilities, four-slot ballistic combat, ten multi-stage story missions, and Costa Customs tuning upgrades.
- `ui/` (`minimap.js`, `dispatchPanel.js`, `weaponWheel.js`, `hud.js`, `menus.js`, `shots.js`) — Four-corner tactical HUD, rotating coastal minimap, police dispatch roster, weapon and crew hotbars, portrait comms card, interactive four-district GPS map and save hub, and deterministic `?shot=` scene staging.
- `audio/` (`synth.js`, `radio.js`) — Procedural Web Audio synthesizer and three coastal FM radio stations.

## Running Locally

```bash
node serve.ts
# Open http://localhost:8080 in Chrome
```

## Running Tests & Bundling

```bash
node --test tests/sim.test.mjs
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
