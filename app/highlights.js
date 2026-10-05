// ---------- Highlighter palette ----------
// The four highlighter slots, each optionally recolored by the person. A highlight stores only its
// slot, so a recolor carries through highlights already made. Reads no app state itself: it is given
// a function that returns the current { slot: '#hex' } overrides.
import { isHexColor, readableTextOn, colorNameFor, highlightMixFor } from './color.js?v=1';

// A small real-highlighter-style pack — each name is also the exact CSS custom-property token
// (var(--amber) etc.), already contrast-tuned for both themes, so no new color tokens needed.
export const HIGHLIGHT_COLORS = ['amber', 'green', 'blue', 'violet'];
export const HIGHLIGHT_DEFAULT_NAMES = { amber: 'yellow', green: 'green', blue: 'blue', violet: 'pink' };
export function guideHighlightColor(color) { return HIGHLIGHT_COLORS.includes(color) ? color : 'amber'; }

export function highlightCustomVars(hex) {
  const d = highlightMixFor(hex, 'dark'), l = highlightMixFor(hex, 'light');
  return `--hl-color:${hex};--hl-mix-d:${d}%;--hl-mix-hover-d:${Math.min(d + 20, 60)}%;--hl-mix-l:${l}%;--hl-mix-hover-l:${Math.min(l + 20, 60)}%`;
}

// Each of the four highlighter slots can be recolored (Settings → Appearance → Highlight colors).
// An unset slot keeps its built-in theme token.
export function createHighlightPalette(getColors) {
  function highlightCustomHex(slot) {
    const value = (getColors() || {})[slot];
    return isHexColor(value) ? value.toLowerCase() : null;
  }
  function highlightColorValue(slot) { return highlightCustomHex(slot) || `var(--${slot})`; }
  function highlightStyleVars(slot) {
    const hex = highlightCustomHex(slot);
    return hex ? highlightCustomVars(hex) : `--hl-color:var(--${guideHighlightColor(slot)})`;
  }
  function highlightSlotName(slot) { const hex = highlightCustomHex(slot); return hex ? colorNameFor(hex) : HIGHLIGHT_DEFAULT_NAMES[slot]; }
  // Keeps the floating Highlight popover's four swatches in step with the palette. Numbers, not
  // letters, mark each swatch so a choice never depends on hue alone and never mislabels a recolor.
  function applyHighlightPalette() {
    document.querySelectorAll('#guide-highlight-popover .highlight-swatch').forEach((el, index) => {
      const slot = el.dataset.color; const hex = highlightCustomHex(slot); const name = highlightSlotName(slot);
      el.style.background = highlightColorValue(slot);
      el.style.setProperty('--swatch-ink', hex ? readableTextOn(hex) : 'rgba(0,0,0,.55)');
      el.dataset.letter = String(index + 1);
      el.setAttribute('aria-label', `Highlight in ${name}`); el.title = `Highlight in ${name}`;
    });
  }
  return { highlightCustomHex, highlightColorValue, highlightStyleVars, highlightSlotName, applyHighlightPalette };
}
