export default {
  id: 'permutations',
  goals: [
    'Count arrangements: $n!$, $k$-permutations $n^{\\underline{k}}$, and permutations of a multiset.',
    'Find the power of a prime in $n!$ with Legendre’s formula, and hence trailing zeros.',
    'State Stirling’s approximation and use $\\ln n! \\approx n\\ln n - n$ for estimates.',
    'Recognise the gamma function as the continuous $n!$ and know why Knuth mentions it.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.5', note: 'Two proofs that there are n! permutations, the size of n!, Legendre’s formula (his eq. (8)), Stirling’s approximation, and the gamma function.' },
    { ref: 'Concrete Mathematics, §4.4 and §9.6', note: 'Factorial factors, and the derivation of Stirling’s formula.' },
  ],
  knuthExercises: [
    '1.2.5-2 [10]: how many ways to arrange a, b, c, d such that a and b are adjacent? (Glue them.)',
    '1.2.5-4 [10]: how many trailing zeros in 1000!?',
    '1.2.5-6 [M15]: find the exponent of a prime p in n! and prove it. (Legendre.)',
    '1.2.5-12 [M20]: is (n!)² > nⁿ for large n? Use Stirling.',
  ],
  body: String.raw`
## Why this matters for TAOCP

Sorting is rearranging, and there are $n!$ arrangements of $n$ things; that number and its logarithm, $\lg n! \approx n\lg n$, give the famous lower bound on comparison sorting. Permutations are also the “random inputs” of average-case analysis: when Knuth says “assume the $n$ keys are in random order”, he means one of the $n!$ permutations chosen uniformly. Chapter 5 is largely about permutations, and §1.3.3 studies their structure.

## Counting arrangements

A **permutation** of $n$ distinct objects is an ordering of them. There are

$$n! = n \cdot (n-1) \cdots 2 \cdot 1$$

of them: $n$ choices for the first position, then $n-1$ for the second, and so on. Knuth gives this argument and a second, inductive one (insert the $n$-th object into any of $n$ gaps of a permutation of $n-1$). By convention $0! = 1$: there is exactly one way to arrange nothing, and the convention makes every formula work.

$n!$ grows fast: $10! = 3\,628\,800$, $20! \approx 2.4\times 10^{18}$, $70! > 10^{100}$. Knuth’s table of $n!$ for $n \le 20$ is worth glancing at once.

**Arranging $k$ out of $n$** (order matters): $n(n-1)\cdots(n-k+1) = \dfrac{n!}{(n-k)!}$. Knuth writes this as the **falling factorial power** $n^{\underline{k}}$ (read “$n$ to the $k$ falling”), with $x^{\underline{k}} = x(x-1)\cdots(x-k+1)$ for any real $x$; the rising version is $x^{\overline{k}} = x(x+1)\cdots(x+k-1)$. These behave under finite differences the way $x^k$ behaves under derivatives, which is why they are the “right” powers for sums (Concrete Math §2.6).

:::warning Don’t compute factorials to simplify a ratio
$\dfrac{n!}{(n-3)!} = n(n-1)(n-2)$. Cancel first; the numbers stay small. Almost every factorial in TAOCP appears in a ratio.
:::

**Permutations of a multiset.** Arrangements of the letters of MISSISSIPPI: $11$ letters, with I ×4, S ×4, P ×2. Permuting identical letters among themselves does not change the string, so the count is $\dfrac{11!}{4!\,4!\,2!} = 34\,650$. Knuth calls $\binom{n}{n_1, n_2, \dots} = \frac{n!}{n_1!\,n_2!\cdots}$ a **multinomial coefficient** (§1.2.6 eq. (42)).

## The prime factorisation of n!

How many factors of $5$ does $100!$ contain? Every multiple of $5$ contributes one ($20$ of them), every multiple of $25$ contributes an extra one ($4$ of them): $24$ in total. In general (Knuth’s eq. (8), Legendre 1808):

$$\text{exponent of } p \text{ in } n! = \left\lfloor \frac np \right\rfloor + \left\lfloor \frac n{p^2} \right\rfloor + \left\lfloor \frac n{p^3} \right\rfloor + \dots$$

The sum is finite (terms become $0$) and never exceeds $n/(p-1)$. A slick equivalent: the exponent is $\dfrac{n - \nu_p(n)}{p - 1}$ where $\nu_p(n)$ is the digit sum of $n$ in base $p$ (exercise 6). For $p = 2$: $n!$ has $n - (\text{number of 1-bits of } n)$ factors of $2$.

**Trailing zeros** of $n!$ in decimal $=$ exponent of $5$ (there are always more $2$s than $5$s). So $100!$ ends in $24$ zeros and $1000!$ in $249$.

## How big is n!? Stirling’s approximation

Two easy bounds: $n! \le n^n$ (each factor is at most $n$) and $n! \ge (n/2)^{n/2}$ (the top half of the factors are each at least $n/2$). So $\lg n!$ is between $\frac n2 \lg \frac n2$ and $n \lg n$: of order $n \log n$. The exact asymptotic answer is **Stirling’s formula**:

$$n! = \sqrt{2\pi n}\left(\frac ne\right)^n\left(1 + \frac{1}{12n} + \frac{1}{288n^2} - \dots\right),$$

so in particular $n! \sim \sqrt{2\pi n}\,(n/e)^n$ (ratio tends to $1$) and

$$\ln n! = n\ln n - n + \tfrac12 \ln(2\pi n) + O(1/n), \qquad \lg n! = n \lg n - 1.4427n + O(\log n).$$

Knuth derives it in §1.2.11.2 from Euler’s summation formula; for now, use it. The relative error of the leading term is about $1/(12n)$: $0.8\%$ at $n = 10$.

:::example Using it
Comparison sorting must distinguish $n!$ orderings, so any decision tree has height at least $\lg n! \approx n\lg n - 1.44n$. Merge sort uses about $n \lg n$ comparisons: essentially optimal. That one calculation justifies half of Chapter 5.
:::

## The gamma function

Knuth also introduces $\Gamma(x)$, the smooth function with $\Gamma(n+1) = n!$ for integers and $\Gamma(x+1) = x\Gamma(x)$ in general (defined by $\Gamma(x) = \int_0^\infty t^{x-1}e^{-t}\,dt$). You will see $\Gamma(\tfrac12) = \sqrt\pi$ and generalised binomial coefficients $\binom{r}{k} = \frac{r^{\underline k}}{k!}$ for real $r$, which is why $\binom{-1/2}{k}$ makes sense (next topic). It is the reason “$x!$” for non-integer $x$ is not nonsense; you do not need to compute with it in Chapters 1–2.

## Things to have memorised

- $n!$ permutations; $n^{\underline k} = n!/(n-k)!$ arrangements of $k$ of them; divide by $\prod n_i!$ for repeated items.
- Exponent of $p$ in $n!$: $\sum_{k\ge1} \lfloor n/p^k \rfloor$; trailing zeros $=$ exponent of $5$.
- $\ln n! = n\ln n - n + O(\log n)$; $n! \approx \sqrt{2\pi n}(n/e)^n$.
- $\lg n!$ is $\Theta(n \log n)$: the sorting lower bound.
`,
};
