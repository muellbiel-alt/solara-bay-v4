// Solara Bay: Neon Dynasty (V5) — Costa Customs 3D Workshop Bay & Illuminated Hydraulic Turntable

const THREE = window.THREE;

export function buildCostaCustomsGarage(cityGroup, atlas, signTextures) {
  const garageBay = new THREE.Group();
  garageBay.position.set(-180, 0, 120);

  const gFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 28),
    new THREE.MeshLambertMaterial({ map: atlas.garageFloor })
  );
  gFloor.rotation.x = -Math.PI / 2;
  gFloor.position.y = 0.02;
  garageBay.add(gFloor);

  const gWallMat = new THREE.MeshLambertMaterial({ color: 0x162033 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 0.8), gWallMat);
  backWall.position.set(0, 6, -11);
  garageBay.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 28), gWallMat);
  leftWall.position.set(-12, 6, 0);
  garageBay.add(leftWall);

  const garageSign = new THREE.Mesh(
    new THREE.PlaneGeometry(11.5, 3.4),
    new THREE.MeshBasicMaterial({ map: signTextures[3], fog: false })
  );
  garageSign.position.set(-2.2, 6.6, -10.4);
  garageBay.add(garageSign);

  const cabinetMat = new THREE.MeshLambertMaterial({ color: 0xd92b3a });
  for (const cx of [-8.5, -5.2, 3.8]) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.2), cabinetMat);
    cab.position.set(cx, 1.1, -9.6);
    garageBay.add(cab);
  }

  // Illuminated 3D Hydraulic Turntable Platform
  const turntable = new THREE.Group();
  turntable.position.set(-2.4, 0, 0);

  const baseDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 4.7, 0.22, 32),
    new THREE.MeshPhongMaterial({ color: 0x222c40, shininess: 85 })
  );
  baseDisc.position.y = 0.11;
  turntable.add(baseDisc);

  const neonRing = new THREE.Mesh(
    new THREE.TorusGeometry(4.45, 0.11, 10, 36),
    new THREE.MeshBasicMaterial({ color: 0xffb830, fog: false })
  );
  neonRing.rotation.x = Math.PI / 2;
  neonRing.position.y = 0.22;
  turntable.add(neonRing);

  const postMat = new THREE.MeshLambertMaterial({ color: 0xf5b82e });
  for (const px of [-3.8, 3.8]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.8, 0.45), postMat);
    post.position.set(px, 2.4, -2.8);
    turntable.add(post);
  }

  const garageLight = new THREE.PointLight(0xffcf88, 1.9, 28);
  garageLight.position.set(-2.4, 7.5, 3);
  garageBay.add(garageLight);

  garageBay.add(turntable);
  cityGroup.add(garageBay);

  return {
    garageBay,
    turntable,
    garageBayPos: new THREE.Vector3(-182.4, 0.22, 120),
  };
}
