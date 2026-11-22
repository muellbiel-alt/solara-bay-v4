// Solara Bay: Neon Dynasty (V5) — 4-Lane Grained Asphalt Avenues, Crosswalks & Slanted Sun Shadows
// Builds the coastal road grid, raised travertine sidewalks, zebra crosswalk intersections,
// and long diagonal golden-hour building shadows projected across Palm Boulevard.

const THREE = window.THREE;

export function buildRoadNetwork(cityGroup, atlas) {
  // Base urban concrete foundation
  const baseMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1100, 1100),
    new THREE.MeshLambertMaterial({ map: atlas.sidewalk })
  );
  baseMesh.rotation.x = -Math.PI / 2;
  baseMesh.position.set(-140, -0.04, 0);
  baseMesh.receiveShadow = true;
  cityGroup.add(baseMesh);

  const avenuesX = [0, -76, -152, -228];
  const crossZ = [-240, -160, -80, 0, 80, 160, 240];

  const roadMat = new THREE.MeshPhongMaterial({
    map: atlas.road,
    shininess: 42,
    specular: new THREE.Color(0x4a5568),
  });
  const crossMat = new THREE.MeshLambertMaterial({ map: atlas.crosswalk });
  const swMat = new THREE.MeshLambertMaterial({ map: atlas.sidewalk });
  const swGeo = new THREE.BoxGeometry(5, 0.18, 840);
  const roadGeo = new THREE.PlaneGeometry(22, 840);

  for (const ax of avenuesX) {
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(ax, 0.0, 0);
    roadMesh.receiveShadow = true;
    cityGroup.add(roadMesh);

    for (const side of [-13.5, 13.5]) {
      const sw = new THREE.Mesh(swGeo, swMat);
      sw.position.set(ax + side, 0.09, 0);
      sw.receiveShadow = true;
      cityGroup.add(sw);
    }
  }

  const crossRoadTex = atlas.road.clone();
  crossRoadTex.needsUpdate = true;
  const crossRoadMat = new THREE.MeshLambertMaterial({ map: crossRoadTex });
  const crossRoadGeo = new THREE.PlaneGeometry(340, 20);
  const ixGeo = new THREE.PlaneGeometry(22.4, 22.4);

  for (const cz of crossZ) {
    const cRoad = new THREE.Mesh(crossRoadGeo, crossRoadMat);
    cRoad.rotation.x = -Math.PI / 2;
    cRoad.rotation.z = Math.PI / 2;
    cRoad.position.set(-120, 0.01, cz);
    cityGroup.add(cRoad);

    for (const ax of avenuesX) {
      const ix = new THREE.Mesh(ixGeo, crossMat);
      ix.rotation.x = -Math.PI / 2;
      ix.position.set(ax, 0.024, cz);
      cityGroup.add(ix);
    }
  }

  // Slanted Low-Sun Building Shadows cast diagonally across Palm Boulevard from West Hotels
  const buildingShadowMat = new THREE.MeshBasicMaterial({
    color: 0x090d18,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
  });
  const blockCentersZ = [-200, -120, -40, 40, 120, 200];
  const bShadowGeo = new THREE.PlaneGeometry(16, 23);
  bShadowGeo.rotateX(-Math.PI / 2);

  for (const bz of blockCentersZ) {
    for (const offsetZ of [-17, 17]) {
      const sh = new THREE.Mesh(bShadowGeo, buildingShadowMat);
      sh.position.set(-10.5, 0.018, bz + offsetZ + 4.5);
      sh.rotation.y = 0.22;
      cityGroup.add(sh);
    }
  }
}
