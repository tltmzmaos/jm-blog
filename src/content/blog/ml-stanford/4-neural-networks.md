---
title: "Understanding Neural Networks: From Biology to TensorFlow"
description: "A comprehensive guide to neural networks, forward propagation, TensorFlow implementation, and efficient matrix computations."
pubDate: "2024-03-26T12:00:00Z"
tags: ["Machine Learning", "Neural Networks", "TensorFlow"]
author: "Jongmin Lee"
draft: false
---

## 1. Neural Networks

## Neurons and the brain

## Neural networks

Origins: Algorithms that try to mimic the brain, Used in the 1980’s and early 1990’s

Fell out of favor in the late 1990’s

Resurgence from around 2005

speech → images → text (NLP) → …

## Demand Prediction

- example
    - one sigmoid function is an activation → a neuron

![Slide: price, shipping cost, marketing and material feed affordability, awareness and quality neurons that predict top-seller probability](/1-Neural-Networks/Screenshot_2024-03-26_at_7.54.28_PM.webp)

Each neuron is an activation

![Slide: the same demand network labeled as input layer (4 numbers), hidden layer of activations (3 numbers) and output layer (1 number)](/1-Neural-Networks/Screenshot_2024-03-26_at_8.01.27_PM.webp)

![Slide: two architectures side by side, one with two hidden layers and one with three, each ending in a single output unit](/1-Neural-Networks/Screenshot_2024-03-26_at_8.03.32_PM.webp)

## Neural network model

- Layer 1

![Slide: inside layer 1, each of 3 sigmoid units computes g(w_j dot x + b_j), giving the activation vector a1 = 0.3, 0.7, 0.2](/1-Neural-Networks/Screenshot_2024-03-26_at_8.21.49_PM.webp)

- Layer 2

![Slide: layer 2 takes a1 = 0.3, 0.7, 0.2 and its single unit computes g(w dot a1 + b), giving the scalar output a2 = 0.84](/1-Neural-Networks/Screenshot_2024-03-26_at_8.24.46_PM.webp)

- Output

![Slide: the output a2 = 0.84 is compared with 0.5 to predict category 1 (yes) or 0 (no)](/1-Neural-Networks/Screenshot_2024-03-26_at_8.25.17_PM.webp)

## More complex neural network

- Layer 3

![Slide: a four-layer network with layer 3 zoomed in, each unit computing g(w dot a2 + b) from the layer 2 output](/1-Neural-Networks/Screenshot_2024-03-26_at_8.29.08_PM.webp)

![Slide: general notation, unit j of layer l outputs a_j = g(w_j dot a of layer l-1 + b_j), with each term labeled](/1-Neural-Networks/Screenshot_2024-03-26_at_8.33.56_PM.webp)

$a_j^{[l]}=g(\overrightarrow{w}_j^{[l]}\cdot\overrightarrow{a}^{[l-1]}+b_j^{[l]})$

- $a_j^{[l]}$: Activation value of layer $l$, unit(neuron)
- $G$ function: sigmoid, activation function
- $\overrightarrow{a}^{[l-1]}$: output of layer $l-1$ (previous layer)
- $\overrightarrow{w}_j^{[l]},b_j^{[l]}$: parameters w & b of layer $l$, unit $j$

## Forward propagation

![Slide: digit recognition network (25, 15, 1 units) on 8x8 pixel images, with layer 1 computing a1 from the input x](/1-Neural-Networks/Screenshot_2024-03-26_at_8.41.24_PM.webp)

![Slide: the same digit network with layer 2 highlighted, its 15 units computing a2 from a1](/1-Neural-Networks/Screenshot_2024-03-26_at_8.42.19_PM.webp)

![Slide: forward propagation through the digit network, where output a3 is compared with 0.5 to decide if the image is a 1](/1-Neural-Networks/Screenshot_2024-03-26_at_8.43.41_PM.webp)

## TensorFlow

![Slide: coffee roasting plot of temperature vs duration with good roasts inside a triangle, next to a small network that classifies them](/1-Neural-Networks/Screenshot_2024-03-26_at_8.52.10_PM.webp)

![Slide: TensorFlow code for the coffee model, two Dense sigmoid layers (3 units, then 1) on input 200, 17, then a2 compared with 0.5](/1-Neural-Networks/Screenshot_2024-03-26_at_8.54.07_PM.webp)

![Slide: TensorFlow code for the digit model with Dense layers of 25, 15 and 1 sigmoid units, then a3 compared with 0.5](/1-Neural-Networks/Screenshot_2024-03-26_at_8.55.41_PM.webp)

## Data in TensorFlow

![Slide: NumPy 2D arrays, showing how np.array with nested lists builds a 2 x 3 matrix and a 4 x 2 matrix](/1-Neural-Networks/Screenshot_2024-03-26_at_8.58.28_PM.webp)

![Slide: the values 200 and 17 as a 1 x 2 row matrix, a 2 x 1 column matrix, and a 1D NumPy vector](/1-Neural-Networks/Screenshot_2024-03-26_at_8.58.54_PM.webp)

### NumPy vs TensorFlow

![Slide: the layer 1 output a1 is a 1 x 3 tf.Tensor of 0.2, 0.7, 0.3, and a1.numpy() turns it into a NumPy array](/1-Neural-Networks/Screenshot_2024-03-26_at_9.00.58_PM.webp)

![Slide: the layer 2 output a2 is a 1 x 1 tf.Tensor holding 0.8, converted with a2.numpy()](/1-Neural-Networks/Screenshot_2024-03-26_at_9.01.53_PM.webp)

## Building a neural network

![Slide: recap of the coffee model code, creating two Dense layers and calling them one after another on x](/1-Neural-Networks/Screenshot_2024-03-26_at_9.03.45_PM.webp)

![Slide: two Dense layers combined with Sequential, then model.compile, model.fit on 4 coffee examples, and model.predict](/1-Neural-Networks/Screenshot_2024-03-26_at_9.05.59_PM.webp)

![Slide: the same model with the two Dense layers written inline inside Sequential, followed by compile, fit and predict](/1-Neural-Networks/Screenshot_2024-03-26_at_9.06.28_PM.webp)

## Digit classification model

![Slide: digit classification model as Sequential with Dense layers of 25, 15 and 1 sigmoid units, then compile, fit and predict](/1-Neural-Networks/Screenshot_2024-03-26_at_9.07.04_PM.webp)

## Neural network implementation in Python

![Slide: forward prop for the coffee model in plain NumPy, computing each layer 1 unit with np.dot and sigmoid, then stacking them into a1](/1-Neural-Networks/Screenshot_2024-03-27_at_6.04.29_PM.webp)

![Slide: the same NumPy forward prop extended to layer 2, computing a2 as sigmoid of np.dot(w2_1, a1) + b2_1](/1-Neural-Networks/Screenshot_2024-03-27_at_6.05.04_PM.webp)

## General implementation of forward propagation

![Slide: a general dense(a_in, W, b) function in NumPy that loops over the columns of W and applies g to each unit](/1-Neural-Networks/Screenshot_2024-03-27_at_6.13.27_PM.webp)

![Slide: the dense() function plus a sequential(x) function that chains four dense layers to compute f_x](/1-Neural-Networks/Screenshot_2024-03-27_at_6.14.10_PM.webp)

## Is there a path to AGI?

- ANI - artificial narrow intelligence
    - smart speaker, self-driving car, web search…
- AGI - artificial general intelligence
    - do anything a human can do

## How neural networks are implemented efficiently

![Slide: for loops vs vectorization, replacing the per-unit loop in dense() with Z = np.matmul(A_in, W) + B](/1-Neural-Networks/Screenshot_2024-03-27_at_8.21.06_PM.webp)

## Matrix multiplication

## Dot products

![Slide: the dot product of 1, 2 and 3, 4 is 11, and a dot w is the same as a transpose times w](/1-Neural-Networks/Screenshot_2024-03-27_at_8.24.54_PM.webp)

## Vector matrix multiplication

![Slide: vector matrix multiplication, a transpose (1, 2) times W with columns (3, 4) and (5, 6) gives Z = 11, 17](/1-Neural-Networks/Screenshot_2024-03-27_at_8.27.26_PM.webp)

## Matrix matrix multiplication

![Slide: matrix matrix multiplication, where each entry of A transpose times W is a row of A transpose dotted with a column of W](/1-Neural-Networks/Screenshot_2024-03-27_at_8.31.04_PM.webp)

## Matrix multiplication rules

![Slide: a 3 x 2 matrix times a 2 x 4 matrix gives a 3 x 4 result, since dot products need vectors of the same length](/1-Neural-Networks/Screenshot_2024-03-27_at_8.36.18_PM.webp)

## Matrix multiplication code

![Slide: matrix multiplication in NumPy, using A.T for the transpose and Z = np.matmul(AT, W)](/1-Neural-Networks/Screenshot_2024-03-27_at_8.37.27_PM.webp)

### Dense layer vectorized

![Slide: vectorized dense layer, where Z = AT times W + B gives 165, -531, 900 and g(Z) gives 1, 0, 1](/1-Neural-Networks/Screenshot_2024-03-27_at_8.38.19_PM.webp)
