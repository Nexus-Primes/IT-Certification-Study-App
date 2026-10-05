// ---------- Color picker popover ----------
// The browser's own <input type="color"> popup can't be themed at all (it is OS chrome), so every
// place that lets you choose a color opens this one instead — built from the app's own tokens,
// with the same pieces as the native one: a saturation/brightness field, a hue slider, hex and
// RGB entry, and an eyedropper where the browser offers one. It previews live while you drag and
// only saves when you finish: Done, a click elsewhere, or Enter in the hex box keeps the color;
// Cancel or Escape puts everything back.
//
// This module only draws the picker and reports what was chosen. What a color means (an accent, an
// avatar, a highlight slot) is decided by the caller through live / cancel / commit.
import { icon } from './utils.js?v=4';
import { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, normalizeHex, clamp01 } from './color.js?v=1';
import { registerCustomPopover, releaseCustomPopover } from './controls.js?v=1';

let activeTrigger = null;
// The button that opened the picker that is open right now, or null.
export function activeColorPickerTrigger() { return activeTrigger; }

export function openColorPicker({ trigger, kind, slot, label, start, live, cancel, commit, onCommitted }) {
  const original = normalizeHex(start) || '#2dd4bf';
  let [h, s, v] = rgbToHsv(hexToRgb(original));
  const pop = document.createElement('div');
  pop.className = 'cp-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', `${label} picker`);
  const eyedropper = 'EyeDropper' in window
    ? `<button type="button" class="icon-button small cp-eyedropper" aria-label="Pick a color from the screen" title="Pick a color from the screen">${icon('eyedropper')}</button>` : '';
  pop.innerHTML = `
    <div class="cp-sv" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100" aria-label="Color saturation and brightness. Arrow keys adjust; hold Shift for bigger steps."><i class="cp-sv-thumb"></i></div>
    <div class="cp-controls">
      <span class="cp-preview" title="Original and new color"><i class="cp-old"></i><i class="cp-new"></i></span>
      <input class="cp-hue" type="range" min="0" max="360" step="1" aria-label="Hue">
      ${eyedropper}
    </div>
    <div class="cp-fields">
      <label>Hex<input class="cp-hex" type="text" maxlength="7" spellcheck="false" autocomplete="off"></label>
      <label>R<input class="cp-r" type="number" min="0" max="255" inputmode="numeric"></label>
      <label>G<input class="cp-g" type="number" min="0" max="255" inputmode="numeric"></label>
      <label>B<input class="cp-b" type="number" min="0" max="255" inputmode="numeric"></label>
    </div>
    <div class="cp-actions"><button type="button" class="ghost small" data-cp="cancel">Cancel</button><button type="button" class="primary small" data-cp="done">Done</button></div>`;
  (trigger.closest('.swatch-row') || trigger.parentElement).appendChild(pop);
  const q = sel => pop.querySelector(sel);
  const sv = q('.cp-sv'), hue = q('.cp-hue'), hexInput = q('.cp-hex');
  const rgbInputs = { r: q('.cp-r'), g: q('.cp-g'), b: q('.cp-b') };
  q('.cp-old').style.background = original;

  const currentHex = () => rgbToHex(hsvToRgb([h, s, v]));
  // `skip` is the field being typed in, so its text is not rewritten under the cursor. Nothing is
  // previewed until the first real change, so merely opening the picker never alters the page.
  let interacted = false;
  const paint = skip => {
    const rgb = hsvToRgb([h, s, v]).map(Math.round); const hex = rgbToHex(rgb);
    pop.style.setProperty('--cp-hue', String(Math.round(h)));
    pop.style.setProperty('--cp-color', hex);
    sv.style.setProperty('--cp-x', `${s * 100}%`); sv.style.setProperty('--cp-y', `${(1 - v) * 100}%`);
    sv.setAttribute('aria-valuenow', String(Math.round(s * 100)));
    sv.setAttribute('aria-valuetext', `Saturation ${Math.round(s * 100)} percent, brightness ${Math.round(v * 100)} percent`);
    if (skip !== hue) hue.value = String(Math.round(h));
    if (skip !== hexInput) hexInput.value = hex;
    if (skip !== rgbInputs.r) rgbInputs.r.value = rgb[0];
    if (skip !== rgbInputs.g) rgbInputs.g.value = rgb[1];
    if (skip !== rgbInputs.b) rgbInputs.b.value = rgb[2];
    if (interacted) live(hex);
  };
  // Gray and black have no meaningful hue — keep the one already chosen so the slider does not jump.
  const setFromRgb = (rgb, skip) => { const [nh, ns, nv] = rgbToHsv(rgb); s = ns; v = nv; if (ns > 0 && nv > 0) h = nh; paint(skip); };

  const fromPointer = event => { const r = sv.getBoundingClientRect(); s = clamp01((event.clientX - r.left) / r.width); v = 1 - clamp01((event.clientY - r.top) / r.height); paint(); };
  sv.addEventListener('pointerdown', event => { sv.setPointerCapture(event.pointerId); sv.focus(); fromPointer(event); event.preventDefault(); });
  sv.addEventListener('pointermove', event => { if (sv.hasPointerCapture(event.pointerId)) fromPointer(event); });
  sv.addEventListener('keydown', event => {
    const step = event.shiftKey ? 0.1 : 0.01; let used = true;
    if (event.key === 'ArrowLeft') s = clamp01(s - step); else if (event.key === 'ArrowRight') s = clamp01(s + step);
    else if (event.key === 'ArrowUp') v = clamp01(v + step); else if (event.key === 'ArrowDown') v = clamp01(v - step);
    else used = false;
    if (used) { event.preventDefault(); paint(); }
  });
  hue.addEventListener('input', () => { h = Number(hue.value); paint(hue); });
  hexInput.addEventListener('input', () => { const hex = normalizeHex(hexInput.value); if (hex) setFromRgb(hexToRgb(hex), hexInput); });
  hexInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); finish('commit'); } });
  hexInput.addEventListener('blur', () => { hexInput.value = currentHex(); });
  Object.values(rgbInputs).forEach(input => {
    input.addEventListener('input', () => {
      const parts = ['r', 'g', 'b'].map(k => rgbInputs[k].value.trim());
      if (parts.every(p => /^\d{1,3}$/.test(p) && Number(p) <= 255)) setFromRgb(parts.map(Number), input);
    });
    input.addEventListener('blur', () => paint());
  });
  q('.cp-eyedropper')?.addEventListener('click', async () => {
    try { const picked = await new window.EyeDropper().open(); const hex = normalizeHex(picked.sRGBHex); if (hex) setFromRgb(hexToRgb(hex)); } catch { /* dismissed with Escape */ }
  });
  q('[data-cp="done"]').addEventListener('click', () => finish('commit'));
  q('[data-cp="cancel"]').addEventListener('click', () => finish('cancel'));

  // Keep Tab inside the picker while it is open, and let Escape mean "put it back".
  pop.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish('cancel'); return; }
    if (event.key !== 'Tab') return;
    const stops = [...pop.querySelectorAll('.cp-sv, input, button')].filter(el => !el.disabled);
    const first = stops[0], last = stops[stops.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  // how: 'commit' (Done / Enter), 'cancel' (Cancel / Escape), or 'outside' (clicked elsewhere —
  // keeps the color like the native picker does, but never steals focus back).
  let finished = false;
  const closer = how => finish(how === 'cancel' ? 'cancel' : 'outside');
  function finish(how) {
    if (finished) return; finished = true;
    const chosen = currentHex();
    pop.remove(); activeTrigger = null;
    releaseCustomPopover(closer);
    if (how === 'cancel' || chosen === original) cancel();
    else { commit(chosen); if (onCommitted) onCommitted(); }
    if (how !== 'outside') document.querySelector(`[data-action="open-color-picker"][data-picker="${kind}"]${slot ? `[data-slot="${slot}"]` : ''}`)?.focus();
  }
  registerCustomPopover(closer);
  activeTrigger = trigger;
  paint();
  interacted = true;
  sv.focus({ preventScroll: true });
  pop.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
