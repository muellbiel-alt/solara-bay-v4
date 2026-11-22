// Solara Bay: Neon Dynasty (V5) — Shimmering Turquoise Ocean, Surf Foam Breakers & Coastal Yachts
// Brings the shoreline right up to x = 31 so the turquoise water, white surf breakers, sunset glint,
// and moored syndicate yachts are unmistakably clear on the right side of Palm Boulevard.

const THREE = window.THREE;

export function buildCoastalOcean(cityGroup, atlas) {
  const oceanGroup = new THREE.Group();

  // 1. Golden Sandy Beach Strip alongside Palm Boulevard East Promenade (x = 15..33)
  const sandGeo = new THREE.PlaneGeometry(22, 960);
  const sandMat = new THREE.MeshLambertMaterial({ map: atlas.sand });
  const sandMesh = new THREE.Mesh(sandGeo, sandMat);
  sandMesh.rotation.x = -Math.PI / 2;
  sandMesh.position.set(24.5, -0.015, 0);
  sandMesh.receiveShadow = true;
  oceanGroup.add(sandMesh);

  // Wet tidal shoreline sand band (x = 30.5..33.5)
  const wetSand = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 960),
    new THREE.MeshBasicMaterial({ color: 0xc29963, fog: false })
  );
  wetSand.rotation.x = -Math.PI / 2;
  wetSand.position.set(31.8, -0.012, 0);
  oceanGroup.add(wetSand);

  // 2. Shimmering Turquoise Ocean Surface (fog: false so it never washes out into white fog!)
  const oceanGeo = new THREE.PlaneGeometry(520, 1100);
  const oceanMat = new THREE.MeshPhongMaterial({
    map: atlas.ocean,
    color: 0x10d2eb,
    emissive: 0x055e78,
    shininess: 115,
    specular: new THREE.Color(0xffe094),
    fog: false,
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.rotation.x = -Math.PI / 2;
  oceanMesh.position.set(292, -0.04, 0);
  oceanGroup.add(oceanMesh);

  // Shallow Crystal-Turquoise Lagoon Band right along the beach (x = 32.5..52)
  const lagoonMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 960),
    new THREE.MeshBasicMaterial({
      color: 0x18e4f5,
      transparent: true,
      opacity: 0.76,
      fog: false,
    })
  );
  lagoonMesh.rotation.x = -Math.PI / 2;
  lagoonMesh.position.set(42.5, -0.025, 0);
  oceanGroup.add(lagoonMesh);

  // 3. Three Animated White Surf Foam Breaker Lines along the Shoreline
  const foamStrips = [];
  const foamPositionsX = [32.8, 35.6, 39.4];
  for (let i = 0; i < foamPositionsX.length; i++) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(i === 0 ? 1.15 : 0.75, 960),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xffffff : 0xd8fbff,
        transparent: true,
        opacity: i === 0 ? 0.92 : 0.72,
        fog: false,
      })
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(foamPositionsX[i], -0.01, 0);
    strip.userData.baseX = foamPositionsX[i];
    strip.userData.phase = i * 1.4;
    oceanGroup.add(strip);
    foamStrips.push(strip);
  }

  // 4. Golden Sunset Shimmer Glint Ribbons on the Turquoise Water
  for (let z = -180; z <= 120; z += 28) {
    const glint = new THREE.Mesh(
      new THREE.PlaneGeometry(14 + (Math.abs(z) % 8), 1.4),
      new THREE.MeshBasicMaterial({
        color: 0xffe49c,
        transparent: true,
        opacity: 0.58,
        fog: false,
      })
    );
    glint.rotation.x = -Math.PI / 2;
    glint.position.set(52 + ((Math.abs(z) * 3) % 24), -0.015, z);
    oceanGroup.add(glint);
  }

  // 5. Moored Luxury Coastal Yachts visible in the Turquoise Bay
  const hullMat = new THREE.MeshBasicMaterial({ color: 0xf8fbff, fog: false });
  const deckMat = new THREE.MeshBasicMaterial({ color: 0x152238, fog: false });
  const accentMat = new THREE.MeshBasicMaterial({ color: 0xffb830, fog: false });

  const yachtCoords = [
    { x: 47, z: -55, scale: 1.1, rot: 0.18 },
    { x: 58, z: -88, scale: 1.25, rot: -0.12 },
  ];
  for (const yc of yachtCoords) {
    const yacht = new THREE.Group();
    yacht.position.set(yc.x, 0.1, yc.z);
    yacht.rotation.y = yc.rot;

    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 8.6), hullMat);
    hull.position.y = 0.5;
    yacht.add(hull);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.95, 4.4), deckMat);
    cabin.position.set(0, 1.35, -0.4);
    yacht.add(cabin);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.22, 8.64), accentMat);
    stripe.position.y = 0.72;
    yacht.add(stripe);

    yacht.scale.setScalar(yc.scale);
    oceanGroup.add(yacht);
  }

  cityGroup.add(oceanGroup);

  return {
    oceanMesh,
    foamStrips,
    update(time) {
      if (atlas.ocean) {
        atlas.ocean.offset.x = (time * 0.035) % 1;
        atlas.ocean.offset.y = (time * 0.045) % 1;
      }
      for (const st of foamStrips) {
        st.position.x = st.userData.baseX + Math.sin(time * 2.2 + st.userData.phase) * 0.45;
      }
    },
  };
}
