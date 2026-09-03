export const notation = String.raw`
Knuth is careful and consistent about notation, and much of it has become standard *because* he used it. This is the set you will meet in §1.2 and Chapter 2, with the section that introduces each symbol.

## Numbers and functions

| Symbol | Meaning | Where |
|---|---|---|
| $\lfloor x \rfloor$ | floor: the greatest integer $\le x$. $\lfloor -1.5 \rfloor = -2$. | §1.2.4 |
| $\lceil x \rceil$ | ceiling: the least integer $\ge x$. $\lceil x \rceil = -\lfloor -x \rfloor$. | §1.2.4 |
| $x \bmod y$ | $x - y\lfloor x/y \rfloor$, for **real** $x, y$; $x \bmod 0 = x$. Result has the sign of $y$. | §1.2.4 |
| $a \equiv b \pmod m$ | $a \bmod m = b \bmod m$, i.e. $m$ divides $a - b$. | §1.2.4 |
| $\gcd(m, n)$, $m \perp n$ | greatest common divisor; $m \perp n$ means $\gcd(m,n) = 1$ (“relatively prime”). | §1.2.4 |
| $\lg x$ | $\log_2 x$, the binary logarithm. | §1.2.2 |
| $\ln x$ | $\log_e x$, the natural logarithm. | §1.2.2 |
| $\log x$ | logarithm to an unspecified (or base-10) base; used when the base does not matter. | §1.2.2 |
| $\exp x$, $e^x$ | the exponential function; $e = 2.71828\ldots$ | §1.2.2 |
| $n!$ | $1\cdot 2\cdots n$; $0! = 1$. | §1.2.5 |
| $x^{\underline{k}}$ | falling factorial power $x(x-1)\cdots(x-k+1)$. | §1.2.5 |
| $x^{\overline{k}}$ | rising factorial power $x(x+1)\cdots(x+k-1)$. | §1.2.5 |
| $\Gamma(x)$ | gamma function, $\Gamma(n+1) = n!$ | §1.2.5 |
| $\binom{r}{k}$ | binomial coefficient $\dfrac{r(r-1)\cdots(r-k+1)}{k!}$ for any real $r$, integer $k \ge 0$; $0$ for $k < 0$. | §1.2.6 |
| $\binom{n}{n_1, n_2, \dots}$ | multinomial coefficient $\dfrac{n!}{n_1!\,n_2!\cdots}$ | §1.2.6 |
| $H_n$ | harmonic number $1 + \frac12 + \dots + \frac1n$; $H_n^{(r)} = \sum_{k \le n} k^{-r}$. | §1.2.7 |
| $\gamma$ | Euler’s constant $0.5772156649\ldots = \lim (H_n - \ln n)$ | §1.2.7 |
| $F_n$ | Fibonacci numbers, $F_0 = 0$, $F_1 = 1$, $F_n = F_{n-1} + F_{n-2}$. | §1.2.8 |
| $\phi$, $\hat\phi$ | golden ratio $\frac{1+\sqrt5}{2} \approx 1.618$ and its conjugate $\frac{1-\sqrt5}{2} \approx -0.618$. | §1.2.8 |
| $\delta_{ij}$ | Kronecker delta: $1$ if $i = j$, else $0$. | §1.2.3 |
| $[P]$ | Iverson bracket: $1$ if statement $P$ is true, $0$ if false. (Knuth adopted it in the 3rd edition.) | §1.2.3 |
| $\{x\}$ | occasionally the fractional part $x - \lfloor x\rfloor$ (more often $x \bmod 1$). | §1.2.4 |

## Sums, products, series

| Notation | Meaning | Where |
|---|---|---|
| $\sum_{k=1}^{n} a_k$ | $a_1 + a_2 + \dots + a_n$; empty when $n < 1$ (value $0$). | §1.2.3 |
| $\sum_{R(k)} a_k$ | sum over all integers $k$ satisfying the condition $R(k)$, e.g. $\sum_{1 \le k \le n,\ k \text{ odd}}$. | §1.2.3 |
| $\prod_{R(k)} a_k$ | product over $k$ with $R(k)$; empty product $= 1$. | §1.2.3 |
| $\sum_{k} a_k [R(k)]$ | same as $\sum_{R(k)} a_k$, using the Iverson bracket. | §1.2.3 |
| $[z^n]\, G(z)$ | the coefficient of $z^n$ in the power series $G(z)$. | §1.2.9 |
| $G(z) = \sum_n a_n z^n$ | the (ordinary) generating function of $\langle a_n \rangle$. | §1.2.9 |
| $\langle a_n \rangle$ | the sequence $a_0, a_1, a_2, \dots$ | §1.2.9 |

## Asymptotics

| Notation | Meaning | Where |
|---|---|---|
| $f(n) = O(g(n))$ | there are constants $C, n_0$ with $\lvert f(n) \rvert \le C\,g(n)$ for all $n \ge n_0$. **One-way equality**: $n = O(n^2)$ is fine, $O(n^2) = n$ is meaningless. | §1.2.11.1 |
| $f(n) = \Omega(g(n))$ | $g(n) = O(f(n))$ (lower bound). | §1.2.11.1 |
| $f(n) = \Theta(g(n))$ | both $O$ and $\Omega$: same order of growth. | §1.2.11.1 |
| $f(n) = o(g(n))$ | $f(n)/g(n) \to 0$ (strictly smaller order). | §1.2.11.1 |
| $f(n) \sim g(n)$ | $f(n)/g(n) \to 1$ (asymptotically equal). | §1.2.11 |
| $O(f) + O(g) = O(\lvert f \rvert + \lvert g \rvert)$ etc. | the algebra of O-terms, eqs. (13)–(20). Each $O$ stands for a *different* anonymous function; $O(f) - O(f) = O(f)$, not $0$. | §1.2.11.1 |

## Algorithms and probability

| Notation | Meaning | Where |
|---|---|---|
| Algorithm E, step E1 | algorithms are named by a letter; steps are numbered. “Go to step E2.” | §1.1 |
| $\Pr[X = k]$, $p_k$ | probability that random variable $X$ takes the value $k$. | §1.2.10 |
| $E X$, $E[X]$ | expected value $\sum_k k\,p_k$ (Knuth writes $\mathrm{mean}(g)$ for the mean of a distribution with generating function $g$). | §1.2.10 |
| $\mathrm{var}(X)$, $\sigma^2$ | variance $E[(X - EX)^2] = E[X^2] - (EX)^2$; $\sigma$ is the standard deviation. | §1.2.10 |
| $G(z) = \sum_k p_k z^k$ | probability generating function: mean $= G'(1)$, variance $= G''(1) + G'(1) - G'(1)^2$. | §1.2.10 |
| $\langle x_1 x_2 \dots \rangle$ | Knuth’s angle brackets for a sequence or ordered tuple. | §1.2 |

:::note A few conventions worth knowing
- Vectors and sequences are indexed from **1** in most algorithms ($X[1..n]$), but sequences in generating functions start at $a_0$.
- $\log$ without base in an $O$-expression is deliberately base-free: $O(\log n)$ is the same set for every base.
- Knuth writes $\Rightarrow$ for implication and often uses “iff” for “if and only if”.
- Exercise answers use the same equation numbers as the section; “(23)” in an answer to an exercise in §1.2.6 means equation (23) of §1.2.6.
:::
`;
