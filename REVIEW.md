# Critical review of the TAOCP Math Tutor

## Status (follow-up commit)

All items below have been addressed on this branch except where noted:

- 1-8, 10-13: fixed. Verified by the extended test suite (36 tests), a
  30,800-exercise strict-KaTeX scan, and a Playwright run through every route,
  360 practice cards, and all 13 generating-function presets with zero console
  errors.
- 9 (TAOCP citations): the references I had evidence against were *softened*
  to section-level references or Knuth's identity names (binomial identities,
  hockey stick, multinomial coefficients, the letters in the binomial lesson).
  The remaining equation numbers (Fibonacci, harmonic, generating-function,
  asymptotics sections) are unchanged and still unverified against the book.
- New tests: `test/render.test.js` (strict KaTeX over lessons and generated
  exercises), closed-form check for the divide-and-conquer cases, formatting
  glitch scan in the generator test, decimal-comma / mixed-number parsing.

The original review follows.

Scope: every file on the branch `claude/taocp-learning-tool-1ki947` (commit `dee6a9a`),
read in full, plus execution-based checks:

- the existing suite (`npm test`): 31/31 pass;
- 30,800 generated exercises (400 seeds x 77 generators): every canonical answer is
  accepted by the checker, no `NaN`/`undefined` leaks;
- every TeX fragment in the 12 lessons, the guide, the notation sheet and those 30,800
  exercises rendered through the vendored KaTeX 0.16.11 in strict mode;
- numerical checks of the closed forms quoted in solutions and lessons;
- edge-case probes of the answer parser and the generating-function parser.

Verdict: the architecture is sound and the mathematics is overwhelmingly correct. The
answers the checker grades against are right in every case tested. The defects are
concentrated in the *worked solutions* and *lesson text*, which the tests do not cover.
For a learning tool a wrong solution is worse than a crash, so the items under
"Must fix" should be fixed before this is used seriously.

---

## Must fix (wrong mathematics shown to the learner)

### 1. Two wrong closed forms in the divide-and-conquer solutions
`src/exercises/recurrences.js`, `dcCases`:

| Recurrence (T(1) = 0) | Solution text says | Correct |
|---|---|---|
| `T(n) = 4T(n/2) + n` | `T(n) = 2n^2 - 2n` | `n^2 - n` |
| `T(n) = 3T(n/2) + n` | `T(n) = 3·3^k - 2·2^k` | `2·3^k - 2·2^k` |

Verified: for `n = 8` the recursion gives 56 and 38 respectively; the printed formulas
give 112 and 65. The `a = 2, f = n^2` case (`2n^2 - 2n`) is correct. The integer answers
graded are computed by recursion and are right; only the "In general..." sentence lies.
The `3·3^k - 2·2^k` form would be correct for `T(1) = 1`, which suggests the base case
was changed after the text was written.

### 2. Wrong quicksort formula in the recurrences lesson
`src/content/lessons/recurrences.js`, section "Recurrences with a sum inside" states the
recurrence `C_n = n + 1 + (2/n) Σ_{k<n} C_k` and claims the solution
`C_n = 2(n+1)H_{n+1} - 4n`. For that recurrence the solution is
`C_n = 2(n+1)H_{n+1} - 2(n+1) = 2(n+1)H_n - 2n`. Check: `C_2 = 5` from the recurrence,
`3` from the printed formula, `5` from the corrected one. (The `1.39 n lg n` remark is
fine.)

### 3. `(-2)^n` printed as `-2^n`
`src/exercises/recurrences.js`, `firstOrder`: with `c = -2` the closed form is rendered as
`a_n = -2^n a_0 + -1·(-2^n - 1)/(-3)`, i.e. `-(2^n)` where `(-2)^n` is meant. Same
problem in `characteristic`'s first distractor (`A·5^n + B·-6^n`) and in its solution
(`(1 - -1z)(1 - 2z)`). Wrap negative bases and coefficients in parentheses.

### 4. Generating-function explorer preset does not parse
`src/explorers/genfunc.js`: the preset `z(1 + z) / (1 - z)^3 -> n^2` sets the numerator to
`z(1 + z)`, but `parseFactored` only accepts a *numeric* leading coefficient before a
parenthesised factor; `z(...)` (and `-(...)`) return `null`, so choosing that preset shows
"Could not parse a polynomial". Either extend the parser to accept a bare monomial factor
or change the preset to `z + z^2`.

---

## Should fix (rendering defects and misleading text)

### 5. Ordering answers render as `; < ;`
`src/exercises/answers.js`, `formatAnswer` for type `order` joins with `' $\;<\;$ '` in a
normal template string, so `\;` becomes `;` and the learner sees `log n ;<; n log n`.
Use `String.raw` or `'\\;'`. Only visible after a wrong ordering answer, which is exactly
when the learner is paying attention.

### 6. Thin-space characters inside TeX
`fmt()` in `src/lib/mathutil.js` groups digits with U+2009 (thin space) and its output is
interpolated inside `$...$` in about a dozen generators (`bitLength`, `logExact`,
`binomCompute`, `geometricSum`, `stirling`, ...). KaTeX has no glyph metrics for U+2009:
strict mode reports `unknownSymbol`, non-strict mode (what the app uses) renders it as an
unknown text character and logs a warning per occurrence. It usually looks acceptable but
is undefined behaviour and floods the console. Give `fmt` a TeX mode that emits `\,`
(or `{,}`) instead.

### 7. Coefficient-1 and sign glitches in generated text
- `arithmeticSum`: prints `(1k + 4)` when `c = 1`; should be `(k + 4)`.
- `dominantTerm`: solution says "the term `1n^3` dominates"; the prompt already handles
  the coefficient-1 case, the solution does not.
- `polynomialBound` (`poly` variant, `a = 1`): prompt contains `88n^{0}`.
- `recurrenceToGF` solution: `-1z(A(z) - a_0) + -2z^2A(z)` and `(a_1 - -1a_0)z`.
- `firstOrder` solution: `+ -1·...`, `\dfrac{...}{-3}`.

### 8. Reduced multiple-choice sets
`makeMC` de-duplicates distractors that equal the correct answer, which is right, but two
generators lose an option often:
- `recurrenceToGF`: whenever `a_0 = 0` the first distractor equals the correct answer, so
  148 of 400 generated instances have only 3 choices.
- `proofStructure` ("invalid" variant) has only 2 distractors by construction (136/400).
True/false generators (`integerFacts`, `harmonicFacts`, `bigOTrueFalse`) are intentionally
two-choice and fine.

### 9. TAOCP equation numbers and identity letters are not reliable
The content cites specific equation numbers and Knuth's identity letters throughout. I
could not check them against the book from here, but there are internal inconsistencies
that show at least some are wrong:
- `binomial.js` identities: `k C(n,k) = n C(n-1,k-1)` is labelled "absorption (§1.2.6
  eq. (6))" while symmetry is also labelled "(eq. (6))". Symmetry is (6); absorption is
  (7)/(8).
- The same file cites eq. (10) for `Σ C(k,m) = C(n+1,m+1)` and (11) for
  `Σ C(r+k,k) = C(r+n+1,n)`; `hockeyStick` also says (10). My recollection of the 3rd
  edition is the reverse: (10) is the `C(r+k,k)` sum and (11) is the `C(k,m)` sum.
- The binomial lesson says "Knuth's list, in his lettering" and assigns (E) to upper
  negation, (F)/(G) to the two summation formulas, (H) to the binomial theorem, (I) to
  Vandermonde and (L) to trinomial revision. In Knuth, (E) is the pair of summation
  formulas, (F) the binomial theorem, (G) negating the upper index (a ProofWiki citation
  found while checking also attributes upper negation to "identity G"), (H) the
  simplification formula. Either verify each letter against the book or drop the claim
  that these are Knuth's letters.
- `multisetPermutations` cites "§1.2.6, eq. (42)" for the multinomial coefficient; the
  Fibonacci exercises cite eqs. (6), (7), (8), (11), (13), (14), (15); the harmonic
  exercises cite (3), (8), (10). These are plausible but unverified.
Because the whole point of the tool is to send the reader to the right place in the
book, every such citation should be checked once against a physical copy, or softened to
section-level references.

### 10. Minor content imprecisions
- `analysis.js` lesson: "`n! G_n(z)` is the generating function for permutations by
  number of cycles". It is that generating function divided by `z` (Algorithm M's `A` is
  the number of cycles minus one). Say "up to a shift".
- `harmonic.js` exercise `harmonicEstimate` accepts to +/-0.011 while the prompt says
  "to within 0.01"; harmless, but say 0.01 and use 0.0105 or say "about 0.01".
- `recurrences.js` lesson, "Things to have memorised": `T = 2T(n/2) + 1 => 2n - 1 (for
  T(1) = 1)` is right, but the exercise generator uses `T(1) = 1` for that case and
  `T(1) = 0` for all others; the mixed conventions are what caused defect 1.

---

## Robustness and UX

### 11. Decimal comma is silently misread
`Fraction.parse` and `parseInteger` strip commas as thousands separators, so a learner who
types `1,5` (Danish, German, ... keyboards) gets `15`, marked wrong with no explanation.
Suggest: treat a single comma followed by 1-2 digits at the end as a decimal separator,
or at least reject inputs where the comma cannot be a thousands separator with a message.
Related: `1 1/2` becomes `11/2`. Both are `parsed: true`, so the learner is told the
answer is simply wrong.

### 12. Tests do not cover the text of solutions
`test/generators.test.js` checks that the canonical answer passes the checker and that no
`NaN`/`undefined` leaks. Defects 1, 3, 5, 6 and 7 are all in solution or answer *text*
and would have been caught by either of two cheap additions:
- render every `$...$` fragment of every generated exercise through the vendored KaTeX
  with `strict: true` and `throwOnError: true` (this catches 5 and 6 immediately; note
  that under `"type": "module"` the UMD file must be loaded as CommonJS, e.g. by copying
  it to a `.cjs` path in the test or using `createRequire` on a `.cjs` name);
- for generators that print a closed form, evaluate the closed form and compare it with
  the graded answer (this catches 1).
Also add `Infinity` to the `bad` regex.

### 13. Smaller code points
- `src/main.js`: the `load` listener that re-renders "if KaTeX loaded late" is dead code:
  both `defer` scripts and the module script run before `load`, in document order.
- `src/views/home.js`, `recommendedTopic`: the comment says prerequisites are considered;
  the code ignores them (`prereqsDone` is computed in `homeView` but only affects text).
- `src/state/progress.js`: `importJSON` validates only that `topics` exists; a malformed
  `history` (not an array) will throw later in `recentAccuracy`. Validate or coerce.
- `src/explorers/fibonacci.js`: the "phi^n/sqrt5 - F_n" column for `n` near 60 shows
  floating-point noise at the 4th decimal (`F_60 ~ 1.5e12` exceeds double precision at
  that scale); cap the slider at ~50 or compute with BigInt-scaled arithmetic.
- `src/views/practice.js`: the per-card `window` keydown listener is only removed on the
  next keypress after the card is detached. Harmless, but an `AbortController` tied to
  the card would be cleaner.
- `serve.js`: the `startsWith(root)` guard would admit a sibling directory whose name
  starts with the root's name; in practice the WHATWG URL parser removes `..` segments
  first, so this is not exploitable. Compare against `root + path.sep` anyway.
- `Fraction.from(number)` returns `null` for numbers whose `String()` form uses exponent
  notation (e.g. `1e-7`); not reachable from current callers.

---

## What is good

- Exact arithmetic everywhere it matters: BigInt binomials (including negative upper
  index), exact fractions for harmonic numbers and probabilities, exact power-series
  division. `mod` and `floorDiv` follow Knuth's definitions and are tested for negative
  operands.
- The generator contract (`(rng) => exercise`, canonical answer, checker) is simple and
  the property-style test over seeds is the right shape; it just needs to look at text.
- The markdown/TeX pipeline stashes math before markdown processing, escapes HTML, and
  the strict KaTeX pass over all lesson content came back clean: no unknown commands, no
  unbalanced delimiters.
- Lessons are pitched well: each explains why Knuth needs the idea, gives a worked
  example, and points to the book and to Concrete Mathematics. The mathematical claims
  in the lessons that I could check numerically (Stirling constants, `H_n` values,
  Lame's bound, Zeckendorf, Cassini, the `(1+1/n)^n` expansion, the master-theorem table,
  the variance formulas) are correct apart from defect 2.
- Progress/spaced-repetition logic is small, deterministic, tested, and matches the
  description shown to the user (box doubling, three-in-a-row promotion).
- No build step, no runtime dependencies, KaTeX vendored with its licence and fonts.

## Suggested order of work

1. Fix 1-5 (about 20 lines total).
2. Add the strict-KaTeX rendering test and the closed-form evaluation test (12), which
   also flushes out 6 and 7.
3. Verify or soften the TAOCP citations (9).
4. Handle decimal commas (11).
