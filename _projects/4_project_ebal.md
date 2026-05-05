---
layout: page
title: Entropy Balancing
description: 
img: assets/img/entropy.jpeg
importance: 1
category: methods
related_publications: true
---

Entropy Balancing is a statistical method implemented as both an R package and a Stata routine, designed for reweighting data to achieve covariate balance in observational studies.

The method is based on the approaches developed in {% cite hainmueller2012entropy %} and {% cite hainmueller2013ebalance %} , and it won the Warren Miller Award from the Society of Political Methodology in 2020.

## What's new in `ebal` 0.3-0 (May 2026)

The R package gained a substantial set of additions in May 2026:

* **Autodiff solver via `torch`.** A new `method = "autodiff"` argument runs BFGS on gradients computed by automatic differentiation — more stable when the dual loss is poorly conditioned and scales better at large covariate counts. Newton-Raphson remains the default. **Contributed by Apoorva Lal**, ported from his fork at [github.com/apoorvalal/ebal](https://github.com/apoorvalal/ebal); Apoorva is now listed as `aut` on the package.
* **Tidyverse-friendly extractors.** `tidy()`, `glance()`, `augment()` registered against the `generics` package generics, so `library(broom)` makes them discoverable. `as.data.frame.ebalance()` returns the balance table.
* **`ggplot2` Love plot.** `autoplot(fit)` produces a publication-ready figure of standardized differences before vs. after weighting.
* **Quickstart vignette.** `vignette("ebal-quickstart", package = "ebal")` walks through a worked example with both solver methods.
* **Five validated bug fixes** rolled in: stricter `base.weight` validation, NA-safe `Treatment` and formula handling, autodiff coefficient round-trip, and a double-multiplier bug in `ebalance.trim()` that was over-trimming feasible targets.

### Worked example: Lalonde NSW vs. PSID controls

The 1986 Lalonde benchmark — NSW job-training trial controls replaced by 429 PSID respondents — is the textbook stress test for covariate-adjustment methods. The naive comparison gives a massively biased estimate. With `ebal` 0.3-0 the workflow is six lines:

```r
library(ebal); library(generics); library(ggplot2)
data(lalonde, package = "cobalt")

# Naive ATT (wrong sign, wrong magnitude)
with(lalonde, mean(re78[treat == 1]) - mean(re78[treat == 0]))
#> -635   (experimental benchmark = +1794)

# Build the design matrix
X <- model.matrix(~ age + educ + race + married + nodegree + re74 + re75,
                  data = lalonde)
X <- X[, colnames(X) != "(Intercept)"]

# Newton solver (default)
fit <- ebalance(Treatment = lalonde$treat, X = X)

# Autodiff solver (Apoorva Lal's contribution)
fit_ad <- ebalance(Treatment = lalonde$treat, X = X, method = "autodiff")

# Balance table — every standardized difference is now zero (within tol)
tidy(fit)[, c("term", "std_diff_pre", "std_diff_post")]
#>        term std_diff_pre std_diff_post
#>         age       -0.242             0
#>        educ        0.045             0
#>  racehispan       -0.277             0
#>   racewhite       -1.406             0
#>     married       -0.719             0
#>    nodegree        0.235             0
#>        re74       -0.596             0

# Weighted regression for the ATT
df <- lalonde
df$w <- ifelse(lalonde$treat == 1, 1, fit$w)
coef(lm(re78 ~ treat, data = df, weights = w))[2]
#> +1273   (vs. naive -635, vs. experimental +1794)

# Love plot via autoplot
autoplot(fit)
```

Newton and autodiff produce **the same ATT estimate to the dollar**, confirming the two solvers are numerically equivalent on this real-data problem. The Kish effective sample size is 98 out of 429 controls — one quarter of the donor pool carries most of the weight, which is what you'd expect when the PSID-vs-NSW gap is this large.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/ebal_lalonde_loveplot.png" title="Love plot of standardized differences before vs after entropy balancing" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Love plot from <code>autoplot()</code>: standardized differences between the NSW treated group and the PSID controls. Open circles are the raw differences (every covariate is far from zero, with race and marriage status as the worst offenders). Filled dots are the post-weighting differences — exact zero for every covariate by construction.
</div>

The previous release (0.2.1, April 2026) added a formula interface (`ebalance(treat ~ x1 + x2, data = df)`), `print()`/`summary()`/`plot()`/`weights()` S3 methods, and numerical hardening for `ebalance.trim()`. Source on [GitHub](https://github.com/j-hai/ebal).

The Stata routine was likewise updated to version 1.5.5 in April 2026 with bug fixes (a leftover debug print, a wrong-variable-name in the 3rd-moment failure diagnostic, silent-failure exits that bypassed `_rc`), a new `quietly` option for production scripts, a `replace` option that now also applies to `gen()`, and numerical hardening (cap on the linear predictor before `exp()` to prevent `Inf → NaN` propagation under ill-conditioned data). No numerical changes; verified byte-for-byte against the 1.5.3 baseline. Source on [GitHub](https://github.com/j-hai/ebal-stata).

---
[Entropy Balancing for R](https://search.r-project.org/CRAN/refmans/ebal/html/ebalance.html) — also on [GitHub](https://github.com/j-hai/ebal)

---

[Entropy Balancing for Stata](https://www.jstatsoft.org/article/view/v054i07) — also on [GitHub](https://github.com/j-hai/ebal-stata)

---

[Explainer for R and Stata](https://lost-stats.github.io/Model_Estimation/Matching/entropy_balancing.html)

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/entropy.jpeg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
</div>

