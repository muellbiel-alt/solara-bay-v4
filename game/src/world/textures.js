// Solara Bay: Neon Dynasty (V4) — High-Contrast Procedural THREE.CanvasTexture Atlas & Surface Generators
// Zero flat materials: every road, crosswalk, sidewalk, building facade, neon billboard, ocean wave,
// beach sand, alloy rim, tire tread, and vehicle body uses a rich procedural CanvasTexture.

const THREE = window.THREE;

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d') };
}

function finalizeTexture(canvas, repeatX = 1, repeatY = 1) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function createRoadTexture(repeatY = 18) {
  const { canvas, ctx } = makeCanvas(512, 512);
  // Deep charcoal asphalt base
  ctx.fillStyle = '#252a34';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle worn tire track bands in each of the 4 lanes
  const laneCenters = [84, 192, 320, 428];
  for (const lx of laneCenters) {
    const grad = ctx.createLinearGradient(lx - 36, 0, lx + 36, 0);
    grad.addColorStop(0, 'rgba(18, 22, 28, 0)');
    grad.addColorStop(0.3, 'rgba(16, 19, 25, 0.42)');
    grad.addColorStop(0.5, 'rgba(32, 37, 46, 0.25)');
    grad.addColorStop(0.7, 'rgba(16, 19, 25, 0.42)');
    grad.addColorStop(1, 'rgba(18, 22, 28, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(lx - 36, 0, 72, 512);
  }

  // Deterministic asphalt aggregate grain
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 6500; i++) {
    const x = Math.floor(rand() * 512);
    const y = Math.floor(rand() * 512);
    const bright = rand() > 0.5;
    ctx.fillStyle = bright ? 'rgba(255,255,255,0.065)' : 'rgba(0,0,0,0.14)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Concrete curb gutters & storm drain edge strips
  ctx.fillStyle = '#505968';
  ctx.fillRect(0, 0, 18, 512);
  ctx.fillRect(494, 0, 18, 512);
  ctx.fillStyle = '#181c24';
  for (let y = 24; y < 512; y += 128) {
    ctx.fillRect(4, y, 10, 26);
    ctx.fillRect(498, y, 10, 26);
  }

  // Solid white shoulder lines
  ctx.fillStyle = '#dce4f2';
  ctx.fillRect(22, 0, 6, 512);
  ctx.fillRect(484, 0, 6, 512);

  // Double yellow center line with reflective cats-eye studs
  ctx.fillStyle = '#ffb82e';
  ctx.fillRect(247, 0, 7, 512);
  ctx.fillRect(258, 0, 7, 512);
  ctx.fillStyle = '#fff3b8';
  for (let y = 16; y < 512; y += 64) {
    ctx.fillRect(249, y, 3, 8);
    ctx.fillRect(260, y, 3, 8);
  }

  // White dashed lane dividers (4-lane highway)
  ctx.fillStyle = '#eef4ff';
  for (let y = 18; y < 512; y += 84) {
    ctx.fillRect(136, y, 6, 44);
    ctx.fillRect(370, y, 6, 44);
  }

  return finalizeTexture(canvas, 1, repeatY);
}

export function createCrosswalkTexture() {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#242933';
  ctx.fillRect(0, 0, 512, 512);

  let seed = 9001;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 4500; i++) {
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)';
    ctx.fillRect(Math.floor(rand() * 512), Math.floor(rand() * 512), 2, 2);
  }

  // Stop bars & high-contrast white zebra crosswalks on all 4 edges
  ctx.fillStyle = '#f0f5ff';
  for (let i = 36; i < 476; i += 36) {
    // North & South zebra bars
    ctx.fillRect(i, 18, 22, 58);
    ctx.fillRect(i, 436, 22, 58);
    // West & East zebra bars
    ctx.fillRect(18, i, 58, 22);
    ctx.fillRect(436, i, 58, 22);
  }

  // Yellow intersection corner brackets
  ctx.strokeStyle = '#ffb82e';
  ctx.lineWidth = 5;
  ctx.strokeRect(84, 84, 344, 344);

  return finalizeTexture(canvas, 1, 1);
}

export function createSidewalkTexture(repeatX = 2, repeatY = 24) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#9aa3b2';
  ctx.fillRect(0, 0, 256, 256);

  // Coastal travertine stone paver grid
  const tile = 64;
  for (let y = 0; y < 256; y += tile) {
    for (let x = 0; x < 256; x += tile) {
      const shade = ((x + y) / tile) % 2 === 0 ? '#a6afbe' : '#919ba9';
      ctx.fillStyle = shade;
      ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
      ctx.strokeStyle = '#687282';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, tile - 2, tile - 2);
    }
  }

  // Curb highlight strip
  ctx.fillStyle = '#c8d0de';
  ctx.fillRect(0, 0, 14, 256);
  ctx.fillRect(242, 0, 14, 256);

  return finalizeTexture(canvas, repeatX, repeatY);
}

export function createBuildingFacadeTexture(styleIndex = 0) {
  const { canvas, ctx } = makeCanvas(512, 512);
  const palettes = [
    // 0: Art-Deco Coastal Hotel (Warm cream/coral with golden & cyan lit windows)
    { wall: '#e8c4a8', trim: '#f7dfd0', accent: '#ff5e6c', winDark: '#19253a', winWarm: '#ffd275', winCyan: '#5ce8ff' },
    // 1: Downtown Neon Glass Skyscraper (Deep midnight blue with glowing cyan & amber grids)
    { wall: '#16243b', trim: '#253b5e', accent: '#24e5ff', winDark: '#0d1626', winWarm: '#ffbe4f', winCyan: '#38ecff' },
    // 2: Tropical Resort / Casino (Sunset terracotta & gold)
    { wall: '#c96f5b', trim: '#f0b67f', accent: '#ffb830', winDark: '#211c30', winWarm: '#ffe082', winCyan: '#6bf2ff' },
    // 3: Night Market / Commercial Block (Slate concrete with neon awning bands)
    { wall: '#323d52', trim: '#4b5a75', accent: '#ff4d5e', winDark: '#141b29', winWarm: '#ffca5c', winCyan: '#2ee889' },
    // 4: Harbor Warehouse / Costa Customs (Weathered industrial brick & steel ribs)
    { wall: '#6e3b32', trim: '#8c5246', accent: '#ffb830', winDark: '#18202c', winWarm: '#ffcf6e', winCyan: '#4ae8ff' },
    // 5: Executive Financial Tower (Platinum-bronze curtain wall)
    { wall: '#4b5568', trim: '#738199', accent: '#ffd046', winDark: '#172133', winWarm: '#ffd87a', winCyan: '#75f0ff' },
  ];
  const pal = palettes[styleIndex % palettes.length];

  // Base architectural wall
  ctx.fillStyle = pal.wall;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle vertical pilasters
  ctx.fillStyle = pal.trim;
  for (let x = 0; x < 512; x += 64) {
    ctx.fillRect(x, 0, 10, 512);
  }

  // Horizontal floor spandrel bands & neon accent cornices
  const floors = 8;
  const floorH = 512 / floors;
  let seed = 400 + styleIndex * 97;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let f = 0; f < floors; f++) {
    const y = f * floorH;
    // Floor slab & balcony rail
    ctx.fillStyle = pal.trim;
    ctx.fillRect(0, y, 512, 8);
    if (f === 0 || f === floors - 1) {
      ctx.fillStyle = pal.accent;
      ctx.fillRect(0, y + 8, 512, 4);
    }

    // Windows across each floor
    for (let col = 0; col < 8; col++) {
      const wx = col * 64 + 14;
      const wy = y + 14;
      const ww = 42;
      const wh = floorH - 22;

      const r = rand();
      if (f === floors - 1) {
        // Ground-floor glowing storefront arcade
        ctx.fillStyle = pal.winWarm;
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = pal.accent;
        ctx.fillRect(wx - 2, wy - 4, ww + 4, 7);
      } else {
        if (r < 0.45) {
          ctx.fillStyle = pal.winWarm;
        } else if (r < 0.68) {
          ctx.fillStyle = pal.winCyan;
        } else {
          ctx.fillStyle = pal.winDark;
        }
        ctx.fillRect(wx, wy, ww, wh);

        // Window mullion frame
        ctx.strokeStyle = 'rgba(10, 15, 25, 0.55)';
        ctx.lineWidth = 2;
        ctx.strokeRect(wx, wy, ww, wh);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fillRect(wx + 3, wy + 3, ww - 6, 4);
      }
    }
  }

  return finalizeTexture(canvas, 1, 1);
}

export function createNeonSignTexture(title, subtitle, bgHex = '#0c1324', borderHex = '#24e5ff', textHex = '#ffb830') {
  const { canvas, ctx } = makeCanvas(512, 160);
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 160);

  // Outer glowing neon tube frame
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 144);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, 484, 132);

  // Main title
  ctx.fillStyle = textHex;
  ctx.font = '900 54px Impact, Arial Black, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 256, 68);

  // Subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 22px Segoe UI, Arial, sans-serif';
  ctx.fillText(subtitle, 256, 122);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function createOceanTexture() {
  const { canvas, ctx } = makeCanvas(512, 512);
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#095f7a');
  grad.addColorStop(0.5, '#0c7c96');
  grad.addColorStop(1, '#084e69');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Sun-glint ripples & turquoise wave crests
  for (let y = 0; y < 512; y += 16) {
    ctx.fillStyle = y % 32 === 0 ? 'rgba(130, 245, 255, 0.28)' : 'rgba(255, 210, 140, 0.22)';
    for (let x = 0; x < 512; x += 64) {
      const offset = (y * 1.3) % 48;
      ctx.fillRect((x + offset) % 512, y, 36, 4);
    }
  }

  return finalizeTexture(canvas, 14, 14);
}

export function createBeachSandTexture() {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#e8c792';
  ctx.fillRect(0, 0, 256, 256);

  let seed = 777;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 3200; i++) {
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255, 248, 225, 0.25)' : 'rgba(175, 135, 85, 0.22)';
    ctx.fillRect(Math.floor(rand() * 256), Math.floor(rand() * 256), 2, 2);
  }
  return finalizeTexture(canvas, 4, 28);
}

export function createWheelRimTexture() {
  const { canvas, ctx } = makeCanvas(256, 256);
  const cx = 128;
  const cy = 128;

  // Outer rubber tire sidewall
  ctx.fillStyle = '#14171d';
  ctx.beginPath();
  ctx.arc(cx, cy, 126, 0, Math.PI * 2);
  ctx.fill();

  // Tire sidewall performance lettering ring
  ctx.strokeStyle = '#2d3340';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 108, 0, Math.PI * 2);
  ctx.stroke();

  // Dark brake rotor cavity
  ctx.fillStyle = '#1b202b';
  ctx.beginPath();
  ctx.arc(cx, cy, 92, 0, Math.PI * 2);
  ctx.fill();

  // Crimson sport brake caliper
  ctx.fillStyle = '#ff2e44';
  ctx.beginPath();
  ctx.arc(cx, cy, 74, -0.45, 0.45);
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#ff2e44';
  ctx.stroke();

  // Metallic alloy outer lip
  ctx.strokeStyle = '#d8e2f0';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 88, 0, Math.PI * 2);
  ctx.stroke();

  // 10 machined twin-spokes
  ctx.strokeStyle = '#e4ecf7';
  ctx.lineWidth = 10;
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 20);
    ctx.lineTo(cx + Math.cos(angle) * 86, cy + Math.sin(angle) * 86);
    ctx.stroke();
  }

  // Center lug cap
  ctx.fillStyle = '#ffb830';
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#121620';
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function createTireTreadTexture() {
  const { canvas, ctx } = makeCanvas(256, 128);
  ctx.fillStyle = '#15181f';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#252a36';
  for (let x = 0; x < 256; x += 16) {
    ctx.fillRect(x, 8, 8, 44);
    ctx.fillRect(x + 8, 76, 8, 44);
  }
  ctx.fillStyle = '#0d0f14';
  ctx.fillRect(0, 56, 256, 16);

  return finalizeTexture(canvas, 4, 1);
}

export function createVehicleBodyTexture(baseHex = '#e83128', accentHex = '#151b26', isPolice = false) {
  const { canvas, ctx } = makeCanvas(512, 256);
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 256);

  if (isPolice) {
    // High-contrast white doors + cyan/gold tactical stripe + SBPD text
    ctx.fillStyle = '#f2f6fc';
    ctx.fillRect(140, 0, 230, 256);
    ctx.fillStyle = '#24e5ff';
    ctx.fillRect(0, 170, 512, 18);
    ctx.fillStyle = '#ffb830';
    ctx.fillRect(0, 188, 512, 8);
    ctx.fillStyle = '#0d1526';
    ctx.font = '900 44px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SBPD', 256, 128);
  } else {
    // Metallic racing gradient & sculpted panel seam lines
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(255,255,255,0.22)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Side carbon intake stripe & door panel seams
    ctx.fillStyle = accentHex;
    ctx.fillRect(0, 198, 512, 26);
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(120, 24, 260, 190);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function createGarageFloorTexture() {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#182030';
  ctx.fillRect(0, 0, 512, 512);

  // Studio tile grid
  ctx.strokeStyle = '#28354d';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Yellow workshop hazard stripes
  ctx.fillStyle = '#ffb830';
  for (let i = 0; i < 512; i += 48) {
    ctx.fillRect(i, 0, 24, 14);
    ctx.fillRect(i, 498, 24, 14);
  }

  return finalizeTexture(canvas, 6, 6);
}

export function createContainerTexture(baseHex = '#d9483b', label = 'SOLARA CARGO') {
  const { canvas, ctx } = makeCanvas(512, 256);
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 256);

  // Corrugated vertical steel ribs
  for (let x = 0; x < 512; x += 24) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x, 0, 8, 256);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x + 8, 0, 6, 256);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = '900 42px Impact, Arial Black, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 256, 134);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function createTextureAtlas() {
  const facades = [0, 1, 2, 3, 4, 5].map((i) => createBuildingFacadeTexture(i));
  return {
    road: createRoadTexture(18),
    crosswalk: createCrosswalkTexture(),
    sidewalk: createSidewalkTexture(2, 24),
    facades,
    ocean: createOceanTexture(),
    sand: createBeachSandTexture(),
    wheelRim: createWheelRimTexture(),
    tireTread: createTireTreadTexture(),
    garageFloor: createGarageFloorTexture(),
    containerRed: createContainerTexture('#c93b2b', 'SOLARA CARGO'),
    containerBlue: createContainerTexture('#1b6ca8', 'PACIFIC LINE'),
    containerGold: createContainerTexture('#d48b1e', 'HARBOR LOGISTICS'),
  };
}
