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

**Source on GitHub:** [j-hai/Synth](https://github.com/j-hai/Synth) (R package) · [j-hai/synth-stata](https://github.com/j-hai/synth-stata) (Stata routine).

## What's new in `Synth` 1.2-0 (May 2026)

Version 1.2-0 is the development version on GitHub; install it with `remotes::install_github("j-hai/Synth")` (CRAN currently has 1.1-10). It adds a substantial set of user-facing features:

* **Built-in inference.** `synth_inference()` returns split-conformal (Chernozhukov–Wuthrich–Zhu 2021) or parametric prediction intervals around the synthetic counterfactual. `synth_placebos()` plus `synth_mspe_test()` give the canonical Abadie–Diamond–Hainmueller (2010) placebo p-value in two calls.
* **Ergonomic data prep.** `synth_data()` is a one-line wrapper around `dataprep()` for the common case (panel + treated unit + treatment date + auto-controls).
* **Alternative QP backends.** Optional `quadopt = "cvxr"` (CVXR + CLARABEL) and `quadopt = "torch"` (Frank-Wolfe simplex LS via the `torch` package, with CPU/CUDA/MPS support). Both live in `Suggests:` — no required dependency.
* **`ggplot2` support.** `autoplot()` methods on the inference and placebo objects produce publication-quality figures.
* **Cross-platform parallel placebos.** `parallel = TRUE` does the right thing on Windows (PSOCK cluster) and unix-likes (forks).
* **Two vignettes.** `vignette("synth-quickstart")` for a 5-minute intro and `vignette("inference")` for the inference deep dive on the Proposition 99 example.
* **Fixes and renames (October 2026).** `dataprep()` labels now follow the data when controls or periods are given out of order, `predictors.op` is applied to control units as well as the treated unit (results change only for operators other than `"mean"`), and invalid operators stop with a clear message. The placebo functions are now `synth_placebos()`, `synth_mspe_test()`, and `synth_mspe_plot()`, with a `plot()` method; the old names (`generate_placebos()` etc.) clashed with `SCtools`.

### Worked example: California's Proposition 99

The 1988 California cigarette-tax measure is a textbook case for the synthetic control method. With the new API the entire workflow is seven function calls:

```r
library(Synth); library(ggplot2)
data(smoking)

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
pl   <- synth_placebos(fit, dp)
test <- synth_mspe_test(pl)  # one-sided p-value = 0.026

autoplot(inf)                # 90% conformal band
autoplot(pl, mspe_threshold = 5)  # placebo overlay
```

The synthetic California puts about 90% of weight on Utah, Nevada, Montana, and Connecticut (close to the mix in the published Proposition 99 paper). Post / pre MSPE ratio is 128 and the placebo p-value is 0.026 — the effect is unusually large relative to other states.

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
    Placebo gap plot from <code>synth_placebos()</code>: California (black) versus the 27 of 38 placebo states (grey) with pre-MSPE no more than five times California's. The treated unit's post-period gap dominates the placebo distribution.
</div>

The current CRAN release (1.1-10, April 2026) addressed `quadopt = "LowRankQP"` fail-fast, the missing-data check in `dataprep()`, quieter defaults, and a `path.plot()` y-axis fix for negative-valued series.

The Stata routine was likewise updated in April 2026 to version 0.0.8 with **native Apple Silicon support** (the optimizer plugin now ships an arm64 Mach-O slice; previously it failed to load on M-series Macs running Stata 17+ natively), portable C source that compiles cleanly on macOS / Linux / Windows, and typo / version-declaration cleanup.

---
[Synth for R](https://cran.r-project.org/web/packages/Synth/index.html) — also on [GitHub](https://github.com/j-hai/Synth)

---

[Synth for Stata](https://ideas.repec.org/c/boc/bocode/s457334.html) — also on [GitHub](https://github.com/j-hai/synth-stata)

---
