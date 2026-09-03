// Exercises on solving recurrences (spans §1.2.9–§1.2.11 and Concrete Math ch. 1).
import { makeMC } from './answers.js';
import { fmt } from '../lib/mathutil.js';

const r = String.raw;

/** First-order linear recurrences, computed and explained. */
export function firstOrder(rng) {
  const c = rng.pick([2, 2, 3, -2]), d = rng.pick([1, -1, 3, 5]);
  const a0 = rng.int(0, 3), n = rng.int(4, 8);
  const seq = [BigInt(a0)];
  for (let i = 1; i <= n; i++) seq.push(BigInt(c) * seq[i - 1] + BigInt(d));
  const closed = r`a_n = ${c}^n a_0 + ${d}\cdot\dfrac{${c}^n - 1}{${c - 1}}`;
  return {
    kind: 'first-order',
    type: 'integer',
    prompt: r`Let $a_0 = ${a0}$ and $a_n = ${c}a_{n-1} ${d < 0 ? '-' : '+'} ${Math.abs(d)}$ for $n \ge 1$. Compute $a_{${n}}$.`,
    answer: seq[n].toString(),
    hint: 'Iterate, or unroll: a_n = c^n a_0 + d(1 + c + … + c^{n−1}).',
    solution: r`Iterating: ${seq.map((v, i) => `$a_{${i}} = ${v}$`).join(', ')}. Unrolling gives the closed form $${closed}$, i.e. $a_{${n}} = ${fmt(BigInt(c) ** BigInt(n) * BigInt(a0))} + ${d}\cdot ${(BigInt(c) ** BigInt(n) - 1n) / BigInt(c - 1)} = ${seq[n]}$. Knuth’s way to see this: the substitution $b_n = a_n + \frac{d}{c-1}$ turns it into $b_n = c\,b_{n-1}$.`,
  };
}

const closedForms = [
  { rec: r`a_n = 2a_{n-1} + 1,\ a_0 = 0`, ok: r`2^n - 1`, f: (n) => 2 ** n - 1, tag: 'Tower of Hanoi' },
  { rec: r`a_n = a_{n-1} + n,\ a_0 = 0`, ok: r`\dfrac{n(n+1)}{2}`, f: (n) => (n * (n + 1)) / 2, tag: 'triangular numbers' },
  { rec: r`a_n = 3a_{n-1},\ a_0 = 2`, ok: r`2\cdot 3^n`, f: (n) => 2 * 3 ** n, tag: 'geometric' },
  { rec: r`a_n = a_{n-1} + 2n - 1,\ a_0 = 0`, ok: r`n^2`, f: (n) => n * n, tag: 'sum of odd numbers' },
  { rec: r`a_n = 2a_{n-1} + 2^n,\ a_0 = 0`, ok: r`n\,2^n`, f: (n) => n * 2 ** n, tag: 'divide by 2^n first' },
  { rec: r`a_n = a_{n-1} + 2^n,\ a_0 = 1`, ok: r`2^{n+1} - 1`, f: (n) => 2 ** (n + 1) - 1, tag: 'geometric sum' },
  { rec: r`a_n = 2a_{n-1} - 1,\ a_0 = 2`, ok: r`2^n + 1`, f: (n) => 2 ** n + 1, tag: 'shift by the fixed point 1' },
  { rec: r`a_n = a_{n-1} + n^2,\ a_0 = 0`, ok: r`\dfrac{n(n+1)(2n+1)}{6}`, f: (n) => (n * (n + 1) * (2 * n + 1)) / 6, tag: 'sum of squares' },
  { rec: r`a_n = 2a_{n-1} + n,\ a_0 = 0`, ok: r`2^{n+1} - n - 2`, f: (n) => 2 ** (n + 1) - n - 2, tag: 'guess a particular solution of the form αn + β' },
  { rec: r`a_n = a_{n-1} + a_{n-2},\ a_0 = 0,\ a_1 = 1`, ok: r`\dfrac{\phi^n - \hat\phi^n}{\sqrt5}`, f: null, tag: 'Fibonacci' },
  { rec: r`a_n = 5a_{n-1} - 6a_{n-2},\ a_0 = 0,\ a_1 = 1`, ok: r`3^n - 2^n`, f: (n) => 3 ** n - 2 ** n, tag: 'characteristic roots 2 and 3' },
  { rec: r`a_n = 4a_{n-1} - 4a_{n-2},\ a_0 = 1,\ a_1 = 4`, ok: r`(n+1)\,2^n`, f: (n) => (n + 1) * 2 ** n, tag: 'repeated root 2' },
];

export function closedForm(rng) {
  const it = rng.pick(closedForms);
  const others = rng.sample(closedForms.filter((o) => o !== it), 3);
  const check = it.f ? ` Check: $a_0, a_1, a_2, a_3 = ${[0, 1, 2, 3].map(it.f).join(', ')}$.` : '';
  return makeMC(rng, {
    kind: 'closed-form',
    prompt: r`Which closed form solves the recurrence $${it.rec}$?`,
    correct: `$${it.ok}$`,
    distractors: others.map((o) => `$${o.ok}$`),
    hint: 'Compute a_0, a_1, a_2, a_3 from the recurrence and test each candidate.',
    solution: r`$a_n = ${it.ok}$ (${it.tag}).${check} The reliable method: compute a few terms, guess, and prove by induction; the mechanical method: generating functions (§1.2.9) or, for linear recurrences with constant coefficients, the characteristic equation.`,
  });
}

export function characteristic(rng) {
  const roots = rng.pick([[2, 3], [1, 2], [-1, 2], [2, 5], [-2, 3], [1, 3], [3, 4], [-1, 3]]);
  const [r1, r2] = roots;
  const p = r1 + r2, q = -r1 * r2;
  const rec = `a_n = ${p === 1 ? '' : p === -1 ? '-' : p}a_{n-1} ${q < 0 ? '-' : '+'} ${Math.abs(q) === 1 ? '' : Math.abs(q)}a_{n-2}`;
  if (rng.chance(0.5)) {
    return makeMC(rng, {
      kind: 'characteristic',
      prompt: r`The recurrence $${rec}$ has characteristic equation $x^2 ${p < 0 ? '+' : '-'} ${Math.abs(p)}x ${q < 0 ? '+' : '-'} ${Math.abs(q)} = 0$. What is the general solution?`,
      correct: r`$a_n = A\cdot ${r1 < 0 ? `(${r1})` : r1}^n + B\cdot ${r2 < 0 ? `(${r2})` : r2}^n$`,
      distractors: [
        r`$a_n = A\cdot ${p}^n + B\cdot ${q}^n$`,
        r`$a_n = A\cdot ${r1 < 0 ? `(${r1})` : r1}^n + B\,n\cdot ${r1 < 0 ? `(${r1})` : r1}^n$`,
        r`$a_n = A\cdot ${-r1 < 0 ? `(${-r1})` : -r1}^n + B\cdot ${-r2 < 0 ? `(${-r2})` : -r2}^n$`,
      ],
      hint: 'Factor the characteristic polynomial; each root ρ contributes a solution ρⁿ.',
      solution: r`$x^2 ${p < 0 ? '+' : '-'} ${Math.abs(p)}x ${q < 0 ? '+' : '-'} ${Math.abs(q)} = (x - (${r1}))(x - (${r2}))$, so the roots are $${r1}$ and $${r2}$ and every solution is $A\cdot(${r1})^n + B\cdot(${r2})^n$; $A, B$ come from $a_0, a_1$. (With a repeated root $\rho$ the solutions are $A\rho^n + Bn\rho^n$.) Knuth reaches the same formula via the generating function $\frac{\dots}{(1 - ${r1}z)(1 - ${r2}z)}$ and partial fractions.`,
    });
  }
  const a0 = rng.int(0, 3), a1 = rng.int(1, 5), n = rng.int(4, 8);
  const seq = [a0, a1];
  for (let i = 2; i <= n; i++) seq.push(p * seq[i - 1] + q * seq[i - 2]);
  // solve A + B = a0, A r1 + B r2 = a1
  const B = (a1 - a0 * r1) / (r2 - r1), A = a0 - B;
  return {
    kind: 'characteristic',
    type: 'integer',
    prompt: r`Let $a_0 = ${a0}$, $a_1 = ${a1}$ and $${rec}$ for $n \ge 2$. Compute $a_{${n}}$.`,
    answer: String(seq[n]),
    hint: 'Iterate the recurrence, or solve via the characteristic roots and check.',
    solution: r`Iterating: ${seq.map((v, i) => `$a_{${i}} = ${v}$`).join(', ')}. The closed form is $a_n = A\cdot(${r1})^n + B\cdot(${r2})^n$ with $A = ${fmtQ(A)}$, $B = ${fmtQ(B)}$ (from $a_0$ and $a_1$), which gives $a_{${n}} = ${seq[n]}$.`,
  };
}

function fmtQ(x) {
  if (Number.isInteger(x)) return String(x);
  // express as fraction with small denominator
  for (let d = 2; d <= 12; d++) if (Number.isInteger(x * d)) return `${x * d < 0 ? '-' : ''}\\tfrac{${Math.abs(x * d)}}{${d}}`;
  return x.toFixed(3);
}

const dcCases = [
  { a: 2, f: (n) => n, fTex: 'n', t1: 0, theta: r`n\log n`, closedTex: (k) => r`k\cdot 2^k = n\lg n` },
  { a: 1, f: () => 1, fTex: '1', t1: 0, theta: r`\log n`, closedTex: () => r`k = \lg n` },
  { a: 2, f: () => 1, fTex: '1', t1: 1, theta: r`n`, closedTex: () => r`2^{k+1} - 1 = 2n - 1` },
  { a: 1, f: (n) => n, fTex: 'n', t1: 0, theta: r`n`, closedTex: () => r`2n - 2` },
  { a: 4, f: (n) => n, fTex: 'n', t1: 0, theta: r`n^2`, closedTex: () => r`2n^2 - 2n` },
  { a: 2, f: (n) => n * n, fTex: 'n^2', t1: 0, theta: r`n^2`, closedTex: () => r`2n^2 - 2n` },
  { a: 3, f: (n) => n, fTex: 'n', t1: 0, theta: r`n^{\lg 3}`, closedTex: () => r`3\cdot 3^k - 2\cdot 2^k` },
];

export function divideAndConquer(rng) {
  const it = rng.pick(dcCases);
  if (rng.chance(0.5)) {
    const k = rng.int(3, 6);
    const n = 2 ** k;
    const T = (m) => (m === 1 ? it.t1 : it.a * T(m / 2) + it.f(m));
    const unroll = [];
    for (let m = n; m >= 1; m /= 2) unroll.push(`T(${m}) = ${T(m)}`);
    return {
      kind: 'divide-conquer',
      type: 'integer',
      prompt: r`Let $T(1) = ${it.t1}$ and $T(n) = ${it.a === 1 ? '' : it.a}T(n/2) + ${it.fTex}$ for $n = 2^k > 1$. Compute $T(${n})$.`,
      answer: String(T(n)),
      hint: 'Work upward from T(1): T(2), T(4), T(8), …',
      solution: r`Working up from the base: ${unroll.reverse().map((s) => `$${s}$`).join(', ')}. In general for $n = 2^k$, $T(n) = ${it.closedTex(k)}$, which is $\Theta(${it.theta})$. Recurrences like this arise from divide-and-conquer algorithms (merge sort, binary search, Karatsuba); Knuth analyses several in Chapters 4 and 5.`,
    };
  }
  const others = rng.sample([...new Set(dcCases.map((c) => c.theta))].filter((t) => t !== it.theta), 3);
  return makeMC(rng, {
    kind: 'divide-conquer',
    prompt: r`$T(n) = ${it.a === 1 ? '' : it.a}T(n/2) + ${it.fTex}$ with $T(1) = ${it.t1}$, for $n$ a power of $2$. What is the order of growth of $T(n)$?`,
    correct: r`$\Theta(${it.theta})$`,
    distractors: others.map((t) => r`$\Theta(${t})$`),
    hint: 'Unroll k = lg n levels: at level i there are a^i subproblems of size n/2^i. Sum the work per level.',
    solution: r`Unrolling for $n = 2^k$ gives $T(n) = ${it.closedTex('k')}$, so $T(n) = \Theta(${it.theta})$. Rule of thumb (the “master theorem”): compare $f(n)$ with $n^{\lg a}$; the bigger one wins, and if they tie a $\log n$ factor appears.`,
  });
}

export function classics(rng) {
  const variant = rng.pick(['hanoi', 'lines', 'josephus', 'regions-circle']);
  if (variant === 'hanoi') {
    const n = rng.int(3, 12);
    return {
      kind: 'classics',
      type: 'integer',
      prompt: r`The **Tower of Hanoi** with $${n}$ disks: what is the minimum number of moves needed to transfer the whole tower to another peg?`,
      answer: String(2 ** n - 1),
      hint: 'T(n) = 2T(n−1) + 1: move n−1 disks away, move the big one, move n−1 back.',
      solution: r`$T(n) = 2T(n-1) + 1$ with $T(0) = 0$, whose solution is $T(n) = 2^n - 1$: here $2^{${n}} - 1 = ${2 ** n - 1}$. (Add 1 to both sides: $T(n) + 1 = 2(T(n-1) + 1)$, a pure doubling.) This is the opening example of *Concrete Mathematics*.`,
    };
  }
  if (variant === 'lines') {
    const n = rng.int(3, 15);
    return {
      kind: 'classics',
      type: 'integer',
      prompt: r`What is the maximum number of regions into which $${n}$ straight lines can divide the plane?`,
      answer: String((n * (n + 1)) / 2 + 1),
      hint: 'The n-th line, crossing all previous n−1 lines, adds n new regions: L(n) = L(n−1) + n.',
      solution: r`$L(n) = L(n-1) + n$ with $L(0) = 1$, so $L(n) = 1 + \frac{n(n+1)}{2}$; for $n = ${n}$ that is $${(n * (n + 1)) / 2 + 1}$. The new line is cut into $n$ pieces by the $n-1$ old lines, and each piece splits one region in two.`,
    };
  }
  if (variant === 'regions-circle') {
    const n = rng.int(3, 12);
    const ans = 1 + n * (n - 1) / 2 + (n * (n - 1) * (n - 2) * (n - 3)) / 24;
    return {
      kind: 'classics',
      type: 'integer',
      prompt: r`Place $${n}$ points on a circle and draw all the chords between them, with no three chords through one point. How many regions is the disk divided into?`,
      answer: String(ans),
      hint: 'Not 2^{n−1}! The answer is 1 + C(n,2) + C(n,4).',
      solution: r`The count is $1 + \binom{n}{2} + \binom{n}{4}$: one region to start, each chord adds one, and each interior crossing point (a choice of 4 endpoints) adds one more. For $n = ${n}$: $1 + ${(n * (n - 1)) / 2} + ${(n * (n - 1) * (n - 2) * (n - 3)) / 24} = ${ans}$. The sequence $1, 2, 4, 8, 16, 31, \dots$ is a classic warning against guessing patterns from small cases.`,
    };
  }
  const n = rng.int(5, 40);
  const m = Math.floor(Math.log2(n));
  const l = n - 2 ** m;
  return {
    kind: 'classics',
    type: 'integer',
    prompt: r`**Josephus problem**: $${n}$ people stand in a circle numbered $1$ to $${n}$. Going round, every second person is eliminated (2, 4, 6, …) until one remains. Which number survives?`,
    answer: String(2 * l + 1),
    hint: 'Write n = 2^m + ℓ with 0 ≤ ℓ < 2^m; the survivor is 2ℓ + 1.',
    solution: r`$${n} = 2^{${m}} + ${l}$, so the survivor is $J(${n}) = 2\cdot ${l} + 1 = ${2 * l + 1}$. The recurrences are $J(2n) = 2J(n) - 1$ and $J(2n+1) = 2J(n) + 1$; in binary, $J(n)$ is $n$ rotated left by one bit. (Concrete Mathematics §1.3.)`,
  };
}

export const generators = [firstOrder, closedForm, characteristic, divideAndConquer, classics];
