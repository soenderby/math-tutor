export default {
  id: 'harmonic',
  goals: [
    'Compute small harmonic numbers exactly and estimate large ones with $\\ln n + \\gamma + 1/(2n)$.',
    'Explain why $\\ln n < H_n \\le 1 + \\ln n$ using the integral comparison.',
    'Use the identities $\\sum_{k \\le n} H_k = (n+1)H_n - n$ and $H_n - H_m = \\sum_{m < k \\le n} 1/k$.',
    'Recognise the situations in algorithm analysis where a harmonic number is the answer.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.7', note: 'Definition, the asymptotic expansion with Euler’s constant, generalised harmonic numbers $H_n^{(r)}$, and several sums involving $H_n$ that come from summation by parts.' },
    { ref: 'Concrete Mathematics, §6.3 and §6.4', note: 'Harmonic numbers, harmonic summation, and why $H_n$ is never an integer.' },
  ],
  knuthExercises: [
    '1.2.7-2 [M21]: are there any n > 1 with H_n an integer? Prove not.',
    '1.2.7-3 [M18]: prove Σ_{k≤n} H_k = (n+1)H_n − n.',
    '1.2.7-8 [M18]: Σ_{k≤n} H_k/k = ½(H_n² + H_n^{(2)}).',
    '1.2.7-14 [M22]: Σ_{k≤n} k H_k = ½ n(n+1)H_n − ¼ n(n−1).',
  ],
  body: String.raw`
## Why this matters for TAOCP

The harmonic number $H_n = 1 + \frac12 + \frac13 + \dots + \frac1n$ is the answer to a startling number of “how many on average” questions: how many times the maximum changes while scanning a list ($H_n - 1$), how many cycles a random permutation has ($H_n$), how many comparisons quicksort makes ($\approx 2nH_n$), how long the coupon collector waits ($nH_n$). Whenever the $k$-th step succeeds with probability $1/k$, a harmonic number appears. Knuth calls it “the discrete analogue of the logarithm”, and that is the way to think of it.

## Definition and small values

$$H_n = \sum_{k=1}^{n} \frac1k, \qquad H_0 = 0.$$

$H_1 = 1$, $H_2 = \tfrac32$, $H_3 = \tfrac{11}6$, $H_4 = \tfrac{25}{12}$, $H_5 = \tfrac{137}{60}$, $H_6 = \tfrac{49}{20}$, $H_{10} \approx 2.929$, $H_{100} \approx 5.187$, $H_{1000} \approx 7.485$, $H_{10^6} \approx 14.39$.

Two facts about the exact values: $H_n$ is never an integer for $n > 1$ (the highest power of $2$ up to $n$ occurs in only one denominator), and the denominators grow like $\operatorname{lcm}(1,\dots,n) \approx e^n$; so exact harmonic numbers are for small $n$ only.

## It grows like a logarithm

Compare $\frac1k$ with the area under $y = 1/x$: on $[k, k+1]$ the curve lies below $1/k$, on $[k-1, k]$ above it. Summing,

$$\ln(n+1) = \int_1^{n+1}\frac{dx}{x} < H_n \le 1 + \int_1^{n}\frac{dx}{x} = 1 + \ln n.$$

So $H_n$ is sandwiched within $1$ of $\ln n$, and $H_n = \Theta(\log n)$. The harmonic series **diverges** (there is no bound), but agonisingly slowly: $H_n > 10$ first happens at $n = 12\,367$, and $H_n > 100$ needs $n \approx 1.5\times 10^{43}$.

Knuth’s precise statement (§1.2.7 eq. (3), from Euler’s summation formula) is

$$H_n = \ln n + \gamma + \frac{1}{2n} - \frac{1}{12n^2} + \frac{1}{120n^4} - \dots,$$

where $\gamma = 0.5772156649\ldots$ is **Euler’s constant**, defined as $\lim_{n\to\infty}(H_n - \ln n)$. Nobody knows whether $\gamma$ is rational. For estimation, $H_n \approx \ln n + 0.5772 + \frac{1}{2n}$ is accurate to about $\frac{1}{12n^2}$, which for $n \ge 10$ is under $0.001$. The harmonic explorer plots this.

:::example Estimating
$H_{1000}$: $\ln 1000 = 3\ln 10 \approx 6.9078$; add $0.5772$ and $0.0005$: $7.4855$. True value $7.4855$. And $H_{2n} - H_n \to \ln 2 \approx 0.693$, since the $\gamma$’s cancel.
:::

## Sums involving harmonic numbers

Because $H_k$ is a sum, sums of $H_k$ are double sums, and the interchange rule from the *Sums* topic evaluates them. The most common:

$$\sum_{k=1}^{n} H_k = \sum_{k=1}^{n}\sum_{j=1}^{k}\frac1j = \sum_{j=1}^{n}\frac{n-j+1}{j} = (n+1)H_n - n.$$

(For each $j$, the term $1/j$ appears in $H_j, H_{j+1}, \dots, H_n$, that is $n - j + 1$ times.) Knuth derives the general pattern by **summation by parts**, the discrete integration by parts:

$$\sum_{k=1}^{n} a_k H_k = A_n H_n - \sum_{k=1}^{n-1} \frac{A_k}{k+1}, \quad A_k = a_1 + \dots + a_k,$$

which gives, for instance, $\sum_{k \le n} \binom km H_k = \binom{n+1}{m+1}\left(H_{n+1} - \frac1{m+1}\right)$ (his eq. (10)). You will not need to reproduce these on demand, but you should recognise the move: a sum with $H_k$ inside becomes a sum with $1/k$ inside.

Also handy: $H_n - H_m = \sum_{k=m+1}^{n}\frac1k$, and $H_{2n} = \frac12 H_n + \left(1 + \frac13 + \frac15 + \dots + \frac1{2n-1}\right)$.

## Generalised harmonic numbers

$H_n^{(r)} = \sum_{k \le n} k^{-r}$. For $r > 1$ these **converge**: $H_\infty^{(2)} = \frac{\pi^2}{6}$ (Euler), $H_\infty^{(r)} = \zeta(r)$, the Riemann zeta function. They show up as variances: the variance of the number of maximum-changes in Algorithm M is $H_n - H_n^{(2)}$, which is why that quantity is “about $\ln n$ with standard deviation about $\sqrt{\ln n}$”.

## Where H_n comes from in algorithms

Suppose you scan $n$ distinct numbers in random order and count how often the current one beats everything before it (a “record”). The $k$-th number is a record with probability $1/k$ (the largest of the first $k$ is equally likely to be in any position). By linearity of expectation the expected number of records is $\sum_{k \le n} 1/k = H_n$. This one argument, with variations, explains every appearance of $H_n$ in Chapters 1, 3, 5 and 6. Knuth’s Algorithm M (§1.2.10) is exactly this scan, and *Analysis of an Algorithm* here works through it.

## Things to have memorised

- $H_n = \ln n + \gamma + \frac1{2n} + O(n^{-2})$, $\gamma \approx 0.5772$; hence $\ln n < H_n \le 1 + \ln n$.
- $H_n = \Theta(\log n)$ and $H_n \to \infty$; $H_n^{(2)} \to \pi^2/6$.
- $\sum_{k\le n} H_k = (n+1)H_n - n$.
- Records / cycles / Algorithm M: expected count is a harmonic number.
`,
};
