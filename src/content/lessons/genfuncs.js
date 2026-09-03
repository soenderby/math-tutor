export default {
  id: 'genfuncs',
  goals: [
    'Translate between a sequence and its generating function for the basic cases (constants, powers, binomials, Fibonacci).',
    'Apply the operations: shift, scale, differentiate, prefix-sum, and multiply (convolution).',
    'Turn a linear recurrence into a rational generating function and extract coefficients by partial fractions.',
    'Read $[z^n]$ notation and use the binomial series $1/(1-z)^m$.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.9', note: 'Generating functions as formal power series; the catalogue of basic series (eqs. (3)–(11)); operations on them (eqs. (12)–(19)); solving the Fibonacci recurrence; and the “sum of a product” convolution interpretation.' },
    { ref: 'Concrete Mathematics, Chapter 7', note: 'A full course: domino tilings, coin change, the four steps for solving recurrences, exponential generating functions.' },
    { ref: 'Wilf, generatingfunctionology', note: 'Free online. The first two chapters are exactly what you need, written with great charm.' },
  ],
  knuthExercises: [
    '1.2.9-1 [M12]: find the generating function of the sequence 2, 5, 13, 35, … (= 2ⁿ + 3ⁿ).',
    '1.2.9-4 [M13]: find the GF for the sequence of squares n².',
    '1.2.9-9 [M20]: the GF of the harmonic numbers, ln(1/(1−z))/(1−z).',
    '1.2.9-18 [M25]: coefficients of 1/(1 − z − z²)ᵐ via binomial coefficients.',
  ],
  body: String.raw`
## Why this matters for TAOCP

A generating function is a way of handling a whole infinite sequence as one algebraic object. Knuth uses them to solve recurrences (§1.2.9), to compute averages and variances of algorithms (§1.2.10, where the *probability* generating function is the main tool), and to count things in Chapters 2, 5, 6 and 7. Once you see that “multiply the series by $1 - z - z^2$” is the same as “apply the Fibonacci recurrence”, a lot of the book stops looking like magic.

## What a generating function is

Given a sequence $\langle a_0, a_1, a_2, \dots\rangle$, its (ordinary) **generating function** is the power series

$$G(z) = a_0 + a_1 z + a_2 z^2 + \dots = \sum_{n\ge0} a_n z^n.$$

Knuth writes $[z^n]\,G(z)$ for the coefficient of $z^n$. Think of $G(z)$ as a clothesline on which the sequence is hung; the powers of $z$ just keep the terms in order. Convergence is mostly irrelevant: we treat $G$ as a *formal* power series and only ever equate coefficients. (When the series does converge, $G$ is an honest function, and calculus applies, which is often convenient.)

## The catalogue

| Sequence $a_n$ | $G(z)$ | Why |
|---|---|---|
| $1, 1, 1, \dots$ | $\dfrac{1}{1-z}$ | geometric series |
| $c^n$ | $\dfrac{1}{1-cz}$ | substitute $cz$ |
| $[n = k]$ | $z^k$ | a single term |
| $n + 1$ | $\dfrac{1}{(1-z)^2}$ | derivative of $1/(1-z)$ |
| $n$ | $\dfrac{z}{(1-z)^2}$ | shift the previous one |
| $\dbinom{n+m-1}{n}$ | $\dfrac{1}{(1-z)^m}$ | binomial series, upper negation (§1.2.9 eq. (7)) |
| $\dbinom mn$ | $(1+z)^m$ | binomial theorem |
| $[n \text{ even}]$ | $\dfrac{1}{1-z^2}$ | geometric series in $z^2$ |
| $F_n$ | $\dfrac{z}{1-z-z^2}$ | the recurrence (below) |
| $1/n!$ | $e^z$ | Taylor series |
| $1/n$ ($n \ge 1$) | $\ln\dfrac{1}{1-z}$ | integrate $1/(1-z)$ |
| $H_n$ | $\dfrac{1}{1-z}\ln\dfrac{1}{1-z}$ | prefix sums of the previous row |

## The operations

If $A(z) = \sum a_n z^n$ and $B(z) = \sum b_n z^n$ then (Knuth’s eqs. (12)–(19)):

| Coefficients | Generating function | Name |
|---|---|---|
| $\alpha a_n + \beta b_n$ | $\alpha A(z) + \beta B(z)$ | linearity |
| $a_{n-k}$ (zero for $n < k$) | $z^k A(z)$ | shift right |
| $a_{n+k}$ | $\bigl(A(z) - a_0 - \dots - a_{k-1}z^{k-1}\bigr)/z^k$ | shift left |
| $c^n a_n$ | $A(cz)$ | scaling |
| $n\,a_n$ | $zA'(z)$ | differentiate |
| $a_n/(n+1)$ | $\frac1z\int_0^z A(t)\,dt$ | integrate |
| $\sum_{k=0}^{n} a_k$ | $\dfrac{A(z)}{1-z}$ | prefix sums |
| $a_n - a_{n-1}$ | $(1-z)A(z)$ | differences |
| $\sum_{k} a_k b_{n-k}$ | $A(z)B(z)$ | **convolution** |

The last line is the heart of the matter. Multiplying two power series adds up all the ways the exponents can combine, and that is exactly the structure of “count the ways to split $n$ into a part of type $A$ and a part of type $B$”. The prefix-sum rule is the special case $B = 1/(1-z)$.

:::example Two derivations of $\sum n$
$\sum_{k\le n} k$ has generating function $\frac{1}{1-z}\cdot\frac{z}{(1-z)^2} = \frac{z}{(1-z)^3}$, and $[z^n]\frac{z}{(1-z)^3} = [z^{n-1}]\frac{1}{(1-z)^3} = \binom{n+1}{2}$. The sum-of-powers formulas fall out of the catalogue with no induction at all.
:::

## Solving a recurrence

Take $a_n = a_{n-1} + a_{n-2}$ for $n \ge 2$, $a_0 = 0$, $a_1 = 1$. The four steps (Concrete Math’s recipe):

1. **Write one equation valid for all $n$**, using Iverson brackets for the initial conditions: $a_n = a_{n-1} + a_{n-2} + [n = 1]$ (with $a_n = 0$ for $n < 0$).
2. **Multiply by $z^n$ and sum over all $n$.** By the shift rule: $A(z) = zA(z) + z^2A(z) + z$.
3. **Solve for $A(z)$:** $A(z) = \dfrac{z}{1 - z - z^2}$.
4. **Extract coefficients.** Factor $1 - z - z^2 = (1 - \phi z)(1 - \hat\phi z)$ and use partial fractions: $A(z) = \frac{1}{\sqrt5}\left(\frac{1}{1-\phi z} - \frac{1}{1-\hat\phi z}\right)$, so $a_n = \frac{\phi^n - \hat\phi^n}{\sqrt5}$. Binet’s formula, with no guessing.

The general principle: a recurrence $a_n = c_1 a_{n-1} + \dots + c_d a_{n-d}$ (constant coefficients) has a generating function $\dfrac{P(z)}{1 - c_1 z - \dots - c_d z^d}$ with $\deg P < d$; **the denominator is the recurrence**, the numerator encodes the initial values. Its coefficients are sums of terms $\rho^n$ (or $n^j\rho^n$ for repeated roots) where $1/\rho$ are the roots of the denominator. The generating-function explorer lets you type a rational function and watch the recurrence emerge.

:::tip Partial fractions in one line
For distinct $\rho_1, \rho_2$: $\dfrac{1}{(1-\rho_1 z)(1-\rho_2 z)} = \dfrac{1}{\rho_1 - \rho_2}\left(\dfrac{\rho_1}{1-\rho_1 z} - \dfrac{\rho_2}{1-\rho_2 z}\right)$, hence $[z^n] = \dfrac{\rho_1^{n+1} - \rho_2^{n+1}}{\rho_1 - \rho_2}$.
:::

## Counting with generating functions

How many ways can $n$ cents be made from 1-, 2- and 5-cent coins (order irrelevant)? Each coin type contributes a factor $(1 + z^c + z^{2c} + \dots) = \frac{1}{1-z^c}$, and the answer is $[z^n]\frac{1}{(1-z)(1-z^2)(1-z^5)}$. Multiplication does the case analysis for you. Knuth uses the same idea to count trees in §2.3.4.4, and the number of ways to choose $n$ things with repetition from $m$ types is $[z^n](1-z)^{-m} = \binom{n+m-1}{n}$, tying back to binomial coefficients.

## Exponential generating functions

For sequences that grow like $n!$, Knuth uses $\hat G(z) = \sum a_n z^n/n!$. Then $e^z$ is the constant sequence, and the product rule becomes the *binomial* convolution $\sum_k \binom nk a_k b_{n-k}$, which counts labelled structures. You will need these in §1.2.10 (only lightly) and in Chapter 5; skim on a first reading.

## Things to have memorised

- $\frac1{1-z} = \sum z^n$, $\frac1{1-cz} = \sum c^n z^n$, $\frac1{(1-z)^m} = \sum\binom{n+m-1}n z^n$, $\frac{z}{1-z-z^2} = \sum F_n z^n$.
- Shift = multiply by $z$; prefix sum = divide by $1 - z$; $n a_n$ = $zA'$; product = convolution.
- Recurrence with constant coefficients $\to$ rational GF whose denominator is the recurrence; partial fractions give the closed form.
`,
};
