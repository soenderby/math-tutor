// App entry: hash router + shell rendering.
import { h, clear } from './ui/dom.js';
import { topics, topicById, explorers, explorerById } from './content/curriculum.js';
import { masteryLevel, isDue } from './state/progress.js';
import { homeView } from './views/home.js';
import { topicView } from './views/topic.js';
import { practiceView } from './views/practice.js';
import { reviewView } from './views/review.js';
import { explorerView, explorerIndexView } from './views/explorer.js';
import { guideView, notationView } from './views/static.js';
import { progressView } from './views/progress.js';

const main = document.getElementById('main');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');

menuBtn.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);
  return { page: parts[0] || 'home', arg: parts[1] ? decodeURIComponent(parts[1]) : null, parts };
}

export function renderSidebar(route) {
  clear(sidebar);
  const list = h('ul', { class: 'side-list' });
  topics.forEach((t, i) => {
    const level = masteryLevel(t.id);
    const active = (route.page === 'topic' || route.page === 'practice') && route.arg === t.id;
    list.append(
      h('li', {}, h('a', { href: `#/topic/${t.id}`, class: active ? 'active' : '' },
        h('span', { class: 'side-num' }, i + 1),
        h('span', {}, t.short),
        h('span', { class: `dot ${level} ${isDue(t.id) ? 'due' : ''}`, title: `${level}${isDue(t.id) ? ', due for review' : ''}` })
      ))
    );
  });
  const tools = h('ul', { class: 'side-list' },
    h('li', {}, h('a', { href: '#/review', class: route.page === 'review' ? 'active' : '' }, '↻ Review queue')),
    h('li', {}, h('a', { href: '#/progress', class: route.page === 'progress' ? 'active' : '' }, '▤ Progress')),
    h('li', {}, h('a', { href: '#/notation', class: route.page === 'notation' ? 'active' : '' }, '∑ Notation sheet')),
    h('li', {}, h('a', { href: '#/guide', class: route.page === 'guide' ? 'active' : '' }, '☞ Reading guide')),
  );
  const ex = h('ul', { class: 'side-list' });
  for (const e of explorers) {
    ex.append(h('li', {}, h('a', { href: `#/explore/${e.id}`, class: route.page === 'explore' && route.arg === e.id ? 'active' : '' }, e.title)));
  }
  sidebar.append(h('h2', {}, 'Curriculum'), list, h('h2', {}, 'Tools'), tools, h('h2', {}, 'Explorers'), ex);
}

function render() {
  const route = parseRoute();
  sidebar.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  renderSidebar(route);
  clear(main);
  let view;
  try {
    switch (route.page) {
      case 'home': view = homeView(); break;
      case 'topic': view = topicById[route.arg] ? topicView(route.arg) : notFound(); break;
      case 'practice': view = topicById[route.arg] ? practiceView({ topicId: route.arg }) : notFound(); break;
      case 'review': view = route.arg === 'start' ? practiceView({ mode: 'review' }) : reviewView(); break;
      case 'explore': view = route.arg ? (explorerById[route.arg] ? explorerView(route.arg) : notFound()) : explorerIndexView(); break;
      case 'guide': view = guideView(); break;
      case 'notation': view = notationView(); break;
      case 'progress': view = progressView(); break;
      default: view = notFound();
    }
  } catch (err) {
    console.error(err);
    view = h('div', {}, h('h1', {}, 'Something went wrong'), h('pre', {}, String(err?.stack ?? err)));
  }
  view.classList?.add('fade-in');
  main.append(view);
  window.scrollTo({ top: 0 });
  document.title = pageTitle(route);
}

function pageTitle(route) {
  const base = 'TAOCP Math Tutor';
  if (route.page === 'topic' && topicById[route.arg]) return `${topicById[route.arg].title} · ${base}`;
  if (route.page === 'practice' && topicById[route.arg]) return `Practice: ${topicById[route.arg].short} · ${base}`;
  if (route.page === 'explore' && explorerById[route.arg]) return `${explorerById[route.arg].title} · ${base}`;
  const names = { review: 'Review', guide: 'Reading guide', notation: 'Notation', progress: 'Progress', explore: 'Explorers' };
  return names[route.page] ? `${names[route.page]} · ${base}` : base;
}

function notFound() {
  return h('div', {}, h('h1', {}, 'Not found'), h('p', {}, 'That page does not exist. ', h('a', { href: '#/' }, 'Back to the start.')));
}

window.addEventListener('hashchange', render);
// KaTeX is loaded with `defer` ahead of this module in index.html, so it is
// always available by the time this runs.
render();
