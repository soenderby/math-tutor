export default {
  id: 'asymptotics',
  goals: [
    'State the definitions of $O$, $\\Omega$, $\\Theta$ and $o$, and decide $f = O(g)$ by looking at the ratio $f/g$.',
    'Order the standard functions by growth and explain why $\\log n = O(n^\\epsilon)$ and $n^c = O(2^n)$.',
    'Use Knuth’s one-way “=” convention and the algebra of $O$-terms correctly ($O(f) - O(f) = O(f)$, not $0$).',
    'Quote the key expansions: Stirling, $H_n = \\ln n + \\gamma + O(1/n)$, $(1 + 1/n)^n = e + O(1/n)$.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.11.1', note: 'The O-notation: definition, the rules for manipulating O-terms (eqs. (13)–(20)), and worked examples including the expansion of (1 + 1/n)ⁿ. Ω and Θ are introduced at the end.' },
    { ref: 'TAOCP Vol. 1, §1.2.11.2–3', note: 'Euler’s summation formula and its applications: Stirling’s formula, the expansion of H_n, and “some asymptotic calculations”. Harder; skim first time.' },
    { ref: 'Concrete Mathematics, Chapter 9', note: 'A hierarchy of growth, the O manipulation rules, two asymptotic tricks, and Euler’s summation formula done gently.' },
    { ref: 'Knuth, “Big Omicron and big Omega and big Theta” (SIGACT News, 1976)', note: 'Two pages that fixed the modern meanings of Ω and Θ.' },
  ],
  knuthExercises: [
    '1.2.11.1-3 [M15]: is O(f)O(g) = O(fg)? Prove it from the definition.',
    '1.2.11.1-5 [M15]: prove e^{O(1/n)} = 1 + O(1/n).',
    '1.2.11.1-6 [M20]: show that the expansion of (1 + 1/n)ⁿ can be carried further.',
    '1.2.11.1-9 [M20]: show that (n choose k) ≈ nᵏ/k! with a precise error term.',
  ],
  body: String.raw`
## Why this matters for TAOCP

Exact counts are Knuth’s ideal, but they are often unattainable or unreadable, so he compresses them: “the running time is $2n\ln n + O(n)$.” The $O$ hides a bounded mess. To read the book you must know precisely what is hidden and what is not, and you must be able to compare growth rates at a glance. Knuth himself standardised $\Omega$ and $\Theta$ in 1976; the notation in every algorithms course descends from §1.2.11.

## The definition

$$f(n) = O(g(n)) \iff \text{there are constants } C, n_0 \text{ such that } |f(n)| \le C\,g(n) \text{ for all } n \ge n_0.$$

Read “$f$ is big-oh of $g$”: $f$ grows *no faster than* $g$, up to a constant factor, for large $n$. It is an **upper bound**, not an estimate: $n = O(n^2)$ is true. Constants and small $n$ are deliberately ignored; $10^6 n = O(n)$.

Its relatives:

| Notation | Meaning | Ratio $f/g$ for large $n$ |
|---|---|---|
| $f = O(g)$ | $f \le C g$ eventually | bounded above |
| $f = \Omega(g)$ | $f \ge c\,g$ eventually ($g = O(f)$) | bounded below by a positive constant |
| $f = \Theta(g)$ | both: $c\,g \le f \le C g$ | bounded above and below: “same order” |
| $f = o(g)$ | $f/g \to 0$ | tends to $0$: “strictly smaller” |
| $f \sim g$ | $f/g \to 1$ | tends to $1$: “asymptotically equal” |

The practical test: **look at the ratio $f(n)/g(n)$**. If it stays bounded, $f = O(g)$; if it tends to a nonzero constant, $f = \Theta(g)$; if it tends to $0$, $f = o(g)$; if it tends to $\infty$, $f \ne O(g)$.

## The hierarchy

$$1 \prec \log\log n \prec \log n \prec (\log n)^{k} \prec n^{\epsilon} \prec n \prec n\log n \prec n^{2} \prec n^{c} \prec 2^{n} \prec c^{n} \prec n! \prec n^{n},$$

where $f \prec g$ means $f = o(g)$, and $k > 0$, $0 < \epsilon < 1 < c$, $c > 2$ where relevant. The two facts people forget:

- **Any power of a logarithm is beaten by any positive power of $n$:** $(\log n)^{100} = o(n^{0.01})$. (Substitute $n = e^m$: compare $m^{100}$ with $e^{0.01m}$.)
- **Any polynomial is beaten by any exponential with base $> 1$:** $n^{100} = o(1.01^n)$. And exponentials with different bases are *not* interchangeable: $3^n \ne O(2^n)$, though logarithms with different bases are ($\log_2 n = \Theta(\log_{10} n)$).

The growth-rate explorer plots these on a log scale; it is the fastest way to internalise the picture.

## Knuth’s conventions for “=”

Knuth reads $f(n) = O(g(n))$ as “$f$ is a member of the set of functions bounded by $Cg$”. The equals sign is therefore **one-way**: $n = O(n^2)$ is fine, $O(n^2) = n$ is meaningless, and $O(n) = O(n^2)$ says “everything that is $O(n)$ is $O(n^2)$” but not the reverse. Inside a formula, each $O(\cdot)$ stands for *some* unspecified function satisfying the bound, a different one at each occurrence. Consequences (his eqs. (13)–(20)):

- $f = O(f)$; $\ c\cdot O(f) = O(f)$; $\ O(f) + O(f) = O(f)$; $\ O(O(f)) = O(f)$.
- $O(f)O(g) = O(fg)$; $\ O(f) + O(g) = O(|f| + |g|)$.
- $O(f) - O(f) = O(f)$, **not** $0$: the two $O$’s are different functions.
- $e^{O(1/n)} = 1 + O(1/n)$; $\ \ln(1 + O(1/n)) = O(1/n)$: substituting an $O$-term into a power series with bounded argument is allowed, term by term.

:::warning The classic mistake
From $a_n = 2a_{n-1} + O(1)$ you may *not* conclude $a_n = 2^n a_0 + O(1)$; the $O(1)$ terms accumulate. Unroll carefully: $a_n = 2^n a_0 + O(2^n)$. Each line of an $O$-calculation must be a true statement about *some* bounded function, and the constant may grow when you sum $n$ of them.
:::

## Worked example: $(1 + 1/n)^n$

Knuth’s showcase calculation. $\ln(1 + 1/n) = \frac1n - \frac{1}{2n^2} + O(n^{-3})$ (Taylor series with the tail bounded). Multiply by $n$: $n\ln(1+1/n) = 1 - \frac1{2n} + O(n^{-2})$. Exponentiate: $e^{1 - 1/(2n) + O(n^{-2})} = e\cdot e^{-1/(2n) + O(n^{-2})} = e\left(1 - \frac1{2n} + O(n^{-2})\right)$. So

$$\left(1 + \frac1n\right)^n = e - \frac{e}{2n} + O\!\left(\frac1{n^2}\right).$$

Every step uses only the rules above plus the Taylor series of $\ln(1+x)$ and $e^x$; the result is far more informative than “$\to e$”.

## The expansions to know

$$\ln n! = n\ln n - n + \tfrac12\ln(2\pi n) + \frac{1}{12n} + O(n^{-3}) \quad\text{(Stirling)}$$
$$H_n = \ln n + \gamma + \frac1{2n} - \frac{1}{12n^2} + O(n^{-4})$$
$$\sum_{k=1}^{n} k^m = \frac{n^{m+1}}{m+1} + \frac{n^m}2 + O(n^{m-1}) \quad (m \ge 1)$$
$$\binom{n}{k} = \frac{n^k}{k!}\left(1 - \frac{k(k-1)}{2n} + O(n^{-2})\right) \quad (k \text{ fixed})$$

All four come from **Euler’s summation formula** (§1.2.11.2), which converts $\sum_{k} f(k)$ into $\int f + $ correction terms involving derivatives of $f$ at the endpoints and Bernoulli numbers. It is the systematic source of asymptotic expansions of sums; understand what it does before worrying about the proof.

## What $O$ does not tell you

$\Theta(n\log n)$ says nothing about the constant, and in practice the constant decides whether one $n\log n$ algorithm beats another. Knuth is unusual in tracking constants (and even lower-order terms) whenever he can: “$1.39n\lg n$ comparisons” for quicksort versus “$n\lg n$” for merge sort is real information. Use $O$ to see the shape; then, if it matters, do the exact count.

## Things to have memorised

- $f = O(g)$: $|f| \le Cg$ for $n \ge n_0$. Test with the ratio. $\Theta$ = same order; $o$ = strictly smaller.
- Hierarchy: logs $\prec$ polynomials $\prec$ exponentials $\prec$ factorials; log base is irrelevant, exponential base is not.
- $O$-terms are anonymous functions; equality is one-way; $O(f) - O(f) = O(f)$.
- $\ln n! = n\ln n - n + O(\log n)$; $H_n = \ln n + \gamma + O(1/n)$; $(1 + 1/n)^n = e + O(1/n)$.
`,
};
