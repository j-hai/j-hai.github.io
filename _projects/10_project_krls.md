---
layout: page
title: Kernel ML Methods
description: 
img: assets/img/kernel.jpeg
importance: 1
category: methods
related_publications: true
---

### Kernel Regularized Least Squares (KRLS)

In {% cite hainmueller2014kernel %}, the use of Kernel Regularized Least Squares (KRLS) was proposed for addressing modeling and inference problems in social science. KRLS leverages machine learning techniques designed for regression and classification tasks, avoiding reliance on linearity or additivity assumptions. The method constructs a flexible hypothesis space using kernels as radial basis functions and identifies the best-fitting surface by minimizing a complexity-penalized least squares problem.

We argue that KRLS is particularly well-suited for social science applications because it avoids strong parametric assumptions while remaining interpretable, similar to generalized linear models. Additionally, it allows for the exploration of nonlinearities, interactions, and heterogeneous effects. To support other researchers, we developed an R package and a Stata routine that make these methods accessible {% cite ferwerda2017kernel %}.

#### Resources:

- [KRLS in R](https://cran.r-project.org/web/packages/KRLS/index.html)
- [KRLS in Stata](http://dx.doi.org/10.18637/jss.v079.i03)

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/kernel.jpeg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
 </div>

