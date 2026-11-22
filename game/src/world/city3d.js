// Solara Bay: Neon Dynasty (V5) — 4-District Dense Coastal 3D Metropolis Orchestrator
// Coordinates roads, shimmering turquoise ocean, InstancedMesh curved palms, textured buildings,
// InstancedMesh coastal props, and the Costa Customs 3D turntable workshop bay.

const THREE = window.THREE;
import { buildRoadNetwork } from './roads.js';
import { buildCoastalOcean } from './ocean.js';
import { buildInstancedPalmFoliage } from './foliage.js';
import { buildCityBuildings } from './buildings.js';
import { buildCityProps } from './props.js';
import { buildCostaCustomsGarage } from './garage3d.js';

export function buildSolaraCity(scene, atlas) {
  const cityGroup = new THREE.Group();

  buildRoadNetwork(cityGroup, atlas);
  const ocean = buildCoastalOcean(cityGroup, atlas);
  const foliage = buildInstancedPalmFoliage(cityGroup);
  const { colliders, signTextures } = buildCityBuildings(cityGroup, atlas);
  const props = buildCityProps(cityGroup, atlas);
  const garage = buildCostaCustomsGarage(cityGroup, atlas, signTextures);

  scene.add(cityGroup);

  return {
    cityGroup,
    colliders,
    oceanMesh: ocean.oceanMesh,
    foliage,
    turntable: garage.turntable,
    garageBayPos: garage.garageBayPos,
    update(dt, time) {
      ocean.update(time);
      props.update(time);
    },
  };
}
