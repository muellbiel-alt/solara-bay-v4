// Solara Bay: Neon Dynasty (V5) — Crimson Taillight Ribbon Trails & Multi-Layer Nitrous Plumes
// Provides high-contrast emissive taillight motion trails and 3-layer plasma nitrous afterburners.

const THREE = window.THREE;

export function createVehicleTrails(carGroup, width, length, wheelRadius, isPolice = false) {
  const nitroFlames = [];
  const tailTrails = [];

  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xfff8d6,
    transparent: true,
    opacity: 0.96,
    fog: false,
  });
  const midMat = new THREE.MeshBasicMaterial({
    color: 0x24e5ff,
    transparent: true,
    opacity: 0.88,
    fog: false,
  });
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xff5e24,
    transparent: true,
    opacity: 0.52,
    fog: false,
  });

  // Dual multi-layer nitrous afterburner plumes
  for (const ex of [-width * 0.25, width * 0.25]) {
    const plume = new THREE.Group();
    plume.position.set(ex, wheelRadius - 0.04, -length * 0.49);

    const innerCore = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.65, 8), coreMat);
    innerCore.rotation.x = -Math.PI / 2;
    innerCore.position.z = -0.32;
    plume.add(innerCore);

    const midCone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.15, 10), midMat);
    midCone.rotation.x = -Math.PI / 2;
    midCone.position.z = -0.56;
    plume.add(midCone);

    const outerHalo = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.48, 10), outerMat);
    outerHalo.rotation.x = -Math.PI / 2;
    outerHalo.position.z = -0.72;
    plume.add(outerHalo);

    plume.visible = false;
    carGroup.add(plume);
    nitroFlames.push(plume);
  }

  // Crimson LED Taillight Motion Trails (2 layered glowing ribbons extending behind taillights)
  const trailMatOuter = new THREE.MeshBasicMaterial({
    color: 0xff1a36,
    transparent: true,
    opacity: isPolice ? 0.46 : 0.64,
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: false,
  });
  const trailMatCore = new THREE.MeshBasicMaterial({
    color: 0xff784f,
    transparent: true,
    opacity: isPolice ? 0.55 : 0.78,
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: false,
  });

  const trailLen = isPolice ? 1.85 : 2.65;
  for (const tx of [-width * 0.34, width * 0.34]) {
    const ribbon = new THREE.Group();
    ribbon.position.set(tx, wheelRadius + 0.26, -length * 0.47 - trailLen * 0.5);

    const outerPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.28, trailLen), trailMatOuter);
    outerPlane.rotation.x = -Math.PI / 2;
    ribbon.add(outerPlane);

    const corePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.12, trailLen * 0.85), trailMatCore);
    corePlane.rotation.x = -Math.PI / 2;
    corePlane.position.y = 0.01;
    ribbon.add(corePlane);

    carGroup.add(ribbon);
    tailTrails.push(ribbon);
  }

  return {
    nitroFlames,
    tailTrails,
    update(time, speed, nitroActive) {
      const pulse = 0.92 + Math.sin(time * 28) * 0.14;
      for (const fl of nitroFlames) {
        fl.visible = Boolean(nitroActive);
        if (nitroActive) {
          fl.scale.set(1, 1, pulse);
        }
      }
      const showTrails = Math.abs(speed) > 15 || nitroActive;
      for (const tr of tailTrails) {
        tr.visible = showTrails;
      }
    },
  };
}
