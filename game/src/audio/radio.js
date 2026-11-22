// Solara Bay: Neon Dynasty (V5) — Coastal FM Radio Controller & Synth Chord Loop

import { RADIO_STATIONS } from '../core/config.js';

export function createRadioController(audioSynth) {
  let index = 0;

  function getCurrentStation() {
    return RADIO_STATIONS[index] || RADIO_STATIONS[0];
  }

  function cycleNextStation() {
    index = (index + 1) % RADIO_STATIONS.length;
    const station = getCurrentStation();
    if (audioSynth && audioSynth.playRadioJingle) {
      audioSynth.playRadioJingle(station.rootHz);
    }
    return station;
  }

  function formatReadout() {
    const st = getCurrentStation();
    return `${st.name} · ${st.track}`;
  }

  return {
    getCurrentStation,
    cycleNextStation,
    formatReadout,
  };
}
