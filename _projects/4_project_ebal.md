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

* **ATT / ATE / ATC estimands.** A new `estimand` argument on `ebalance()` selects which causal quantity the weights target: `"ATT"` (default; the original behavior — controls reweighted to match treated), `"ATC"` (treated reweighted to match controls), and `"ATE"` (both groups reweighted to match the overall sample). For ATE the returned object carries per-side solves and `weights(fit)` returns a length-n vector that drops straight into `lm(..., weights = w)` for the population effect.
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

### Comparing estimands: ATT vs ATE vs ATC

The 0.3-0 `estimand` argument lets you pick which question the weights answer:

```r
fit_att <- ebalance(treat ~ age + educ + race + married + nodegree + re74 + re75,
                    data = lalonde, estimand = "ATT")
fit_ate <- ebalance(treat ~ age + educ + race + married + nodegree + re74 + re75,
                    data = lalonde, estimand = "ATE")
fit_atc <- ebalance(treat ~ age + educ + race + married + nodegree + re74 + re75,
                    data = lalonde, estimand = "ATC")

# For ATE, both groups carry estimated weights; weights(fit) handles it.
df$w <- weights(fit_ate)
coef(lm(re78 ~ treat, data = df, weights = w))[2]
```

Running all three on Lalonde and adding 95% bootstrap CIs (250 reps) produces a clean visual of how each estimand answers a different question:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/ebal_lalonde_estimands.png" title="Lalonde NSW: ATT vs ATE vs ATC point estimates with bootstrap CIs" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Forest plot of effect estimates by estimand. The naive difference is badly negative (-635). The ATT (+1273) lands closest to the experimental benchmark (+1794, dotted green line) — exactly the right answer for "what was the effect on those who actually trained?". The ATE (+952) and ATC (+212) drift away because they extrapolate the training effect to PSID-like respondents who would never realistically have entered the program; the bootstrap CIs widen accordingly. The takeaway is policy-relevant rather than just numerical: <em>which estimand you pick is itself a substantive choice about which population you're inferring about.</em>
</div>

### Combining ebal with difference-in-differences

A common applied pattern is to use ebal as the *first stage* of a DID design: ebal-weighted DID handles unobserved time-invariant confounders (via the difference) and observed covariate imbalance (via the weights) simultaneously. The Lalonde data has earnings in 1974, 1975, and 1978 — so we can check parallel trends with a 1975 placebo.

We deliberately balance on **demographics only** (age, education, race, marital status, no-degree status) and *leave prior earnings out of the constraints*. The point is to see whether DID + ebal can absorb the time-invariant earnings level difference between NSW and PSID without having seen those earnings during balancing.

```r
library(ebal)
data(lalonde, package = "cobalt")

# 1) Balance on demographics only
X <- model.matrix(~ age + educ + race + married + nodegree, data = lalonde)
X <- X[, colnames(X) != "(Intercept)"]
fit <- ebalance(Treatment = lalonde$treat, X = X, estimand = "ATT")
lalonde$w <- weights(fit)

# 2) DID using 1974 as the pre-period
did <- function(post, pre = "re74", w = lalonde$w) {
  d_t <- mean(lalonde[lalonde$treat == 1, post]) -
         mean(lalonde[lalonde$treat == 1, pre])
  d_c <- weighted.mean(lalonde[lalonde$treat == 0, post],
                       w = w[lalonde$treat == 0]) -
         weighted.mean(lalonde[lalonde$treat == 0, pre],
                       w = w[lalonde$treat == 0])
  d_t - d_c
}

did("re75")  # 1975 placebo (training was 1976-77, so this should be ~0)
#> +1145
did("re78")  # 1978 effect
#> +2181   (experimental benchmark = +1794)

# Equivalent regression form, drop-in for clustered SEs / fixed effects:
# library(fixest); feols(re78 - re74 ~ treat, data = lalonde, weights = ~w)
```

The DID + ebal estimate **+2181** (95% bootstrap CI [+414, +3857] over 250 reps) brackets the experimental benchmark of +1794, even though we never told `ebalance()` about prior earnings. The 1975 placebo (+1145) is closer to zero than the unweighted 1975 placebo (+2589) but not zero, which is honest about demographics-only balancing — a user iterating on this design would naturally add re74 to the balance constraints to flatten the placebo further.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/ebal_lalonde_did.png" title="Lalonde NSW: ebal + DID earnings trajectories" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Mean earnings trajectories by group and year. The blue solid line is the NSW treated; the red dashed line is the raw PSID controls (huge level offset, classic Lalonde "bias"); the green solid line is the ebal-reweighted PSID controls. After demographic balancing alone, the level offset largely closes by 1974 (~$2,100 vs $3,300). The DID estimate compares the 1974→1978 change between treated and ebal-weighted controls; the small remaining gap in 1975 is the placebo test (would be exactly zero if we'd also balanced on prior earnings).
</div>

The weight distributions make the underlying mechanic visible:

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/ebal_lalonde_weights.png" title="Per-unit weight distributions across the three estimands" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Per-unit weight distributions across the three estimands. <strong>ATT</strong>: treated all carry weight 1, controls reweighted toward the treated (right tail). <strong>ATE</strong>: both groups reweighted toward the overall sample — controls cluster near 1, treated spike upward to compensate. <strong>ATC</strong>: roles flipped — controls all carry weight 1, treated stretched out to "look like" PSID respondents.
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

