// Solara Bay: Neon Dynasty (V5) — Articulated 3D Player, Crew, Police Officer, Syndicate & Pedestrian Rigs
// Each character has articulated legs, boots touching y = 0.00, contact shadow disc, torso with jacket/vest,
// head with hair/cap, articulated arms, and 3D firearm attachment with dual-layer muzzle flash.

const THREE = window.THREE;

export function createCharacterRig(role = 'player', customPalette = null) {
  const group = new THREE.Group();

  const palettes = {
    player: { jacket: 0xd92b3a, shirt: 0x151b26, pants: 0x1c2638, skin: 0xe0a57b, hair: 0x181c24 },
    police: { jacket: 0x101c33, shirt: 0x24e5ff, pants: 0x0c1322, skin: 0xd89e74, hair: 0x0f172a },
    syndicate: { jacket: 0x7b2cbf, shirt: 0xffb830, pants: 0x1a1e29, skin: 0xc98c63, hair: 0x14141c },
    ally: { jacket: 0x168aad, shirt: 0xffb830, pants: 0x1a2232, skin: 0xdda278, hair: 0x22181c },
    civilian: { jacket: 0xff9f1c, shirt: 0xffffff, pants: 0x2b3a55, skin: 0xd99b72, hair: 0x261c18 },
  };
  const pal = customPalette || palettes[role] || palettes.civilian;

  // Contact shadow disc at y = 0.02
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.52, 14),
    new THREE.MeshBasicMaterial({ color: 0x060911, transparent: true, opacity: 0.55, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  const pantsMat = new THREE.MeshLambertMaterial({ color: pal.pants });
  const jacketMat = new THREE.MeshLambertMaterial({ color: pal.jacket });
  const shirtMat = new THREE.MeshLambertMaterial({ color: pal.shirt });
  const skinMat = new THREE.MeshLambertMaterial({ color: pal.skin });
  const hairMat = new THREE.MeshLambertMaterial({ color: pal.hair });
  const bootMat = new THREE.MeshLambertMaterial({ color: 0x11151d });

  // Articulated Left & Right Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.15, 0.78, 0);
  const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.68, 0.24), pantsMat);
  lThigh.position.y = -0.34;
  leftLeg.add(lThigh);
  const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.32), bootMat);
  lBoot.position.set(0, -0.71, 0.04);
  leftLeg.add(lBoot);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.15, 0.78, 0);
  const rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.68, 0.24), pantsMat);
  rThigh.position.y = -0.34;
  rightLeg.add(rThigh);
  const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.32), bootMat);
  rBoot.position.set(0, -0.71, 0.04);
  rightLeg.add(rBoot);
  group.add(rightLeg);

  // Torso with Jacket & Inner Shirt Stripe
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.68, 0.32), jacketMat);
  torso.position.y = 1.12;
  torso.castShadow = true;
  group.add(torso);

  const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.66, 0.34), shirtMat);
  chestStripe.position.y = 1.12;
  group.add(chestStripe);

  // Head & Hair / Tactical Cap
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.36), skinMat);
  head.position.y = 1.68;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.16, 0.4), hairMat);
  hair.position.set(0, 1.84, 0.02);
  group.add(hair);

  // Articulated Left & Right Arms + Weapon & Muzzle Flash
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.36, 1.38, 0);
  const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.56, 0.2), jacketMat);
  lSleeve.position.y = -0.24;
  leftArm.add(lSleeve);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.36, 1.38, 0);
  const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.56, 0.2), jacketMat);
  rSleeve.position.y = -0.24;
  rightArm.add(rSleeve);

  // 3D Weapon Mesh (Kobra SMG / Tactical Carbine) & Dual-Layer Muzzle Flash
  const gunMat = new THREE.MeshLambertMaterial({ color: 0x161b24 });
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.58), gunMat);
  gun.position.set(0, -0.46, 0.28);
  rightArm.add(gun);

  const muzzleFlash = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe46b, fog: false })
  );
  muzzleFlash.position.set(0, -0.46, 0.65);
  muzzleFlash.visible = false;
  rightArm.add(muzzleFlash);

  group.add(rightArm);

  group.userData = {
    role,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    gun,
    muzzleFlash,
    health: 100,
    setAimingPose(isAiming, showFlash = false) {
      if (isAiming) {
        rightArm.rotation.x = -Math.PI / 2.1;
        leftArm.rotation.x = -Math.PI / 2.4;
        leftArm.rotation.z = 0.28;
        gun.visible = true;
        muzzleFlash.visible = showFlash;
      } else {
        rightArm.rotation.x = 0;
        leftArm.rotation.x = 0;
        leftArm.rotation.z = 0;
        muzzleFlash.visible = false;
      }
    },
    animateWalk(time, speed = 1) {
      const swing = Math.sin(time * 7 * speed) * 0.45;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
    },
  };

  return group;
}
