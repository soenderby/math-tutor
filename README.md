# TAOCP Math Tutor

A web-based tutor for the mathematics you need in order to read Donald Knuth's
*The Art of Computer Programming*. It follows the "Mathematical Preliminaries"
of Volume 1 (§1.2) topic by topic, with:

- **Lessons** written to be gentler than Knuth, each explaining the idea, why the
  book needs it, worked examples, and pointers to the exact section of TAOCP and
  of *Concrete Mathematics* to read next, plus a few of Knuth's own exercises to try.
- **Practice** with procedurally generated exercises (77 generators, unlimited
  variations) and a worked solution for every one. Answer types: integers,
  exact fractions, decimals with tolerance, multiple choice, and ordering.
- **Explorers**: Pascal's triangle, Euclid's algorithm, harmonic numbers vs. ln n,
  Fibonacci and the golden ratio, a generating-function expander, and a
  growth-rate race.
- **Progress tracking** in your browser (localStorage) with a light spaced-repetition
  scheme and a review queue that brings weak topics back.
- A **reading guide** to the book and a one-page **notation sheet**.

## The curriculum

| # | Topic | TAOCP |
|---|---|---|
| 1 | Mathematical Induction | §1.2.1 |
| 2 | Numbers, Powers, and Logarithms | §1.2.2 |
| 3 | Sums and Products | §1.2.3 |
| 4 | Integer Functions and Elementary Number Theory | §1.2.4 |
| 5 | Permutations and Factorials | §1.2.5 |
| 6 | Binomial Coefficients | §1.2.6 |
| 7 | Harmonic Numbers | §1.2.7 |
| 8 | Fibonacci Numbers | §1.2.8 |
| 9 | Generating Functions | §1.2.9 |
| 10 | Recurrence Relations | §1.2.9–10, Concrete Math ch. 1 |
| 11 | Asymptotics and O-Notation | §1.2.11 |
| 12 | Analysis of an Algorithm | §1.2.10 |

## Running it

There is no build step and there are no dependencies beyond Node (≥ 18) for the
tiny static server and the tests. KaTeX (MIT) is vendored under `vendor/katex`,
so the site works offline.

```sh
npm start          # serves http://localhost:8080
npm test           # runs the unit tests (node --test)
```

Any static file server works too (`python3 -m http.server 8080`), and the site
can be published as-is on GitHub Pages: enable Pages for the repository root of
the branch you want to serve.

## Layout

```
index.html, styles.css       app shell and styling (light + dark)
serve.js                     zero-dependency static server
src/main.js                  hash router and sidebar
src/views/                   home, lesson, practice, review, explorers, progress
src/content/curriculum.js    topic list and TAOCP section mapping
src/content/lessons/         one lesson per topic (markdown with TeX)
src/content/guide.js         "how to read TAOCP"
src/content/notation.js      notation cheat sheet
src/exercises/               one generator module per topic + answer checking
src/explorers/               interactive widgets
src/lib/                     exact arithmetic (BigInt/fractions), power series, RNG
src/state/progress.js        localStorage progress + spaced repetition
vendor/katex/                KaTeX 0.16.11 (css, js, woff2 fonts)
test/                        unit tests
```

## Adding content

- **A new exercise kind**: add a function `(rng) => exercise` to the relevant
  module in `src/exercises/` and append it to that module's `generators` array.
  The test suite generates every kind with many seeds and checks that the
  canonical answer passes the checker and that no `NaN`/`undefined` leaks into
  the text.
- **Lesson text**: edit `src/content/lessons/<topic>.js`. The body is markdown
  with `$…$` / `$$…$$` math and `:::kind Title … :::` callouts
  (`note`, `example`, `taocp`, `tip`, `warning`).

## References

Section numbers refer to *The Art of Computer Programming, Volume 1:
Fundamental Algorithms*, 3rd edition. *Concrete Mathematics* is by Graham,
Knuth and Patashnik (2nd edition).
