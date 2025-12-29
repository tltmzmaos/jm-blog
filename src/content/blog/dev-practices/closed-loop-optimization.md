---
title: "Closed-Loop Optimization in Laboratory Automation"
description: "Building systems that learn from experimental results and automatically improve processes—covering optimization algorithms, feedback architectures, and practical implementation patterns."
pubDate: 2025-12-27
author: "Jongmin Lee"
tags: ["Machine Learning", "Lab Automation", "Software Engineering", "Best Practices"]
draft: false
---

Traditional laboratory automation executes predefined protocols. You program the steps, run the experiment, analyze the results, and manually adjust parameters for the next iteration. This works, but it's slow—especially when optimizing processes with many variables.

**Closed-loop optimization** changes this pattern. The system runs an experiment, observes the outcome, and *automatically* decides what to try next. Instead of manual iteration, you get algorithmic exploration of the parameter space.

This post explores how to build closed-loop systems for laboratory automation, with a focus on process and workflow optimization.

## The Optimization Loop

A closed-loop system has four essential components:

| Step | Action | Input | Output |
|------|--------|-------|--------|
| **1. Design** | Choose Parameters | Model predictions, constraints | Next experiment parameters |
| **2. Execute** | Run Experiment | Parameters | Raw data |
| **3. Measure** | Collect Results | Raw data | Outcome metrics |
| **4. Learn** | Update Model | Parameters + outcomes | Improved model |

The cycle then repeats: Learn → Design → Execute → Measure → Learn...

1. **Design**: Select parameters for the next experiment
2. **Execute**: Run the experiment with those parameters
3. **Measure**: Collect outcome data
4. **Learn**: Update understanding of the parameter-outcome relationship

The key difference from traditional automation: the **Design** step is automated. An algorithm, not a human, decides what to try next.

## When to Use Closed-Loop Optimization

Not every process benefits from closed-loop optimization. It's most valuable when:

| Condition | Why It Matters |
|-----------|----------------|
| **Many parameters** | Manual exploration is exponentially slower |
| **Expensive experiments** | Each run costs time/reagents—efficiency matters |
| **Non-obvious relationships** | Parameters interact in complex ways |
| **Noisy outcomes** | Need statistical approaches to find signal |
| **Continuous improvement** | Process can always get better |

### Common Use Cases

**Process Parameter Optimization**
- Incubation time and temperature
- Reagent concentrations
- Mixing speeds and durations
- Washing cycle parameters

**Workflow Scheduling**
- Order of operations
- Parallel vs. sequential execution
- Resource allocation
- Batch sizes

**Quality Optimization**
- Maximizing yield
- Minimizing variability
- Reducing failure rates
- Meeting target specifications

## Optimization Algorithms

Several algorithmic approaches work for laboratory optimization. The right choice depends on your constraints.

### Grid Search (Baseline)

The simplest approach: systematically try all combinations.

```python
def grid_search(parameters: dict, objective: Callable) -> dict:
    """
    Exhaustive search over parameter grid.

    parameters: {"temp": [30, 35, 40], "time": [10, 20, 30]}
    """
    best_result = None
    best_params = None

    for combination in itertools.product(*parameters.values()):
        params = dict(zip(parameters.keys(), combination))
        result = objective(params)

        if best_result is None or result > best_result:
            best_result = result
            best_params = params

    return {"params": best_params, "result": best_result}
```

**Pros:**
- Simple, deterministic
- Complete coverage
- Easy to understand

**Cons:**
- Exponential cost: 3 parameters × 5 values = 125 experiments
- Wastes time on obviously bad regions
- No learning between experiments

**Use when:** Parameters are few (<3), values are limited, experiments are cheap.

### Bayesian Optimization

The standard for expensive experiments. Builds a probabilistic model of the objective function and uses it to choose promising points.

| Step | Action | Purpose |
|------|--------|---------|
| 1 | Initialize prior (GP) | Start with belief about objective function |
| 2 | Compute acquisition function | Balance exploration vs. exploitation |
| 3 | Select next point | Maximize acquisition |
| 4 | Run experiment | Get actual result |
| 5 | Update model | Incorporate new observation |
| 6 | Repeat from step 2 | Until budget exhausted or converged |

```python
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern
import numpy as np

class BayesianOptimizer:
    def __init__(self, parameter_bounds: dict, n_initial: int = 5):
        self.bounds = parameter_bounds
        self.n_initial = n_initial
        self.X_observed = []
        self.y_observed = []

        self.gp = GaussianProcessRegressor(
            kernel=Matern(nu=2.5),
            n_restarts_optimizer=10,
            random_state=42
        )

    def suggest_next(self) -> dict:
        if len(self.X_observed) < self.n_initial:
            # Random sampling for initial points
            return self._random_sample()

        # Fit GP to observations
        self.gp.fit(np.array(self.X_observed), np.array(self.y_observed))

        # Find point that maximizes acquisition function
        best_point = self._maximize_acquisition()

        return self._array_to_params(best_point)

    def observe(self, params: dict, result: float):
        self.X_observed.append(self._params_to_array(params))
        self.y_observed.append(result)

    def _maximize_acquisition(self) -> np.ndarray:
        """Find point with highest Expected Improvement"""
        best_y = max(self.y_observed)

        def negative_ei(x):
            mu, sigma = self.gp.predict(x.reshape(1, -1), return_std=True)
            with np.errstate(divide='warn'):
                improvement = mu - best_y
                Z = improvement / sigma
                ei = improvement * norm.cdf(Z) + sigma * norm.pdf(Z)
                ei[sigma == 0.0] = 0.0
            return -ei[0]

        # Multi-start optimization
        best_x = None
        best_ei = float('inf')

        for _ in range(100):
            x0 = self._random_sample_array()
            result = minimize(negative_ei, x0, bounds=self._get_bounds_array())
            if result.fun < best_ei:
                best_ei = result.fun
                best_x = result.x

        return best_x
```

**Pros:**
- Sample-efficient (fewer experiments needed)
- Handles noise
- Provides uncertainty estimates

**Cons:**
- Computationally expensive for high dimensions
- GP assumptions may not hold
- Requires some tuning

**Use when:** Experiments are expensive, parameters are continuous, dimension ≤ 10-20.

### Multi-Armed Bandits

For discrete choices with immediate feedback (e.g., which protocol variant to use):

```python
class ThompsonSampling:
    """
    Thompson Sampling for discrete choices.
    Good for A/B testing protocol variants.
    """

    def __init__(self, n_options: int):
        # Beta distribution parameters (prior)
        self.alpha = np.ones(n_options)  # Successes + 1
        self.beta = np.ones(n_options)   # Failures + 1

    def select(self) -> int:
        """Sample from posterior and choose best"""
        samples = np.random.beta(self.alpha, self.beta)
        return np.argmax(samples)

    def update(self, option: int, success: bool):
        """Update posterior with observation"""
        if success:
            self.alpha[option] += 1
        else:
            self.beta[option] += 1

    def get_best(self) -> int:
        """Return option with highest expected value"""
        expected = self.alpha / (self.alpha + self.beta)
        return np.argmax(expected)


# Usage: Choosing between protocol variants
bandit = ThompsonSampling(n_options=3)  # 3 protocol variants

for _ in range(100):
    variant = bandit.select()
    success = run_protocol(variant)  # Returns True/False
    bandit.update(variant, success)

best_variant = bandit.get_best()
```

**Pros:**
- Simple to implement
- Natural exploration/exploitation balance
- Works well for discrete choices

**Cons:**
- Not suitable for continuous parameters
- Assumes independent options
- Requires binary or bounded outcomes

**Use when:** Choosing between discrete alternatives (protocol variants, equipment settings, reagent sources).

### Evolutionary Algorithms

For complex parameter spaces with many local optima:

```python
class GeneticOptimizer:
    """
    Genetic algorithm for parameter optimization.
    Good for complex, non-convex landscapes.
    """

    def __init__(self, parameter_bounds: dict, population_size: int = 20):
        self.bounds = parameter_bounds
        self.pop_size = population_size
        self.population = self._initialize_population()
        self.fitness = [None] * population_size

    def _initialize_population(self) -> list[dict]:
        return [self._random_individual() for _ in range(self.pop_size)]

    def evolve(self, objective: Callable, generations: int = 50) -> dict:
        for gen in range(generations):
            # Evaluate fitness (run experiments)
            for i, individual in enumerate(self.population):
                if self.fitness[i] is None:
                    self.fitness[i] = objective(individual)

            # Selection
            parents = self._select_parents()

            # Crossover and mutation
            offspring = []
            for i in range(0, len(parents), 2):
                child1, child2 = self._crossover(parents[i], parents[i+1])
                offspring.append(self._mutate(child1))
                offspring.append(self._mutate(child2))

            # Replace population
            self.population = offspring
            self.fitness = [None] * self.pop_size

        # Return best individual
        final_fitness = [objective(ind) for ind in self.population]
        best_idx = np.argmax(final_fitness)
        return self.population[best_idx]

    def _select_parents(self) -> list[dict]:
        """Tournament selection"""
        selected = []
        for _ in range(self.pop_size):
            tournament = random.sample(range(self.pop_size), k=3)
            winner = max(tournament, key=lambda i: self.fitness[i])
            selected.append(self.population[winner].copy())
        return selected

    def _crossover(self, parent1: dict, parent2: dict) -> tuple[dict, dict]:
        """Uniform crossover"""
        child1, child2 = {}, {}
        for key in parent1:
            if random.random() < 0.5:
                child1[key], child2[key] = parent1[key], parent2[key]
            else:
                child1[key], child2[key] = parent2[key], parent1[key]
        return child1, child2

    def _mutate(self, individual: dict, rate: float = 0.1) -> dict:
        """Gaussian mutation"""
        for key, (low, high) in self.bounds.items():
            if random.random() < rate:
                sigma = (high - low) * 0.1
                individual[key] += random.gauss(0, sigma)
                individual[key] = np.clip(individual[key], low, high)
        return individual
```

**Pros:**
- Handles complex, non-convex spaces
- Parallelizable (evaluate population in parallel)
- No gradient needed

**Cons:**
- Less sample-efficient than Bayesian
- Many hyperparameters to tune
- Can be slow to converge

**Use when:** Many local optima, can run experiments in parallel, parameters are numerous.

### Algorithm Comparison

| Algorithm | Sample Efficiency | Parallelization | Best For |
|-----------|-------------------|-----------------|----------|
| Grid Search | Low | High | Few parameters, cheap experiments |
| Bayesian Optimization | High | Low | Expensive experiments, <20 params |
| Thompson Sampling | Medium | High | Discrete choices, online learning |
| Evolutionary | Medium | High | Complex landscapes, parallel experiments |

## System Architecture

A practical closed-loop optimization system needs more than just an algorithm:

| Layer | Components | Responsibilities |
|-------|------------|------------------|
| **User Interface** | Config, Monitor, Control | Define objectives, track progress, start/stop |
| **Optimization Engine** | Algorithm, Surrogate Model, Scheduler | Suggest parameters, learn from results |
| **Execution** | Protocol Generator, Lab Agent, Instruments | Run actual experiments |
| **Data** | Experiment DB, Results DB, Model Store | Persist everything for reproducibility |

**Flow:** Config → Algorithm suggests → Scheduler queues → Protocol generated → Executed → Results stored → Algorithm learns → Repeat

### Core Components

#### 1. Optimization Configuration

Define what you're optimizing:

```python
@dataclass
class OptimizationConfig:
    """Configuration for an optimization campaign"""

    # What to optimize
    name: str
    objective: str  # "maximize" or "minimize"
    target_metric: str  # e.g., "yield", "purity", "throughput"

    # Parameter space
    parameters: dict[str, ParameterSpec]

    # Constraints
    constraints: list[Constraint]

    # Algorithm settings
    algorithm: str  # "bayesian", "genetic", "grid"
    algorithm_params: dict

    # Stopping criteria
    max_experiments: int
    target_value: float | None = None
    convergence_threshold: float = 0.01

    # Resource limits
    max_parallel: int = 1
    timeout_hours: float | None = None


@dataclass
class ParameterSpec:
    """Specification for a single parameter"""
    name: str
    type: str  # "continuous", "discrete", "categorical"
    bounds: tuple | list  # (min, max) or [options]
    default: float | str | None = None


# Example configuration
config = OptimizationConfig(
    name="Incubation Optimization",
    objective="maximize",
    target_metric="cell_viability",
    parameters={
        "temperature_c": ParameterSpec(
            name="temperature_c",
            type="continuous",
            bounds=(30, 40)
        ),
        "duration_min": ParameterSpec(
            name="duration_min",
            type="continuous",
            bounds=(15, 120)
        ),
        "co2_percent": ParameterSpec(
            name="co2_percent",
            type="discrete",
            bounds=[4.5, 5.0, 5.5]
        )
    },
    constraints=[
        Constraint("temperature_c * duration_min < 4000")  # Avoid damage
    ],
    algorithm="bayesian",
    algorithm_params={"n_initial": 5, "acquisition": "ei"},
    max_experiments=50
)
```

#### 2. Experiment Scheduler

Manages the flow of experiments:

```python
class ExperimentScheduler:
    """Schedules and tracks optimization experiments"""

    def __init__(self, config: OptimizationConfig, optimizer: Optimizer):
        self.config = config
        self.optimizer = optimizer
        self.status = "idle"
        self.experiments: list[Experiment] = []

    async def run(self):
        self.status = "running"

        while not self.should_stop():
            # Get next parameters from optimizer
            params = self.optimizer.suggest_next()

            if params is None:
                break  # Optimizer has no more suggestions

            # Create and queue experiment
            experiment = self.create_experiment(params)
            self.experiments.append(experiment)

            # Execute (respecting parallelism limits)
            await self.execute_with_limit(experiment)

        self.status = "completed"
        return self.get_best_result()

    def should_stop(self) -> bool:
        # Check stopping criteria
        if len(self.experiments) >= self.config.max_experiments:
            return True

        if self.config.target_value is not None:
            best = self.get_best_result()
            if best and best.value >= self.config.target_value:
                return True

        if self.is_converged():
            return True

        return False

    def is_converged(self) -> bool:
        """Check if optimization has converged"""
        if len(self.experiments) < 10:
            return False

        recent = [e.result for e in self.experiments[-10:] if e.result]
        if not recent:
            return False

        std = np.std(recent)
        return std < self.config.convergence_threshold

    async def execute_with_limit(self, experiment: Experiment):
        """Execute respecting parallelism limits"""
        async with self.semaphore:
            result = await self.execute_experiment(experiment)
            experiment.result = result
            self.optimizer.observe(experiment.params, result)
```

#### 3. Result Collection

Capture experimental outcomes systematically:

```python
@dataclass
class ExperimentResult:
    """Result from a single optimization experiment"""
    experiment_id: str
    timestamp: datetime
    parameters: dict
    metrics: dict[str, float]
    metadata: dict
    raw_data: dict | None = None

class ResultCollector:
    """Collects and processes experimental results"""

    def __init__(self, target_metric: str):
        self.target_metric = target_metric
        self.results: list[ExperimentResult] = []

    def record(self, experiment_id: str, parameters: dict,
               measurements: dict, metadata: dict = None):
        result = ExperimentResult(
            experiment_id=experiment_id,
            timestamp=datetime.now(),
            parameters=parameters,
            metrics=self.compute_metrics(measurements),
            metadata=metadata or {},
            raw_data=measurements
        )
        self.results.append(result)
        self.persist(result)
        return result

    def compute_metrics(self, measurements: dict) -> dict[str, float]:
        """Compute optimization metrics from raw measurements"""
        metrics = {}

        # Primary metric
        metrics[self.target_metric] = self.calculate_target(measurements)

        # Secondary metrics for analysis
        metrics["variability"] = np.std(measurements.get("replicates", [0]))
        metrics["success_rate"] = measurements.get("success_count", 0) / \
                                   measurements.get("total_count", 1)

        return metrics

    def get_objective_value(self, result: ExperimentResult) -> float:
        return result.metrics[self.target_metric]

    def get_best(self) -> ExperimentResult | None:
        if not self.results:
            return None
        return max(self.results, key=self.get_objective_value)

    def to_dataframe(self) -> pd.DataFrame:
        """Export results for analysis"""
        records = []
        for r in self.results:
            record = {"experiment_id": r.experiment_id, **r.parameters, **r.metrics}
            records.append(record)
        return pd.DataFrame(records)
```

## Practical Implementation Examples

### Example 1: Cell Culture Optimization

Optimize incubation conditions for maximum cell viability:

```python
class CellCultureOptimizer:
    """
    Closed-loop optimization of cell culture conditions.
    Objective: Maximize cell viability after 48 hours.
    """

    def __init__(self, lab_agent: LabAgent, incubator: Incubator, reader: PlateReader):
        self.agent = lab_agent
        self.incubator = incubator
        self.reader = reader

        self.config = OptimizationConfig(
            name="Cell Culture Conditions",
            objective="maximize",
            target_metric="viability",
            parameters={
                "temperature_c": ParameterSpec("temperature_c", "continuous", (35, 39)),
                "co2_percent": ParameterSpec("co2_percent", "continuous", (4, 7)),
                "humidity_percent": ParameterSpec("humidity_percent", "continuous", (85, 98)),
                "seeding_density": ParameterSpec("seeding_density", "continuous", (5000, 50000))
            },
            algorithm="bayesian",
            max_experiments=30
        )

        self.optimizer = BayesianOptimizer(
            parameter_bounds=self._get_bounds(),
            n_initial=5
        )

    async def run_optimization(self) -> OptimizationResult:
        scheduler = ExperimentScheduler(self.config, self.optimizer)

        async def run_experiment(params: dict) -> float:
            # 1. Prepare cells with specified seeding density
            await self.agent.seed_cells(
                plate="culture_plate",
                density=params["seeding_density"]
            )

            # 2. Set incubator conditions
            await self.incubator.set_conditions(
                temperature=params["temperature_c"],
                co2=params["co2_percent"],
                humidity=params["humidity_percent"]
            )

            # 3. Incubate for 48 hours
            await self.incubator.incubate(
                plate="culture_plate",
                duration_hours=48
            )

            # 4. Measure viability
            result = await self.reader.read_viability(plate="culture_plate")

            return result["mean_viability"]

        scheduler.execute_experiment = run_experiment
        return await scheduler.run()
```

### Example 2: Assay Protocol Optimization

Optimize an ELISA protocol for maximum signal-to-noise:

```python
class ELISAOptimizer:
    """
    Optimize ELISA protocol parameters.
    Objective: Maximize signal-to-noise ratio.
    """

    def __init__(self, lab_system: LabSystem):
        self.lab = lab_system

        self.parameters = {
            "coating_concentration_ug_ml": (0.5, 10),
            "coating_time_hours": (1, 16),
            "blocking_time_min": (30, 120),
            "sample_dilution": (10, 1000),  # 1:X dilution
            "detection_time_min": (15, 60),
            "substrate_time_min": (5, 30)
        }

    def objective(self, params: dict) -> float:
        """Run ELISA with given parameters and return S/N ratio"""

        # Generate protocol from parameters
        protocol = self.generate_protocol(params)

        # Execute protocol
        self.lab.execute_protocol(protocol)

        # Read plate
        readings = self.lab.read_plate(mode="absorbance", wavelength=450)

        # Calculate signal-to-noise
        positive_wells = readings["A1":"A6"]
        negative_wells = readings["A7":"A12"]

        signal = np.mean(positive_wells)
        noise = np.std(negative_wells)

        return signal / noise if noise > 0 else 0

    def generate_protocol(self, params: dict) -> Protocol:
        return Protocol(
            steps=[
                CoatPlate(
                    antibody="capture_ab",
                    concentration=params["coating_concentration_ug_ml"],
                    duration_hours=params["coating_time_hours"]
                ),
                Block(
                    buffer="blocking_buffer",
                    duration_min=params["blocking_time_min"]
                ),
                AddSamples(
                    dilution=params["sample_dilution"]
                ),
                AddDetection(
                    antibody="detection_ab",
                    duration_min=params["detection_time_min"]
                ),
                AddSubstrate(
                    substrate="tmb",
                    duration_min=params["substrate_time_min"]
                ),
                Stop(),
                Read(wavelength=450)
            ]
        )

    def optimize(self, max_experiments: int = 40) -> dict:
        optimizer = BayesianOptimizer(self.parameters, n_initial=8)

        for i in range(max_experiments):
            params = optimizer.suggest_next()
            result = self.objective(params)
            optimizer.observe(params, result)

            print(f"Experiment {i+1}: S/N = {result:.2f}")
            print(f"  Parameters: {params}")

        return optimizer.get_best()
```

### Example 3: Workflow Scheduling Optimization

Optimize the order and timing of operations for throughput:

```python
class WorkflowOptimizer:
    """
    Optimize workflow scheduling for maximum throughput.
    Uses genetic algorithm to find optimal task ordering.
    """

    def __init__(self, workflow: Workflow, resources: dict):
        self.workflow = workflow
        self.resources = resources

    def optimize_schedule(self, max_generations: int = 50) -> Schedule:
        # Encode schedule as permutation of task IDs
        tasks = list(self.workflow.tasks.keys())
        n_tasks = len(tasks)

        def fitness(permutation: list[int]) -> float:
            schedule = self.decode_schedule(permutation, tasks)
            return -self.simulate_makespan(schedule)  # Negative because we minimize

        # Genetic algorithm for permutation optimization
        ga = PermutationGA(
            n_items=n_tasks,
            population_size=50,
            fitness_func=fitness
        )

        best_permutation = ga.evolve(generations=max_generations)
        return self.decode_schedule(best_permutation, tasks)

    def decode_schedule(self, permutation: list[int], tasks: list[str]) -> Schedule:
        """Convert permutation to actual schedule"""
        schedule = Schedule()
        task_order = [tasks[i] for i in permutation]

        current_time = 0
        resource_availability = {r: 0 for r in self.resources}

        for task_id in task_order:
            task = self.workflow.tasks[task_id]

            # Find earliest start time respecting dependencies
            earliest_dep = max(
                schedule.get_end_time(dep) for dep in task.dependencies
            ) if task.dependencies else 0

            # Find earliest resource availability
            earliest_resource = max(
                resource_availability[r] for r in task.required_resources
            )

            start_time = max(earliest_dep, earliest_resource)
            end_time = start_time + task.duration

            schedule.add(task_id, start_time, end_time)

            # Update resource availability
            for r in task.required_resources:
                resource_availability[r] = end_time

        return schedule

    def simulate_makespan(self, schedule: Schedule) -> float:
        """Simulate schedule and return total time"""
        return max(schedule.end_times.values())


class PermutationGA:
    """Genetic algorithm for permutation optimization"""

    def __init__(self, n_items: int, population_size: int, fitness_func: Callable):
        self.n = n_items
        self.pop_size = population_size
        self.fitness = fitness_func
        self.population = [
            list(np.random.permutation(n_items))
            for _ in range(population_size)
        ]

    def evolve(self, generations: int) -> list[int]:
        for gen in range(generations):
            # Evaluate fitness
            scores = [self.fitness(ind) for ind in self.population]

            # Selection (tournament)
            new_pop = []
            for _ in range(self.pop_size):
                tournament = random.sample(range(self.pop_size), k=5)
                winner = max(tournament, key=lambda i: scores[i])
                new_pop.append(self.population[winner].copy())

            # Crossover (order crossover - OX)
            for i in range(0, self.pop_size - 1, 2):
                if random.random() < 0.8:
                    new_pop[i], new_pop[i+1] = self.order_crossover(
                        new_pop[i], new_pop[i+1]
                    )

            # Mutation (swap)
            for i in range(self.pop_size):
                if random.random() < 0.1:
                    self.swap_mutation(new_pop[i])

            self.population = new_pop

        # Return best
        scores = [self.fitness(ind) for ind in self.population]
        best_idx = np.argmax(scores)
        return self.population[best_idx]

    def order_crossover(self, p1: list, p2: list) -> tuple[list, list]:
        """Order crossover (OX) for permutations"""
        size = len(p1)
        start, end = sorted(random.sample(range(size), 2))

        def ox(parent1, parent2):
            child = [None] * size
            child[start:end] = parent1[start:end]
            fill = [x for x in parent2 if x not in child]
            fill_idx = 0
            for i in range(size):
                if child[i] is None:
                    child[i] = fill[fill_idx]
                    fill_idx += 1
            return child

        return ox(p1, p2), ox(p2, p1)

    def swap_mutation(self, individual: list):
        """Swap two random positions"""
        i, j = random.sample(range(len(individual)), 2)
        individual[i], individual[j] = individual[j], individual[i]
```

## Handling Constraints

Real optimization problems have constraints. These need to be handled carefully.

### Types of Constraints

| Type | Example | Handling |
|------|---------|----------|
| **Bound constraints** | 30°C ≤ temperature ≤ 40°C | Parameter bounds |
| **Linear constraints** | time × temp < 4000 | Penalty or projection |
| **Nonlinear constraints** | Volume must fit in well | Constraint function |
| **Discrete constraints** | Must use available tip sizes | Discrete parameter |

### Constraint Handling Strategies

```python
class ConstrainedOptimizer:
    """Optimizer with constraint handling"""

    def __init__(self, optimizer: Optimizer, constraints: list[Constraint]):
        self.optimizer = optimizer
        self.constraints = constraints

    def suggest_next(self) -> dict:
        for attempt in range(100):
            params = self.optimizer.suggest_next()

            if self.is_feasible(params):
                return params

            # If infeasible, try to repair
            params = self.repair(params)
            if self.is_feasible(params):
                return params

        raise OptimizationError("Could not find feasible point")

    def is_feasible(self, params: dict) -> bool:
        return all(c.check(params) for c in self.constraints)

    def repair(self, params: dict) -> dict:
        """Try to make infeasible point feasible"""
        repaired = params.copy()

        for constraint in self.constraints:
            if not constraint.check(repaired):
                repaired = constraint.repair(repaired)

        return repaired


class LinearConstraint:
    """Linear constraint: sum(coef * param) <= bound"""

    def __init__(self, coefficients: dict[str, float], bound: float):
        self.coef = coefficients
        self.bound = bound

    def check(self, params: dict) -> bool:
        value = sum(self.coef[k] * params[k] for k in self.coef)
        return value <= self.bound

    def repair(self, params: dict) -> dict:
        """Project onto feasible region"""
        value = sum(self.coef[k] * params[k] for k in self.coef)
        if value <= self.bound:
            return params

        # Scale down proportionally
        scale = self.bound / value * 0.99  # Small margin
        repaired = params.copy()
        for k in self.coef:
            if self.coef[k] > 0:
                repaired[k] *= scale
        return repaired
```

## Monitoring and Visualization

Optimization progress should be visible to users:

```python
class OptimizationMonitor:
    """Real-time monitoring of optimization progress"""

    def __init__(self, config: OptimizationConfig):
        self.config = config
        self.history = []

    def update(self, experiment: Experiment):
        self.history.append({
            "iteration": len(self.history) + 1,
            "params": experiment.params,
            "value": experiment.result,
            "timestamp": datetime.now()
        })

    def get_progress_summary(self) -> dict:
        if not self.history:
            return {"status": "not_started"}

        values = [h["value"] for h in self.history if h["value"] is not None]

        return {
            "status": "running",
            "iterations": len(self.history),
            "max_iterations": self.config.max_experiments,
            "best_value": max(values) if values else None,
            "current_value": values[-1] if values else None,
            "improvement": self.calculate_improvement(),
            "estimated_remaining": self.estimate_remaining()
        }

    def plot_convergence(self) -> Figure:
        """Plot optimization convergence"""
        iterations = [h["iteration"] for h in self.history]
        values = [h["value"] for h in self.history]
        best_so_far = np.maximum.accumulate(values)

        fig, ax = plt.subplots(figsize=(10, 6))
        ax.scatter(iterations, values, alpha=0.5, label="Observations")
        ax.plot(iterations, best_so_far, 'r-', linewidth=2, label="Best so far")
        ax.set_xlabel("Iteration")
        ax.set_ylabel(self.config.target_metric)
        ax.legend()
        ax.set_title(f"Optimization Progress: {self.config.name}")

        return fig

    def plot_parameter_importance(self) -> Figure:
        """Analyze which parameters matter most"""
        df = pd.DataFrame(self.history)

        # Correlation analysis
        param_cols = list(self.config.parameters.keys())
        correlations = df[param_cols + ["value"]].corr()["value"].drop("value")

        fig, ax = plt.subplots(figsize=(8, 5))
        correlations.abs().sort_values().plot(kind="barh", ax=ax)
        ax.set_xlabel("Absolute Correlation with Objective")
        ax.set_title("Parameter Importance")

        return fig
```

## Considerations for Deployment

### Sample Efficiency

Every experiment costs time and resources. Prioritize sample efficiency:

- Use Bayesian optimization for expensive experiments
- Start with good initial points (domain knowledge)
- Consider transfer learning from similar optimizations
- Use surrogate models to pre-filter bad parameters

### Robustness

Optimization shouldn't fail because of occasional bad experiments:

```python
class RobustOptimizer:
    """Optimizer with robustness features"""

    def __init__(self, base_optimizer: Optimizer):
        self.optimizer = base_optimizer
        self.failed_experiments = []

    def observe(self, params: dict, result: float | None):
        if result is None:
            # Experiment failed - record but don't update model
            self.failed_experiments.append(params)
            return

        # Check for outliers
        if self.is_outlier(result):
            # Log warning but still include (with reduced weight)
            self.optimizer.observe(params, result, weight=0.5)
        else:
            self.optimizer.observe(params, result)

    def is_outlier(self, result: float) -> bool:
        if len(self.optimizer.y_observed) < 5:
            return False
        mean = np.mean(self.optimizer.y_observed)
        std = np.std(self.optimizer.y_observed)
        return abs(result - mean) > 3 * std
```

### Reproducibility

Optimization should be reproducible:

```python
@dataclass
class OptimizationRun:
    """Complete record of an optimization run"""
    run_id: str
    config: OptimizationConfig
    random_seed: int
    start_time: datetime
    end_time: datetime
    experiments: list[Experiment]
    best_params: dict
    best_value: float
    model_checkpoints: list[str]

    def save(self, path: str):
        with open(path, 'w') as f:
            json.dump(asdict(self), f, default=str)

    @classmethod
    def load(cls, path: str) -> 'OptimizationRun':
        with open(path, 'r') as f:
            data = json.load(f)
        return cls(**data)
```

### Regulatory Considerations

For GxP environments:

- Document the optimization objective and constraints
- Log all experiments with full parameters and results
- Validate the optimization algorithm itself
- Final optimized parameters need qualification
- Human review of optimization results before production use

## Closing Thoughts

Closed-loop optimization transforms laboratory automation from "execute what I programmed" to "find what works best." The algorithms are mature, the frameworks exist, and the benefits are clear—fewer experiments to reach optimal conditions, less human time spent iterating, more systematic exploration of parameter spaces.

The challenge is integration. Building a closed-loop system requires connecting optimization algorithms to protocol generation, laboratory execution, and result collection. Each piece must work reliably for the loop to close successfully.

Start simple: one process, clear objective, few parameters. Prove the concept works in your environment. Then expand to more complex optimizations as confidence grows.

_Optimization algorithms continue to improve. Specific methods will evolve, but the fundamental loop—design, execute, measure, learn—will remain the core pattern for automated process improvement._

---

**Further Reading:**

- [Bayesian Optimization Book](https://bayesoptbook.com/)
- [Ax: Adaptive Experimentation Platform](https://ax.dev/)
- [Optuna: Hyperparameter Optimization Framework](https://optuna.org/)
- [Self-Driving Labs Review - Nature](https://www.nature.com/articles/s41586-023-06734-w)
- [GPyOpt: Bayesian Optimization in Python](https://sheffieldml.github.io/GPyOpt/)
