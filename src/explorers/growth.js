import { h, clear } from '../ui/dom.js';
import { md } from '../ui/math.js';
import { makeCanvas, frame, drawCurve, seriesColors, sci } from './plot.js';

function lnGamma(x) {
  // Lanczos approximation, good enough for plotting n!
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

const fns = [
  { id: 'loglog', label: 'log₂ log₂ n', f: (n) => Math.log2(Math.log2(n)), on: false },
  { id: 'log', label: 'log₂ n', f: (n) => Math.log2(n), on: true },
  { id: 'log2', label: '(log₂ n)²', f: (n) => Math.log2(n) ** 2, on: false },
  { id: 'sqrt', label: '√n', f: (n) => Math.sqrt(n), on: true },
  { id: 'n', label: 'n', f: (n) => n, on: true },
  { id: 'nlogn', label: 'n log₂ n', f: (n) => n * Math.log2(n), on: true },
  { id: 'n2', label: 'n²', f: (n) => n * n, on: true },
  { id: 'n3', label: 'n³', f: (n) => n ** 3, on: false },
  { id: '2n', label: '2ⁿ', f: (n) => 2 ** n, on: true },
  { id: 'fact', label: 'n!', f: (n) => Math.exp(lnGamma(n + 1)), on: true },
  { id: 'nn', label: 'nⁿ', f: (n) => n ** n, on: false },
];

export function mountGrowth(container) {
  let N = 40;
  const range = h('input', { type: 'range', min: 5, max: 200, value: N });
  const label = h('span', { class: 'mono' }, String(N));
  const checks = fns.map((fn, i) => {
    const cb = h('input', { type: 'checkbox' });
    cb.checked = fn.on;
    cb.addEventListener('change', () => { fn.on = cb.checked; draw(); });
    return h('label', { style: { color: seriesColors[i % seriesColors.length] } }, cb, ' ', fn.label);
  });
  const controls = h('div', { class: 'controls' }, h('label', {}, 'n up to: ', range, label), ...checks);
  const plotHolder = h('div', {});
  const tableHolder = h('div', { class: 'table-wrap' });
  const notes = md(String.raw`
The vertical axis is **logarithmic**, so a straight line means exponential growth and every polynomial $n^c$ bends over into a line of slope proportional to $c$ on a log–log plot (but here the $x$-axis is linear). Watch how $2^n$ overtakes every polynomial and $n!$ overtakes $2^n$; and how $\log n$ and $\sqrt n$ are barely distinguishable from flat next to them.

In Knuth’s terms: $f(n) = O(g(n))$ when $f$ stays below some constant multiple of $g$ for large $n$. On this plot a constant multiple is a fixed vertical shift, so $f = O(g)$ means the curve of $f$ eventually sits below a shifted copy of the curve of $g$.
`);
  container.append(controls, plotHolder, tableHolder, notes);

  function draw() {
    clear(plotHolder); clear(tableHolder);
    const { canvas, ctx, width, height } = makeCanvas(plotHolder, 440);
    plotHolder.append(canvas);
    const active = fns.filter((f) => f.on);
    let ymax = 10;
    for (const fn of active) ymax = Math.max(ymax, fn.f(N));
    ymax = Math.min(ymax, 1e300);
    const fr = frame(ctx, width, height, { xs: [1, N], ys: [1, ymax * 2], yLog: true, yLabel: 'value (log scale)' });
    fns.forEach((fn, i) => {
      if (!fn.on) return;
      const pts = [];
      for (let x = 1; x <= N; x += Math.max(0.25, N / 400)) {
        const y = fn.f(x);
        if (y >= 1 && Number.isFinite(y)) pts.push([fr.toX(x), fr.toY(y)]);
      }
      drawCurve(ctx, pts, seriesColors[i % seriesColors.length]);
      const last = pts[pts.length - 1];
      if (last) { ctx.fillStyle = seriesColors[i % seriesColors.length]; ctx.font = '12px system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(fn.label, last[0] - 2, last[1] - 2); }
    });
    const cols = [10, 20, 50, 100, 200, 1000, 1e6].filter((c) => c <= Math.max(N, 1000));
    tableHolder.append(h('table', { class: 'sans' },
      h('thead', {}, h('tr', {}, h('th', {}, 'f(n)'), ...cols.map((c) => h('th', {}, `n = ${sci(c)}`)))),
      h('tbody', {}, ...active.map((fn) => h('tr', {}, h('td', {}, fn.label), ...cols.map((c) => h('td', { class: 'mono' }, sci(fn.f(c)))))))));
  }

  range.addEventListener('input', () => { N = Number(range.value); label.textContent = String(N); draw(); });
  draw();
}
