import { h, clear } from '../ui/dom.js';
import { md } from '../ui/math.js';
import { euclidTrace, extendedGcd, fib, mod } from '../lib/mathutil.js';

export function mountEuclid(container) {
  const mIn = h('input', { type: 'number', min: 1, value: 1071 });
  const nIn = h('input', { type: 'number', min: 1, value: 462 });
  const runBtn = h('button', { class: 'btn btn-sm' }, 'Run');
  const randBtn = h('button', { class: 'btn btn-sm' }, 'Random pair');
  const fibBtn = h('button', { class: 'btn btn-sm' }, 'Fibonacci pair (worst case)');
  const controls = h('div', { class: 'controls' }, h('label', {}, 'm = ', mIn), h('label', {}, 'n = ', nIn), runBtn, randBtn, fibBtn);
  const out = h('div', {});
  const notes = md(String.raw`
This is Knuth’s **Algorithm E** (§1.1), the very first algorithm in the book: given $m, n > 0$, repeatedly replace $(m, n)$ by $(n,\ m \bmod n)$ until the remainder is $0$; the last nonzero remainder is $\gcd(m,n)$. It works because any common divisor of $m$ and $n$ also divides $m - qn$, and vice versa.

The **extended** version (§4.5.2, Algorithm X) runs the same steps while carrying integers $a, b$ with $a\,m_0 + b\,n_0 = $ (current value of $m$). The table shows those coefficients at every step; the last row gives $a\,m_0 + b\,n_0 = \gcd(m_0, n_0)$, which is how one computes inverses modulo $n$.

Consecutive Fibonacci numbers force every quotient to be $1$ and give the longest possible run for numbers of that size (Lamé’s theorem, 1845: the number of steps is at most about $4.8\log_{10} n$). Knuth analyses this in §4.5.3.
`);
  container.append(controls, out, notes);

  function run() {
    const m0 = BigInt(Math.max(1, Math.floor(Number(mIn.value) || 1)));
    const n0 = BigInt(Math.max(1, Math.floor(Number(nIn.value) || 1)));
    const steps = euclidTrace(m0, n0);
    const { g, x, y } = extendedGcd(m0, n0);
    clear(out);

    // Coefficients (a, b) such that a*m0 + b*n0 equals the "m" of each step.
    const rows = [];
    let [oldS, s] = [1n, 0n];
    let [oldT, t] = [0n, 1n];
    for (const st of steps) {
      rows.push({ m: st.a, n: st.b, q: st.q, r: st.r, a: oldS, b: oldT });
      [oldS, s] = [s, oldS - st.q * s];
      [oldT, t] = [t, oldT - st.q * t];
    }
    rows.push({ m: g, n: 0n, q: null, r: null, a: oldS, b: oldT });

    const table = h('table', { class: 'sans' },
      h('thead', {}, h('tr', {}, h('th', {}, 'step'), h('th', {}, 'm'), h('th', {}, 'n'), h('th', {}, 'q = ⌊m/n⌋'), h('th', {}, 'r = m mod n'), h('th', {}, 'a'), h('th', {}, 'b'), h('th', {}, 'a·m₀ + b·n₀ (= m)'))),
      h('tbody', {}, ...rows.map((r, i) => h('tr', {},
        h('td', {}, r.q === null ? 'done' : i + 1),
        h('td', { class: 'mono' }, r.m.toString()),
        h('td', { class: 'mono' }, r.n.toString()),
        h('td', { class: 'mono' }, r.q === null ? '' : r.q.toString()),
        h('td', { class: 'mono' }, r.r === null ? '' : r.r.toString()),
        h('td', { class: 'mono' }, r.a.toString()),
        h('td', { class: 'mono' }, r.b.toString()),
        h('td', { class: 'mono' }, (r.a * m0 + r.b * n0).toString()),
      ))),
    );

    const inverse = g === 1n && n0 > 1n ? `\ninverse of ${m0} modulo ${n0}: ${mod(x, n0)}   (since ${x}·${m0} ≡ 1 mod ${n0})` : '';
    out.append(
      h('div', { class: 'table-wrap' }, table),
      h('div', { class: 'readout' }, `gcd(${m0}, ${n0}) = ${g}   after ${steps.length} division step${steps.length === 1 ? '' : 's'}\n${x}·${m0} + ${y}·${n0} = ${g}   (extended Euclid)${inverse}`),
    );
  }

  runBtn.addEventListener('click', run);
  mIn.addEventListener('change', run);
  nIn.addEventListener('change', run);
  randBtn.addEventListener('click', () => { mIn.value = String(Math.floor(Math.random() * 9000) + 100); nIn.value = String(Math.floor(Math.random() * 900) + 10); run(); });
  fibBtn.addEventListener('click', () => { const k = 15 + Math.floor(Math.random() * 15); mIn.value = fib(k + 1).toString(); nIn.value = fib(k).toString(); run(); });
  run();
}
