// Answer normalisation and checking for every exercise type.
//
// Exercise shape:
//   { kind, prompt, type, answer, choices?, items?, tolerance?, solution, hint? }
//   type 'integer'  -> answer: decimal string (BigInt-safe)
//   type 'fraction' -> answer: "a/b" or "a" string (normalised)
//   type 'decimal'  -> answer: number, tolerance: number (absolute)
//   type 'mc'       -> answer: index into choices
//   type 'order'    -> items: string[], answer: number[] (indices in correct order)

import { Fraction, normalizeNumeric } from '../lib/mathutil.js';

export function parseInteger(input) {
  if (typeof input !== 'string') return null;
  const s = normalizeNumeric(input).replace(/^\+/, '');
  if (!/^-?\d+$/.test(s)) return null;
  return BigInt(s);
}

export function parseNumber(input) {
  if (typeof input !== 'string') return null;
  const s = normalizeNumeric(input);
  const f = Fraction.parse(s);
  if (f) return f.toNumber();
  if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return Number(s);
  return null;
}

/**
 * Returns { correct: boolean, parsed: boolean, message?: string }.
 * `parsed` is false when the input could not be interpreted at all.
 */
export function checkAnswer(exercise, input) {
  switch (exercise.type) {
    case 'integer': {
      const v = parseInteger(input);
      if (v === null) return { correct: false, parsed: false, message: 'Enter an integer (e.g. 42 or -7). A comma followed by one or two digits is read as a decimal point.' };
      return { correct: v === BigInt(exercise.answer), parsed: true };
    }
    case 'fraction': {
      const v = Fraction.parse(input ?? '');
      if (!v) return { correct: false, parsed: false, message: 'Enter an integer, a fraction like 3/4, or a decimal like 0.75.' };
      return { correct: v.eq(Fraction.parse(exercise.answer)), parsed: true };
    }
    case 'decimal': {
      const v = parseNumber(input ?? '');
      if (v === null || Number.isNaN(v)) return { correct: false, parsed: false, message: 'Enter a number (e.g. 3.32).' };
      const tol = exercise.tolerance ?? 1e-6;
      return { correct: Math.abs(v - exercise.answer) <= tol, parsed: true };
    }
    case 'mc': {
      const idx = typeof input === 'number' ? input : Number(input);
      if (!Number.isInteger(idx) || idx < 0 || idx >= exercise.choices.length) {
        return { correct: false, parsed: false, message: 'Pick one of the options.' };
      }
      return { correct: idx === exercise.answer, parsed: true };
    }
    case 'order': {
      if (!Array.isArray(input) || input.length !== exercise.items.length) {
        return { correct: false, parsed: false, message: 'Place every item before checking.' };
      }
      const ok = input.every((v, i) => v === exercise.answer[i]);
      return { correct: ok, parsed: true };
    }
    default:
      throw new Error(`unknown exercise type ${exercise.type}`);
  }
}

/** Human readable form of the correct answer, in TeX-friendly markdown. */
export function formatAnswer(exercise) {
  switch (exercise.type) {
    case 'integer': return `$${exercise.answer}$`;
    case 'fraction': return `$${Fraction.parse(exercise.answer).toTeX()}$`;
    case 'decimal': return `$\\approx ${exercise.answer}$`;
    case 'mc': return exercise.choices[exercise.answer];
    case 'order': return exercise.answer.map((i) => exercise.items[i]).join(' $\\;<\\;$ ');
    default: return '';
  }
}

/**
 * Helper for generators: builds a multiple choice exercise with the correct
 * answer and unique distractors shuffled.
 */
export function makeMC(rng, { kind, prompt, correct, distractors, solution, hint }) {
  const seen = new Set([correct]);
  const uniq = [];
  for (const d of distractors) {
    if (!seen.has(d)) { seen.add(d); uniq.push(d); }
  }
  const choices = rng.shuffle([correct, ...uniq]);
  return {
    kind,
    type: 'mc',
    prompt,
    choices,
    answer: choices.indexOf(correct),
    solution,
    hint,
  };
}

export function makeOrder(rng, { kind, prompt, ordered, solution, hint }) {
  // `ordered` lists items from smallest to largest; we display them shuffled.
  const idx = ordered.map((_, i) => i);
  const display = rng.shuffle(idx);
  const items = display.map((i) => ordered[i]);
  // answer: positions in `items` in ascending order
  const answer = ordered.map((_, i) => display.indexOf(i));
  return { kind, type: 'order', prompt, items, answer, solution, hint };
}
