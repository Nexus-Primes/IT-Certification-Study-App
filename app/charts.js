// ---------- Chart markup (pure) ----------
// Small bar chart used on the Progress page: one bar per value, labelled underneath.

export function chartMarkup(values, labels) {
  return `<div class="bar-chart">${values.map((value, index) => `<div class="chart-bar-wrap" title="${value}%"><div class="chart-bar" style="height:${Math.max(3, value)}%"></div><small>${labels[index]}</small></div>`).join('')}</div>`;
}
