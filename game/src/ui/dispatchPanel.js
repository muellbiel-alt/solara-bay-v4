// Solara Bay: Neon Dynasty (V5) — SBPD Tactical Police Dispatch & Synchronized 5-Star Wanted Renderer
// Guarantees 100% consistency between the top-right Wanted Stars and top-left Dispatch header badge.

const TACTIC_CLASSES = {
  RAMMING: 'tactic-ramming',
  FLANKING: 'tactic-flanking',
  SPOTLIGHT: 'tactic-spotlight',
  ROADBLOCK: 'tactic-roadblock',
  JAMMED: 'tactic-roadblock',
  BLINDED: 'tactic-flanking',
  FIRING: 'tactic-firing',
};

export function renderDispatchAndWanted(els, units, wantedStars) {
  const starCount = Math.max(0, Math.min(5, wantedStars));

  if (els.wantedStars) {
    const starSpans = els.wantedStars.querySelectorAll('.star');
    starSpans.forEach((sp, idx) => {
      sp.classList.toggle('active', idx < starCount);
    });
  }

  // Synchronized unit count and star badge (e.g. "5 UNITS · 4★" matching 4 active gold stars)
  if (els.dispatchCount) {
    els.dispatchCount.textContent = `${units.length + 1} UNITS · ${starCount}★`;
  }

  if (els.wantedPill) {
    els.wantedPill.textContent =
      starCount >= 4
        ? 'AIR-1 & ROADBLOCKS'
        : starCount >= 2
          ? 'PURSUIT IN SIGHT'
          : 'PATROL ALERT';
  }

  if (els.dispatchList) {
    els.dispatchList.innerHTML = units
      .map(
        (u) => `
      <div class="dispatch-row">
        <span class="unit-callsign">${u.callsign}</span>
        <span class="unit-dist">${u.dist} m</span>
        <span class="tactic-badge ${TACTIC_CLASSES[u.tactic] || 'tactic-ramming'}">${u.tactic}</span>
      </div>`
      )
      .join('');
  }
}
