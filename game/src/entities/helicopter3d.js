// Solara Bay: Neon Dynasty (V5) — Sculpted SBPD Falcon-1 Pursuit Helicopter & Dual Volumetric Spotlight
// Features raked glass cockpit nose, turbine engine cowling, structural tail boom & tail rotor,
// red-green navigation lights, landing skids, and dual-layer volumetric spotlight beam.

const THREE = window.THREE;

export function createPoliceHelicopter(scene) {
  const heli = new THREE.Group();

  const navyMat = new THREE.MeshPhongMaterial({ color: 0x0d1628, shininess: 95 });
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf2f7ff });
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xffb830, fog: false });
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0x1ee2ff,
    shininess: 140,
    transparent: true,
    opacity: 0.82,
  });
  const rotorMat = new THREE.MeshBasicMaterial({ color: 0x141b26 });

  // Sculpted Aerodynamic Fuselage Core & Sloped Nose Wedge
  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.85, 4.4), navyMat);
  heli.add(fuselage);

  const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.65, 3.2), navyMat);
  upperDeck.position.set(0, 1.1, -0.2);
  heli.add(upperDeck);

  // White & Gold SBPD Tactical Livery Band
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.48, 4.44), whiteMat);
  stripe.position.y = -0.18;
  heli.add(stripe);

  const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.12, 4.46), goldMat);
  goldTrim.position.y = -0.45;
  heli.add(goldTrim);

  // Angled Glass Cockpit Nose Canopy with Structural Frame Rib
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.18, 16, 14), glassMat);
  canopy.scale.set(0.96, 0.82, 1.48);
  canopy.position.set(0, -0.06, 1.75);
  canopy.rotation.x = 0.16;
  heli.add(canopy);

  const noseChin = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.52, 1.45), navyMat);
  noseChin.position.set(0, -0.62, 2.15);
  noseChin.rotation.x = 0.24;
  heli.add(noseChin);

  // Side Avionics / Sensor Pods
  for (const px of [-1.32, 1.32]) {
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 2.2), navyMat);
    pod.position.set(px, -0.35, 0.1);
    heli.add(pod);
  }

  // Tapered Structural Tail Boom, Horizontal Stabilizers & Vertical Swept Fin
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.64, 5.6), navyMat);
  boom.position.set(0, 0.28, -4.6);
  boom.rotation.x = 0.04;
  heli.add(boom);

  const hStab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.65), whiteMat);
  hStab.position.set(0, 0.35, -6.1);
  heli.add(hStab);

  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.95, 1.25), whiteMat);
  fin.position.set(0, 1.05, -6.95);
  fin.rotation.x = -0.18;
  heli.add(fin);

  // Landing Skids with Curved Front Toe Tips & Struts
  for (const sx of [-1.18, 1.18]) {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 4.8, 8), rotorMat);
    skid.rotation.x = Math.PI / 2;
    skid.position.set(sx, -1.52, 0.25);
    heli.add(skid);

    const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.75, 8), rotorMat);
    toe.rotation.x = Math.PI / 3;
    toe.position.set(sx, -1.36, 2.75);
    heli.add(toe);

    for (const sz of [-1.25, 1.25]) {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.82, 6), rotorMat);
      strut.position.set(sx, -1.12, sz);
      strut.rotation.z = sx > 0 ? 0.18 : -0.18;
      heli.add(strut);
    }
  }

  // Spinning 4-Blade Main Rotor & 4-Blade Tail Rotor
  const mainRotor = new THREE.Group();
  mainRotor.position.set(0, 1.58, 0.15);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.55, 10), rotorMat);
  mainRotor.add(mast);
  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.06, 0.38), rotorMat);
  const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 12.2), rotorMat);
  mainRotor.add(blade1, blade2);
  heli.add(mainRotor);

  const tailRotor = new THREE.Group();
  tailRotor.position.set(0.22, 1.15, -7.15);
  const tr1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.25, 0.2), rotorMat);
  const tr2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 2.25), rotorMat);
  tailRotor.add(tr1, tr2);
  heli.add(tailRotor);

  // Port Red & Starboard Green Navigation Lights + Belly Police Strobes
  const navRed = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2442, fog: false })
  );
  navRed.position.set(-1.52, -0.35, 0.4);
  heli.add(navRed);

  const navGreen = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x22ff7a, fog: false })
  );
  navGreen.position.set(1.52, -0.35, 0.4);
  heli.add(navGreen);

  const redBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff1e38, fog: false })
  );
  redBeacon.position.set(-0.68, -1.04, 1.25);
  heli.add(redBeacon);

  const blueBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00d0ff, fog: false })
  );
  blueBeacon.position.set(0.68, -1.04, 1.25);
  heli.add(blueBeacon);

  // Gimbal Searchlight & Dual-Layer Volumetric Spotlight Cone (fog: false for razor-sharp beam)
  const lampHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.36, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xfffce6, fog: false })
  );
  lampHead.position.set(0, -1.08, 2.35);
  heli.add(lampHead);

  const spotlightGroup = new THREE.Group();
  spotlightGroup.position.set(0, -1.1, 2.35);
  spotlightGroup.rotation.x = 0.24;

  const outerConeGeo = new THREE.ConeGeometry(7.4, 24.5, 22, 1, true);
  outerConeGeo.translate(0, -12.25, 0);
  const outerCone = new THREE.Mesh(
    outerConeGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfff2b8,
      transparent: true,
      opacity: 0.21,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    })
  );
  spotlightGroup.add(outerCone);

  const innerConeGeo = new THREE.ConeGeometry(3.5, 24.2, 18, 1, true);
  innerConeGeo.translate(0, -12.1, 0);
  const innerCone = new THREE.Mesh(
    innerConeGeo,
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    })
  );
  spotlightGroup.add(innerCone);
  heli.add(spotlightGroup);

  heli.position.set(-1.5, 21.5, -18);
  scene.add(heli);

  return {
    mesh: heli,
    mainRotor,
    tailRotor,
    spotlightCone: spotlightGroup,
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
