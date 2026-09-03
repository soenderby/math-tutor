// Exact integer and rational arithmetic helpers (BigInt based) plus a few
// floating-point conveniences used by lessons, exercises and explorers.

export const B = (x) => (typeof x === 'bigint' ? x : BigInt(x));

export function gcd(a, b) {
  a = B(a); b = B(b);
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function lcm(a, b) {
  a = B(a); b = B(b);
  if (a === 0n || b === 0n) return 0n;
  const r = (a / gcd(a, b)) * b;
  return r < 0n ? -r : r;
}

/** Steps of Euclid's algorithm: [{a, b, q, r}] until r = 0. */
export function euclidTrace(a, b) {
  a = B(a); b = B(b);
  const steps = [];
  while (b !== 0n) {
    const q = a / b;
    const r = a % b;
    steps.push({ a, b, q, r });
    [a, b] = [b, r];
  }
  return steps;
}

/** Extended Euclid: returns {g, x, y} with a*x + b*y = g = gcd(a,b). */
export function extendedGcd(a, b) {
  a = B(a); b = B(b);
  let [oldR, r] = [a, b];
  let [oldS, s] = [1n, 0n];
  let [oldT, t] = [0n, 1n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
  }
  return { g: oldR, x: oldS, y: oldT };
}

/** Knuth's floor division: floor(a / b) for integers, b != 0. */
export function floorDiv(a, b) {
  a = B(a); b = B(b);
  let q = a / b;
  if ((a % b !== 0n) && ((a < 0n) !== (b < 0n))) q -= 1n;
  return q;
}

/** Knuth's mod: x mod y = x - y*floor(x/y); x mod 0 = x. */
export function mod(x, y) {
  x = B(x); y = B(y);
  if (y === 0n) return x;
  return x - y * floorDiv(x, y);
}

export function modInverse(a, m) {
  const { g, x } = extendedGcd(mod(a, m), m);
  if (g !== 1n) return null;
  return mod(x, m);
}

export function powmod(base, exp, m) {
  base = mod(base, m); exp = B(exp); m = B(m);
  let result = 1n;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % m;
    base = (base * base) % m;
    exp >>= 1n;
  }
  return result;
}

export function factorial(n) {
  let r = 1n;
  for (let i = 2n; i <= B(n); i++) r *= i;
  return r;
}

/** Binomial coefficient for integer n (may be negative) and integer k. */
export function binom(n, k) {
  n = B(n); k = B(k);
  if (k < 0n) return 0n;
  if (n >= 0n && k > n) return 0n;
  let r = 1n;
  for (let i = 1n; i <= k; i++) {
    r = (r * (n - k + i)) / i;
  }
  return r;
}

/** Falling factorial n^{\underline{k}} = n(n-1)...(n-k+1). */
export function falling(n, k) {
  n = B(n); k = B(k);
  let r = 1n;
  for (let i = 0n; i < k; i++) r *= n - i;
  return r;
}

export function fib(n) {
  n = Number(n);
  if (n === 0) return 0n;
  let a = 0n, b = 1n;
  for (let i = 1; i < n; i++) [a, b] = [b, a + b];
  return b;
}

export function isPrime(n) {
  n = Number(n);
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

export function primesUpTo(n) {
  const out = [];
  for (let i = 2; i <= n; i++) if (isPrime(i)) out.push(i);
  return out;
}

/** Exponent of prime p in n! (Legendre's formula). Returns {total, terms}. */
export function legendre(n, p) {
  n = Number(n); p = Number(p);
  const terms = [];
  let total = 0;
  for (let q = p; q <= n; q *= p) {
    const t = Math.floor(n / q);
    terms.push({ q, t });
    total += t;
  }
  return { total, terms };
}

export function primeFactors(n) {
  n = Number(n);
  const out = [];
  for (let p = 2; p * p <= n; p++) {
    while (n % p === 0) { out.push(p); n /= p; }
  }
  if (n > 1) out.push(n);
  return out;
}

// ---------------------------------------------------------------- Fractions

export class Fraction {
  constructor(n, d = 1n) {
    n = B(n); d = B(d);
    if (d === 0n) throw new Error('zero denominator');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d);
    this.n = g === 0n ? n : n / g;
    this.d = g === 0n ? d : d / g;
  }
  static from(x) {
    if (x instanceof Fraction) return x;
    if (typeof x === 'number') {
      if (Number.isInteger(x)) return new Fraction(B(x), 1n);
      return Fraction.parse(String(x));
    }
    if (typeof x === 'bigint') return new Fraction(x, 1n);
    if (typeof x === 'string') return Fraction.parse(x);
    if (x && x.n !== undefined) return new Fraction(x.n, x.d ?? 1n);
    throw new Error('cannot convert to Fraction');
  }
  /** Parses "a/b", "-a/b", "a", "1.25", " 3 / 4 ". Returns null on failure. */
  static parse(str) {
    if (typeof str !== 'string') return null;
    const s = str.replace(/[\s,_]/g, '');
    if (!s) return null;
    let m = s.match(/^([+-]?\d+)\/([+-]?\d+)$/);
    if (m) {
      if (BigInt(m[2]) === 0n) return null;
      return new Fraction(BigInt(m[1]), BigInt(m[2]));
    }
    m = s.match(/^([+-]?)(\d*)\.(\d+)$/);
    if (m) {
      const sign = m[1] === '-' ? -1n : 1n;
      const whole = m[2] || '0';
      const frac = m[3];
      const d = 10n ** BigInt(frac.length);
      return new Fraction(sign * (BigInt(whole) * d + BigInt(frac)), d);
    }
    m = s.match(/^([+-]?\d+)$/);
    if (m) return new Fraction(BigInt(m[1]), 1n);
    return null;
  }
  add(o) { o = Fraction.from(o); return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Fraction.from(o); return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Fraction.from(o); return new Fraction(this.n * o.n, this.d * o.d); }
  div(o) { o = Fraction.from(o); return new Fraction(this.n * o.d, this.d * o.n); }
  neg() { return new Fraction(-this.n, this.d); }
  eq(o) { o = Fraction.from(o); return this.n === o.n && this.d === o.d; }
  isInteger() { return this.d === 1n; }
  toNumber() {
    const LIMIT = 2n ** 53n;
    const abs = (x) => (x < 0n ? -x : x);
    if (abs(this.n) < LIMIT && abs(this.d) < LIMIT) return Number(this.n) / Number(this.d);
    // Huge numerator/denominator (e.g. H_1000): scale before converting.
    const scale = 10n ** 18n;
    return Number((this.n * scale) / this.d) / 1e18;
  }
  toString() { return this.d === 1n ? this.n.toString() : `${this.n}/${this.d}`; }
  /** LaTeX rendering, e.g. \frac{3}{4} or -\frac{3}{4}. */
  toTeX() {
    if (this.d === 1n) return this.n.toString();
    const sign = this.n < 0n ? '-' : '';
    const num = this.n < 0n ? -this.n : this.n;
    return `${sign}\\frac{${num}}{${this.d}}`;
  }
}

export const F = (n, d = 1n) => new Fraction(n, d);

/** Harmonic number H_n as an exact Fraction. */
export function harmonic(n) {
  let h = new Fraction(0n);
  for (let k = 1n; k <= B(n); k++) h = h.add(new Fraction(1n, k));
  return h;
}

export const EULER_GAMMA = 0.5772156649015329;
export const PHI = (1 + Math.sqrt(5)) / 2;

export function harmonicApprox(n) {
  // ln n + gamma + 1/(2n) - 1/(12 n^2)
  return Math.log(n) + EULER_GAMMA + 1 / (2 * n) - 1 / (12 * n * n);
}

export function lg(x) { return Math.log2(x); }

/** Format a BigInt or number with thin-space thousands grouping for display. */
export function fmt(x) {
  const s = x.toString();
  const neg = s.startsWith('-');
  const digits = neg ? s.slice(1) : s;
  if (digits.length <= 4) return s;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '-' : '') + grouped;
}

export function round(x, places = 3) {
  const p = 10 ** places;
  return Math.round(x * p) / p;
}

/** Convert a Number to a superscript-free TeX with fixed decimals. */
export function texNum(x, places = 3) {
  return round(x, places).toString();
}
