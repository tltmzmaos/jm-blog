---
title: "Practical Advice for Applying Machine Learning"
description: "Learn how to make decisions, evaluate models, handle bias and variance, and manage real-world ML workflows with cross-validation, error analysis, and transfer learning."
pubDate: "2024-04-01"
tags: ["Machine Learning", "Model Evaluation", "Best Practices"]
author: "Jongmin Lee"
draft: false
---

## 3.Advice for applying machine learning

## Advice for applying machine learning

## Deciding what to try next

![Slide: regularized linear regression makes large errors; options include more data, fewer or more features, and changing lambda](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.07.39_PM.webp)

![Slide: a diagnostic is a test that shows what is or isn't working in a learning algorithm and guides how to improve it](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.09.48_PM.webp)

## Evaluating a model

![Slide: a 4th-order polynomial fits housing training data well but may fail to generalize to new examples](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.16.37_PM.webp)

![Slide: housing dataset split 70% into a training set (m_train = 7) and 30% into a test set (m_test = 3)](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.17.07_PM.webp)

![Slide: train/test for linear regression: fit by minimizing regularized J(w,b), then compute J_test and J_train without the lambda term](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.17.57_PM.webp)

![Slide: train/test for classification, using the logistic loss for J(w,b), J_test and J_train](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.19.10_PM.webp)

![Slide: for classification, J_test and J_train can be the fraction misclassified, where y-hat is 1 if f(x) >= 0.5, else 0](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.19.23_PM.webp)

## Model selection and training/cross validation/test sets

![Slide: J_train is likely lower than the real generalization error, so J_test is a better estimate of how the model does on new data](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.20.24_PM.webp)

![Slide: picking polynomial degree d = 1 to 10 by J_test makes J_test optimistic, because d was chosen using the test set](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.20.46_PM.webp)

![Slide: housing data split 60% training, 20% cross validation (also called validation or dev set) and 20% test](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.21.14_PM.webp)

![Slide: formulas for training error J_train, cross validation error J_cv and test error J_test](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.21.29_PM.webp)

![Slide: pick the polynomial degree with the lowest J_cv (here d = 4), then estimate generalization error with J_test](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.21.52_PM.webp)

![Slide: choosing among three neural network architectures by lowest J_cv, picking network 2, then reporting J_test](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.22.23_PM.webp)

## Bias and variance

## Bias/variance

![Slide: high bias (d = 1, J_train and J_cv high), just right (d = 2, both low), high variance (d = 4, J_train low, J_cv high)](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.29.01_PM.webp)

![Slide: as degree grows J_train falls and J_cv is U-shaped; high bias means high J_train, high variance means J_cv much larger than J_train](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.29.55_PM.webp)

## Regularization and bias/variance

![Slide: regularized 4th-order model where large lambda underfits with a flat line, intermediate lambda fits well and lambda = 0 overfits](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.31.26_PM.webp)

![Slide: choosing lambda by trying values from 0 to about 10, picking the lowest J_cv (lambda = 0.08), then reporting J_test](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.31.58_PM.webp)

![Slide: as lambda grows J_train rises and J_cv is U-shaped; small lambda overfits, large lambda underfits, mirroring the degree plot](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.32.19_PM.webp)

## Establishing a baseline level of performance

![Slide: ways to set a baseline error level: human level performance, competing algorithms, or a guess based on experience](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.37.23_PM.webp)

![Slide: gaps between baseline, J_train and J_cv (baseline 10.6%) showing high variance, high bias, or both](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.38.15_PM.webp)

## Learning curves

![Slide: learning curves where J_train rises and J_cv falls as training set size grows, with a quadratic fit on 1 to 6 points](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_6.45.29_PM.webp)

### High bias

![Slide: high bias learning curves flatten close together above human level performance, so more training data alone won't help much](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_7.03.03_PM.webp)

### High variance

![Slide: high variance learning curves with a large gap between J_cv and J_train that narrows as data grows, so more data helps](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_7.03.23_PM.webp)

## Deciding what to try next revisited

![Slide: more data, fewer features or larger lambda fix high variance; added or polynomial features or smaller lambda fix high bias](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_9.16.19_PM.webp)

## Bias/variance and neural networks

![Slide: bias variance tradeoff, a simple linear model has high bias, a complex 4th-order one high variance, J_cv lowest in between](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_9.17.23_PM.webp)

![Slide: flowchart for neural networks: if J_train is high use a bigger network, if J_cv is high get more data, repeat until done](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_9.17.41_PM.webp)

![Slide: a large neural network usually does as well or better than a smaller one if regularization is chosen well](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_9.17.52_PM.webp)

![Slide: neural network cost with an L2 term over all weights, and code adding kernel_regularizer=L2(0.01) to each Dense layer](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-01_at_9.18.02_PM.webp)

## Machine learning development process

## Iterative loop of ML development

![Slide: iterative ML loop: choose architecture (model, data), train model, run diagnostics (bias, variance, error analysis), repeat](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.50.31_PM.webp)

![Slide: spam classifier with features as a 0/1 vector over the top 10,000 words, next to a sample spam email](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.52.46_PM.webp)

![Slide: ideas to cut spam classifier error: more data (honeypot), email routing features, email body features, misspelling detection](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.53.44_PM.webp)

## Error analysi

![Slide: error analysis of 100 misclassified emails out of 500: pharma 21, phishing 18, routing 7, image spam 5, misspellings 3](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.55.46_PM.webp)

![Slide: error analysis revisited with 5000 CV examples and 1000 errors, still sampling 100; pharma and phishing point to more data](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.56.06_PM.webp)

## Adding data

![Slide: add more data of everything, or of the types error analysis flagged, like pharma spam from unlabeled data; or use data augmentation](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.57.03_PM.webp)

![Slide: data augmentation by warping a letter A; distortions should match noise in the test set, while purely random pixel noise rarely helps](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.57.54_PM.webp)

![Slide: grids of real and synthetic text image crops, showing artificial data synthesis for photo OCR](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.58.22_PM.webp)

![Slide: AI = code + data; the model-centric approach works on the code, the data-centric approach works on the data](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.58.44_PM.webp)

## Transfer learning

![Slide: transfer learning, pretrain on 1 million images with 1,000 classes, then replace the output layer with 10 digits and fine-tune](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.59.33_PM.webp)

![Slide: transfer learning works because early layers learn edges, corners and basic shapes that carry over to the same input type](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.59.45_PM.webp)

![Slide: transfer learning steps: download parameters pretrained on a large dataset of the same input type, then fine-tune on your data](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_7.59.54_PM.webp)

## Full cycle of a machine learning project

![Slide: ML project cycle: scope project, collect data, train model, deploy in production, with arrows looping back to earlier steps](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.00.45_PM.webp)

![Slide: a mobile app sends audio to an inference server that returns a transcript; scaling, logging and monitoring fall under MLOps](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.00.57_PM.webp)

## Fairness, bias, and ethics

![Slide: examples of ML bias: a hiring tool against women, face matching to mugshots, biased loan approvals, negative stereotypes](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.02.44_PM.webp)

![Slide: adverse ML uses: deepfakes, toxic speech from optimizing engagement, fake content, harmful products and fraud](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.03.01_PM.webp)

![Slide: ethics guidelines: brainstorm harms with a diverse team, check industry standards, audit before deployment, monitor after](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.03.12_PM.webp)

## Skewed datasets

![Slide: rare disease example where 1% test error isn't impressive, since only 0.5% are sick and always predicting y=0 gets 0.5% error](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.09.46_PM.webp)

![Slide: confusion matrix with 15 true positives, 5 false positives, 10 false negatives, 70 true negatives; precision 0.75, recall 0.6](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.10.08_PM.webp)

## Trading off precision and recall

![Slide: raising the threshold gives higher precision and lower recall, lowering it does the reverse, shown on a precision-recall curve](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.12.37_PM.webp)

![Slide: F1 score table for three algorithms; F1 = 2PR/(P+R), the harmonic mean, picks algorithm 1 at 0.444 instead of the plain average](/3-Advice-for-applying-machine-learning/Screenshot_2024-04-02_at_8.12.55_PM.webp)
