// Exercises for §1.2.2 Numbers, Powers, and Logarithms.
import { makeMC } from './answers.js';
import { Fraction, fmt } from '../lib/mathutil.js';

const r = String.raw;

const bases = [
  { b: 2, name: (x) => r`\lg ${x}`, word: 'binary logarithm (base 2)' },
  { b: 10, name: (x) => r`\log_{10} ${x}`, word: 'common logarithm (base 10)' },
  { b: 3, name: (x) => r`\log_3 ${x}`, word: 'base-3 logarithm' },
  { b: 5, name: (x) => r`\log_5 ${x}`, word: 'base-5 logarithm' },
  { b: 4, name: (x) => r`\log_4 ${x}`, word: 'base-4 logarithm' },
];

/** log_b(b^k) with integer answers. */
export function logExact(rng) {
  if (rng.chance(0.2)) {
    const k = rng.int(-3, 6);
    return {
      kind: 'log-exact',
      type: 'integer',
      prompt: r`Evaluate $\ln e^{${k}}$.`,
      answer: String(k),
      solution: r`$\ln$ is the logarithm to base $e$, so $\ln e^{x} = x$ for every real $x$: the answer is $${k}$.`,
    };
  }
  const base = rng.pick(bases);
  const k = base.b === 2 ? rng.int(-4, 16) : rng.int(-2, 6);
  const value = k >= 0 ? `${fmt(BigInt(base.b) ** BigInt(k))}` : r`\frac{1}{${fmt(BigInt(base.b) ** BigInt(-k))}}`;
  return {
    kind: 'log-exact',
    type: 'integer',
    prompt: r`Evaluate $${base.name(value)}$.`,
    answer: String(k),
    hint: `Ask: ${base.b} to what power gives this number?`,
    solution: r`By definition $\log_b x$ is the exponent $y$ with $b^y = x$. Since $${base.b}^{${k}} = ${value}$, the ${base.word} of $${value}$ is $${k}$.`,
  };
}

/** Bit length and floor(lg n). */
export function bitLength(rng) {
  const n = rng.pick([rng.int(2, 100), rng.int(100, 5000), rng.int(5000, 2_000_000)]);
  const k = Math.floor(Math.log2(n));
  const askBits = rng.chance(0.5);
  const lo = 2 ** k, hi = 2 ** (k + 1);
  const common = r`Because $2^{${k}} = ${fmt(lo)} \le ${fmt(n)} < ${fmt(hi)} = 2^{${k + 1}}$, we have $\lfloor \lg ${fmt(n)} \rfloor = ${k}$.`;
  if (askBits) {
    return {
      kind: 'bit-length',
      type: 'integer',
      prompt: r`How many bits are needed to write $${fmt(n)}$ in binary (no leading zeros)?`,
      answer: String(k + 1),
      hint: 'A number with b bits lies between 2^(b−1) and 2^b − 1.',
      solution: r`${common} A number $n$ needs $\lfloor \lg n \rfloor + 1$ bits, so the answer is $${k + 1}$. (Knuth writes $\lg$ for $\log_2$; it turns up whenever something is halved repeatedly.)`,
    };
  }
  return {
    kind: 'bit-length',
    type: 'integer',
    prompt: r`Compute $\lfloor \lg ${fmt(n)} \rfloor$, where $\lg$ denotes the binary logarithm.`,
    answer: String(k),
    hint: 'Find the largest power of 2 that does not exceed n.',
    solution: r`${common}`,
  };
}

/** log_{p^i}(p^j) = j/i. */
export function changeOfBase(rng) {
  const p = rng.pick([2, 3, 5]);
  const i = rng.int(1, 4);
  let j = rng.int(1, 6);
  if (j === i) j = i + 1;
  const a = p ** i, b = p ** j;
  const ans = new Fraction(BigInt(j), BigInt(i));
  return {
    kind: 'change-of-base',
    type: 'fraction',
    prompt: r`Evaluate $\log_{${a}} ${b}$. Give an exact fraction.`,
    answer: ans.toString(),
    hint: `Both numbers are powers of ${p}. Use log_a b = log_p b / log_p a.`,
    solution: r`Write both numbers as powers of $${p}$: $${a} = ${p}^{${i}}$ and $${b} = ${p}^{${j}}$. By the change-of-base rule $\log_a b = \dfrac{\log_p b}{\log_p a} = \dfrac{${j}}{${i}}$${ans.isInteger() ? ` = ${ans}` : ''}. Equivalently, $(${p}^{${i}})^{${j}/${i}} = ${p}^{${j}}$.`,
  };
}

/** Simplify a product/quotient of powers to a single exponent. */
export function exponentRules(rng) {
  const base = rng.pick([2, 3, 10, 'x']);
  const a = rng.int(2, 5), b = rng.int(2, 4), c = rng.int(1, 9), d = rng.int(1, 12);
  const k = a * b + c - d;
  return {
    kind: 'exponent-rules',
    type: 'integer',
    prompt: r`Simplify $\dfrac{(${base}^{${a}})^{${b}} \cdot ${base}^{${c}}}{${base}^{${d}}}$ to the form $${base}^{k}$. What is $k$?`,
    answer: String(k),
    hint: '(x^a)^b = x^(ab); x^a · x^b = x^(a+b); x^a / x^b = x^(a−b).',
    solution: r`$(${base}^{${a}})^{${b}} = ${base}^{${a * b}}$; multiplying by $${base}^{${c}}$ adds exponents, giving $${base}^{${a * b + c}}$; dividing by $${base}^{${d}}$ subtracts, giving $${base}^{${k}}$. Negative exponents are fine: $x^{-m} = 1/x^m$.`,
  };
}

/** Recognise logarithm laws. */
export function logLaws(rng) {
  const items = [
    { expr: r`\lg(x^3 y)`, ok: r`3\lg x + \lg y`, bad: [r`3\lg x \cdot \lg y`, r`(\lg x)^3 + \lg y`, r`3(\lg x + \lg y)`] },
    { expr: r`\lg\left(\frac{x}{y^2}\right)`, ok: r`\lg x - 2\lg y`, bad: [r`\frac{\lg x}{2 \lg y}`, r`\lg x - (\lg y)^2`, r`2\lg x - \lg y`] },
    { expr: r`\lg \sqrt{x}`, ok: r`\tfrac12 \lg x`, bad: [r`\sqrt{\lg x}`, r`2\lg x`, r`\lg x - \lg 2`] },
    { expr: r`\lg(4x)`, ok: r`2 + \lg x`, bad: [r`4\lg x`, r`4 + \lg x`, r`\lg 4 \cdot \lg x`] },
    { expr: r`\log_b x` + r` \text{ (in terms of natural logs)}`, ok: r`\frac{\ln x}{\ln b}`, bad: [r`\ln x - \ln b`, r`\frac{\ln b}{\ln x}`, r`\ln(x/b)`] },
    { expr: r`2^{\lg n}`, ok: r`n`, bad: [r`2n`, r`\lg n`, r`n^2`] },
    { expr: r`n^{\lg 3}`, ok: r`3^{\lg n}`, bad: [r`3n`, r`\lg 3n`, r`3^n`] },
    { expr: r`\lg(n!)` + r` \text{ (exactly)}`, ok: r`\sum_{k=1}^{n} \lg k`, bad: [r`n \lg n`, r`\prod_{k=1}^{n}\lg k`, r`\lg n \cdot \lg (n-1)`] },
    { expr: r`\ln x`, ok: r`\lg x \cdot \ln 2`, bad: [r`\lg x / \ln 2`, r`\lg x \cdot \ln 10`, r`\lg x - \ln 2`] },
    { expr: r`\log_{10} 2^{n}`, ok: r`n \log_{10} 2`, bad: [r`(\log_{10} 2)^n`, r`2 \log_{10} n`, r`n / \log_{10} 2`] },
  ];
  const it = rng.pick(items);
  return makeMC(rng, {
    kind: 'log-laws',
    prompt: r`Which expression is equal to $${it.expr}$?`,
    correct: `$${it.ok}$`,
    distractors: it.bad.map((b) => `$${b}$`),
    hint: 'Logs turn products into sums, quotients into differences, and powers into multiples.',
    solution: r`$${it.expr} = ${it.ok}$. The three laws to remember: $\log(xy) = \log x + \log y$, $\log(x/y) = \log x - \log y$, $\log x^c = c\log x$; plus change of base $\log_b x = \log_c x / \log_c b$ and the inverse relation $b^{\log_b x} = x$. Note $x^{\log y} = y^{\log x}$ follows by taking logs of both sides.`,
  });
}

/** Numerical intuition for logs of round numbers. */
export function logEstimate(rng) {
  const variant = rng.pick(['lg10', 'ln2', 'log10of2']);
  const k = rng.int(3, 12);
  if (variant === 'lg10') {
    const ans = k * Math.log2(10);
    return {
      kind: 'log-estimate',
      type: 'decimal',
      prompt: r`Using $\lg 10 \approx 3.3219$, estimate $\lg 10^{${k}}$ (to within $0.1$).`,
      answer: Math.round(ans * 1000) / 1000,
      tolerance: 0.1,
      hint: 'lg(10^k) = k · lg 10.',
      solution: r`$\lg 10^{${k}} = ${k}\lg 10 \approx ${k}\times 3.3219 = ${(k * 3.3219).toFixed(3)}$. Rule of thumb: a number with $d$ decimal digits has about $3.32d$ bits.`,
    };
  }
  if (variant === 'ln2') {
    const ans = k * Math.LN2;
    return {
      kind: 'log-estimate',
      type: 'decimal',
      prompt: r`Using $\ln 2 \approx 0.6931$, estimate $\ln 2^{${k}}$ (to within $0.1$).`,
      answer: Math.round(ans * 1000) / 1000,
      tolerance: 0.1,
      solution: r`$\ln 2^{${k}} = ${k}\ln 2 \approx ${(k * 0.6931).toFixed(3)}$. Converting between $\lg$ and $\ln$ is just multiplication by the constant $\ln 2$, which is why $O(\log n)$ never needs to specify a base.`,
    };
  }
  const ans = k * Math.log10(2);
  return {
    kind: 'log-estimate',
    type: 'decimal',
    prompt: r`Using $\log_{10} 2 \approx 0.30103$, estimate $\log_{10} 2^{${k}}$ (to within $0.1$). Equivalently: how many decimal digits does $2^{${k}}$ have, roughly?`,
    answer: Math.round(ans * 1000) / 1000,
    tolerance: 0.1,
    solution: r`$\log_{10} 2^{${k}} = ${k}\log_{10} 2 \approx ${(k * 0.30103).toFixed(3)}$. The number of decimal digits of $N$ is $\lfloor \log_{10} N \rfloor + 1 = ${Math.floor(ans) + 1}$; indeed $2^{${k}} = ${fmt(2 ** k)}$.`,
  };
}

export const generators = [logExact, bitLength, changeOfBase, exponentRules, logLaws, logEstimate];
