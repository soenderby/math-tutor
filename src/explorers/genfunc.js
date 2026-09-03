import { h, clear } from '../ui/dom.js';
import { md } from '../ui/math.js';
import { parsePolynomial, seriesDiv, seriesMul, polyToTeX } from '../lib/series.js';
import { Fraction } from '../lib/mathutil.js';

const presets = [
  ['z', '1 - z - z^2', 'Fibonacci: z/(1−z−z²)'],
  ['1', '1 - z', '1/(1−z) → all ones'],
  ['1', '(1 - z)^2', '1/(1−z)² → n+1'],
  ['z', '(1 - z)^2', 'z/(1−z)² → n'],
  ['z(1 + z)', '(1 - z)^3', 'z(1+z)/(1−z)³ → n²'],
  ['1', '1 - 2z', '1/(1−2z) → 2ⁿ'],
  ['1', '(1 - z)(1 - 2z)', '1/((1−z)(1−2z)) → 2ⁿ⁺¹−1'],
  ['1', '1 - z - 2z^2', '1/(1−z−2z²)'],
  ['1', '1 - z^2', '1/(1−z²) → [n even]'],
  ['1', '(1 - z)^3', '1/(1−z)³ → C(n+2,2)'],
  ['1 + z', '1 - z', '(1+z)/(1−z)'],
  ['1', '1 - z - z^2 - z^3', 'tribonacci'],
  ['1', '(1 - z)(1 - z^2)(1 - z^5)', 'coins: ways to make n from 1, 2, 5'],
];

/**
 * Parse a product of parenthesised factors with optional powers, e.g.
 * "(1 - z)(1 - 2z)^2", or a bare polynomial. Returns Fraction[] or null.
 */
export function parseFactored(text) {
  const s = (text ?? '').replace(/\s+/g, '');
  if (!s) return null;
  if (!s.includes('(')) return parsePolynomial(s);
  let acc = [new Fraction(1n)];
  let i = 0;
  while (i < s.length) {
    if (s[i] === '*') { i++; continue; }
    if (s[i] !== '(') {
      // a leading coefficient like 2(1-z)
      const m = s.slice(i).match(/^-?\d+(?:\/\d+)?/);
      if (!m) return null;
      const c = Fraction.parse(m[0]);
      if (!c) return null;
      acc = acc.map((a) => a.mul(c));
      i += m[0].length;
      continue;
    }
    let depth = 0, j = i;
    for (; j < s.length; j++) {
      if (s[j] === '(') depth++;
      else if (s[j] === ')') { depth--; if (depth === 0) break; }
    }
    if (j >= s.length) return null;
    const inner = parsePolynomial(s.slice(i + 1, j));
    if (!inner) return null;
    i = j + 1;
    let power = 1;
    if (s[i] === '^') {
      const m = s.slice(i + 1).match(/^\d+/);
      if (!m) return null;
      power = Number(m[0]);
      i += 1 + m[0].length;
    }
    for (let k = 0; k < power; k++) acc = seriesMul(acc, inner, acc.length + inner.length - 2);
  }
  return acc;
}

export function mountGenfunc(container) {
  const numIn = h('input', { type: 'text', class: 'wide', value: 'z' });
  const denIn = h('input', { type: 'text', class: 'wide', value: '1 - z - z^2' });
  const termsIn = h('input', { type: 'number', min: 1, max: 60, value: 15 });
  const presetSel = h('select', {}, h('option', { value: '' }, 'presets…'), ...presets.map((p, i) => h('option', { value: i }, p[2])));
  const controls = h('div', { class: 'controls' },
    h('label', {}, 'Numerator: ', numIn),
    h('label', {}, 'Denominator: ', denIn),
    h('label', {}, 'Terms: ', termsIn),
    presetSel,
  );
  const out = h('div', {});
  const notes = md(String.raw`
A generating function is a *clothesline* for a sequence: $G(z) = a_0 + a_1 z + a_2 z^2 + \dots$. For a rational function $P(z)/Q(z)$ with $Q(0) \ne 0$ the coefficients come from long division of power series, which is exactly what this tool does (with exact fractions).

If $Q(z) = 1 - c_1 z - c_2 z^2 - \dots$, the coefficients satisfy $a_n = c_1 a_{n-1} + c_2 a_{n-2} + \dots$ for every $n$ beyond the degree of $P$: **the denominator is the recurrence**, and the numerator fixes the initial values. Try the Fibonacci preset and then change the numerator to $1$ or $1 + z$.

Syntax: integer or fractional coefficients, powers with ^, factors in parentheses like (1 - z)(1 - 2z) or (1 - z)^3.
`);
  container.append(controls, out, notes);

  function run() {
    clear(out);
    const num = parseFactored(numIn.value);
    const den = parseFactored(denIn.value);
    const n = Math.max(1, Math.min(60, Math.floor(Number(termsIn.value) || 15)));
    if (!num || !den) { out.append(h('div', { class: 'error' }, 'Could not parse a polynomial. Try something like 1 - z - z^2 or (1 - z)(1 - 2z).')); return; }
    if (den[0].n === 0n) { out.append(h('div', { class: 'error' }, 'The denominator must have a nonzero constant term (otherwise the series does not start at z⁰).')); return; }
    const coeffs = seriesDiv(num, den, n - 1);
    const d0 = den[0];
    const recurrence = den.slice(1).map((c, i) => {
      const cc = c.neg().div(d0);
      if (cc.n === 0n) return null;
      const s = cc.toString();
      return `${s === '1' ? '' : s === '-1' ? '-' : s + '·'}a_{n-${i + 1}}`;
    }).filter(Boolean);
    const shown = coeffs.slice(0, Math.min(8, n)).map((c, i) => {
      if (c.n === 0n) return '';
      const sign = c.n < 0n ? '-' : i ? '+' : '';
      const mag = c.n < 0n ? c.neg() : c;
      const coef = i > 0 && mag.eq(1) ? '' : mag.toTeX();
      return `${sign} ${coef}${i === 0 ? '' : i === 1 ? 'z' : `z^{${i}}`}`;
    }).filter(Boolean).join(' ');
    out.append(
      md(`$$G(z) = \\frac{${polyToTeX(num)}}{${polyToTeX(den)}} = ${shown || '0'} + \\cdots$$`),
      h('div', { class: 'table-wrap' }, h('table', { class: 'sans' },
        h('thead', {}, h('tr', {}, h('th', {}, 'n'), ...coeffs.map((_, i) => h('th', {}, i)))),
        h('tbody', {}, h('tr', {}, h('td', {}, 'aₙ'), ...coeffs.map((c) => h('td', { class: 'mono' }, c.toString())))))),
      recurrence.length
        ? h('div', { class: 'readout' }, `Recurrence encoded by the denominator:\n a_n = ${recurrence.join(' + ').replace(/\+ -/g, '- ')}   for n > deg(numerator)`)
        : null,
    );
  }

  [numIn, denIn, termsIn].forEach((el) => el.addEventListener('input', run));
  presetSel.addEventListener('change', () => {
    if (presetSel.value === '') return;
    const [nu, de] = presets[Number(presetSel.value)];
    numIn.value = nu; denIn.value = de;
    run();
  });
  run();
}
