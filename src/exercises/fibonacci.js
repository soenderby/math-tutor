// Exercises for §1.2.8 Fibonacci Numbers.
import { makeMC } from './answers.js';
import { fib, gcd, fmt, PHI } from '../lib/mathutil.js';

const r = String.raw;

export function fibCompute(rng) {
  const n = rng.int(5, 30);
  return {
    kind: 'fib-compute',
    type: 'integer',
    prompt: r`Compute $F_{${n}}$, where $F_0 = 0$, $F_1 = 1$, $F_{n} = F_{n-1} + F_{n-2}$.`,
    answer: fib(n).toString(),
    hint: n > 15 ? 'Binet: F_n = round(φ^n / √5) with φ ≈ 1.618034. Or just iterate.' : 'Iterate: 0, 1, 1, 2, 3, 5, …',
    solution: r`Iterating: ${Array.from({ length: Math.min(n, 12) + 1 }, (_, i) => fib(i)).join(', ')}${n > 12 ? ', …' : ''}, so $F_{${n}} = ${fmt(fib(n))}$. Check with Binet’s formula: $\phi^{${n}}/\sqrt5 \approx ${(PHI ** n / Math.sqrt(5)).toFixed(2)}$, which rounds to $${fmt(fib(n))}$. Knuth indexes so that $F_0 = 0$; watch out, some authors start at $F_1 = F_2 = 1$ (which agrees) or $F_0 = 1$ (which does not).`,
  };
}

export function cassini(rng) {
  const n = rng.int(3, 15);
  const v = fib(n - 1) * fib(n + 1) - fib(n) * fib(n);
  return {
    kind: 'cassini',
    type: 'integer',
    prompt: r`Evaluate $F_{${n - 1}}F_{${n + 1}} - F_{${n}}^2$.`,
    answer: v.toString(),
    hint: 'Try n = 2, 3, 4 and spot the pattern (Cassini’s identity).',
    solution: r`$F_{${n - 1}}F_{${n + 1}} - F_{${n}}^2 = ${fib(n - 1)}\cdot ${fib(n + 1)} - ${fib(n)}^2 = ${v}$. Cassini’s identity (§1.2.8 eq. (6)) says $F_{n+1}F_{n-1} - F_n^2 = (-1)^n$ for all $n \ge 1$; it is the basis of a famous geometric “paradox” where a $8\times 8$ square is cut and reassembled into a $5 \times 13$ rectangle.`,
  };
}

export function fibGcd(rng) {
  const m = rng.int(6, 30), n = rng.int(6, 30);
  const g = Number(gcd(m, n));
  const ans = gcd(fib(m), fib(n));
  return {
    kind: 'fib-gcd',
    type: 'integer',
    prompt: r`Compute $\gcd(F_{${m}}, F_{${n}})$ without computing the Fibonacci numbers first. (You may use $F_{${m}} = ${fmt(fib(m))}$ and $F_{${n}} = ${fmt(fib(n))}$ to check.)`,
    answer: ans.toString(),
    hint: 'gcd(F_m, F_n) = F_{gcd(m,n)}.',
    solution: r`Knuth §1.2.8 eq. (8)/(exercise 13): $\gcd(F_m, F_n) = F_{\gcd(m,n)}$. Since $\gcd(${m}, ${n}) = ${g}$, the answer is $F_{${g}} = ${ans}$. The proof runs Euclid’s algorithm on the indices, using $F_{m+n} = F_m F_{n+1} + F_{m-1}F_n$.`,
  };
}

export function fibSums(rng) {
  const n = rng.int(3, 12);
  const variant = rng.pick(['sum', 'squares', 'odd', 'even']);
  let s = 0n;
  if (variant === 'sum') {
    for (let k = 1; k <= n; k++) s += fib(k);
    return {
      kind: 'fib-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} F_k$.`,
      answer: s.toString(),
      hint: 'Write F_k = F_{k+2} − F_{k+1} and telescope.',
      solution: r`$\sum_{k=1}^{n} F_k = F_{n+2} - 1$ (telescoping $F_k = F_{k+2} - F_{k+1}$). Here $F_{${n + 2}} - 1 = ${fib(n + 2)} - 1 = ${s}$.`,
    };
  }
  if (variant === 'squares') {
    for (let k = 1; k <= n; k++) s += fib(k) * fib(k);
    return {
      kind: 'fib-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} F_k^2$.`,
      answer: s.toString(),
      hint: 'Picture squares of sides F_1, F_2, … tiling an F_n × F_{n+1} rectangle.',
      solution: r`$\sum_{k=1}^{n} F_k^2 = F_n F_{n+1}$; here $F_{${n}}F_{${n + 1}} = ${fib(n)}\cdot ${fib(n + 1)} = ${s}$. Proof by induction using $F_{n+1}^2 = F_{n+1}(F_{n+2} - F_n)$, or by the classic picture of Fibonacci squares filling a rectangle.`,
    };
  }
  if (variant === 'odd') {
    for (let k = 1; k <= n; k++) s += fib(2 * k - 1);
    return {
      kind: 'fib-sum',
      type: 'integer',
      prompt: r`Evaluate $F_1 + F_3 + F_5 + \dots + F_{${2 * n - 1}}$.`,
      answer: s.toString(),
      solution: r`$\sum_{k=1}^{n} F_{2k-1} = F_{2n}$: each odd-indexed term $F_{2k-1} = F_{2k} - F_{2k-2}$ telescopes. Here $F_{${2 * n}} = ${s}$.`,
    };
  }
  for (let k = 1; k <= n; k++) s += fib(2 * k);
  return {
    kind: 'fib-sum',
    type: 'integer',
    prompt: r`Evaluate $F_2 + F_4 + F_6 + \dots + F_{${2 * n}}$.`,
    answer: s.toString(),
    solution: r`$\sum_{k=1}^{n} F_{2k} = F_{2n+1} - 1$ since $F_{2k} = F_{2k+1} - F_{2k-1}$ telescopes. Here $F_{${2 * n + 1}} - 1 = ${fib(2 * n + 1)} - 1 = ${s}$.`,
  };
}

export function zeckendorf(rng) {
  const N = rng.int(20, 600);
  const parts = [];
  let rem = N;
  while (rem > 0) {
    let k = 2;
    while (Number(fib(k + 1)) <= rem) k++;
    parts.push(k);
    rem -= Number(fib(k));
  }
  return {
    kind: 'zeckendorf',
    type: 'integer',
    prompt: r`Every positive integer can be written uniquely as a sum of **non-consecutive** Fibonacci numbers $F_k$ with $k \ge 2$ (Zeckendorf’s theorem, §1.2.8 exercise 34). How many terms does this representation of $${N}$ have?`,
    answer: String(parts.length),
    hint: 'Greedy: subtract the largest Fibonacci number that fits, and repeat.',
    solution: r`Greedily: $${N} = ${parts.map((k) => `F_{${k}}`).join(' + ')} = ${parts.map((k) => fib(k)).join(' + ')}$, so $${parts.length}$ terms. Greedy choice always works and never picks two consecutive indices (if it did, the two could be merged into a larger Fibonacci number that would have been chosen first). Knuth uses this “Fibonacci number system” in §1.2.8 and later for Fibonacci search.`,
  };
}

export function goldenRatio(rng) {
  if (rng.chance(0.5)) {
    const n = rng.int(6, 20);
    const ratio = Number(fib(n + 1)) / Number(fib(n));
    return {
      kind: 'golden-ratio',
      type: 'decimal',
      prompt: r`Compute $F_{${n + 1}}/F_{${n}}$ to three decimal places.`,
      answer: Math.round(ratio * 1000) / 1000,
      tolerance: 0.0015,
      hint: 'It is close to φ = 1.618034; compute the exact ratio to see how close.',
      solution: r`$F_{${n + 1}}/F_{${n}} = ${fib(n + 1)}/${fib(n)} \approx ${ratio.toFixed(6)}$, compared with $\phi = (1+\sqrt5)/2 \approx 1.618034$. The error shrinks like $\phi^{-2n}$ (§1.2.8 eq. (14)): consecutive ratios alternate above and below $\phi$.`,
    };
  }
  const n = rng.int(10, 40);
  const approx = PHI ** n / Math.sqrt(5);
  return {
    kind: 'golden-ratio',
    type: 'integer',
    prompt: r`Binet’s formula gives $F_n = \dfrac{\phi^n - \hat\phi^n}{\sqrt5}$ where $\hat\phi = 1 - \phi \approx -0.618$. Given $\phi^{${n}}/\sqrt5 \approx ${approx.toFixed(3)}$, what is $F_{${n}}$?`,
    answer: fib(n).toString(),
    hint: 'Since |φ̂ⁿ/√5| < 1/2, F_n is the nearest integer to φⁿ/√5.',
    solution: r`Because $|\hat\phi| < 1$, the term $\hat\phi^{${n}}/\sqrt5$ is tiny (less than $\tfrac12$ in absolute value for all $n \ge 0$), so $F_n$ is simply $\phi^n/\sqrt5$ rounded to the nearest integer: $F_{${n}} = ${fmt(fib(n))}$. This is §1.2.8 eq. (15).`,
  };
}

const identities = [
  { lhs: r`F_{m+n}`, ok: r`F_m F_{n+1} + F_{m-1} F_n`, bad: [r`F_m F_n + F_{m-1}F_{n-1}`, r`F_m F_{n+1} + F_{m+1}F_n`, r`F_m F_n`], name: '§1.2.8 eq. (7)' },
  { lhs: r`F_{n+1}F_{n-1} - F_n^2`, ok: r`(-1)^n`, bad: [r`1`, r`(-1)^{n+1}`, r`F_{n-2}`], name: 'Cassini’s identity, eq. (6)' },
  { lhs: r`F_{2n}`, ok: r`F_n(F_{n+1} + F_{n-1})`, bad: [r`2F_n F_{n+1}`, r`F_n^2 + F_{n+1}^2`, r`F_n^2`], name: 'the m = n case of eq. (7)' },
  { lhs: r`F_{2n+1}`, ok: r`F_n^2 + F_{n+1}^2`, bad: [r`F_n F_{n+1}`, r`2F_n F_{n+1} + F_n^2`, r`F_{n+1}^2 - F_n^2`], name: 'the m = n+1 case of eq. (7)' },
  { lhs: r`\sum_{k=1}^{n} F_k`, ok: r`F_{n+2} - 1`, bad: [r`F_{n+1} - 1`, r`F_{n+2}`, r`F_n F_{n+1}`], name: 'a telescoping sum' },
  { lhs: r`\phi^{n}` + r`\ \text{(with } \phi = \tfrac{1+\sqrt5}{2})`, ok: r`\phi F_n + F_{n-1}`, bad: [r`F_n + F_{n-1}`, r`\phi F_{n-1} + F_n`, r`F_{n+1}`], name: '§1.2.8 eq. (13), proved by induction from φ² = φ + 1' },
  { lhs: r`F_n` + r`\ \text{(Binet)}`, ok: r`\dfrac{\phi^n - \hat\phi^n}{\sqrt5}`, bad: [r`\dfrac{\phi^n + \hat\phi^n}{\sqrt5}`, r`\dfrac{\phi^n}{\sqrt5}`, r`\dfrac{\phi^n - \hat\phi^n}{2}`], name: 'Binet’s formula, eq. (14)' },
];

export function fibIdentity(rng) {
  const it = rng.pick(identities);
  return makeMC(rng, {
    kind: 'fib-identity',
    prompt: r`Which expression equals $\displaystyle ${it.lhs}$ for all $n$ (and $m$) in range?`,
    correct: `$${it.ok}$`,
    distractors: it.bad.map((b) => `$${b}$`),
    hint: 'Test with small values, e.g. n = 3, m = 2.',
    solution: r`$${it.lhs} = ${it.ok}$ (${it.name}). Every Fibonacci identity can be checked on small cases and then proved by induction; try $n = 2, 3$ before trusting one you half-remember.`,
  });
}

export const generators = [fibCompute, cassini, fibGcd, fibSums, zeckendorf, goldenRatio, fibIdentity];
