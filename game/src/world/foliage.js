// Solara Bay: Neon Dynasty (V5) — Natural Curved Coconut Palms & Slanted Shadows via THREE.InstancedMesh
// Connects trunk cylinders end-to-end along continuous organic quadratic curves (zero stair-stepping)
// with two-segment arched fronds and diagonal golden-hour road shadows.

const THREE = window.THREE;

export function buildInstancedPalmFoliage(cityGroup) {
  const palmPlacements = [];

  let idx = 0;
  for (let z = -260; z <= 260; z += 17) {
    // East Promenade curbside palms (casting diagonal golden-hour shadows across the 4-lane road)
    palmPlacements.push({
      x: 13.0,
      z,
      scale: 0.96 + (idx % 3) * 0.08,
      leanAngle: 0.22 + (idx % 4) * 0.05,
      leanDir: (idx % 2 === 0 ? -0.45 : 0.35) + (idx % 3) * 0.18,
      yaw: idx * 1.1,
      castRoadShadow: true,
    });

    // Beachfront sand palm grove (gracefully curved toward the turquoise ocean)
    palmPlacements.push({
      x: 22.4 + (idx % 3) * 1.6,
      z: z + 6.5,
      scale: 0.88 + ((idx + 1) % 3) * 0.09,
      leanAngle: 0.26 + (idx % 3) * 0.06,
      leanDir: 0.25 + (idx % 2) * 0.45,
      yaw: idx * 1.7,
      castRoadShadow: true,
    });

    // West Boulevard hotel frontage palms
    if (Math.abs(z % 80) > 14) {
      palmPlacements.push({
        x: -13.0,
        z: z + 3.5,
        scale: 0.94 + (idx % 2) * 0.08,
        leanAngle: 0.18 + (idx % 3) * 0.05,
        leanDir: -0.25 + (idx % 2) * 0.35,
        yaw: idx * 2.3,
        castRoadShadow: true,
      });
    }
    idx++;
  }

  const SEGMENTS_PER_TRUNK = 7;
  const FRONDS_PER_CROWN = 9;
  const totalTrees = palmPlacements.length;
  const totalTrunkInstances = totalTrees * SEGMENTS_PER_TRUNK;
  const totalFrondInstances = totalTrees * FRONDS_PER_CROWN * 2;
  const totalShadowInstances = palmPlacements.filter((p) => p.castRoadShadow).length;

  // Slightly longer cylinder height (1.15) than step (1.0) so joints overlap seamlessly
  const trunkGeo = new THREE.CylinderGeometry(0.21, 0.28, 1.16, 8);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7d5135 });

  const frondGeo = new THREE.BoxGeometry(1.85, 0.07, 0.68);
  const frondMat = new THREE.MeshLambertMaterial({
    color: 0x289e4b,
    side: THREE.DoubleSide,
  });

  const shadowTrunkGeo = new THREE.PlaneGeometry(12.8, 0.52);
  shadowTrunkGeo.rotateX(-Math.PI / 2);
  const shadowCrownGeo = new THREE.CircleGeometry(2.65, 12);
  shadowCrownGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x0b101b,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });

  const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, totalTrunkInstances);
  const frondInstanced = new THREE.InstancedMesh(frondGeo, frondMat, totalFrondInstances);
  const shadowTrunkInstanced = new THREE.InstancedMesh(shadowTrunkGeo, shadowMat, totalShadowInstances);
  const shadowCrownInstanced = new THREE.InstancedMesh(shadowCrownGeo, shadowMat, totalShadowInstances);

  const dummy = new THREE.Object3D();
  const upVec = new THREE.Vector3(0, 1, 0);
  const segVec = new THREE.Vector3();
  let trunkCursor = 0;
  let frondCursor = 0;
  let shadowCursor = 0;

  for (const tree of palmPlacements) {
    const dirX = Math.cos(tree.leanDir);
    const dirZ = Math.sin(tree.leanDir);
    const totalH = 8.8 * tree.scale;
    const maxRun = Math.sin(tree.leanAngle) * totalH;

    // Sample smooth quadratic spine points P_0 .. P_N
    const spine = [];
    for (let s = 0; s <= SEGMENTS_PER_TRUNK; s++) {
      const t = s / SEGMENTS_PER_TRUNK;
      const curveOffset = maxRun * (t * t);
      spine.push(
        new THREE.Vector3(
          tree.x + dirX * curveOffset,
          totalH * t,
          tree.z + dirZ * curveOffset
        )
      );
    }

    // 1. Place each trunk segment along the exact vector from spine[s] to spine[s+1]
    for (let s = 0; s < SEGMENTS_PER_TRUNK; s++) {
      const p0 = spine[s];
      const p1 = spine[s + 1];
      segVec.subVectors(p1, p0);
      const segLen = segVec.length();

      dummy.position.addVectors(p0, p1).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(upVec, segVec.clone().normalize());
      const taper = (1 - s * 0.085) * tree.scale;
      dummy.scale.set(taper, segLen, taper);
      dummy.updateMatrix();
      trunkInstanced.setMatrixAt(trunkCursor++, dummy.matrix);
    }

    // 2. Place connected 2-part arched palm fronds radiating from the crown tip spine[N]
    const crownApex = spine[SEGMENTS_PER_TRUNK];
    for (let f = 0; f < FRONDS_PER_CROWN; f++) {
      const az = tree.yaw + (f * Math.PI * 2) / FRONDS_PER_CROWN;
      const fDirX = Math.cos(az);
      const fDirZ = Math.sin(az);
      const tier = f % 2;

      const innerLen = 1.65 * tree.scale;
      const innerPitch = tier === 0 ? 0.14 : -0.05;
      const jointX = crownApex.x + fDirX * Math.cos(innerPitch) * innerLen;
      const jointY = crownApex.y + Math.sin(innerPitch) * innerLen;
      const jointZ = crownApex.z + fDirZ * Math.cos(innerPitch) * innerLen;

      dummy.position.set(
        (crownApex.x + jointX) * 0.5,
        (crownApex.y + jointY) * 0.5,
        (crownApex.z + jointZ) * 0.5
      );
      dummy.rotation.set(0, -az, innerPitch);
      dummy.scale.set(tree.scale, tree.scale, tree.scale * 0.92);
      dummy.updateMatrix();
      frondInstanced.setMatrixAt(frondCursor++, dummy.matrix);

      // Connected drooping outer frond tip starting directly at (jointX, jointY, jointZ)
      const outerLen = 1.65 * tree.scale;
      const outerPitch = tier === 0 ? -0.46 : -0.64;
      const tipX = jointX + fDirX * Math.cos(outerPitch) * outerLen;
      const tipY = jointY + Math.sin(outerPitch) * outerLen;
      const tipZ = jointZ + fDirZ * Math.cos(outerPitch) * outerLen;

      dummy.position.set(
        (jointX + tipX) * 0.5,
        (jointY + tipY) * 0.5,
        (jointZ + tipZ) * 0.5
      );
      dummy.rotation.set(0, -az, outerPitch);
      dummy.scale.set(tree.scale * 0.95, tree.scale, tree.scale * 0.72);
      dummy.updateMatrix();
      frondInstanced.setMatrixAt(frondCursor++, dummy.matrix);
    }

    // 3. Long Slanted Golden-Hour Shadow projected diagonally across the asphalt
    if (tree.castRoadShadow) {
      dummy.position.set(tree.x - 5.8 * tree.scale, 0.028, tree.z + 1.8 * tree.scale);
      dummy.rotation.set(0, 0.28, 0);
      dummy.scale.set(tree.scale, 1, tree.scale);
      dummy.updateMatrix();
      shadowTrunkInstanced.setMatrixAt(shadowCursor, dummy.matrix);

      dummy.position.set(tree.x - 11.4 * tree.scale, 0.029, tree.z + 3.4 * tree.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(tree.scale, 1, tree.scale * 0.85);
      dummy.updateMatrix();
      shadowCrownInstanced.setMatrixAt(shadowCursor, dummy.matrix);
      shadowCursor++;
    }
  }

  trunkInstanced.instanceMatrix.needsUpdate = true;
  frondInstanced.instanceMatrix.needsUpdate = true;
  shadowTrunkInstanced.instanceMatrix.needsUpdate = true;
  shadowCrownInstanced.instanceMatrix.needsUpdate = true;

  cityGroup.add(trunkInstanced, frondInstanced, shadowTrunkInstanced, shadowCrownInstanced);

  return {
    trunkInstanced,
    frondInstanced,
    shadowTrunkInstanced,
    shadowCrownInstanced,
    count: totalTrees,
  };
}
