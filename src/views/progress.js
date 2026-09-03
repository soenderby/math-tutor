import { h } from '../ui/dom.js';
import { topics } from '../content/curriculum.js';
import { topicStats, masteryLevel, masteryScore, resetProgress, exportJSON, importJSON, lessonRead } from '../state/progress.js';

const levelLabel = { new: 'Not started', learning: 'Learning', solid: 'Solid', mastered: 'Mastered' };

export function progressView() {
  const rows = topics.map((t) => {
    const s = topicStats(t.id);
    const level = masteryLevel(t.id);
    return h('tr', {},
      h('td', {}, h('a', { href: `#/topic/${t.id}` }, t.title)),
      h('td', {}, lessonRead(t.id) ? '✓' : '–'),
      h('td', {}, s.attempts),
      h('td', {}, s.attempts ? `${Math.round((100 * s.correct) / s.attempts)}%` : '–'),
      h('td', {}, s.history.slice(-10).map((x) => (x ? '●' : '○')).join('') || '–'),
      h('td', {}, `${s.box}`),
      h('td', {}, h('span', { class: `chip ${level}` }, levelLabel[level]), ' ', h('span', { class: 'small muted' }, `${masteryScore(t.id)}`)),
    );
  });

  const io = h('textarea', { class: 'io', placeholder: 'Paste a previously exported progress file here to import it.' });
  const msg = h('div', { class: 'small sans muted', style: { marginTop: '0.4rem' } });

  return h('div', {},
    h('div', { class: 'eyebrow' }, 'Your data'),
    h('h1', {}, 'Progress'),
    h('p', { class: 'lede' }, 'Everything is stored in this browser’s localStorage. Export it to move to another machine.'),
    h('div', { class: 'table-wrap' }, h('table', { class: 'sans' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Topic'), h('th', {}, 'Lesson opened'), h('th', {}, 'Attempts'), h('th', {}, 'Accuracy'), h('th', {}, 'Last 10'), h('th', {}, 'Box'), h('th', {}, 'Status / score'))),
      h('tbody', {}, ...rows))),
    h('h2', {}, 'How the status is computed'),
    h('ul', { class: 'prose' },
      h('li', {}, h('b', {}, 'Learning'), ': any attempts at all.'),
      h('li', {}, h('b', {}, 'Solid'), ': at least 5 attempts and ≥ 70% of the last 10 correct.'),
      h('li', {}, h('b', {}, 'Mastered'), ': box 3 or higher (three promotions) and ≥ 80% of the last 10 correct.'),
      h('li', {}, 'The score bar blends recent accuracy, volume, and box level.'),
    ),
    h('h2', {}, 'Export / import'),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onClick: () => { io.value = exportJSON(); io.select(); msg.textContent = 'Exported. Copy the text above and save it somewhere.'; } }, 'Export to text'),
      h('button', { class: 'btn', onClick: () => { try { importJSON(io.value); msg.textContent = 'Imported. Reloading…'; setTimeout(() => location.reload(), 400); } catch (e) { msg.textContent = `Could not import: ${e.message}`; } } }, 'Import from text'),
      h('button', { class: 'btn', style: { marginLeft: 'auto', color: 'var(--accent)' }, onClick: () => { if (confirm('Reset all progress? This cannot be undone.')) { resetProgress(); location.reload(); } } }, 'Reset all progress'),
    ),
    io, msg,
  );
}
