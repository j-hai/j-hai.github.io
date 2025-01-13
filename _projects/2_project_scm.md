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


---
[Synth for R](https://cran.r-project.org/web/packages/Synth/index.html)

---

[Synth for Stata](https://ideas.repec.org/c/boc/bocode/s457334.html)

---
[Explainer for R and Stata](https://lost-stats.github.io/Model_Estimation/Research_Design/synthetic_control_method.html)


<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/synthpic.jpeg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Estimating effects with the synthetic control method.
</div>

