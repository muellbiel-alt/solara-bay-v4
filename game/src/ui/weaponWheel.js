// Solara Bay: Neon Dynasty (V5) — Sleek Translucent 4-Slot Weapon Hotbar & 3-Specialist Crew Bar

export function renderWeaponHotbar(containerEl, weapons, activeSlot) {
  if (!containerEl) return;
  containerEl.innerHTML = weapons
    .map(
      (w) => `
    <div class="weapon-slot ${w.slot === activeSlot ? 'active' : ''}">
      <span class="wpn-key">${w.slot}</span>
      <span class="wpn-name">${w.name}</span>
      <span class="wpn-ammo">${w.clip === '∞' ? '∞' : `${w.clip}/${w.reserve}`}</span>
    </div>`
    )
    .join('');
}

export function renderCrewAbilityBar(containerEl, abilities) {
  if (!containerEl) return;
  containerEl.innerHTML = abilities
    .map((ab) => {
      const status =
        ab.activeTimer > 0
          ? 'ACTIVE'
          : ab.timer > 0
            ? `${Math.ceil(ab.timer)}s`
            : 'READY';
      return `
    <div class="crew-pill">
      <span class="crew-pill-top">[${ab.key}] ${ab.title}</span>
      <span class="crew-pill-state">${ab.member} · ${status}</span>
    </div>`;
    })
    .join('');
}
