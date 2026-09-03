export default {
  id: 'induction',
  goals: [
    'State what an induction proof must contain, and spot a proof that is missing a piece.',
    'Prove a closed form for a sum by induction, including the algebra of the inductive step.',
    'Use strong induction and “induction on the size of the input” to argue that an algorithm is correct.',
    'Recognise Knuth’s assertion-based proofs of algorithms as induction in disguise.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.1', note: 'Short. The sum-of-odd-numbers example, Knuth’s formal statement of the principle, and the proof of Euclid’s algorithm using assertions (a flowchart with claims attached).' },
    { ref: 'Concrete Mathematics, §1.1–1.3', note: 'Tower of Hanoi, lines in the plane, the Josephus problem: three recurrences solved by “guess, then prove by induction”.' },
  ],
  knuthExercises: [
    '1.2.1-2 [10]: what is wrong with a “proof” that a = 1 for all positive a? (It has a broken base case.)',
    '1.2.1-3 [M15]: find the error in a proof that 1/(1·2) + … = 3/2 − 1/n.',
    '1.2.1-8 [M15]: prove Σ_{k=1}^{n} k³ = (1 + 2 + … + n)².',
    '1.2.1-15 [M25]: generalised induction over ordered pairs; good practice with strong induction.',
  ],
  body: String.raw`
## Why Knuth starts here

Almost every claim in TAOCP is of the form “for all $n \ge 1$, such-and-such holds”: a formula for a sum, a bound on running time, the correctness of an algorithm for every input size. There is exactly one general-purpose tool for proving statements about *all* positive integers, and it is mathematical induction. Knuth also uses it in reverse: to *find* a formula you guess it from small cases and then check the guess with induction.

## The principle

Let $P(n)$ be a statement about the integer $n$. Suppose

1. **Base case.** $P(1)$ is true.
2. **Inductive step.** For every $k \ge 1$: *if* $P(k)$ is true, *then* $P(k+1)$ is true.

Then $P(n)$ is true for every integer $n \ge 1$.

The picture is a row of dominoes: (1) knocks over the first, (2) says each domino knocks over the next. The assumption “$P(k)$ is true” inside step (2) is called the **inductive hypothesis**. You are not assuming what you want to prove; you are proving an implication.

:::warning Two ways to get it wrong
- **Forgetting the base case.** The implication $P(k) \Rightarrow P(k+1)$ can hold for all $k$ while $P$ is false everywhere ($P(n)$: “$n = n + 1$” satisfies the step!).
- **Running the step backwards.** Showing $P(k+1) \Rightarrow P(k)$ proves nothing about larger $n$.
:::

The base case need not be $n = 1$. To prove $P(n)$ for all $n \ge n_0$, check $P(n_0)$ and do the step for $k \ge n_0$.

## A complete example

**Claim.** $1 + 3 + 5 + \dots + (2n - 1) = n^2$ for all $n \ge 1$.

**Base case.** $n = 1$: the left side is $1$, the right side is $1^2 = 1$. ✓

**Inductive step.** Assume the claim holds for $n = k$, i.e. $1 + 3 + \dots + (2k-1) = k^2$. Then for $n = k + 1$,

$$1 + 3 + \dots + (2k-1) + (2k+1) = k^2 + (2k+1) = (k+1)^2,$$

where we used the inductive hypothesis to replace the first $k$ terms by $k^2$. So the claim holds for $k+1$. By induction it holds for all $n \ge 1$. $\blacksquare$

Every induction proof of a sum formula has this shape: the left side for $k+1$ equals the left side for $k$ plus one new term; replace the old part by the closed form and simplify. **The only real work is the algebra** $k^2 + (2k+1) = (k+1)^2$.

:::example The three-line template
Prove $\sum_{i=1}^{n} f(i) = F(n)$:
1. $F(n_0) = f(n_0)$ (base).
2. $F(k) + f(k+1) = F(k+1)$ (step; this is algebra).
3. Done.
:::

## Where the formula comes from

Induction verifies a formula but does not produce it. Knuth’s habit, and the habit to acquire, is: **compute small cases, guess, prove.** For $S(n) = \sum_{i \le n} i^2$: $S = 1, 5, 14, 30, 55$. Ratios $S(n)/n = 1, 2.5, 4.67, 7.5, 11$; dividing by $(n+1)$: $0.5, 0.83, 1.17, 1.5, 1.83$, which increases by $1/3$ each time, so $S(n) = n(n+1)(2n+1)/6$. Now prove it by induction (an exercise here).

## Strong induction

Sometimes $P(k+1)$ depends not on $P(k)$ but on earlier cases. The **strong** form lets you assume $P(n_0), P(n_0 + 1), \dots, P(k)$ all hold when proving $P(k+1)$. It is not a stronger principle, just a more convenient phrasing of the same thing (apply ordinary induction to $Q(k)$: “$P(j)$ holds for all $n_0 \le j \le k$”).

**Example.** Every integer $n \ge 2$ is a product of primes. If $n$ is prime, done. Otherwise $n = ab$ with $2 \le a, b < n$; by the (strong) hypothesis $a$ and $b$ are products of primes, so $n$ is too.

Strong induction is the natural tool for recursive algorithms: “assume the algorithm is correct on all inputs smaller than the current one.”

## Induction as a proof of algorithms

Knuth’s second example in §1.2.1 is Euclid’s algorithm, and it introduces a way of thinking that runs through the whole book. Attach an **assertion** to each point in the algorithm’s flow: “here, $\gcd(m, n)$ equals $\gcd(m_0, n_0)$ and $n > 0$.” Show that if the assertion at a step is true, the assertion at the next step is true after executing it. Then by induction on the number of steps executed, all assertions hold whenever they are reached; in particular the assertion at the exit says the answer is right.

The key assertion for Euclid is an **invariant**: $\gcd(m, n)$ never changes when $(m, n)$ is replaced by $(n, m \bmod n)$. Correctness of the answer follows from the invariant plus termination (the second argument strictly decreases and stays $\ge 0$). You will meet exactly this structure in every algorithm proof in Chapter 2.

## Inequalities and thresholds

Proving $2^n > n^2$ for large $n$ by induction needs two things: the smallest $n_0$ from which it holds *forever* (make a table: it holds at $n=1$, fails at $2, 3, 4$, holds from $5$ on), and an inductive step that compares the growth of each side: if $2^k > k^2$ and $k \ge 5$, then $2^{k+1} = 2\cdot 2^k > 2k^2 \ge (k+1)^2$ because $2k^2 - (k+1)^2 = k^2 - 2k - 1 = (k-1)^2 - 2 > 0$ for $k \ge 3$. Notice that the inductive step needed $k \ge 3$ but the base case had to be $5$: the step alone is not enough.

## Common patterns in the inductive step

| To prove | The step typically shows |
|---|---|
| a sum formula $\sum_{i\le n} f(i) = F(n)$ | $F(k) + f(k+1) = F(k+1)$ |
| divisibility, e.g. $d \mid g(n)$ | $g(k+1) - g(k)$ (or $g(k+1) - c\,g(k)$) is a multiple of $d$ |
| an inequality $f(n) \le g(n)$ | $f(k+1) - f(k) \le g(k+1) - g(k)$, or a ratio comparison |
| a property of a recursively defined object | the constructing step preserves the property |
| correctness of a loop | the loop body preserves an invariant |

## Checklist before you say “by induction”

- What exactly is $P(n)$? Write it down as a sentence with $n$ in it.
- What is the smallest $n$ it must hold for? Did you check that case *by direct computation*?
- In the step, did you use the hypothesis? If not, you have written a direct proof, which is fine, but then the induction was decoration.
- Does the step work for *every* $k \ge n_0$, or only for large $k$? If only for large $k$, raise the base case, or check the small cases separately.
`,
};
