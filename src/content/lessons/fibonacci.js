export default {
  id: 'fibonacci',
  goals: [
    'Use Knuth’s indexing $F_0 = 0$, $F_1 = 1$ and compute $F_n$ quickly, by iteration or by rounding $\\phi^n/\\sqrt5$.',
    'Derive and apply Binet’s formula and the identity $\\phi^n = \\phi F_n + F_{n-1}$.',
    'Prove Fibonacci identities (Cassini, $F_{m+n}$, $\\sum F_k$, gcd) by induction and recognise them in the wild.',
    'Explain Zeckendorf’s theorem and why consecutive Fibonacci numbers are Euclid’s worst case.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.8', note: 'History, the golden ratio, Binet’s formula derived two ways (guess-and-induct, then via the generating function), $F_{m+n}$, $\\gcd(F_m, F_n)$, and the Fibonacci number system in the exercises.' },
    { ref: 'Concrete Mathematics, §6.6', note: 'Fibonacci numbers, with the “Fibonacci number system” and the connection to continued fractions.' },
  ],
  knuthExercises: [
    '1.2.8-2 [15]: prove Cassini’s identity F_{n+1}F_{n−1} − F_n² = (−1)ⁿ by induction.',
    '1.2.8-6 [M20]: prove F_{m+n} = F_m F_{n+1} + F_{m−1} F_n.',
    '1.2.8-11 [M25]: F_n divides F_m iff n divides m (for n > 2).',
    '1.2.8-34 [M24]: Zeckendorf’s theorem: every positive integer is uniquely a sum of non-consecutive F_k, k ≥ 2.',
  ],
  body: String.raw`
## Why this matters for TAOCP

The Fibonacci numbers are Knuth’s favourite example of a **recurrence**, and the way he treats them here (compute, guess a closed form, prove it, then re-derive it with a generating function) is the template he will use for every recurrence in the book. They also appear on their own: as the worst case of Euclid’s algorithm, in Fibonacci search and Fibonacci heaps, in the analysis of AVL trees (the sparsest balanced trees have Fibonacci many nodes), and in polyphase merge sorting.

## Definition

$$F_0 = 0,\quad F_1 = 1,\quad F_n = F_{n-1} + F_{n-2}\ (n \ge 2):$$

$$0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, \dots$$

Knuth’s indexing starts with $F_0 = 0$; it makes every identity cleaner (e.g. $\gcd(F_m, F_n) = F_{\gcd(m,n)}$ is false with other indexings). The recurrence also runs backwards: $F_{-n} = (-1)^{n+1}F_n$.

## The golden ratio and Binet’s formula

Ratios $F_{n+1}/F_n$ are $1, 2, 1.5, 1.667, 1.6, 1.625, \dots$, converging to

$$\phi = \frac{1+\sqrt5}{2} = 1.6180339887\ldots, \qquad \text{the positive root of } x^2 = x + 1.$$

Its conjugate $\hat\phi = \frac{1-\sqrt5}{2} = 1 - \phi = -1/\phi \approx -0.618$ is the other root. Because both satisfy $x^2 = x + 1$, both $\phi^n$ and $\hat\phi^n$ satisfy the Fibonacci recurrence, and so does any combination $A\phi^n + B\hat\phi^n$. Matching $F_0 = 0, F_1 = 1$ gives **Binet’s formula** (known to de Moivre, 1718):

$$F_n = \frac{\phi^n - \hat\phi^n}{\sqrt5}.$$

Since $|\hat\phi^n/\sqrt5| < \frac12$ for all $n \ge 0$, **$F_n$ is $\phi^n/\sqrt5$ rounded to the nearest integer** (eq. (15)). So $F_n$ grows exponentially with ratio $\phi$, $\lg F_n \approx 0.694n$, and $F_n$ has about $n/4.78$ decimal digits. The Fibonacci explorer tabulates the rounding.

A companion identity, proved by induction from $\phi^2 = \phi + 1$: $\phi^n = \phi F_n + F_{n-1}$ (eq. (13)). Try it: $\phi^2 = \phi + 1$, $\phi^3 = \phi\cdot\phi^2 = \phi^2 + \phi = 2\phi + 1$.

:::example Knuth’s method
He first *guesses* that $F_n$ grows like $c^n$, substitutes into the recurrence to get $c^2 = c + 1$, and *then* proves Binet’s formula by induction. In §1.2.9 he gets the same formula mechanically from the generating function $z/(1-z-z^2)$ by partial fractions. Both methods are worth knowing; the second one generalises to every linear recurrence with constant coefficients.
:::

## Identities

All proved by induction, or read off from Binet’s formula. The important ones:

- **Sum:** $\displaystyle\sum_{k=1}^{n} F_k = F_{n+2} - 1$. (Telescoping: $F_k = F_{k+2} - F_{k+1}$.)
- **Sum of squares:** $\displaystyle\sum_{k=1}^{n} F_k^2 = F_nF_{n+1}$. (Picture: Fibonacci squares tile an $F_n \times F_{n+1}$ rectangle.)
- **Cassini:** $F_{n+1}F_{n-1} - F_n^2 = (-1)^n$. (Basis of the “64 = 65” dissection puzzle.)
- **Addition formula:** $F_{m+n} = F_mF_{n+1} + F_{m-1}F_n$ (eq. (7)); with $m = n$: $F_{2n} = F_n(F_{n+1} + F_{n-1})$, and $F_{2n+1} = F_n^2 + F_{n+1}^2$. These give a fast way to compute $F_n$ in $O(\log n)$ steps.
- **gcd:** $\gcd(F_m, F_n) = F_{\gcd(m,n)}$ (eq. (8)); hence $F_n \mid F_m$ iff $n \mid m$ (for $n > 2$). The proof runs Euclid’s algorithm on the *indices* using the addition formula.
- **Matrix form:** $\begin{pmatrix}1&1\\1&0\end{pmatrix}^n = \begin{pmatrix}F_{n+1}&F_n\\F_n&F_{n-1}\end{pmatrix}$; taking determinants gives Cassini instantly.

## Euclid’s worst case

Run Euclid on $(F_{n+1}, F_n)$: since $F_{n+1} = 1\cdot F_n + F_{n-1}$, every quotient is $1$ and the algorithm takes $n - 1$ steps. Lamé (1845) proved this is the worst: if Euclid takes $n$ steps then the smaller input is at least $F_{n+1}$. Since $F_{n+1} \approx \phi^{n+1}/\sqrt5$, the number of steps is at most about $\log_\phi(\sqrt5\,N) \approx 4.8\log_{10}N$. Knuth’s §4.5.3 analyses the *average* number of steps, a famous and much harder problem.

## Zeckendorf’s theorem: the Fibonacci number system

Every positive integer is **uniquely** a sum of Fibonacci numbers $F_k$ with $k \ge 2$ and no two consecutive indices. Example: $100 = 89 + 8 + 3 = F_{11} + F_6 + F_4$. The greedy algorithm (subtract the largest $F_k \le N$, repeat) always produces it, and the “no two consecutive” condition is what makes it unique. Written in binary-like digits ($1$ if $F_k$ is used), numbers get a representation with no two adjacent $1$s; Knuth uses it for Fibonacci search and in the analysis of Euclid’s algorithm. A charming consequence: multiplying by $\phi$ is roughly “shift the digits left by one”.

## Generating function preview

$$\sum_{n\ge0} F_n z^n = \frac{z}{1 - z - z^2}.$$

Multiply the series by $1 - z - z^2$ and watch everything cancel except $z$: that is the recurrence written as a polynomial identity. Partial fractions on the right-hand side give Binet’s formula. Next topic.

## Things to have memorised

- $F_0 = 0, F_1 = 1$; $F_{10} = 55$, $F_{20} = 6765$.
- $F_n = (\phi^n - \hat\phi^n)/\sqrt5 = \operatorname{round}(\phi^n/\sqrt5)$; $\phi \approx 1.618$, $\phi^2 = \phi + 1$.
- $\sum_{k\le n} F_k = F_{n+2} - 1$; Cassini; $F_{m+n} = F_mF_{n+1} + F_{m-1}F_n$; $\gcd(F_m,F_n) = F_{\gcd(m,n)}$.
- Consecutive Fibonacci numbers: Euclid’s worst case, about $4.8\log_{10}N$ steps.
`,
};
