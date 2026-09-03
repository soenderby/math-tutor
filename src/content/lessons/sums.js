export default {
  id: 'sums',
  goals: [
    'Read and write Σ-notation with arbitrary conditions on the index, including Knuth’s Iverson bracket form.',
    'Shift, reverse, split, and interchange the order of summation without losing terms.',
    'Evaluate arithmetic, geometric, and telescoping sums, and sums of small powers.',
    'Use the “perturbation” trick to derive a closed form instead of just verifying one.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.3', note: 'Knuth’s rules (a)–(d) for manipulating sums, the geometric series, sums of powers, and a wonderful exercise on how to change the order of summation in a double sum.' },
    { ref: 'Concrete Mathematics, Chapter 2', note: 'The best treatment there is: notation, the perturbation method, finite calculus, and multiple sums.' },
  ],
  knuthExercises: [
    '1.2.3-2 [10]: what does Σ_{0≤k≤n} a_k mean if n < 0? (Empty sum.)',
    '1.2.3-4 [10]: interchange sums with a triangular condition.',
    '1.2.3-16 [M20]: Σ_{k=0}^{n} k 2^k = (n−1)2^{n+1} + 2, by the geometric trick.',
    '1.2.3-33 [M30]: (advanced) sum over all pairs of a product; a real workout with double sums.',
  ],
  body: String.raw`
## Why this matters for TAOCP

Analysing an algorithm means counting: how many times does this step execute, summed over all iterations? The count is a sum, often a double sum, often with a condition on the index. Knuth says in §1.2.3 that “the ability to manipulate sums is a skill which is indispensable”. The good news is that there are only a handful of moves.

## The notation

$$\sum_{k=1}^{n} a_k = a_1 + a_2 + \dots + a_n$$

is the sum of $a_k$ as the *bound variable* $k$ runs over the integers from $1$ to $n$. If $n < 1$ there are no terms and the sum is $0$ (the empty sum). Knuth’s more general form puts any condition on $k$ underneath:

$$\sum_{1 \le k \le n,\ k \text{ odd}} a_k, \qquad \sum_{p \text{ prime},\ p \le N} \frac1p, \qquad \sum_{d \mid n} d.$$

With the **Iverson bracket** $[P] = 1$ if $P$ is true and $0$ otherwise, every such sum becomes an unrestricted one: $\sum_{R(k)} a_k = \sum_k a_k [R(k)]$. This looks like a triviality and is in fact the master key to interchanging sums, because now the condition is just a factor in the summand.

Products use $\prod$ the same way; the empty product is $1$.

## The four rules

Knuth lists four rules, all obvious once written out:

1. **Distributive law:** $\sum_{R(k)} c\,a_k = c\sum_{R(k)} a_k$.
2. **Associative law:** $\sum_{R(k)} (a_k + b_k) = \sum_{R(k)} a_k + \sum_{R(k)} b_k$.
3. **Commutative law (renaming):** $\sum_{R(k)} a_k = \sum_{R(p(k))} a_{p(k)}$ for any permutation $p$ of the index range. The important special cases are the **shift** $k \to k + c$ and the **reversal** $k \to n - k$.
4. **Interchange:** $\sum_{R(k)} \sum_{S(j)} a_{jk} = \sum_{S(j)} \sum_{R(k)} a_{jk}$ when the conditions are independent; with a dependent condition such as $1 \le j \le k \le n$, both readings are the same sum over pairs and you can choose which variable to sum first.

:::example Shifting an index
$\sum_{k=1}^{n} a_k = \sum_{j=0}^{n-1} a_{j+1}$ (substitute $k = j + 1$). Always check the first and last term: $j = 0$ gives $a_1$ ✓, $j = n - 1$ gives $a_n$ ✓. Off-by-one errors in sums are the most common error in algorithm analysis, and this check catches them.
:::

## The classic closed forms

**Arithmetic series.** $\sum_{k=1}^{n} k = \dfrac{n(n+1)}{2}$. Gauss’s trick: write the sum forwards and backwards and add termwise; each pair sums to $n+1$ and there are $n$ pairs, so $2S = n(n+1)$. More generally, any arithmetic series equals (number of terms) $\times$ (average of first and last term).

**Geometric series.** For $q \ne 1$,
$$\sum_{k=0}^{n} q^k = \frac{q^{n+1} - 1}{q - 1}.$$
Knuth’s derivation: let $S$ be the sum; then $qS = \sum_{k=1}^{n+1} q^k = S - 1 + q^{n+1}$, and solve for $S$. For $|q| < 1$ the infinite sum is $1/(1-q)$. With $q = 2$: $1 + 2 + \dots + 2^n = 2^{n+1} - 1$, the number of nodes in a full binary tree of height $n$.

**Sums of powers.**
$$\sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}, \qquad \sum_{k=1}^{n} k^3 = \left(\frac{n(n+1)}{2}\right)^2.$$
In general $\sum_{k \le n} k^m$ is a polynomial of degree $m+1$ in $n$ with leading term $n^{m+1}/(m+1)$, the discrete analogue of $\int x^m dx$.

**Telescoping.** If $a_k = f(k+1) - f(k)$ then $\sum_{k=1}^{n} a_k = f(n+1) - f(1)$: everything in the middle cancels. Examples: $\sum \frac{1}{k(k+1)} = \sum\left(\frac1k - \frac1{k+1}\right) = 1 - \frac{1}{n+1}$; and $\sum_{k=1}^{n}\bigl((k+1)^2 - k^2\bigr) = (n+1)^2 - 1$.

## The perturbation trick

Telescoping in reverse gives a *method* for finding closed forms, which Knuth uses over and over. To find $S_n = \sum_{k \le n} k$: sum the identity $(k+1)^2 - k^2 = 2k + 1$ over $k = 1..n$. The left side telescopes to $(n+1)^2 - 1$; the right side is $2S_n + n$. Solve: $S_n = n(n+1)/2$. Summing $(k+1)^3 - k^3 = 3k^2 + 3k + 1$ likewise produces $\sum k^2$ from the known $\sum k$, and so on up the ladder.

The same idea in the form “compute $S_{n+1}$ two ways” (peel off the first term, or the last) is what Concrete Mathematics calls the perturbation method; it solved the geometric series above.

## Double sums and changing the order

$\sum_{i=1}^{m}\sum_{j=1}^{n} a_{ij}$ adds up an $m\times n$ table; it does not matter whether you go row by row or column by column. The interesting case has a **triangular** condition:

$$\sum_{1 \le j \le k \le n} a_{jk} = \sum_{k=1}^{n}\sum_{j=1}^{k} a_{jk} = \sum_{j=1}^{n}\sum_{k=j}^{n} a_{jk}.$$

Left: fix $k$, let $j$ run up to $k$. Right: fix $j$, let $k$ run from $j$ up. Both enumerate the pairs $(j, k)$ with $j \le k$; draw the triangle of lattice points and sum it by rows or by columns. Knuth’s example: $\sum_{1\le j\le k\le n} a_j a_k = \frac12\left(\left(\sum a_k\right)^2 + \sum a_k^2\right)$, proved by symmetrising.

:::example Counting pairs
$\sum_{1 \le j < k \le n} 1$ counts pairs with $j < k$: for each $k$ there are $k - 1$ choices of $j$, giving $\sum_{k=1}^{n} (k - 1) = n(n-1)/2 = \binom n2$. This is the number of comparisons made by a naive “compare every pair” algorithm.
:::

When you interchange sums with a dependent condition, the rule is: write the condition with the Iverson bracket, $\sum_j \sum_k a_{jk}[1 \le j \le k \le n]$, then re-read the bracket as a condition on the *other* variable: $[1\le j\le n][j \le k \le n]$.

## Sums that appear everywhere in TAOCP

| Sum | Value | Typical origin |
|---|---|---|
| $\sum_{k=1}^{n} 1$ | $n$ | a loop |
| $\sum_{k=1}^{n} k$ | $n(n+1)/2$ | a nested loop, insertion sort comparisons |
| $\sum_{k=0}^{n} 2^k$ | $2^{n+1} - 1$ | nodes of a binary tree, doubling |
| $\sum_{k=1}^{n} 1/k$ | $H_n \approx \ln n$ | records, quicksort, hashing (topic 7) |
| $\sum_{k=1}^{n} k\,2^k$ | $(n-1)2^{n+1} + 2$ | total depth in a complete tree |
| $\sum_{k=0}^{n} \binom{n}{k}$ | $2^n$ | subsets (topic 6) |

## Infinite sums

Knuth is careful: an infinite sum $\sum_{k \ge 0} a_k$ is defined as a limit of partial sums and may fail to exist ($\sum 1/k$ diverges, $\sum (-1)^k$ oscillates). For sums of positive terms the four rules still hold; for general terms, rearranging can change the answer. In this book infinite sums are mostly geometric or generating functions, where convergence is either easy or irrelevant (topic 9).
`,
};
