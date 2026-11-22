// Solara Bay: Neon Dynasty (V5) — Instanced Streetlamps, Beach Bollards, Pier & Harbor Props
// Uses THREE.InstancedMesh for streetlamps, glowing coastal bollards, and beach umbrellas.

const THREE = window.THREE;

export function buildCityProps(cityGroup, atlas) {
  const dummy = new THREE.Object3D();

  // 1. Coastal Streetlamps (Poles, Arms & Glowing Warm Bulbs via THREE.InstancedMesh)
  const lampCoords = [];
  for (let z = -220; z <= 220; z += 34) {
    lampCoords.push({ x: -12.2, z, side: -1 });
    lampCoords.push({ x: 12.2, z, side: 1 });
  }

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 6.8, 6);
  const armGeo = new THREE.BoxGeometry(1.8, 0.14, 0.14);
  const bulbGeo = new THREE.SphereGeometry(0.32, 8, 8);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x242e40 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffe49c, fog: false });

  const polesInst = new THREE.InstancedMesh(poleGeo, poleMat, lampCoords.length);
  const armsInst = new THREE.InstancedMesh(armGeo, poleMat, lampCoords.length);
  const bulbsInst = new THREE.InstancedMesh(bulbGeo, bulbMat, lampCoords.length);

  lampCoords.forEach((lc, i) => {
    dummy.position.set(lc.x, 3.4, lc.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    polesInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lc.x + (lc.side > 0 ? -0.8 : 0.8), 6.7, lc.z);
    dummy.updateMatrix();
    armsInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(lc.x + (lc.side > 0 ? -1.55 : 1.55), 6.55, lc.z);
    dummy.updateMatrix();
    bulbsInst.setMatrixAt(i, dummy.matrix);
  });
  cityGroup.add(polesInst, armsInst, bulbsInst);

  // 2. Illuminated Coastal Promenade Bollards along the Beach Edge (x = 15.8) via THREE.InstancedMesh
  const bollardZ = [];
  for (let z = -220; z <= 220; z += 12) {
    bollardZ.push(z);
  }
  const bolBodyInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.14, 0.16, 1.05, 8),
    poleMat,
    bollardZ.length
  );
  const bolCapInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.22, 8),
    new THREE.MeshBasicMaterial({ color: 0x24e5ff, fog: false }),
    bollardZ.length
  );
  bollardZ.forEach((z, i) => {
    dummy.position.set(15.8, 0.52, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bolBodyInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(15.8, 1.08, z);
    dummy.updateMatrix();
    bolCapInst.setMatrixAt(i, dummy.matrix);
  });
  cityGroup.add(bolBodyInst, bolCapInst);

  // 3. Beach Umbrellas & Lounge Chairs right on the Golden Beach (x = 19..28)
  const umbrellaColors = [0xff4d5e, 0xffb830, 0x24e5ff, 0x2ee889];
  const stickGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6);
  const canopyGeo = new THREE.ConeGeometry(2.05, 0.85, 8);
  for (let z = -200; z <= 200; z += 22) {
    const ux = 19.5 + ((Math.abs(z) * 5) % 8);
    const umb = new THREE.Group();
    umb.position.set(ux, 0, z);
    const stick = new THREE.Mesh(stickGeo, poleMat);
    stick.position.y = 1.25;
    umb.add(stick);
    const canopy = new THREE.Mesh(
      canopyGeo,
      new THREE.MeshBasicMaterial({
        color: umbrellaColors[Math.abs(Math.floor(z / 22)) % umbrellaColors.length],
        fog: false,
      })
    );
    canopy.position.y = 2.48;
    umb.add(canopy);
    cityGroup.add(umb);
  }

  // 4. Pacifica Pier & Illuminated Ferris Wheel Landmark over the Turquoise Ocean (x = 46, z = -105)
  const pierGroup = new THREE.Group();
  pierGroup.position.set(46, 0, -105);
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(52, 0.8, 15),
    new THREE.MeshLambertMaterial({ color: 0x754e34 })
  );
  deck.position.y = 2.2;
  pierGroup.add(deck);

  const wheelRing = new THREE.Mesh(
    new THREE.TorusGeometry(13.5, 0.55, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffb830, fog: false })
  );
  wheelRing.position.set(12, 17.0, 0);
  pierGroup.add(wheelRing);

  const wheelInner = new THREE.Mesh(
    new THREE.TorusGeometry(8.8, 0.35, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0x24e5ff, fog: false })
  );
  wheelInner.position.set(12, 17.0, 0);
  pierGroup.add(wheelInner);
  cityGroup.add(pierGroup);

  // 5. Harbor Night Market Lantern Plaza, Stacked Shipping Containers & Gantry Crane (Shot 2)
  const marketGroup = new THREE.Group();
  marketGroup.position.set(-76, 0, 120);

  const containerMats = [
    new THREE.MeshLambertMaterial({ map: atlas.containerRed }),
    new THREE.MeshLambertMaterial({ map: atlas.containerBlue }),
    new THREE.MeshLambertMaterial({ map: atlas.containerGold }),
  ];
  const containerGeo = new THREE.BoxGeometry(3.2, 2.8, 7.6);
  const containerOffsets = [
    { x: -17, z: -18, y: 1.4, rot: 0, mat: 0 },
    { x: -17, z: -18, y: 4.2, rot: 0, mat: 1 },
    { x: -17, z: -2, y: 1.4, rot: 0.05, mat: 2 },
    { x: 17, z: -14, y: 1.4, rot: 0, mat: 1 },
    { x: 17, z: -14, y: 4.2, rot: 0, mat: 0 },
    { x: 17, z: 4, y: 1.4, rot: -0.04, mat: 2 },
  ];
  for (const c of containerOffsets) {
    const box = new THREE.Mesh(containerGeo, containerMats[c.mat]);
    box.position.set(c.x, c.y, c.z);
    box.rotation.y = c.rot;
    box.castShadow = true;
    marketGroup.add(box);
  }

  const craneMat = new THREE.MeshLambertMaterial({ color: 0xff6e26 });
  const craneGroup = new THREE.Group();
  craneGroup.position.set(0, 0, -34);
  for (const lx of [-11, 11]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.4, 24, 1.4), craneMat);
    leg.position.set(lx, 12, 0);
    craneGroup.add(leg);
  }
  const craneBeam = new THREE.Mesh(new THREE.BoxGeometry(34, 1.8, 2.2), craneMat);
  craneBeam.position.set(2, 23.5, 0);
  craneGroup.add(craneBeam);
  marketGroup.add(craneGroup);

  const lanternGeo = new THREE.SphereGeometry(0.28, 8, 8);
  const lanternMats = umbrellaColors.map((c) => new THREE.MeshBasicMaterial({ color: c, fog: false }));
  for (let lz = -22; lz <= 22; lz += 8) {
    for (let lx = -9; lx <= 9; lx += 3) {
      const lantern = new THREE.Mesh(lanternGeo, lanternMats[Math.abs(lx + lz) % lanternMats.length]);
      lantern.position.set(lx, 6.2 - Math.cos((lx / 10) * Math.PI) * 0.65, lz);
      marketGroup.add(lantern);
    }
  }
  cityGroup.add(marketGroup);

  return {
    wheelRing,
    wheelInner,
    update(time) {
      wheelRing.rotation.z = time * 0.18;
      wheelInner.rotation.z = -time * 0.18;
    },
  };
}
