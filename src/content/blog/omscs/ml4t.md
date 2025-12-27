---
title: "ML4T: Machine Learning for Trading - OMSCS 2024 Fall"
description: "Key ML-for-trading concepts from Georgia Tech OMSCS ML4T (CS 7646): portfolio theory, signals, risk, and evaluation."
pubDate: 2024-12-19
author: "Jongmin Lee"
tags: ["Machine Learning", "Portfolio Theory", "ML4T", "CS7646", "OMSCS"]
heroImage: "/ML4T/ml4t-hero.png"
---

# ML4T: Machine Learning for Trading

Georgia Tech OMSCS **ML4T (CS 7646)** connects machine learning with financial markets. The course is less about predicting prices and more about building decision pipelines that are statistically sound, risk-aware, and testable. This post summarizes what I learned in Fall 2024.

## Course Focus

ML4T treats trading as a data and decision problem. You learn how to reason about signals, noise, and risk, then evaluate strategies under realistic constraints such as transaction costs and non-stationary markets.

## Portfolio Theory: The Baseline

Modern Portfolio Theory introduces the risk-return tradeoff and the **efficient frontier**. The main lesson is that return alone is meaningless without risk, and diversification is not optional.

Key building blocks:

- Expected return and volatility
- Covariance and correlation
- Constraints that reflect real portfolios

## Signals and Features

Raw prices are rarely enough. The course emphasizes feature engineering: momentum, moving averages, volatility measures, and volume-based indicators. These features are not magic; they are hypotheses you test in a disciplined way.

A strong takeaway is that signal design matters more than model complexity.

## Supervised Learning in Finance

Classification and regression are used for directional bets, regime detection, and risk estimation. The biggest risks are **overfitting**, **look-ahead bias**, and **survivorship bias**.

The course highlights that a model that looks good in-sample is almost always misleading without careful validation.

## Reinforcement Learning and Sequential Decisions

Trading is a sequential decision process. RL methods such as Q-learning provide a framework, but the course also shows why pure RL is difficult in finance: rewards are sparse, dynamics drift, and costs are real.

## Risk Management and Evaluation

Performance is evaluated through risk-adjusted metrics:

- Sharpe and Sortino ratios
- Maximum drawdown
- Tracking error and information ratio

Backtesting is treated as a scientific experiment. If your evaluation is flawed, your strategy is too.

## Practical Constraints

- Transaction costs can destroy a strategy that looks good on paper.
- Markets are adaptive; a good signal will decay.
- Data quality and cleaning are not optional.

## Course Takeaways

- Models are only as good as their data and evaluation.
- Risk management must be built into the strategy, not added later.
- The edge is often in pipeline design, not in exotic models.

ML4T is a strong reminder that building a robust trading system requires discipline, skepticism, and a rigorous testing mindset.
