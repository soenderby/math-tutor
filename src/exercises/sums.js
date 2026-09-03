// Exercises for §1.2.3 Sums and Products.
import { makeMC } from './answers.js';
import { Fraction, fmt, isPrime } from '../lib/mathutil.js';

const r = String.raw;

const sgn = (x) => (x < 0 ? `- ${-x}` : `+ ${x}`);

/** Arithmetic series with general bounds. */
export function arithmeticSum(rng) {
  const a = rng.int(0, 5), b = a + rng.int(5, 30);
  const c = rng.int(1, 5), d = rng.int(-6, 6);
  let s = 0;
  for (let k = a; k <= b; k++) s += c * k + d;
  const terms = b - a + 1;
  const ck = c === 1 ? 'k' : `${c}k`;
  const summand = d === 0 ? ck : `(${ck} ${sgn(d)})`;
  return {
    kind: 'arithmetic-sum',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{k=${a}}^{${b}} ${summand}$.`,
    answer: String(s),
    hint: 'Number of terms × average of first and last term. Or split into c·Σk + d·(number of terms).',
    solution: r`There are $${b} - ${a} + 1 = ${terms}$ terms. The first is $${c * a + d}$ and the last is $${c * b + d}$; an arithmetic series equals (number of terms) $\times$ (average of first and last) $= ${terms}\cdot\frac{${c * a + d} + ${c * b + d}}{2} = ${s}$. Alternatively, $\sum (ck + d) = c\sum k + d\cdot ${terms}$ with $\sum_{k=${a}}^{${b}} k = \frac{(${a}+${b})\cdot ${terms}}{2}$.`,
  };
}

/** Geometric series. */
export function geometricSum(rng) {
  const q = rng.pick([2, 2, 3, 4, 5, 10]);
  const m = rng.chance(0.3) ? rng.int(1, 3) : 0;
  const n = m + rng.int(3, q === 2 ? 10 : 6);
  let s = 0n;
  for (let k = m; k <= n; k++) s += BigInt(q) ** BigInt(k);
  return {
    kind: 'geometric-sum',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{k=${m}}^{${n}} ${q}^k$.`,
    answer: s.toString(),
    hint: 'Σ_{k=0}^{n} q^k = (q^{n+1} − 1)/(q − 1).',
    solution: r`Using $\sum_{k=0}^{n} q^k = \dfrac{q^{n+1}-1}{q-1}$: $\dfrac{${q}^{${n + 1}} - ${q}^{${m}}}{${q} - 1} = \dfrac{${fmt(BigInt(q) ** BigInt(n + 1))} - ${fmt(BigInt(q) ** BigInt(m))}}{${q - 1}} = ${fmt(s)}$. Knuth’s derivation: call the sum $S$; then $qS - S$ telescopes to $q^{${n + 1}} - q^{${m}}$.`,
  };
}

/** Index shifting. */
export function indexShift(rng) {
  const s = rng.int(1, 3);
  const variant = rng.pick(['shift', 'reverse']);
  if (variant === 'shift') {
    return makeMC(rng, {
      kind: 'index-shift',
      prompt: r`Fill in the blank so that the two sums are equal for all sequences $a_k$: $\displaystyle\sum_{k=${s}}^{n} a_k = \sum_{j=0}^{n-${s}} a_{\square}$`,
      correct: `$a_{j+${s}}$`,
      distractors: [`$a_{j-${s}}$`, `$a_j$`, `$a_{n-j}$`],
      hint: 'Substitute k = j + (something) and check the first term.',
      solution: r`Set $k = j + ${s}$. When $j = 0$ we get $k = ${s}$ (the old lower limit) and when $j = n - ${s}$ we get $k = n$. So $\sum_{k=${s}}^{n} a_k = \sum_{j=0}^{n-${s}} a_{j+${s}}$. Always check the first and last terms after a substitution.`,
    });
  }
  return makeMC(rng, {
    kind: 'index-shift',
    prompt: r`Fill in the blank so that the two sums are equal for all sequences $a_k$: $\displaystyle\sum_{k=0}^{n} a_k = \sum_{j=0}^{n} a_{\square}$ (with the terms taken in the opposite order).`,
    correct: `$a_{n-j}$`,
    distractors: [`$a_{j-n}$`, `$a_{n+j}$`, `$a_{n-j+1}$`],
    hint: 'When j = 0 you want the last term, a_n.',
    solution: r`Substitute $k = n - j$: as $j$ runs $0,1,\dots,n$, $k$ runs $n, n-1, \dots, 0$, so $\sum_{k=0}^{n} a_k = \sum_{j=0}^{n} a_{n-j}$. Reversing a sum this way is the trick behind Gauss’s $1 + 2 + \dots + n = n(n+1)/2$: add the sum to its reversal termwise.`,
  });
}

/** Telescoping sums of the form 1/(k(k+c)). */
export function telescoping(rng) {
  const n = rng.int(3, 12);
  const variant = rng.pick(['1', '1', '2', 'sq']);
  let s = new Fraction(0n);
  if (variant === '1') {
    for (let k = 1; k <= n; k++) s = s.add(new Fraction(1n, BigInt(k * (k + 1))));
    return {
      kind: 'telescoping',
      type: 'fraction',
      prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} \frac{1}{k(k+1)}$ exactly.`,
      answer: s.toString(),
      hint: '1/(k(k+1)) = 1/k − 1/(k+1).',
      solution: r`Since $\frac{1}{k(k+1)} = \frac1k - \frac1{k+1}$, the sum telescopes: $\left(1 - \frac12\right) + \left(\frac12 - \frac13\right) + \dots + \left(\frac1{${n}} - \frac1{${n + 1}}\right) = 1 - \frac{1}{${n + 1}} = ${s.toTeX()}$. In general the sum to $n$ is $\frac{n}{n+1}$.`,
    };
  }
  if (variant === '2') {
    for (let k = 1; k <= n; k++) s = s.add(new Fraction(1n, BigInt(k * (k + 2))));
    return {
      kind: 'telescoping',
      type: 'fraction',
      prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} \frac{1}{k(k+2)}$ exactly.`,
      answer: s.toString(),
      hint: '1/(k(k+2)) = (1/2)(1/k − 1/(k+2)); terms two apart cancel.',
      solution: r`$\frac{1}{k(k+2)} = \frac12\left(\frac1k - \frac1{k+2}\right)$. Summing, everything cancels except the first two positive and last two negative pieces: $\frac12\left(1 + \frac12 - \frac1{${n + 1}} - \frac1{${n + 2}}\right) = ${s.toTeX()}$.`,
    };
  }
  // sum of (k+1)^2 - k^2 = 2k+1
  let t = 0;
  for (let k = 1; k <= n; k++) t += 2 * k + 1;
  return {
    kind: 'telescoping',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} \bigl((k+1)^2 - k^2\bigr)$.`,
    answer: String(t),
    hint: 'Write out the first few terms; each (k+1)² cancels the next −k².',
    solution: r`The sum telescopes to $(${n}+1)^2 - 1^2 = ${(n + 1) ** 2} - 1 = ${t}$. Since $(k+1)^2 - k^2 = 2k+1$, this also proves $\sum_{k=1}^{n}(2k+1) = (n+1)^2 - 1$, i.e. $2\sum k + n = n^2 + 2n$, which gives $\sum k = n(n+1)/2$ for free. Knuth uses this *perturbation* trick repeatedly.`,
  };
}

/** Sums of powers. */
export function powerSum(rng) {
  const p = rng.pick([2, 2, 3]);
  const n = rng.int(4, 15);
  let s = 0;
  for (let k = 1; k <= n; k++) s += k ** p;
  const formula = p === 2 ? r`\frac{n(n+1)(2n+1)}{6}` : r`\left(\frac{n(n+1)}{2}\right)^2`;
  const evalTex = p === 2 ? r`\frac{${n}\cdot ${n + 1}\cdot ${2 * n + 1}}{6}` : r`\left(\frac{${n}\cdot ${n + 1}}{2}\right)^2`;
  return {
    kind: 'power-sum',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} k^${p}$.`,
    answer: String(s),
    hint: p === 2 ? 'Σk² = n(n+1)(2n+1)/6' : 'Σk³ = (n(n+1)/2)² — the square of the triangular number.',
    solution: r`$\sum_{k=1}^{n} k^${p} = ${formula}$, so with $n=${n}$: $${evalTex} = ${s}$. (These closed forms are proved by induction, or derived by summing $(k+1)^{${p + 1}} - k^{${p + 1}}$ over $k$.)`,
  };
}

/** Double sums evaluated by brute force. */
export function doubleSum(rng) {
  const m = rng.int(2, 6), n = rng.int(2, 6);
  const variant = rng.pick(['prod', 'plus', 'tri', 'tri-strict', 'tri-i']);
  let s = 0;
  if (variant === 'prod') {
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) s += i * j;
    return {
      kind: 'double-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{i=1}^{${m}}\sum_{j=1}^{${n}} ij$.`,
      answer: String(s),
      hint: 'The summand factors, so the double sum is a product of two single sums.',
      solution: r`Because $ij$ factors, $\sum_i\sum_j ij = \left(\sum_{i=1}^{${m}} i\right)\left(\sum_{j=1}^{${n}} j\right) = ${(m * (m + 1)) / 2}\cdot ${(n * (n + 1)) / 2} = ${s}$.`,
    };
  }
  if (variant === 'plus') {
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) s += i + j;
    return {
      kind: 'double-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{i=1}^{${m}}\sum_{j=1}^{${n}} (i+j)$.`,
      answer: String(s),
      hint: 'Split into Σ_i Σ_j i + Σ_i Σ_j j; the inner sum of a constant is just a multiple.',
      solution: r`$\sum_{i}\sum_{j} (i+j) = \sum_i \left(${n}\,i + \frac{${n}\cdot ${n + 1}}{2}\right) = ${n}\cdot\frac{${m}\cdot ${m + 1}}{2} + ${m}\cdot\frac{${n}\cdot ${n + 1}}{2} = ${s}$.`,
    };
  }
  const N = rng.int(4, 12);
  if (variant === 'tri') {
    s = (N * (N + 1)) / 2;
    return {
      kind: 'double-sum',
      type: 'integer',
      prompt: r`How many pairs of integers $(i, j)$ satisfy $1 \le i \le j \le ${N}$? In Knuth’s notation this is $\displaystyle\sum_{1 \le i \le j \le ${N}} 1$.`,
      answer: String(s),
      hint: 'For each j, how many i are allowed?',
      solution: r`For each $j$ there are $j$ choices of $i$, so the count is $\sum_{j=1}^{${N}} j = \frac{${N}\cdot ${N + 1}}{2} = ${s}$. Knuth writes conditions under a single $\sum$ exactly so that you can choose which variable to sum first.`,
    };
  }
  if (variant === 'tri-strict') {
    s = (N * (N - 1)) / 2;
    return {
      kind: 'double-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{1 \le i < j \le ${N}} 1$, the number of pairs with $1 \le i < j \le ${N}$.`,
      answer: String(s),
      solution: r`For each $j$ there are $j-1$ choices of $i$, so the count is $\sum_{j=1}^{${N}} (j-1) = \frac{${N}\cdot ${N - 1}}{2} = ${s} = \binom{${N}}{2}$.`,
    };
  }
  for (let j = 1; j <= N; j++) for (let i = 1; i <= j; i++) s += i;
  return {
    kind: 'double-sum',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{1 \le i \le j \le ${N}} i$.`,
    answer: String(s),
    hint: 'Sum over i first: for fixed i, j ranges from i to N.',
    solution: r`Summing over $j$ first: $\sum_{i=1}^{${N}} i\,(${N} - i + 1)$. Summing over $i$ first instead: $\sum_{j=1}^{${N}} \frac{j(j+1)}{2}$. Either way the value is $${s}$; it equals $\binom{${N + 2}}{3}$, a fact that becomes obvious once you know the hockey-stick identity.`,
  };
}

/** Iverson bracket sums. */
export function iversonSum(rng) {
  const n = rng.int(8, 30);
  const variant = rng.pick(['mult', 'even', 'prime']);
  let s = 0;
  if (variant === 'mult') {
    const d = rng.pick([3, 4, 5]);
    for (let k = 1; k <= n; k++) if (k % d === 0) s += k;
    return {
      kind: 'iverson-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} k\,[k \bmod ${d} = 0]$, where $[P]$ is the Iverson bracket (1 if $P$ is true, 0 otherwise).`,
      answer: String(s),
      hint: 'The bracket kills every term except the multiples of d.',
      solution: r`Only multiples of $${d}$ survive: $${d} + ${2 * d} + \dots + ${d * Math.floor(n / d)} = ${d}\cdot\frac{${Math.floor(n / d)}\cdot ${Math.floor(n / d) + 1}}{2} = ${s}$. Knuth uses $[P]$ to fold conditions into summands; it is the same as $\sum_{1 \le k \le ${n},\, ${d} \mid k} k$.`,
    };
  }
  if (variant === 'even') {
    for (let k = 1; k <= n; k++) if (k % 2 === 0) s += 1;
    return {
      kind: 'iverson-sum',
      type: 'integer',
      prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} [k \text{ is even}]$.`,
      answer: String(s),
      solution: r`Summing $[P(k)]$ over $k$ simply *counts* the $k$ for which $P$ holds. There are $\lfloor ${n}/2 \rfloor = ${s}$ even numbers between $1$ and $${n}$.`,
    };
  }
  for (let k = 1; k <= n; k++) if (isPrime(k)) s += 1;
  return {
    kind: 'iverson-sum',
    type: 'integer',
    prompt: r`Evaluate $\displaystyle\sum_{k=1}^{${n}} [k \text{ is prime}]$.`,
    answer: String(s),
    solution: r`This is $\pi(${n})$, the number of primes up to $${n}$: ${Array.from({ length: n }, (_, i) => i + 1).filter(isPrime).join(', ')}. So the sum is $${s}$.`,
  };
}

export const generators = [arithmeticSum, geometricSum, indexShift, telescoping, powerSum, doubleSum, iversonSum];
