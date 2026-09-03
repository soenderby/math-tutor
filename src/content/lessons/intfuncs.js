export default {
  id: 'intfuncs',
  goals: [
    'Compute floors, ceilings and Knuth’s mod for positive, negative and fractional arguments without hesitating.',
    'Prove or refute floor/ceiling identities by writing $x = \\lfloor x \\rfloor + \\theta$ with $0 \\le \\theta < 1$.',
    'Run Euclid’s algorithm by hand, explain why it works, and use the extended version to find inverses modulo $m$.',
    'Manipulate congruences: what you may add, multiply, and (with care) cancel.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.4', note: 'Floor and ceiling and their properties, the general definition of mod, congruences, and elementary number theory: gcd, relatively prime numbers, the fundamental theorem of arithmetic.' },
    { ref: 'Concrete Mathematics, Chapters 3 and 4', note: 'Integer functions in great depth (including the “spectrum” of a number), then number theory: primes, factorials, congruences, and the Chinese remainder theorem.' },
  ],
  knuthExercises: [
    '1.2.4-1 [00] to -5 [10]: warm-ups on floors and ceilings.',
    '1.2.4-13 [M20]: ⌊√⌊x⌋⌋ = ⌊√x⌋ and its generalisation to monotone functions.',
    '1.2.4-36 [M20]: the number of digits of n in base b.',
    '1.2.4-40 [M22]: if a ≡ b (mod m) and gcd(a, m) = 1 then a and b have the same inverse modulo m.',
  ],
  body: String.raw`
## Why this matters for TAOCP

Computers work with integers, and the fundamental integer operations are division with remainder and rounding. Every time an algorithm splits $n$ items into halves, addresses a table with a hash, or counts multiples, a floor or a mod appears, and getting the “$\pm 1$” right is the whole difference between a correct algorithm and an off-by-one bug. Knuth introduces the notation here and then uses it on nearly every page.

## Floor and ceiling

$$\lfloor x \rfloor = \text{the greatest integer} \le x, \qquad \lceil x \rceil = \text{the least integer} \ge x.$$

So $\lfloor 3.7 \rfloor = 3$, $\lceil 3.7 \rceil = 4$, $\lfloor -3.7 \rfloor = -4$, $\lceil -3.7 \rceil = -3$, and $\lfloor 5 \rfloor = \lceil 5 \rceil = 5$. On the number line, floor moves left to the nearest integer, ceiling moves right; for negative numbers that means floor moves *away from zero*. (Programming languages that truncate toward zero compute something else.)

The properties Knuth lists, all provable from the definition:

- $\lceil x \rceil = -\lfloor -x \rfloor$ (reflect the line).
- $\lfloor x \rfloor = \lceil x \rceil$ iff $x$ is an integer; otherwise $\lceil x \rceil = \lfloor x \rfloor + 1$.
- $\lfloor x + n \rfloor = \lfloor x \rfloor + n$ for integer $n$.
- $\lfloor x \rfloor \le x < \lfloor x \rfloor + 1$; equivalently $x - 1 < \lfloor x \rfloor \le x$.
- $\lfloor x \rfloor + \lfloor y \rfloor \le \lfloor x + y \rfloor \le \lfloor x \rfloor + \lfloor y \rfloor + 1$.
- For integer $n$: $\lfloor n/2 \rfloor + \lceil n/2 \rceil = n$.

:::tip The one technique
To prove or disprove a floor identity, write $x = \lfloor x \rfloor + \theta$ with $0 \le \theta < 1$ (θ is the fractional part) and compute. To disprove, try $x = \tfrac12$, $x = -\tfrac12$, or an integer; most false identities die on one of these.
:::

A deeper fact (exercise 13, Concrete Math theorem 3.10): if $f$ is continuous and increasing and $f(x)$ is an integer only when $x$ is an integer, then $\lfloor f(\lfloor x \rfloor) \rfloor = \lfloor f(x) \rfloor$. Consequences: $\lfloor \sqrt{\lfloor x \rfloor} \rfloor = \lfloor \sqrt x \rfloor$ and $\lfloor \lfloor x \rfloor / n \rfloor = \lfloor x / n \rfloor$, so nested integer divisions collapse: $\lfloor \lfloor n/2 \rfloor / 2 \rfloor = \lfloor n/4 \rfloor$.

## Knuth’s mod

$$x \bmod y = x - y\left\lfloor \frac{x}{y} \right\rfloor \quad (y \ne 0), \qquad x \bmod 0 = x.$$

This is defined for **real** $x$ and $y$, not just integers, and it always yields a value with the same sign as $y$ (or zero): for $y > 0$, $0 \le x \bmod y < y$. Examples: $7 \bmod 3 = 1$; $-7 \bmod 3 = -7 - 3\lfloor -2.33 \rfloor = -7 + 9 = 2$; $7 \bmod -3 = 7 - (-3)\lfloor -2.33\rfloor = 7 - 9 = -2$; $\pi \bmod 1 = 0.14159\ldots$; $x \bmod 1$ is the fractional part of $x$.

:::warning Languages disagree
C, Java and JavaScript return $-1$ for $-7 \% 3$ (truncated division); Python returns $2$ (floored, like Knuth). When you implement one of Knuth’s algorithms with negative operands, check which one your language uses.
:::

The useful algebra: $(a + b) \bmod m = ((a \bmod m) + (b \bmod m)) \bmod m$, and similarly for products. You can reduce mod $m$ at every step of a computation without changing the final residue, which is what makes modular exponentiation feasible.

## Congruences

$a \equiv b \pmod m$ means $a \bmod m = b \bmod m$, equivalently $m$ divides $a - b$. Congruences behave like equations for addition, subtraction and multiplication:

$$a \equiv b,\ c \equiv d \pmod m \implies a \pm c \equiv b \pm d,\quad ac \equiv bd \pmod m,$$

and hence $a^n \equiv b^n$. **Division is the exception:** from $ac \equiv bc \pmod m$ you may conclude $a \equiv b \pmod m$ only if $\gcd(c, m) = 1$ (in general you get $a \equiv b \pmod{m/\gcd(c,m)}$). Example: $2 \cdot 1 \equiv 2 \cdot 4 \pmod 6$ but $1 \not\equiv 4$.

When $\gcd(a, m) = 1$, $a$ has an **inverse** modulo $m$: an $a'$ with $aa' \equiv 1$. Then $ax \equiv b$ has the unique solution $x \equiv a'b \pmod m$. The extended Euclidean algorithm (below) computes $a'$.

## gcd and Euclid’s algorithm

$\gcd(m, n)$ is the largest integer dividing both; $\gcd(m, 0) = m$. Two numbers are **relatively prime** if their gcd is $1$; Knuth writes $m \perp n$. Properties: $\gcd(m, n) = \gcd(n, m) = \gcd(m, n - m) = \gcd(m, n \bmod m)$, and the last one is the whole algorithm:

> **Algorithm E.** Given $m, n > 0$. While $n \ne 0$: set $r \leftarrow m \bmod n$, $m \leftarrow n$, $n \leftarrow r$. Output $m$.

Each step preserves the gcd (invariant) and strictly decreases $n$ (termination), so the output is the gcd of the original inputs; this is the induction proof from §1.2.1. Worked example: $\gcd(1071, 462)$: $1071 = 2\cdot 462 + 147$; $462 = 3\cdot 147 + 21$; $147 = 7 \cdot 21 + 0$; answer $21$.

**How many steps?** At most about $4.8\log_{10} n$: the worst case is consecutive Fibonacci numbers, where every quotient is $1$. Knuth proves this in §4.5.3; the Euclid explorer lets you watch it.

**Extended Euclid** carries along integers $a, b$ with $am + bn = $ (current remainder). At the end, $am + bn = \gcd(m, n)$; this is Bézout’s identity. If the gcd is $1$, then $am \equiv 1 \pmod n$, so $a$ is the inverse of $m$ modulo $n$. Knuth gives this as Algorithm X in §4.5.2, and it is the engine behind modular arithmetic, the Chinese remainder theorem, and RSA.

## Primes and factorisation

Every integer $n > 1$ is a product of primes in exactly one way (the *fundamental theorem of arithmetic*); Knuth proves uniqueness from the lemma “if a prime divides $ab$, it divides $a$ or $b$”, which itself follows from Bézout. Write $n = \prod_p p^{n_p}$. Then

$$\gcd(m, n) = \prod_p p^{\min(m_p, n_p)}, \qquad \operatorname{lcm}(m, n) = \prod_p p^{\max(m_p, n_p)}, \qquad \gcd(m,n)\operatorname{lcm}(m,n) = mn.$$

The **lcm** is the smallest positive common multiple; use $mn/\gcd(m,n)$, never factorisation, to compute it.

## Counting with floors

The number of multiples of $d$ among $1, \dots, n$ is $\lfloor n/d \rfloor$. That single fact, plus inclusion–exclusion, answers a surprising number of counting questions, and it is the basis of Legendre’s formula for the power of a prime in $n!$ (next topic). The number of integers in the half-open interval $[\alpha, \beta)$ is $\lceil \beta \rceil - \lceil \alpha \rceil$; in $(\alpha, \beta]$ it is $\lfloor \beta \rfloor - \lfloor \alpha \rfloor$ (Concrete Math 3.12). Half-open intervals are the ones that behave.

## Things to have memorised

- $\lfloor -x \rfloor = -\lceil x \rceil$; $\lceil x \rceil - \lfloor x \rfloor = [x \notin \mathbb Z]$.
- $x \bmod y$ has the sign of $y$; $x \bmod 1 = \{x\}$.
- $\gcd(a, b) = \gcd(b, a \bmod b)$; consecutive Fibonacci numbers are Euclid’s worst case.
- $a$ is invertible mod $m$ iff $\gcd(a, m) = 1$; the inverse comes from extended Euclid.
- Multiples of $d$ up to $n$: $\lfloor n/d \rfloor$.
`,
};
