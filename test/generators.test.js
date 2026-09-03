import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatorsByTopic, generateExercise } from '../src/exercises/index.js';
import { checkAnswer, formatAnswer } from '../src/exercises/answers.js';
import { topics } from '../src/content/curriculum.js';
import { Rng } from '../src/lib/rng.js';
import { markdownToHtml } from '../src/ui/markdown.js';
import { lessons } from '../src/content/lessons/index.js';

const bad = /NaN|undefined|\[object|\bnull\b/;

test('every curriculum topic has generators and a lesson', () => {
  for (const t of topics) {
    assert.ok(generatorsByTopic[t.id]?.length >= 4, `topic ${t.id} needs generators`);
    assert.ok(lessons[t.id]?.body?.length > 500, `topic ${t.id} needs a lesson`);
  }
});

test('every generator produces well-formed, self-consistent exercises', () => {
  let count = 0;
  for (const [topic, gens] of Object.entries(generatorsByTopic)) {
    for (const gen of gens) {
      for (let seed = 1; seed <= 60; seed++) {
        const rng = new Rng(seed * 104729 + gen.name.length);
        const ex = gen(rng);
        count++;
        const label = `${topic}/${gen.name}#${seed}`;
        assert.ok(ex.kind && ex.prompt && ex.solution && ex.type, `${label}: missing fields`);
        const text = [ex.prompt, ex.solution, ex.hint ?? '', ...(ex.choices ?? []), ...(ex.items ?? [])].join('\n');
        assert.ok(!bad.test(text), `${label}: bad text ${text.match(bad)?.[0]}`);
        if (ex.type === 'integer') {
          assert.match(ex.answer, /^-?\d+$/, `${label}: integer answer`);
          assert.ok(checkAnswer(ex, ex.answer).correct, `${label}: checker rejects canonical`);
        } else if (ex.type === 'fraction') {
          assert.match(ex.answer, /^-?\d+(\/\d+)?$/, `${label}: fraction answer`);
          assert.ok(checkAnswer(ex, ex.answer).correct, `${label}: checker rejects canonical`);
        } else if (ex.type === 'decimal') {
          assert.ok(Number.isFinite(ex.answer), `${label}: decimal answer`);
          assert.ok(checkAnswer(ex, String(ex.answer)).correct, `${label}: checker rejects canonical`);
        } else if (ex.type === 'mc') {
          assert.ok(ex.choices.length >= 2, `${label}: choices`);
          assert.equal(new Set(ex.choices).size, ex.choices.length, `${label}: duplicate choices`);
          assert.ok(ex.answer >= 0 && ex.answer < ex.choices.length, `${label}: answer index`);
        } else if (ex.type === 'order') {
          assert.equal(ex.answer.length, ex.items.length, `${label}: order answer`);
          assert.ok(checkAnswer(ex, ex.answer).correct, `${label}: checker rejects canonical`);
        } else {
          assert.fail(`${label}: unknown type ${ex.type}`);
        }
        // must render without throwing
        markdownToHtml(ex.prompt);
        markdownToHtml(ex.solution);
        formatAnswer(ex);
      }
    }
  }
  assert.ok(count > 3000);
});

test('generateExercise tags the topic and avoids repeating a kind when possible', () => {
  const rng = new Rng(7);
  let last = null;
  let repeats = 0;
  for (let i = 0; i < 50; i++) {
    const ex = generateExercise('sums', rng, last);
    assert.equal(ex.topic, 'sums');
    if (ex.kind === last) repeats++;
    last = ex.kind;
  }
  assert.ok(repeats <= 2);
});

test('seeded generation is reproducible', () => {
  const a = generateExercise('binomial', new Rng(123));
  const b = generateExercise('binomial', new Rng(123));
  assert.deepEqual(a, b);
});
