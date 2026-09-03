// Exercises for §1.2.11 Asymptotic Representations.
import { makeMC, makeOrder } from './answers.js';

const r = String.raw;

// rank increases with growth; equal ranks grow at the same order
const pool = [
  { tex: r`1`, rank: 0 },
  { tex: r`\log\log n`, rank: 1 },
  { tex: r`\log n`, rank: 2 },
  { tex: r`(\log n)^2`, rank: 3 },
  { tex: r`\sqrt{n}`, rank: 4 },
  { tex: r`n`, rank: 5 },
  { tex: r`n\log n`, rank: 6 },
  { tex: r`n^{1.5}`, rank: 7 },
  { tex: r`n^2`, rank: 8 },
  { tex: r`n^2\log n`, rank: 9 },
  { tex: r`n^3`, rank: 10 },
  { tex: r`2^n`, rank: 11 },
  { tex: r`3^n`, rank: 12 },
  { tex: r`n!`, rank: 13 },
  { tex: r`n^n`, rank: 14 },
];

export function orderGrowth(rng) {
  const chosen = rng.sample(pool, 5).sort((a, b) => a.rank - b.rank);
  return makeOrder(rng, {
    kind: 'order-growth',
    prompt: 'Arrange these functions from **slowest** to **fastest** growing (as $n \\to \\infty$). Click the items in order.',
    ordered: chosen.map((c) => `$${c.tex}$`),
    hint: 'Logs < polynomials < exponentials < factorials. Among polynomials compare exponents; a log factor is smaller than any positive power of n.',
    solution: r`From slowest to fastest: ${chosen.map((c) => `$${c.tex}$`).join(' $\\prec$ ')}. The hierarchy to remember: constants $\prec$ $\log\log n$ $\prec$ powers of $\log n$ $\prec$ $n^{\epsilon}$ (any $\epsilon > 0$) $\prec$ $n$ $\prec$ $n\log n$ $\prec$ $n^{c}$ ($c > 1$) $\prec$ $c^n$ ($c > 1$) $\prec$ $n!$ $\prec$ $n^n$. Two useful facts: $\log n = O(n^\epsilon)$ for every $\epsilon > 0$, and $n^c = O(b^n)$ for every $c$ and $b > 1$.`,
  });
}

const statements = [
  { s: r`$n^2 = O(n^3)$`, t: true, why: r`$n^2 \le n^3$ for $n \ge 1$. O gives only an upper bound; it need not be tight.` },
  { s: r`$n^3 = O(n^2)$`, t: false, why: r`$n^3/n^2 = n$ is unbounded, so no constant $C$ works.` },
  { s: r`$2^{n+1} = O(2^n)$`, t: true, why: r`$2^{n+1} = 2\cdot 2^n$; constants are absorbed.` },
  { s: r`$2^{2n} = O(2^n)$`, t: false, why: r`$2^{2n} = 4^n$, and $4^n/2^n = 2^n$ is unbounded.` },
  { s: r`$(n+1)! = O(n!)$`, t: false, why: r`$(n+1)!/n! = n+1 \to \infty$.` },
  { s: r`$\log_2 n = O(\log_{10} n)$`, t: true, why: r`$\log_2 n = \log_{10} n / \log_{10} 2$: logarithms to different bases differ by a constant factor, which is why $O(\log n)$ needs no base.` },
  { s: r`$n^{1.5} = O(n\log n)$`, t: false, why: r`$n^{1.5}/(n\log n) = \sqrt n/\log n \to \infty$; any positive power of $n$ beats any power of $\log n$.` },
  { s: r`$n\log n = O(n^2)$`, t: true, why: r`$\log n \le n$ for $n \ge 1$.` },
  { s: r`$3^n = O(2^n)$`, t: false, why: r`$(3/2)^n \to \infty$. Exponentials with different bases are *not* interchangeable, unlike logarithms.` },
  { s: r`$n = O(n^2)$ and $n^2 = O(n)$ are both true`, t: false, why: r`The first is true, the second false; O is not symmetric.` },
  { s: r`$H_n = O(\log n)$`, t: true, why: r`$H_n \le 1 + \ln n$.` },
  { s: r`$\log(n!) = O(n\log n)$`, t: true, why: r`$n! \le n^n$, so $\log n! \le n\log n$. In fact $\log n! = \Theta(n\log n)$ by Stirling.` },
  { s: r`$\log(n!) = \Theta(n)$`, t: false, why: r`$\log n! \sim n\ln n$, which grows faster than $n$.` },
  { s: r`If $f(n) = O(g(n))$ then $g(n) = \Omega(f(n))$`, t: true, why: r`That is the definition of $\Omega$ (Knuth’s 1976 convention, used in §1.2.11.1).` },
  { s: r`$f(n) = \Theta(g(n))$ means $f(n) = O(g(n))$ and $f(n) = \Omega(g(n))$`, t: true, why: r`$\Theta$ is the “same order” relation: bounded above and below by constant multiples.` },
  { s: r`$n^2 + 10^6 n = O(n^2)$`, t: true, why: r`$n^2 + 10^6 n \le 2n^2$ once $n \ge 10^6$. O-notation cares about the limit, not small $n$; a huge constant is still a constant.` },
  { s: r`$O(f(n)) + O(g(n)) = O(f(n) + g(n))$`, t: true, why: r`If $|a| \le C_1 f$ and $|b| \le C_2 g$ then $|a + b| \le (C_1 + C_2)(f + g)$. One of Knuth’s rules for manipulating O’s, §1.2.11.1 eq. (13)–(16).` },
  { s: r`$O(f(n))\cdot O(g(n)) = O(f(n)g(n))$`, t: true, why: r`Multiply the two bounds. §1.2.11.1 eq. (15).` },
  { s: r`$\sum_{k=1}^{n} k^2 = \frac{n^3}{3} + O(n^2)$`, t: true, why: r`$\sum k^2 = \frac{n(n+1)(2n+1)}{6} = \frac{n^3}{3} + \frac{n^2}{2} + \frac{n}{6}$.` },
  { s: r`$(1 + 1/n)^n = e + O(1/n)$`, t: true, why: r`$(1+1/n)^n = e - \frac{e}{2n} + O(1/n^2)$; Knuth derives this in §1.2.11.1.` },
  { s: r`$e^{O(1/n)} = 1 + O(1/n)$`, t: true, why: r`$e^x = 1 + x + O(x^2)$ for bounded $x$; substitute $x = O(1/n)$.` },
  { s: r`$n^{\lg 3} = O(n^{1.5})$`, t: false, why: r`$\lg 3 \approx 1.585 > 1.5$, so $n^{\lg 3}/n^{1.5} = n^{0.085} \to \infty$. (This exponent is Karatsuba’s.)` },
  { s: r`$\sqrt{n} = O(\log^{10} n)$`, t: false, why: r`Any positive power of $n$ eventually dominates any fixed power of $\log n$.` },
  { s: r`$n^{1/\log n} = O(1)$`, t: true, why: r`$n^{1/\log n} = e^{\ln n/\log n}$ is a constant ($e$ if $\log$ means $\ln$; $2$ if it means $\lg$).` },
];

export function bigOTrueFalse(rng) {
  const st = rng.pick(statements);
  return makeMC(rng, {
    kind: 'big-o-tf',
    prompt: `True or false: ${st.s}`,
    correct: st.t ? 'True' : 'False',
    distractors: [st.t ? 'False' : 'True'],
    hint: 'f = O(g) means |f(n)| ≤ C·g(n) for all n ≥ n₀, for some constants C and n₀. Look at the ratio f/g.',
    solution: `**${st.t ? 'True' : 'False'}.** ${st.why}`,
  });
}

const termPool = [
  { tex: (c) => `${c}`, theta: '1', rank: 0 },
  { tex: (c) => `${c}\\log n`, theta: r`\log n`, rank: 2 },
  { tex: (c) => `${c}\\sqrt n`, theta: r`\sqrt n`, rank: 4 },
  { tex: (c) => `${c}n`, theta: 'n', rank: 5 },
  { tex: (c) => `${c}n\\log n`, theta: r`n\log n`, rank: 6 },
  { tex: (c) => `${c}n^2`, theta: 'n^2', rank: 8 },
  { tex: (c) => `${c}n^3`, theta: 'n^3', rank: 10 },
  { tex: (c) => (c === '' ? '2^n' : `${c}\\cdot 2^n`), theta: '2^n', rank: 11 },
];

export function dominantTerm(rng) {
  const chosen = rng.sample(termPool, 3).sort((a, b) => b.rank - a.rank);
  const coeffs = chosen.map((t, i) => (i === 0 ? rng.pick([1, 2, 3, 5]) : rng.pick([10, 100, 1000, 7, 50])));
  const expr = chosen.map((t, i) => t.tex(coeffs[i] === 1 && t.rank !== 0 ? '' : coeffs[i])).join(' + ');
  const top = chosen[0];
  const distract = chosen.slice(1).map((t) => r`$\Theta(${t.theta})$`);
  distract.push(r`$\Theta(${expr})$ cannot be simplified`);
  return makeMC(rng, {
    kind: 'dominant-term',
    prompt: r`Let $f(n) = ${expr}$. Which of these is the simplest correct statement of the form $f(n) = \Theta(\cdot)$?`,
    correct: r`$\Theta(${top.theta})$`,
    distractors: distract,
    hint: 'Keep the fastest-growing term and drop its constant factor.',
    solution: r`As $n \to \infty$, the term $${chosen[0].tex(coeffs[0])}$ dominates the others (their ratio to it tends to $0$), so $f(n) = \Theta(${top.theta})$. Constant factors and lower-order terms are exactly what $\Theta$ is designed to hide. Beware though: for *actual* running times at realistic $n$, a coefficient like $${Math.max(...coeffs)}$ on a lower term can matter, which is why Knuth keeps exact counts when he can.`,
  });
}

const conventions = [
  {
    q: r`In Knuth’s convention, which of the following is a **valid** use of O-notation? (Recall his rule: the equals sign in $f = O(g)$ is one-way.)`,
    ok: r`$n = O(n^2)$`,
    bad: [r`$O(n^2) = n$`, r`$O(n) = O(n^2)$ implies $O(n^2) = O(n)$`, r`$n^2 = O(n)$`],
    why: r`Knuth reads “$=$” as “is” (a member of): $n$ *is* a function bounded by a constant times $n^2$. Reversed statements like $O(n^2) = n$ are meaningless; and while $O(n) = O(n^2)$ is fine (everything that is $O(n)$ is $O(n^2)$), the converse fails.`,
  },
  {
    q: r`What does $f(n) = O(g(n))$ mean, in Knuth’s definition (§1.2.11.1)?`,
    ok: r`There are constants $C$ and $n_0$ such that $|f(n)| \le C\,g(n)$ for all $n \ge n_0$`,
    bad: [r`$f(n) \le g(n)$ for all $n$`, r`$\lim_{n\to\infty} f(n)/g(n) = 0$`, r`$f(n)$ and $g(n)$ have the same order of growth`],
    why: r`O is an upper bound up to a constant, for all sufficiently large $n$. “Same order” is $\Theta$; ratio tending to $0$ is little-o.`,
  },
  {
    q: r`Knuth writes $\displaystyle\sum_{k=1}^{n} \frac{1}{k} = \ln n + \gamma + O\!\left(\frac{1}{n}\right)$. What does the $O(1/n)$ stand for?`,
    ok: r`Some unspecified function whose absolute value is at most $C/n$ for large $n$`,
    bad: [r`Exactly $1/n$`, r`A quantity that is $0$ in the limit, i.e. it can be dropped`, r`The constant $C$ itself`],
    why: r`O-terms inside formulas are anonymous functions with a known bound. Their size matters: dropping the $O(1/n)$ leaves an equation that is only true in the limit, and Knuth’s rules (§1.2.11.1) explain what you may do with such terms algebraically.`,
  },
  {
    q: r`Which statement is **false**?`,
    ok: r`If $f(n) = O(g(n))$ then $f(n) \le g(n)$ for all $n \ge 1$`,
    bad: [r`If $f(n) = O(g(n))$ and $g(n) = O(h(n))$ then $f(n) = O(h(n))$`, r`$f(n) = O(f(n))$ for every function $f$`, r`If $f(n) = O(g(n))$ then $c\,f(n) = O(g(n))$ for every constant $c$`],
    why: r`The definition allows a constant factor and ignores small $n$: $1000n = O(n)$ but $1000n > n$. The other three are basic properties (transitivity, reflexivity, closure under scaling).`,
  },
  {
    q: r`What is $O(n^2) - O(n^2)$, by Knuth’s rules?`,
    ok: r`$O(n^2)$`,
    bad: [r`$0$`, r`$O(1)$`, r`$O(n)$`],
    why: r`The two O’s stand for *different* unknown functions, so the difference is again bounded by a constant times $n^2$: $O(n^2) - O(n^2) = O(n^2)$, not $0$. This is the most common O-notation mistake.`,
  },
  {
    q: r`Which is the correct leading behaviour of $\ln n!$ (Stirling)?`,
    ok: r`$n\ln n - n + O(\log n)$`,
    bad: [r`$n\ln n + O(n)$ is false; the right answer is $n\ln n + O(1)$`, r`$n^2 + O(n)$`, r`$n + O(\log n)$`],
    why: r`$\ln n! = n\ln n - n + \tfrac12\ln(2\pi n) + O(1/n)$ (§1.2.11.2, from Euler’s summation formula). Note that $n\ln n + O(n)$ is *also* a correct, weaker statement.`,
  },
];

export function conventionsMC(rng) {
  const c = rng.pick(conventions);
  return makeMC(rng, {
    kind: 'big-o-conventions',
    prompt: c.q,
    correct: c.ok,
    distractors: c.bad,
    solution: c.why,
  });
}

const limits = [
  { f: r`\frac{n}{n+1}`, ans: '1', why: r`Divide top and bottom by $n$.` },
  { f: r`\frac{\log n}{n}`, ans: '0', why: r`Logarithms grow slower than any positive power.` },
  { f: r`\frac{n^2}{2^n}`, ans: '0', why: r`Exponentials beat polynomials; $2^n$ eventually doubles faster than $n^2$ grows.` },
  { f: r`\frac{(n+1)!}{n!}`, ans: r`\infty`, why: r`The ratio is $n+1$.` },
  { f: r`\frac{H_n}{\ln n}`, ans: '1', why: r`$H_n = \ln n + \gamma + O(1/n)$.` },
  { f: r`\frac{F_{n+1}}{F_n}`, ans: r`\phi \approx 1.618`, why: r`Binet’s formula: $F_n \sim \phi^n/\sqrt5$.` },
  { f: r`\frac{n\log n}{n^2}`, ans: '0', why: r`$= \log n / n \to 0$.` },
  { f: r`\frac{2^{n+1}}{2^n}`, ans: '2', why: r`$2^{n+1} = 2\cdot 2^n$.` },
  { f: r`\frac{\binom{n}{2}}{n^2}`, ans: r`\tfrac12`, why: r`$\binom{n}{2} = n(n-1)/2 \sim n^2/2$.` },
  { f: r`\frac{\lg n}{\ln n}`, ans: r`\frac{1}{\ln 2} \approx 1.443`, why: r`$\lg n = \ln n/\ln 2$; the ratio is constant.` },
  { f: r`\frac{n!}{n^n}`, ans: '0', why: r`By Stirling, $n!/n^n \sim \sqrt{2\pi n}\,e^{-n} \to 0$.` },
  { f: r`\left(1 + \frac1n\right)^n`, ans: r`e \approx 2.718`, why: r`The defining limit of $e$.` },
  { f: r`\frac{\sum_{k \le n} k^2}{n^3}`, ans: r`\tfrac13`, why: r`$\sum k^2 = n^3/3 + O(n^2)$.` },
];

export function limitRatio(rng) {
  const it = rng.pick(limits);
  const choices = ['0', '1', '2', r`\infty`, r`\tfrac12`, r`\phi \approx 1.618`, r`e \approx 2.718`, r`\tfrac13`, r`\frac{1}{\ln 2} \approx 1.443`];
  const others = rng.sample(choices.filter((c) => c !== it.ans), 3);
  return makeMC(rng, {
    kind: 'limit-ratio',
    prompt: r`As $n \to \infty$, what does $\displaystyle ${it.f}$ approach?`,
    correct: `$${it.ans}$`,
    distractors: others.map((o) => `$${o}$`),
    solution: r`The limit is $${it.ans}$. ${it.why} A limit of $0$ means numerator $= o(\text{denominator})$; a finite nonzero limit means $\Theta$; $\infty$ means the numerator dominates.`,
  });
}

export function polynomialBound(rng) {
  const a = rng.int(1, 4);
  const variant = rng.pick(['poly', 'polylog', 'sqrt']);
  if (variant === 'poly') {
    const b = rng.int(0, a - 1);
    return {
      kind: 'poly-bound',
      type: 'integer',
      prompt: r`What is the smallest integer $k$ such that $${rng.int(2, 9)}n^{${a}} + ${rng.int(10, 99)}n^{${b}} + 7 = O(n^k)$?`,
      answer: String(a),
      solution: r`The highest power present is $n^{${a}}$, and a polynomial of degree $d$ is $O(n^d)$ but not $O(n^{d-1})$. So $k = ${a}$.`,
    };
  }
  if (variant === 'polylog') {
    return {
      kind: 'poly-bound',
      type: 'integer',
      prompt: r`What is the smallest integer $k$ such that $n^{${a}}\log n = O(n^k)$?`,
      answer: String(a + 1),
      hint: 'log n is not O(1), but it is O(n).',
      solution: r`$n^{${a}}\log n$ is *not* $O(n^{${a}})$ because $\log n$ is unbounded, but $\log n = O(n)$, so $n^{${a}}\log n = O(n^{${a + 1}})$. Hence $k = ${a + 1}$. (With real exponents one could do better: $n^{${a}}\log n = O(n^{${a}+\epsilon})$ for every $\epsilon > 0$.)`,
    };
  }
  return {
    kind: 'poly-bound',
    type: 'integer',
    prompt: r`What is the smallest integer $k$ such that $n^{${a}}\sqrt{n} = O(n^k)$?`,
    answer: String(a + 1),
    solution: r`$n^{${a}}\sqrt n = n^{${a}.5}$, which is $O(n^{${a + 1}})$ but not $O(n^{${a}})$. So $k = ${a + 1}$.`,
  };
}

export const generators = [orderGrowth, bigOTrueFalse, dominantTerm, conventionsMC, limitRatio, polynomialBound];
