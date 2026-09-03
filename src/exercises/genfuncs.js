// Exercises for §1.2.9 Generating Functions.
import { makeMC } from './answers.js';
import { seriesDiv, seriesMul, polyToTeX } from '../lib/series.js';
import { binom, fib, fmt, Fraction } from '../lib/mathutil.js';

const r = String.raw;

const closedForms = [
  { tex: r`\frac{1}{1-2z}`, num: [1], den: [1, -2], formula: r`2^n`, why: r`$\frac{1}{1-az} = \sum_n a^n z^n$ (geometric series).` },
  { tex: r`\frac{1}{1-3z}`, num: [1], den: [1, -3], formula: r`3^n`, why: r`$\frac{1}{1-az} = \sum_n a^n z^n$ (geometric series).` },
  { tex: r`\frac{1}{1+z}`, num: [1], den: [1, 1], formula: r`(-1)^n`, why: r`Geometric series with ratio $-z$.` },
  { tex: r`\frac{1}{(1-z)^2}`, num: [1], den: [1, -2, 1], formula: r`n+1`, why: r`Differentiate $\frac{1}{1-z} = \sum z^n$ to get $\frac{1}{(1-z)^2} = \sum (n+1) z^n$; or use $\frac{1}{(1-z)^m} = \sum_n \binom{n+m-1}{n} z^n$.` },
  { tex: r`\frac{z}{(1-z)^2}`, num: [0, 1], den: [1, -2, 1], formula: r`n`, why: r`Multiplying by $z$ shifts the sequence $n+1$ one place: $\sum n z^n$.` },
  { tex: r`\frac{1}{(1-z)^3}`, num: [1], den: [1, -3, 3, -1], formula: r`\binom{n+2}{2}`, why: r`$\frac{1}{(1-z)^m} = \sum_n \binom{n+m-1}{n} z^n$ (§1.2.9 eq. (7), via upper negation of the binomial series).` },
  { tex: r`\frac{1}{1-z^2}`, num: [1], den: [1, 0, -1], formula: r`[n \text{ even}]`, why: r`Geometric series in $z^2$: $1 + z^2 + z^4 + \dots$` },
  { tex: r`\frac{1}{(1-z)(1-2z)}`, num: [1], den: [1, -3, 2], formula: r`2^{n+1} - 1`, why: r`Partial fractions: $\frac{2}{1-2z} - \frac{1}{1-z}$, so the coefficient is $2\cdot 2^n - 1$. Equivalently, multiplying by $\frac{1}{1-z}$ takes prefix sums of $2^n$.` },
  { tex: r`\frac{1}{1-z-z^2}`, num: [1], den: [1, -1, -1], formula: r`F_{n+1}`, why: r`Knuth’s Fibonacci generating function is $\frac{z}{1-z-z^2} = \sum F_n z^n$ (§1.2.8 eq. (11)); without the $z$ the sequence is shifted: $F_{n+1}$.` },
  { tex: r`\frac{z}{1-z-z^2}`, num: [0, 1], den: [1, -1, -1], formula: r`F_n`, why: r`This is Knuth’s Fibonacci generating function, §1.2.8 eq. (11). Multiply out: $(1-z-z^2)\sum F_n z^n = z$ encodes the recurrence.` },
  { tex: r`\frac{1}{(1-2z)^2}`, num: [1], den: [1, -4, 4], formula: r`(n+1)2^n`, why: r`Substitute $2z$ into $\frac{1}{(1-z)^2} = \sum (n+1)z^n$.` },
  { tex: r`\frac{1+z}{1-z}`, num: [1, 1], den: [1, -1], formula: r`2 - [n = 0]`, why: r`$\frac{1+z}{1-z} = \frac{1}{1-z} + \frac{z}{1-z} = 1 + 2z + 2z^2 + \dots$` },
  { tex: r`\frac{1}{1-z-2z^2}`, num: [1], den: [1, -1, -2], formula: r`\frac{2^{n+1} + (-1)^n}{3}`, why: r`Factor $1 - z - 2z^2 = (1-2z)(1+z)$ and use partial fractions: $\frac{2/3}{1-2z} + \frac{1/3}{1+z}$.` },
];

export function coefficientExtraction(rng) {
  const cf = rng.pick(closedForms);
  const n = rng.int(3, 8);
  const coeffs = seriesDiv(cf.num, cf.den, n);
  const ans = coeffs[n];
  return {
    kind: 'gf-coefficient',
    type: 'integer',
    prompt: r`Find $[z^{${n}}]\, ${cf.tex}$, the coefficient of $z^{${n}}$ in the power series expansion.`,
    answer: ans.toString(),
    hint: 'Either recall the closed form of the coefficients, or expand: multiply the series by the denominator and match coefficients.',
    solution: r`The coefficients are $a_n = ${cf.formula}$: ${cf.why} The first few are ${coeffs.map((c) => c.toString()).join(', ')}; so $[z^{${n}}] = ${ans}$. (Knuth writes $[z^n]\,G(z)$ for “coefficient of $z^n$ in $G$”.)`,
  };
}

const sequences = [
  { seq: r`a_n = 1`, gf: r`\frac{1}{1-z}` },
  { seq: r`a_n = n`, gf: r`\frac{z}{(1-z)^2}` },
  { seq: r`a_n = n + 1`, gf: r`\frac{1}{(1-z)^2}` },
  { seq: r`a_n = 2^n`, gf: r`\frac{1}{1-2z}` },
  { seq: r`a_n = (-1)^n`, gf: r`\frac{1}{1+z}` },
  { seq: r`a_n = [n \text{ even}]`, gf: r`\frac{1}{1-z^2}` },
  { seq: r`a_n = F_n`, gf: r`\frac{z}{1-z-z^2}` },
  { seq: r`a_n = \binom{m}{n}` + r`\ (m \text{ fixed})`, gf: r`(1+z)^m` },
  { seq: r`a_n = \binom{n+m-1}{n}` + r`\ (m \text{ fixed})`, gf: r`\frac{1}{(1-z)^m}` },
  { seq: r`a_n = \frac{1}{n!}`, gf: r`e^z` },
  { seq: r`a_n = \frac{1}{n}` + r`\ (n \ge 1),\ a_0 = 0`, gf: r`\ln\frac{1}{1-z}` },
  { seq: r`a_n = H_n`, gf: r`\frac{1}{1-z}\ln\frac{1}{1-z}` },
  { seq: r`a_n = [n = 3]`, gf: r`z^3` },
  { seq: r`a_n = n^2`, gf: r`\frac{z(1+z)}{(1-z)^3}` },
];

export function matchGF(rng) {
  const it = rng.pick(sequences);
  const others = rng.sample(sequences.filter((s) => s !== it), 3);
  return makeMC(rng, {
    kind: 'gf-match',
    prompt: r`Which generating function $G(z) = \sum_{n \ge 0} a_n z^n$ has coefficients $${it.seq}$?`,
    correct: `$${it.gf}$`,
    distractors: others.map((o) => `$${o.gf}$`),
    hint: 'Expand each candidate for a couple of terms and compare a_0, a_1, a_2.',
    solution: r`$${it.gf} = \sum_n (${it.seq.replace(/^a_n = /, '')})\, z^n$. Knuth’s table of basic generating functions is §1.2.9 eqs. (3)–(11); the ones worth memorising are $\frac{1}{1-z}$, $\frac{1}{(1-z)^m}$, $\frac{1}{1-az}$, $(1+z)^r$, $e^z$ and $\ln\frac{1}{1-z}$. Everything else is built from those by the operations in exercise “GF operations”.`,
  });
}

const operations = [
  { b: r`b_n = a_{n-1}` + r`\ (b_0 = 0)`, ok: r`z\,A(z)`, name: 'shift right' },
  { b: r`b_n = a_{n+1}`, ok: r`\frac{A(z) - a_0}{z}`, name: 'shift left' },
  { b: r`b_n = n\,a_n`, ok: r`z\,A'(z)`, name: 'multiply by n (differentiate)' },
  { b: r`b_n = c^n a_n`, ok: r`A(cz)`, name: 'scale the argument' },
  { b: r`b_n = \sum_{k=0}^{n} a_k`, ok: r`\frac{A(z)}{1-z}`, name: 'prefix sums (multiply by 1/(1−z))' },
  { b: r`b_n = \sum_{k=0}^{n} a_k\,c_{n-k}` + r`\ \text{where } C(z) = \sum c_n z^n`, ok: r`A(z)\,C(z)`, name: 'convolution (product)' },
  { b: r`b_n = a_n - a_{n-1}` + r`\ (a_{-1} = 0)`, ok: r`(1-z)\,A(z)`, name: 'differences' },
  { b: r`b_n = [n \text{ even}]\,a_n`, ok: r`\frac{A(z) + A(-z)}{2}`, name: 'even part' },
  { b: r`b_n = \frac{a_n}{n+1}`, ok: r`\frac{1}{z}\int_0^z A(t)\,dt`, name: 'integrate' },
];

export function gfOperations(rng) {
  const it = rng.pick(operations);
  const others = rng.sample(operations.filter((o) => o !== it), 3);
  return makeMC(rng, {
    kind: 'gf-operation',
    prompt: r`Let $A(z) = \sum_{n\ge0} a_n z^n$. Which generating function has coefficients $${it.b}$?`,
    correct: `$${it.ok}$`,
    distractors: others.map((o) => `$${o.ok}$`),
    hint: 'Write out a few terms of A(z) and apply the operation to see what happens to the coefficients.',
    solution: r`$${it.b}$ corresponds to $${it.ok}$ (${it.name}). Knuth’s §1.2.9 eqs. (12)–(19) list these; the whole art of generating functions is translating sequence operations into algebra on $A(z)$ and back.`,
  });
}

export function convolution(rng) {
  const da = rng.int(1, 3), db = rng.int(1, 3);
  const a = Array.from({ length: da + 1 }, () => rng.int(-3, 4));
  const b = Array.from({ length: db + 1 }, () => rng.int(-3, 4));
  if (a[da] === 0) a[da] = 1;
  if (b[db] === 0) b[db] = 1;
  const prod = seriesMul(a, b, da + db);
  const k = rng.int(0, da + db);
  const terms = [];
  for (let i = 0; i <= k; i++) {
    if (i < a.length && k - i < b.length) terms.push(`(${a[i]})(${b[k - i]})`);
  }
  return {
    kind: 'gf-convolution',
    type: 'integer',
    prompt: r`Let $A(z) = ${polyToTeX(a)}$ and $B(z) = ${polyToTeX(b)}$. What is $[z^{${k}}]\,A(z)B(z)$?`,
    answer: prod[k].toString(),
    hint: 'The coefficient of z^k in a product is Σ_i a_i b_{k−i}.',
    solution: r`$[z^{${k}}]\,A(z)B(z) = \sum_{i} a_i b_{${k}-i} = ${terms.join(' + ')} = ${prod[k]}$. Multiplying generating functions convolves their coefficient sequences; this is the reason generating functions solve counting problems where a total is split into two parts.`,
  };
}

export function recurrenceToGF(rng) {
  const c = rng.pick([1, 2, 3, -1]), d = rng.pick([1, 2, -1, -2, 6]);
  const a0 = rng.int(0, 3), a1 = rng.int(1, 4);
  const numTex = polyToTeX([a0, a1 - c * a0]);
  const denTex = polyToTeX([1, -c, -d]);
  const rec = `a_n = ${c === 1 ? '' : c === -1 ? '-' : c}a_{n-1} ${d < 0 ? '-' : '+'} ${Math.abs(d) === 1 ? '' : Math.abs(d)}a_{n-2}`;
  const correct = r`$\dfrac{${numTex}}{${denTex}}$`;
  const wrongs = [
    r`$\dfrac{${polyToTeX([a0, a1])}}{${denTex}}$`,
    r`$\dfrac{${numTex}}{${polyToTeX([1, c, d])}}$`,
    r`$\dfrac{${numTex}}{${polyToTeX([-d, -c, 1])}}$`,
  ];
  return makeMC(rng, {
    kind: 'gf-recurrence',
    prompt: r`The sequence satisfies $${rec}$ for $n \ge 2$, with $a_0 = ${a0}$, $a_1 = ${a1}$. What is its generating function $A(z) = \sum_{n\ge0} a_n z^n$?`,
    correct,
    distractors: wrongs,
    hint: 'Multiply the recurrence by zⁿ and sum over n ≥ 2; you get A(z) − a₀ − a₁z = cz(A(z) − a₀) + dz²A(z).',
    solution: r`Multiply the recurrence by $z^n$ and sum for $n \ge 2$: $A(z) - a_0 - a_1 z = ${c}z\,(A(z) - a_0) + ${d}z^2 A(z)$. Solving, $A(z)(${denTex}) = a_0 + (a_1 - ${c}a_0)z = ${numTex}$, so $A(z) = \dfrac{${numTex}}{${denTex}}$. This is exactly how Knuth derives the Fibonacci generating function in §1.2.8; the denominator $1 - cz - dz^2$ is the recurrence “in disguise”.`,
  });
}

export function partialFractionsCoefficient(rng) {
  // 1/((1 - p z)(1 - q z)) with distinct p, q -> (p^{n+1} - q^{n+1})/(p - q)
  const p = rng.pick([2, 3, 4]);
  let q = rng.pick([1, -1, 2, 3]);
  if (q === p) q = -1;
  const n = rng.int(2, 6);
  const coeffs = seriesDiv([1], [1, -(p + q), p * q], n);
  const ans = coeffs[n];
  const A = new Fraction(BigInt(p), BigInt(p - q)), Bq = new Fraction(BigInt(q), BigInt(p - q));
  return {
    kind: 'gf-partial-fractions',
    type: 'integer',
    prompt: r`Find $[z^{${n}}]\,\dfrac{1}{(1-${p}z)(1${q < 0 ? '+' : '-'}${Math.abs(q) === 1 ? '' : Math.abs(q)}z)}$.`,
    answer: ans.toString(),
    hint: 'Partial fractions: 1/((1−pz)(1−qz)) = (p/(p−q))/(1−pz) − (q/(p−q))/(1−qz).',
    solution: r`Partial fractions give $\dfrac{${A.toTeX()}}{1-${p}z} - \dfrac{${Bq.toTeX()}}{1${q < 0 ? '+' : '-'}${Math.abs(q) === 1 ? '' : Math.abs(q)}z}$, so $a_n = \dfrac{${p}^{n+1} - (${q})^{n+1}}{${p - q}}$. At $n = ${n}$: $\dfrac{${fmt(BigInt(p) ** BigInt(n + 1))} - (${BigInt(q) ** BigInt(n + 1)})}{${p - q}} = ${ans}$. This is the general method of §1.2.9 for rational generating functions: factor the denominator, split, and read off geometric series.`,
  };
}

export const generators = [coefficientExtraction, matchGF, gfOperations, convolution, recurrenceToGF, partialFractionsCoefficient];

// Sanity: keep unused imports meaningful for tests.
export const _internal = { binom, fib };
