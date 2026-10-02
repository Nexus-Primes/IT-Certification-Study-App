// ---------- Theme data and accent derivation (pure) ----------
// The accent swatches, surface-style presets, per-track default accents, and the function that turns a
// chosen accent into the CSS variables for a given theme. Reads no app state: pass it the choice.
import { isHexColor, hexToRgb, rgbToHex, rgbToHsl, hslToRgb, contrastRatio } from './color.js?v=1';

// Reuses the exact primary/soft pairs styles.css already defines for --blue/--violet/--green/
// --amber/--red — those were individually contrast-tuned against both themes' surfaces during
// the project's big light-theme accessibility pass, so borrowing them here for --primary (used
// in the same "colored text/icon on its own soft background" pattern in ~60 places across the
// app) is already known-safe, rather than needing that whole calibration exercise redone for a
// fresh set of colors just for this picker.
export const ACCENT_THEMES = [
  { id: 'teal', label: 'Teal', dark: { primary: '#2dd4bf', soft: 'rgba(45,212,191,.12)' }, light: { primary: '#0b7267', soft: 'rgba(15,159,144,.1)' } },
  { id: 'blue', label: 'Blue', dark: { primary: '#38bdf8', soft: 'rgba(56,189,248,.12)' }, light: { primary: '#026ba1', soft: 'rgba(2,132,199,.09)' } },
  { id: 'violet', label: 'Violet', dark: { primary: '#a78bfa', soft: 'rgba(167,139,250,.12)' }, light: { primary: '#7c3aed', soft: 'rgba(124,58,237,.1)' } },
  { id: 'green', label: 'Green', dark: { primary: '#4ade80', soft: 'rgba(74,222,128,.12)' }, light: { primary: '#107535', soft: 'rgba(22,163,74,.1)' } },
  { id: 'amber', label: 'Amber', dark: { primary: '#fbbf24', soft: 'rgba(251,191,36,.12)' }, light: { primary: '#9b5505', soft: 'rgba(217,119,6,.1)' } },
  { id: 'rose', label: 'Rose', dark: { primary: '#fb7185', soft: 'rgba(251,113,133,.12)' }, light: { primary: '#c71940', soft: 'rgba(225,29,72,.08)' } }
];

// Surface palettes — they restyle backgrounds, borders, and text only; the status colors
// (green/red/amber/blue) are shared across all of them so correct/incorrect always read the
// same. The actual variable values live in styles.css under :root[data-preset="…"]; `surface`
// here is just the main card color, which custom accents are contrast-checked against.
export const THEME_PRESETS = [
  { id: 'default', label: 'Classic', blurb: 'The original', swatch: { dark: ['#080d17', '#101827'], light: ['#f3f6f9', '#ffffff'] }, surface: { dark: [16, 24, 39], light: [255, 255, 255] } },
  { id: 'slate', label: 'Slate', blurb: 'Cool grays', swatch: { dark: ['#0f1115', '#181b21'], light: ['#f2f3f5', '#ffffff'] }, surface: { dark: [24, 27, 33], light: [255, 255, 255] } },
  { id: 'ink', label: 'Ink', blurb: 'True black', swatch: { dark: ['#000000', '#0c0c0e'], light: ['#fafafa', '#ffffff'] }, surface: { dark: [12, 12, 14], light: [255, 255, 255] } },
  { id: 'sand', label: 'Sand', blurb: 'Warm paper', swatch: { dark: ['#14110d', '#1c1812'], light: ['#f5f1ea', '#fffdf9'] }, surface: { dark: [28, 24, 18], light: [255, 253, 249] } }
];
export const presetById = id => THEME_PRESETS.find(p => p.id === id) || THEME_PRESETS[0];

// A track's default accent when "different accent per track" is on and nothing's been picked for
// it yet — same vendor, same family, so related tracks read as related at a glance.
export const TRACK_DEFAULT_ACCENTS = { aplus: 'teal', netplus: 'blue', secplus: 'rose', '3cx-basic': 'amber', '3cx-advanced': 'amber', 'winserver-hybrid': 'green', dp300: 'violet', 'blender-fundamentals': 'amber' };

// A picked color is nudged only as far as needed to stay readable on the theme's own surface
// (lightened on dark, darkened on light) — the same "adjust at render time, don't hand-tune"
// approach domainAccentColor already takes for the per-domain colors.
export function accentVarsFor(value, theme, themePreset = 'default') {
  if (!isHexColor(value)) {
    const preset = ACCENT_THEMES.find(a => a.id === value);
    if (!preset || preset.id === 'teal') return null;
    const { primary, soft } = preset[theme] || preset.dark;
    return { primary, soft, strong: `color-mix(in srgb, ${primary} 82%, black)`, onPrimary: null };
  }
  const bg = presetById(themePreset).surface[theme === 'light' ? 'light' : 'dark'];
  let [h, s, l] = rgbToHsl(hexToRgb(value));
  let rgb = hexToRgb(value);
  for (let i = 0; i < 40 && contrastRatio(rgb, bg) < 4.5; i++) {
    l = Math.max(0.04, Math.min(0.96, l + (theme === 'light' ? -0.02 : 0.02)));
    rgb = hslToRgb([h, s, l]);
  }
  const primary = rgbToHex(rgb);
  const lightText = contrastRatio(rgb, [255, 255, 255]), darkText = contrastRatio(rgb, [4, 32, 28]);
  return { primary, soft: `rgba(${rgb.map(Math.round).join(',')},${theme === 'light' ? .1 : .12})`, strong: `color-mix(in srgb, ${primary} 82%, black)`, onPrimary: lightText >= darkText ? '#ffffff' : '#04201c' };
}
