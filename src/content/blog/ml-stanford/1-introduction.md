---
title: "Introduction to Machine Learning"
description: "Overview of supervised and unsupervised learning, linear regression, and gradient descent"
pubDate: "2024-03-20"
updatedDate: "2024-08-04"
tags: ["Machine Learning", "Regression", "Gradient Descent"]
author: "Jongmin Lee"
draft: false
---

## 1. Introduction to machine learning

## Supervised learning

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

![Plot of house price vs size in square feet, where a straight line and a curve predict about 150K or 200K for a 750 sq ft house](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.28.25_PM.webp)

## Classification

Classification predicts categories, small number of possible outputs

![Plot of tumor size vs diagnosis, benign as 0 and malignant as 1, showing classification into a small set of categories](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.29.45_PM.webp)

### Two or more inputs

![Plot of age vs tumor size with benign circles and malignant crosses separated by a curved boundary](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.30.48_PM.webp)

## Unsupervised Learning

Find something interesting in unlabeled data

![Side-by-side plots: supervised learning with labeled benign and malignant points, and unsupervised clustering of unlabeled points](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.34.39_PM.webp)

- example
    - Google news
        
        ![Google News story cluster about giant panda twin cubs, with the shared words panda, twin and zoo circled across headlines](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.35.56_PM.webp)
        
    - DNA microarray
        
        ![DNA microarray heatmap with genes as rows and individuals as columns, grouped into three types of people](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_6.56.07_PM.webp)
        

## Unsupervised learning

> Data only comes with inputs x, but not output labels y: Algorithm has to find structure in the data
> 
- clustering - group similar data points together
- Anomaly detection - find unusual data points
- Dimensionality reduction - compress data using fewer numbers

## Linear Regression Model

![House size vs price scatter plot with a linear regression line predicting about 220K for a 1250 sq ft house](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.04.07_PM.webp)

## Terminology

![Training set table of house size x and price y with m = 47, and notation for x, y, m and the i-th example (x^(i), y^(i))](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.05.47_PM.webp)

- Training set - data used to train the model
- x - input variable feature
- y - output variable, target variable
- m - number of training examples
- (x,y) - single training example
- $(x^{(i)},y^{(i)})$ - ith training example
    - ex) $(x^{(1)}, y^{(1)}) = (2104,400)$

![Diagram: training set to learning algorithm to model f, which maps feature x to prediction y-hat; linear model f_w,b(x) = wx + b](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.09.04_PM.webp)

## Cost Function

![Training set of house sizes and prices next to the model f_w,b(x) = wx + b, where w and b are the parameters](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.10.21_PM.webp)

## What do w, b do?

Find w,b:

$\hat{y}^{(i)}$ is close to $y^{(i)}$ for all $(x^{(i)},y^{(i)})$

![Fitted line f_w,b where training point (x^(i), y^(i)) sits above its prediction y-hat^(i) = w x^(i) + b](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.11.31_PM.webp)

## Cost function

cost function is to see how well the model is doing

$$
J(w,b) = \frac{1}{2m}\sum_{i=1}^m (f_w,_b(x^{(i)})-y^{(i)})^2
$$

![Squared error cost J(w,b) = 1/(2m) times the sum of (f_w,b(x^(i)) - y^(i))^2, next to a fitted line plot](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.13.53_PM.webp)

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
    
    ![Simplified model with w = 1: the line passes through all three points, so J(1) = 0 on the J(w) plot](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.27.29_PM.webp)
    
    ![With w = 0.5 the line falls below the points, giving J(0.5) of about 0.58 on the J(w) plot](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.28.47_PM.webp)
    
    ![Lines for several w values on the left, and the resulting U-shaped J(w) curve on the right with its minimum at w = 1](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.29.59_PM.webp)
    

## Visualizing the cost function

![House price data, a contour plot of J(w,b) with the minimum at its center, and a 3D cost surface, compared to mountain contour maps](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.33.45_PM.webp)

- examples
    
    ![Line f(x) = -0.15x + 800 fits the house data poorly, and its (w, b) point sits far from the center of the J contour plot](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.34.40_PM.webp)
    
    ![Line f(x) = -0.15x + 500, still a poor fit, with its point on a different contour of J(w,b)](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.35.03_PM.webp)
    
    ![Line f(x) = 0.13x + 71 fits the house data well, and its point sits at the minimum of the J(w,b) contour plot](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_7.35.27_PM.webp)
    

## Gradient Descent

Have some function $J(w,b)$ for linear regression or any function

Want $min_w,_bJ(w,b)$

Outline:

- Start with some w, b (set w=0,b=0)
- keep changing w,b to reduce J(w,b)
- until we settle at or near a minimum
    - may have > 1 minimum
        
        ![Hilly 3D cost surface J(w,b) where gradient descent from two nearby starting points ends in different local minima](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.11.58_PM.webp)
        

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

![J(w) curves showing that w = w - alpha dJ/dw moves w left on a positive slope and right on a negative slope](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.16.20_PM.webp)

## Learning rate

if a is too small, gradient descent may be slow

if a is too large, gradient descent may:

- overshoot, never reach minimum
- fail to converge, diverge

![Gradient descent with a fixed learning rate alpha takes smaller steps near the minimum because the derivative shrinks](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.19.26_PM.webp)

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

![3D bowl-shaped squared error cost J(w,b): a convex function with a single global minimum](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.27.44_PM.webp)

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

![Gradient descent on house prices: the fitted line improves as the cost drops from 77237 to 2311 on the J(w,b) contour plot](/1-Introduction-to-machine-learning/Screenshot_2024-03-20_at_9.31.37_PM.webp)

---

## Source

[Machine Learning](https://www.coursera.org/specializations/machine-learning-introduction?myLearningTab=IN_PROGRESS)
