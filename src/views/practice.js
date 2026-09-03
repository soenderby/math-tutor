import { h, clear } from '../ui/dom.js';
import { md, mdInline } from '../ui/math.js';
import { topicById, topics } from '../content/curriculum.js';
import { generateExercise } from '../exercises/index.js';
import { checkAnswer, formatAnswer } from '../exercises/answers.js';
import { recordAttempt, isDue, recentAccuracy, topicStats, masteryLevel } from '../state/progress.js';
import { Rng } from '../lib/rng.js';
import { renderSidebar } from '../main.js';

const kindLabels = {
  integer: 'Enter an integer',
  fraction: 'Enter a fraction (like 7/12), an integer, or a decimal',
  decimal: 'Enter a decimal number',
  mc: 'Choose one',
  order: 'Click the items in order, smallest first',
};

/** Weighted choice of a topic for mixed review: due and weak topics first. */
export function pickReviewTopic(rng, lastTopic = null) {
  const weights = topics.map((t) => {
    const s = topicStats(t.id);
    if (s.attempts === 0) return { id: t.id, w: 0 };
    let w = 1;
    if (isDue(t.id)) w += 4;
    const acc = recentAccuracy(t.id) ?? 0;
    w += (1 - acc) * 4;
    if (masteryLevel(t.id) === 'mastered') w *= 0.4;
    if (t.id === lastTopic) w *= 0.3;
    return { id: t.id, w };
  }).filter((x) => x.w > 0);
  if (!weights.length) return null;
  const total = weights.reduce((a, x) => a + x.w, 0);
  let r = rng.float() * total;
  for (const x of weights) { r -= x.w; if (r <= 0) return x.id; }
  return weights[weights.length - 1].id;
}

export function practiceView({ topicId = null, mode = 'topic' } = {}) {
  const rng = new Rng();
  const session = { n: 0, correct: 0, streak: 0, best: 0 };
  let lastKind = null;
  let lastTopic = null;
  const root = h('div', {});

  const head = h('div', { class: 'practice-head' });
  const cardHolder = h('div', {});
  root.append(head, cardHolder);

  function renderHead(ex) {
    clear(head);
    const t = topicById[ex.topic];
    head.append(
      h('div', {},
        h('div', { class: 'eyebrow' }, mode === 'review' ? 'Mixed review' : `Practice · TAOCP ${t.taocp}`),
        h('h1', { style: { marginBottom: '0.2rem' } }, mode === 'review' ? 'Review queue' : t.title),
        h('div', { class: 'small sans' }, h('a', { href: `#/topic/${t.id}` }, `↖ Lesson: ${t.title}`), mode === 'review' ? '' : ''),
      ),
      h('div', { class: 'tally' }, 'This session: ', h('b', {}, session.correct), ' / ', h('b', {}, session.n), ' correct', session.streak >= 3 ? ` · streak ${session.streak} 🔥` : ''),
    );
  }

  function next() {
    let tid = topicId;
    if (mode === 'review') {
      tid = pickReviewTopic(rng, lastTopic);
      if (!tid) {
        clear(cardHolder);
        cardHolder.append(h('div', { class: 'card' }, h('p', { class: 'empty' }, 'Nothing to review yet: practise a few topics first.'), h('a', { class: 'btn', href: '#/' }, 'Back to the path')));
        return;
      }
    }
    const ex = generateExercise(tid, rng, lastKind);
    lastKind = ex.kind;
    lastTopic = tid;
    renderHead(ex);
    clear(cardHolder);
    cardHolder.append(exerciseCard(ex));
  }

  function exerciseCard(ex) {
    let answered = false;
    let hintShown = false;
    const card = h('div', { class: 'card exercise' });
    const kind = h('div', { class: 'kind-label' }, mode === 'review' ? `${topicById[ex.topic].short} · ` : '', ex.kind.replace(/-/g, ' '));
    const prompt = md(ex.prompt, 'div', 'prose prompt');
    const answerArea = h('div', { class: 'answer-area' });
    const feedback = h('div', {});
    const hintBox = h('div', {});
    const buttons = h('div', { class: 'btn-row' });
    card.append(kind, prompt, answerArea, hintBox, feedback, buttons);

    let getInput = () => null;

    function finish(input) {
      if (answered) return;
      const res = checkAnswer(ex, input);
      if (!res.parsed) {
        clear(feedback);
        feedback.append(h('div', { class: 'feedback' }, h('div', { class: 'verdict' }, res.message ?? 'Could not read that answer.')));
        return;
      }
      answered = true;
      session.n++;
      if (res.correct) { session.correct++; session.streak++; session.best = Math.max(session.best, session.streak); } else session.streak = 0;
      recordAttempt(ex.topic, res.correct);
      renderSidebar({ page: 'practice', arg: ex.topic });
      renderHead(ex);
      clear(feedback);
      const fb = h('div', { class: `feedback ${res.correct ? 'ok' : 'bad'}` },
        h('div', { class: 'verdict' }, res.correct ? '✓ Correct.' : '✗ Not quite.'),
        res.correct ? null : h('div', {}, 'The answer is ', mdInline(formatAnswer(ex)), '.'),
        h('div', { class: 'solution' }, md(ex.solution, 'div', 'prose')),
      );
      feedback.append(fb);
      renderButtons();
      lockInputs();
      setTimeout(() => nextBtn.focus(), 0);
    }

    let lockInputs = () => {};
    const nextBtn = h('button', { class: 'btn btn-primary', onClick: () => next() }, 'Next ', h('span', { class: 'kbd' }, 'Enter'));
    const checkBtn = h('button', { class: 'btn btn-primary', onClick: () => finish(getInput()) }, 'Check ', h('span', { class: 'kbd' }, 'Enter'));
    const hintBtn = ex.hint ? h('button', { class: 'btn', onClick: () => { if (hintShown) return; hintShown = true; hintBox.append(h('div', { class: 'hint-box' }, h('b', {}, 'Hint: '), mdInline(ex.hint))); hintBtn.disabled = true; } }, 'Hint') : null;
    const skipBtn = h('button', { class: 'btn', title: 'Counts as a miss' }, 'Show solution');

    function renderButtons() {
      clear(buttons);
      if (answered) buttons.append(nextBtn);
      else buttons.append(ex.type === 'mc' ? null : checkBtn, hintBtn, skipBtn);
    }

    // "Show solution" records a miss and reveals the worked solution.
    skipBtn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      session.n++; session.streak = 0;
      recordAttempt(ex.topic, false);
      renderSidebar({ page: 'practice', arg: ex.topic });
      renderHead(ex);
      clear(feedback);
      feedback.append(h('div', { class: 'feedback bad' },
        h('div', { class: 'verdict' }, 'Solution shown (counted as a miss).'),
        h('div', {}, 'The answer is ', mdInline(formatAnswer(ex)), '.'),
        h('div', { class: 'solution' }, md(ex.solution, 'div', 'prose'))));
      renderButtons();
      lockInputs();
      setTimeout(() => nextBtn.focus(), 0);
    });

    // ---- input widgets
    if (ex.type === 'integer' || ex.type === 'fraction' || ex.type === 'decimal') {
      const input = h('input', { class: 'answer-input', type: 'text', autocomplete: 'off', spellcheck: 'false', inputmode: ex.type === 'integer' ? 'numeric' : 'decimal', 'aria-label': 'Your answer' });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); answered ? next() : finish(input.value); } });
      answerArea.append(input, h('div', { class: 'format-hint' }, kindLabels[ex.type], ex.type === 'decimal' && ex.tolerance ? ` (accepted within ±${ex.tolerance >= 1 ? Math.round(ex.tolerance) : ex.tolerance})` : ''));
      getInput = () => input.value;
      lockInputs = () => { input.disabled = true; };
      setTimeout(() => input.focus(), 0);
    } else if (ex.type === 'mc') {
      const list = h('div', { class: 'choices', role: 'group', 'aria-label': 'Choices' });
      const btns = ex.choices.map((c, i) => {
        const b = h('button', { class: 'choice', onClick: () => { if (answered) return; b.classList.add(i === ex.answer ? 'correct' : 'wrong'); btns[ex.answer].classList.add('correct'); finish(i); } },
          h('span', { class: 'letter' }, String.fromCharCode(65 + i)), mdInline(c, 'span'));
        return b;
      });
      list.append(...btns);
      answerArea.append(h('div', { class: 'format-hint', style: { marginBottom: '0.5rem' } }, kindLabels.mc, ' (or press ', h('span', { class: 'kbd' }, 'A'), '–', h('span', { class: 'kbd' }, String.fromCharCode(64 + ex.choices.length)), ')'), list);
      lockInputs = () => btns.forEach((b) => { b.disabled = true; });
      // keyboard letters
      const keyHandler = (e) => {
        if (!card.isConnected) { window.removeEventListener('keydown', keyHandler); return; }
        if (e.target.tagName === 'INPUT') return;
        if (answered && e.key === 'Enter') { e.preventDefault(); next(); return; }
        const i = e.key.toUpperCase().charCodeAt(0) - 65;
        if (!answered && e.key.length === 1 && i >= 0 && i < btns.length) btns[i].click();
      };
      window.addEventListener('keydown', keyHandler);
    } else if (ex.type === 'order') {
      const picked = [];
      const pool = h('div', { class: 'order-pool' });
      const chosen = h('div', { class: 'order-picked' });
      const itemBtns = ex.items.map((it, i) => h('button', { class: 'order-item', onClick: () => { if (answered || picked.includes(i)) return; picked.push(i); redraw(); } }, mdInline(it, 'span')));
      const resetBtn = h('button', { class: 'btn btn-sm', onClick: () => { if (answered) return; picked.length = 0; redraw(); } }, 'Reset');
      function redraw() {
        clear(pool); clear(chosen);
        itemBtns.forEach((b, i) => { if (!picked.includes(i)) pool.append(b); });
        picked.forEach((i, k) => chosen.append(h('span', { class: 'order-item', style: { cursor: 'default' } }, h('span', { class: 'idx' }, k + 1), mdInline(ex.items[i], 'span'))));
        if (!chosen.children.length) chosen.append(h('span', { class: 'muted small sans' }, 'Your order will appear here'));
        checkBtn.disabled = picked.length !== ex.items.length;
      }
      answerArea.append(h('div', { class: 'order-label' }, 'Available'), pool, h('div', { class: 'order-label' }, 'Your order (slowest → fastest)'), chosen, h('div', { class: 'btn-row' }, resetBtn));
      redraw();
      getInput = () => picked.slice();
      lockInputs = () => { itemBtns.forEach((b) => { b.disabled = true; }); resetBtn.disabled = true; };
      const keyHandler = (e) => {
        if (!card.isConnected) { window.removeEventListener('keydown', keyHandler); return; }
        if (e.key === 'Enter') { e.preventDefault(); if (answered) next(); else if (picked.length === ex.items.length) finish(picked.slice()); }
      };
      window.addEventListener('keydown', keyHandler);
    }

    renderButtons();
    return card;
  }

  next();
  return root;
}
