import { h } from '../ui/dom.js';
import { md } from '../ui/math.js';
import { guide } from '../content/guide.js';
import { notation } from '../content/notation.js';

export function guideView() {
  return h('article', {},
    h('div', { class: 'eyebrow' }, 'Before you open the book'),
    h('h1', {}, 'How to read The Art of Computer Programming'),
    md(guide));
}

export function notationView() {
  return h('article', {},
    h('div', { class: 'eyebrow' }, 'Reference'),
    h('h1', {}, 'Knuth’s notation, on one page'),
    md(notation));
}
