---
title: "Understanding Neural Networks: From Biology to TensorFlow"
description: "A comprehensive guide to neural networks, forward propagation, TensorFlow implementation, and efficient matrix computations."
pubDate: "2024-03-26T12:00:00Z"
tags: ["dev", "machine-learning", "neural-networks"]
author: "Jongmin Lee"
heroImage: "/1-Neural-Networks/Screenshot_2024-03-26_at_7.54.28_PM.png"
draft: false
---

# 1. Neural Networks

# Neurons and the brain

## Neural networks

Origins: Algorithms that try to mimic the brain, Used in the 1980’s and early 1990’s

Fell out of favor in the late 1990’s

Resurgence from around 2005

speech → images → text (NLP) → …

# Demand Prediction

- example
    - one sigmoid function is an activation → a neuron

![Screenshot 2024-03-26 at 7.54.28 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_7.54.28_PM.png)

Each neuron is an activation

![Screenshot 2024-03-26 at 8.01.27 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.01.27_PM.png)

![Screenshot 2024-03-26 at 8.03.32 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.03.32_PM.png)

# Neural network model

- Layer 1

![Screenshot 2024-03-26 at 8.21.49 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.21.49_PM.png)

- Layer 2

![Screenshot 2024-03-26 at 8.24.46 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.24.46_PM.png)

- Output

![Screenshot 2024-03-26 at 8.25.17 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.25.17_PM.png)

# More complex neural network

- Layer 3

![Screenshot 2024-03-26 at 8.29.08 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.29.08_PM.png)

![Screenshot 2024-03-26 at 8.33.56 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.33.56_PM.png)

$a_j^{[l]}=g(\overrightarrow{w}_j^{[l]}\cdot\overrightarrow{a}^{[l-1]}+b_j^{[l]})$

- $a_j^{[l]}$: Activation value of layer $l$, unit(neuron)
- $G$ function: sigmoid, activation function
- $\overrightarrow{a}^{[l-1]}$: output of layer $l-1$ (previous layer)
- $\overrightarrow{w}_j^{[l]},b_j^{[l]}$: parameters w & b of layer $l$, unit $j$

# Forward propagation

![Screenshot 2024-03-26 at 8.41.24 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.41.24_PM.png)

![Screenshot 2024-03-26 at 8.42.19 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.42.19_PM.png)

![Screenshot 2024-03-26 at 8.43.41 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.43.41_PM.png)

# TensorFlow

![Screenshot 2024-03-26 at 8.52.10 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.52.10_PM.png)

![Screenshot 2024-03-26 at 8.54.07 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.54.07_PM.png)

![Screenshot 2024-03-26 at 8.55.41 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.55.41_PM.png)

## Data in TensorFlow

![Screenshot 2024-03-26 at 8.58.28 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.58.28_PM.png)

![Screenshot 2024-03-26 at 8.58.54 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_8.58.54_PM.png)

### NumPy vs TensorFlow

![Screenshot 2024-03-26 at 9.00.58 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_9.00.58_PM.png)

![Screenshot 2024-03-26 at 9.01.53 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_9.01.53_PM.png)

## Building a neural network

![Screenshot 2024-03-26 at 9.03.45 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_9.03.45_PM.png)

![Screenshot 2024-03-26 at 9.05.59 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_9.05.59_PM.png)

![Screenshot 2024-03-26 at 9.06.28 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_9.06.28_PM.png)

## Digit classification model

![Screenshot 2024-03-26 at 9.07.04 PM.png](/1-Neural-Networks/Screenshot_2024-03-26_at_9.07.04_PM.png)

# Neural network implementation in Python

![Screenshot 2024-03-27 at 6.04.29 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_6.04.29_PM.png)

![Screenshot 2024-03-27 at 6.05.04 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_6.05.04_PM.png)

# General implementation of forward propagation

![Screenshot 2024-03-27 at 6.13.27 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_6.13.27_PM.png)

![Screenshot 2024-03-27 at 6.14.10 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_6.14.10_PM.png)

# Is there a path to AGI?

- ANI - artificial narrow intelligence
    - smart speaker, self-driving car, web search…
- AGI - artificial general intelligence
    - do anything a human can do

# How neural networks are implemented efficiently

![Screenshot 2024-03-27 at 8.21.06 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_8.21.06_PM.png)

# Matrix multiplication

## Dot products

![Screenshot 2024-03-27 at 8.24.54 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_8.24.54_PM.png)

## Vector matrix multiplication

![Screenshot 2024-03-27 at 8.27.26 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_8.27.26_PM.png)

## Matrix matrix multiplication

![Screenshot 2024-03-27 at 8.31.04 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_8.31.04_PM.png)

## Matrix multiplication rules

![Screenshot 2024-03-27 at 8.36.18 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_8.36.18_PM.png)

## Matrix multiplication code

![Screenshot 2024-03-27 at 8.37.27 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_8.37.27_PM.png)

### Dense layer vectorized

![Screenshot 2024-03-27 at 8.38.19 PM.png](/1-Neural-Networks/Screenshot_2024-03-27_at_8.38.19_PM.png)