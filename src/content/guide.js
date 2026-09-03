export const guide = String.raw`
*The Art of Computer Programming* (TAOCP) is unusual among computer science books: it is written for readers who are willing to do mathematics, and Knuth expects you to work through it with pencil in hand. This page explains how the book is organised, how to pace yourself, and how this tool fits in.

## What you are actually going to read

Volume 1, *Fundamental Algorithms*, opens with Chapter 1, “Basic Concepts”:

- **§1.1 Algorithms.** What an algorithm is, illustrated with Euclid’s algorithm. Short and readable; start here.
- **§1.2 Mathematical Preliminaries.** Eleven sections of mathematics (§1.2.1 – §1.2.11), about 100 pages. *This is what this tool prepares you for*, one topic per section.
- **§1.3 MIX.** Knuth’s hypothetical computer and its assembly language. Skippable on a first pass; the 4th-edition drafts (and *fascicle 1*) replace it with MMIX.
- **§1.4 Some Fundamental Programming Techniques.** Subroutines, coroutines, interpreters.

Then Chapter 2, *Information Structures* (stacks, lists, trees, memory), is where the real algorithmic content begins, and it leans on §1.2 constantly: sums, recurrences, binomial coefficients, generating functions, and O-notation appear on nearly every page of analysis.

:::tip A realistic plan
Read §1.1. Then read §1.2 *with this tool*: for each section, read the lesson here first (it is written to be gentler than Knuth), then read Knuth’s section, then practise here until the topic is solid. Do a few of Knuth’s own exercises rated 10–20. Skip §1.3 for now. Move on to Chapter 2 and return to §1.2 whenever you get stuck on a piece of mathematics.
:::

## Knuth’s exercise ratings

Every exercise carries a difficulty rating; take it seriously, because they span an enormous range:

| Rating | Meaning |
|---|---|
| 00 | Immediate; you can answer in your head. |
| 10 | A simple problem, about a minute. |
| 20 | Requires some thought, maybe 15–20 minutes. |
| 30 | A moderately hard problem; a couple of hours. |
| 40 | Quite difficult; suitable as a term project. |
| 50 | An open research problem (some have since been solved). |

A prefix **M** means the exercise is mathematically oriented; **HM** means it needs “higher mathematics” (calculus, complex analysis) beyond §1.2. An arrow **▶** marks exercises Knuth especially recommends. Answers to *all* exercises are in the back of the book; reading an answer after an honest attempt is expected, not cheating.

## Reading §1.2 without drowning

- **Knuth proves things.** Every claim comes with an argument, usually induction or a manipulation of sums. Do not skip the derivations; they are the skill being taught.
- **Equations are numbered and reused.** He writes “by (6)” meaning equation (6) of the current section. Keep a finger in the page.
- **Notation is precise and slightly personal.** $\lg$ for $\log_2$, $x \bmod y$ defined for real numbers, $[P]$ for a truth value, one-way equalities with $O$. See the *Notation* page.
- **§1.2.10 and §1.2.11 are the hardest.** If Euler’s summation formula (§1.2.11.2) defeats you, skim it and move on; you need only its consequences (Stirling’s formula, the expansion of $H_n$).
- **You do not need everything.** For Chapter 2 the essentials are §1.2.1–§1.2.7 and the first half of §1.2.11. Generating functions (§1.2.9) become important in Chapters 5 and 6.

## Companion books

- **Concrete Mathematics** (Graham, Knuth, Patashnik). Grew out of a course on §1.2. Same material, far more gently, with hundreds of exercises. If you own one other book, own this.
- **Mathematics for Computer Science** (Lehman, Leighton, Meyer), free online. Good on induction, sums, and probability.
- **Knuth’s own errata and the 4th-edition fascicles**, available from his web page. The fascicles on MMIX and on combinatorial algorithms (Volume 4) are the current state of the art.

## How this tool works

Each of the twelve topics has a **lesson** (what the idea is, why Knuth needs it, worked examples), a **practice** mode with endlessly generated problems and step-by-step solutions, and, for several topics, an **explorer** to play with. Answering records progress in your browser; a topic is *mastered* after you have promoted it three times by getting three right in a row. The **review queue** brings topics back on a lengthening schedule so that they stick.

Exercises are meant to be done on paper (or in your head), not by hunting for a formula: when you do reach for a formula, the solution tells you where it lives in the book.
`;
