// Progress tracking in localStorage with a light spaced-repetition scheme.

const KEY = 'taocp-tutor-progress-v1';
const DAY = 24 * 60 * 60 * 1000;

const empty = () => ({ version: 1, topics: {}, lessonsRead: {}, settings: {} });

let cache = null;

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function load() {
  if (cache) return cache;
  const s = storage();
  try {
    const raw = s?.getItem(KEY);
    cache = raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    cache = empty();
  }
  return cache;
}

function save() {
  const s = storage();
  try {
    s?.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota / private mode errors */
  }
}

export function resetProgress() {
  cache = empty();
  save();
}

export function topicStats(id) {
  const t = load().topics[id];
  return t ?? { attempts: 0, correct: 0, history: [], box: 0, due: 0, lastPracticed: 0, streak: 0 };
}

export function markLessonRead(id) {
  load().lessonsRead[id] = Date.now();
  save();
}

export function lessonRead(id) {
  return Boolean(load().lessonsRead[id]);
}

/** Record one answered exercise; returns the updated stats. */
export function recordAttempt(id, correct, now = Date.now()) {
  const state = load();
  const t = state.topics[id] ?? { attempts: 0, correct: 0, history: [], box: 0, due: 0, lastPracticed: 0, streak: 0 };
  t.attempts += 1;
  if (correct) t.correct += 1;
  t.history = [...t.history, correct ? 1 : 0].slice(-20);
  t.lastPracticed = now;
  if (correct) {
    t.streak = (t.streak ?? 0) + 1;
    if (t.streak >= 3) {
      // Three fresh correct answers since the last promotion (or miss).
      t.box = Math.min(5, t.box + 1);
      t.streak = 0;
      t.due = now + 2 ** t.box * DAY;
      t.promotedAt = now;
    } else if (!t.due) {
      t.due = now + DAY;
    }
  } else {
    t.streak = 0;
    t.box = Math.max(0, t.box - 1);
    t.due = now;
  }
  state.topics[id] = t;
  save();
  return t;
}

/** Fraction correct among the last 10 answers (0..1), or null if none. */
export function recentAccuracy(id) {
  const h = topicStats(id).history.slice(-10);
  if (!h.length) return null;
  return h.reduce((a, b) => a + b, 0) / h.length;
}

/** 'new' | 'learning' | 'solid' | 'mastered' */
export function masteryLevel(id) {
  const t = topicStats(id);
  if (t.attempts === 0) return 'new';
  const acc = recentAccuracy(id);
  if (t.box >= 3 && acc >= 0.8) return 'mastered';
  if (t.attempts >= 5 && acc >= 0.7) return 'solid';
  return 'learning';
}

/** Numeric 0..100 score used for progress bars. */
export function masteryScore(id) {
  const t = topicStats(id);
  if (t.attempts === 0) return 0;
  const acc = recentAccuracy(id) ?? 0;
  const volume = Math.min(1, t.attempts / 10);
  const box = t.box / 5;
  return Math.round(100 * (0.5 * acc * volume + 0.5 * box));
}

export function isDue(id, now = Date.now()) {
  const t = topicStats(id);
  return t.attempts > 0 && t.due <= now;
}

export function allTopicStats() {
  return load().topics;
}

export function exportJSON() {
  return JSON.stringify(load(), null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !parsed.topics) throw new Error('not a progress file');
  cache = { ...empty(), ...parsed };
  save();
}
