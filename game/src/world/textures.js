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
  grad.addColorStop(0, '#0496b8');
  grad.addColorStop(0.5, '#00c6e0');
  grad.addColorStop(1, '#067da0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Sparkling sunset glints & turquoise wave foam crests
  for (let y = 0; y < 512; y += 14) {
    ctx.fillStyle = y % 28 === 0 ? 'rgba(185, 253, 255, 0.48)' : 'rgba(255, 224, 132, 0.36)';
    for (let x = 0; x < 512; x += 56) {
      const offset = (y * 1.4) % 44;
      ctx.fillRect((x + offset) % 512, y, 38, 4);
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
  // Deep charcoal-slate glossy epoxy workshop floor
  ctx.fillStyle = '#141b26';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle epoxy concrete tonal mottling & clear-coat sheen
  let seed = 6102;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 1800; i++) {
    const x = Math.floor(rand() * 512);
    const y = Math.floor(rand() * 512);
    const s = 3 + Math.floor(rand() * 10);
    ctx.fillStyle = rand() > 0.5 ? 'rgba(92, 134, 192, 0.045)' : 'rgba(6, 9, 15, 0.14)';
    ctx.fillRect(x, y, s, s);
  }

  // Diagonal light-reflection sheen sweep across the epoxy tiles
  const sheen = ctx.createLinearGradient(0, 0, 512, 512);
  sheen.addColorStop(0.0, 'rgba(180, 224, 255, 0.07)');
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
  sheen.addColorStop(1.0, 'rgba(130, 190, 255, 0.08)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 512, 512);

  // Crisp concrete expansion joint grid
  ctx.strokeStyle = '#253247';
  ctx.lineWidth = 2.5;
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

  // Bay edge yellow-and-black workshop caution chevrons
  ctx.fillStyle = '#0d1118';
  ctx.fillRect(0, 0, 512, 16);
  ctx.fillRect(0, 496, 512, 16);
  ctx.fillStyle = '#ffb830';
  for (let i = -16; i < 528; i += 36) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 18, 0);
    ctx.lineTo(i + 8, 16);
    ctx.lineTo(i - 10, 16);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(i, 496);
    ctx.lineTo(i + 18, 496);
    ctx.lineTo(i + 8, 512);
    ctx.lineTo(i - 10, 512);
    ctx.closePath();
    ctx.fill();
  }

  return finalizeTexture(canvas, 5, 5);
}

export function createGarageWallTexture() {
  const { canvas, ctx } = makeCanvas(512, 512);
  // Upper industrial corrugated steel cladding (y = 0 .. 310)
  ctx.fillStyle = '#242e3f';
  ctx.fillRect(0, 0, 512, 310);

  for (let x = 0; x < 512; x += 24) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
    ctx.fillRect(x, 0, 7, 310);
    ctx.fillStyle = 'rgba(210, 232, 255, 0.08)';
    ctx.fillRect(x + 7, 0, 5, 310);
  }

  // Horizontal steel girder & bolt trim seams
  ctx.fillStyle = '#18202e';
  ctx.fillRect(0, 148, 512, 14);
  ctx.fillStyle = '#475975';
  for (let x = 14; x < 512; x += 32) {
    ctx.fillRect(x, 152, 6, 6);
  }

  // Crisp yellow-and-black industrial hazard stripe dado belt (y = 310 .. 346)
  ctx.fillStyle = '#10141d';
  ctx.fillRect(0, 310, 512, 36);
  ctx.fillStyle = '#ffb830';
  for (let x = -40; x < 552; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 310);
    ctx.lineTo(x + 24, 310);
    ctx.lineTo(x + 4, 346);
    ctx.lineTo(x - 20, 346);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#24e5ff';
  ctx.fillRect(0, 306, 512, 4);

  // Lower workshop masonry / brick & dark concrete block wainscot (y = 346 .. 512)
  ctx.fillStyle = '#2c3340';
  ctx.fillRect(0, 346, 512, 166);
  const brickH = 22;
  const brickW = 64;
  for (let row = 0; row < 8; row++) {
    const by = 348 + row * brickH;
    const offset = (row % 2) * (brickW / 2);
    for (let bx = -brickW; bx < 512 + brickW; bx += brickW) {
      const shade = (row + Math.floor(bx / brickW)) % 2 === 0 ? '#363f50' : '#2d3545';
      ctx.fillStyle = shade;
      ctx.fillRect(bx + offset + 2, by + 2, brickW - 4, brickH - 4);
      ctx.strokeStyle = '#191f2a';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + offset + 1, by + 1, brickW - 2, brickH - 2);
    }
  }

  return finalizeTexture(canvas, 3, 1);
}

export function createToolCabinetTexture() {
  const { canvas, ctx } = makeCanvas(256, 256);
  // Matte black steel cabinet frame
  ctx.fillStyle = '#151a24';
  ctx.fillRect(0, 0, 256, 256);

  // Crimson powder-coated outer chassis border
  ctx.strokeStyle = '#cf2434';
  ctx.lineWidth = 10;
  ctx.strokeRect(6, 6, 244, 244);

  // 6 Recessed red mechanic tool drawers with brushed aluminum handles
  const drawerHeights = [28, 28, 32, 34, 40, 48];
  let curY = 18;
  for (const dh of drawerHeights) {
    ctx.fillStyle = '#c82030';
    ctx.fillRect(18, curY, 220, dh - 5);
    ctx.fillStyle = '#e83c4c';
    ctx.fillRect(18, curY, 220, 4);
    ctx.fillStyle = '#7e121d';
    ctx.fillRect(18, curY + dh - 8, 220, 3);
    // Silver brushed handle strip
    ctx.fillStyle = '#dce6f5';
    ctx.fillRect(58, curY + 7, 140, 6);
    ctx.fillStyle = '#242c3b';
    ctx.fillRect(62, curY + 13, 132, 3);
    curY += dh;
  }

  // Chrome key lock barrel top-right
  ctx.fillStyle = '#e5eefb';
  ctx.beginPath();
  ctx.arc(224, 28, 6, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function createHydraulicPillarTexture() {
  const { canvas, ctx } = makeCanvas(128, 512);
  // Industrial amber-gold steel column with recessed hydraulic channel
  ctx.fillStyle = '#dfa024';
  ctx.fillRect(0, 0, 128, 512);

  // Dark vertical carriage slide track & bolt rivets
  ctx.fillStyle = '#1b2230';
  ctx.fillRect(42, 18, 44, 420);
  ctx.fillStyle = '#334057';
  ctx.fillRect(50, 24, 28, 408);

  // Horizontal locking teeth inside lift column
  ctx.fillStyle = '#0e131c';
  for (let y = 32; y < 424; y += 26) {
    ctx.fillRect(46, y, 36, 10);
  }

  // Side structural flanges & rivets
  ctx.fillStyle = '#b07b16';
  ctx.fillRect(0, 0, 12, 512);
  ctx.fillRect(116, 0, 12, 512);
  ctx.fillStyle = '#ffe08a';
  ctx.fillRect(14, 0, 4, 512);

  // Bottom black-yellow safety chevron cuff
  ctx.fillStyle = '#111620';
  ctx.fillRect(0, 442, 128, 70);
  ctx.fillStyle = '#ffb830';
  for (let x = -32; x < 160; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 442);
    ctx.lineTo(x + 16, 442);
    ctx.lineTo(x - 4, 512);
    ctx.lineTo(x - 20, 512);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function createTurntableDeckTexture() {
  const { canvas, ctx } = makeCanvas(512, 512);
  const cx = 256;
  const cy = 256;

  // Brushed dark gunmetal steel deck base
  const bg = ctx.createRadialGradient(cx, cy, 24, cx, cy, 256);
  bg.addColorStop(0.0, '#2a354a');
  bg.addColorStop(0.58, '#1e2738');
  bg.addColorStop(0.92, '#161e2c');
  bg.addColorStop(1.0, '#101621');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle concentric lathe-turned precision rings
  ctx.strokeStyle = 'rgba(180, 210, 255, 0.14)';
  ctx.lineWidth = 2;
  for (const r of [64, 118, 172, 216, 238]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radial calibration ticks around outer rim
  ctx.strokeStyle = 'rgba(255, 184, 48, 0.45)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 214 : 226;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * 242, cy + Math.sin(a) * 242);
    ctx.stroke();
  }

  // Cyan inner technical accent ring
  ctx.strokeStyle = 'rgba(36, 229, 255, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 176, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function createHvacTexture() {
  const { canvas, ctx } = makeCanvas(256, 128);
  // Galvanized rooftop mechanical steel housing
  ctx.fillStyle = '#536073';
  ctx.fillRect(0, 0, 256, 128);

  // Panel frames
  ctx.strokeStyle = '#2d3746';
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, 248, 120);
  ctx.strokeRect(128, 4, 124, 120);

  // Louvered intake vents on left panel
  ctx.fillStyle = '#1c2430';
  for (let y = 18; y < 108; y += 11) {
    ctx.fillRect(16, y, 98, 6);
  }

  // Circular exhaust fan grille on right panel
  ctx.fillStyle = '#18202b';
  ctx.beginPath();
  ctx.arc(190, 64, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7b8ba3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(190, 64, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(190, 64, 24, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
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
    garageWall: createGarageWallTexture(),
    toolCabinet: createToolCabinetTexture(),
    hydraulicPillar: createHydraulicPillarTexture(),
    turntableDeck: createTurntableDeckTexture(),
    hvac: createHvacTexture(),
    containerRed: createContainerTexture('#c93b2b', 'SOLARA CARGO'),
    containerBlue: createContainerTexture('#1b6ca8', 'PACIFIC LINE'),
    containerGold: createContainerTexture('#d48b1e', 'HARBOR LOGISTICS'),
  };
}
