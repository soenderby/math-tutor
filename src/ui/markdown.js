// A deliberately small Markdown-to-HTML converter that leaves TeX math alone.
// Supported: headings, paragraphs, bullet/numbered lists, blockquotes, bold,
// italics, inline code, fenced code, horizontal rules, pipe tables, links, and
// ":::kind Title" callout blocks (kinds: note, example, taocp, warning, tip).

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function protectMath(src) {
  const stash = [];
  const put = (tex) => {
    stash.push(tex);
    return `\u0001${stash.length - 1}\u0001`;
  };
  let out = src.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => put(`$$${m}$$`));
  out = out.replace(/\$([^$\n]+?)\$/g, (_, m) => put(`$${m}$`));
  return { text: out, stash };
}

function restoreMath(html, stash) {
  return html.replace(/\u0001(\d+)\u0001/g, (_, i) => escapeHtml(stash[Number(i)]));
}

function inline(text) {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}

function table(lines) {
  const rows = lines.map((l) =>
    l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
  );
  const header = rows[0];
  const body = rows.slice(2);
  const th = header.map((c) => `<th>${inline(c)}</th>`).join('');
  const trs = body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

const isBullet = (l) => /^\s*[-*]\s+/.test(l);
const isNumbered = (l) => /^\s*\d+[.)]\s+/.test(l);

function blocks(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // fenced code
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }
    // callout block
    const call = line.match(/^:::(\w+)\s*(.*)$/);
    if (call) {
      const buf = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++;
      const kind = call[1];
      const title = call[2] ? `<div class="callout-title">${inline(call[2])}</div>` : '';
      out.push(`<div class="callout callout-${kind}">${title}${blocks(buf)}</div>`);
      continue;
    }
    // heading
    const hd = line.match(/^(#{1,4})\s+(.*)$/);
    if (hd) {
      const level = hd[1].length + 1; // the page title is the h1
      const text = hd[2];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
    // pipe table
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const buf = [];
      while (i < lines.length && /^\|/.test(lines[i])) buf.push(lines[i++]);
      out.push(table(buf));
      continue;
    }
    // lists (continuation lines are indented by two or more spaces)
    if (isBullet(line) || isNumbered(line)) {
      const ordered = isNumbered(line);
      const items = [];
      while (i < lines.length && (isBullet(lines[i]) || isNumbered(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        if (isBullet(lines[i]) || isNumbered(lines[i])) {
          items.push(lines[i].replace(/^\s*([-*]|\d+[.)])\s+/, ''));
        } else {
          items[items.length - 1] += ' ' + lines[i].trim();
        }
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }
    // blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${blocks(buf)}</blockquote>`);
      continue;
    }
    // paragraph
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|:::|```|>\s?|\|)/.test(lines[i]) &&
      !isBullet(lines[i]) &&
      !isNumbered(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    out.push(`<p>${inline(buf.join('\n'))}</p>`);
  }
  return out.join('\n');
}

export function markdownToHtml(src) {
  const { text, stash } = protectMath(src ?? '');
  const html = blocks(text.split('\n'));
  return restoreMath(html, stash);
}

/** Inline-only conversion (no block wrapping), for prompts and choices. */
export function inlineMarkdown(src) {
  const { text, stash } = protectMath(src ?? '');
  return restoreMath(inline(text), stash);
}
