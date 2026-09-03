import { h } from '../ui/dom.js';
import { md, mdInline } from '../ui/math.js';
import { topicById, topics, explorerById } from '../content/curriculum.js';
import { lessons } from '../content/lessons/index.js';
import { masteryLevel, masteryScore, topicStats, markLessonRead, isDue } from '../state/progress.js';

const levelLabel = { new: 'Not started', learning: 'Learning', solid: 'Solid', mastered: 'Mastered' };

export function topicView(id) {
  const t = topicById[id];
  const lesson = lessons[id];
  markLessonRead(id);
  const level = masteryLevel(id);
  const stats = topicStats(id);
  const idx = topics.findIndex((x) => x.id === id);
  const prev = topics[idx - 1];
  const next = topics[idx + 1];

  const header = h('div', { class: 'lesson-header' },
    h('div', { class: 'eyebrow' }, `Topic ${idx + 1} of ${topics.length} · TAOCP ${t.taocp}`),
    h('h1', {}, t.title),
    h('p', { class: 'lede' }, t.blurb),
    h('div', { class: 'meta' },
      h('span', {}, h('b', {}, 'Knuth: '), `Vol. 1, ${t.taocp}`),
      h('span', {}, h('b', {}, 'Concrete Mathematics: '), t.concrete),
      t.prereqs.length ? h('span', {}, h('b', {}, 'Builds on: '), ...t.prereqs.flatMap((p, i) => [i ? ', ' : '', h('a', { href: `#/topic/${p}` }, topicById[p].short)])) : null,
      h('span', {}, h('span', { class: `chip ${level}` }, levelLabel[level]), isDue(id) ? h('span', { class: 'chip due', style: { marginLeft: '0.3rem' } }, 'due for review') : null, stats.attempts ? ` · ${stats.correct}/${stats.attempts} correct` : ''),
    ),
    h('div', { class: 'btn-row' },
      h('a', { class: 'btn btn-primary', href: `#/practice/${id}` }, '✎ Practise this topic'),
      t.explorer ? h('a', { class: 'btn', href: `#/explore/${t.explorer}` }, `⚙ Explorer: ${explorerById[t.explorer].title}`) : null,
      h('span', { class: `bar ${level}`, style: { width: '140px', marginLeft: 'auto' } }, h('span', { style: { width: `${masteryScore(id)}%` } })),
    ),
  );

  const goals = lesson?.goals?.length
    ? h('div', { class: 'goals' }, h('h3', {}, 'After this lesson you should be able to'), h('ul', {}, ...lesson.goals.map((g) => mdInline(g, 'li'))))
    : null;

  const body = md(lesson?.body ?? '_Lesson coming soon._');

  // table of contents from h2 headings
  const heads = [...body.querySelectorAll('h2')];
  const toc = heads.length > 2 ? h('nav', { class: 'toc' }, ...heads.map((hd) => h('a', { href: `#${location.hash.slice(1)}` , onClick: (e) => { e.preventDefault(); hd.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, hd.textContent))) : null;

  const reading = lesson?.reading?.length
    ? h('div', {}, h('h2', {}, 'Where to read it in the books'), h('ul', { class: 'reading' }, ...lesson.reading.map((r) => h('li', {}, h('b', {}, r.ref), r.note ? [' — ', mdInline(r.note)] : ''))))
    : null;

  const knuthEx = lesson?.knuthExercises?.length
    ? h('div', {}, h('h2', {}, 'Knuth’s own exercises to try'), h('p', { class: 'muted small' }, 'Ratings in brackets are Knuth’s: 00–10 warm-up, 20 takes some thought, 30 is a real problem, M means mathematically oriented.'), h('ul', {}, ...lesson.knuthExercises.map((e) => mdInline(e, 'li'))))
    : null;

  const footer = h('div', { class: 'btn-row', style: { marginTop: '2.5rem', justifyContent: 'space-between' } },
    prev ? h('a', { class: 'btn', href: `#/topic/${prev.id}` }, `← ${prev.short}`) : h('span'),
    h('a', { class: 'btn btn-primary', href: `#/practice/${id}` }, '✎ Practise this topic'),
    next ? h('a', { class: 'btn', href: `#/topic/${next.id}` }, `${next.short} →`) : h('span'),
  );

  return h('article', {}, header, goals, toc, body, reading, knuthEx, footer);
}
