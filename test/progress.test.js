import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { resetProgress, recordAttempt, topicStats, masteryLevel, isDue, recentAccuracy, masteryScore, exportJSON, importJSON, markLessonRead, lessonRead } from '../src/state/progress.js';

const DAY = 86400000;

beforeEach(() => resetProgress());

test('fresh topic is new and not due', () => {
  assert.equal(masteryLevel('sums'), 'new');
  assert.equal(isDue('sums'), false);
  assert.equal(recentAccuracy('sums'), null);
  assert.equal(masteryScore('sums'), 0);
});

test('three correct in a row promote the box and schedule a review', () => {
  const t0 = 1_000_000_000_000;
  recordAttempt('sums', true, t0);
  recordAttempt('sums', true, t0);
  let s = recordAttempt('sums', true, t0);
  assert.equal(s.box, 1);
  assert.equal(s.due, t0 + 2 * DAY);
  assert.equal(isDue('sums', t0 + DAY), false);
  assert.equal(isDue('sums', t0 + 3 * DAY), true);
  // another three promote again (the streak window resets after a promotion)
  recordAttempt('sums', true, t0); recordAttempt('sums', true, t0); s = recordAttempt('sums', true, t0);
  assert.equal(s.box, 2);
  assert.equal(s.due, t0 + 4 * DAY);
});

test('a miss demotes and makes the topic due now', () => {
  const t0 = 1_000_000_000_000;
  for (let i = 0; i < 6; i++) recordAttempt('sums', true, t0);
  assert.equal(topicStats('sums').box, 2);
  const s = recordAttempt('sums', false, t0 + 1000);
  assert.equal(s.box, 1);
  assert.equal(isDue('sums', t0 + 1000), true);
  assert.equal(masteryLevel('sums'), 'solid');
});

test('mastery levels', () => {
  const t0 = 1_000_000_000_000;
  recordAttempt('fibonacci', true, t0);
  assert.equal(masteryLevel('fibonacci'), 'learning');
  for (let i = 0; i < 9; i++) recordAttempt('fibonacci', true, t0);
  assert.equal(topicStats('fibonacci').box, 3);
  assert.equal(masteryLevel('fibonacci'), 'mastered');
  assert.ok(masteryScore('fibonacci') > 50);
});

test('export / import round trip and lesson flags', () => {
  markLessonRead('induction');
  recordAttempt('induction', true, 5);
  const json = exportJSON();
  resetProgress();
  assert.equal(lessonRead('induction'), false);
  importJSON(json);
  assert.equal(lessonRead('induction'), true);
  assert.equal(topicStats('induction').attempts, 1);
  assert.throws(() => importJSON('{"nope":1}'));
});
