export default {
  id: 'analysis',
  goals: [
    'Compute the mean and variance of a small discrete distribution, directly and via its probability generating function.',
    'Use indicator variables and linearity of expectation to get averages without computing distributions.',
    'Reproduce Knuth’s analysis of Algorithm M: the expected number of maximum-changes is $H_n - 1$.',
    'Distinguish worst case, average case, and the distribution of a running time, and know what each requires.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.10', note: 'The showcase: Algorithm M (find the maximum) analysed completely. The recurrence for the probabilities p_{nk}, the generating function G_n(z), mean H_n − 1 and variance H_n − H_n^{(2)}, plus the definitions of mean, variance, and probability generating functions.' },
    { ref: 'Concrete Mathematics, Chapter 8', note: 'Discrete probability with generating functions, including the wonderful analysis of coin-flipping and hashing.' },
    { ref: 'TAOCP Vol. 1, §1.3.3', note: 'Permutations and their cycle structure: the first “real” average-case analysis in the book, using everything from §1.2.' },
  ],
  knuthExercises: [
    '1.2.10-1 [10]: what is the probability that the maximum is in position n (so A = 0)? (1/n.)',
    '1.2.10-4 [M15]: derive the variance of Algorithm M from the generating function.',
    '1.2.10-8 [M20]: the number of comparisons in Algorithm M is fixed; what quantity varies and why does Knuth analyse it?',
    '1.2.10-15 [M20]: the expected number of “records” when the elements are not distinct.',
  ],
  body: String.raw`
## Why this matters for TAOCP

The title of the book is *The Art of Computer Programming*, but its method is the *analysis of algorithms*, a phrase Knuth coined: for each algorithm, determine how much time it takes, exactly, on average and in the worst case, as a function of the input size. §1.2.10 is the model for the whole enterprise. It analyses the simplest possible algorithm, finding the maximum of $n$ numbers, and extracts an exact probability distribution, its mean, and its variance. Everything from the earlier topics is used: sums, harmonic numbers, generating functions, induction.

## Discrete probability in five lines

A random variable $X$ takes values $k$ with probabilities $p_k \ge 0$, $\sum_k p_k = 1$.

- **Mean (expected value):** $E[X] = \sum_k k\,p_k$.
- **Variance:** $\operatorname{Var}[X] = E[(X - EX)^2] = E[X^2] - (EX)^2$; the **standard deviation** is $\sigma = \sqrt{\operatorname{Var} X}$.
- **Linearity:** $E[X + Y] = E[X] + E[Y]$ *always*, independent or not. Variances add only for independent variables.
- **Indicator variables:** if $X_i = [\text{event } i \text{ happens}]$ then $E[X_i] = \Pr[\text{event } i]$, so the expected number of events that happen is $\sum_i \Pr[\text{event } i]$.
- **Chebyshev:** $\Pr[|X - EX| \ge c\sigma] \le 1/c^2$; a small variance means the mean is typical.

:::example A fair die
$p_k = \frac16$ for $k = 1..6$: $E X = \frac{21}6 = 3.5$; $E[X^2] = \frac{91}6$; $\operatorname{Var} X = \frac{91}6 - \frac{49}4 = \frac{35}{12}$; $\sigma \approx 1.71$. Knuth’s slogan: “a random variable is roughly its mean plus or minus its standard deviation”.
:::

## Algorithm M

> **Algorithm M** (Find the maximum). Given $X[1..n]$, set $m \leftarrow X[n]$ and $k \leftarrow n - 1$; while $k \ge 1$: if $X[k] > m$ then $m \leftarrow X[k]$; $k \leftarrow k - 1$.

The number of comparisons is always $n - 1$; the interesting quantity is $A$, the number of times $m$ is *changed*. Knuth assumes the $n$ values are distinct and in random order (all $n!$ orders equally likely) and asks: what is the distribution of $A$?

**The recurrence.** Let $p_{nk}$ be the probability that $A = k$. Consider the last element examined, $X[1]$. With probability $1/n$ it is the largest, and then $A$ equals (the $A$ of the other $n - 1$ elements) $+ 1$; with probability $(n-1)/n$ it is not, and $A$ is unchanged. Hence

$$p_{nk} = \frac1n p_{(n-1)(k-1)} + \frac{n-1}{n}p_{(n-1)k}.$$

**The generating function.** Let $G_n(z) = \sum_k p_{nk}z^k$. The recurrence becomes $G_n(z) = \frac{z + n - 1}{n}G_{n-1}(z)$, and with $G_1(z) = 1$,

$$G_n(z) = \frac{z+1}{2}\cdot\frac{z+2}{3}\cdots\frac{z+n-1}{n} = \frac{1}{n!}\prod_{k=1}^{n-1}(z + k).$$

A product of simple factors: $A$ is the sum of $n - 1$ *independent* indicators, the $k$-th being $1$ with probability $1/(k+1)$. (Combinatorially, $n!\,G_n(z)$ is the generating function for permutations by number of cycles, or by number of left-to-right maxima; see §1.3.3.)

**Mean and variance from the PGF.** For a probability generating function $G(z) = \sum p_k z^k$:

$$\text{mean} = G'(1), \qquad \text{variance} = G''(1) + G'(1) - G'(1)^2.$$

(Differentiate: $G'(1) = \sum k p_k$; $G''(1) = \sum k(k-1)p_k$.) For a product $G = \prod G_i$ of PGFs of independent variables, means add and variances add, so it suffices to handle one factor $\frac{z + k}{k+1}$: mean $\frac1{k+1}$, variance $\frac1{k+1} - \frac1{(k+1)^2}$. Summing over $k = 1..n-1$:

$$E[A] = H_n - 1, \qquad \operatorname{Var}[A] = H_n - H_n^{(2)}.$$

So the maximum changes about $\ln n$ times on average, with standard deviation about $\sqrt{\ln n}$: for $n = 1000$, about $6.5 \pm 2.4$ changes, although the worst case is $999$. **Worst-case and average-case analysis can give wildly different pictures**, which is the point of the section.

## The indicator shortcut

The mean, though not the variance, comes in one line without any recurrence: let $X_k = [X[k] \text{ is larger than all of } X[k+1..n]]$. The largest of the last $n - k + 1$ elements is equally likely to be any of them, so $E[X_k] = \frac{1}{n-k+1}$, and $E[A] = \sum_{k=1}^{n-1}\frac{1}{n-k+1} = H_n - 1$. The same argument gives:

| Random permutation of $n$ | Expected number |
|---|---|
| fixed points ($\pi(i) = i$) | $1$ |
| left-to-right maxima (records) | $H_n$ |
| cycles | $H_n$ (§1.3.3) |
| descents ($\pi(i) > \pi(i+1)$) | $(n-1)/2$ |
| inversions (pairs out of order) | $n(n-1)/4$ (§5.1.1) |

Inversions are the number of swaps insertion sort makes, so insertion sort takes about $n^2/4$ steps on average and $n^2/2$ in the worst case; that is the first analysis in Chapter 5, and you can now do it.

## Average case means a distribution on inputs

“Average case” is meaningless without a probability model of the inputs. Knuth is explicit about his: keys in random order, equally likely; or a target equally likely to be any key; or hash addresses uniformly random. Sequential search for a key equally likely to be any of $n$ makes $\frac{n+1}2$ comparisons on average; if the key is absent with probability $q$, $(1-q)\frac{n+1}2 + qn$. Change the model and the answer changes, which is why he states it every time.

## Probability generating functions: the toolkit

| Situation | PGF | Mean | Variance |
|---|---|---|---|
| constant $c$ | $z^c$ | $c$ | $0$ |
| fair coin (1 = heads) | $\frac{1+z}{2}$ | $\frac12$ | $\frac14$ |
| $n$ fair coins, number of heads | $\left(\frac{1+z}2\right)^n$ | $\frac n2$ | $\frac n4$ |
| fair $m$-sided die | $\frac{z + z^2 + \dots + z^m}{m}$ | $\frac{m+1}2$ | $\frac{m^2-1}{12}$ |
| sum of independent $X + Y$ | $G_X(z)G_Y(z)$ | add | add |
| Algorithm M | $\prod_{k<n}\frac{z+k}{k+1}$ | $H_n - 1$ | $H_n - H_n^{(2)}$ |

Products for sums of independent variables is the reason PGFs are so effective: convolution of distributions becomes multiplication, exactly as for counting.

## Where to go from here

You now have every tool §1.2 provides. Chapter 2 uses them lightly (mostly sums and induction); §1.3.3 on permutations and Chapter 5 on sorting use all of them, hard. When you get stuck on an analysis in the book, come back to the topic here, practise, and try again. And do Knuth’s exercises: the answers in the back are worked out in full, and reading a good solution after a real attempt is how the skill grows.
`,
};
