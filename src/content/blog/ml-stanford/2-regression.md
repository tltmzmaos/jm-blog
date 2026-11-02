---
title: "Regression with Multiple Input Variables"
description: "Deep dive into multiple linear regression, vectorization, gradient descent, feature scaling, and polynomial regression."
pubDate: "2024-03-20T10:00:00Z"
updatedDate: "2024-03-20"
tags: ["Machine Learning", "Regression", "Gradient Descent"]
author: "Jongmin Lee"
draft: false
---

## 2. Regression with multiple input variables

## Multiple Features

![Slide: house price table with features x_1 to x_4 (size, bedrooms, floors, age); row 2 is x^(2) and x_3^(2) = 2](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-20_at_10.30.22_PM.webp)

## Model

$$
f_w,_b(x) = w_1x_1+w_2x_2+...+w_nx_n+b
$$

- parameters of the model

$\overrightarrow{w}$ = [w1 w2 w3 .. wn]

- number

b

- vector

$\overrightarrow{x}$ = [x1 x2 x3 .. xn]

### Simplified: multiple linear regression

$f_w,_b(x) = w_1x_1+w_2x_2+...+w_nx_n+b = \overrightarrow{w}\cdot\overrightarrow{x}+b$

## Vectorization

## Parameters and features

$\overrightarrow{w}$ = [w1 w2 w3] (n = 3)

b is a number

 $\overrightarrow{x}$ = [x1 x2 x3 .. xn]

```python
w = np.array([1, 2, 3])
b = 4
x = np.array([10, 20, 30])
```

### Without vectorization

$f_{\overrightarrow{w}},_b(\overrightarrow{x}) = w_1x_1+w_2x_2+...+w_nx_n+b$

```python
f = w[0]*x[0] + w[1]*x[1] + w[2]*x[2] + b
```

$= f_{\overrightarrow{w}},_b(\overrightarrow{x}) = \sum_{j=1}^{n}w_jx_j+b$

```python
f = 0
for j in range(n):
	f = f + w[j] * x[j]
f = f + b
```

### With vectorization

$f_{\overrightarrow{w}},_b(\overrightarrow{x}) = \overrightarrow{w}\cdot\overrightarrow{x}+b$

```python
f = np.dot(w,x) + b
```

vectorization calculate each columns in parallel

- much less time
- efficient → scale to large dataset

## Gradient descent

$\overrightarrow{w}$ = (w1 w2 … w16)

$\overrightarrow{d}$ = (d1 d2 … d16)

```python
w = np.array([0.5, 1.3, ... , 3.4])
d = np.array([0.3, 0.2, ... , 0.4])
```

Compute $w_j = w_j - 0.1 d_j$ for $j = 1 ... 16$

### Without vectorization

w1 = w1 - 0.1d1

…

w16 = w16 - 0.1d16

```python
for j in range(16):
	w[j] = w[j] - 0.1 * d[j]
```

### With vectorization

$\overrightarrow{w}=\overrightarrow{w}-0.1\overrightarrow{d}$

```python
w = w - 0.1 * d
```

## Gradient descent for multiple regression

## Previous notation

### Parameters

$w_1,...,w_n$

$b$

### Model

$f_{\overrightarrow{w},b}(\overrightarrow{x})=w_1x_1+...+w_nx_n+b$

### Cost function

$J(w_1,...,w_n,b)$

### Gradient descent

repeat {

$w_j=w_j-a\frac{d}{dw_j}J(w_1,...w_n,b)$

$b=b-a\frac{d}{dw_b}J(w_1,...w_n,b)$

}

## Vector notation

### Parameters

$\overrightarrow{w}=[w_1...w_n]$

$b$

### Model

$f_{\overrightarrow{w},b}(\overrightarrow{x})=\overrightarrow{w}\cdot\overrightarrow{x}+b$

### Cost function

$J(\overrightarrow{w},b)$

### Gradient descent

repeat {

$w_j = w_j - a\frac{d}{dw_j}J(\overrightarrow{w},b)$

$b = b - a\frac{d}{dw_b}J(\overrightarrow{w},b)$

}

## Gradient Descent

### One feature

repeat {

$w = w - a \frac{1}{m}\sum_{i=1}^{m}(f_w,_b(x^{(i)})-y^{(i)})x^{(i)}$

- $\frac{1}{m}\sum_{i=1}^{m}(f_w,_b(x^{(i)})-y^{(i)})x^{(i)} = \frac{d}{dw}J(w,b)$

$b = b - a\frac{1}{m}\sum_{i=1}^{m}(f_w,_b(x^{(i)})-y^{(i)})$

simultaneously update w, b

}

### n features (n ≥ 2)

repeat {

j = 1 : $w_1 = w_1 - a \frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x^{(i)}$

- $\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w}},_b(\overrightarrow{x}^{(i)})-y^{(i)})x^{(i)} = \frac{d}{dw_1}J(\overrightarrow{w},b)$

$b = b - a\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})$

simulatenously update $w_j$ (for $j = 1,..,n)$ and $b$

}

## An alternative to gradient descent

### Normal equation

- only for linear regression
- solve for w, b without iterations
- need to know
    - Normal equation method may be used in machine learning libraries that implement linear regression
    - Gradient descent is the recommended method for finding parameters w, b
- disadvantages
    - doesn’t generalize to other learning algorithms
    - slow when number of features is large (> 10,000)

## Feature scaling

Feature scaling enables gradient descent to run much faster by rescaling the range of each features

- aim for about -1 ≤ $x_j$ ≤ 1 for each feature $x_j$
    - acceptable ranges
        - -3 ≤ x ≤ 3
        - -0.3 ≤ x ≤ 0.3
    - Okay, no rescaling
        - 0 ≤ x ≤ 3
        - -2 ≤ x ≤ 0.5
    - rescaling
        - -100 ≤ x ≤ 100
        - -0.001 ≤ x ≤ 0.001
        - 98.6 ≤ x ≤ 105
- example
    
    ![Slide: for price = w_1 x_1 + w_2 x_2 + b, size spans 300 to 2,000 and bedrooms 0 to 5, so a small w_1 and large w_2 give a sensible price](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.00.55_PM.webp)
    
    ![Slide: a large-range feature gets a small weight; unscaled features give a flat scatterplot and tall, narrow J(w,b) contours](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.01.42_PM.webp)
    
    ![Slide: after rescaling, the features spread evenly and J(w,b) contours turn circular, so gradient descent stops bouncing back and forth](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.02.04_PM.webp)
    

### Mean normalization

![Slide: mean normalization, x_1 = (x_1 - mu_1) / (max - min), turning 300 to 2000 into -0.18 to 0.82 and 0 to 5 into -0.46 to 0.54](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.05.06_PM.webp)

### Z-score normalization

![Slide: z-score normalization, x_1 = (x_1 - mu_1) / sigma_1 with sigma_1 = 450, giving ranges like -0.67 to 3.1 and -1.6 to 1.9](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.07.16_PM.webp)

## Checking Gradient descent for convergence

![Slide: learning curve of J(w,b) falling with iterations and flattening by 400, plus an automatic convergence test with epsilon 0.001](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.13.24_PM.webp)

## Choosing the learning rate

![Slide: J(w,b) rising or bouncing over iterations points to a bug or too large alpha; a small enough alpha makes it drop every iteration](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.15.14_PM.webp)

## Feature engineering

![Slide: feature engineering for house price, adding area x_3 = x_1 x_2 (frontage times depth) as a new feature](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.16.45_PM.webp)

## Polynomial regression

![Slide: quadratic and cubic fits of price vs size; size, size^2 and size^3 have very different ranges, so feature scaling matters](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.18.30_PM.webp)

![Slide: price vs size fit with f(x) = w_1 x + w_2 sqrt(x) + b, a curve that keeps rising instead of bending down](/2-Regression-with-multiple-input-variables/Screenshot_2024-03-24_at_12.19.20_PM.webp)
