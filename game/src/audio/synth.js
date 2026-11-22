// Solara Bay: Neon Dynasty (V5) — Procedural Web Audio Engine, Police Sirens, Gunfire & Radio Synth

export function createAudioSynth() {
  let ctx = null;

  function ensureContext() {
    if (!ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          ctx = new AudioCtx();
        } catch {
          ctx = null;
        }
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, duration = 0.12, type = 'sawtooth', gainVal = 0.08) {
    const ac = ensureContext();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      gain.gain.setValueAtTime(gainVal, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + duration);
    } catch {
      // Ignore audio errors in headless mode
    }
  }

  return {
    playGunshot() {
      playTone(145, 0.09, 'sawtooth', 0.12);
    },
    playExplosion() {
      playTone(54, 0.42, 'triangle', 0.18);
    },
    playUpgradeInstall() {
      playTone(520, 0.14, 'sine', 0.1);
      setTimeout(() => playTone(780, 0.18, 'sine', 0.1), 90);
    },
    playCrewTrigger() {
      playTone(440, 0.16, 'triangle', 0.11);
    },
    playRadioJingle(rootHz = 110) {
      playTone(rootHz * 2, 0.1, 'sine', 0.06);
      setTimeout(() => playTone(rootHz * 3, 0.14, 'sine', 0.06), 75);
    },
  };
}
