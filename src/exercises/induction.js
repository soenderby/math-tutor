// Exercises for §1.2.1 Mathematical Induction.
import { makeMC } from './answers.js';

const r = String.raw;

const claims = [
  {
    tex: r`\sum_{k=1}^{n} k = \frac{n(n+1)}{2}`,
    n0: 1,
    lhs: (n) => { let s = 0; for (let k = 1; k <= n; k++) s += k; return s; },
    rhsTex: (n) => r`\frac{${n}\cdot ${n + 1}}{2}`,
    next: (k) => r`(${k}+1)`,
    nextTex: r`k+1`,
    distract: [r`k`, r`2k+1`, r`\frac{k+1}{2}`],
  },
  {
    tex: r`\sum_{k=1}^{n} (2k-1) = n^2`,
    n0: 1,
    lhs: (n) => n * n,
    rhsTex: (n) => r`${n}^2`,
    nextTex: r`2k+1`,
    distract: [r`2k-1`, r`k+1`, r`2k+3`],
  },
  {
    tex: r`\sum_{k=0}^{n} 2^k = 2^{n+1}-1`,
    n0: 0,
    lhs: (n) => 2 ** (n + 1) - 1,
    rhsTex: (n) => r`2^{${n + 1}}-1`,
    nextTex: r`2^{k+1}`,
    distract: [r`2^k`, r`2^{k+1}-1`, r`2k+1`],
  },
  {
    tex: r`\sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}`,
    n0: 1,
    lhs: (n) => (n * (n + 1) * (2 * n + 1)) / 6,
    rhsTex: (n) => r`\frac{${n}\cdot ${n + 1}\cdot ${2 * n + 1}}{6}`,
    nextTex: r`(k+1)^2`,
    distract: [r`k^2`, r`2k+1`, r`k^2+1`],
  },
  {
    tex: r`\sum_{k=1}^{n} k^3 = \left(\frac{n(n+1)}{2}\right)^2`,
    n0: 1,
    lhs: (n) => ((n * (n + 1)) / 2) ** 2,
    rhsTex: (n) => r`\left(\frac{${n}\cdot ${n + 1}}{2}\right)^2`,
    nextTex: r`(k+1)^3`,
    distract: [r`k^3`, r`3k^2+3k+1`, r`(k+1)^2`],
  },
  {
    tex: r`\sum_{k=1}^{n} \frac{1}{k(k+1)} = \frac{n}{n+1}`,
    n0: 1,
    fraction: true,
    lhs: (n) => [n, n + 1],
    rhsTex: (n) => r`\frac{${n}}{${n + 1}}`,
    nextTex: r`\frac{1}{(k+1)(k+2)}`,
    distract: [r`\frac{1}{k(k+1)}`, r`\frac{1}{k+1}`, r`\frac{1}{(k+1)^2}`],
  },
];

/** Check the base case (or a small case) numerically. */
export function baseCase(rng) {
  const c = rng.pick(claims.filter((x) => !x.fraction));
  const n = rng.int(c.n0, c.n0 + 4);
  const value = c.lhs(n);
  const isBase = n === c.n0;
  return {
    kind: 'induction-base',
    type: 'integer',
    prompt: r`Consider the claim $P(n)$: $\displaystyle ${c.tex}$. ${isBase ? 'Verify the **base case**' : 'Check the instance'} $n = ${n}$: what number do both sides equal?`,
    answer: String(value),
    hint: 'Write out the left-hand side term by term, then evaluate the closed form on the right.',
    solution: r`Evaluating the right-hand side at $n=${n}$ gives $${c.rhsTex(n)} = ${value}$. Adding the ${n - c.n0 + 1} terms of the left-hand side gives the same value, so $P(${n})$ holds.${isBase ? ' This is exactly the base case of the induction: the smallest $n$ for which the claim is asserted.' : ' (Checking one instance does not prove the claim; the inductive step does.)'}`,
  };
}

/** What gets added when going from k to k+1. */
export function nextTerm(rng) {
  const c = rng.pick(claims);
  return makeMC(rng, {
    kind: 'induction-next-term',
    prompt: r`You are proving $\displaystyle ${c.tex}$ by induction. Assuming the identity holds for $n = k$, which term must be **added** to the left-hand side to obtain the left-hand side for $n = k+1$?`,
    correct: `$${c.nextTex}$`,
    distractors: c.distract.map((d) => `$${d}$`),
    hint: 'Substitute n = k+1 into the summand (the expression after the Σ).',
    solution: r`The sum for $n = k+1$ contains one more term than the sum for $n = k$: the summand evaluated at the new upper index. Substituting $k+1$ for the summation variable gives $${c.nextTex}$. The inductive step then shows that (closed form at $k$) $+$ $${c.nextTex}$ simplifies to the closed form at $k+1$.`,
  });
}

/** The logical shape of an induction proof. */
export function proofStructure(rng) {
  const n0 = rng.pick([0, 1, 2, 5]);
  const ask = rng.pick(['step', 'base', 'invalid']);
  const step = `For every integer $k \\ge ${n0}$: if $P(k)$ is true then $P(k+1)$ is true`;
  const base = `$P(${n0})$ is true`;
  const backwards = `For every integer $k \\ge ${n0}$: if $P(k+1)$ is true then $P(k)$ is true`;
  const some = `$P(k)$ is true for some integer $k \\ge ${n0}$`;
  const all = `$P(k)$ is true for every $k \\ge ${n0}$ (this is what we want to prove)`;
  if (ask === 'step') {
    return makeMC(rng, {
      kind: 'induction-structure',
      prompt: r`To prove that $P(n)$ holds for all integers $n \ge ${n0}$ by induction, which statement is the **inductive step**?`,
      correct: step,
      distractors: [base, backwards, some],
      solution: r`An induction proof has two parts. The *base case* establishes $P(${n0})$. The *inductive step* establishes the implication $P(k) \Rightarrow P(k+1)$ for every $k \ge ${n0}$. Together they give $P(${n0}), P(${n0 + 1}), P(${n0 + 2}), \dots$ like a row of falling dominoes. Note the direction: we assume $P(k)$ (the *inductive hypothesis*) and derive $P(k+1)$, never the reverse.`,
    });
  }
  if (ask === 'base') {
    return makeMC(rng, {
      kind: 'induction-structure',
      prompt: r`To prove that $P(n)$ holds for all integers $n \ge ${n0}$ by induction, which statement is the **base case**?`,
      correct: base,
      distractors: [step, some, all],
      solution: r`The base case is the smallest instance, $P(${n0})$, proved directly. Without it the inductive step has nothing to start from: the implication $P(k)\Rightarrow P(k+1)$ can be true for all $k$ even when $P$ is false everywhere.`,
    });
  }
  return makeMC(rng, {
    kind: 'induction-structure',
    prompt: r`Which of these is **not** enough, together with the base case $P(${n0})$, to conclude that $P(n)$ holds for all $n \ge ${n0}$?`,
    correct: backwards,
    distractors: [
      step,
      `For every integer $k \\ge ${n0}$: if $P(j)$ is true for all $${n0} \\le j \\le k$, then $P(k+1)$ is true`,
      `For every integer $k > ${n0}$: if $P(k-1)$ is true then $P(k)$ is true`,
    ],
    solution: r`The implication must run *upward*: from $P(k)$ (or from all of $P(${n0}),\dots,P(k)$, which is *strong induction*) to $P(k+1)$; “$P(k-1) \Rightarrow P(k)$ for $k > ${n0}$” is the same upward step with the index shifted. Knowing $P(k+1)\Rightarrow P(k)$ only lets you travel downward from cases you have not established.`,
  });
}

/** Smallest n0 from which an inequality holds, by table then induction. */
export function threshold(rng) {
  const ineqs = [
    { tex: r`2^n > n^2`, f: (n) => 2 ** n > n * n },
    { tex: r`n! > 2^n`, f: (n) => fact(n) > 2 ** n },
    { tex: r`2^n > n^3`, f: (n) => 2 ** n > n ** 3 },
    { tex: r`n! > 3^n`, f: (n) => fact(n) > 3 ** n },
    { tex: r`2^n > 10n`, f: (n) => 2 ** n > 10 * n },
    { tex: r`3^n > n^4`, f: (n) => 3 ** n > n ** 4 },
    { tex: r`n^2 > 5n + 7`, f: (n) => n * n > 5 * n + 7 },
    { tex: r`2^n \ge n^2 + n + 1`, f: (n) => 2 ** n >= n * n + n + 1 },
    { tex: r`n! \ge 2^{n-1}`, f: (n) => fact(n) >= 2 ** (n - 1) },
  ];
  const q = rng.pick(ineqs);
  let n0 = 1;
  for (let n = 100; n >= 1; n--) {
    if (!q.f(n)) { n0 = n + 1; break; }
  }
  const table = [];
  for (let n = Math.max(1, n0 - 3); n <= n0 + 1; n++) table.push(`$n=${n}$: ${q.f(n) ? 'true' : 'false'}`);
  return {
    kind: 'induction-threshold',
    type: 'integer',
    prompt: r`The inequality $${q.tex}$ is true for all sufficiently large $n$. What is the smallest integer $n_0 \ge 1$ such that it holds for **every** $n \ge n_0$? (That $n_0$ would be the base case of an induction proof.)`,
    answer: String(n0),
    hint: 'Make a small table of values of n. The inequality may hold for a few tiny n, fail, and then hold forever; you want the start of the “forever” part.',
    solution: r`Tabulating: ${table.join('; ')}. So the base case is $n_0 = ${n0}$, and for the inductive step one shows that if the inequality holds at $k \ge ${n0}$ it holds at $k+1$ (typically by comparing how much each side grows when $k$ increases by one).`,
  };
}

function fact(n) { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }

/** Divisibility proofs: the difference f(k+1) - f(k). */
export function divisibilityStep(rng) {
  const items = [
    { f: r`n^3 - n`, d: 6, diff: r`3k^2 + 3k`, wrong: [r`3k^2 + 3k + 1`, r`3k^2`, r`k^2 + k`], why: r`$(k+1)^3 - (k+1) - (k^3 - k) = 3k^2 + 3k$, and $3k^2+3k = 3k(k+1)$ is a multiple of $6$ because $k(k+1)$ is even.` },
    { f: r`n^3 + 2n`, d: 3, diff: r`3k^2 + 3k + 3`, wrong: [r`3k^2 + 3k`, r`3k^2 + 2`, r`k^2 + k + 1`], why: r`$(k+1)^3 + 2(k+1) - (k^3 + 2k) = 3k^2 + 3k + 3 = 3(k^2+k+1)$, visibly a multiple of $3$.` },
    { f: r`4^n - 1`, d: 3, diff: r`3\cdot 4^k`, wrong: [r`4^k`, r`4\cdot 3^k`, r`3\cdot 4^{k+1}`], why: r`$(4^{k+1} - 1) - (4^k - 1) = 4^{k+1} - 4^k = 4^k(4-1) = 3\cdot 4^k$.` },
    { f: r`7^n - 1`, d: 6, diff: r`6\cdot 7^k`, wrong: [r`7^k`, r`6\cdot 7^{k+1}`, r`7\cdot 6^k`], why: r`$(7^{k+1} - 1) - (7^k - 1) = 7^k(7-1) = 6\cdot 7^k$.` },
    { f: r`n^2 + n`, d: 2, diff: r`2k + 2`, wrong: [r`2k + 1`, r`2k`, r`k + 1`], why: r`$(k+1)^2 + (k+1) - (k^2 + k) = 2k + 2 = 2(k+1)$.` },
    { f: r`5^n - 1`, d: 4, diff: r`4\cdot 5^k`, wrong: [r`5^k`, r`4\cdot 5^{k+1}`, r`5\cdot 4^k`], why: r`$(5^{k+1} - 1) - (5^k - 1) = 5^k(5-1) = 4\cdot 5^k$.` },
    { f: r`n^3 + 5n`, d: 6, diff: r`3k^2 + 3k + 6`, wrong: [r`3k^2 + 3k`, r`3k^2 + 5`, r`k^2 + k + 2`], why: r`$(k+1)^3 + 5(k+1) - (k^3 + 5k) = 3k^2 + 3k + 6 = 3k(k+1) + 6$, a multiple of $6$ since $k(k+1)$ is even.` },
  ];
  const it = rng.pick(items);
  return makeMC(rng, {
    kind: 'induction-divisibility',
    prompt: r`Let $f(n) = ${it.f}$. To prove by induction that $f(n)$ is divisible by $${it.d}$ for all $n \ge 1$, the inductive step computes $f(k+1) - f(k)$. What is it?`,
    correct: `$${it.diff}$`,
    distractors: it.wrong.map((w) => `$${w}$`),
    hint: 'Expand f(k+1), then subtract f(k). Most terms cancel.',
    solution: r`${it.why} Since $f(k)$ is divisible by $${it.d}$ by the inductive hypothesis and the difference is too, $f(k+1) = f(k) + (${it.diff})$ is divisible by $${it.d}$.`,
  });
}

export const generators = [baseCase, nextTerm, proofStructure, threshold, divisibilityStep];
