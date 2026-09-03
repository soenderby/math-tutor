import { h } from '../ui/dom.js';
import { topics, explorers } from '../content/curriculum.js';
import { masteryLevel, masteryScore, topicStats, isDue, lessonRead } from '../state/progress.js';

const levelLabel = { new: 'Not started', learning: 'Learning', solid: 'Solid', mastered: 'Mastered' };

/** First topic in curriculum order that is not yet solid/mastered. */
export function recommendedTopic() {
  for (const t of topics) {
    const level = masteryLevel(t.id);
    if (level === 'mastered' || level === 'solid') continue;
    return t;
  }
  return topics[0];
}

export function homeView() {
  const stats = topics.map((t) => topicStats(t.id));
  const attempts = stats.reduce((a, s) => a + s.attempts, 0);
  const correct = stats.reduce((a, s) => a + s.correct, 0);
  const mastered = topics.filter((t) => masteryLevel(t.id) === 'mastered').length;
  const started = topics.filter((t) => topicStats(t.id).attempts > 0 || lessonRead(t.id)).length;
  const due = topics.filter((t) => isDue(t.id));
  const next = recommendedTopic();

  const hero = h('div', { class: 'hero' },
    h('div', { class: 'card hero-card' },
      h('div', { class: 'eyebrow' }, 'The mathematics behind The Art of Computer Programming'),
      h('h1', {}, 'Get your math ready for Knuth.'),
      h('p', { class: 'lede' },
        'A guided path through the “Mathematical Preliminaries” of Volume 1 (§1.2): short lessons that explain each idea the way Knuth uses it, unlimited generated exercises with worked solutions, and interactive explorers. Progress is saved in this browser.'),
      h('div', { class: 'btn-row' },
        h('a', { class: 'btn btn-primary', href: `#/topic/${next.id}` }, attempts ? `Continue: ${next.short}` : `Start with ${next.short}`),
        due.length ? h('a', { class: 'btn', href: '#/review' }, `Review ${due.length} due topic${due.length > 1 ? 's' : ''}`) : h('a', { class: 'btn', href: '#/guide' }, 'How to read TAOCP'),
        h('a', { class: 'btn', href: '#/notation' }, 'Notation cheat sheet'),
      ),
      h('div', { class: 'stats' },
        stat(started, `of ${topics.length} topics started`),
        stat(mastered, 'mastered'),
        stat(attempts, 'exercises answered'),
        stat(attempts ? `${Math.round((100 * correct) / attempts)}%` : '–', 'accuracy'),
      ),
    ),
  );

  const roadmap = h('ol', { class: 'roadmap' });
  topics.forEach((t, i) => {
    const level = masteryLevel(t.id);
    const score = masteryScore(t.id);
    const prereqsDone = t.prereqs.every((p) => masteryLevel(p) !== 'new');
    const li = h('li', { class: prereqsDone ? '' : '' },
      h('span', { class: 'num' }, i + 1),
      h('span', { class: 'title' }, h('a', { href: `#/topic/${t.id}` }, t.title)),
      h('span', { class: 'right' },
        h('span', {}, h('span', { class: `chip ${level}` }, levelLabel[level]), isDue(t.id) ? h('span', { class: 'chip due', style: { marginLeft: '0.3rem' } }, 'due') : null),
        h('span', { class: `bar ${level}` }, h('span', { style: { width: `${score}%` } })),
      ),
      h('span', { class: 'sub' }, `TAOCP ${t.taocp} · ${t.blurb}`, !prereqsDone && t.prereqs.length ? ` (builds on: ${t.prereqs.map((p) => topics.find((x) => x.id === p).short).join(', ')})` : ''),
    );
    roadmap.append(li);
  });

  const explorerGrid = h('div', { class: 'grid-2' });
  for (const e of explorers) {
    explorerGrid.append(h('a', { class: 'card', href: `#/explore/${e.id}`, style: { display: 'block', color: 'inherit' } },
      h('div', { class: 'eyebrow' }, 'Explorer'),
      h('h3', { style: { marginTop: 0 } }, e.title),
      h('p', { class: 'muted small', style: { marginBottom: 0 } }, e.blurb)));
  }

  return h('div', {},
    hero,
    h('h2', {}, 'The path'),
    h('p', { class: 'muted' }, 'Twelve topics in the order Knuth introduces them. Read the lesson, then practise until the topic turns green; come back when the review queue says a topic is due.'),
    roadmap,
    h('h2', {}, 'Explorers'),
    h('p', { class: 'muted' }, 'Play with the objects instead of just reading about them.'),
    explorerGrid,
    h('div', { class: 'footer-note' }, 'Section numbers refer to The Art of Computer Programming, Volume 1, 3rd edition. “Concrete Math” is Concrete Mathematics by Graham, Knuth and Patashnik, the textbook that grew out of §1.2.'),
  );
}

function stat(value, label) {
  return h('div', { class: 'stat' }, h('b', {}, String(value)), h('span', {}, label));
}
