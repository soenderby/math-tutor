import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gcd, lcm, euclidTrace, extendedGcd, floorDiv, mod, modInverse, powmod, factorial, binom, falling, fib, isPrime, legendre, Fraction, harmonic, harmonicApprox, EULER_GAMMA } from '../src/lib/mathutil.js';

test('gcd / lcm / euclid', () => {
  assert.equal(gcd(1071, 462), 21n);
  assert.equal(gcd(0, 5), 5n);
  assert.equal(gcd(-12, 18), 6n);
  assert.equal(lcm(4, 6), 12n);
  assert.equal(euclidTrace(1071, 462).length, 3);
  const { g, x, y } = extendedGcd(240, 46);
  assert.equal(g, 2n);
  assert.equal(240n * x + 46n * y, 2n);
});

test("Knuth's floor division and mod", () => {
  assert.equal(floorDiv(7, 2), 3n);
  assert.equal(floorDiv(-7, 2), -4n);
  assert.equal(floorDiv(7, -2), -4n);
  assert.equal(mod(7, 3), 1n);
  assert.equal(mod(-7, 3), 2n);
  assert.equal(mod(7, -3), -2n);
  assert.equal(mod(-7, -3), -1n);
  assert.equal(mod(5, 0), 5n);
});

test('modular inverse and powmod', () => {
  assert.equal(modInverse(3, 7), 5n);
  assert.equal(modInverse(2, 4), null);
  assert.equal(powmod(2, 10, 1000), 24n);
  assert.equal(powmod(7, 0, 13), 1n);
});

test('factorial, binomial, falling factorial, fibonacci', () => {
  assert.equal(factorial(0), 1n);
  assert.equal(factorial(10), 3628800n);
  assert.equal(binom(10, 3), 120n);
  assert.equal(binom(5, 7), 0n);
  assert.equal(binom(5, -1), 0n);
  assert.equal(binom(-1, 3), -1n);
  assert.equal(binom(-3, 2), 6n); // (-1)^2 C(4,2)
  assert.equal(falling(7, 3), 210n);
  assert.equal(fib(0), 0n);
  assert.equal(fib(1), 1n);
  assert.equal(fib(20), 6765n);
  assert.equal(fib(50), 12586269025n);
});

test('primes and Legendre', () => {
  assert.equal(isPrime(2), true);
  assert.equal(isPrime(91), false);
  assert.equal(isPrime(97), true);
  assert.equal(legendre(100, 5).total, 24);
  assert.equal(legendre(1000, 5).total, 249);
  assert.equal(legendre(10, 2).total, 8);
});

test('Fraction arithmetic and parsing', () => {
  const a = new Fraction(1n, 2n), b = new Fraction(1n, 3n);
  assert.equal(a.add(b).toString(), '5/6');
  assert.equal(a.sub(b).toString(), '1/6');
  assert.equal(a.mul(b).toString(), '1/6');
  assert.equal(a.div(b).toString(), '3/2');
  assert.equal(new Fraction(6n, -4n).toString(), '-3/2');
  assert.equal(Fraction.parse('3/4').toString(), '3/4');
  assert.equal(Fraction.parse('-6/8').toString(), '-3/4');
  assert.equal(Fraction.parse('0.75').toString(), '3/4');
  assert.equal(Fraction.parse('  1 , 234 ').toString(), '1234');
  assert.equal(Fraction.parse('1/0'), null);
  assert.equal(Fraction.parse('abc'), null);
  assert.equal(new Fraction(-3n, 4n).toTeX(), '-\\frac{3}{4}');
  assert.ok(Fraction.parse('2/4').eq(Fraction.parse('0.5')));
});

test('harmonic numbers', () => {
  assert.equal(harmonic(4).toString(), '25/12');
  assert.equal(harmonic(10).toString(), '7381/2520');
  const h1000 = harmonic(1000).toNumber();
  assert.ok(Math.abs(h1000 - 7.485470860550345) < 1e-9);
  assert.ok(Math.abs(harmonicApprox(1000) - h1000) < 1e-9);
  assert.ok(Math.abs(harmonic(100).toNumber() - Math.log(100) - EULER_GAMMA - 1 / 200) < 1e-4);
});

test('user-typed numbers: decimal commas, thousands separators, mixed numbers', async () => {
  const { normalizeNumeric, fmt, fmtText } = await import('../src/lib/mathutil.js');
  assert.equal(normalizeNumeric('1,5'), '1.5');
  assert.equal(normalizeNumeric('3,14'), '3.14');
  assert.equal(normalizeNumeric('1,234'), '1234');
  assert.equal(normalizeNumeric('1,234,567'), '1234567');
  assert.equal(normalizeNumeric('1 234'), '1234');
  assert.equal(normalizeNumeric('1,234.5'), '1234.5');
  assert.equal(Fraction.parse('1,5').toString(), '3/2');
  assert.equal(Fraction.parse('1 1/2').toString(), '3/2');
  assert.equal(Fraction.parse('-2 3/4').toString(), '-11/4');
  assert.equal(Fraction.parse('1 1/0'), null);
  assert.equal(fmt(1234567n), '1\\,234\\,567');
  assert.equal(fmt(-12345), '-12\\,345');
  assert.equal(fmt(1234), '1234');
  assert.equal(fmtText(1234567), '1 234 567');
});
