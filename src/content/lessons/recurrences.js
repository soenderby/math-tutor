export default {
  id: 'recurrences',
  goals: [
    'Set up a recurrence from a description of a process or an algorithm, including the base case.',
    'Solve first-order recurrences by unrolling, and linear recurrences with constant coefficients via the characteristic equation.',
    'Solve divide-and-conquer recurrences for $n$ a power of $2$, and state their orders of growth.',
    'Use “compute, guess, prove by induction” as the fallback method that always works.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.9 and §1.2.10', note: 'Knuth does not have a separate section on recurrences; he solves them as they arise, by generating functions (§1.2.9) and by summation. §1.2.10 solves a recurrence for the probability distribution of Algorithm M.' },
    { ref: 'Concrete Mathematics, Chapter 1 (Recurrent Problems) and §7.3', note: 'Tower of Hanoi, lines in the plane, Josephus; then the general method with generating functions. Chapter 1 is the friendliest possible introduction.' },
    { ref: 'Any algorithms textbook on the “master theorem”', note: 'For divide-and-conquer recurrences; Knuth treats specific cases in Chapters 4 and 5 rather than the general theorem.' },
  ],
  knuthExercises: [
    '1.2.9-6 [M20]: solve a_n = a_{n−1} + a_{n−2} + … + a_0 by generating functions.',
    '1.2.10-3 [M20]: solve the recurrence for the variance in Algorithm M.',
    'Concrete Math 1.2: Tower of Hanoi with the restriction that moves must go through the middle peg.',
    'Concrete Math 1.8: solve a_n = (1 + a_{n−1})/a_{n−2}, a “nonlinear” recurrence that turns out periodic.',
  ],
  body: String.raw`
## Why this matters for TAOCP

Analysing a recursive or iterative algorithm almost always produces a **recurrence**: the cost for input size $n$ expressed through the cost for smaller sizes. Merge sort gives $T(n) = 2T(n/2) + n$; the average number of comparisons in quicksort gives $C_n = n + 1 + \frac2n\sum_{k<n}C_k$; the height of a random tree gives something nastier. Knuth solves these as they come up, so it pays to have the standard techniques ready.

## Setting one up

A recurrence needs two parts: the **relation** for general $n$ and enough **initial values** to get started. The Tower of Hanoi: to move $n$ disks, move $n - 1$ to the spare peg, move the largest, move $n - 1$ back. So $T(n) = 2T(n-1) + 1$, $T(0) = 0$. Compute a few: $0, 1, 3, 7, 15, 31$; guess $T(n) = 2^n - 1$; prove by induction: $2(2^{k}-1) + 1 = 2^{k+1} - 1$ ✓. Three steps, and the third is the *Induction* topic.

The other two Concrete Mathematics openers: $n$ lines cut the plane into at most $L(n) = L(n-1) + n$ regions, so $L(n) = 1 + \frac{n(n+1)}2$; and the Josephus survivor $J(n)$ satisfies $J(2n) = 2J(n) - 1$, $J(2n+1) = 2J(n) + 1$, whose solution is “rotate the binary representation of $n$ left by one bit”.

:::warning Small cases can lie
$n$ points on a circle with all chords drawn: $1, 2, 4, 8, 16$ regions, then $31$. The true formula is $1 + \binom n2 + \binom n4$. Compute, guess, but *prove*.
:::

## First-order linear recurrences

$a_n = c\,a_{n-1} + d$, $a_0$ given. Unroll: $a_n = c^n a_0 + d(1 + c + \dots + c^{n-1}) = c^n a_0 + d\,\dfrac{c^n - 1}{c - 1}$ (for $c \ne 1$; for $c = 1$ it is $a_0 + dn$). Knuth’s slicker version: find the fixed point $a^* = d/(1-c)$ and note that $b_n = a_n - a^*$ satisfies $b_n = c\,b_{n-1}$, a pure geometric sequence. Hanoi: $c = 2, d = 1$, fixed point $-1$, so $T(n) + 1 = 2^n$.

For $a_n = a_{n-1} + f(n)$ the solution is just a sum: $a_n = a_0 + \sum_{k=1}^{n} f(k)$; solving it *is* the *Sums* topic. For $a_n = c\,a_{n-1} + f(n)$, divide through by $c^n$: $\frac{a_n}{c^n} = \frac{a_{n-1}}{c^{n-1}} + \frac{f(n)}{c^n}$, again a sum. That trick handles $a_n = 2a_{n-1} + 2^n$ (answer $n2^n$) and $a_n = 2a_{n-1} + n$ (answer $2^{n+1} - n - 2$).

## Linear recurrences with constant coefficients

$a_n = p\,a_{n-1} + q\,a_{n-2}$. Guess $a_n = \rho^n$: then $\rho^2 = p\rho + q$, the **characteristic equation**. If it has distinct roots $\rho_1, \rho_2$, every solution is $A\rho_1^n + B\rho_2^n$ with $A, B$ fixed by $a_0, a_1$. If the root is repeated, the solutions are $(A + Bn)\rho^n$. Fibonacci: $\rho^2 = \rho + 1$, roots $\phi, \hat\phi$, and Binet’s formula. The same recipe works for any order.

This is the *same* calculation as partial fractions on the generating function $\frac{P(z)}{1 - pz - qz^2}$: the roots of the characteristic polynomial are the reciprocals of the roots of the denominator. Use whichever you find less error-prone; Knuth prefers generating functions because they also handle non-homogeneous terms and variable coefficients.

:::example $a_n = 5a_{n-1} - 6a_{n-2}$, $a_0 = 0$, $a_1 = 1$
$\rho^2 - 5\rho + 6 = (\rho - 2)(\rho - 3)$, so $a_n = A2^n + B3^n$. From $a_0$: $A + B = 0$; from $a_1$: $2A + 3B = 1$; so $B = 1, A = -1$ and $a_n = 3^n - 2^n$. Check: $a_2 = 9 - 4 = 5 = 5\cdot1 - 6\cdot0$ ✓.
:::

## Divide and conquer

$T(n) = aT(n/b) + f(n)$ describes an algorithm that splits a problem of size $n$ into $a$ subproblems of size $n/b$ and spends $f(n)$ combining. For $n = b^k$, unroll: level $i$ has $a^i$ subproblems of size $n/b^i$, so

$$T(n) = a^kT(1) + \sum_{i=0}^{k-1} a^i f(n/b^i).$$

The competition is between $a^k = n^{\log_b a}$ (the number of leaves) and $f(n)$ (the work at the root). Three cases, the “master theorem”:

| Compare $f(n)$ with $n^{\log_b a}$ | $T(n)$ | Example |
|---|---|---|
| $f$ polynomially smaller | $\Theta(n^{\log_b a})$ | $T = 2T(n/2) + 1 \Rightarrow \Theta(n)$; Karatsuba $T = 3T(n/2) + n \Rightarrow \Theta(n^{\lg 3})$ |
| same order | $\Theta(n^{\log_b a}\log n)$ | merge sort $T = 2T(n/2) + n \Rightarrow \Theta(n\log n)$; binary search $T = T(n/2) + 1 \Rightarrow \Theta(\log n)$ |
| $f$ polynomially larger | $\Theta(f(n))$ | $T = 2T(n/2) + n^2 \Rightarrow \Theta(n^2)$ |

For exact answers when $n$ is a power of two, the sum above is a geometric series and can be evaluated exactly; for other $n$, floors and ceilings creep in ($T(n) = T(\lfloor n/2\rfloor) + T(\lceil n/2 \rceil) + n$), and Knuth is one of the few authors who handles them honestly (§5.2.4 for merge sort).

## Recurrences with a sum inside

Quicksort’s average comparisons satisfy $C_n = n + 1 + \frac2n\sum_{k=0}^{n-1}C_k$. The trick: multiply by $n$, subtract the same equation for $n - 1$, and the sum disappears: $nC_n - (n-1)C_{n-1} = 2n + 2C_{n-1}$. Dividing by $n(n+1)$ makes it telescope, and out comes $C_n = 2(n+1)H_n - 2n$, roughly $1.39n\lg n$ (check: $C_1 = 2$, $C_2 = 5$). Knuth does this in §5.2.2; every step uses a tool from this course (sums, harmonic numbers, induction).

## When nothing works

Compute the first ten terms and look them up in the OEIS (the On-Line Encyclopedia of Integer Sequences). Then prove what you find. Knuth did it without the OEIS, but you need not.

## Things to have memorised

- $a_n = ca_{n-1} + d \Rightarrow a_n = c^n a_0 + d\frac{c^n - 1}{c - 1}$; Hanoi $2^n - 1$.
- Characteristic equation $\rho^2 = p\rho + q$; distinct roots $\Rightarrow A\rho_1^n + B\rho_2^n$; repeated $\Rightarrow (A + Bn)\rho^n$.
- $T = 2T(n/2) + n \Rightarrow n\lg n$; $T = T(n/2) + 1 \Rightarrow \lg n$; $T = 2T(n/2) + 1 \Rightarrow 2n - 1$ (for $T(1) = 1$).
- Guess from small cases, prove by induction; the denominator of the generating function is the recurrence.
`,
};
