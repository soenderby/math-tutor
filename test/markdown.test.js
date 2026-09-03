import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markdownToHtml, inlineMarkdown } from '../src/ui/markdown.js';
import { lessons } from '../src/content/lessons/index.js';
import { guide } from '../src/content/guide.js';
import { notation } from '../src/content/notation.js';

test('math is left untouched, including underscores and asterisks', () => {
  const html = markdownToHtml('Sum $\\sum_{k=1}^n a_k * b_k$ and **bold**.');
  assert.ok(html.includes('$\\sum_{k=1}^n a_k * b_k$'));
  assert.ok(html.includes('<strong>bold</strong>'));
  assert.ok(!html.includes('<em>'));
});

test('display math survives blank-line-free paragraphs', () => {
  const html = markdownToHtml('Before\n$$x^2 + y_1$$\nAfter');
  assert.ok(html.includes('$$x^2 + y_1$$'));
});

test('html in text is escaped, math with < and & is preserved as text', () => {
  const html = markdownToHtml('a <b> tag and $x < y \\& z$');
  assert.ok(html.includes('&lt;b&gt;'));
  assert.ok(html.includes('$x &lt; y \\&amp; z$'));
});

test('block elements', () => {
  const html = markdownToHtml('# Title\n\n- one\n- two\n\n1. first\n2. second\n\n> quoted\n\n:::tip Hey\nInside\n:::\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```\ncode < here\n```');
  assert.ok(html.includes('<h2 id="title">Title</h2>'));
  assert.ok(html.includes('<ul><li>one</li><li>two</li></ul>'));
  assert.ok(html.includes('<ol><li>first</li><li>second</li></ol>'));
  assert.ok(html.includes('<blockquote><p>quoted</p></blockquote>'));
  assert.ok(html.includes('callout-tip'));
  assert.ok(html.includes('<th>a</th>'));
  assert.ok(html.includes('<pre><code>code &lt; here</code></pre>'));
});

test('inline conversion', () => {
  assert.equal(inlineMarkdown('a `b` $c_1$'), 'a <code>b</code> $c_1$');
  assert.ok(inlineMarkdown('[link](https://example.com)').includes('href="https://example.com"'));
});

test('all lesson content renders and has balanced math delimiters', () => {
  const docs = { guide, notation, ...Object.fromEntries(Object.entries(lessons).map(([k, v]) => [k, v.body])) };
  for (const [name, body] of Object.entries(docs)) {
    const html = markdownToHtml(body);
    assert.ok(html.length > 500, `${name} renders`);
    // every $ should have been consumed by a math span (odd counts indicate a stray dollar)
    const dollars = (body.match(/\$/g) ?? []).length;
    assert.equal(dollars % 2, 0, `${name}: unbalanced $ delimiters`);
    assert.ok(!/\bundefined\b/.test(html), `${name}: contains undefined`);
  }
});
