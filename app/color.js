// ---------- Color math (pure) ----------
// Conversions, contrast, and naming for colors. Nothing here reads app state or the page, so it can
// be tested and reused on its own — app.js and themes.js import what they need from here.

export const isHexColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
export const hexToRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
export const rgbToHex = ([r, g, b]) => `#${[r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
  }
  return [h, s, l];
}
export function hslToRgb([h, s, l]) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const hue = (p, q, t) => { t = (t + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [hue(p, q, h + 1 / 3) * 255, hue(p, q, h) * 255, hue(p, q, h - 1 / 3) * 255];
}

export const clamp01 = n => Math.max(0, Math.min(1, n));
export function rgbToHsv([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min; let h = 0;
  if (d) { h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, max ? d / max : 0, max];
}
export function hsvToRgb([h, s, v]) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
// '#abc', 'abc', '#aabbcc' → '#aabbcc' (lowercase), or null when it is not a color.
export function normalizeHex(raw) {
  const text = String(raw || '').trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(text)) return `#${text[0]}${text[0]}${text[1]}${text[1]}${text[2]}${text[2]}`;
  return /^[0-9a-f]{6}$/.test(text) ? `#${text}` : null;
}
// White or near-black, whichever reads better on the given color (avatar initials, etc.).
export function readableTextOn(hex) {
  const rgb = hexToRgb(hex);
  return contrastRatio(rgb, [255, 255, 255]) >= contrastRatio(rgb, [11, 18, 32]) ? '#ffffff' : '#0b1220';
}

export function relLuminance([r, g, b]) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrastRatio(rgb1, rgb2) {
  const l1 = relLuminance(rgb1), l2 = relLuminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// A custom color is drawn as a translucent wash over the text, so a very dark or very strong
// color could swallow the words. Pick the strongest wash (up to 40%) that keeps body text at
// 4.5:1 — worked out separately for dark and light, against the darkest/lightest surfaces the
// style presets use. Light is also what printing uses, so paper stays readable too.
export const HIGHLIGHT_CONTRAST_CASES = {
  dark: [{ surface: [12, 12, 14], text: [232, 238, 247] }, { surface: [30, 34, 44], text: [232, 238, 247] }],
  light: [{ surface: [255, 255, 255], text: [20, 32, 50] }, { surface: [245, 241, 234], text: [42, 36, 27] }]
};
export function highlightMixFor(hex, theme) {
  const rgb = hexToRgb(hex); const cases = HIGHLIGHT_CONTRAST_CASES[theme];
  const passes = mix => cases.every(c => contrastRatio(c.text, c.surface.map((v, i) => v * (1 - mix / 100) + rgb[i] * (mix / 100))) >= 4.5);
  let mix = 40;
  while (mix > 6 && !(passes(mix) && passes(Math.min(mix + 20, 60)))) mix -= 2;
  return mix;
}

// A plain-language name for a color, for screen readers and tooltips ("dark teal", "light pink").
export function colorNameFor(hex) {
  const [hue, sat, light] = rgbToHsl(hexToRgb(hex)); const deg = hue * 360;
  if (light < 0.1) return 'black';
  if (light > 0.93) return 'white';
  if (sat < 0.12) return light < 0.35 ? 'dark gray' : light > 0.7 ? 'light gray' : 'gray';
  let base = deg < 15 || deg >= 345 ? 'red' : deg < 40 ? 'orange' : deg < 65 ? 'yellow' : deg < 160 ? 'green' : deg < 195 ? 'teal' : deg < 255 ? 'blue' : deg < 290 ? 'purple' : 'pink';
  if (base === 'orange' && light < 0.4) base = 'brown';
  return `${light < 0.3 && base !== 'brown' ? 'dark ' : light > 0.78 ? 'light ' : ''}${base}`;
}
