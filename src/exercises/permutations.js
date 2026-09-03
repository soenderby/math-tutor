// Exercises for §1.2.5 Permutations and Factorials.
import { makeMC } from './answers.js';
import { factorial, falling, legendre, fmt } from '../lib/mathutil.js';

const r = String.raw;

/** Counting arrangements. */
export function countArrangements(rng) {
  if (rng.chance(0.5)) {
    const n = rng.int(3, 12);
    const things = rng.pick(['books on a shelf', 'people in a queue', 'distinct cards in a row', 'runners finishing a race (no ties)']);
    return {
      kind: 'count-arrangements',
      type: 'integer',
      prompt: r`In how many different orders can $${n}$ ${things} be arranged?`,
      answer: factorial(n).toString(),
      hint: 'n choices for the first position, n−1 for the second, …',
      solution: r`There are $${n}$ choices for the first position, $${n - 1}$ for the second, and so on: $${n}! = ${fmt(factorial(n))}$. Knuth’s §1.2.5 gives this argument and then proves it more carefully by induction.`,
    };
  }
  const n = rng.int(5, 15), k = rng.int(2, Math.min(4, n - 1));
  const ans = falling(n, k);
  return {
    kind: 'count-arrangements',
    type: 'integer',
    prompt: r`How many ways are there to arrange $${k}$ objects chosen from $${n}$ distinct objects in a row (order matters)?`,
    answer: ans.toString(),
    hint: 'n · (n−1) · … with k factors — the falling factorial n^{\\underline{k}} = n!/(n−k)!.',
    solution: r`$${n}\cdot ${n - 1}${k > 2 ? `\\cdot ${n - 2}` : ''}${k > 3 ? `\\cdot ${n - 3}` : ''} = ${fmt(ans)}$. Knuth writes this as $${n}^{\underline{${k}}} = \dfrac{${n}!}{${n - k}!}$, the *falling factorial power*; it counts $k$-permutations of $n$ things.`,
  };
}

/** Legendre's formula: exponent of p in n!. */
export function legendreExponent(rng) {
  const p = rng.pick([2, 2, 3, 5, 7]);
  const n = rng.int(10, 200);
  const { total, terms } = legendre(n, p);
  return {
    kind: 'legendre',
    type: 'integer',
    prompt: r`What is the exponent of the prime $${p}$ in the prime factorisation of $${n}!$?`,
    answer: String(total),
    hint: 'Count multiples of p, then multiples of p², p³, … (each contributes one more factor).',
    solution: r`Legendre’s formula (Knuth §1.2.5, eq. (8)): the exponent of $p$ in $n!$ is $\sum_{k \ge 1} \lfloor n/p^k \rfloor$. Here ${terms.map((t) => `$\\lfloor ${n}/${t.q} \\rfloor = ${t.t}$`).join(', ')}, summing to $${total}$. Each multiple of $${p}$ contributes one factor, each multiple of $${p * p}$ contributes an extra one, and so on.`,
  };
}

/** Trailing zeros of n!. */
export function trailingZeros(rng) {
  const n = rng.int(10, 500);
  const { total, terms } = legendre(n, 5);
  return {
    kind: 'trailing-zeros',
    type: 'integer',
    prompt: r`How many zeros does $${n}!$ end with when written in decimal?`,
    answer: String(total),
    hint: 'Each trailing zero needs a factor 10 = 2 × 5. Factors of 2 are plentiful; count the 5s.',
    solution: r`A trailing zero comes from a factor $2\cdot 5$, and $n!$ has far more factors of $2$ than of $5$, so the count equals the exponent of $5$: ${terms.map((t) => `$\\lfloor ${n}/${t.q} \\rfloor = ${t.t}$`).join(' + ')} $= ${total}$.`,
  };
}

/** Ratios of factorials. */
export function factorialRatio(rng) {
  const n = rng.int(6, 30);
  const k = rng.int(1, 3);
  const variant = rng.pick(['down', 'up']);
  if (variant === 'down') {
    const ans = falling(n, k);
    return {
      kind: 'factorial-ratio',
      type: 'integer',
      prompt: r`Simplify $\dfrac{${n}!}{${n - k}!}$.`,
      answer: ans.toString(),
      hint: 'Almost everything cancels; only the top k factors survive.',
      solution: r`$\dfrac{${n}!}{${n - k}!} = ${Array.from({ length: k }, (_, i) => n - i).join('\\cdot ')} = ${fmt(ans)}$. Don’t compute the factorials! Ratios of nearby factorials are products of a few consecutive integers.`,
    };
  }
  const ans = falling(n + k, k);
  return {
    kind: 'factorial-ratio',
    type: 'integer',
    prompt: r`Simplify $\dfrac{(n+${k})!}{n!}$ for $n = ${n}$.`,
    answer: ans.toString(),
    hint: '(n+k)!/n! = (n+k)(n+k−1)⋯(n+1).',
    solution: r`$\dfrac{(n+${k})!}{n!} = ${Array.from({ length: k }, (_, i) => `(n+${k - i})`).join('')}$, which at $n = ${n}$ is $${Array.from({ length: k }, (_, i) => n + k - i).join('\\cdot ')} = ${fmt(ans)}$.`,
  };
}

const words = ['BANANA', 'MISSISSIPPI', 'LETTER', 'BOOKKEEPER', 'ALGEBRA', 'COMMITTEE', 'TENNESSEE', 'ABBA', 'KNUTH', 'PEPPER', 'ASSESS', 'GOOGLE', 'BALLOON', 'SUCCESS', 'ARRANGE'];

/** Permutations of a multiset. */
export function multisetPermutations(rng) {
  const w = rng.pick(words);
  const counts = {};
  for (const ch of w) counts[ch] = (counts[ch] ?? 0) + 1;
  let denom = 1n;
  for (const c of Object.values(counts)) denom *= factorial(c);
  const ans = factorial(w.length) / denom;
  const repeated = Object.entries(counts).filter(([, c]) => c > 1);
  return {
    kind: 'multiset-permutations',
    type: 'integer',
    prompt: r`How many distinct strings can be formed by rearranging the letters of **${w}**?`,
    answer: ans.toString(),
    hint: 'Start with n! and divide by (count)! for every repeated letter.',
    solution: r`The word has $${w.length}$ letters${repeated.length ? `, with ${repeated.map(([ch, c]) => `${ch} appearing $${c}$ times`).join(', ')}` : ' and no repeats'}. Permuting identical letters among themselves does not change the string, so the count is $\dfrac{${w.length}!}{${repeated.map(([, c]) => `${c}!`).join('\\,') || '1'}} = ${fmt(ans)}$. Knuth calls these *multinomial coefficients* (§1.2.6, eq. (42)).`,
  };
}

/** Stirling's approximation. */
export function stirling(rng) {
  if (rng.chance(0.5)) {
    return makeMC(rng, {
      kind: 'stirling',
      prompt: r`Which of these is **Stirling’s approximation** for $n!$ (the leading term, as Knuth gives it in §1.2.5)?`,
      correct: r`$\sqrt{2\pi n}\,\left(\dfrac{n}{e}\right)^{n}$`,
      distractors: [r`$\sqrt{2\pi n}\,\left(\dfrac{e}{n}\right)^{n}$`, r`$\left(\dfrac{n}{2}\right)^{n}$`, r`$e^{n}\,n^{n}$`, r`$\sqrt{2\pi}\,n^{n}$`],
      hint: 'ln n! ≈ n ln n − n + ½ ln(2πn).',
      solution: r`$n! = \sqrt{2\pi n}\,(n/e)^n\,\bigl(1 + \frac{1}{12n} + O(n^{-2})\bigr)$. Taking logarithms: $\ln n! = n\ln n - n + \tfrac12\ln(2\pi n) + O(1/n)$. The $n \ln n - n$ part is what usually matters in algorithm analysis; e.g. it shows $\lg n! = \Theta(n \log n)$, the lower bound for comparison sorting.`,
    });
  }
  const n = rng.int(5, 15);
  const approx = Math.sqrt(2 * Math.PI * n) * (n / Math.E) ** n;
  const exact = Number(factorial(n));
  return {
    kind: 'stirling',
    type: 'decimal',
    prompt: r`Use Stirling’s approximation $n! \approx \sqrt{2\pi n}\,(n/e)^n$ to estimate $${n}!$. Enter your estimate (within $1\%$ of the Stirling value is accepted).`,
    answer: Math.round(approx),
    tolerance: approx * 0.01,
    hint: 'Work with logarithms: ln n! ≈ n ln n − n + ½ ln(2πn), then exponentiate.',
    solution: r`$\sqrt{2\pi\cdot ${n}}\,(${n}/e)^{${n}} \approx ${fmt(Math.round(approx))}$, while the exact value is $${n}! = ${fmt(exact)}$. The relative error is about $1/(12n) = ${(1 / (12 * n) * 100).toFixed(2)}\%$, and it shrinks as $n$ grows.`,
  };
}

export const generators = [countArrangements, legendreExponent, trailingZeros, factorialRatio, multisetPermutations, stirling];
