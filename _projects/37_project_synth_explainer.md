---
layout: page
title: Synthetic Control Methods — an Explainer
description: How synthetic control works, when to use it, and how to run it in R and Stata.
img: assets/img/synthpic.jpeg
permalink: /projects/synthetic-control-methods-explainer/
importance: 2
category: methods
---

This is a self-contained tutorial on the synthetic control method
(SCM) for users coming from either R or Stata. The R commands use the
`Synth` package; the Stata commands use the `synth` command. Both
implement the same algorithm from
{% cite abadie2003economic %}, {% cite abadie2010synthetic %}, and
{% cite abadie2011synth %}.

← **[Back to the Synthetic Control Methods project page](/projects/Synthetic-Control-Methods/)** for the package landing pages and the most recent release notes.

<div class="alert alert-info" role="alert">
<strong>Use this when:</strong> one treated unit is exposed at a clear
date, you have a credible donor pool, and the pre-treatment outcome
history is long enough to assess fit.<br>
<strong>Do not use this when:</strong> pre-period fit is poor, many
units adopt treatment at different times, or the donor pool is itself
contaminated by similar interventions.
</div>

## The problem synthetic controls solve

Suppose a single unit — a state, a country, a firm, a school — was
exposed to an intervention at a specific date, and you want to know
the effect on some outcome (GDP, cigarette sales, test scores, stock
price). The textbook problem:

- **Difference-in-differences** assumes parallel trends, which is
  often visibly wrong when the treated unit is a clear outlier.
- **Matching** picks one or two donors, which is fragile when the
  donor pool is small and the treated unit is unusual.
- **Regression with unit fixed effects** projects the treated unit
  onto an additive structure that may not hold.

**Synthetic controls** construct a *weighted combination* of donor
units that mimics the pre-treatment trajectory of the treated unit on
the outcome and on a set of predictors. The weighted donor pool —
the "synthetic control" — is then taken as the counterfactual after
the intervention. The treatment effect is the gap between the
treated unit and its synthetic counterpart.

The method has four virtues:

1. The weights are **transparent**: every reader can see exactly
   which donor units (and how much of each) the counterfactual rests
   on.
2. The weights are **non-negative and sum to one**, so the synthetic
   control is a convex combination — no extrapolation outside the
   donor pool's support.
3. Pre-period **fit quality is observable** before you commit to the
   estimate: if the synthetic control doesn't track the treated unit
   well in the pre-period, the post-period claim is on weaker ground.
4. **Placebo / permutation inference** uses the donor pool itself as
   a reference distribution — no parametric assumptions about the
   error term.

## The setup

Let the treated unit's outcome be $$Y_{1t}$$ and the donor outcomes
be $$Y_{0t}^{(j)}$$ for $$j = 1, \ldots, J$$. The synthetic control
chooses **donor weights** $$w_j \geq 0$$ with $$\sum_j w_j = 1$$ that
solve

$$
\min_{w} \sum_{k} v_k \,(X_{1k} - X_{0k}\,w)^2
$$

where $$X_{1k}$$ is the treated unit's value of predictor $$k$$
(typically pre-period averages of the outcome plus other covariates),
$$X_{0k}$$ is the row of donor values, and $$v_k$$ are
**predictor weights** chosen to minimize the *pre-treatment mean
squared prediction error* on the outcome. There are two nested
optimizations: an outer search over $$v$$ and an inner quadratic
program for $$w$$. `Synth` handles both.

Once you have $$\hat w$$, the synthetic control's post-period
trajectory is $$\hat Y_{1t}^{\,\text{synth}} = \sum_j \hat w_j Y_{0t}^{(j)}$$
and the treatment effect at time $$t$$ is
$$\hat\tau_t = Y_{1t} - \hat Y_{1t}^{\,\text{synth}}$$.

## Worked example: California's Proposition 99

In 1988 California raised cigarette taxes via Proposition 99. The
canonical SCM application from {% cite abadie2010synthetic %} asks:
**how would per-capita cigarette consumption have evolved without
the tax?** The donor pool is the 38 other US states.

### In R

```r
library(Synth)
data(smoking)   # 39 states × 31 years (1970-2000) of cigarette sales

# 1. Build the inputs (one-line ergonomic wrapper from Synth 1.2-0)
dp <- synth_data(
  panel              = smoking,
  outcome            = "cigsale",
  unit_col           = "state_id",
  time_col           = "year",
  treated            = "California",
  treatment_time     = 1989,
  predictors         = c("lnincome", "age15to24", "retprice", "beer"),
  special_predictors = list(
    list("cigsale", 1988, "mean"),
    list("cigsale", 1980, "mean"),
    list("cigsale", 1975, "mean")),
  unit_names_col     = "state_name"
)

# 2. Fit the synthetic control
fit <- synth(dp)

# 3. Inference
inf  <- synth_inference(fit, dp, method = "conformal", alpha = 0.10)
pl   <- generate_placebos(fit, dp)
test <- mspe_test(pl)        # one-sided p-value = 0.026

# 4. Plots
autoplot(inf)                          # 90% conformal band
autoplot(pl, mspe_threshold = 5)       # placebo gaps
```

The synthetic California puts about 84% of weight on Utah, Nevada,
Montana, and Connecticut (matching the published `Synth` paper). The
post / pre MSPE ratio is **128** and the placebo p-value is **0.026**:
California's post-1988 cigarette consumption falls dramatically below
its synthetic counterpart, and that gap is unusually large relative
to other states.

### In Stata

```stata
use smoking.dta, clear
xtset state_id year

synth cigsale beer(1984(1)1988) lnincome(1972(1)1988)        ///
              retprice age15to24 cigsale(1988) cigsale(1980)  ///
              cigsale(1975),                                  ///
      trunit(3) trperiod(1989) xperiod(1980(1)1988) fig
```

`trunit(3)` selects California; `trperiod(1989)` is the first
post-treatment year; `xperiod(...)` is the predictor-averaging
window. The `fig` option draws the path-and-gap plot.

For inference in Stata, `synth_runner` (a community-maintained
wrapper) is the standard way to run placebos and MSPE tests; the
parallel option runs much faster on multi-core machines.

## Reading the output

Three things to check before trusting the estimate:

**1. Pre-period fit.** Does the synthetic control track the treated
unit before the intervention? If not, the post-period claim is on
shakier ground. The pre-period root MSPE is the headline number;
plot the two trajectories side by side.

```r
path.plot(fit, dp)        # treated and synthetic on the same axes
gaps.plot(fit, dp)        # the difference (synthetic counterfactual error)
```

**2. Donor weights.** Look at which donors are doing the work.

```r
fit$solution.w            # named vector of donor weights
```

If a single donor carries almost all the weight, the synthetic
control is closer to a one-to-one match than a true convex
combination. That isn't fatal but is worth flagging.

**3. Inference.** Three options, in order of how strong the
distributional assumptions are:

- **Placebo / MSPE-ratio test** (`mspe_test()` in R; `synth_runner`
  in Stata): rerun synth on each donor as if it had been treated,
  rank the actual treated unit's post/pre MSPE ratio against the
  placebo distribution. Distribution-free; widely used.
- **Split-conformal prediction band** (`synth_inference(method =
  "conformal")`, new in `Synth 1.2-0`): finite-sample valid
  prediction intervals around the synthetic counterfactual under
  exchangeability of pre-period residuals. Constant-width band; no
  parametric residual model.
- **CFPT prediction intervals** (`scpi` package on CRAN, separate
  from `Synth`): period-varying intervals decomposing in-sample
  uncertainty about the weights and out-of-sample residual
  uncertainty. Heaviest machinery; richest output.

```r
inf <- synth_inference(fit, dp, method = "conformal")
plot(inf)                     # treated, synthetic, and band
```

## Minimum reporting checklist

When reporting a synthetic-control estimate, include at least:

- the treated unit, treatment date, donor pool, and excluded donors;
- the predictors and pre-treatment windows used to choose weights;
- pre-treatment fit (RMSPE or MSPE) and a path/gap plot;
- donor weights, especially any dominant donor;
- placebo/MSPE-ratio or interval-based inference for the post-period
  gap.

## Choosing among synthetic-control variants

The base method has been extended in several directions:

- **Augmented synthetic control** (`augsynth`, Ben-Michael, Feller,
  Rothstein 2021): adds a linear-regression bias correction when the
  synthetic control doesn't fit the pre-period perfectly. Useful
  when overlap is poor.
- **Generalized synthetic control** (`gsynth`, Xu 2017): handles
  multiple treated units and staggered adoption via an interactive
  fixed-effects model. The natural choice when the design is not
  one-treated-many-controls.
- **Penalized synthetic control** (`scpi`, Cattaneo, Feng, Palomba,
  Titiunik 2025): adds prediction intervals that account for both
  in-sample and out-of-sample uncertainty.
- **Synthetic difference-in-differences** (`synthdid`,
  Arkhangelsky et al. 2021): hybridizes SCM and DID, weighting both
  units and time periods.

Pick by the design constraint: one treated unit and a clean donor
pool → vanilla `Synth`; multiple or staggered treatment →
`augsynth` / `gsynth`; rich inference is the priority → `scpi`;
many treated units with a clear pre-period → `synthdid`.

## Common pitfalls

- **Small donor pool.** Synthetic controls work best with 20+ donor
  units. With only a handful of donors, the convex-combination
  constraint binds tightly and the placebo distribution has too few
  points for credible inference.
- **Treated unit outside the donor convex hull.** If the treated
  unit's pre-period predictor values are not in the convex hull of
  the donors, no synthetic control can match them. Inspect predictor
  ranges before fitting.
- **Anticipation.** If the treatment was announced before it took
  effect, post-period gaps in the announcement window are part of
  the response, not pre-treatment. Either move `treatment_time`
  earlier or interpret accordingly.
- **Reading too much into single-period gaps.** SCM estimates are
  noisy period by period. Look at the cumulative or average
  post-period gap, ideally with a placebo p-value or conformal band.
- **Multiple treated units fit one at a time.** If you have several
  treated units (different states adopting a policy in different
  years), fitting `synth` one at a time and averaging is *not* the
  same as `gsynth` or `synthdid`, and standard placebo inference
  doesn't carry over.

## When *not* to use synthetic controls

Synthetic controls are not magic. They struggle when:

- **The treatment effect itself is concentrated in the donor pool.**
  If half your donors implemented similar policies during your study
  window, the synthetic control absorbs the average effect of all of
  them. Drop those donors or use `gsynth`.
- **Pre-period fit is poor.** If the synthetic control can't track
  the treated unit before treatment, post-period gaps are
  uninterpretable. Augmented or generalized SC is more honest about
  this case.
- **You have many treated units.** Vanilla SCM is built for a single
  treated unit. With many treated units, generalized synthetic
  control or synthetic DID is the right tool.

## References

- Abadie, A., and Gardeazabal, J. (2003). [The economic costs of
  conflict: A case study of the Basque country](https://www.aeaweb.org/articles?id=10.1257/000282803321455188).
  *American Economic Review*, 93(1), 113–132.
- Abadie, A., Diamond, A., and Hainmueller, J. (2010). [Synthetic
  control methods for comparative case studies](https://doi.org/10.1198/jasa.2009.ap08746).
  *Journal of the American Statistical Association*, 105(490), 493–505.
- Abadie, A., Diamond, A., and Hainmueller, J. (2011). [Synth: An R
  package for synthetic control methods in comparative case
  studies](https://www.jstatsoft.org/article/view/v042i13).
  *Journal of Statistical Software*, 42(13), 1–17.
- Chernozhukov, V., Wuthrich, K., and Zhu, Y. (2021). An exact and
  robust conformal inference method for counterfactual and synthetic
  controls. *Journal of the American Statistical Association*,
  116(536), 1849–1864.

## See also

- [Synthetic Control Methods project page](/projects/Synthetic-Control-Methods/)
  — package landing page with the latest release notes and the
  Proposition 99 worked example.
- `vignette("synth-quickstart", package = "Synth")` — five-minute intro.
- `vignette("inference", package = "Synth")` — split-conformal
  intervals + placebo machinery on the canonical Basque example.
- The `scpi`, `augsynth`, `gsynth`, and `synthdid` packages on CRAN
  for the variants discussed above.
