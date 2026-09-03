import { h } from '../ui/dom.js';
import { topics } from '../content/curriculum.js';
import { topicStats, isDue, masteryLevel, recentAccuracy } from '../state/progress.js';

const levelLabel = { new: 'Not started', learning: 'Learning', solid: 'Solid', mastered: 'Mastered' };

function relative(ts) {
  if (!ts) return '–';
  const d = (ts - Date.now()) / 86400000;
  if (d <= 0) return 'now';
  if (d < 1) return 'later today';
  const n = Math.round(d);
  return `in ${n} day${n === 1 ? '' : 's'}`;
}

export function reviewView() {
  const started = topics.filter((t) => topicStats(t.id).attempts > 0);
  const due = started.filter((t) => isDue(t.id));
  const weak = started.filter((t) => !isDue(t.id) && (recentAccuracy(t.id) ?? 1) < 0.7);

  const intro = h('div', {},
    h('div', { class: 'eyebrow' }, 'Spaced review'),
    h('h1', {}, 'Review queue'),
    h('p', { class: 'lede' }, 'Each topic sits in a “box” from 0 to 5. Three correct answers in a row promote it (and double the wait before it comes back); a miss demotes it and makes it due immediately. Mixed review draws mostly from due and weak topics.'),
  );

  if (!started.length) {
    return h('div', {}, intro, h('div', { class: 'card' }, h('p', { class: 'empty' }, 'You have not practised anything yet.'), h('a', { class: 'btn btn-primary', href: `#/topic/${topics[0].id}` }, 'Start with the first topic')));
  }

  const table = h('table', { class: 'sans' },
    h('thead', {}, h('tr', {}, h('th', {}, 'Topic'), h('th', {}, 'Status'), h('th', {}, 'Box'), h('th', {}, 'Recent accuracy'), h('th', {}, 'Next due'), h('th', {}, ''))),
    h('tbody', {}, ...started.map((t) => {
      const s = topicStats(t.id);
      const level = masteryLevel(t.id);
      const acc = recentAccuracy(t.id);
      return h('tr', {},
        h('td', {}, h('a', { href: `#/topic/${t.id}` }, t.title)),
        h('td', {}, h('span', { class: `chip ${level}` }, levelLabel[level])),
        h('td', {}, `${s.box} / 5`),
        h('td', {}, acc === null ? '–' : `${Math.round(acc * 100)}%`),
        h('td', {}, isDue(t.id) ? h('span', { class: 'chip due' }, 'due') : relative(s.due)),
        h('td', {}, h('a', { class: 'btn btn-sm', href: `#/practice/${t.id}` }, 'Practise')),
      );
    })),
  );

  return h('div', {},
    intro,
    h('div', { class: 'btn-row' },
      h('a', { class: 'btn btn-primary', href: '#/review/start' }, `▶ Start mixed review${due.length ? ` (${due.length} due)` : ''}`),
      weak.length ? h('span', { class: 'small muted sans' }, `Weak spots: ${weak.map((t) => t.short).join(', ')}`) : null,
    ),
    h('div', { class: 'table-wrap' }, table),
  );
}
