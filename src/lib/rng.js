// Small seeded PRNG (mulberry32) so exercises are reproducible in tests.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  constructor(seed = Date.now()) {
    this.next = mulberry32(seed);
  }
  /** Uniform float in [0, 1). */
  float() {
    return this.next();
  }
  /** Uniform integer in [lo, hi] inclusive. */
  int(lo, hi) {
    if (hi < lo) [lo, hi] = [hi, lo];
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }
  /** Integer in [lo, hi] excluding the given values. */
  intExcept(lo, hi, excluded) {
    const ex = new Set(Array.isArray(excluded) ? excluded : [excluded]);
    for (let i = 0; i < 1000; i++) {
      const v = this.int(lo, hi);
      if (!ex.has(v)) return v;
    }
    throw new Error('intExcept: no value available');
  }
  chance(p) {
    return this.next() < p;
  }
  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }
  /** Pick k distinct elements. */
  sample(arr, k) {
    return this.shuffle(arr).slice(0, k);
  }
  /** Returns a shuffled copy (Fisher–Yates). */
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
