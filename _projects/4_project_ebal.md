---
layout: page
title: Entropy Balancing
description: 
img: assets/img/entropy.jpg
importance: 1
category: methods
related_publications: true
---

Entropy Balancing is a statistical method implemented as both an R package and a Stata routine, designed for reweighting data to achieve covariate balance in observational studies.

The method is based on the approaches developed in {% cite hainmueller2012entropy %} and {% cite hainmueller2013ebalance %}, and it won the Warren Miller Award from the Society of Political Methodology in 2020.

→ **[Read the explainer](/projects/Entropy-Balancing-—-an-Explainer/)** — a self-contained tutorial on entropy balancing for R and Stata users.

## The four-line workflow

```r
fit <- ebalance(treat ~ x1 + x2 + x3, data = df)   # 1. fit weights
balance_table(fit)                                 # 2. check balance
df$w <- weights(fit)                               # 3. attach weights
lm(y ~ treat, data = df, weights = w)              # 4. estimate effect
```

That's the full promise of the package: balance the covariates, get weights, run your regression. Everything else on this page is a refinement of those four lines.

### Which estimand?

| `estimand` | who gets reweighted | answers |
|---|---|---|
| `"ATT"` (default) | controls           | "what was the effect on those who got treatment?" |
| `"ATC"`           | treated            | "what would the effect have been on the controls?" |
| `"ATE"`           | both               | "what is the average effect across the population?" |

Always read weights via `weights(fit)`. It returns a length-`n` vector aligned to the original `Treatment`/`X` and routes the per-side semantics correctly.

## Worked example: Lalonde NSW vs. PSID controls

The 1986 Lalonde benchmark — NSW job-training trial controls replaced by 429 PSID respondents — is the textbook stress test for covariate-adjustment methods. The naive comparison is badly biased; ebalance recovers an estimate close to the experimental benchmark of +$1,794.

```r
library(ebal); library(generics)
data(lalonde, package = "cobalt")

# 1. Fit
fit <- ebalance(treat ~ age + educ + race + married + nodegree + re74 + re75,
                data = lalonde)

# 2. Check balance
balance_table(fit)[, c("variable", "std_diff_pre", "std_diff_post")]
#>      variable std_diff_pre std_diff_post
#> 1         age       -0.242             0
#> 2        educ        0.045             0
#> 3  racehispan       -0.277             0
#> 4   racewhite       -1.406             0
#> 5     married       -0.719             0
#> 6    nodegree        0.235             0
#> 7        re74       -0.596             0
#> 8        re75       -0.297             0

# 3. Attach weights (length = nrow(lalonde); treated = 1, controls reweighted)
lalonde$w <- weights(fit)

# 4. Estimate the ATT
coef(lm(re78 ~ treat, data = lalonde, weights = w))[2]
#> +1273   (vs. naive -635, vs. experimental benchmark +1794)
```

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/ebal_lalonde_loveplot.png" title="Love plot of standardized differences before vs after entropy balancing" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    <strong>Balance check.</strong> Standardized differences between the NSW treated group and the PSID controls. Open circles are the raw differences (every covariate is far from zero, with race and marriage status as the worst offenders). Filled dots are the post-weighting differences — exact zero for every covariate by construction. <code>autoplot(fit)</code>.
</div>

### Robust standard errors

`lm()`'s default standard errors don't account for the weighting. Use `sandwich::vcovHC()` (or `vcovCL()` if you have a clustering variable):

```r
library(sandwich); library(lmtest)
mod <- lm(re78 ~ treat, data = lalonde, weights = w)
coeftest(mod, vcov = vcovHC(mod, type = "HC1"))
```

### Is the fit healthy? `diagnostics()` and `glance()`

```r
diagnostics(fit)
#> ebalance diagnostics  (estimand: ATT)
#> --------------------------------------
#>   control      PASS  effective sample size = 98 of 429, max/mean = 3.6
#>   treated      PASS  effective sample size = 185 of 185, max/mean = 1.00
#>   balance      PASS  max |std diff post| = 0.0000
#>   converged    PASS  max moment deviation = 0.41
```

`generics::glance(fit)` is the same numbers in a one-row data frame — convenient for stitching across many fits. The headline is **ESS = 98 of 429**: the fit is concentrated on roughly a quarter of the donor pool, which is what you'd expect when the PSID-vs-NSW gap is this large.

If `diagnostics()` flags low ESS or a high max/mean ratio, drill into the weight distribution itself:

```r
plot(fit, type = "weights")
```

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/ebal_lalonde_weightdiag.png" title="Per-unit weight distribution: ESS and max-weight ratio" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    <strong>Weight diagnostic.</strong> Subtitle reports the effective sample size and the ratio of the largest to the average weight. The dashed vertical line at <code>weight = 1</code> is the uniform-weighting baseline; mass to the right of it is over-represented PSID controls compensating for the PSID/NSW covariate gap, mass to the left is under-represented. This plot is a *check*, not a primary result — use it when ESS is low or the max-weight ratio looks alarming.
</div>

## Comparing estimands: ATT vs ATE vs ATC

```r
fit_att <- ebalance(treat ~ ..., data = lalonde, estimand = "ATT")
fit_ate <- ebalance(treat ~ ..., data = lalonde, estimand = "ATE")
fit_atc <- ebalance(treat ~ ..., data = lalonde, estimand = "ATC")

# weights() does the right thing for each estimand
lalonde$w <- weights(fit_ate)
coef(lm(re78 ~ treat, data = lalonde, weights = w))[2]
```

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/ebal_lalonde_estimands.png" title="Lalonde NSW: ATT vs ATE vs ATC point estimates with bootstrap CIs" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Forest plot of effect estimates by estimand with 95% bootstrap CIs (250 reps). The naive difference (-635) is badly off. The ATT (+1273) lands closest to the experimental benchmark (+1794, dotted green line) — exactly the right answer for "what was the effect on those who actually trained?". The ATE (+952) and ATC (+212) drift away because they extrapolate to PSID-like respondents who would never realistically have entered the program; the bootstrap CIs widen accordingly. <em>Which estimand you pick is itself a substantive choice about the population you're inferring about.</em>
</div>

## Combining ebal with difference-in-differences

A common applied pattern is to use ebal as the *first stage* of a DID design: ebal-weighted DID handles unobserved time-invariant confounders (via the difference) and observed covariate imbalance (via the weights) simultaneously. The Lalonde data has earnings in 1974, 1975, and 1978 — so we can check parallel trends with a 1975 placebo.

We deliberately balance on **demographics only** (age, education, race, marital status, no-degree status) and *leave prior earnings out of the constraints*. The point is to see whether DID + ebal can absorb the time-invariant earnings level difference between NSW and PSID without having seen those earnings during balancing.

```r
# 1) Balance on demographics only
fit <- ebalance(treat ~ age + educ + race + married + nodegree, data = lalonde)
lalonde$w <- weights(fit)

# 2) DID using 1974 as the pre-period
did <- function(post, pre = "re74") {
  d_t <- mean(lalonde[lalonde$treat == 1, post]) -
         mean(lalonde[lalonde$treat == 1, pre])
  d_c <- weighted.mean(lalonde[lalonde$treat == 0, post],
                       w = lalonde$w[lalonde$treat == 0]) -
         weighted.mean(lalonde[lalonde$treat == 0, pre],
                       w = lalonde$w[lalonde$treat == 0])
  d_t - d_c
}

did("re75")  # 1975 placebo (training was 1976-77, so this should be ~0)
#> +1145
did("re78")  # 1978 effect
#> +2181   (experimental benchmark = +1794)

# Equivalent regression form, drop-in for clustered SEs / fixed effects:
# library(fixest); feols(re78 - re74 ~ treat, data = lalonde, weights = ~w)
```

The DID + ebal estimate **+2181** (95% bootstrap CI [+414, +3857]) brackets the experimental benchmark of +1794, even though we never told `ebalance()` about prior earnings. The 1975 placebo (+1145) is closer to zero than the unweighted 1975 placebo (+2589) but not zero, which is honest about demographics-only balancing — a user iterating on this design would naturally add `re74` to the balance constraints to flatten the placebo further.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/ebal_lalonde_did.png" title="Lalonde NSW: ebal + DID earnings trajectories" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Mean earnings trajectories by group and year. The blue solid line is the NSW treated; the red dashed line is the raw PSID controls (huge level offset, classic Lalonde "bias"); the green solid line is the ebal-reweighted PSID controls. The DID estimate compares the 1974→1978 change between treated and ebal-weighted controls; the small remaining gap in 1975 is the placebo test.
</div>

## What's new in `ebal` 0.3-0 (May 2026)

* **ATT / ATE / ATC estimands** via the new `estimand` argument on `ebalance()`. `weights(fit)` returns the right length-`n` vector for each.
* **`balance_table(fit)`** — exported, with explicit `mean_treated_pre/post`, `mean_control_pre/post`, `diff_pre/post`, `std_diff_pre/post`, `pct_reduction` columns. The same numbers feed `summary()`, `tidy()`, `plot()`, and `autoplot()`.
* **`diagnostics(fit)`** — friendly "is my fit okay?" report with PASS / WARN / FAIL flags for ESS, balance, convergence, and trim feasibility.
* **Weak-fit warnings at fit time** when ESS is below 30% of side n, max/mean weight ratio is above 10, or the solver didn't converge. Suppressible via `options(ebal.warn_weak_fit = FALSE)`.
* **Two new vignettes:** `vignette("estimands")` and `vignette("outcome-models")`.
* **Autodiff solver** (advanced, opt-in): `method = "autodiff"` runs BFGS on `torch`-computed gradients instead of Newton-Raphson. More stable on poorly conditioned dual losses; **contributed by Apoorva Lal**, ported with attribution from his fork at [github.com/apoorvalal/ebal](https://github.com/apoorvalal/ebal). Apoorva is now listed as `aut` on the package.

The previous release (0.2.1, April 2026) added the formula interface, `print()` / `summary()` / `plot()` / `weights()` S3 methods, and numerical hardening for `ebalance.trim()`.

The Stata routine was also updated in April 2026 to version 1.5.5 with bug fixes, a new `quietly` option, a `replace` option for `gen()`, and a cap on the linear predictor before `exp()` to prevent `Inf → NaN` propagation. No numerical changes; verified byte-for-byte against the 1.5.3 baseline. Source on [GitHub](https://github.com/j-hai/ebal-stata).

---
[Entropy Balancing for R](https://search.r-project.org/CRAN/refmans/ebal/html/ebalance.html) — also on [GitHub](https://github.com/j-hai/ebal)

---

[Entropy Balancing for Stata](https://www.jstatsoft.org/article/view/v054i07) — also on [GitHub](https://github.com/j-hai/ebal-stata)

---

