import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, parseInteger, parseNumber, makeMC, makeOrder, formatAnswer } from '../src/exercises/answers.js';
import { Rng } from '../src/lib/rng.js';

test('integer answers accept spacing and reject junk', () => {
  const ex = { type: 'integer', answer: '1024' };
  assert.equal(checkAnswer(ex, '1024').correct, true);
  assert.equal(checkAnswer(ex, ' 1,024 ').correct, true);
  assert.equal(checkAnswer(ex, '+1024').correct, true);
  assert.equal(checkAnswer(ex, '1023').correct, false);
  assert.equal(checkAnswer(ex, '10.5').parsed, false);
  assert.equal(checkAnswer(ex, 'x').parsed, false);
  assert.equal(parseInteger('-7'), -7n);
  assert.equal(parseInteger('1e3'), null);
});

test('fraction answers accept fractions, integers, and exact decimals', () => {
  const ex = { type: 'fraction', answer: '3/4' };
  assert.equal(checkAnswer(ex, '3/4').correct, true);
  assert.equal(checkAnswer(ex, '6/8').correct, true);
  assert.equal(checkAnswer(ex, '0.75').correct, true);
  assert.equal(checkAnswer(ex, '0.7').correct, false);
  assert.equal(checkAnswer(ex, '1/0').parsed, false);
  const whole = { type: 'fraction', answer: '2' };
  assert.equal(checkAnswer(whole, '4/2').correct, true);
  assert.equal(checkAnswer(whole, '2.0').correct, true);
});

test('decimal answers use tolerance and accept fractions', () => {
  const ex = { type: 'decimal', answer: 19.93, tolerance: 0.1 };
  assert.equal(checkAnswer(ex, '19.9').correct, true);
  assert.equal(checkAnswer(ex, '20.1').correct, false);
  assert.equal(checkAnswer(ex, '1993/100').correct, true);
  assert.equal(checkAnswer(ex, '').parsed, false);
  assert.equal(parseNumber('1e3'), 1000);
});

test('multiple choice and ordering', () => {
  const rng = new Rng(42);
  const mc = makeMC(rng, { kind: 'k', prompt: 'p', correct: 'A', distractors: ['B', 'C', 'A', 'B'], solution: 's' });
  assert.equal(mc.choices.length, 3);
  assert.equal(mc.choices[mc.answer], 'A');
  assert.equal(checkAnswer(mc, mc.answer).correct, true);
  assert.equal(checkAnswer(mc, (mc.answer + 1) % 3).correct, false);
  assert.equal(checkAnswer(mc, 99).parsed, false);

  const ord = makeOrder(rng, { kind: 'k', prompt: 'p', ordered: ['a', 'b', 'c', 'd'], solution: 's' });
  assert.equal(ord.items.length, 4);
  // the answer permutation maps back to the ordered list
  assert.deepEqual(ord.answer.map((i) => ord.items[i]), ['a', 'b', 'c', 'd']);
  assert.equal(checkAnswer(ord, ord.answer).correct, true);
  assert.equal(checkAnswer(ord, ord.answer.slice().reverse()).correct, false);
  assert.equal(checkAnswer(ord, [0, 1]).parsed, false);
  assert.ok(formatAnswer(ord).includes('a'));
});

test('formatAnswer renders each type', () => {
  assert.equal(formatAnswer({ type: 'integer', answer: '5' }), '$5$');
  assert.equal(formatAnswer({ type: 'fraction', answer: '-1/2' }), '$-\\frac{1}{2}$');
  assert.equal(formatAnswer({ type: 'mc', choices: ['x', 'y'], answer: 1 }), 'y');
});
