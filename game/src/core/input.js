// Solara Bay: Neon Dynasty (V4) — Keyboard, Mouse-Look, Driving & Tactical Action Input Controller

export function createInputController(canvas) {
  const keys = new Set();
  const justPressed = new Set();
  const mouse = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    firing: false,
    aiming: false,
    locked: false,
  };

  window.addEventListener('keydown', (e) => {
    const code = e.code;
    if (!keys.has(code)) {
      justPressed.add(code);
    }
    keys.add(code);
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (document.pointerLockElement === canvas) {
      mouse.dx += e.movementX || 0;
      mouse.dy += e.movementY || 0;
    }
  });

  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) mouse.firing = true;
      if (e.button === 2) mouse.aiming = true;
    });
  }

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.firing = false;
    if (e.button === 2) mouse.aiming = false;
  });

  window.addEventListener('contextmenu', (e) => e.preventDefault());

  return {
    keys,
    mouse,
    isDown(code) {
      return keys.has(code);
    },
    consumePress(code) {
      if (justPressed.has(code)) {
        justPressed.delete(code);
        return true;
      }
      return false;
    },
    clearFrame() {
      justPressed.clear();
      mouse.dx = 0;
      mouse.dy = 0;
    },
    getThrottle() {
      let val = 0;
      if (keys.has('KeyW') || keys.has('ArrowUp')) val += 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) val -= 1;
      return val;
    },
    getSteer() {
      let val = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) val += 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) val -= 1;
      return val;
    },
    isHandbrake() {
      return keys.has('Space');
    },
    isNitro() {
      return keys.has('ShiftLeft') || keys.has('ShiftRight');
    },
  };
}
