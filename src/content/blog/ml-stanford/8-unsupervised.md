---
title: "Unsupervised Learning: K-means Clustering and Anomaly Detection"
description: "Explore core concepts of unsupervised learning, including K-means clustering, optimization strategies, and how anomaly detection systems are designed and evaluated."
pubDate: "2024-04-09"
tags: ["Machine Learning", "Unsupervised Learning", "Clustering"]
author: "Jongmin Lee"
draft: false
---

## 1. Unsupervised learning

## Clustering

## What is clustering?

![Slide: unlabeled training set x^(1) to x^(m) plotted on x1 and x2, forming two visible clusters](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.51.38_PM.webp)

![Slide: clustering applications: grouping similar news, market segmentation, DNA analysis and astronomical data analysis](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.52.01_PM.webp)

## K-means intuition

![K-means step 1: with two random centroids, red and blue, each of the 30 points is assigned to the closer one](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.54.20_PM.webp)

![K-means step 2: each centroid moves to the mean of its assigned points, red group upper left and blue group lower right](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.54.36_PM.webp)

![K-means step 1 again: points are reassigned to the moved centroids, splitting the data into upper red and lower blue groups](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.55.11_PM.webp)

![K-means step 2 again: the red centroid moves up into the red group and the blue centroid down into the blue group](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.55.20_PM.webp)

![K-means step 1, third round: after reassignment the red and blue groups match the two natural clusters](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.55.44_PM.webp)

![K-means step 2, third round: the centroids settle at the centers of the two clusters](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.55.51_PM.webp)

## K-means algorithm

![Slide: K-means assignment step, where c^(i) is set to the index of the centroid mu_k closest to x^(i)](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.58.31_PM.webp)

![Slide: full K-means loop with the move step, where mu_k becomes the mean of the points assigned to cluster k](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.58.23_PM.webp)

![Slide: same K-means pseudocode; when a centroid gets no points, it is removed and K becomes K - 1](/1-Unsupervised-learning/Screenshot_2024-04-09_at_5.59.10_PM.webp)

![Slide: K-means on three well-separated clusters, and on T-shirt height and weight data with no clear gaps, split into S, M and L](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.00.21_PM.webp)

## Optimization objective

![Slide: K-means cost J = 1/m times the sum of squared distances from each x^(i) to its centroid mu_c(i), minimized over c and mu](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.05.08_PM.webp)

![Lines from each point to its assigned red or blue centroid; these distances make up the cost J(c^(1), ..., c^(30), mu_1, mu_2)](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.05.18_PM.webp)

![Slide: assigning x^(i) to the closer centroid, at distance 2 instead of 6, lowers the K-means cost J](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.05.38_PM.webp)

![Slide: moving the centroid to the mean of two points at 1 and 11 cuts the average squared distance from 41 to 25](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.05.49_PM.webp)

## Initializing K-means

![Slide: K-means outline: step 0 randomly initializes K centroids, then repeat step 1 assign points and step 2 move centroids](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.09.01_PM.webp)

![Slide: random initialization: choose K less than m and set the centroids to K randomly picked training examples](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.10.12_PM.webp)

![The same data clustered three ways with K = 3; the circled run J1 finds the three natural clusters, while J2 and J3 give poor splits](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.13.20_PM.webp)

![Slide: run random initialization and K-means many times (100 shown, 50 to 1000 typical), then keep the run with the lowest cost J](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.15.46_PM.webp)

## Choosing the number of clusters

![Slide: the same data can be seen as 2 clusters (blue) or 4 clusters (red), so the right K is ambiguous](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.17.44_PM.webp)

![Slide: elbow method plots cost J against K; one curve bends at K = 3, the other has no clear elbow](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.20.07_PM.webp)

![Slide: choose K by the downstream purpose, such as T-shirt sizing with K = 3 (S, M, L) or K = 5 (XS to XL)](/1-Unsupervised-learning/Screenshot_2024-04-09_at_6.21.15_PM.webp)

## Anomaly detection

## Finding unusual events

## Gaussian (normal) distribution

## Anomaly detection algorithm

## Developing and evaluating an anomaly detection system

## Anomaly detection vs. supervised learning

## Choosing what features to use
