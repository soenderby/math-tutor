import { h } from '../ui/dom.js';
import { explorers, explorerById, topicById } from '../content/curriculum.js';
import { mountPascal } from '../explorers/pascal.js';
import { mountEuclid } from '../explorers/euclid.js';
import { mountHarmonic } from '../explorers/harmonic.js';
import { mountFibonacci } from '../explorers/fibonacci.js';
import { mountGenfunc } from '../explorers/genfunc.js';
import { mountGrowth } from '../explorers/growth.js';

const mounts = { pascal: mountPascal, euclid: mountEuclid, harmonic: mountHarmonic, fibonacci: mountFibonacci, genfunc: mountGenfunc, growth: mountGrowth };

export function explorerIndexView() {
  const grid = h('div', { class: 'grid-2' });
  for (const e of explorers) {
    grid.append(h('a', { class: 'card', href: `#/explore/${e.id}`, style: { display: 'block', color: 'inherit' } },
      h('div', { class: 'eyebrow' }, topicById[e.topic].short),
      h('h3', { style: { marginTop: 0 } }, e.title),
      h('p', { class: 'muted small', style: { marginBottom: 0 } }, e.blurb)));
  }
  return h('div', {}, h('div', { class: 'eyebrow' }, 'Interactive'), h('h1', {}, 'Explorers'), h('p', { class: 'lede' }, 'Small instruments for poking at the mathematical objects in §1.2.'), grid);
}

export function explorerView(id) {
  const e = explorerById[id];
  const t = topicById[e.topic];
  const container = h('div', { class: 'explorer' });
  const root = h('div', {},
    h('div', { class: 'eyebrow' }, `Explorer · goes with ${t.title}`),
    h('h1', {}, e.title),
    h('p', { class: 'lede' }, e.blurb),
    h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: `#/topic/${t.id}` }, `↖ Lesson: ${t.short}`), h('a', { class: 'btn', href: `#/practice/${t.id}` }, '✎ Practise')),
    container,
  );
  // mount after the element is attached so canvases can measure themselves
  setTimeout(() => mounts[id](container), 0);
  return root;
}
