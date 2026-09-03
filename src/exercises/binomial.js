// Exercises for §1.2.6 Binomial Coefficients.
import { makeMC } from './answers.js';
import { binom, fmt, Fraction } from '../lib/mathutil.js';
import { binomialSeries } from '../lib/series.js';

const r = String.raw;

export function binomCompute(rng) {
  const n = rng.int(4, 14), k = rng.int(0, n);
  const ans = binom(n, k);
  const kk = Math.min(k, n - k);
  const num = Array.from({ length: kk }, (_, i) => n - i).join('\\cdot ') || '1';
  const den = Array.from({ length: kk }, (_, i) => kk - i).join('\\cdot ') || '1';
  return {
    kind: 'binom-compute',
    type: 'integer',
    prompt: r`Compute $\dbinom{${n}}{${k}}$.`,
    answer: ans.toString(),
    hint: 'n(n−1)⋯(n−k+1) / k!. Use symmetry to make k small.',
    solution: r`$\dbinom{${n}}{${k}} = \dbinom{${n}}{${kk}} = \dfrac{${num}}{${den}} = ${fmt(ans)}$. Knuth’s definition (§1.2.6 eq. (3)) is $\binom{r}{k} = \frac{r(r-1)\cdots(r-k+1)}{k!} = \frac{r^{\underline k}}{k!}$, which makes sense for any real $r$.`,
  };
}

export function rowSums(rng) {
  const n = rng.int(3, 12);
  const variant = rng.pick(['sum', 'alt', 'weighted', 'squares']);
  let s = 0n;
  if (variant === 'sum') {
    for (let k = 0; k <= n; k++) s += binom(n, k);
    return {
      kind: 'binom-row-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{k=0}^{${n}} \binom{${n}}{k}$.`,
      answer: s.toString(),
      hint: 'Set x = y = 1 in the binomial theorem.',
      solution: r`By the binomial theorem $(1+1)^{${n}} = \sum_k \binom{${n}}{k} = 2^{${n}} = ${fmt(s)}$. Combinatorially: the number of subsets of a ${n}-element set.`,
    };
  }
  if (variant === 'alt') {
    for (let k = 0; k <= n; k++) s += (k % 2 ? -1n : 1n) * binom(n, k);
    return {
      kind: 'binom-row-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{k=0}^{${n}} (-1)^k \binom{${n}}{k}$.`,
      answer: s.toString(),
      hint: 'Set x = 1, y = −1 in the binomial theorem.',
      solution: r`$(1-1)^{${n}} = \sum_k \binom{${n}}{k}(-1)^k = 0$ for $n \ge 1$. In general $\sum_k (-1)^k\binom{n}{k} = [n = 0]$, one of Knuth’s favourite identities (§1.2.6 eq. (13)).`,
    };
  }
  if (variant === 'weighted') {
    for (let k = 0; k <= n; k++) s += BigInt(k) * binom(n, k);
    return {
      kind: 'binom-row-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{k=0}^{${n}} k\binom{${n}}{k}$.`,
      answer: s.toString(),
      hint: 'Absorption: k·C(n,k) = n·C(n−1,k−1).',
      solution: r`Using the absorption identity $k\binom{n}{k} = n\binom{n-1}{k-1}$: $\sum_k k\binom{${n}}{k} = ${n}\sum_k \binom{${n - 1}}{k-1} = ${n}\cdot 2^{${n - 1}} = ${fmt(s)}$. (Or differentiate $(1+x)^n$ and set $x = 1$.)`,
    };
  }
  for (let k = 0; k <= n; k++) s += binom(n, k) ** 2n;
  return {
    kind: 'binom-row-sum',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{k=0}^{${n}} \binom{${n}}{k}^2$.`,
    answer: s.toString(),
    hint: 'Write C(n,k)² = C(n,k)·C(n,n−k) and use Vandermonde’s convolution.',
    solution: r`$\sum_k \binom{n}{k}^2 = \sum_k \binom{n}{k}\binom{n}{n-k} = \binom{2n}{n}$ by Vandermonde’s convolution (§1.2.6 eq. (21)). Here $\binom{${2 * n}}{${n}} = ${fmt(s)}$.`,
  };
}

const identities = [
  { lhs: r`k\binom{n}{k}`, ok: r`n\binom{n-1}{k-1}`, bad: [r`n\binom{n}{k-1}`, r`(n-k)\binom{n-1}{k}`, r`k\binom{n-1}{k}`], name: 'absorption (“moving in and out of parentheses”, §1.2.6)' },
  { lhs: r`\binom{n}{k}`, ok: r`\binom{n-1}{k} + \binom{n-1}{k-1}`, bad: [r`\binom{n-1}{k} + \binom{n}{k-1}`, r`\binom{n-1}{k-1} + \binom{n-2}{k-1}`, r`2\binom{n-1}{k-1}`], name: 'addition formula (Pascal’s rule, eq. (9))' },
  { lhs: r`\binom{n}{k}` + r`\text{ for integer } n \ge 0`, ok: r`\binom{n}{n-k}`, bad: [r`\binom{n-k}{k}`, r`\binom{k}{n}`, r`\binom{n}{k-n}`], name: 'symmetry (eq. (6))' },
  { lhs: r`\binom{n}{k}\binom{k}{m}`, ok: r`\binom{n}{m}\binom{n-m}{k-m}`, bad: [r`\binom{n}{m}\binom{k}{n-m}`, r`\binom{n}{k-m}\binom{k}{m}`, r`\binom{n-k}{m}\binom{n}{k}`], name: 'trinomial revision (eq. (20))' },
  { lhs: r`\binom{-n}{k}` + r`\text{ for } n \ge 1`, ok: r`(-1)^k\binom{n+k-1}{k}`, bad: [r`-\binom{n}{k}`, r`(-1)^k\binom{n}{k}`, r`(-1)^n\binom{n+k-1}{k}`], name: 'upper negation (eq. (17))' },
  { lhs: r`\binom{r}{k}`, ok: r`\frac{r}{k}\binom{r-1}{k-1}`, bad: [r`\frac{k}{r}\binom{r-1}{k-1}`, r`\frac{r}{k}\binom{r}{k-1}`, r`\frac{r-1}{k}\binom{r-1}{k-1}`], name: 'absorption in the form (7)' },
  { lhs: r`\sum_{k=0}^{n}\binom{k}{m}`, ok: r`\binom{n+1}{m+1}`, bad: [r`\binom{n}{m+1}`, r`\binom{n+1}{m}`, r`\binom{n+m}{m}`], name: 'summation on the upper index (one of the two summation formulas in §1.2.6)' },
  { lhs: r`\sum_{k=0}^{n}\binom{r+k}{k}`, ok: r`\binom{r+n+1}{n}`, bad: [r`\binom{r+n}{n}`, r`\binom{r+n+1}{n+1}`, r`\binom{r+n}{r}`], name: 'summation on the lower index (the other summation formula in §1.2.6)' },
  { lhs: r`\sum_{k}\binom{r}{k}\binom{s}{n-k}`, ok: r`\binom{r+s}{n}`, bad: [r`\binom{r}{n}\binom{s}{n}`, r`\binom{rs}{n}`, r`\binom{r+s}{r+s-n}\cdot\binom{n}{r}`], name: 'Vandermonde’s convolution (eq. (21))' },
];

export function identityMC(rng) {
  const it = rng.pick(identities);
  return makeMC(rng, {
    kind: 'binom-identity',
    prompt: r`Which expression equals $\displaystyle ${it.lhs}$ (for all integers $k$ in range)?`,
    correct: `$${it.ok}$`,
    distractors: it.bad.map((b) => `$${b}$`),
    hint: 'If unsure, test with small numbers, e.g. n = 5, k = 2.',
    solution: r`$${it.lhs} = ${it.ok}$: this is the ${it.name}. Knuth lists about ten such identities in §1.2.6 and says everyone should have the basic ones at their fingertips; check unfamiliar ones by plugging in small numbers.`,
  });
}

/** Coefficient extraction from (a + b x)^n. */
export function binomialTheorem(rng) {
  const n = rng.int(3, 9);
  const k = rng.int(0, n);
  const a = rng.pick([1, 1, 2, -1, 3]);
  const b = rng.pick([1, 2, -1, -2, 3]);
  // coefficient of x^k in (a + b x)^n = C(n,k) a^{n-k} b^k
  const coef = binom(n, k) * BigInt(a) ** BigInt(n - k) * BigInt(b) ** BigInt(k);
  const inner = `${a === 1 ? '1' : a === -1 ? '-1' : a} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`}`;
  return {
    kind: 'binomial-theorem',
    type: 'integer',
    prompt: r`What is the coefficient of $x^{${k}}$ in $(${inner})^{${n}}$?`,
    answer: coef.toString(),
    hint: '(a + bx)^n = Σ_k C(n,k) a^{n−k} (bx)^k.',
    solution: r`By the binomial theorem the $x^{${k}}$ term is $\binom{${n}}{${k}}\,(${a})^{${n - k}}\,(${b}x)^{${k}} = ${binom(n, k)}\cdot ${BigInt(a) ** BigInt(n - k)}\cdot ${BigInt(b) ** BigInt(k)}\,x^{${k}}$, so the coefficient is $${coef}$.`,
  };
}

export function vandermonde(rng) {
  const m = rng.int(2, 7), n = rng.int(2, 7), t = rng.int(1, Math.min(m + n, 6));
  let s = 0n;
  for (let k = 0; k <= t; k++) s += binom(m, k) * binom(n, t - k);
  return {
    kind: 'vandermonde',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{k=0}^{${t}} \binom{${m}}{k}\binom{${n}}{${t}-k}$.`,
    answer: s.toString(),
    hint: 'Choosing t things from m + n things: split by how many come from the first group.',
    solution: r`This is Vandermonde’s convolution: $\sum_k \binom{m}{k}\binom{n}{t-k} = \binom{m+n}{t}$. Choosing $${t}$ objects from $${m} + ${n}$ objects, condition on how many ($k$) come from the first group. So the sum is $\binom{${m + n}}{${t}} = ${fmt(s)}$.`,
  };
}

export function hockeyStick(rng) {
  const m = rng.int(1, 4), n = rng.int(m + 2, m + 9);
  let s = 0n;
  for (let k = 0; k <= n; k++) s += binom(k, m);
  return {
    kind: 'hockey-stick',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{k=0}^{${n}} \binom{k}{${m}}$.`,
    answer: s.toString(),
    hint: 'Sum along a column of Pascal’s triangle: the answer sits one row down and one column right.',
    solution: r`Summing on the upper index (one of Knuth’s two summation formulas in §1.2.6): $\sum_{k=0}^{n}\binom{k}{m} = \binom{n+1}{m+1}$. Here $\binom{${n + 1}}{${m + 1}} = ${fmt(s)}$. Proof idea: apply Pascal’s rule repeatedly, $\binom{n+1}{m+1} = \binom{n}{m} + \binom{n}{m+1} = \binom{n}{m} + \binom{n-1}{m} + \binom{n-1}{m+1} = \dots$. (Nicknamed the *hockey-stick identity* from its shape in the triangle; try it in the Pascal explorer.)`,
  };
}

/** Binomial coefficients with negative or fractional upper index. */
export function generalizedBinomial(rng) {
  if (rng.chance(0.5)) {
    const n = rng.int(1, 6), k = rng.int(1, 5);
    const ans = binom(-n, k);
    return {
      kind: 'generalized-binomial',
      type: 'integer',
      prompt: r`Using Knuth’s definition $\binom{r}{k} = \dfrac{r(r-1)\cdots(r-k+1)}{k!}$ for any real $r$, evaluate $\dbinom{${-n}}{${k}}$.`,
      answer: ans.toString(),
      hint: 'Multiply out the k factors starting at −n, or use upper negation: C(−n,k) = (−1)^k C(n+k−1,k).',
      solution: r`$\dbinom{${-n}}{${k}} = \dfrac{${Array.from({ length: k }, (_, i) => `(${-n - i})`).join('')}}{${k}!} = ${ans}$. Equivalently, upper negation (eq. (17)) gives $(-1)^{${k}}\binom{${n + k - 1}}{${k}} = ${ans}$. This is why $\frac{1}{(1-z)^n} = \sum_k \binom{n+k-1}{k} z^k$ in generating functions.`,
    };
  }
  const k = rng.int(1, 4);
  const half = rng.pick(['1/2', '-1/2', '3/2']);
  const coeffs = binomialSeries(half, k);
  const ans = coeffs[k];
  const rr = Fraction.parse(half);
  const factors = Array.from({ length: k }, (_, i) => `(${rr.sub(i).toTeX()})`).join('');
  return {
    kind: 'generalized-binomial',
    type: 'fraction',
    prompt: r`Evaluate $\dbinom{${rr.toTeX()}}{${k}}$ using $\binom{r}{k} = \dfrac{r^{\underline{k}}}{k!}$. Give an exact fraction.`,
    answer: ans.toString(),
    hint: `Multiply ${k} factors: r, r−1, …, r−${k - 1}; divide by ${k}!.`,
    solution: r`$\dbinom{${rr.toTeX()}}{${k}} = \dfrac{${factors}}{${k}!} = ${ans.toTeX()}$. Such coefficients appear in the series $(1+z)^{${rr.toTeX()}} = \sum_k \binom{${rr.toTeX()}}{k} z^k$; e.g. $\sqrt{1+z} = 1 + \tfrac12 z - \tfrac18 z^2 + \tfrac1{16}z^3 - \dots$`,
  };
}

export const generators = [binomCompute, rowSums, identityMC, binomialTheorem, vandermonde, hockeyStick, generalizedBinomial];
