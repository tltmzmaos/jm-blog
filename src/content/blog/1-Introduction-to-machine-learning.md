---
title: "Introduction to Machine Learning"
description: "Overview of supervised and unsupervised learning, linear regression, and gradient descent"
pubDate: "2025-08-04"
updatedDate: "2025-08-04" # ⭕ 선택 (없어도 OK)
tags: ["machine learning", "regression", "gradient descent"]
heroImage: "/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.31.37_PM.png" # ⭕ 선택
author: "Jongmin Lee"  # ⭕ 선택 (없으면 'Anonymous')
draft: false           # ⭕ 선택 (기본 false)
---

# 1. Introduction to machine learning

# Supervised learning

> input x → output y (learns from being right answers)
> 
- Examples
    - Spam email filtering
    - Audio text transcripts (speech recognition)
    - Language translations
    - Online advertisement
    - Self-driving car
    - Visual inspection

## Regression

Regression predicts a number infinitely many possible outputs

![Screenshot 2024-03-20 at 6.28.25 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.28.25_PM.png)

## Classification

Classification predicts categories, small number of possible outputs

![Screenshot 2024-03-20 at 6.29.45 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.29.45_PM.png)

### Two or more inputs

![Screenshot 2024-03-20 at 6.30.48 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.30.48_PM.png)

# Unsupervised Learning

Find something interesting in unlabeled data

![Screenshot 2024-03-20 at 6.34.39 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.34.39_PM.png)

- example
    - Google news
        
        ![Screenshot 2024-03-20 at 6.35.56 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.35.56_PM.png)
        
    - DNA microarray
        
        ![Screenshot 2024-03-20 at 6.56.07 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.56.07_PM.png)
        

## Unsupervised learning

> Data only comes with inputs x, but not output labels y: Algorithm has to find structure in the data
> 
- clustering - group similar data points together
- Anomaly detection - find unusual data points
- Dimensionality reduction - compress data using fewer numbers

# Linear Regression Model

![Screenshot 2024-03-20 at 7.04.07 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.04.07_PM.png)

## Terminology

![Screenshot 2024-03-20 at 7.05.47 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.05.47_PM.png)

- Training set - data used to train the model
- x - input variable feature
- y - output variable, target variable
- m - number of training examples
- (x,y) - single training example
- $(x^{(i)},y^{(i)})$ - ith training example
    - ex) $(x^{(1)}, y^{(1)}) = (2104,400)$

![Screenshot 2024-03-20 at 7.09.04 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.09.04_PM.png)

# Cost Function

![Screenshot 2024-03-20 at 7.10.21 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.10.21_PM.png)

## What do w, b do?

Find w,b:

$\hat{y}^{(i)}$ is close to $y^{(i)}$ for all $(x^{(i)},y^{(i)})$

![Screenshot 2024-03-20 at 7.11.31 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.11.31_PM.png)

## Cost function

cost function is to see how well the model is doing

$$
J(w,b) = \frac{1}{2m}\sum_{i=1}^m (f_w,_b(x^{(i)})-y^{(i)})^2
$$

![Screenshot 2024-03-20 at 7.13.53 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.13.53_PM.png)

- error : $\hat{y}^{(i)}-y^{(i)}$ (prediction_i - realvalue_i)
    - different people use different cost function
    - squared error cost function is the most commonly used one

## Cost function intuition

- model
    - $f_w,_b(x) = wx + b$
- parameter
    - $w, b$
- cost function
    - $J(w,b) = \frac{1}{2m}\sum_{i=1}^m (f_w,_b(x^{(i)})-y^{(i)})^2$
- goal
    - $minimize_w,_bJ(w,b)$

### Simplified cost function

- model
    - $f_w(x) = wx$
- parameter
    - $w$
- cost function
    - $J(w) = \frac{1}{2m}\sum_{i=1}^m (f_w(x^{(i)})-y^{(i)})^2$
- goal
    - $minimize_wJ(w)$
- examples
    
    ![Screenshot 2024-03-20 at 7.27.29 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.27.29_PM.png)
    
    ![Screenshot 2024-03-20 at 7.28.47 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.28.47_PM.png)
    
    ![Screenshot 2024-03-20 at 7.29.59 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.29.59_PM.png)
    

# Visualizing the cost function

![Screenshot 2024-03-20 at 7.33.45 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.33.45_PM.png)

- examples
    
    ![Screenshot 2024-03-20 at 7.34.40 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.34.40_PM.png)
    
    ![Screenshot 2024-03-20 at 7.35.03 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.35.03_PM.png)
    
    ![Screenshot 2024-03-20 at 7.35.27 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.35.27_PM.png)
    

# Gradient Descent

Have some function $J(w,b)$ for linear regression or any function

Want $min_w,_bJ(w,b)$

Outline:

- Start with some w, b (set w=0,b=0)
- keep changing w,b to reduce J(w,b)
- until we settle at or near a minimum
    - may have > 1 minimum
        
        ![Screenshot 2024-03-20 at 9.11.58 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.11.58_PM.png)
        

## Implementing gradient descent

### Gradient descent algorithm

simultaneously update w and b

$$
w = w - a\frac{d}{dw}J(w,b)
$$

$$
b = b - a\frac{d}{db}J(w,b)
$$

$a$: learning rate

$\frac{d}{dw}J(w,b)$: Derivative

## Gradient descent intuition

![Screenshot 2024-03-20 at 9.16.20 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.16.20_PM.png)

## Learning rate

if a is too small, gradient descent may be slow

if a is too large, gradient descent may:

- overshoot, never reach minimum
- fail to converge, diverge

![Screenshot 2024-03-20 at 9.19.26 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.19.26_PM.png)

## Gradient descent for linear regression

### Linear regression model

$$
f_w,_b(x) = wx + b
$$

### Cost function

$$
J(w,b) = \frac{1}{2m}\sum_{i=1}^m (f_w,_b(x^{(i)})-y^{(i)})^2
$$

### Gradient descent algorithm

repeat until convergence

$$
w = w - a\frac{d}{dw}J(w,b)
$$

- $w = w - a\frac{d}{dw}J(w,b)$
    - $\frac{1}{m}\sum_{i=1}^m(f_w,_b(x^{(i)})-y^{(i)})x^{(i)}$

$$
b = b - a\frac{d}{db}J(w,b)
$$

- $b = b - a\frac{d}{db}J(w,b)$
    - $\frac{1}{m}\sum_{i=1}^m(f_w,_b(x^{(i)})-y^{(i)})$

![Screenshot 2024-03-20 at 9.27.44 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.27.44_PM.png)

- squared error cost will never have local minimum
- gradient descent with convex function will always converge with global minimum

### Mathematics

$\frac{1}{m}\sum_{i=1}^{m}(f_w,_b(x^{(i)})-y^{(i)})x^{(i)}$

1. $\frac{d}{dw}J(w,b)$
2. $\frac{d}{dw}\frac{1}{2m}\sum_{i=1}^{m}(f_w,_b(x^{(i)})-y^{(i)})^2$
3. $\frac{d}{dw}\frac{1}{2m}\sum_{i=1}^{m}(wx^{(i)}+b-y^{(i)})^2$
4. $\frac{1}{2m}\sum_{i=1}^{m}(wx^{(i)}+b-y^{(i)})2x^{(i)}$

$\frac{1}{m}\sum_{i=1}^{m}(f_w,_b(x^{(i)})-y^{(i)})$

1. $\frac{d}{db}J(w,b)$
2. $\frac{d}{db}\frac{1}{2m}\sum_{i=1}^{m}(f_w,_b(x^{(i)})-y^{(i)})^2$
3. $\frac{d}{db}\frac{1}{2m}\sum_{i=1}^{m}(wx^{(i)}+b-y^{(i)})^2$
4. $\frac{1}{2m}\sum_{i=1}^{m}(wx^{(i)}+b-y^{(i)})2$

## Running gradient descent

![Screenshot 2024-03-20 at 9.31.37 PM.png](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.31.37_PM.png)

---

# Source

[Machine Learning](https://www.coursera.org/specializations/machine-learning-introduction?myLearningTab=IN_PROGRESS)