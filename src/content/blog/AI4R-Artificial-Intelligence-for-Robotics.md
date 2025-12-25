---
title: "AI4R: Artificial Intelligence for Robotics - OMSCS 2025 Spring"
description: "Key robotics AI concepts from Georgia Tech OMSCS AI4R (CS 7638): localization, planning, perception, control, and SLAM."
pubDate: 2025-05-19
author: "Jongmin Lee"
tags: ["Artificial Intelligence", "Robotics", "OMSCS", "Georgia Tech", "SLAM", "Path Planning", "Kalman Filter", "Particle Filter"]
heroImage: "/AI4R/ai4r-hero.png"
draft: false
---

# AI4R: Artificial Intelligence for Robotics

Georgia Tech OMSCS **AI4R (CS 7638)** is a full-stack introduction to robotics intelligence: how robots localize, plan, perceive, and control in uncertain environments. This post captures the major ideas I studied in Spring 2025 and how they connect in real systems.

## Course Focus

AI4R is about decision-making under uncertainty. The math matters, but the most important takeaway is system thinking: every component (state estimation, mapping, planning, control) depends on consistent assumptions about noise, timing, and model fidelity.

## Localization: Knowing Where You Are

Localization is the foundation. A robot must estimate its pose from noisy sensors and imperfect motion models. The class contrasts **global localization** (no prior) and **local tracking** (an initial guess) while showing how both are expressed as probabilistic inference.

Key ideas:

- A **motion model** predicts where the robot could be next.
- A **sensor model** corrects that prediction with new measurements.
- Uncertainty is carried explicitly instead of being ignored.

## Kalman Filters: Linear Estimation That Scales

The Kalman filter provides a clean framework when systems are approximately linear and noise is Gaussian. What makes it powerful is the balance: a prediction step that carries uncertainty forward, and an update step that blends sensor measurements based on their reliability.

The **Extended Kalman Filter (EKF)** extends this to nonlinear systems via linearization. It is common in robotics because most real sensors and motion models are nonlinear.

## Particle Filters: Flexible Estimation

Particle filters represent a distribution with many weighted samples, which makes them flexible for multi-modal or non-Gaussian scenarios. They are also computationally heavier, so real systems often trade accuracy for speed by controlling particle count and resampling strategies.

## SLAM: Mapping While Moving

SLAM is the classic robotics loop: you need a map to localize, and localization to build a map. The course explores feature-based, grid-based, and graph-based SLAM, with **loop closure** as the mechanism that fixes drift over time.

The key systems insight is that SLAM is not just an algorithm; it is a pipeline that depends on reliable data association and timing.

## Planning: From Goals to Paths

Planning converts goals into actions. Search-based methods (A*, Dijkstra) guarantee optimality under certain conditions, while sampling-based methods (RRT, PRM) scale better to high-dimensional spaces.

Configuration space design is often the difference between an elegant planner and a brittle one.

## Control: Making Plans Real

Robots do not follow idealized paths. Control fills the gap between planning and reality. The course centers on **PID control**, then expands to more advanced control like **MPC**, which optimizes actions while respecting constraints.

The practical lesson: even the best planner fails without a robust controller.

## Perception and Sensor Fusion

Robots rarely rely on a single sensor. Combining IMU, odometry, cameras, and LIDAR reduces uncertainty and improves robustness. Sensor fusion is less about one perfect algorithm and more about thoughtful integration and calibration.

## Planning Under Uncertainty

Real environments are not fully observable. MDPs and POMDPs provide a formal way to plan when the robot cannot see the full state. These models are expensive but clarify how uncertainty should be represented and propagated.

## Practical Constraints

AI4R emphasizes that real robots operate under constraints:

- Compute budgets and latency
- Sensor limitations and calibration drift
- Safety and failure modes

Most bugs in robotics are systems bugs, not algorithm bugs.

## Course Takeaways

- State estimation and control are inseparable in practice.
- Noise modeling is a first-class design decision.
- Algorithms must be evaluated as part of a system, not in isolation.

This course ties together probability, optimization, and systems engineering in a way that makes robotics feel both rigorous and grounded.
