// Registry of exercise generators by topic id.
import { generators as induction } from './induction.js';
import { generators as numbers } from './numbers.js';
import { generators as sums } from './sums.js';
import { generators as intfuncs } from './intfuncs.js';
import { generators as permutations } from './permutations.js';
import { generators as binomial } from './binomial.js';
import { generators as harmonic } from './harmonic.js';
import { generators as fibonacci } from './fibonacci.js';
import { generators as genfuncs } from './genfuncs.js';
import { generators as recurrences } from './recurrences.js';
import { generators as asymptotics } from './asymptotics.js';
import { generators as analysis } from './analysis.js';

export const generatorsByTopic = {
  induction,
  numbers,
  sums,
  intfuncs,
  permutations,
  binomial,
  harmonic,
  fibonacci,
  genfuncs,
  recurrences,
  asymptotics,
  analysis,
};

/**
 * Generate an exercise for a topic. `avoidKind` lets the practice view avoid
 * showing the same kind twice in a row.
 */
export function generateExercise(topicId, rng, avoidKind = null) {
  const gens = generatorsByTopic[topicId];
  if (!gens) throw new Error(`no generators for topic ${topicId}`);
  for (let attempt = 0; attempt < 6; attempt++) {
    const gen = rng.pick(gens);
    const ex = gen(rng);
    ex.topic = topicId;
    if (!avoidKind || ex.kind !== avoidKind || gens.length === 1) return ex;
  }
  const ex = rng.pick(gens)(rng);
  ex.topic = topicId;
  return ex;
}
