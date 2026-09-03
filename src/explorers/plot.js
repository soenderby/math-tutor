// Shared canvas helpers for the explorers (theme aware, HiDPI aware).

export function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export const palette = () => ({
  ink: cssVar('--ink', '#222'),
  ink2: cssVar('--ink-2', '#555'),
  ink3: cssVar('--ink-3', '#888'),
  rule: cssVar('--rule', '#ddd'),
  accent: cssVar('--accent', '#8b2e2e'),
  blue: cssVar('--blue', '#2f5d8a'),
  green: cssVar('--green', '#3f7a4a'),
  amber: cssVar('--amber', '#a5731c'),
  paper: cssVar('--paper', '#fff'),
});

export const seriesColors = ['#2f5d8a', '#8b2e2e', '#3f7a4a', '#a5731c', '#6b4fa0', '#1f8a8a', '#b5533c', '#4d4d4d'];

/** Create a canvas sized to the container width (max 820) with HiDPI scaling. */
export function makeCanvas(container, height = 420) {
  const canvas = document.createElement('canvas');
  canvas.className = 'plot';
  const width = Math.min(820, Math.max(320, container.clientWidth || 820));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { canvas, ctx, width, height };
}

/**
 * Simple 2D plot frame. xs: [xmin, xmax]; ys: [ymin, ymax]; yLog: use log10 scale.
 * Returns { toX, toY, ctx } and draws axes + grid.
 */
export function frame(ctx, width, height, { xs, ys, yLog = false, xLabel = 'n', yLabel = '', pad = { l: 56, r: 16, t: 16, b: 40 } }) {
  const p = palette();
  const [x0, x1] = xs;
  const [y0raw, y1raw] = ys;
  const ty = (y) => (yLog ? Math.log10(y) : y);
  const y0 = ty(y0raw), y1 = ty(y1raw);
  const W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const toX = (x) => pad.l + ((x - x0) / (x1 - x0)) * W;
  const toY = (y) => pad.t + H - ((ty(y) - y0) / (y1 - y0)) * H;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = p.ink2;
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 1;

  // y grid
  const yTicks = yLog ? logTicks(y0raw, y1raw) : linTicks(y0raw, y1raw, 6);
  for (const t of yTicks) {
    const y = toY(t);
    if (y < pad.t - 1 || y > pad.t + H + 1) continue;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + W, y); ctx.stroke();
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(fmtTick(t), pad.l - 6, y);
  }
  // x ticks
  const xTicks = linTicks(x0, x1, 8);
  for (const t of xTicks) {
    const x = toX(t);
    ctx.beginPath(); ctx.moveTo(x, pad.t + H); ctx.lineTo(x, pad.t + H + 4); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(fmtTick(t), x, pad.t + H + 7);
  }
  // axes
  ctx.strokeStyle = p.ink3;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + H); ctx.lineTo(pad.l + W, pad.t + H); ctx.stroke();
  ctx.fillStyle = p.ink2;
  ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText(xLabel, pad.l + W, pad.t + H - 4);
  if (yLabel) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(yLabel, pad.l + 6, pad.t + 2); }
  return { toX, toY, W, H, pad };
}

export function drawCurve(ctx, pts, color, { width = 2, dash = [] } = {}) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
  ctx.beginPath();
  let started = false;
  for (const [x, y] of pts) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) { started = false; continue; }
    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawDots(ctx, pts, color, r = 2.5) {
  ctx.save();
  ctx.fillStyle = color;
  for (const [x, y] of pts) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function linTicks(a, b, n) {
  const span = b - a;
  const raw = span / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => span / s <= n) ?? mag * 10;
  const out = [];
  for (let t = Math.ceil(a / step) * step; t <= b + 1e-9; t += step) out.push(Number(t.toFixed(10)));
  return out;
}

function logTicks(a, b) {
  const lo = Math.floor(Math.log10(Math.max(a, 1e-300)));
  const hi = Math.ceil(Math.log10(b));
  const step = Math.max(1, Math.ceil((hi - lo) / 10));
  const out = [];
  for (let e = lo; e <= hi; e += step) out.push(10 ** e);
  return out;
}

export function fmtTick(t) {
  if (Math.abs(t) >= 1e6 || (Math.abs(t) < 1e-3 && t !== 0)) {
    const e = Math.floor(Math.log10(Math.abs(t)));
    const m = t / 10 ** e;
    return m === 1 ? `10^${e}` : `${m.toFixed(1)}e${e}`;
  }
  return Number.isInteger(t) ? String(t) : t.toPrecision(3);
}

export function sci(x) {
  if (!Number.isFinite(x)) return '∞';
  if (Math.abs(x) < 1e6) return Number.isInteger(x) ? x.toLocaleString('en-US') : x.toPrecision(5);
  return x.toExponential(3);
}
