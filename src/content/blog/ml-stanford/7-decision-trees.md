---
title: "Decision Trees and Ensembles: From Splits to Random Forests and XGBoost"
description: "A complete guide to decision trees, covering entropy, information gain, one-hot encoding, regression trees, and ensemble methods like Random Forest and XGBoost."
pubDate: "2024-04-03"
tags: ["Machine Learning", "Decision Trees", "XGBoost"]
author: "Jongmin Lee"
draft: false
---

## 4. Decision trees

## Decision trees

![Slide: cat classification table of 10 animals with categorical features ear shape, face shape and whiskers as X, and cat as label y](/4-Decision-trees/Screenshot_2024-04-03_at_5.44.16_PM.webp)

![Slide: decision tree with ear shape at the root, face shape and whiskers as decision nodes, and Cat or Not cat leaf nodes](/4-Decision-trees/Screenshot_2024-04-03_at_5.44.50_PM.webp)

![Slide: four different decision trees for the same cat data, each with a different root feature or depth](/4-Decision-trees/Screenshot_2024-04-03_at_5.45.20_PM.webp)

## Learning Process

![Slide: learned decision tree with each training animal sorted into its Cat or Not cat leaf](/4-Decision-trees/Screenshot_2024-04-03_at_5.49.39_PM.webp)

![Slide: Decision 1, pick the split feature that maximizes purity; ear shape, face shape, whiskers and cat DNA splits by cat fraction](/4-Decision-trees/Screenshot_2024-04-03_at_5.51.26_PM.webp)

![Slide: Decision 2, stop splitting when a node is pure, max depth is hit, purity gain is small, or a node has too few examples](/4-Decision-trees/Screenshot_2024-04-03_at_5.57.17_PM.webp)

## Decision tree learning

## Measuring purity

![Slide: entropy curve H(p1) over cat fraction p1, peaking at 1 when p1 is 0.5, with example sets from 0 of 6 to 6 of 6 cats](/4-Decision-trees/Screenshot_2024-04-03_at_7.47.45_PM.webp)

![Slide: entropy formula H(p1) = -p1 log2(p1) - (1 - p1) log2(1 - p1), with 0 log(0) defined as 0](/4-Decision-trees/Screenshot_2024-04-03_at_7.48.46_PM.webp)

## Choosing a split: Information Gain

![Slide: information gain of the ear shape (0.28), face shape (0.03) and whiskers (0.12) splits; ear shape reduces entropy the most](/4-Decision-trees/Screenshot_2024-04-03_at_7.50.16_PM.webp)

![Slide: information gain formula, H(p1 root) minus w_left H(p1 left) + w_right H(p1 right), shown on the ear shape split](/4-Decision-trees/Screenshot_2024-04-03_at_7.50.27_PM.webp)

## Putting it together

![Slide: decision tree learning steps: split on the feature with the highest information gain, and repeat until a stopping rule is met](/4-Decision-trees/Screenshot_2024-04-03_at_7.52.21_PM.webp)

![Slide: recursive splitting, where each branch under the ear shape root is built as its own smaller decision tree](/4-Decision-trees/Screenshot_2024-04-03_at_7.52.38_PM.webp)

## Using one-hot encoding of categorical features

![Slide: cat dataset where ear shape takes three values (pointy, floppy, oval), which would make a three-way split](/4-Decision-trees/Screenshot_2024-04-03_at_7.55.55_PM.webp)

![Slide: one-hot encoding replaces ear shape with three binary columns: pointy ears, floppy ears and oval ears](/4-Decision-trees/Screenshot_2024-04-03_at_7.56.04_PM.webp)

![Slide: same one-hot table, highlighting that each row has exactly one 1 across the three ear columns](/4-Decision-trees/Screenshot_2024-04-03_at_7.56.29_PM.webp)

![Slide: one-hot encoding for neural networks, with face shape and whiskers also turned into 0 or 1 values](/4-Decision-trees/Screenshot_2024-04-03_at_7.56.37_PM.webp)

## Continuous valued features

![Slide: cat dataset with an added continuous feature, weight in pounds](/4-Decision-trees/Screenshot_2024-04-03_at_7.58.06_PM.webp)

![Slide: cat vs not-cat plotted by weight, with three candidate thresholds giving information gains of 0.24, 0.61 and 0.40](/4-Decision-trees/Screenshot_2024-04-03_at_7.58.19_PM.webp)

![Slide: same weight plot, now with the chosen split node, weight at most 9 lbs, sorting animals into yes and no branches](/4-Decision-trees/Screenshot_2024-04-03_at_7.58.28_PM.webp)

## Regression Trees

![Slide: regression tree predicting weight, where each leaf outputs the average weight of its examples: 8.35, 9.2, 17.7 and 9.9](/4-Decision-trees/Screenshot_2024-04-03_at_7.59.28_PM.webp)

![Slide: choosing a regression split by variance reduction; ear shape gives 8.84, versus 0.64 for face shape and 6.22 for whiskers](/4-Decision-trees/Screenshot_2024-04-03_at_7.59.43_PM.webp)

## Tree ensembles

## Using multiple decision trees

![Slide: changing one training example flips the best root split from ear shape to whiskers, so trees are sensitive to small data changes](/4-Decision-trees/Screenshot_2024-04-06_at_11.07.46_AM.webp)

![Slide: tree ensemble of three trees voting on a new test example; two predict Cat and one predicts Not cat](/4-Decision-trees/Screenshot_2024-04-06_at_11.08.06_AM.webp)

## Sampling with replacement

![Slide: sampling with replacement from four colored tokens, where tokens can repeat within each sample](/4-Decision-trees/Screenshot_2024-04-06_at_11.09.42_AM.webp)

![Slide: a new 10-example training set drawn with replacement from the cat dataset, with some animals repeated](/4-Decision-trees/Screenshot_2024-04-06_at_11.09.54_AM.webp)

## Random forest algorithm

![Slide: bagged decision tree, for b = 1 to B: resample a training set of size m with replacement and train a tree on it](/4-Decision-trees/Screenshot_2024-04-06_at_11.11.49_AM.webp)

![Slide: random forest picks each split from a random subset of k features out of n, with k = sqrt(n) written as a typical choice](/4-Decision-trees/Screenshot_2024-04-06_at_11.12.00_AM.webp)

## XGBoost

![Slide: boosted trees intuition, where resampling makes it more likely to pick examples that earlier trees misclassified](/4-Decision-trees/Screenshot_2024-04-06_at_11.14.27_AM.webp)

![Slide: XGBoost features: open source, fast, good default split and stop criteria, built-in regularization, strong in competitions](/4-Decision-trees/Screenshot_2024-04-06_at_11.14.37_AM.webp)

![Slide: Python code using XGBClassifier for classification and XGBRegressor for regression, each with fit and predict](/4-Decision-trees/Screenshot_2024-04-06_at_11.15.06_AM.webp)

## When to use decision trees

![Slide: decision trees vs neural networks; trees suit tabular data and are fast, neural nets handle all data types and transfer learning](/4-Decision-trees/Screenshot_2024-04-06_at_11.19.05_AM.webp)
