---
layout: page
title: Synthetic Control Methods
description: 
img: assets/img/synthpic.jpeg
importance: 1
category: methods
related_publications: true
---

The synthetic control method enables researchers to estimate causal effects by constructing a synthetic version of a treatment unit through a weighted combination of control units. It is implemented as both an R package and a Stata routine, based on the methods developed in the following papers {% cite abadie2010synthetic %}, {% cite abadie2015comparative %}, and {% cite abadie2011synth %}. This work was awarded the Gosnell Prize for Excellence in Political Methodology.

→ **[Read the explainer](/projects/synthetic-control-methods-explainer/)** — a self-contained tutorial on the synthetic control method for R and Stata users, with the canonical Proposition 99 example worked end-to-end.

## What's new in `Synth` 1.2-0 (May 2026)

The R package was updated in May 2026 with a substantial set of user-facing additions:

* **Built-in inference.** `synth_inference()` returns split-conformal (Chernozhukov–Wuthrich–Zhu 2021) or parametric prediction intervals around the synthetic counterfactual. `generate_placebos()` plus `mspe_test()` give the canonical Abadie–Diamond–Hainmueller (2010) placebo p-value in one call.
* **Ergonomic data prep.** `synth_data()` is a one-line wrapper around `dataprep()` for the common case (panel + treated unit + treatment date + auto-controls).
* **Alternative QP backends.** Optional `quadopt = "cvxr"` (CVXR + ECOS) and `quadopt = "torch"` (Frank-Wolfe simplex LS via the `torch` package, with CPU/CUDA/MPS support). Both live in `Suggests:` — no required dependency.
* **`ggplot2` support.** `autoplot()` methods on the inference and placebo objects produce publication-quality figures.
* **Cross-platform parallel placebos.** `parallel = TRUE` does the right thing on Windows (PSOCK cluster) and unix-likes (forks).
* **Two vignettes.** `vignette("synth-quickstart")` for a 5-minute intro and `vignette("inference")` for a deep dive on the canonical Basque example.

### Worked example: California's Proposition 99

The 1988 California cigarette-tax measure is a textbook case for the synthetic control method. With the new API the entire workflow is six function calls:

```r
library(Synth); library(haven); library(ggplot2)
data(smoking)  # or read_dta("smoking.dta")

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

fit  <- synth(dp)
inf  <- synth_inference(fit, dp, method = "conformal", alpha = 0.10)
pl   <- generate_placebos(fit, dp)
test <- mspe_test(pl)        # one-sided p-value = 0.026

autoplot(inf)                # 90% conformal band
autoplot(pl, mspe_threshold = 5)  # placebo overlay
```

The synthetic California puts about 84% of weight on Utah, Nevada, Montana, and Connecticut (matching the published `Synth` paper). Post / pre MSPE ratio is 128 and the placebo p-value is 0.026 — the effect is unusually large relative to other states.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/synth_conformal_california.png" title="California synthetic control with 90% conformal band" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    California versus its synthetic control after Proposition 99, with the 90% split-conformal band from <code>synth_inference()</code>.
</div>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/synth_placebos_california.png" title="Placebo gap plot for California" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Placebo gap plot from <code>generate_placebos()</code>: California (black) versus 38 placebo states (grey, restricted to those with pre-MSPE no more than five times California's). The treated unit's post-period gap dominates the placebo distribution.
</div>

The previous release (1.1-10, April 2026) addressed `quadopt = "LowRankQP"` fail-fast, the missing-data check in `dataprep()`, quieter defaults, and a `path.plot()` y-axis fix for negative-valued series.

The Stata routine was likewise updated in April 2026 to version 0.0.8 with **native Apple Silicon support** (the optimizer plugin now ships an arm64 Mach-O slice; previously it failed to load on M-series Macs running Stata 17+ natively), portable C source that compiles cleanly on macOS / Linux / Windows, and typo / version-declaration cleanup.

---
[Synth for R](https://cran.r-project.org/web/packages/Synth/index.html) — also on [GitHub](https://github.com/j-hai/Synth)

---

[Synth for Stata](https://ideas.repec.org/c/boc/bocode/s457334.html) — also on [GitHub](https://github.com/j-hai/synth-stata)

---
