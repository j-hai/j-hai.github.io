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

The R package was substantially updated to version 0.2.1 in April 2026 — adding a formula interface (`ebalance(treat ~ x1 + x2, data = df)`), `print()`/`summary()`/`plot()`/`weights()` S3 methods, and numerical hardening for `ebalance.trim()`. Source on [GitHub](https://github.com/j-hai/ebal).

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

