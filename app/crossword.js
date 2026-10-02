// ---------- Crossword layout generator (pure) ----------
// Given a pool of { answer, clue, term } words and a seed, lays out a crossing-word grid. The same
// seed always gives the same puzzle. Reads no app state.
import { seededShuffle } from './utils.js?v=4';

// Standard greedy crossword placement: place the first (longest) word, then for every word
// after it, search every already-placed word for a shared letter and try crossing there. A
// placement is only valid if every empty cell it touches has no letter directly beside it
// (perpendicular to the new word) and the cells immediately before/after the word are empty —
// otherwise it would silently fuse into or graze an unrelated word.
// The board's own box is landscape (the clue column sits fixed-width off to the side, so
// whatever's left over is wider than it is tall) — a puzzle that grows roughly as wide as it
// is tall still ends up cramped, because it's the TALLER dimension that determines how small
// the cells have to shrink to fit. Scoring candidate placements against that same ratio, not
// raw area, keeps the generated grid's shape close to the shape it actually has to fit into.
const CW_TARGET_ASPECT = 1.3;

// One unlucky shuffle can leave fewer than 5 words with a shared crossing letter even when
// the domain has plenty of terms. Retry with perturbed seeds before giving up — deterministic
// per base seed (the hub's stable per-domain count and "New puzzle" both stay consistent).
export function generateCrosswordLayout(pool, seed, maxWords = 12) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const layout = tryCrosswordLayout(pool, `${seed}-${attempt}`, maxWords);
    if (layout) return layout;
  }
  return null;
}

function tryCrosswordLayout(pool, seed, maxWords = 12) {
  const words = seededShuffle(pool, seed).sort((a, b) => b.answer.length - a.answer.length);
  const cells = new Map(); // "x,y" -> letter
  const placed = [];

  function canPlace(answer, x, y, dir) {
    for (let k = 0; k < answer.length; k++) {
      const cx = dir === 'across' ? x + k : x;
      const cy = dir === 'down' ? y + k : y;
      const existing = cells.get(`${cx},${cy}`);
      if (existing) {
        if (existing !== answer[k]) return false;
      } else if (dir === 'across') {
        if (cells.has(`${cx},${cy - 1}`) || cells.has(`${cx},${cy + 1}`)) return false;
      } else {
        if (cells.has(`${cx - 1},${cy}`) || cells.has(`${cx + 1},${cy}`)) return false;
      }
    }
    const beforeKey = dir === 'across' ? `${x - 1},${y}` : `${x},${y - 1}`;
    const afterKey = dir === 'across' ? `${x + answer.length},${y}` : `${x},${y + answer.length}`;
    return !cells.has(beforeKey) && !cells.has(afterKey);
  }

  function place(word, x, y, dir) {
    for (let k = 0; k < word.answer.length; k++) {
      const cx = dir === 'across' ? x + k : x;
      const cy = dir === 'down' ? y + k : y;
      cells.set(`${cx},${cy}`, word.answer[k]);
    }
    placed.push({ ...word, x, y, dir });
  }

  words.forEach(word => {
    if (placed.length >= maxWords) return;
    if (!placed.length) { place(word, 0, 0, 'across'); return; }
    // Among every valid crossing (not just the first one found), keep whichever grows the
    // bounding box the least relative to CW_TARGET_ASPECT. Taking the first fit tends to snake
    // outward and can produce a grid several times larger than the word count actually needs —
    // exactly the kind of puzzle that no longer fits on screen without scrolling.
    const curXs = placed.flatMap(w => w.dir === 'across' ? [w.x, w.x + w.answer.length - 1] : [w.x]);
    const curYs = placed.flatMap(w => w.dir === 'down' ? [w.y, w.y + w.answer.length - 1] : [w.y]);
    const curMinX = Math.min(...curXs), curMaxX = Math.max(...curXs);
    const curMinY = Math.min(...curYs), curMaxY = Math.max(...curYs);
    let best = null, bestCost = Infinity;
    for (const existing of placed) {
      for (let i = 0; i < existing.answer.length; i++) {
        for (let j = 0; j < word.answer.length; j++) {
          if (existing.answer[i] !== word.answer[j]) continue;
          const dir = existing.dir === 'across' ? 'down' : 'across';
          const x = existing.dir === 'across' ? existing.x + i : existing.x - j;
          const y = existing.dir === 'across' ? existing.y - j : existing.y + i;
          if (!canPlace(word.answer, x, y, dir)) continue;
          const endX = dir === 'across' ? x + word.answer.length - 1 : x;
          const endY = dir === 'down' ? y + word.answer.length - 1 : y;
          const boxW = Math.max(curMaxX, endX) - Math.min(curMinX, x) + 1;
          const boxH = Math.max(curMaxY, endY) - Math.min(curMinY, y) + 1;
          // The cost is how large a cell size that box would allow inside a fixed-aspect
          // target — smaller cost means bigger cells are possible, so it's what we minimize.
          const cost = Math.max(boxW / CW_TARGET_ASPECT, boxH);
          if (cost < bestCost) { bestCost = cost; best = { x, y, dir }; }
        }
      }
    }
    if (best) place(word, best.x, best.y, best.dir);
  });

  if (placed.length < 5) return null;

  const xs = placed.flatMap(w => w.dir === 'across' ? [w.x, w.x + w.answer.length - 1] : [w.x]);
  const ys = placed.flatMap(w => w.dir === 'down' ? [w.y, w.y + w.answer.length - 1] : [w.y]);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const width = Math.max(...xs) - minX + 1;
  const height = Math.max(...ys) - minY + 1;
  const entries = placed.map(w => ({ ...w, x: w.x - minX, y: w.y - minY }));
  const solution = new Map([...cells].map(([key, letter]) => {
    const [x, y] = key.split(',').map(Number);
    return [`${x - minX},${y - minY}`, letter];
  }));

  // A cell numbers if it's the start of any entry there; an across/down entry starting at the
  // same cell shares one number, matching how real crosswords number their grids.
  const numbers = new Map();
  const starts = [...new Set(entries.map(e => `${e.x},${e.y}`))].sort((a, b) => {
    const [ax, ay] = a.split(',').map(Number); const [bx, by] = b.split(',').map(Number);
    return (ay - by) || (ax - bx);
  });
  starts.forEach((key, index) => numbers.set(key, index + 1));
  entries.forEach(e => { e.number = numbers.get(`${e.x},${e.y}`); });

  const cellIndex = new Map(); // "x,y" -> { across: entryIndex|null, down: entryIndex|null }
  entries.forEach((e, idx) => {
    for (let k = 0; k < e.answer.length; k++) {
      const cx = e.dir === 'across' ? e.x + k : e.x;
      const cy = e.dir === 'down' ? e.y + k : e.y;
      const key = `${cx},${cy}`;
      const cell = cellIndex.get(key) || { across: null, down: null };
      cell[e.dir] = idx;
      cellIndex.set(key, cell);
    }
  });

  return { width, height, entries, solution, numbers, cellIndex };
}
