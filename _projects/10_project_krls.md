---
layout: page
title: Kernel ML Methods
description: 
img: assets/img/kernel.jpg
importance: 1
category: methods
related_publications: true
---

### Kernel Regularized Least Squares (KRLS)

In {% cite hainmueller2014kernel %}, the use of Kernel Regularized Least Squares (KRLS) was proposed for addressing modeling and inference problems in social science. KRLS leverages machine learning techniques designed for regression and classification tasks, avoiding reliance on linearity or additivity assumptions. The method constructs a flexible hypothesis space using kernels as radial basis functions and identifies the best-fitting surface by minimizing a complexity-penalized least squares problem.

We argue that KRLS is particularly well-suited for social science applications because it avoids strong parametric assumptions while remaining interpretable, similar to generalized linear models. Additionally, it allows for the exploration of nonlinearities, interactions, and heterogeneous effects. To support other researchers, we developed an R package and a Stata routine that make these methods accessible {% cite ferwerda2017kernel %}.

→ **[Read the explainer](/projects/kernel-regularized-least-squares-explainer/)** — a self-contained tutorial on what KRLS gives you that OLS doesn't, with worked examples in both R and Stata.

**Source on GitHub:** [j-hai/KRLS](https://github.com/j-hai/KRLS) (R package) · [j-hai/krls-stata](https://github.com/j-hai/krls-stata) (Stata routine).

The R package has seen substantial development in May 2026, building toward
the next CRAN release. The headline change is **scalability**: KRLS now offers
an explicit Nyström approximation that pushes the practical ceiling from
~5,000 rows well into the tens of thousands. Source on [GitHub](https://github.com/j-hai/KRLS).

Key new features since the last CRAN release:

- **`approx = "nystrom"` (1.4-0).** A low-rank landmark approximation that
  replaces the full $n \times n$ kernel with an $m$-dimensional feature map.
  Time becomes $O(n m^2 + m^3)$ and memory $O(n m)$, so fits that were
  infeasible on a laptop now run in milliseconds, with well-calibrated
  standard errors for predictions and average marginal effects. Random
  and k-means landmark selection are both supported.
- **AME-variance optimization (1.4-0).** A row-sum rewrite of the
  per-predictor variance formula reduces work from $O(n^3)$ to $O(n^2)$
  per predictor; default `krls()` is 1.2–3× faster at moderate $n$ with
  bit-identical results.
- **`lambda_method = "gcv"` (1.5-0).** A generalized-cross-validation
  alternative to the historical leave-one-out criterion, computed in
  closed form from the kernel eigendecomposition (exact path) or the
  cached SVD of $\Phi$ (Nyström path). The default stays `"loo"`.
- **`get_landmarks()` accessor and a scaling vignette (1.4-1, 1.5-0).**
  Extract landmarks from a fit and pass them back across refits without
  the standardize-twice gotcha; the vignette `krls-nystrom-scaling` walks
  through exact-vs-Nyström timing, landmark reuse, and the LOO-vs-GCV
  trade-off.
- **Several bug fixes (1.4-1, 1.5-1, 1.5-2)** covering the eigtrunc /
  `tol` propagation path, Nyström at very small $m$, k-means with
  $m = n$, GCV's print label, and a clear error when the cross-kernel
  numerically underflows.

The 1.0-0 → 1.4-0 base also includes a formula interface, broom
methods (`tidy`, `glance`, `augment`), and `autoplot()` integration
for ggplot2.

The Stata routine was likewise updated to version 1.03 in April 2026 — bug fixes (stray-apostrophe parse glitch on the `svcov()` option path, dead options, the `kpredict` syntax declaration), a `version 11` → `version 13` bump, and a performance pass that vectorized the pairwise-distance helpers via the BLAS identity `‖x_i − x_j‖² = ‖x_i‖² + ‖x_j‖² − 2 x_iᵀx_j` (~1.2–1.3× faster across n = 100…600). No numerical changes; verified byte-for-byte against the 1.01 baseline. Source on [GitHub](https://github.com/j-hai/krls-stata).

#### Resources:

- [KRLS in R](https://cran.r-project.org/web/packages/KRLS/index.html) — also on [GitHub](https://github.com/j-hai/KRLS)
- [KRLS in Stata](http://dx.doi.org/10.18637/jss.v079.i03) — also on [GitHub](https://github.com/j-hai/krls-stata)

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/kernel.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
 </div>
