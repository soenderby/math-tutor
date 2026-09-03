import { h, clear } from '../ui/dom.js';
import { md } from '../ui/math.js';
import { fib, PHI } from '../lib/mathutil.js';

export function mountFibonacci(container) {
  let N = 20;
  // Capped at 50: beyond that F_n exceeds the precision of the double used for phi^n/sqrt5
  // and the "phi^n/sqrt5 - F_n" column would show floating-point noise.
  const range = h('input', { type: 'range', min: 5, max: 50, value: N });
  const label = h('span', { class: 'mono' }, String(N));
  const zIn = h('input', { type: 'number', min: 1, value: 100 });
  const controls = h('div', { class: 'controls' }, h('label', {}, 'Show n up to: ', range, label), h('label', {}, 'Zeckendorf of: ', zIn));
  const zOut = h('div', { class: 'readout' });
  const tableHolder = h('div', { class: 'table-wrap' });
  const notes = md(String.raw`
**Binet’s formula** (§1.2.8 eq. (14)): $F_n = \dfrac{\phi^n - \hat\phi^n}{\sqrt5}$ with $\phi = \frac{1+\sqrt5}{2} \approx 1.618034$ and $\hat\phi = \frac{1-\sqrt5}{2} \approx -0.618034$. Because $|\hat\phi| < 1$ the second term dies out, so $F_n$ is simply $\phi^n/\sqrt5$ rounded to the nearest integer (eq. (15)), and $F_{n+1}/F_n \to \phi$ with the error alternating in sign and shrinking by a factor of about $\phi^2 \approx 2.618$ each step.

**Zeckendorf’s theorem** (§1.2.8 exercise 34): every positive integer is uniquely a sum of Fibonacci numbers $F_k$, $k \ge 2$, no two consecutive. Greedy works: take the largest $F_k \le N$ and recurse. Knuth uses this “Fibonacci number system” for Fibonacci search and in the analysis of Euclid’s algorithm.
`);
  container.append(controls, tableHolder, zOut, notes);

  function drawTable() {
    clear(tableHolder);
    const rows = [];
    for (let n = 0; n <= N; n++) {
      const F = fib(n);
      const binet = PHI ** n / Math.sqrt(5);
      const ratio = n >= 1 && fib(n) !== 0n ? Number(fib(n + 1)) / Number(fib(n)) : NaN;
      rows.push(h('tr', {},
        h('td', {}, n),
        h('td', { class: 'mono' }, F.toString()),
        h('td', { class: 'mono' }, Number.isNaN(ratio) ? '–' : ratio.toFixed(8)),
        h('td', { class: 'mono' }, Number.isNaN(ratio) ? '–' : (ratio - PHI).toExponential(2)),
        h('td', { class: 'mono' }, binet.toFixed(4)),
        h('td', { class: 'mono' }, (binet - Number(F)).toFixed(4)),
      ));
    }
    tableHolder.append(h('table', { class: 'sans' },
      h('thead', {}, h('tr', {}, h('th', {}, 'n'), h('th', {}, 'F_n'), h('th', {}, 'F_{n+1}/F_n'), h('th', {}, 'ratio − φ'), h('th', {}, 'φⁿ/√5'), h('th', {}, 'φⁿ/√5 − F_n'))),
      h('tbody', {}, ...rows)));
  }

  function zeck() {
    let n = Math.floor(Number(zIn.value) || 0);
    if (n < 1) { zOut.textContent = 'Enter a positive integer.'; return; }
    const orig = n;
    const parts = [];
    while (n > 0) {
      let k = 2;
      while (Number(fib(k + 1)) <= n) k++;
      parts.push(k);
      n -= Number(fib(k));
    }
    const maxK = parts[0];
    // Fibonacci-base digits from F_maxK down to F_2
    const digits = [];
    for (let k = maxK; k >= 2; k--) digits.push(parts.includes(k) ? '1' : '0');
    zOut.textContent = `${orig} = ${parts.map((k) => `F_${k}`).join(' + ')} = ${parts.map((k) => fib(k)).join(' + ')}\nFibonacci-base digits (F_${maxK} … F_2): ${digits.join('')}   (no two adjacent 1s)`;
  }

  range.addEventListener('input', () => { N = Number(range.value); label.textContent = String(N); drawTable(); });
  zIn.addEventListener('input', zeck);
  drawTable();
  zeck();
}
