// Solara Bay: Neon Dynasty (V5) — 3-Layer Golden-Hour Lighting, Low-Sun Shadows & Siren Accent Lights
// Delegates sunset sky dome and coastal fog setup to world/sky.js.

const THREE = window.THREE;
import { createSkyDomeAndFog } from './sky.js';

export function setupGoldenHourLighting(scene) {
  const skyDome = createSkyDomeAndFog(scene);

  // Layer 1: Hemisphere Light (warm golden-coral sky, deep coastal slate bounce)
  const hemiLight = new THREE.HemisphereLight(0xffca99, 0x28344d, 0.98);
  hemiLight.position.set(0, 120, 0);
  scene.add(hemiLight);

  // Layer 2: Low-Angle Golden-Hour Directional Sun Light casting slanted building & palm shadows
  const sunLight = new THREE.DirectionalLight(0xffb258, 1.44);
  sunLight.position.set(150, 88, -175);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 480;
  const d = 140;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  // Layer 3: Dynamic Accent Lights (Police Siren Strobe & Boulevard Glow)
  const sirenRedLight = new THREE.PointLight(0xff1e42, 2.6, 42);
  sirenRedLight.position.set(-4, 4, 16);
  scene.add(sirenRedLight);

  const sirenBlueLight = new THREE.PointLight(0x00c8ff, 2.6, 42);
  sirenBlueLight.position.set(4, 4, 18);
  scene.add(sirenBlueLight);

  return {
    skyDome,
    hemiLight,
    sunLight,
    sirenRedLight,
    sirenBlueLight,
    update(time, focusPos) {
      if (focusPos) {
        skyDome.position.x = focusPos.x;
        skyDome.position.z = focusPos.z;
      }
      const pulse = Math.sin(time * 14);
      sirenRedLight.intensity = pulse > 0 ? 2.9 : 0.45;
      sirenBlueLight.intensity = pulse <= 0 ? 2.9 : 0.45;
    },
  };
}
