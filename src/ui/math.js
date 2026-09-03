// KaTeX bridge. KaTeX is vendored under vendor/katex and loaded in index.html;
// if it failed to load, formulas stay as readable TeX source.

import { markdownToHtml, inlineMarkdown } from './markdown.js';

export function typeset(el) {
  const render = globalThis.renderMathInElement;
  if (!render) return;
  try {
    render(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
      strict: false,
      trust: false,
      macros: {
        '\\lg': '\\operatorname{lg}',
        '\\floor': '\\left\\lfloor #1 \\right\\rfloor',
        '\\ceil': '\\left\\lceil #1 \\right\\rceil',
        '\\N': '\\mathbb{N}',
        '\\Z': '\\mathbb{Z}',
        '\\R': '\\mathbb{R}',
        '\\Q': '\\mathbb{Q}',
      },
    });
  } catch (e) {
    console.warn('KaTeX render failed', e);
  }
}

/** Create an element from markdown (with math) and typeset it. */
export function md(src, tag = 'div', className = 'prose') {
  const el = document.createElement(tag);
  el.className = className;
  el.innerHTML = markdownToHtml(src);
  typeset(el);
  return el;
}

/** Inline markdown in a span (or another tag). */
export function mdInline(src, tag = 'span', className = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.innerHTML = inlineMarkdown(src);
  typeset(el);
  return el;
}
