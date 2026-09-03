// Exercises for §1.2.7 Harmonic Numbers.
import { makeMC } from './answers.js';
import { harmonic, harmonicApprox, EULER_GAMMA, Fraction } from '../lib/mathutil.js';

const r = String.raw;

export function harmonicExact(rng) {
  const n = rng.int(2, 8);
  const h = harmonic(n);
  return {
    kind: 'harmonic-exact',
    type: 'fraction',
    prompt: r`Compute $H_{${n}} = 1 + \tfrac12 + \dots + \tfrac1{${n}}$ exactly, as a fraction.`,
    answer: h.toString(),
    hint: 'Put everything over the least common multiple of 1, …, n.',
    solution: r`$H_{${n}} = ${Array.from({ length: n }, (_, i) => (i === 0 ? '1' : `\\tfrac{1}{${i + 1}}`)).join(' + ')} = ${h.toTeX()} \approx ${h.toNumber().toFixed(4)}$. Fun fact (Knuth §1.2.7 exercise 21 / Concrete Math): $H_n$ is never an integer for $n > 1$.`,
  };
}

export function harmonicEstimate(rng) {
  const n = rng.pick([10, 20, 50, 100, 200, 500, 1000, 10000]);
  const exact = n <= 1000 ? harmonic(n).toNumber() : harmonicApprox(n);
  return {
    kind: 'harmonic-estimate',
    type: 'decimal',
    prompt: r`Estimate $H_{${n}}$ to within about $0.01$, using $H_n \approx \ln n + \gamma + \dfrac{1}{2n}$ with $\gamma \approx 0.5772$ (and $\ln 10 \approx 2.3026$, $\ln 2 \approx 0.6931$, $\ln 5 \approx 1.6094$).`,
    answer: Math.round(exact * 1000) / 1000,
    tolerance: 0.011,
    hint: 'ln n: break n into factors of 2, 5, 10.',
    solution: r`$\ln ${n} \approx ${Math.log(n).toFixed(4)}$, so $H_{${n}} \approx ${Math.log(n).toFixed(4)} + 0.5772 + ${(1 / (2 * n)).toFixed(4)} = ${(Math.log(n) + EULER_GAMMA + 1 / (2 * n)).toFixed(4)}$. The true value is $${exact.toFixed(4)}$. Knuth’s full expansion (§1.2.7 eq. (3)) continues $- \frac{1}{12n^2} + \frac{1}{120n^4} - \dots$`,
  };
}

export function harmonicDifference(rng) {
  const m = rng.int(1, 8), n = m + rng.int(1, 4);
  const d = harmonic(n).sub(harmonic(m));
  return {
    kind: 'harmonic-difference',
    type: 'fraction',
    prompt: r`Compute $H_{${n}} - H_{${m}}$ exactly.`,
    answer: d.toString(),
    hint: 'All the terms up to 1/m cancel.',
    solution: r`$H_{${n}} - H_{${m}} = \sum_{k=${m + 1}}^{${n}} \frac1k = ${Array.from({ length: n - m }, (_, i) => `\\tfrac{1}{${m + 1 + i}}`).join(' + ')} = ${d.toTeX()}$. Differences of harmonic numbers are how “sum of $1/k$ over a range” is written; e.g. $H_{2n} - H_n \to \ln 2$.`,
  };
}

export function sumOfHarmonics(rng) {
  const n = rng.int(2, 7);
  let s = new Fraction(0n);
  for (let k = 1; k <= n; k++) s = s.add(harmonic(k));
  const hn = harmonic(n);
  return {
    kind: 'sum-of-harmonics',
    type: 'fraction',
    prompt: r`Compute $\displaystyle\sum_{k=1}^{${n}} H_k$ exactly.`,
    answer: s.toString(),
    hint: 'Knuth’s identity: Σ_{k≤n} H_k = (n+1)H_n − n. Or swap the order of summation.',
    solution: r`Interchanging the order of summation, $\sum_{k=1}^{n} H_k = \sum_{k=1}^{n}\sum_{j=1}^{k}\frac1j = \sum_{j=1}^{n}\frac{n-j+1}{j} = (n+1)H_n - n$. With $n = ${n}$ and $H_{${n}} = ${hn.toTeX()}$: $${n + 1}\cdot ${hn.toTeX()} - ${n} = ${s.toTeX()}$. This is §1.2.7 eq. (8).`,
  };
}

export function harmonicThreshold(rng) {
  const x = rng.pick([2, 2.5, 3, 3.5, 4, 4.5]);
  let n = 1;
  let h = new Fraction(1n);
  while (h.toNumber() <= x) { n++; h = h.add(new Fraction(1n, BigInt(n))); }
  return {
    kind: 'harmonic-threshold',
    type: 'integer',
    prompt: r`What is the smallest $n$ such that $H_n > ${x}$?`,
    answer: String(n),
    hint: 'Estimate with ln n + γ first (n ≈ e^{x − γ}), then check exactly near that value.',
    solution: r`From $H_n \approx \ln n + \gamma$ we expect $n \approx e^{${x} - 0.5772} \approx ${Math.exp(x - EULER_GAMMA).toFixed(1)}$. Checking exactly: $H_{${n - 1}} \approx ${harmonic(n - 1).toNumber().toFixed(4)} \le ${x}$ and $H_{${n}} \approx ${h.toNumber().toFixed(4)} > ${x}$, so $n = ${n}$. The harmonic series diverges, but agonisingly slowly: exceeding $10$ takes $12367$ terms.`,
  };
}

const facts = [
  { s: r`$H_n \le 1 + \ln n$ for all $n \ge 1$`, t: true, why: r`Compare with the integral: $\sum_{k=2}^{n} \frac1k \le \int_1^n \frac{dx}{x} = \ln n$.` },
  { s: r`$H_n < \ln n$ for all large $n$`, t: false, why: r`It is the other way round: $\ln n < H_n$ (compare $\frac1k$ with $\int_k^{k+1}\frac{dx}{x}$). In fact $H_n - \ln n \to \gamma \approx 0.577$.` },
  { s: r`$H_n \to \infty$ as $n \to \infty$`, t: true, why: r`The harmonic series diverges, e.g. because $H_{2^m} \ge 1 + m/2$ (group the terms in blocks of lengths $1, 2, 4, 8, \dots$, each block summing to at least $\tfrac12$).` },
  { s: r`$H_n - \ln n$ converges to a constant`, t: true, why: r`The limit is Euler’s constant $\gamma = 0.5772156649\ldots$ (§1.2.7 eq. (3)). Nobody knows whether $\gamma$ is rational.` },
  { s: r`$H_{2n} - H_n \to \ln 2$`, t: true, why: r`$H_{2n} - H_n \approx (\ln 2n + \gamma) - (\ln n + \gamma) = \ln 2$.` },
  { s: r`$H_n$ is an integer for some $n > 1$`, t: false, why: r`Never: the term $1/2^m$ with the largest power of two in $1..n$ cannot be cancelled by the others (Knuth §1.2.7 exercise 21).` },
  { s: r`$H_n = \Theta(\log n)$`, t: true, why: r`$\ln n < H_n \le 1 + \ln n$, so $H_n$ is sandwiched between constant multiples of $\log n$.` },
  { s: r`$H_n = O(1)$`, t: false, why: r`$H_n$ grows without bound (like $\ln n$), so it is not bounded by a constant.` },
  { s: r`$\sum_{k=1}^{n} \frac{1}{k^2}$ diverges as $n \to \infty$`, t: false, why: r`It converges to $\pi^2/6$ (Euler). Knuth writes $H_n^{(2)}$ for this sum; $H_n^{(r)} = \sum_{k\le n} k^{-r}$ converges for every $r > 1$.` },
  { s: r`$\sum_{k=1}^{n} \frac{1}{2k} = \tfrac12 H_n$`, t: true, why: r`Just factor out the constant $\tfrac12$.` },
  { s: r`$H_n \approx \ln n + \gamma + \dfrac{1}{2n}$ with an error of order $1/n^2$`, t: true, why: r`This is the start of Euler’s summation formula applied to $1/x$; the next term is $-\frac{1}{12n^2}$.` },
  { s: r`The expected number of times a running maximum changes while scanning $n$ random distinct numbers is $H_n - 1$`, t: true, why: r`The $k$-th element is a new maximum with probability $1/k$; summing $1/k$ for $k = 2..n$ gives $H_n - 1$. This is Knuth’s Algorithm M analysis in §1.2.10.` },
];

export function harmonicFacts(rng) {
  const f = rng.pick(facts);
  return makeMC(rng, {
    kind: 'harmonic-facts',
    prompt: `True or false: ${f.s}`,
    correct: f.t ? 'True' : 'False',
    distractors: [f.t ? 'False' : 'True'],
    solution: `**${f.t ? 'True' : 'False'}.** ${f.why}`,
  });
}

export const generators = [harmonicExact, harmonicEstimate, harmonicDifference, sumOfHarmonics, harmonicThreshold, harmonicFacts];
