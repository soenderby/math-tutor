// Renders every TeX fragment in the lessons and in thousands of generated
// exercises through the vendored KaTeX in strict mode. This catches unknown
// commands, unbalanced braces, stray Unicode inside math, and JavaScript
// escape accidents such as '\;' collapsing to ';'.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { generatorsByTopic } from '../src/exercises/index.js';
import { formatAnswer } from '../src/exercises/answers.js';
import { lessons } from '../src/content/lessons/index.js';
import { guide } from '../src/content/guide.js';
import { notation } from '../src/content/notation.js';
import { Rng } from '../src/lib/rng.js';

// katex.min.js is a UMD bundle; under "type": "module" it cannot be imported or
// required directly, so evaluate it as CommonJS by hand.
function loadKatex() {
  const src = readFileSync(new URL('../vendor/katex/katex.min.js', import.meta.url), 'utf8');
  const module = { exports: {} };
  new Function('module', 'exports', src)(module, module.exports);
  return module.exports;
}
const katex = loadKatex();

// Keep in sync with src/ui/math.js
const macros = {
  '\\lg': '\\operatorname{lg}',
  '\\floor': '\\left\\lfloor #1 \\right\\rfloor',
  '\\ceil': '\\left\\lceil #1 \\right\\rceil',
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\R': '\\mathbb{R}',
  '\\Q': '\\mathbb{Q}',
};

function mathFragments(src) {
  const out = [];
  const rest = src.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => { out.push({ tex: m, display: true }); return ' '; });
  rest.replace(/\$([^$\n]+?)\$/g, (_, m) => { out.push({ tex: m, display: false }); return ' '; });
  return out;
}

/** Returns a list of problems (empty when everything renders cleanly in strict mode). */
function texProblems(src) {
  const problems = [];
  for (const { tex, display } of mathFragments(src)) {
    try {
      katex.renderToString(tex, {
        displayMode: display,
        throwOnError: true,
        macros: { ...macros },
        strict: (code, msg) => { problems.push(`${code}: ${msg} in "${tex.slice(0, 80)}"`); return 'ignore'; },
      });
    } catch (e) {
      problems.push(`${e.message} in "${tex.slice(0, 80)}"`);
    }
  }
  return problems;
}

test('lesson, guide and notation math renders in strict mode', () => {
  const docs = { guide, notation };
  for (const [id, l] of Object.entries(lessons)) {
    docs[id] = [l.body, ...(l.goals ?? []), ...(l.reading ?? []).map((r) => r.note ?? ''), ...(l.knuthExercises ?? [])].join('\n');
  }
  for (const [name, body] of Object.entries(docs)) {
    const problems = texProblems(body);
    assert.deepEqual(problems, [], `${name}: ${problems[0]}`);
  }
});

test('generated exercise math renders in strict mode', () => {
  for (const [topic, gens] of Object.entries(generatorsByTopic)) {
    for (const gen of gens) {
      for (let seed = 1; seed <= 40; seed++) {
        const rng = new Rng(seed * 7919 + gen.name.length * 31);
        const ex = gen(rng);
        const text = [ex.prompt, ex.solution, ex.hint ?? '', formatAnswer(ex), ...(ex.choices ?? []), ...(ex.items ?? [])].join('\n');
        const problems = texProblems(text);
        assert.deepEqual(problems, [], `${topic}/${gen.name}#${seed}: ${problems[0]}`);
      }
    }
  }
});
