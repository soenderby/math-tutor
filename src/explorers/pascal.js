import { h, clear } from '../ui/dom.js';
import { md } from '../ui/math.js';
import { binom } from '../lib/mathutil.js';

export function mountPascal(container) {
  let rows = 12;
  let modulus = 0; // 0 = none
  let mode = 'rule';
  let selected = null; // {n, k}

  const rowsInput = h('input', { type: 'range', min: 4, max: 20, value: rows });
  const rowsLabel = h('span', { class: 'mono' }, String(rows));
  const modSelect = h('select', {}, ...[[0, 'plain numbers'], [2, 'colour odd entries (mod 2)'], [3, 'colour entries ≠ 0 mod 3'], [5, 'colour entries ≠ 0 mod 5'], [7, 'colour entries ≠ 0 mod 7']].map(([v, l]) => h('option', { value: v }, l)));
  const modeSelect = h('select', {}, ...[['rule', 'Pascal’s rule (two parents)'], ['hockey', 'Hockey stick (sum down a column)'], ['row', 'Row sum = 2ⁿ'], ['diag', 'Diagonal sum = Fibonacci'], ['symmetry', 'Symmetry C(n,k) = C(n,n−k)']].map(([v, l]) => h('option', { value: v }, l)));
  const controls = h('div', { class: 'controls' },
    h('label', {}, 'Rows: ', rowsInput, rowsLabel),
    h('label', {}, 'Colouring: ', modSelect),
    h('label', {}, 'On click: ', modeSelect),
  );
  const grid = h('div', { class: 'pascal' });
  const readout = h('div', { class: 'readout' }, 'Click any entry.');
  const notes = md(String.raw`
Each entry is $\binom{n}{k}$: row $n$, position $k$ (both counted from $0$). Knuth calls this *Pascal’s triangle*; it is table (4) in §1.2.6.

- **Pascal’s rule**: every entry is the sum of the two above it, $\binom{n}{k} = \binom{n-1}{k} + \binom{n-1}{k-1}$.
- **Hockey stick**: summing a column from the top down to row $n$ gives the entry one row lower and one column to the right, $\sum_{j \le n} \binom{j}{k} = \binom{n+1}{k+1}$.
- **Row sum**: $\sum_k \binom{n}{k} = 2^n$; the *alternating* row sum is $0$.
- **Diagonals**: the “shallow” diagonals sum to Fibonacci numbers, $\sum_k \binom{n-k}{k} = F_{n+1}$.
- **Mod 2** colouring reveals the Sierpiński triangle: $\binom{n}{k}$ is odd exactly when the binary digits of $k$ are a subset of those of $n$ (Lucas’ theorem, §1.2.6 exercise 10–11).
`);
  container.append(controls, grid, readout, notes);

  function cellClass(n, k) {
    const v = binom(n, k);
    const cls = ['pcell'];
    if (modulus && v % BigInt(modulus) !== 0n) cls.push('on');
    if (selected) {
      const { n: sn, k: sk } = selected;
      if (n === sn && k === sk) cls.push('sel');
      if (mode === 'rule' && n === sn - 1 && (k === sk || k === sk - 1)) cls.push('hl');
      if (mode === 'hockey' && k === sk - 1 && n < sn) cls.push('hl');
      if (mode === 'row' && n === sn) cls.push('hl');
      if (mode === 'diag' && n + k === sn + sk && n >= k && n <= sn + sk) cls.push('hl');
      if (mode === 'symmetry' && n === sn && k === sn - sk) cls.push('hl2');
    }
    return cls.join(' ');
  }

  function describe() {
    if (!selected) { readout.textContent = 'Click any entry.'; return; }
    const { n, k } = selected;
    const v = binom(n, k);
    let text = `C(${n}, ${k}) = ${v}`;
    if (mode === 'rule') {
      if (n >= 1) text += `   =  C(${n - 1}, ${k}) + C(${n - 1}, ${k - 1})  =  ${binom(n - 1, k)} + ${binom(n - 1, k - 1)}`;
    } else if (mode === 'hockey') {
      if (k >= 1) {
        const parts = [];
        let s = 0n;
        for (let j = k - 1; j < n; j++) { parts.push(`C(${j}, ${k - 1})`); s += binom(j, k - 1); }
        text += `   =  ${parts.join(' + ')}  =  ${s}`;
      } else text += '   (choose an entry with k ≥ 1 to see a hockey stick)';
    } else if (mode === 'row') {
      let s = 0n; for (let j = 0; j <= n; j++) s += binom(n, j);
      text = `row ${n}: sum = ${s} = 2^${n};  alternating sum = ${n === 0 ? 1 : 0}`;
    } else if (mode === 'diag') {
      const N = n + k;
      let s = 0n; const parts = [];
      for (let j = 0; j <= N / 2; j++) { parts.push(`C(${N - j}, ${j})`); s += binom(N - j, j); }
      text = `shallow diagonal n+k = ${N}: ${parts.join(' + ')} = ${s} = F_${N + 1}`;
    } else if (mode === 'symmetry') {
      text += `   =  C(${n}, ${n - k})  =  ${binom(n, n - k)}`;
    }
    readout.textContent = text;
  }

  function draw() {
    clear(grid);
    for (let n = 0; n <= rows; n++) {
      const row = h('div', { class: 'pascal-row' });
      for (let k = 0; k <= n; k++) {
        const v = binom(n, k);
        const label = v > 99999n ? '…' : v.toString();
        row.append(h('button', { class: cellClass(n, k), title: `C(${n},${k}) = ${v}`, onClick: () => { selected = { n, k }; draw(); describe(); } }, label));
      }
      grid.append(row);
    }
  }

  rowsInput.addEventListener('input', () => { rows = Number(rowsInput.value); rowsLabel.textContent = String(rows); draw(); });
  modSelect.addEventListener('change', () => { modulus = Number(modSelect.value); draw(); });
  modeSelect.addEventListener('change', () => { mode = modeSelect.value; draw(); describe(); });
  draw();
}
