// Exercises for §1.2.4 Integer Functions and Elementary Number Theory.
import { makeMC } from './answers.js';
import { gcd, lcm, euclidTrace, floorDiv, mod, modInverse, powmod, fmt, primeFactors } from '../lib/mathutil.js';

const r = String.raw;

/** Floor and ceiling of fractions, negatives, and square roots. */
export function floorCeil(rng) {
  const variant = rng.pick(['frac', 'frac', 'sqrt', 'neg-decimal']);
  const op = rng.pick(['floor', 'ceil']);
  const wrap = (x) => (op === 'floor' ? r`\lfloor ${x} \rfloor` : r`\lceil ${x} \rceil`);
  const apply = (x) => (op === 'floor' ? Math.floor(x) : Math.ceil(x));
  if (variant === 'frac') {
    const q = rng.int(2, 7);
    let p = rng.int(-40, 40);
    if (p % q === 0) p += 1;
    const x = p / q;
    const ans = apply(x);
    return {
      kind: 'floor-ceil',
      type: 'integer',
      prompt: r`Evaluate $${wrap(r`${p < 0 ? '-' : ''}\tfrac{${Math.abs(p)}}{${q}}`)}$.`,
      answer: String(ans),
      hint: 'Floor rounds down (toward −∞); ceiling rounds up (toward +∞). Careful with negatives.',
      solution: r`$${p}/${q} \approx ${x.toFixed(3)}$. ${op === 'floor' ? 'The floor is the greatest integer not exceeding this' : 'The ceiling is the least integer not less than this'}, namely $${ans}$. Note that for negative numbers the floor moves *away* from zero: $\lfloor -1.5 \rfloor = -2$.`,
    };
  }
  if (variant === 'sqrt') {
    const n = rng.int(2, 400);
    const ans = apply(Math.sqrt(n));
    const k = Math.floor(Math.sqrt(n));
    return {
      kind: 'floor-ceil',
      type: 'integer',
      prompt: r`Evaluate $${wrap(r`\sqrt{${n}}`)}$.`,
      answer: String(ans),
      hint: 'Find consecutive perfect squares around n.',
      solution: r`$${k}^2 = ${k * k} \le ${n} ${k * k === n ? '=' : '<'} ${(k + 1) ** 2} = ${k + 1}^2$, so $\sqrt{${n}}$ lies ${k * k === n ? 'exactly at' : 'strictly between'} $${k}$${k * k === n ? '' : ` and $${k + 1}$`}. Hence $${wrap(r`\sqrt{${n}}`)} = ${ans}$.`,
    };
  }
  const whole = rng.int(0, 9);
  const dec = rng.pick([1, 25, 5, 75, 999]);
  const str = `-${whole}.${String(dec).padStart(dec >= 100 ? 3 : dec >= 10 ? 2 : 1, '0')}`;
  const x = Number(str);
  const ans = apply(x);
  return {
    kind: 'floor-ceil',
    type: 'integer',
    prompt: r`Evaluate $${wrap(str)}$.`,
    answer: String(ans),
    hint: 'Draw a number line: which integers are on either side?',
    solution: r`$${str}$ lies between $${Math.floor(x)}$ and $${Math.ceil(x)}$. ${op === 'floor' ? 'The floor is the one on the left' : 'The ceiling is the one on the right'}: $${ans}$. Remember $\lceil x \rceil = -\lfloor -x \rfloor$.`,
  };
}

/** Knuth's definition of mod, including negative operands. */
export function knuthMod(rng) {
  const y = rng.pick([1, 1, 1, -1]) * rng.int(2, 9);
  let x = rng.int(-30, 30);
  if (x === 0) x = 7;
  const q = floorDiv(x, y);
  const m = mod(x, y);
  return {
    kind: 'knuth-mod',
    type: 'integer',
    prompt: r`Using Knuth’s definition $x \bmod y = x - y\lfloor x/y \rfloor$, evaluate $${x} \bmod ${y < 0 ? `(${y})` : y}$.`,
    answer: m.toString(),
    hint: 'Compute floor(x/y) first (round toward −∞), then x − y·floor(x/y). The result has the sign of y (or is zero).',
    solution: r`$\lfloor ${x}/${y} \rfloor = \lfloor ${(x / y).toFixed(3)} \rfloor = ${q}$, so $${x} \bmod ${y} = ${x} - (${y})(${q}) = ${m}$. With this definition the result always has the same sign as $y$ (or is $0$), so $x \bmod y$ lies in $[0, y)$ for $y > 0$ and in $(y, 0]$ for $y < 0$. Many programming languages disagree with Knuth here for negative $x$!`,
  };
}

/** gcd via Euclid, with the trace in the solution. */
export function gcdCompute(rng) {
  const g = rng.pick([1, 1, 2, 3, 4, 6, 7, 12, 15]);
  let a = g * rng.int(5, 60), b = g * rng.int(5, 60);
  if (a === b) b += g;
  if (a < b) [a, b] = [b, a];
  const trace = euclidTrace(a, b);
  const ans = gcd(a, b);
  return {
    kind: 'gcd',
    type: 'integer',
    prompt: r`Compute $\gcd(${a}, ${b})$ using Euclid’s algorithm.`,
    answer: ans.toString(),
    hint: 'Replace (a, b) by (b, a mod b) until the second number is 0.',
    solution: r`${trace.map((s) => `$${s.a} = ${s.q}\\cdot ${s.b} + ${s.r}$`).join(', ')}. The last nonzero remainder is $${ans}$, so $\gcd(${a}, ${b}) = ${ans}$. This is Knuth’s Algorithm E; its correctness rests on $\gcd(a, b) = \gcd(b, a \bmod b)$.`,
  };
}

/** Count the division steps of Euclid's algorithm. */
export function euclidSteps(rng) {
  const useFib = rng.chance(0.3);
  let a, b;
  if (useFib) {
    const fibs = [5, 8, 13, 21, 34, 55, 89, 144, 233];
    const i = rng.int(1, fibs.length - 1);
    a = fibs[i]; b = fibs[i - 1];
  } else {
    a = rng.int(20, 300); b = rng.int(5, a - 1);
  }
  const trace = euclidTrace(a, b);
  return {
    kind: 'euclid-steps',
    type: 'integer',
    prompt: r`How many division steps does Euclid’s algorithm perform to compute $\gcd(${a}, ${b})$? (Count one step for each remainder computed, including the final one that yields $0$.)`,
    answer: String(trace.length),
    hint: 'Just run it: write a = q·b + r at each step.',
    solution: r`${trace.map((s) => `$${s.a} = ${s.q}\\cdot ${s.b} + ${s.r}$`).join('; ')}. That is $${trace.length}$ steps, and $\gcd = ${gcd(a, b)}$.${useFib ? ' Consecutive Fibonacci numbers are the worst case: every quotient is 1, so the algorithm takes as long as it possibly can for numbers of that size (Lamé’s theorem, which Knuth discusses in §4.5.3).' : ''}`,
  };
}

const facts = [
  { s: '$' + r`\lfloor x \rfloor + \lfloor y \rfloor \le \lfloor x + y \rfloor` + '$ for all real $x, y$', t: true, why: r`Write $x = \lfloor x\rfloor + \theta$, $y = \lfloor y \rfloor + \phi$ with $0 \le \theta,\phi < 1$; then $x + y = \lfloor x\rfloor + \lfloor y\rfloor + (\theta+\phi)$ and $\theta+\phi \ge 0$.` },
  { s: '$' + r`\lfloor x \rfloor + \lfloor y \rfloor = \lfloor x + y \rfloor` + '$ for all real $x, y$', t: false, why: r`Counterexample: $x = y = \tfrac12$ gives $0 + 0 \ne 1$. Only $\le$ holds in general.` },
  { s: '$' + r`\lceil x \rceil = -\lfloor -x \rfloor` + '$ for all real $x$', t: true, why: r`Reflecting the number line through $0$ swaps “round down” and “round up”. This is Knuth’s equation (2) in §1.2.4.` },
  { s: '$' + r`\lfloor x + n \rfloor = \lfloor x \rfloor + n` + '$ for every real $x$ and integer $n$', t: true, why: r`Adding an integer shifts everything without changing the fractional part.` },
  { s: '$' + r`\lfloor n/2 \rfloor + \lceil n/2 \rceil = n` + '$ for every integer $n$', t: true, why: r`If $n$ is even both equal $n/2$; if $n$ is odd they are $(n-1)/2$ and $(n+1)/2$.` },
  { s: '$' + r`\lceil x \rceil - \lfloor x \rfloor = 1` + '$ for all real $x$', t: false, why: r`When $x$ is an integer both are $x$ and the difference is $0$. In general $\lceil x\rceil - \lfloor x \rfloor = [x \notin \mathbb Z]$.` },
  { s: '$' + r`\lfloor \sqrt{\lfloor x \rfloor} \rfloor = \lfloor \sqrt{x} \rfloor` + '$ for all real $x \\ge 0$', t: true, why: r`If $m = \lfloor\sqrt x\rfloor$ then $m^2 \le x < (m+1)^2$, and since $m^2$ is an integer, also $m^2 \le \lfloor x \rfloor < (m+1)^2$. This is a special case of a theorem in §1.2.4 (exercise 13 / Concrete Math 3.10) about “continuous, monotone functions with integer values only at integer points”.` },
  { s: '$' + r`\lfloor \lfloor x \rfloor / n \rfloor = \lfloor x / n \rfloor` + '$ for every real $x$ and positive integer $n$', t: true, why: r`Same theorem: $f(x) = x/n$ is monotone and takes an integer value only when $x$ is an integer. Practical upshot: nested integer divisions can be collapsed.` },
  { s: '$x \\bmod y$ lies in the interval $[0, y)$ whenever $y > 0$', t: true, why: r`$x \bmod y = x - y\lfloor x/y\rfloor = y\cdot(\text{fractional part of } x/y)$, and the fractional part is in $[0, 1)$.` },
  { s: '$(-7) \\bmod 3 = -1$ under Knuth’s definition', t: false, why: r`$\lfloor -7/3 \rfloor = \lfloor -2.33\ldots\rfloor = -3$, so $(-7) \bmod 3 = -7 - 3(-3) = 2$. (Some programming languages *do* return $-1$; Knuth’s definition never does for positive modulus.)` },
  { s: '$' + r`\lfloor -x \rfloor = -\lfloor x \rfloor` + '$ for all real $x$', t: false, why: r`$x = \tfrac12$: $\lfloor -\tfrac12 \rfloor = -1$ but $-\lfloor \tfrac12 \rfloor = 0$. The correct identity is $\lfloor -x \rfloor = -\lceil x \rceil$.` },
  { s: '$' + r`\lfloor x \rfloor = \lceil x \rceil` + '$ if and only if $x$ is an integer', t: true, why: r`Both round to $x$ itself exactly when $x$ is already an integer; otherwise they differ by 1.` },
  { s: '$' + r`\lfloor 2x \rfloor = 2\lfloor x \rfloor` + '$ for all real $x$', t: false, why: r`$x = \tfrac12$: $\lfloor 1 \rfloor = 1 \ne 0$. In fact $\lfloor 2x \rfloor = \lfloor x \rfloor + \lfloor x + \tfrac12 \rfloor$.` },
  { s: '$x \\bmod 1$ is the fractional part of $x$', t: true, why: r`$x \bmod 1 = x - \lfloor x \rfloor$, exactly the fractional part $\{x\}$. Knuth likes this: mod works for real numbers too.` },
  { s: '$' + r`\lfloor x \rfloor \le x < \lfloor x \rfloor + 1` + '$ for all real $x$', t: true, why: r`This is just the definition of floor: the largest integer $\le x$.` },
  { s: 'If $a \\equiv b \\pmod m$ then $a^2 \\equiv b^2 \\pmod m$', t: true, why: r`Congruences can be multiplied: $a^2 - b^2 = (a-b)(a+b)$ is a multiple of $m$ whenever $a - b$ is.` },
  { s: 'If $ac \\equiv bc \\pmod m$ then $a \\equiv b \\pmod m$', t: false, why: r`Cancellation needs $\gcd(c, m) = 1$. Counterexample: $2\cdot 1 \equiv 2\cdot 4 \pmod 6$ but $1 \not\equiv 4 \pmod 6$.` },
  { s: '$\\gcd(a, b) = \\gcd(b, a \\bmod b)$ for positive integers $a, b$', t: true, why: r`Any common divisor of $a$ and $b$ divides $a - qb = a \bmod b$, and conversely. This one line is the whole justification of Euclid’s algorithm.` },
  { s: 'If $\\gcd(a, m) = 1$ then $ax \\equiv 1 \\pmod m$ has a solution', t: true, why: r`By the extended Euclidean algorithm there are integers $x, y$ with $ax + my = 1$; reducing mod $m$ gives $ax \equiv 1$. Such $x$ is the inverse of $a$ modulo $m$.` },
];

/** True/false about floor, ceiling, mod, congruences. */
export function integerFacts(rng) {
  const f = rng.pick(facts);
  return makeMC(rng, {
    kind: 'integer-facts',
    prompt: `True or false: ${f.s}`,
    correct: f.t ? 'True' : 'False',
    distractors: [f.t ? 'False' : 'True'],
    hint: 'Try x = 1/2, x = −1/2, or an integer. Most false identities fail on a fractional example.',
    solution: `**${f.t ? 'True' : 'False'}.** ${f.why}`,
  });
}

/** Solve a x ≡ b (mod m). */
export function linearCongruence(rng) {
  const m = rng.int(5, 30);
  let a = rng.int(2, m - 1);
  while (gcd(a, m) !== 1n) a = rng.int(2, m - 1);
  const b = rng.int(1, m - 1);
  const inv = modInverse(a, m);
  const x = mod(inv * BigInt(b), m);
  return {
    kind: 'linear-congruence',
    type: 'integer',
    prompt: r`Find the integer $x$ with $0 \le x < ${m}$ such that $${a}x \equiv ${b} \pmod{${m}}$.`,
    answer: x.toString(),
    hint: `Find the inverse of ${a} mod ${m} (a number u with ${a}u ≡ 1), then x = u·${b} mod ${m}. Or just try x = 0, 1, 2, …`,
    solution: r`Since $\gcd(${a}, ${m}) = 1$, $${a}$ has an inverse modulo $${m}$: $${a}\cdot ${inv} = ${a * Number(inv)} \equiv 1 \pmod{${m}}$. Multiplying the congruence by $${inv}$ gives $x \equiv ${inv}\cdot ${b} = ${Number(inv) * b} \equiv ${x} \pmod{${m}}$. Check: $${a}\cdot ${x} = ${a * Number(x)} = ${Math.floor((a * Number(x)) / m)}\cdot ${m} + ${b}$.`,
  };
}

/** lcm via gcd. */
export function lcmCompute(rng) {
  const a = rng.int(4, 60), b = rng.int(4, 60);
  const g = gcd(a, b), l = lcm(a, b);
  return {
    kind: 'lcm',
    type: 'integer',
    prompt: r`Compute $\operatorname{lcm}(${a}, ${b})$.`,
    answer: l.toString(),
    hint: 'lcm(a, b) · gcd(a, b) = a · b.',
    solution: r`$\gcd(${a}, ${b}) = ${g}$, and $\operatorname{lcm}(a,b) = ab/\gcd(a,b) = ${a * b}/${g} = ${l}$. Prime factorisations: $${a} = ${primeFactors(a).join('\\cdot ')}$, $${b} = ${primeFactors(b).join('\\cdot ')}$; the lcm takes the *larger* exponent of each prime, the gcd the *smaller*.`,
  };
}

/** Counting with floors: multiples in a range, inclusion–exclusion. */
export function countMultiples(rng) {
  const n = rng.int(50, 1000);
  if (rng.chance(0.5)) {
    const d = rng.int(3, 13);
    return {
      kind: 'count-multiples',
      type: 'integer',
      prompt: r`How many integers $k$ with $1 \le k \le ${n}$ are divisible by $${d}$?`,
      answer: String(Math.floor(n / d)),
      hint: 'The multiples are d, 2d, 3d, …; the largest one ≤ n is ⌊n/d⌋·d.',
      solution: r`The multiples of $${d}$ up to $${n}$ are $${d}, ${2 * d}, \dots, ${d * Math.floor(n / d)}$, i.e. $\lfloor ${n}/${d} \rfloor = ${Math.floor(n / d)}$ of them. Floors are exactly the language for “how many multiples fit”.`,
    };
  }
  let d1 = rng.pick([2, 3, 4, 5, 6, 7]);
  let d2 = rng.pick([3, 5, 7, 9, 10, 11]);
  if (d1 === d2) d2 = 11;
  const l = Number(lcm(d1, d2));
  const ans = Math.floor(n / d1) + Math.floor(n / d2) - Math.floor(n / l);
  return {
    kind: 'count-multiples',
    type: 'integer',
    prompt: r`How many integers $k$ with $1 \le k \le ${n}$ are divisible by $${d1}$ **or** by $${d2}$?`,
    answer: String(ans),
    hint: 'Inclusion–exclusion: count multiples of d₁, add multiples of d₂, subtract multiples of lcm(d₁, d₂).',
    solution: r`$\lfloor ${n}/${d1} \rfloor + \lfloor ${n}/${d2} \rfloor - \lfloor ${n}/${l} \rfloor = ${Math.floor(n / d1)} + ${Math.floor(n / d2)} - ${Math.floor(n / l)} = ${ans}$, where $${l} = \operatorname{lcm}(${d1}, ${d2})$ (numbers divisible by both were counted twice).`,
  };
}

/** Modular arithmetic including fast exponentiation. */
export function modArithmetic(rng) {
  const m = rng.int(5, 40);
  if (rng.chance(0.5)) {
    const a = rng.int(10, 99), b = rng.int(10, 99), c = rng.int(1, 50);
    const ans = mod(BigInt(a) * BigInt(b) + BigInt(c), m);
    return {
      kind: 'mod-arith',
      type: 'integer',
      prompt: r`Evaluate $(${a}\cdot ${b} + ${c}) \bmod ${m}$. Try reducing each piece modulo $${m}$ first.`,
      answer: ans.toString(),
      hint: 'Reduce a, b, c mod m before multiplying; the answer is unchanged.',
      solution: r`Reduce first: $${a} \equiv ${mod(a, m)}$, $${b} \equiv ${mod(b, m)}$, $${c} \equiv ${mod(c, m)} \pmod{${m}}$. Then $${mod(a, m)}\cdot ${mod(b, m)} + ${mod(c, m)} = ${Number(mod(a, m)) * Number(mod(b, m)) + Number(mod(c, m))} \equiv ${ans} \pmod{${m}}$. Directly: $${a}\cdot ${b} + ${c} = ${a * b + c}$, and $${a * b + c} \bmod ${m} = ${ans}$.`,
    };
  }
  const a = rng.int(2, 12), e = rng.int(5, 40);
  const ans = powmod(a, e, m);
  // show repeated squaring
  const steps = [];
  let cur = mod(a, m), k = 1;
  while (k * 2 <= e) { cur = (cur * cur) % BigInt(m); k *= 2; steps.push(`$${a}^{${k}} \\equiv ${cur}$`); }
  return {
    kind: 'mod-arith',
    type: 'integer',
    prompt: r`Evaluate $${a}^{${e}} \bmod ${m}$.`,
    answer: ans.toString(),
    hint: 'Square repeatedly, reducing mod m each time; then multiply the powers you need. Or look for a small power that is ≡ 1.',
    solution: r`Repeated squaring modulo $${m}$: ${steps.join(', ')} $\pmod{${m}}$. Combining the powers of two in the binary expansion of $${e} = ${e.toString(2)}_2$ gives $${a}^{${e}} \equiv ${ans} \pmod{${m}}$. This is the idea behind Knuth’s Algorithm A for $x^n$ in §4.6.3.`,
  };
}

export const generators = [floorCeil, knuthMod, gcdCompute, euclidSteps, integerFacts, linearCongruence, lcmCompute, countMultiples, modArithmetic];
