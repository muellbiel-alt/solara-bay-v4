// Solara Bay: Neon Dynasty (V4) — SBPD Falcon-1 3D Police Pursuit Helicopter with Volumetric Spotlight Cone

const THREE = window.THREE;

export function createPoliceHelicopter(scene) {
  const heli = new THREE.Group();

  const navyMat = new THREE.MeshPhongMaterial({ color: 0x101a2e, shininess: 80 });
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf0f5fc });
  const glassMat = new THREE.MeshPhongMaterial({ color: 0x19c9e8, shininess: 120, transparent: true, opacity: 0.78 });
  const rotorMat = new THREE.MeshBasicMaterial({ color: 0x18202c });

  // Fuselage Cabin & Cockpit Canopy
  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.1, 4.8), navyMat);
  heli.add(fuselage);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.46, 0.55, 4.84), whiteMat);
  stripe.position.y = -0.2;
  heli.add(stripe);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.22, 14, 12), glassMat);
  canopy.scale.set(0.95, 0.85, 1.35);
  canopy.position.set(0, -0.05, 1.85);
  heli.add(canopy);

  // Tail Boom & Vertical Fin
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.72, 5.4), navyMat);
  boom.position.set(0, 0.25, -4.6);
  heli.add(boom);

  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.85, 1.2), whiteMat);
  fin.position.set(0, 0.95, -6.9);
  heli.add(fin);

  // Landing Skids
  for (const sx of [-1.15, 1.15]) {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.6, 8), rotorMat);
    skid.rotation.x = Math.PI / 2;
    skid.position.set(sx, -1.55, 0.2);
    heli.add(skid);

    for (const sz of [-1.2, 1.2]) {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), rotorMat);
      strut.position.set(sx, -1.18, sz);
      heli.add(strut);
    }
  }

  // Spinning 4-Blade Main Rotor & Tail Rotor
  const mainRotor = new THREE.Group();
  mainRotor.position.set(0, 1.35, 0.2);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 8), rotorMat);
  mainRotor.add(mast);
  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.06, 0.36), rotorMat);
  const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 11.6), rotorMat);
  mainRotor.add(blade1, blade2);
  heli.add(mainRotor);

  const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.22), rotorMat);
  tailRotor.position.set(0.22, 1.0, -7.1);
  heli.add(tailRotor);

  // Red & Blue Belly Police Strobes
  const redBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff1e38 })
  );
  redBeacon.position.set(-0.7, -1.08, 1.2);
  heli.add(redBeacon);

  const blueBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00c8ff })
  );
  blueBeacon.position.set(0.7, -1.08, 1.2);
  heli.add(blueBeacon);

  // Volumetric Translucent Spotlight Cone projecting from Helicopter Nose to the Boulevard
  const lampHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xfff8d6 })
  );
  lampHead.position.set(0, -1.12, 2.1);
  heli.add(lampHead);

  const coneGeo = new THREE.ConeGeometry(7.2, 25, 20, 1, true);
  coneGeo.translate(0, -12.5, 0);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xfff0b8,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const spotlightCone = new THREE.Mesh(coneGeo, coneMat);
  spotlightCone.position.set(0, -1.15, 2.1);
  spotlightCone.rotation.x = 0.24;
  heli.add(spotlightCone);

  heli.position.set(-1.5, 21.5, -18);
  scene.add(heli);

  return {
    mesh: heli,
    mainRotor,
    tailRotor,
    spotlightCone,
    setVisible(v) {
      heli.visible = v;
    },
    update(time, targetPos, wantedStars) {
      heli.visible = wantedStars >= 3;
      if (!heli.visible) return;
      mainRotor.rotation.y = time * 22;
      tailRotor.rotation.x = time * 26;
      if (targetPos) {
        heli.position.x = targetPos.x + Math.sin(time * 0.6) * 4.5;
        heli.position.z = targetPos.z - 28 + Math.cos(time * 0.4) * 3.0;
        heli.position.y = 21.5 + Math.sin(time * 1.4) * 0.6;
      }
    },
  };
}
