export default {
  id: 'numbers',
  goals: [
    'Manipulate powers and logarithms fluently: product, quotient, power, and change-of-base rules.',
    'Know what lg, ln, and log mean in Knuth, and why the base of a logarithm rarely matters in analysis.',
    'Estimate logarithms of round numbers in your head (bits ≈ 3.32 × decimal digits).',
    'Connect $\\lfloor \\lg n \\rfloor + 1$ with the number of bits of $n$ and with “how many times can I halve $n$”.',
  ],
  reading: [
    { ref: 'TAOCP Vol. 1, §1.2.2', note: 'Real numbers, rational numbers, and the definition of $b^x$ for real $x$; then logarithms, their laws, and Knuth’s notation $\\lg$, $\\ln$, $\\log$. He also derives a neat algorithm for computing logarithms by repeated squaring.' },
    { ref: 'Concrete Mathematics, §3.1 and §9', note: 'Integer functions (next topic) and the asymptotics of logs.' },
  ],
  knuthExercises: [
    '1.2.2-1 [00]: what is the smallest positive rational number? (A trick question about density.)',
    '1.2.2-5 [10]: which is larger, $\\lg 100$ or $\\ln 100$? Without a calculator.',
    '1.2.2-6 [10]: prove $\\log_b x = \\log_c x / \\log_c b$.',
    '1.2.2-12 [M10] and -13 [M10]: $x^{\\log_b y} = y^{\\log_b x}$ and its consequences.',
  ],
  body: String.raw`
## Why this matters for TAOCP

Logarithms measure *how many times you can halve something*, and halving is what binary search, balanced trees, merge sort and radix algorithms do. When Knuth says an algorithm takes $\lg n$ steps or that $n$ needs $\lfloor \lg n\rfloor + 1$ bits, you should see the picture immediately. Exponentials appear as the inverse: the number of leaves in a tree of height $h$, the number of subsets, the size of a search space.

## Powers

For a real number $b > 0$ and integer $n$: $b^n = b \cdot b \cdots b$ ($n$ factors), $b^0 = 1$, $b^{-n} = 1/b^n$. The laws you need, valid for all real exponents:

$$b^{x+y} = b^x b^y, \qquad b^{x-y} = \frac{b^x}{b^y}, \qquad (b^x)^y = b^{xy}, \qquad (ab)^x = a^x b^x.$$

Fractional exponents are roots: $b^{1/2} = \sqrt b$, $b^{m/n} = \sqrt[n]{b^m}$. Knuth defines $b^x$ for irrational $x$ as a limit of rational powers; you can take it on trust that the laws survive.

:::tip Powers of two to know cold
$2^{10} = 1024 \approx 10^3$, $2^{20} \approx 10^6$, $2^{30} \approx 10^9$, $2^{32} = 4\,294\,967\,296$, $2^{64} \approx 1.8\times 10^{19}$. So “a million” is 20 bits and “a billion” is 30 bits.
:::

## Logarithms

The logarithm to base $b$ is the inverse of $x \mapsto b^x$:

$$y = \log_b x \iff b^y = x \qquad (b > 0,\ b \ne 1,\ x > 0).$$

Read $\log_b x$ as “the exponent you must raise $b$ to in order to get $x$.” Since $2^{10} = 1024$, $\log_2 1024 = 10$; since $10^{-3} = 0.001$, $\log_{10} 0.001 = -3$.

The exponent laws translate directly into logarithm laws:

| Exponent law | Logarithm law |
|---|---|
| $b^{x} b^{y} = b^{x+y}$ | $\log_b (xy) = \log_b x + \log_b y$ |
| $b^{x}/b^{y} = b^{x-y}$ | $\log_b (x/y) = \log_b x - \log_b y$ |
| $(b^x)^c = b^{cx}$ | $\log_b (x^c) = c \log_b x$ |
| $b^{\log_b x} = x$ | $\log_b (b^y) = y$ |

Logarithms turn multiplication into addition. That is *why* they were invented (Napier, 1614), and why they measure “number of digits”: a number with $d$ decimal digits satisfies $10^{d-1} \le N < 10^d$, so $d = \lfloor \log_{10} N \rfloor + 1$.

### Change of base

$$\log_b x = \frac{\log_c x}{\log_c b}.$$

(Proof: write $x = b^{\log_b x}$ and take $\log_c$ of both sides.) Consequently **logarithms to different bases differ only by a constant factor**: $\log_2 x = \log_{10} x / \log_{10} 2 \approx 3.3219 \log_{10} x$. This is the reason $O(\log n)$ never specifies a base.

A cute consequence (Knuth’s exercise 12): $x^{\log_b y} = y^{\log_b x}$. Take $\log_b$ of both sides. It lets you rewrite $n^{\lg 3}$ as $3^{\lg n}$, which turns up in the analysis of Karatsuba multiplication and Strassen’s algorithm.

## Knuth’s three logarithms

| Notation | Base | Where it appears |
|---|---|---|
| $\lg x$ | 2 | anything binary: bits, halving, comparison trees. Knuth introduced this notation. |
| $\ln x$ | $e = 2.71828\ldots$ | calculus, Euler’s summation formula, harmonic numbers, $\ln n! \approx n\ln n - n$. |
| $\log x$ | unspecified (or 10) | when only the order of growth matters. |

Conversion constants worth memorising: $\ln 2 \approx 0.6931$, $\lg 10 \approx 3.3219$, $\log_{10} 2 \approx 0.30103$, $\ln 10 \approx 2.3026$, $\lg e \approx 1.4427$.

:::example Mental arithmetic
- $\lg 10^6 = 6\lg 10 \approx 19.9$, so a million needs 20 bits.
- $\ln 1000 = 3\ln 10 \approx 6.9$.
- $\lg 1000 = \lg 1024 - \lg 1.024 \approx 10 - 0.034 = 9.966$.
- How many digits has $2^{100}$? $100 \log_{10} 2 \approx 30.1$, so 31 digits.
:::

## Floors of logarithms: bits and halvings

For a positive integer $n$, $\lfloor \lg n \rfloor$ is the exponent of the largest power of $2$ not exceeding $n$, i.e. the position of the leading bit. Therefore:

- $n$ has $\lfloor \lg n \rfloor + 1$ bits in binary.
- Starting from $n$, you can halve (with floor) $\lfloor \lg n \rfloor$ times before reaching $1$.
- Binary search on $n$ sorted items needs at most $\lfloor \lg n \rfloor + 1$ probes.
- $\lceil \lg n \rceil$ bits suffice to number $n$ distinct things $0, \dots, n-1$.

The gap between $\lfloor \lg n \rfloor$ and $\lceil \lg n \rceil$ is exactly the kind of “$\pm 1$” detail Knuth is careful about; the next topic gives you the tools.

## Growth: a first look

For large $n$: $\log n \ll n^{\epsilon} \ll n \ll n\log n \ll n^2 \ll 2^n \ll n!$, where $\ll$ means “is eventually much smaller than”. In particular $\log n$ grows slower than **any** positive power of $n$: $\log n / n^{0.01} \to 0$. The growth-rate explorer under *Asymptotics* lets you see this; the *O-notation* topic makes it precise.

## Rational and irrational

Knuth also reminds you that $\sqrt 2$, $\pi$, $e$ and $\log_{10} 2$ are irrational, and that the rationals are dense in the reals (between any two there is another). The practical point for algorithms: computers approximate real numbers, and *exact* answers involve integers and rationals, which is why so much of TAOCP happens with integers, floors, and fractions.
`,
};
