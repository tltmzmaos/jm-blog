---
title: "Training Neural Networks: Activation Functions, Backpropagation, and TensorFlow Implementation"
description: "Explore how neural networks are trained with gradient descent, softmax, and backpropagation using TensorFlow. Understand activation functions and multiclass classification techniques."
pubDate: "2024-03-28"
tags: ["dev", "machine-learning", "neural-networks", "tensorflow"]
author: "Jongmin Lee"
heroImage: "/2-Neural-network-training/Screenshot_2024-03-28_at_8.20.09_PM.png"
draft: false
---

# 2.Neural network training

# TensorFlow Implementation

## Train a Neural Network in TensorFlow

![Screenshot 2024-03-28 at 8.20.09 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.20.09_PM.png)

## Training Details

![Screenshot 2024-03-28 at 8.27.16 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.27.16_PM.png)

### 1. Create the model

![Screenshot 2024-03-28 at 8.28.21 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.28.21_PM.png)

### 2. Loss and cost functions

![Screenshot 2024-03-28 at 8.32.11 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.32.11_PM.png)

### 3. Gradient descent

![Screenshot 2024-03-28 at 8.32.37 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.32.37_PM.png)

![Screenshot 2024-03-28 at 8.33.49 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.33.49_PM.png)

# Alternatives to the sigmoid activation

ReLU (Rectified Linear Unit)

![Screenshot 2024-03-28 at 8.43.38 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.43.38_PM.png)

# Choosing activation functions

![Screenshot 2024-03-28 at 8.46.43 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.46.43_PM.png)

## Hidden Layer

![Screenshot 2024-03-28 at 8.47.09 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.47.09_PM.png)

![Screenshot 2024-03-28 at 8.48.38 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.48.38_PM.png)

# Why do we need activation functions?

![Screenshot 2024-03-28 at 8.52.12 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.52.12_PM.png)

![Screenshot 2024-03-28 at 8.53.31 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.53.31_PM.png)

![Screenshot 2024-03-28 at 8.53.46 PM.png](/2-Neural-network-training/Screenshot_2024-03-28_at_8.53.46_PM.png)

# Multiclass

target y can take on more than two possible values

![Screenshot 2024-03-30 at 8.32.07 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.32.07_PM.png)

![Screenshot 2024-03-30 at 8.33.18 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.33.18_PM.png)

# Softmax

![Screenshot 2024-03-30 at 8.36.45 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.36.45_PM.png)

## Cost

![Screenshot 2024-03-30 at 8.40.03 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.40.03_PM.png)

## Neural network with softmax output

![Screenshot 2024-03-30 at 8.45.23 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.45.23_PM.png)

![Screenshot 2024-03-30 at 8.45.59 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.45.59_PM.png)

## Improved implementation of softmax

![Screenshot 2024-03-30 at 8.49.58 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.49.58_PM.png)

![Screenshot 2024-03-30 at 8.50.35 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.50.35_PM.png)

![Screenshot 2024-03-30 at 8.50.56 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.50.56_PM.png)

![Screenshot 2024-03-30 at 8.51.26 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.51.26_PM.png)

# Classification with multiple outputs

![Screenshot 2024-03-30 at 8.53.01 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.53.01_PM.png)

![Screenshot 2024-03-30 at 8.53.15 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_8.53.15_PM.png)

# Advanced Optimization

## Gradient Descent

![Screenshot 2024-03-30 at 9.16.25 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.16.25_PM.png)

## Adam Algorithm Intuition

![Screenshot 2024-03-30 at 9.16.48 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.16.48_PM.png)

![Screenshot 2024-03-30 at 9.28.37 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.28.37_PM.png)

# Additional Layer Types

![Screenshot 2024-03-30 at 9.31.33 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.31.33_PM.png)

![Screenshot 2024-03-30 at 9.33.01 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.33.01_PM.png)

![Screenshot 2024-03-30 at 9.33.22 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.33.22_PM.png)

# Back propagation

## What is a derivative?

![Screenshot 2024-03-30 at 9.41.09 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.41.09_PM.png)

![Screenshot 2024-03-30 at 9.41.22 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.41.22_PM.png)

![Screenshot 2024-03-30 at 9.42.36 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.42.36_PM.png)

![Screenshot 2024-03-30 at 9.43.31 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.43.31_PM.png)

![Screenshot 2024-03-30 at 9.44.58 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.44.58_PM.png)

## Computation graph

![Screenshot 2024-03-30 at 9.46.44 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.46.44_PM.png)

![Screenshot 2024-03-30 at 9.47.02 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.47.02_PM.png)

![Screenshot 2024-03-30 at 9.47.35 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.47.35_PM.png)

![Screenshot 2024-03-30 at 9.47.51 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.47.51_PM.png)

## Larger neural network example

![Screenshot 2024-03-30 at 9.49.36 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.49.36_PM.png)

![Screenshot 2024-03-30 at 9.50.01 PM.png](/2-Neural-network-training/Screenshot_2024-03-30_at_9.50.01_PM.png)