import { h, clear } from '../ui/dom.js';
import { md } from '../ui/math.js';
import { EULER_GAMMA } from '../lib/mathutil.js';
import { makeCanvas, frame, drawCurve, drawDots, palette } from './plot.js';

export function mountHarmonic(container) {
  let N = 60;
  const range = h('input', { type: 'range', min: 5, max: 400, value: N });
  const label = h('span', { class: 'mono' }, String(N));
  const controls = h('div', { class: 'controls' }, h('label', {}, 'n up to: ', range, label));
  const plotHolder = h('div', {});
  const legend = h('div', { class: 'legend' });
  const readout = h('div', { class: 'readout' });
  const tableHolder = h('div', { class: 'table-wrap' });
  const notes = md(String.raw`
$H_n = \sum_{k=1}^{n} 1/k$ grows like a logarithm: the dots sit just above $\ln n$ and settle onto $\ln n + \gamma$, where $\gamma \approx 0.5772$ is Euler’s constant. Knuth’s asymptotic formula (§1.2.7 eq. (3)) is
$$H_n = \ln n + \gamma + \frac{1}{2n} - \frac{1}{12n^2} + \frac{1}{120n^4} - \dots$$
The gap $H_n - \ln n$ shrinks toward $\gamma$ at rate $1/(2n)$; the table shows how quickly.

Why it matters: $H_n$ is the average number of *records* while scanning random data, the expected number of cycles of a random permutation, and it shows up in the analysis of quicksort ($\approx 2n\ln n$ comparisons) and of hashing. Whenever an average involves $\sum 1/k$, the answer is “about $\ln n$”.
`);
  container.append(controls, plotHolder, legend, readout, tableHolder, notes);

  function draw() {
    clear(plotHolder); clear(legend); clear(tableHolder);
    const { canvas, ctx, width, height } = makeCanvas(plotHolder, 380);
    plotHolder.append(canvas);
    const p = palette();
    const H = [0];
    for (let k = 1; k <= N; k++) H.push(H[k - 1] + 1 / k);
    const ymax = Math.ceil(H[N] + 0.5);
    const f = frame(ctx, width, height, { xs: [0, N], ys: [0, ymax], yLabel: 'value' });
    const ln = [], lng = [], dots = [];
    for (let x = 1; x <= N; x += N / 400) { ln.push([f.toX(x), f.toY(Math.log(x))]); lng.push([f.toX(x), f.toY(Math.log(x) + EULER_GAMMA)]); }
    for (let k = 1; k <= N; k++) dots.push([f.toX(k), f.toY(H[k])]);
    drawCurve(ctx, ln, p.ink3, { dash: [4, 4] });
    drawCurve(ctx, lng, p.blue);
    if (N <= 120) drawDots(ctx, dots, p.accent, N > 60 ? 2 : 3); else drawCurve(ctx, dots, p.accent, { width: 1.5 });
    legend.append(
      h('span', { style: { color: p.accent } }, 'H_n'),
      h('span', { style: { color: p.blue } }, 'ln n + γ'),
      h('span', { style: { color: p.ink3 } }, 'ln n'),
    );
    readout.textContent = `H_${N} = ${H[N].toFixed(6)}    ln ${N} + γ = ${(Math.log(N) + EULER_GAMMA).toFixed(6)}    difference = ${(H[N] - Math.log(N) - EULER_GAMMA).toFixed(6)}  ≈ 1/(2n) = ${(1 / (2 * N)).toFixed(6)}`;
    const picks = [1, 2, 5, 10, 20, 50, 100, 200, 400].filter((n) => n <= N);
    if (!picks.includes(N)) picks.push(N);
    tableHolder.append(h('table', { class: 'sans' },
      h('thead', {}, h('tr', {}, h('th', {}, 'n'), h('th', {}, 'H_n'), h('th', {}, 'ln n'), h('th', {}, 'H_n − ln n'), h('th', {}, 'ln n + γ + 1/(2n)'))),
      h('tbody', {}, ...picks.map((n) => h('tr', {}, h('td', {}, n), h('td', {}, H[n].toFixed(5)), h('td', {}, Math.log(n).toFixed(5)), h('td', {}, (H[n] - Math.log(n)).toFixed(5)), h('td', {}, (Math.log(n) + EULER_GAMMA + 1 / (2 * n)).toFixed(5)))))));
  }

  range.addEventListener('input', () => { N = Number(range.value); label.textContent = String(N); draw(); });
  draw();
}
