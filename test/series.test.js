import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seriesDiv, seriesMul, binomialSeries, parsePolynomial, polyToTeX } from '../src/lib/series.js';
import { parseFactored } from '../src/explorers/genfunc.js';
import { Fraction } from '../src/lib/mathutil.js';

const strs = (arr) => arr.map((c) => c.toString());

test('series division reproduces Fibonacci and geometric coefficients', () => {
  assert.deepEqual(strs(seriesDiv([0, 1], [1, -1, -1], 8)), ['0', '1', '1', '2', '3', '5', '8', '13', '21']);
  assert.deepEqual(strs(seriesDiv([1], [1, -2], 5)), ['1', '2', '4', '8', '16', '32']);
  assert.deepEqual(strs(seriesDiv([1], [1, -2, 1], 4)), ['1', '2', '3', '4', '5']);
  assert.throws(() => seriesDiv([1], [0, 1], 3));
});

test('series multiplication and binomial series', () => {
  assert.deepEqual(strs(seriesMul([1, 1], [1, -1], 2)), ['1', '0', '-1']);
  assert.deepEqual(strs(binomialSeries('1/2', 3)), ['1', '1/2', '-1/8', '1/16']);
  assert.deepEqual(strs(binomialSeries(-2, 3)), ['1', '-2', '3', '-4']);
});

test('polynomial parsing and printing', () => {
  assert.deepEqual(strs(parsePolynomial('1 - z - z^2')), ['1', '-1', '-1']);
  assert.deepEqual(strs(parsePolynomial('2z^3 + 1/2')), ['1/2', '0', '0', '2']);
  assert.deepEqual(strs(parsePolynomial('-z')), ['0', '-1']);
  assert.equal(parsePolynomial('1 +'), null);
  assert.equal(parsePolynomial('z^'), null);
  assert.equal(polyToTeX([1, -1, -1]), '1 - z - z^{2}');
  assert.equal(polyToTeX([0, new Fraction(1n, 2n)]), '\\frac{1}{2}z');
});

test('factored input', () => {
  assert.deepEqual(strs(parseFactored('(1 - z)(1 - 2z)')), ['1', '-3', '2']);
  assert.deepEqual(strs(parseFactored('(1 - z)^3')), ['1', '-3', '3', '-1']);
  assert.deepEqual(strs(parseFactored('1 - z')), ['1', '-1']);
  assert.deepEqual(strs(parseFactored('2(1 + z)')), ['2', '2']);
  assert.equal(parseFactored('(1 - z'), null);
});
