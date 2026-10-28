---
title: "Training Neural Networks: Activation Functions, Backpropagation, and TensorFlow Implementation"
description: "Explore how neural networks are trained with gradient descent, softmax, and backpropagation using TensorFlow. Understand activation functions and multiclass classification techniques."
pubDate: "2024-03-28"
tags: ["Machine Learning", "Neural Networks", "TensorFlow"]
author: "Jongmin Lee"
draft: false
---

## 2.Neural network training

## TensorFlow Implementation

## Train a Neural Network in TensorFlow

![Slide: TensorFlow code that trains the 25-15-1 sigmoid digit network: build with Sequential, compile with BinaryCrossentropy, fit](/2-Neural-network-training/Screenshot_2024-03-28_at_8.20.09_PM.webp)

## Training Details

![Slide: the three training steps (define model, set loss and cost, minimize cost) for logistic regression in NumPy vs a network in TensorFlow](/2-Neural-network-training/Screenshot_2024-03-28_at_8.27.16_PM.webp)

### 1. Create the model

![Slide: step 1, defining the model as Sequential with Dense layers of 25, 15 and 1 sigmoid units, each layer with its own W and b](/2-Neural-network-training/Screenshot_2024-03-28_at_8.28.21_PM.webp)

### 2. Loss and cost functions

![Slide: step 2, logistic loss (binary cross entropy) and cost J(W, B), set in Keras with BinaryCrossentropy or MeanSquaredError](/2-Neural-network-training/Screenshot_2024-03-28_at_8.32.11_PM.webp)

### 3. Gradient descent

![Slide: step 3, gradient descent updates w and b by alpha times the derivative of J, computed by backpropagation inside model.fit](/2-Neural-network-training/Screenshot_2024-03-28_at_8.32.37_PM.webp)

![Slide: use libraries like TensorFlow and PyTorch instead of coding from scratch, but understand the implementation for debugging](/2-Neural-network-training/Screenshot_2024-03-28_at_8.33.49_PM.webp)

## Alternatives to the sigmoid activation

ReLU (Rectified Linear Unit)

![Slide: plots of three activation functions, linear g(z) = z, sigmoid (between 0 and 1), and ReLU g(z) = max(0, z)](/2-Neural-network-training/Screenshot_2024-03-28_at_8.43.38_PM.webp)

## Choosing activation functions

![Slide: choosing the output activation, sigmoid for binary labels, linear for regression with +/- values, ReLU for values of 0 or more](/2-Neural-network-training/Screenshot_2024-03-28_at_8.46.43_PM.webp)

## Hidden Layer

![Slide: ReLU is the most common hidden layer choice because sigmoid is flat at both ends, which slows gradient descent](/2-Neural-network-training/Screenshot_2024-03-28_at_8.47.09_PM.webp)

![Slide: activation summary, ReLU in hidden layers and sigmoid, linear or ReLU at the output, shown as Keras Dense layer code](/2-Neural-network-training/Screenshot_2024-03-28_at_8.48.38_PM.webp)

## Why do we need activation functions?

![Slide: if every g(z) in the demand network is linear, the whole network is no different from linear regression](/2-Neural-network-training/Screenshot_2024-03-28_at_8.52.12_PM.webp)

![Slide: a one-feature, two-layer network with g(z) = z collapses to a2 = w x + b, which is just linear regression](/2-Neural-network-training/Screenshot_2024-03-28_at_8.53.31_PM.webp)

![Slide: linear hidden layers turn a deep network into linear or logistic regression, so use ReLU in hidden layers instead](/2-Neural-network-training/Screenshot_2024-03-28_at_8.53.46_PM.webp)

## Multiclass

target y can take on more than two possible values

![Slide: MNIST handwritten digits 0 to 9 as a multiclass problem, where the target y can take more than two values](/2-Neural-network-training/Screenshot_2024-03-30_at_8.32.07_PM.webp)

![Slide: a two-class plot with one decision boundary next to a four-class plot that estimates P(y = k given x) for each class](/2-Neural-network-training/Screenshot_2024-03-30_at_8.33.18_PM.webp)

## Softmax

![Slide: softmax regression, a_j = e to the z_j over the sum of e to the z_k, worked for 4 classes as 0.30, 0.20, 0.15, 0.35](/2-Neural-network-training/Screenshot_2024-03-30_at_8.36.45_PM.webp)

## Cost

![Slide: logistic loss next to softmax cross-entropy loss, which is -log a_j when y = j and grows as a_j gets small](/2-Neural-network-training/Screenshot_2024-03-30_at_8.40.03_PM.webp)

## Neural network with softmax output

![Slide: a network with two ReLU hidden layers (25 and 15 units) and a 10-unit softmax output layer for 10 classes](/2-Neural-network-training/Screenshot_2024-03-30_at_8.45.23_PM.webp)

![Slide: MNIST with softmax in TensorFlow, Dense layers of 25 and 15 relu units plus 10 softmax units, with SparseCategoricalCrossentropy](/2-Neural-network-training/Screenshot_2024-03-30_at_8.45.59_PM.webp)

## Improved implementation of softmax

![Slide: for logistic loss, switch the output to linear and use BinaryCrossEntropy(from_logits=True) so the loss is computed from z](/2-Neural-network-training/Screenshot_2024-03-30_at_8.49.58_PM.webp)

![Slide: for softmax, switch the output to linear and use SparseCategoricalCrossEntropy(from_logits=True) for a more accurate loss](/2-Neural-network-training/Screenshot_2024-03-30_at_8.50.35_PM.webp)

![Slide: accurate MNIST code with a linear 10-unit output, from_logits=True, and tf.nn.softmax applied to the logits to predict](/2-Neural-network-training/Screenshot_2024-03-30_at_8.50.56_PM.webp)

![Slide: accurate logistic regression code with a linear output, BinaryCrossentropy(from_logits=True), and tf.nn.sigmoid to predict](/2-Neural-network-training/Screenshot_2024-03-30_at_8.51.26_PM.webp)

## Classification with multiple outputs

![Slide: multi-label classification on street photos, each labeled with a vector for is there a car, a bus, a pedestrian](/2-Neural-network-training/Screenshot_2024-03-30_at_8.53.01_PM.webp)

![Slide: three separate networks for car, bus and pedestrian, or one network with three sigmoid output units](/2-Neural-network-training/Screenshot_2024-03-30_at_8.53.15_PM.webp)

## Advanced Optimization

## Gradient Descent

![Slide: gradient descent on contour plots, go faster by raising alpha when steps head one way, slower when they zigzag](/2-Neural-network-training/Screenshot_2024-03-30_at_9.16.25_PM.webp)

## Adam Algorithm Intuition

![Slide: Adam (Adaptive Moment estimation) uses a separate learning rate, alpha_1 to alpha_11, for each parameter instead of one alpha](/2-Neural-network-training/Screenshot_2024-03-30_at_9.16.48_PM.webp)

![Slide: MNIST model compiled with the Adam optimizer at learning_rate=1e-3 and SparseCategoricalCrossentropy(from_logits=True)](/2-Neural-network-training/Screenshot_2024-03-30_at_9.28.37_PM.webp)

## Additional Layer Types

![Slide: in a dense layer, each neuron output is a function of all the activations from the previous layer](/2-Neural-network-training/Screenshot_2024-03-30_at_9.31.33_PM.webp)

![Slide: in a convolutional layer, each neuron looks at only part of the input image, for faster computation and less overfitting](/2-Neural-network-training/Screenshot_2024-03-30_at_9.33.01_PM.webp)

![Slide: a 1D convolutional network on an EKG signal, where 9 units each read a window of the 100 inputs, then 3 units and a sigmoid output](/2-Neural-network-training/Screenshot_2024-03-30_at_9.33.22_PM.webp)

## Back propagation

## What is a derivative?

![Slide: for J(w) = w squared at w = 3, raising w by a tiny epsilon raises J by about 6 times epsilon, so the derivative is 6](/2-Neural-network-training/Screenshot_2024-03-30_at_9.41.09_PM.webp)

![Slide: informal definition, if w up by epsilon makes J(w) go up by k times epsilon, the derivative is k, and it sets the step size](/2-Neural-network-training/Screenshot_2024-03-30_at_9.41.22_PM.webp)

![Slide: derivatives of J(w) = w squared at w = 3, 2 and -3 are 6, 4 and -6, matching the calculus result 2w](/2-Neural-network-training/Screenshot_2024-03-30_at_9.42.36_PM.webp)

![Slide: at w = 2, the derivatives of w squared, w cubed, w and 1/w are 4, 12, 1 and -1/4, each checked by nudging w](/2-Neural-network-training/Screenshot_2024-03-30_at_9.43.31_PM.webp)

![Slide: derivative notation, d/dw J(w) for one variable and the partial derivative symbol for a function of several weights](/2-Neural-network-training/Screenshot_2024-03-30_at_9.44.58_PM.webp)

## Computation graph

![Slide: computation graph for a one-unit network with w = 2, b = 8, x = -2, y = 2, running forward prop step by step to get J = 2](/2-Neural-network-training/Screenshot_2024-03-30_at_9.46.44_PM.webp)

![Slide: back prop through the computation graph, applying the chain rule right to left to get dJ/db = 2 and dJ/dw = -4](/2-Neural-network-training/Screenshot_2024-03-30_at_9.47.02_PM.webp)

![Slide: checking dJ/dw = -4 by raising w by 0.001, which lowers J from 2 to 1.996002](/2-Neural-network-training/Screenshot_2024-03-30_at_9.47.35_PM.webp)

![Slide: backprop reuses dJ/da for both dJ/dw and dJ/db, taking about N + P steps instead of N x P](/2-Neural-network-training/Screenshot_2024-03-30_at_9.47.51_PM.webp)

## Larger neural network example

![Slide: a two-layer ReLU network with x = 1 and y = 5 drawn as a computation graph, where backprop finds dJ/dw1 = 6](/2-Neural-network-training/Screenshot_2024-03-30_at_9.49.36_PM.webp)

![Slide: checking dJ/dw1 = 6 by raising w1 by 0.001, which raises J by about 0.006, and backprop costs N + P steps, not N x P](/2-Neural-network-training/Screenshot_2024-03-30_at_9.50.01_PM.webp)
