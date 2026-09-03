// Formal power series with exact rational coefficients, enough for the
// generating-function exercises and the explorer.
import { Fraction } from './mathutil.js';

const F = (x) => Fraction.from(x);

/** Multiply two coefficient arrays, truncated to `n + 1` terms. */
export function seriesMul(a, b, n) {
  const out = Array.from({ length: n + 1 }, () => new Fraction(0n));
  for (let i = 0; i < a.length && i <= n; i++) {
    if (F(a[i]).n === 0n) continue;
    for (let j = 0; j < b.length && i + j <= n; j++) {
      out[i + j] = out[i + j].add(F(a[i]).mul(F(b[j])));
    }
  }
  return out;
}

/** Coefficients of num(z)/den(z) up to z^n. den[0] must be nonzero. */
export function seriesDiv(num, den, n) {
  const d0 = F(den[0]);
  if (d0.n === 0n) throw new Error('denominator must have nonzero constant term');
  const out = [];
  for (let k = 0; k <= n; k++) {
    let acc = k < num.length ? F(num[k]) : new Fraction(0n);
    for (let j = 1; j <= k && j < den.length; j++) {
      acc = acc.sub(F(den[j]).mul(out[k - j]));
    }
    out.push(acc.div(d0));
  }
  return out;
}

/** Coefficients of (1 + z)^m truncated (m may be negative or non-integer via Fraction). */
export function binomialSeries(m, n) {
  const mm = F(m);
  const out = [new Fraction(1n)];
  for (let k = 1; k <= n; k++) {
    // c_k = c_{k-1} * (m - k + 1) / k
    out.push(out[k - 1].mul(mm.sub(new Fraction(BigInt(k - 1)))).div(new Fraction(BigInt(k))));
  }
  return out;
}

/** Parse a polynomial like "1 - z - z^2" or "2 + 3z^2" into a coefficient array. */
export function parsePolynomial(text) {
  const s = text.replace(/\s+/g, '').replace(/\*/g, '');
  if (!s) return null;
  const coeffs = [];
  const termRe = /([+-]?)(\d+(?:\/\d+)?|\d*\.\d+)?(z(?:\^(\d+))?)?/gy;
  let i = 0;
  while (i < s.length) {
    termRe.lastIndex = i;
    const m = termRe.exec(s);
    if (!m || m[0] === '') return null;
    i = termRe.lastIndex;
    const sign = m[1] === '-' ? -1 : 1;
    const hasZ = Boolean(m[3]);
    if (!m[2] && !hasZ) return null;
    let coef = m[2] ? Fraction.parse(m[2]) : new Fraction(1n);
    if (!coef) return null;
    if (sign < 0) coef = coef.neg();
    const deg = hasZ ? (m[4] ? Number(m[4]) : 1) : 0;
    while (coeffs.length <= deg) coeffs.push(new Fraction(0n));
    coeffs[deg] = coeffs[deg].add(coef);
  }
  return coeffs;
}

export function polyToTeX(coeffs) {
  const parts = [];
  coeffs.forEach((c, k) => {
    c = F(c);
    if (c.n === 0n) return;
    const abs = c.n < 0n ? c.neg() : c;
    const mag = k === 0 ? abs.toTeX() : abs.eq(1) ? '' : abs.toTeX();
    const z = k === 0 ? '' : k === 1 ? 'z' : `z^{${k}}`;
    const sign = c.n < 0n ? '-' : parts.length ? '+' : '';
    parts.push(`${sign} ${mag}${z}`.trim());
  });
  return parts.length ? parts.join(' ') : '0';
}
