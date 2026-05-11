---
layout: page
title: Entropy Balancing — an Explainer
description: How entropy balancing works, when to use it, and how to run it in R and Stata.
img: assets/img/entropy.jpg
permalink: /projects/entropy-balancing-explainer/
importance: 2
category: methods
---

This is a self-contained tutorial on entropy balancing for users coming
from either R or Stata. The R commands use the `ebal` package; the
Stata commands use the `ebalance` package. Both implement the same
algorithm from {% cite hainmueller2012entropy %}.

← **[Back to the Entropy Balancing project page](/projects/Entropy-Balancing/)** for the package landing pages and the most recent release notes.

<div class="alert alert-info" role="alert">
<strong>Use this when:</strong> you have treated and comparison units,
credible overlap on observed covariates, and want transparent
reweighting for an ATT, ATC, or ATE estimand.<br>
<strong>Do not use this when:</strong> the groups have no common
support, the key confounding is unobserved, or the design needs a
time-series counterfactual rather than covariate balance.
</div>

## The problem entropy balancing solves

Suppose you want to estimate the effect of a treatment from
observational data, and the treated and control groups differ
systematically on observed covariates. The textbook fix is to
**reweight one of the groups** so that its covariate distribution
matches the other's, then estimate the treatment effect on the
reweighted data.

Two common approaches and their failure modes:

- **Inverse-probability weighting (IPW)** fits a propensity-score
  model first, then weights by the inverse score. Balance is achieved
  *on average* — but in any particular sample, the resulting
  covariate moments rarely match exactly. You end up running
  diagnostics, tweaking the propensity-score specification, and
  hoping.
- **Matching** picks neighbors. It can balance the distribution well,
  but you discard data, ties matter, and the balance you get depends
  on a metric you chose.

**Entropy balancing skips the propensity-score step entirely.** It
finds the weights that exactly satisfy the moment conditions you ask
for (means, variances, co-moments), while staying as close as
possible to a base distribution (uniform by default). One step, exact
balance, no propensity model.

## The setup

Let $$T_i$$ index the treated units and $$C_i$$ index the controls,
with covariate vector $$X_i$$ and base weight $$q_i$$ for each control
unit (uniform by default). For the **average treatment effect on the
treated (ATT)**, entropy balancing solves

$$
\min_{w_i} \; \sum_{i \in C} w_i \log\frac{w_i}{q_i}
\qquad \text{s.t.} \qquad
\sum_{i \in C} w_i \,c_k(X_i) = m_k \;\;\forall k, \;\;
\sum_{i \in C} w_i = N_T
$$

where $$c_k(X)$$ are user-specified moment functions (typically
$$X_j$$ for first moments, $$X_j^2$$ for variances, $$X_j X_l$$ for
co-moments) and $$m_k$$ are the corresponding treated-group totals.
The objective is the Kullback–Leibler divergence from $$q$$ — *keep
the weights as close to uniform as you can*, subject to the balance
constraints.

Solving the dual is a finite-dimensional convex problem
(Newton–Raphson converges in a handful of iterations on most
applied datasets), and the solution is unique whenever the constraints
are feasible.

The same machinery handles two other estimands by changing what's
reweighted and what's targeted:

| estimand | who is reweighted | target moments |
|---|---|---|
| ATT  | controls           | treated-group means |
| ATC  | treated            | control-group means |
| ATE  | both groups        | overall sample means |

## Worked example: Lalonde NSW vs. PSID

The 1986 Lalonde benchmark is the textbook stress test. NSW
job-training trial controls are replaced by 429 PSID respondents who
are very different from the NSW treated on age, education, race,
marital status, and prior earnings. The naive ATT estimate is
**−$635** (wrong sign), against an experimental benchmark of
**+$1,794**.

### In R

```r
library(ebal)
data(lalonde, package = "cobalt")

# 1. Fit
fit <- ebalance(
  treat ~ age + educ + race + married + nodegree + re74 + re75,
  data = lalonde
)

# 2. Inspect
balance_table(fit)[, c("variable", "std_diff_pre", "std_diff_post")]
diagnostics(fit)             # PASS / WARN / FAIL on ESS, balance, convergence

# 3. Weights and outcome model
lalonde$w <- weights(fit)    # length nrow(lalonde); aligned to Treatment/X
mod <- lm(re78 ~ treat, data = lalonde, weights = w)

# 4. Robust SEs
library(sandwich); library(lmtest)
coeftest(mod, vcov = vcovHC(mod, type = "HC1"))
```

The ATT estimate from this four-line workflow is **+$1,273**, a
night-and-day improvement over the naive −$635 and within bootstrap
distance of the experimental benchmark of +$1,794. `balance_table()`
shows that every standardized difference goes from large (e.g. −1.4
on the white indicator) to essentially zero post-weighting — by
construction.

### In Stata

```stata
use lalonde.dta, clear
ebalance treat age educ black hispan married nodegree re74 re75, ///
    targets(1) gen(w)

* `w` now holds the entropy-balancing weights (1 for treated;
* eb-weight for controls). Pass them to a weighted regression:
reg re78 treat [pw = w], robust
```

The Stata package's `targets()` option sets the highest moment
matched for each covariate. `targets(1)` matches first moments only;
`targets(2)` adds variances; `targets(3)` adds the third moment
(skewness). Co-moments / interactions are not generated by
`targets()` — to balance an interaction, build it as an explicit
covariate (e.g., `gen ageXeduc = age * educ`) and pass it in. The
resulting weights variable plugs straight into any downstream
weighted estimator: `regress [pw = w]`, survey commands after
`svyset _n [pw = w]`, `mean [pw = w]`, etc.

## Reading the output

Three things to check before trusting the estimate:

**1. Balance.** Are the post-weighting standardized differences
near zero?

```r
balance_table(fit)
```

If they are not (or the solver did not converge), the constraints
are infeasible — usually because you have too many moments for too
few comparison units, or extreme outliers. Drop a moment, trim
predictors, or use `ebalance.trim()` to relax the constraints.

**2. Effective sample size.** Even when balance is exact, the weights
may be concentrated on a handful of units. The Kish ESS,
$$\mathrm{ESS} = (\sum w)^2 / \sum w^2$$, tells you how many units
the regression is "really" using.

```r
library(generics)
glance(fit)[, c("ess_control", "max_weight_ratio_control")]
diagnostics(fit)             # threshold-based PASS / WARN
```

If ESS is well below the donor pool size and the largest weight is
many times the average, you are leaning hard on a small number of
units. Inspect the weight distribution:

```r
plot(fit, type = "weights")
```

The vertical line at `weight = 1` is the uniform-weighting baseline;
mass to the right is over-represented, mass to the left
under-represented. Individual weights are not the substantive result;
they are diagnostics for overlap and influence. Stata users can
replicate the same diagnostics by computing summary statistics on the
generated weight variable:

```stata
summarize w if treat == 0
gen w_ratio = w / r(mean)
summarize w_ratio if treat == 0   // largest weight as multiple of mean
```

**3. Robust standard errors.** Default `lm()` SEs are wrong because
the weighting induces heteroskedasticity. Use
`sandwich::vcovHC(..., "HC1")` in R, `regress [pw = w], robust` in
Stata, or `svyglm()` if you are already in `survey` package land.

## Minimum reporting checklist

When reporting an entropy-balancing estimate, include at least:

- the estimand (ATT, ATC, or ATE) and which group was reweighted;
- the balance table before and after weighting;
- effective sample size and max/mean weight ratio for the reweighted
  side;
- the outcome model and robust or design-appropriate standard errors;
- any trimming, transformations, or moments beyond first moments.

## Choosing an estimand

`ebalance(..., estimand = ...)` lets you pick what gets reweighted:

- **ATT**: controls reweighted to look like treated.
  *Use this when* you want the effect on those who actually got
  treatment. Most policy-evaluation work falls here.
- **ATC**: treated reweighted to look like controls.
  *Use this when* the policy question is about extending a program to
  non-recipients. Be honest about the extrapolation involved.
- **ATE**: both groups reweighted to the overall sample.
  *Use this when* you want a population-level claim and you trust
  that the treatment effect is stable across the covariate
  distribution.

```r
fit_ate <- ebalance(treat ~ ..., data = df, estimand = "ATE")
df$w    <- weights(fit_ate)        # both groups carry estimated weights
mod_ate <- lm(y ~ treat, data = df, weights = w)
```

In Stata, the equivalent is to run `ebalance` twice with the two
groups swapped and combine the resulting weight vectors.

## Common pitfalls

- **Too many moments.** Asking for first, second, and co-moments on a
  large covariate set quickly produces an infeasible problem on
  modest sample sizes. Start with first moments and add as needed.
- **Highly skewed covariates.** Income or assets often produce wide
  weight distributions. Log-transforming or trimming the donor pool
  before fitting usually helps.
- **Reading `$w` directly.** In R, prefer `weights(fit)` over reading
  `fit$w`. The latter is side-specific (controls under ATT; treated
  under ATC; control side only under ATE) and is mostly there for
  backward compatibility.
- **Pre-period outcomes in the constraints.** If you balance on
  *every* pre-period outcome and run a difference-in-differences,
  the placebo period is mechanically zero. That isn't a bug, but it
  also isn't a falsification test. Leave at least one pre-period out
  of the constraints if you want a placebo check.

## Combining with difference-in-differences

A common applied pattern is **ebal + DID**: the difference soaks up
time-invariant unobservables, and the weights soak up observed
covariate imbalance. In the Lalonde data:

```r
# Balance on demographics only (leave prior earnings out)
fit <- ebalance(treat ~ age + educ + race + married + nodegree, data = lalonde)
lalonde$w <- weights(fit)

# DID using 1974 as the pre-period
did <- function(post, pre = "re74") {
  d_t <- mean(lalonde[lalonde$treat == 1, post]) -
         mean(lalonde[lalonde$treat == 1, pre])
  d_c <- weighted.mean(lalonde[lalonde$treat == 0, post],
                       w = lalonde$w[lalonde$treat == 0]) -
         weighted.mean(lalonde[lalonde$treat == 0, pre],
                       w = lalonde$w[lalonde$treat == 0])
  d_t - d_c
}
did("re78")  # +2181 (vs. experimental +1794)
did("re75")  # +1145 — not the placebo zero, but closer than naive +2589
```

The 1975 placebo is not zero (training was 1976–77, so it should be).
That is a real signal that the demographics-only fit is not quite
absorbing pre-period earnings dynamics — adding `re74` to the balance
constraints flattens the placebo. The lesson: weighted DID is honest
about what it fixes (balance on observed covariates) and what it does
not (parallel trends).

## When *not* to use entropy balancing

Entropy balancing is not magic. It cannot fix:

- **Unobserved confounding.** No reweighting method can. Use design
  features (DID, IV, regression discontinuity) for that.
- **Bad overlap.** If treated and control groups have no covariate
  region in common, no weighting will produce a credible
  counterfactual. Inspect overlap before fitting.
- **Mis-specified estimand.** Reweighting controls to the treated
  distribution gives the ATT, not the ATE. Choose the estimand that
  matches your policy question.

If overlap is poor or the pre-period trends are clearly diverging,
weighting is not the right tool. Use it as part of a larger design,
not as a one-step fix.

## References

- Hainmueller, J. (2012). [Entropy balancing for causal effects: A
  multivariate reweighting method to produce balanced samples in
  observational studies](https://doi.org/10.1093/pan/mpr025).
  *Political Analysis*, 20(1), 25–46.
- Hainmueller, J. and Xu, Y. (2013). [ebalance: A Stata package for
  entropy balancing](https://www.jstatsoft.org/article/view/v054i07).
  *Journal of Statistical Software*, 54(7), 1–18.

## See also

- [Entropy Balancing project page](/projects/Entropy-Balancing/) —
  package landing page with the latest release notes and worked
  examples for ATT/ATE/ATC and DID.
- `vignette("ebal-quickstart", package = "ebal")` — five-minute intro.
- `vignette("estimands",       package = "ebal")` — ATT/ATE/ATC walkthrough.
- `vignette("outcome-models",  package = "ebal")` — robust SEs,
  doubly-robust regression adjustment, survey-package compatibility.
