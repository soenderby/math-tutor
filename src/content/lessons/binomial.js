export default {
  id: 'binomial',
  goals: [
    'Compute binomial coefficients quickly, by formula and from Pascal’s triangle, including negative or fractional upper index.',
    'Recognise and apply the core identities: symmetry, absorption, addition, upper negation, summation on the upper index, Vandermonde.',
    'Expand $(x + y)^n$ and read off coefficients; evaluate sums of binomial coefficients by choosing $x$ and $y$.',
    'Know the generating-function form $1/(1-z)^m = \\sum_n \\binom{n+m-1}{n} z^n$, which links this topic to the next ones.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.6', note: 'Long and dense: the general definition, Pascal’s triangle, ten fundamental identities (A)–(L) with proofs, the binomial theorem, multinomials, Stirling numbers, and a worked example of “how to simplify a sum of binomial coefficients”. Read it twice.' },
    { ref: 'Concrete Mathematics, Chapter 5', note: 'The definitive treatment; its table 174 of “the top ten binomial coefficient identities” is the one to pin to the wall.' },
  ],
  knuthExercises: [
    '1.2.6-1 [00] to -4 [10]: evaluate a few coefficients, including C(−1, k) and C(1/2, 2).',
    '1.2.6-10 [M20]: C(n, k) mod 2 via the binary representations (Lucas).',
    '1.2.6-17 [M18]: prove Σ_k C(n,k)² = C(2n,n) via Vandermonde.',
    '1.2.6-20 [M20]: prove the “summation on the upper index” formula by induction.',
  ],
  body: String.raw`
## Why this matters for TAOCP

$\binom nk$ counts the ways to choose $k$ things from $n$; that is the beginning. In TAOCP binomial coefficients also appear as the coefficients of $1/(1-z)^m$, as counts of lattice paths and tree shapes, in every probability calculation, and inside sums that Knuth simplifies with a small toolkit of identities. He says these identities “should be memorised”, and he means it: they are to algorithm analysis what the multiplication table is to arithmetic.

## Definition

For real $r$ and integer $k$:

$$\binom rk = \frac{r(r-1)\cdots(r-k+1)}{k!} = \frac{r^{\underline k}}{k!} \quad (k \ge 0), \qquad \binom rk = 0 \quad (k < 0).$$

When $r = n$ is a non-negative integer, $\binom nk = \dfrac{n!}{k!\,(n-k)!}$ for $0 \le k \le n$ and $0$ for $k > n$. That is the number of $k$-element subsets of an $n$-element set: order the $n$ things ($n!$ ways), take the first $k$, and divide out the orderings within the chosen group ($k!$) and within the rest ($(n-k)!$).

The general definition is not pedantry. $\binom{-1}{k} = \frac{(-1)(-2)\cdots(-k)}{k!} = (-1)^k$, and $\binom{1/2}{2} = \frac{\frac12\cdot(-\frac12)}{2} = -\frac18$; both show up in power series.

## Pascal’s triangle

Row $n$ lists $\binom n0, \binom n1, \dots, \binom nn$. Each entry is the sum of the two above it. Rows $0$–$6$:

| n | | | | | | | |
|---|---|---|---|---|---|---|---|
| 0 | 1 | | | | | | |
| 1 | 1 | 1 | | | | | |
| 2 | 1 | 2 | 1 | | | | |
| 3 | 1 | 3 | 3 | 1 | | | |
| 4 | 1 | 4 | 6 | 4 | 1 | | |
| 5 | 1 | 5 | 10 | 10 | 5 | 1 | |
| 6 | 1 | 6 | 15 | 20 | 15 | 6 | 1 |

The Pascal explorer colours the triangle mod $p$ and traces the identities below; spend ten minutes with it.

## The identities

Knuth’s list, in his lettering, with the ones you will use constantly in bold:

**(B) Symmetry.** $\binom nk = \binom n{n-k}$ for integer $n \ge 0$. (Choosing $k$ to take is choosing $n - k$ to leave.)

**(C) Absorption / extraction.** $\binom rk = \dfrac rk \binom{r-1}{k-1}$, equivalently $k\binom rk = r\binom{r-1}{k-1}$. (Pull a factor out of the top and bottom.) A companion: $(r-k)\binom rk = r\binom{r-1}{k}$.

**(D) Addition (Pascal’s rule).** $\binom rk = \binom{r-1}k + \binom{r-1}{k-1}$. (The $k$-subsets either contain a fixed element or not.)

**(E) Upper negation.** $\binom{-r}{k} = (-1)^k \binom{r+k-1}{k}$. (Multiply each of the $k$ factors of $(-r)^{\underline k}$ by $-1$.) This is how $1/(1-z)^r$ gets positive coefficients.

**(F) Summation on the upper index.** $\displaystyle\sum_{k=0}^{n}\binom km = \binom{n+1}{m+1}$. Sum down a column of the triangle. Proof: apply (D) repeatedly to $\binom{n+1}{m+1}$. The special case $m = 1$ is $\sum k = \binom{n+1}2$.

**(G) Summation on the lower index.** $\displaystyle\sum_{k=0}^{n}\binom{r+k}{k} = \binom{r+n+1}{n}$. Sum along a diagonal.

**(H) Binomial theorem.** $\displaystyle (x+y)^r = \sum_k \binom rk x^k y^{r-k}$ for integer $r \ge 0$ (and for real $r$ as an infinite series when $|x/y| < 1$). Choosing $x = y = 1$: $\sum_k \binom nk = 2^n$. Choosing $x = -1, y = 1$: $\sum_k (-1)^k \binom nk = [n = 0]$.

**(I) Vandermonde’s convolution.** $\displaystyle\sum_k \binom rk \binom s{n-k} = \binom{r+s}n$. (Choose $n$ from a group of $r$ and a group of $s$; condition on how many come from the first.) With $r = s = n$ and symmetry: $\sum_k \binom nk^2 = \binom{2n}n$.

**(L) Trinomial revision.** $\binom rm\binom mk = \binom rk\binom{r-k}{m-k}$. (Choose $m$ then $k$ of those, or choose $k$ then $m-k$ of the rest.)

:::tip When you are not sure
Plug in small numbers. Every identity above is either a fact about tiny cases of Pascal’s triangle or false. Knuth’s advice for simplifying a sum of binomial coefficients: get the sum into a form where one of (F), (G), (I) applies, using (C) to move factors of $k$ inside and (B)/(E) to flip indices.
:::

## Worked example: a sum Knuth simplifies

Evaluate $\displaystyle S = \sum_{k} \binom{n}{k}\binom{k}{m}$. Trinomial revision turns the summand into $\binom nm\binom{n-m}{k-m}$; the factor $\binom nm$ comes out, and $\sum_k \binom{n-m}{k-m} = 2^{n-m}$ by the binomial theorem. So $S = \binom nm 2^{n-m}$. (Count: choose an $m$-subset, then any superset of it.)

## Generating functions preview

Expanding $(1+z)^r$ by the binomial theorem and negating the upper index:

$$\frac{1}{(1-z)^m} = \sum_{n \ge 0}\binom{n+m-1}{n} z^n, \qquad \frac{1}{(1-z)^2} = \sum (n+1)z^n, \qquad \frac{1}{1-z} = \sum z^n.$$

So $\binom{n+m-1}{n}$ is also the number of ways to write $n$ as a sum of $m$ non-negative integers (multisets of size $n$ from $m$ types). This is Knuth’s eq. (7) in §1.2.9 and the reason binomial coefficients and generating functions are inseparable.

## Multinomials and beyond

$\binom{n}{n_1, \dots, n_m} = \dfrac{n!}{n_1!\cdots n_m!}$ counts arrangements with $n_i$ copies of type $i$, and $(x_1 + \dots + x_m)^n = \sum \binom{n}{n_1,\dots,n_m} x_1^{n_1}\cdots x_m^{n_m}$. Knuth also introduces **Stirling numbers** here (counting permutations by cycles and set partitions); they matter in Chapter 5, and you can defer them.

## Things to have memorised

$\binom nk = \binom n{n-k}$; $\ k\binom nk = n\binom{n-1}{k-1}$; $\ \binom nk = \binom{n-1}k + \binom{n-1}{k-1}$; $\ \sum_{k\le n}\binom km = \binom{n+1}{m+1}$; $\ \sum_k \binom rk\binom s{n-k} = \binom{r+s}n$; $\ \sum_k\binom nk = 2^n$; $\ \binom{-r}{k} = (-1)^k\binom{r+k-1}k$; $\ \frac1{(1-z)^m} = \sum_n \binom{n+m-1}{n}z^n$.
`,
};
