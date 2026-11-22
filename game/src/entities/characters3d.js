// Solara Bay: Neon Dynasty (V6) — Articulated 3D Character Rigs, Detailed Firearms & Layered Muzzle Flashes
// Grounded boots touching y = 0.00, structured jacket shoulders/collar, waist belt & holster,
// distinct multi-part SMG/carbine silhouette (barrel + stock + magazine), and additive starburst muzzle flash.

const THREE = window.THREE;

let cachedMuzzleStarTex = null;

function getMuzzleFlashTexture() {
  if (cachedMuzzleStarTex) return cachedMuzzleStarTex;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);

  // Soft warm amber-orange outer bloom
  const outer = ctx.createRadialGradient(64, 64, 4, 64, 64, 58);
  outer.addColorStop(0.0, 'rgba(255, 255, 240, 1.0)');
  outer.addColorStop(0.26, 'rgba(255, 224, 108, 0.86)');
  outer.addColorStop(0.58, 'rgba(255, 118, 28, 0.34)');
  outer.addColorStop(1.0, 'rgba(255, 60, 10, 0.0)');
  ctx.fillStyle = outer;
  ctx.fillRect(0, 0, 128, 128);

  // Crisp 6-point incandescent directional muzzle flare spikes
  ctx.save();
  ctx.translate(64, 64);
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    const spikeLen = i % 2 === 0 ? 56 : 42;
    const spikeGrad = ctx.createLinearGradient(0, 0, spikeLen, 0);
    spikeGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    spikeGrad.addColorStop(0.42, 'rgba(255, 226, 112, 0.85)');
    spikeGrad.addColorStop(1.0, 'rgba(255, 120, 20, 0.0)');
    ctx.fillStyle = spikeGrad;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(spikeLen, 0);
    ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  cachedMuzzleStarTex = new THREE.CanvasTexture(canvas);
  cachedMuzzleStarTex.needsUpdate = true;
  return cachedMuzzleStarTex;
}

export function createCharacterRig(role = 'player', customPalette = null) {
  const group = new THREE.Group();

  const palettes = {
    player: { jacket: 0xd92b3a, trim: 0x181f2c, shirt: 0x151b26, pants: 0x1c2638, skin: 0xe0a57b, hair: 0x181c24 },
    police: { jacket: 0x101c33, trim: 0x24e5ff, shirt: 0x182a4a, pants: 0x0c1322, skin: 0xd89e74, hair: 0x0f172a },
    syndicate: { jacket: 0x6f28b0, trim: 0xffb830, shirt: 0x1f192b, pants: 0x1a1e29, skin: 0xc98c63, hair: 0x14141c },
    ally: { jacket: 0x168aad, trim: 0xffb830, shirt: 0x122636, pants: 0x1a2232, skin: 0xdda278, hair: 0x22181c },
    civilian: { jacket: 0xff9f1c, trim: 0x243044, shirt: 0xffffff, pants: 0x2b3a55, skin: 0xd99b72, hair: 0x261c18 },
  };
  const basePal = palettes[role] || palettes.civilian;
  const pal = customPalette ? { ...basePal, ...customPalette } : basePal;

  // Contact shadow disc at y = 0.02
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.54, 16),
    new THREE.MeshBasicMaterial({ color: 0x060911, transparent: true, opacity: 0.55, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  const pantsMat = new THREE.MeshLambertMaterial({ color: pal.pants });
  const jacketMat = new THREE.MeshLambertMaterial({ color: pal.jacket });
  const trimMat = new THREE.MeshLambertMaterial({ color: pal.trim });
  const shirtMat = new THREE.MeshLambertMaterial({ color: pal.shirt });
  const skinMat = new THREE.MeshLambertMaterial({ color: pal.skin });
  const hairMat = new THREE.MeshLambertMaterial({ color: pal.hair });
  const bootMat = new THREE.MeshLambertMaterial({ color: 0x11151d });
  const beltMat = new THREE.MeshLambertMaterial({ color: 0x141821 });
  const buckleMat = new THREE.MeshLambertMaterial({ color: 0xd6dfee });

  // 1. Articulated Left & Right Legs (exact boot sole resting at y = 0.00)
  function buildLeg(xOffset) {
    const leg = new THREE.Group();
    leg.position.set(xOffset, 0.78, 0);

    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.65, 0.23), pantsMat);
    thigh.position.y = -0.325;
    thigh.castShadow = true;
    leg.add(thigh);

    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.14, 0.31), bootMat);
    boot.position.set(0, -0.71, 0.04);
    leg.add(boot);

    return leg;
  }

  const leftLeg = buildLeg(-0.15);
  const rightLeg = buildLeg(0.15);
  group.add(leftLeg, rightLeg);

  // 2. Sculpted Waist, Tactical Belt, Buckle & Side Utility Holster
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.11, 0.33), beltMat);
  belt.position.y = 0.82;
  group.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.35), buckleMat);
  buckle.position.set(0, 0.82, 0.01);
  group.add(buckle);

  if (role !== 'civilian') {
    const holster = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.15), beltMat);
    holster.position.set(0.3, 0.76, -0.02);
    group.add(holster);
  }

  // 3. Structured Torso with Jacket, Athletic Shoulder Yoke, Collar & Back/Chest Detail
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.58, 0.3), jacketMat);
  torso.position.y = 1.16;
  torso.castShadow = true;
  group.add(torso);

  // Tailored upper shoulder yoke / jacket pads for crisp silhouette from behind & front
  const shoulderYoke = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.17, 0.33), trimMat);
  shoulderYoke.position.y = 1.4;
  shoulderYoke.castShadow = true;
  group.add(shoulderYoke);

  // Center shirt placket / tactical back spine accent
  const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.56, 0.32), shirtMat);
  chestStripe.position.y = 1.15;
  group.add(chestStripe);

  if (role === 'police') {
    // High-contrast tactical police vest plate + cyan back shoulder stripe
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.34), beltMat);
    vest.position.y = 1.18;
    group.add(vest);
    const badgeBar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 0.36), trimMat);
    badgeBar.position.y = 1.32;
    group.add(badgeBar);
  } else if (role === 'player' || role === 'ally') {
    // Stylized jacket back-accent bar for distinct over-the-shoulder hero silhouette
    const backAccent = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.33), trimMat);
    backAccent.position.y = 1.24;
    group.add(backAccent);
  }

  // Upturned Jacket Collar & Sculpted Neck
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.11, 10), trimMat);
  collar.position.y = 1.5;
  group.add(collar);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.11, 0.14, 8), skinMat);
  neck.position.y = 1.56;
  group.add(neck);

  // 4. Sculpted Head, Hair / Police Cap & Visor Shades
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.33, 0.31), skinMat);
  head.position.y = 1.74;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.35), hairMat);
  hair.position.set(0, 1.88, -0.01);
  group.add(hair);

  if (role === 'police') {
    const capBrim = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.045, 0.18), hairMat);
    capBrim.position.set(0, 1.83, 0.18);
    group.add(capBrim);
  } else {
    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.16, 0.1), hairMat);
    hairBack.position.set(0, 1.78, -0.14);
    group.add(hairBack);
  }

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.06), bootMat);
  visor.position.set(0, 1.77, 0.15);
  group.add(visor);

  // 5. Articulated Arms with Jacket Cuffs & Hands
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.37, 1.4, 0);
  const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.46, 0.18), jacketMat);
  lSleeve.position.y = -0.2;
  leftArm.add(lSleeve);
  const lCuff = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.07, 0.19), trimMat);
  lCuff.position.y = -0.42;
  leftArm.add(lCuff);
  const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.13), skinMat);
  lHand.position.y = -0.49;
  leftArm.add(lHand);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.37, 1.4, 0);
  const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.46, 0.18), jacketMat);
  rSleeve.position.y = -0.2;
  rightArm.add(rSleeve);
  const rCuff = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.07, 0.19), trimMat);
  rCuff.position.y = -0.42;
  rightArm.add(rCuff);
  const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.13), skinMat);
  rHand.position.y = -0.49;
  rightArm.add(rHand);

  // 6. Detailed Multi-Part 3D Firearm (Receiver, Barrel, Buttstock, Magazine & Sight)
  // Oriented with rotation.x = +PI/2 so when rightArm aims forward (rotation.x = -PI/2),
  // the barrel points horizontally forward (+Z) and the holo-optic sits upright (+Y).
  const gun = new THREE.Group();
  gun.position.set(0, -0.47, 0.04);
  gun.rotation.x = Math.PI / 2;

  const gunMetalMat = new THREE.MeshLambertMaterial({ color: 0x1c222e });
  const barrelSteelMat = new THREE.MeshLambertMaterial({ color: 0x455268 });
  const gripMat = new THREE.MeshLambertMaterial({ color: 0x10141c });
  const opticDotMat = new THREE.MeshBasicMaterial({ color: 0x24e5ff, fog: false });

  // Main upper receiver & shroud
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.125, 0.44), gunMetalMat);
  receiver.position.set(0, 0.02, 0.16);
  gun.add(receiver);

  // Extended cylindrical steel barrel + muzzle brake
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.34, 8), barrelSteelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.035, 0.48);
  gun.add(barrel);

  const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.034, 0.09, 8), gunMetalMat);
  muzzleBrake.rotation.x = Math.PI / 2;
  muzzleBrake.position.set(0, 0.035, 0.65);
  gun.add(muzzleBrake);

  // Tactical buttstock extending cleanly toward shoulder
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.11, 0.24), gripMat);
  stock.position.set(0, 0.005, -0.15);
  gun.add(stock);

  // Angled SMG magazine & pistol grip
  const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.21, 0.075), gripMat);
  magazine.position.set(0, -0.1, 0.22);
  magazine.rotation.x = 0.18;
  gun.add(magazine);

  const pistolGrip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.075), gripMat);
  pistolGrip.position.set(0, -0.07, 0.03);
  pistolGrip.rotation.x = -0.22;
  gun.add(pistolGrip);

  // Compact top holo-optic with cyan sight accent
  const holoSight = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.05, 0.09), gripMat);
  holoSight.position.set(0, 0.1, 0.14);
  gun.add(holoSight);

  const opticDot = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.025), opticDotMat);
  opticDot.position.set(0, 0.105, 0.18);
  gun.add(opticDot);

  // 7. Layered Additive Starburst Muzzle Flash mounted directly at the barrel tip (+Z of gun)
  const muzzleFlash = new THREE.Group();
  muzzleFlash.position.set(0, 0.035, 0.74);
  const flashMat = new THREE.MeshBasicMaterial({
    map: getMuzzleFlashTexture(),
    transparent: true,
    opacity: 0.96,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });

  // Crossed axial + front starburst planes bursting cleanly forward from the muzzle
  const flashFront = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.54), flashMat);
  flashFront.renderOrder = 14;
  muzzleFlash.add(flashFront);

  const flashHoriz = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.66), flashMat);
  flashHoriz.rotation.x = Math.PI / 2;
  flashHoriz.position.z = 0.18;
  flashHoriz.renderOrder = 14;
  muzzleFlash.add(flashHoriz);

  const flashVert = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.66), flashMat);
  flashVert.rotation.x = Math.PI / 2;
  flashVert.rotation.y = Math.PI / 2;
  flashVert.position.z = 0.18;
  flashVert.renderOrder = 14;
  muzzleFlash.add(flashVert);

  muzzleFlash.visible = false;
  gun.add(muzzleFlash);

  gun.visible = role !== 'civilian';
  rightArm.add(gun);

  group.add(rightArm);

  let aimingState = false;

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
      aimingState = Boolean(isAiming);
      if (aimingState) {
        rightArm.rotation.x = -Math.PI / 2.08;
        rightArm.rotation.z = -0.04;
        leftArm.rotation.x = -Math.PI / 2.35;
        leftArm.rotation.z = 0.34;
        gun.visible = true;
        muzzleFlash.visible = Boolean(showFlash);
      } else {
        rightArm.rotation.x = 0;
        rightArm.rotation.z = 0;
        leftArm.rotation.x = 0;
        leftArm.rotation.z = 0;
        gun.visible = role !== 'civilian';
        muzzleFlash.visible = false;
      }
    },
    animateWalk(time, speed = 1) {
      const swing = Math.sin(time * 7 * speed) * 0.45;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      if (!aimingState) {
        leftArm.rotation.x = -swing * 0.65;
        rightArm.rotation.x = swing * 0.65;
      }
    },
  };

  return group;
}
