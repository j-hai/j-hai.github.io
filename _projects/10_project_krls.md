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

The R package was updated to version 1.1-0 in April 2026 with a fix for an R 4.4+ deprecation that fired twice on every fit (`Eigenobject$values + lambda` recycled a 1×1 matrix), cleaner errors when methods receive non-`krls` input, and DESCRIPTION modernization. Source on [GitHub](https://github.com/j-hai/KRLS).

The Stata routine was likewise updated to version 1.03 in April 2026 — bug fixes (stray-apostrophe parse glitch on the `svcov()` option path, dead options, the `kpredict` syntax declaration), a `version 11` → `version 13` bump, and a performance pass that vectorized the pairwise-distance helpers via the BLAS identity `‖x_i − x_j‖² = ‖x_i‖² + ‖x_j‖² − 2 x_iᵀx_j` (~1.2–1.3× faster across n = 100…600). No numerical changes; verified byte-for-byte against the 1.01 baseline. Source on [GitHub](https://github.com/j-hai/krls-stata).

#### Resources:

- [KRLS in R](https://cran.r-project.org/web/packages/KRLS/index.html) — also on [GitHub](https://github.com/j-hai/KRLS)
- [KRLS in Stata](http://dx.doi.org/10.18637/jss.v079.i03) — also on [GitHub](https://github.com/j-hai/krls-stata)
- [Explainer for R and Stata](/projects/Kernel-Regularized-Least-Squares-—-an-Explainer/) — a self-contained tutorial on what KRLS gives you that OLS doesn't, with worked examples in both R and Stata.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/kernel.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
 </div>
