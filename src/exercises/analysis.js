// Exercises for §1.2.10 Analysis of an Algorithm (and the discrete probability
// it relies on).
import { makeMC } from './answers.js';
import { Fraction, harmonic, factorial, gcd } from '../lib/mathutil.js';

const r = String.raw;
const F = (n, d = 1) => new Fraction(BigInt(n), BigInt(d));

function randomDistribution(rng) {
  const k = rng.int(2, 4);
  const values = [];
  while (values.length < k) {
    const v = rng.int(-2, 8);
    if (!values.includes(v)) values.push(v);
  }
  values.sort((a, b) => a - b);
  const weights = values.map(() => rng.int(1, 4));
  const total = weights.reduce((a, b) => a + b, 0);
  const probs = weights.map((w) => F(w, total));
  return { values, probs, total, weights };
}

function distTable(values, weights, total) {
  return `| $x$ | ${values.map((v) => `$${v}$`).join(' | ')} |\n|---|${values.map(() => '---').join('|')}|\n| $\\Pr[X = x]$ | ${weights.map((w) => `$${F(w, total).toTeX()}$`).join(' | ')} |`;
}

export function expectedValue(rng) {
  if (rng.chance(0.3)) {
    const d = rng.pick([4, 6, 8, 10, 12, 20]);
    const e = F(d + 1, 2);
    return {
      kind: 'expected-value',
      type: 'fraction',
      prompt: r`A fair $${d}$-sided die shows each of $1, 2, \dots, ${d}$ with equal probability. What is the expected value of the roll? (Exact fraction.)`,
      answer: e.toString(),
      hint: 'E[X] = Σ x·Pr[X = x] = (1 + 2 + … + d)/d.',
      solution: r`$E[X] = \frac{1}{${d}}\sum_{k=1}^{${d}} k = \frac{1}{${d}}\cdot\frac{${d}\cdot ${d + 1}}{2} = ${e.toTeX()}$. Knuth’s definition (§1.2.10 eq. (8)): $E[X] = \sum_x x\Pr[X = x]$; for a uniform distribution it is the plain average.`,
    };
  }
  const { values, probs, total, weights } = randomDistribution(rng);
  let e = F(0);
  values.forEach((v, i) => { e = e.add(probs[i].mul(v)); });
  return {
    kind: 'expected-value',
    type: 'fraction',
    prompt: `A random variable $X$ has the distribution\n\n${distTable(values, weights, total)}\n\nCompute $E[X]$ as an exact fraction.`,
    answer: e.toString(),
    hint: 'Multiply each value by its probability and add.',
    solution: r`$E[X] = ${values.map((v, i) => `(${v})\\cdot ${probs[i].toTeX()}`).join(' + ')} = ${e.toTeX()}$.`,
  };
}

export function variance(rng) {
  const { values, probs, total, weights } = randomDistribution(rng);
  let e = F(0), e2 = F(0);
  values.forEach((v, i) => { e = e.add(probs[i].mul(v)); e2 = e2.add(probs[i].mul(v * v)); });
  const v = e2.sub(e.mul(e));
  return {
    kind: 'variance',
    type: 'fraction',
    prompt: `A random variable $X$ has the distribution\n\n${distTable(values, weights, total)}\n\nCompute the variance $\\operatorname{Var}[X]$ as an exact fraction.`,
    answer: v.toString(),
    hint: 'Var[X] = E[X²] − (E[X])².',
    solution: r`$E[X] = ${e.toTeX()}$ and $E[X^2] = ${values.map((x, i) => `${x * x}\\cdot ${probs[i].toTeX()}`).join(' + ')} = ${e2.toTeX()}$, so $\operatorname{Var}[X] = E[X^2] - E[X]^2 = ${e2.toTeX()} - ${e.mul(e).toTeX()} = ${v.toTeX()}$. Knuth (§1.2.10 eq. (9)–(10)) defines the variance as $E[(X - E X)^2]$ and immediately rewrites it this way; the standard deviation is its square root.`,
  };
}

/** Knuth's Algorithm M: find the maximum of n distinct elements. */
export function algorithmM(rng) {
  const n = rng.int(3, 8);
  const variant = rng.pick(['expected', 'expected', 'zero', 'max']);
  if (variant === 'expected') {
    const e = harmonic(n).sub(F(1));
    return {
      kind: 'algorithm-m',
      type: 'fraction',
      prompt: r`Knuth’s **Algorithm M** scans $X[1], \dots, X[${n}]$ from the right end, keeping the largest value seen so far and *changing* the current maximum each time it finds a larger element. If the $${n}$ values are distinct and in random order, what is the expected number of times the maximum changes (the quantity $A$ in §1.2.10)? Give an exact fraction.`,
      answer: e.toString(),
      hint: 'The k-th element examined is a new record with probability 1/k. Sum over k = 2..n.',
      solution: r`Element number $k$ (in scanning order) is larger than all of the $k-1$ before it with probability $1/k$, independently of the order of those earlier elements. By linearity of expectation, $E[A] = \sum_{k=2}^{${n}} \frac1k = H_{${n}} - 1 = ${harmonic(n).toTeX()} - 1 = ${e.toTeX()}$. Knuth reaches the same result via the generating function $G_n(z) = \frac{z+1}{2}\cdot\frac{z+2}{3}\cdots\frac{z+n-1}{n}$; the average is $H_n - 1$ and the variance is $H_n - H_n^{(2)}$.`,
    };
  }
  if (variant === 'zero') {
    return {
      kind: 'algorithm-m',
      type: 'fraction',
      prompt: r`In Algorithm M applied to $${n}$ distinct values in random order, what is the probability that the maximum is **never** changed after the initial value is set (i.e. $A = 0$)? Give an exact fraction.`,
      answer: F(1, n).toString(),
      hint: 'A = 0 exactly when the first element examined is the overall maximum.',
      solution: r`$A = 0$ if and only if the first element examined is the largest of all $${n}$, which happens with probability $1/${n}$ by symmetry. In Knuth’s generating function this is the constant term $p_{${n}0} = \frac{1}{${n}}$ (§1.2.10 eq. (5)).`,
    };
  }
  const p = F(1, factorial(n));
  return {
    kind: 'algorithm-m',
    type: 'fraction',
    prompt: r`In Algorithm M applied to $${n}$ distinct values in random order, what is the probability of the **worst case** $A = ${n - 1}$ (every element examined is a new maximum)? Give an exact fraction.`,
    answer: p.toString(),
    hint: 'Exactly one of the n! orderings makes every element a record.',
    solution: r`Every element must exceed all earlier ones, so the values must be examined in increasing order: exactly $1$ of the $${n}! = ${factorial(n)}$ equally likely orderings. The probability is $${p.toTeX()}$. Compare with the average $H_{${n}} - 1 \approx ${(harmonic(n).toNumber() - 1).toFixed(3)}$: the worst case is far from typical, which is Knuth’s point in §1.2.10.`,
  };
}

export function linearity(rng) {
  const n = rng.int(3, 10);
  const variant = rng.pick(['fixed', 'heads', 'records', 'cycles', 'descents', 'adjacent']);
  if (variant === 'fixed') {
    return {
      kind: 'linearity',
      type: 'fraction',
      prompt: r`A permutation of $\{1, \dots, ${n}\}$ is chosen uniformly at random. What is the expected number of **fixed points** (positions $i$ with $\pi(i) = i$)?`,
      answer: '1',
      hint: 'Indicator variables: X_i = [π(i) = i]. E[X_i] = 1/n. Add them up.',
      solution: r`Let $X_i = [\pi(i) = i]$. Then $E[X_i] = \Pr[\pi(i) = i] = 1/${n}$, and by linearity of expectation $E[\sum X_i] = ${n}\cdot\frac{1}{${n}} = 1$, regardless of $n$. Linearity holds even though the $X_i$ are *not* independent, which is what makes the indicator method so powerful.`,
    };
  }
  if (variant === 'heads') {
    const e = F(n, 2);
    return {
      kind: 'linearity',
      type: 'fraction',
      prompt: r`A fair coin is tossed $${n}$ times. What is the expected number of heads?`,
      answer: e.toString(),
      solution: r`Each toss contributes an indicator with expectation $\tfrac12$; summing gives $${n}/2 = ${e.toTeX()}$. (The variance is $${n}/4$, since independent variances add.)`,
    };
  }
  if (variant === 'records') {
    const e = harmonic(n);
    return {
      kind: 'linearity',
      type: 'fraction',
      prompt: r`A permutation of $\{1, \dots, ${n}\}$ is chosen at random. A position $k$ is a **left-to-right maximum** if $\pi(k)$ exceeds $\pi(1), \dots, \pi(k-1)$. What is the expected number of left-to-right maxima? (Exact fraction.)`,
      answer: e.toString(),
      hint: 'Position k is a left-to-right maximum with probability 1/k.',
      solution: r`Position $k$ is a record with probability $1/k$ (the largest of the first $k$ values is equally likely to be in any of the $k$ positions). Summing, $E = \sum_{k=1}^{${n}}\frac1k = H_{${n}} = ${e.toTeX()}$. This is the same quantity as $A + 1$ in Knuth’s Algorithm M analysis.`,
    };
  }
  if (variant === 'cycles') {
    const e = harmonic(n);
    return {
      kind: 'linearity',
      type: 'fraction',
      prompt: r`A permutation of $\{1, \dots, ${n}\}$ is chosen at random. What is the expected number of **cycles** in its cycle decomposition? (Exact fraction. Hint: it is a harmonic number.)`,
      answer: e.toString(),
      hint: 'The element 1 lies in a cycle of length k with probability 1/n for each k. Or: count cycles by their smallest element.',
      solution: r`The expected number of cycles of a random permutation is $H_n$ (Knuth §1.3.3). Proof sketch: write the permutation in Knuth’s canonical cycle form (each cycle starting with its largest element, cycles listed in increasing order of those first elements) and erase the parentheses. This is a bijection from permutations to permutations, and the cycles are exactly the left-to-right maxima of the resulting word, whose expected number is $H_n$. So $E = H_{${n}} = ${e.toTeX()}$.`,
    };
  }
  if (variant === 'descents') {
    const e = F(n - 1, 2);
    return {
      kind: 'linearity',
      type: 'fraction',
      prompt: r`A permutation $\pi$ of $\{1, \dots, ${n}\}$ is chosen at random. A **descent** is an index $i < ${n}$ with $\pi(i) > \pi(i+1)$. What is the expected number of descents?`,
      answer: e.toString(),
      hint: 'Each adjacent pair is a descent with probability 1/2.',
      solution: r`Each of the $${n - 1}$ adjacent pairs is a descent with probability $\tfrac12$ by symmetry, so the expectation is $${n - 1}/2 = ${e.toTeX()}$. Runs and descents are central to Knuth’s analysis of sorting in Chapter 5.`,
    };
  }
  const e = F(n - 1, n);
  return {
    kind: 'linearity',
    type: 'fraction',
    prompt: r`A permutation $\pi$ of $\{1, \dots, ${n}\}$ is chosen at random. What is the expected number of indices $i$ with $\pi(i) = i + 1$?`,
    answer: e.toString(),
    solution: r`For $i = 1, \dots, ${n - 1}$ the probability that $\pi(i) = i+1$ is $1/${n}$; for $i = ${n}$ it is impossible. Total: $${n - 1}/${n} = ${e.toTeX()}$.`,
  };
}

export function searchCost(rng) {
  const n = rng.int(4, 20);
  const variant = rng.pick(['success', 'mixed', 'binary']);
  if (variant === 'success') {
    const e = F(n + 1, 2);
    return {
      kind: 'search-cost',
      type: 'fraction',
      prompt: r`Sequential search through a table of $${n}$ keys compares the target with keys $1, 2, 3, \dots$ until it finds it. If the target is equally likely to be any of the $${n}$ keys, what is the expected number of comparisons?`,
      answer: e.toString(),
      hint: 'Average of 1, 2, …, n.',
      solution: r`With probability $1/${n}$ the target is key $k$, costing $k$ comparisons: $E = \frac{1}{${n}}\sum_{k=1}^{${n}} k = \frac{${n} + 1}{2} = ${e.toTeX()}$. This is Knuth’s Algorithm S in §6.1; the point is that “average case” means averaging a cost over a probability distribution of inputs.`,
    };
  }
  if (variant === 'mixed') {
    const pNum = rng.int(1, 3), pDen = rng.pick([2, 3, 4]);
    const p = F(pNum, pDen);
    if (p.toNumber() >= 1) return searchCost(rng);
    const e = p.mul(F(n + 1, 2)).add(F(1).sub(p).mul(F(n)));
    return {
      kind: 'search-cost',
      type: 'fraction',
      prompt: r`Sequential search through $${n}$ keys: with probability $${p.toTeX()}$ the target is present (and then equally likely to be any key); otherwise it is absent and all $${n}$ keys are examined. What is the expected number of comparisons?`,
      answer: e.toString(),
      hint: 'Condition on presence: p·(n+1)/2 + (1−p)·n.',
      solution: r`$E = ${p.toTeX()}\cdot\frac{${n} + 1}{2} + \left(1 - ${p.toTeX()}\right)\cdot ${n} = ${e.toTeX()}$. Conditioning on a case split and weighting by probability is the everyday tool of average-case analysis.`,
    };
  }
  const k = rng.int(3, 7);
  const N = 2 ** k - 1;
  // expected number of probes for successful binary search in a perfect tree of N = 2^k - 1 nodes
  let total = 0n;
  for (let d = 1; d <= k; d++) total += BigInt(d) * (2n ** BigInt(d - 1));
  const e = new Fraction(total, BigInt(N));
  return {
    kind: 'search-cost',
    type: 'fraction',
    prompt: r`Binary search on a sorted array of $${N} = 2^{${k}} - 1$ keys probes the middle, then the middle of a half, and so on: $1$ key is found after $1$ probe, $2$ keys after $2$ probes, $4$ after $3$, …, $2^{${k - 1}}$ after $${k}$ probes. If the target is equally likely to be any key, what is the expected number of probes? (Exact fraction.)`,
    answer: e.toString(),
    hint: 'E = (1/N) Σ_{d=1}^{k} d·2^{d−1}.',
    solution: r`$E = \frac{1}{${N}}\sum_{d=1}^{${k}} d\,2^{d-1} = \frac{${total}}{${N}} = ${e.toTeX()} \approx ${e.toNumber().toFixed(3)}$, a bit less than $${k} = \lg(N+1)$. The sum $\sum d\,2^{d-1} = (k-1)2^k + 1$ is a standard one (differentiate the geometric series, or see §1.2.3 exercise 16).`,
  };
}

export function pgf(rng) {
  const variant = rng.pick(['binomial', 'uniform', 'two-point']);
  if (variant === 'binomial') {
    const n = rng.int(2, 10);
    const askVar = rng.chance(0.5);
    const mean = F(n, 2), vr = F(n, 4);
    return {
      kind: 'pgf',
      type: 'fraction',
      prompt: r`A random variable has probability generating function $G(z) = \left(\dfrac{1+z}{2}\right)^{${n}}$. Compute its ${askVar ? 'variance' : 'mean'} using $G$ (mean $= G'(1)$, variance $= G''(1) + G'(1) - G'(1)^2$).`,
      answer: (askVar ? vr : mean).toString(),
      hint: 'G is the PGF of the number of heads in n fair coin tosses.',
      solution: r`$G'(z) = \frac{${n}}{2}\left(\frac{1+z}{2}\right)^{${n - 1}}$, so $G'(1) = ${mean.toTeX()}$. $G''(1) = \frac{${n}\cdot ${n - 1}}{4}$, so the variance is $\frac{${n * (n - 1)}}{4} + \frac{${n}}{2} - \frac{${n * n}}{4} = ${vr.toTeX()}$. This is the PGF of a binomial$(${n}, \tfrac12)$ variable: the number of heads in $${n}$ tosses. Knuth’s §1.2.10 eqs. (14)–(15) give exactly these formulas.`,
    };
  }
  if (variant === 'uniform') {
    const m = rng.int(3, 8);
    const askVar = rng.chance(0.5);
    const mean = F(m + 1, 2), vr = F(m * m - 1, 12);
    return {
      kind: 'pgf',
      type: 'fraction',
      prompt: r`A random variable has PGF $G(z) = \dfrac{z + z^2 + \dots + z^{${m}}}{${m}}$. Compute its ${askVar ? 'variance' : 'mean'}.`,
      answer: (askVar ? vr : mean).toString(),
      hint: 'This is a uniform distribution on {1, …, m}: read the probabilities off the coefficients.',
      solution: r`The coefficient of $z^k$ is $\Pr[X = k] = 1/${m}$ for $k = 1..${m}$: a fair $${m}$-sided die. Mean $= G'(1) = \frac{1}{${m}}\sum k = ${mean.toTeX()}$; variance $= \frac{${m}^2 - 1}{12} = ${vr.toTeX()}$ (compute $G''(1) = \frac{1}{${m}}\sum k(k-1)$ and apply the formula).`,
    };
  }
  const a = rng.int(0, 3), b = a + rng.int(1, 5);
  const p = F(rng.int(1, 3), 4);
  const q = F(1).sub(p);
  const mean = p.mul(a).add(q.mul(b));
  const e2 = p.mul(a * a).add(q.mul(b * b));
  const vr = e2.sub(mean.mul(mean));
  const askVar = rng.chance(0.5);
  return {
    kind: 'pgf',
    type: 'fraction',
    prompt: r`A random variable has PGF $G(z) = ${p.toTeX()}\,z^{${a}} + ${q.toTeX()}\,z^{${b}}$. Compute its ${askVar ? 'variance' : 'mean'}.`,
    answer: (askVar ? vr : mean).toString(),
    hint: 'The coefficients are the probabilities; the exponents are the values.',
    solution: r`$X = ${a}$ with probability $${p.toTeX()}$ and $X = ${b}$ with probability $${q.toTeX()}$. Mean $= ${p.toTeX()}\cdot ${a} + ${q.toTeX()}\cdot ${b} = ${mean.toTeX()}$; $E[X^2] = ${e2.toTeX()}$, so variance $= ${e2.toTeX()} - ${mean.mul(mean).toTeX()} = ${vr.toTeX()}$. Checking via $G$: $G'(1) = ${a}\cdot ${p.toTeX()} + ${b}\cdot ${q.toTeX()}$, the same thing.`,
  };
}

export function diceProbability(rng) {
  if (rng.chance(0.5)) {
    const s = rng.int(2, 12);
    let count = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) count++;
    const p = F(count, 36);
    return {
      kind: 'dice',
      type: 'fraction',
      prompt: r`Two fair dice are rolled. What is the probability that the sum is $${s}$?`,
      answer: p.toString(),
      hint: 'Count the ordered pairs (a, b) out of 36 with a + b = s.',
      solution: r`There are $36$ equally likely ordered outcomes and $${count}$ of them sum to $${s}$, so the probability is $${p.toTeX()}$. (Generating-function view: the coefficient of $z^{${s}}$ in $\left(\frac{z + \dots + z^6}{6}\right)^2$.)`,
    };
  }
  const k = rng.int(2, 6);
  const p = F(1).sub(F(5, 6).mul(F(5 ** (k - 1), 6 ** (k - 1))));
  return {
    kind: 'dice',
    type: 'fraction',
    prompt: r`A fair die is rolled $${k}$ times. What is the probability of getting **at least one** six?`,
    answer: p.toString(),
    hint: 'Complement: 1 − Pr[no six at all].',
    solution: r`$\Pr[\text{no six}] = (5/6)^{${k}} = ${F(5 ** k, 6 ** k).toTeX()}$, so $\Pr[\text{at least one}] = 1 - ${F(5 ** k, 6 ** k).toTeX()} = ${p.toTeX()}$. “At least one” problems are almost always easiest through the complement.`,
  };
}

export const generators = [expectedValue, variance, algorithmM, linearity, searchCost, pgf, diceProbability];

export const _internal = { gcd };
