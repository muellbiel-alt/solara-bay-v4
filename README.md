# Solara Bay: Neon Dynasty

[![make.fun gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/c/gta6-01)
[![Rank](https://make.fun/badge/gta6-01/muellbiel-alt/solara-bay-v4/rank.svg)](https://make.fun/c/gta6-01)
[![Reward](https://make.fun/badge/gta6-01/muellbiel-alt/solara-bay-v4/reward.svg)](https://make.fun/c/gta6-01)

Built for the [make.fun](https://make.fun) `gta6-01` open-world crime game competition.

**Solara Bay: Neon Dynasty** is a browser-native 3D open-world crime action game running offline on WebGL (`Three.js`). Set across four coastal districts at golden hour, players drive and hijack six vehicle classes, fight through a ten-mission syndicate campaign, coordinate a three-specialist crew, tune cars inside the 3D Costa Customs turntable workshop, and evade a five-star tactical police response supported by roadblocks and helicopter spotlights.

## Architecture (`game/src/`)

- `core/config.js` — World constants, four district layouts, six vehicle specs, four weapons, three crew abilities, and ten campaign missions.
- `core/random.js` — Deterministic Mulberry32 PRNG for procedural city blocks, traffic lanes, and reproducible screenshot staging.
- `core/input.js` — Keyboard and mouse-look controls for driving, drift handbrake, nitrous, aiming, weapon switching, and crew abilities.
- `core/storage.js` — Three-slot `localStorage` save and load manager tracking cash, mission ratings, vehicle upgrades, and career statistics.
- `world/textures.js` — High-contrast procedural `THREE.CanvasTexture` generators for four-lane grained asphalt, crosswalks, lit Art-Deco and glass facades, neon billboards, ocean waves, alloy rims, and tire treads.
- `world/city3d.js` — Four-district 3D coastal map (Palm Boulevard, Downtown Neon, Harbor Docks, Industrial Yard) with palms, boardwalks, night market stalls, gantry cranes, and container piers.
- `world/lighting.js` — Three-layer golden-hour sunset dome, directional sun shadows, volumetric helicopter spotlight cones, police strobe lights, and exponential horizon fog.
- `entities/vehicles3d.js` — Multi-part 3D vehicles with wedge chassis, reflective cabins, spoilers, grounded alloy wheels with contact shadows, drift physics, and `[E]` carjacking.
- `entities/characters3d.js` — Articulated 3D player, pedestrian, syndicate, and police officer rigs with weapon attachments and walk cycles.
- `entities/helicopter3d.js` — SBPD Falcon-1 pursuit helicopter with spinning rotors, navigation strobes, and target-tracking spotlight cone.
- `systems/traffic.js` — Multi-lane autonomous traffic and pedestrian simulation.
- `systems/police.js` — Five-star wanted escalation and Tactical Police Dispatch tracking unit callsigns, distances, and active tactics (`RAMMING`, `FLANKING`, `SPOTLIGHT`, `ROADBLOCK`).
- `systems/crew.js` — Three active crew specialists with cooldown abilities (`EMP Jammer`, `Nitro Getaway`, `Smoke Screen`).
- `systems/combat.js` — Four-slot weapon hotbar, ballistic tracers, muzzle flashes, vehicle explosions, and on-foot or drive-by fire.
- `systems/missions.js` — Ten multi-stage story missions from *Dockside Ignition* to *Pier Endgame* with character portrait dialogue.
- `systems/economy.js` — Costa Customs 3D turntable garage upgrade shop (paint, engine, handling, armor, nitro), armory restock, and safehouse management.
- `ui/hud.js` — High-contrast corner HUD and rotating coastal minimap keeping over 70% of the 3D viewport unobstructed.
- `ui/menus.js` — Interactive Costa Customs 3D workshop UI and full-city map / career / 3-slot save hub.
- `ui/shots.js` — Deterministic `?shot=` staging for real headless WebGL verification captures.
- `audio/synth.js` — Procedural Web Audio engine sound, police sirens, helicopter rotor thrum, gunfire, and three coastal radio stations.

## Running Locally

```bash
node serve.ts
# Open http://localhost:8080 in Chrome
```

## Building Dossier Output

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
