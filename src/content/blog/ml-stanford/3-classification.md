---
title: "Logistic Regression: From Sigmoid to Regularization"
description: "A comprehensive breakdown of logistic regression, sigmoid function, loss functions, and regularization for classification tasks."
pubDate: "2024-03-24T11:00:00Z"
tags: ["Machine Learning", "Classification", "Logistic Regression"]
author: "Jongmin Lee"
heroImage: "/3-Classification/Screenshot_2024-03-24_at_2.10.03_PM.png"
draft: false
---

# 3. Classification

# Motivation

To get small handful possible number of outputs instead of infinite number of outputs

# Logistic regression (Classification)

Output is either 0 or 1

## Sigmoid function

![Screenshot 2024-03-24 at 2.10.03 PM.png](/3-Classification/Screenshot_2024-03-24_at_2.10.03_PM.png)

outputs value between 0 and 1

$g(z) = \frac{1}{1+e^{-z}}$ ($0 < g(z) < 1)$

### Steps

1.  define z function 

$f_{\overrightarrow{w},b}(\overrightarrow{x}) = z = \overrightarrow{w}\cdot\overrightarrow{x} + b$

1. take z function to sigmoid function

$g(z) = \frac{1}{1+e^{-z}}$

### Logistic regression

→ $f_{\overrightarrow{w},b}(\overrightarrow{x}) =g( \overrightarrow{w}\cdot\overrightarrow{x} + b) = \frac{1}{1+e^{( \overrightarrow{w}\cdot\overrightarrow{x} + b)}} = P(y=1|\overrightarrow{x};\overrightarrow{w},b)$

The probability that class is 1

- example
    - x is tumor size
    - y is 0(not malignant) or 1(malignant)
    - f(x) = 0.7 → 70% chance that y is 1
    - $P(y=0) + P(y=1) = 1$
        - $f_{\overrightarrow{w},b}(\overrightarrow{x}) = P(y=1|\overrightarrow{x};\overrightarrow{w},b)$
        - probability that y is 1, given input $\overrightarrow{x}$, parameters $\overrightarrow{w},b$

# Decision boundary

Prediction: $\hat{y}$

Is $f_{\overrightarrow{w},b}(\overrightarrow{x})$ ≥ 0.5?

- Yes: $\hat{y} = 1$
- No: $\hat{y}=0$

When is $f_{\overrightarrow{w},b}(\overrightarrow{x})$ ≥ 0.5?

- $g(z)$ ≥ 0.5
- z ≥ 0
- $\overrightarrow{w}\cdot\overrightarrow{x} + b$ ≥ 0 → predicts 1 (when $\overrightarrow{w}\cdot\overrightarrow{x} + b$ < 0 → predicts 0)

# Cost Function

## Squared error cost

$J(\overrightarrow{w},b)=\frac{1}{m}\sum_{i=1}^{m}\frac{1}{2}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})^2$

![Screenshot 2024-03-24 at 3.49.07 PM.png](/3-Classification/Screenshot_2024-03-24_at_3.49.07_PM.png)

Squared error cost is not a good choice for logistic regression because it can have multiple local minima

$\frac{1}{2}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})^2$ 

- → Loss function $L(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}),y^{(i)}))$

## Logistic loss function

$L(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}),y^{(i)}))$

- $-log(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))$ if $y^{(i)} =1$
- $-log(1-f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))$ if $y^{(i)} =0$

When loss close to 0, the predictions is close to the answer

### Cost

Loss function will make a convex shape that can reach a global minimum

$J(\overrightarrow{w},b)=\frac{1}{m}\sum_{i=1}^{m}L(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}),y^{(i)}))$

- $-log(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))$ if $y^{(i)} =1$
- $-log(1-f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))$ if $y^{(i)} =0$

## Simplified Cost Function

$L(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}),y^{(i)})) = - y^{(i)}log(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})) - (1-y^{(i)})log(1-f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))$

- if $y^{(i)} =1$
    - $L(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}),y^{(i)})) =-1log(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))$
- if $y^{(i)} =0$
    - $L(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}),y^{(i)})) =-1log(1-f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))$

### Loss function

$L(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}),y^{(i)})) = - y^{(i)}log(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})) - (1-y^{(i)})log(1-f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))$

### Cost function

$J(\overrightarrow{w},b)=\frac{1}{m}\sum_{i=1}^{m}[L(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}),y^{(i)}))]$

- = $-\frac{1}{m}\sum_{i=1}^{m}[ y^{(i)}log(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})) + (1-y^{(i)})log(1-f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))]$

# Gradient Descent

$J(\overrightarrow{w},b)=-\frac{1}{m}\sum_{i=1}^{m}[ y^{(i)}log(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})) + (1-y^{(i)})log(1-f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))]$

repeat {

$w_j=w_j-a\frac{d}{dw_j}J(\overrightarrow{w},b)$

- $\frac{d}{dw_j}J(\overrightarrow{w},b) = \frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}$

$b=b-a\frac{d}{db}J(\overrightarrow{w},b)$

- $\frac{d}{db}J(\overrightarrow{w},b) = \frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})$

} simultaneous updates

## Gradient descent for logistic regression

repeat {

$w_j = w_j - a[\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}]$

$b = b-a[\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})]$

}

### Linear regression model

$f_{\overrightarrow{w},b}(\overrightarrow{x})=\overrightarrow{w}\cdot\overrightarrow{x}+b$

### Logistic regression

$f_{\overrightarrow{w},b}(\overrightarrow{x})=\frac{1}{1+e^{-\overrightarrow{w}\cdot\overrightarrow{x}+b}}$

- Same concept
    - monitor gradient descent (learning curve)
    - vectorized implementation
    - Feature scaling

# The problem of overfitting

## Linear regression

![Screenshot 2024-03-24 at 4.20.17 PM.png](/3-Classification/Screenshot_2024-03-24_at_4.20.17_PM.png)

## Classification

![Screenshot 2024-03-24 at 4.21.14 PM.png](/3-Classification/Screenshot_2024-03-24_at_4.21.14_PM.png)

# Addressing overfitting

- Collecting more training examples
- Selecting features to include or exclude
    - Feature selection
- Reduce the size of parameters
    - Regularization

# Cost Function to Regularization

## Intuition

$min_{\overrightarrow{w},b}\frac{1}{2m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})^2$

- small values w1, w2,…wn,b → simpler model less likely to overfit
    - $J(\overrightarrow{w},b)=\frac{1}{2m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})^2$
- Lambda $\lambda$
    - regularization parameter $\lambda$ > 0
    - $J(\overrightarrow{w},b)=\frac{1}{2m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})^2 + \frac{\lambda}{2m}\sum_{j=1}^{m}w_j^2 + \frac{\lambda}{2m}b^2$
        - mean squared error
            - $\frac{1}{2m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})^2$
        - Regularization term
            - $\frac{\lambda}{2m}\sum_{j=1}^{m}w_j^2$
        - Can include or exclude b

## Regularization

$min_{\overrightarrow{w},b}J(\overrightarrow{w},b)=min_{\overrightarrow{w},b}[\frac{1}{2m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})^2 + \frac{\lambda}{2m}\sum_{j=1}^{m}w_j^2]$

- Linear regression example

$f_{\overrightarrow{w},b}(\overrightarrow{x})=w_1x+w_2x^2+w_3x^e+w_4x^r+b$

choose $\lambda = 10^{10}$ → underfits

choose $\lambda = 0$ → overfits

## Regularized linear regression

$min_{\overrightarrow{w},b}J(\overrightarrow{w},b)=min_{\overrightarrow{w},b}[\frac{1}{2m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})^2 + \frac{\lambda}{2m}\sum_{j=1}^{m}w_j^2]$

### Gradient descent

repeat {

$w_j = w_j - a \frac{d}{dw}J(\overrightarrow{w},b)$

$b = b - a\frac{d}{db}J(\overrightarrow{w},b)$

}

- $w_j = w_j - a \frac{d}{dw}J(\overrightarrow{w},b)$
    - $= \frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}+\frac{\lambda}{m}w_j$
- $b = b - a\frac{d}{db}J(\overrightarrow{w},b)$
    - $= \frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})$
    - don’t have to regularize b

### Implement gradient descent with regularized linear regression

repeat {

$w_j = w_j - a [\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}+\frac{\lambda}{m}w_j]$

$b = b - a\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})$

}

$w_j = w_j - a [\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}+\frac{\lambda}{m}w_j]$

- $w_j = 1w_j - a \frac{\lambda}{m}w_j-a\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}$
- $w_j = w_j (1- a \frac{\lambda}{m})-a\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}$
    - usual gradient descent update : $a\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}$
    - shrink w : $(1- a \frac{\lambda}{m})$

### How we get the derivative term

$\frac{d}{dw_j}J(\overrightarrow{w},b)=\frac{d}{dw_j}[\frac{1}{2m}\sum_{i=1}^{m}(f(\overrightarrow{x}^{(i)}-y^{(i)})+\frac{\lambda}{2m}\sum_{j=1}^{n}w_j^2]$

- = $\frac{1}{2m}\sum_{i=1}^{m}[(\overrightarrow{w}\cdot\overrightarrow{x}^{(i)}+b-y^{(i)})2x_j^{(i)}]+\frac{\lambda}{2m}2w_j$
- = $\frac{1}{m}\sum_{i=1}^{m}[(\overrightarrow{x}\cdot\overrightarrow{x}^{(i)}+b-y^{(i)})x_j^{(i)}]+\frac{\lambda}{m}w_j$
- = $\frac{1}{m}\sum_{i=1}^{m}[(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}]+\frac{\lambda}{m}w_j$

## Regularized Logistic Regression

### Logistic regression

$z = w_1x_1+...+w_nx_n+b$

### Sigmoid function

$f_{\overrightarrow{w},b}(\overrightarrow{x})=\frac{1}{1+e^{-z}}$

### Cost function

$J(\overrightarrow{w},b)=-\frac{1}{m}\sum_{i=1}^{m}[ y^{(i)}log(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})) + (1-y^{(i)})log(1-f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)}))]+\frac{\lambda}{2m}\sum_{j=1}^{n}w_j^2$

- $min_{\overrightarrow{w},b}J(\overrightarrow{w},b)$

### Gradient descent

repeat {

$w_j = w_j - a[\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})x_j^{(i)}]+\frac{\lambda}{m}w_j$

$b = b-a[\frac{1}{m}\sum_{i=1}^{m}(f_{\overrightarrow{w},b}(\overrightarrow{x}^{(i)})-y^{(i)})]$

}