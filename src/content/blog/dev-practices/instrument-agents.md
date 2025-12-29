---
title: "Instrument Agents: AI Systems That Control Lab Equipment"
description: "Designing AI agents that can understand, plan, and execute laboratory instrument operations—covering agent architectures, tool abstraction patterns, and safety boundaries."
pubDate: 2025-12-27
author: "Jongmin Lee"
tags: ["Machine Learning", "Lab Automation", "Software Engineering", "Best Practices"]
draft: false
---

An LLM that can answer questions about lab procedures is useful. An LLM that can *execute* those procedures through actual equipment is transformative—and significantly more complex to build safely.

**Instrument Agents** are AI systems that bridge the gap between natural language understanding and physical laboratory operations. They don't just generate protocols; they orchestrate equipment, monitor execution, and adapt to real-world conditions.

This post explores the architectural patterns that make instrument agents work, with particular attention to the unique constraints of laboratory automation.

## What Is an Instrument Agent?

An instrument agent is an AI system that can:

| Capability | Description | Example |
|------------|-------------|---------|
| **Understand** | Parse high-level goals | "Prepare samples for ELISA" |
| **Plan** | Decompose into operations | Transfer → Incubate → Wash → Read |
| **Execute** | Call instrument APIs | `pipette.transfer(...)` |
| **Observe** | Monitor results and state | Check volumes, read measurements |
| **Adapt** | Modify plan based on feedback | Retry failed step, adjust parameters |

The key difference from simple LLM applications: **the agent operates in a feedback loop with the physical world**.

## Agent Architecture Patterns

Several architectural patterns have emerged for building AI agents. Each has different tradeoffs for laboratory applications.

### Pattern 1: ReAct (Reasoning + Acting)

The ReAct pattern interleaves reasoning and action in a single loop:

```
Thought: I need to transfer samples from the source plate to the destination plate.
         The user requested 50µL per well.
Action: pipette_transfer(source="plate_1:A1-A6", dest="plate_2:A1-A6", volume=50)
Observation: Transfer complete. 6 wells transferred, total volume 300µL.

Thought: Transfer successful. Now I need to add reagent.
Action: pipette_transfer(source="reagent:A1", dest="plate_2:A1-A6", volume=25)
Observation: Transfer complete. Reagent added to 6 wells.

Thought: Samples prepared. Starting incubation.
Action: incubator_start(plate="plate_2", temp=37, duration=30)
Observation: Incubation started. ETA: 30 minutes.
```

**Implementation:**

```python
class ReActAgent:
    def __init__(self, llm, tools: dict):
        self.llm = llm
        self.tools = tools
        self.max_iterations = 20

    def run(self, goal: str) -> AgentResult:
        history = []

        for i in range(self.max_iterations):
            # Generate thought and action
            prompt = self.build_prompt(goal, history)
            response = self.llm.generate(prompt)

            thought, action = self.parse_response(response)
            history.append({"thought": thought, "action": action})

            # Check for completion
            if action["type"] == "finish":
                return AgentResult(success=True, history=history)

            # Execute action
            try:
                observation = self.execute_action(action)
                history.append({"observation": observation})
            except ToolError as e:
                history.append({"error": str(e)})

        return AgentResult(success=False, reason="max_iterations", history=history)

    def execute_action(self, action: dict) -> str:
        tool_name = action["tool"]
        tool_args = action["args"]

        if tool_name not in self.tools:
            raise ToolError(f"Unknown tool: {tool_name}")

        return self.tools[tool_name].execute(**tool_args)
```

**Pros:**
- Simple, transparent reasoning
- Easy to debug and understand
- Works well for straightforward tasks

**Cons:**
- Can get stuck in loops
- Limited planning horizon
- Each step requires LLM call (latency)

### Pattern 2: Plan-and-Execute

Separate planning from execution for better efficiency:

| Phase | Components | Output |
|-------|------------|--------|
| **Planning** | Goal → Planner LLM | Action Plan (all steps) |
| **Execution** | Executor → Tools | Step-by-step results |
| **Replanning** | Check Progress → Replan if needed | Updated plan |

**Flow:** Goal → Plan all steps upfront → Execute sequentially → Replan on failure

**Implementation:**

```python
class PlanAndExecuteAgent:
    def __init__(self, planner_llm, executor_llm, tools: dict):
        self.planner = planner_llm
        self.executor = executor_llm
        self.tools = tools

    def run(self, goal: str) -> AgentResult:
        # Phase 1: Generate plan
        plan = self.generate_plan(goal)

        # Phase 2: Execute plan
        results = []
        for step in plan["steps"]:
            result = self.execute_step(step)
            results.append(result)

            # Check if replanning needed
            if result["status"] == "failed" or self.needs_replanning(results):
                plan = self.replan(goal, plan, results)

        return AgentResult(success=True, plan=plan, results=results)

    def generate_plan(self, goal: str) -> dict:
        prompt = f"""
        Create a step-by-step plan to achieve this goal:
        {goal}

        Available tools:
        {self.format_tools()}

        Output a JSON plan with numbered steps.
        """

        response = self.planner.generate(prompt)
        return json.loads(response)

    def execute_step(self, step: dict) -> dict:
        tool = self.tools[step["tool"]]
        try:
            result = tool.execute(**step["args"])
            return {"status": "success", "result": result}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
```

**Pros:**
- More efficient (fewer LLM calls)
- Better for complex, multi-step tasks
- Easier to review plan before execution

**Cons:**
- Less adaptive to unexpected situations
- Replanning adds complexity
- Initial plan may miss edge cases

### Pattern 3: Hierarchical Agents

For complex laboratory workflows, use a hierarchy of specialized agents:

| Level | Agent | Tools | Responsibility |
|-------|-------|-------|----------------|
| **Orchestrator** | Master Controller | Delegates to specialists | Task decomposition, coordination |
| **Specialist** | Sample Prep Agent | Pipette | Dilutions, transfers, aliquoting |
| **Specialist** | Assay Agent | Pipette, Reader, Washer | Protocol execution |
| **Specialist** | Analysis Agent | Imager, Reader | Data collection, QC |

**Implementation:**

```python
class OrchestratorAgent:
    def __init__(self, specialists: dict[str, Agent]):
        self.specialists = specialists
        self.llm = create_llm("orchestrator")

    def run(self, goal: str) -> AgentResult:
        # Decompose goal into sub-tasks
        subtasks = self.decompose(goal)

        results = []
        for task in subtasks:
            # Route to appropriate specialist
            specialist = self.route_task(task)
            result = specialist.run(task["description"])
            results.append(result)

            # Check dependencies and adjust
            if not result.success:
                return self.handle_failure(task, results)

        return AgentResult(success=True, subtask_results=results)

    def decompose(self, goal: str) -> list[dict]:
        prompt = f"""
        Break down this laboratory goal into sub-tasks:
        {goal}

        Available specialists:
        - sample_prep: Sample preparation, dilutions, transfers
        - assay: Running assays, incubations, washes
        - analysis: Reading plates, imaging, data analysis

        Return JSON list of tasks with assigned specialist.
        """

        response = self.llm.generate(prompt)
        return json.loads(response)

    def route_task(self, task: dict) -> Agent:
        return self.specialists[task["specialist"]]


class SamplePrepAgent(Agent):
    """Specialist for sample preparation"""

    def __init__(self, tools: dict):
        self.tools = tools
        self.llm = create_llm("sample_prep")

    def run(self, task: str) -> AgentResult:
        # Specialized logic for sample preparation
        plan = self.plan_sample_prep(task)
        return self.execute_plan(plan)
```

**Pros:**
- Scales to complex workflows
- Each agent can be specialized and optimized
- Clear separation of concerns

**Cons:**
- More complex to build and maintain
- Communication overhead between agents
- Harder to debug end-to-end

### Pattern Comparison

| Pattern | Best For | Complexity | Latency |
|---------|----------|------------|---------|
| **ReAct** | Simple, interactive tasks | Low | High (many LLM calls) |
| **Plan-Execute** | Well-defined multi-step tasks | Medium | Medium |
| **Hierarchical** | Complex workflows with specialists | High | Low (parallel execution) |

## Tool Abstraction Layer

The agent's effectiveness depends on how well its tools are designed. For laboratory instruments, this requires careful abstraction.

### Tool Interface Design

Each tool should have a clear, consistent interface:

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class ToolResult:
    success: bool
    data: dict
    error: str | None = None
    duration_seconds: float = 0

class InstrumentTool(ABC):
    """Base class for instrument tools"""

    @property
    @abstractmethod
    def name(self) -> str:
        """Tool name for LLM reference"""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Human-readable description"""
        pass

    @property
    @abstractmethod
    def parameters(self) -> dict:
        """JSON Schema for parameters"""
        pass

    @abstractmethod
    def execute(self, **kwargs) -> ToolResult:
        """Execute the tool operation"""
        pass

    @abstractmethod
    def validate_params(self, **kwargs) -> list[str]:
        """Validate parameters before execution"""
        pass

    def to_schema(self) -> dict:
        """Generate schema for LLM consumption"""
        return {
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters
        }
```

### Example: Pipette Tool

```python
class PipetteTool(InstrumentTool):
    """Tool for liquid handling operations"""

    def __init__(self, pipette_driver: PipetteDriver):
        self.driver = pipette_driver

    @property
    def name(self) -> str:
        return "pipette_transfer"

    @property
    def description(self) -> str:
        return """Transfer liquid between locations.
        Supports single transfers, multi-dispense, and mixing.
        Volume range: 1-1000 µL depending on tip type."""

    @property
    def parameters(self) -> dict:
        return {
            "type": "object",
            "required": ["source", "destination", "volume_ul"],
            "properties": {
                "source": {
                    "type": "string",
                    "description": "Source location (e.g., 'plate_1:A1' or 'reservoir:A1')"
                },
                "destination": {
                    "type": "string",
                    "description": "Destination location(s) (e.g., 'plate_2:A1-A6')"
                },
                "volume_ul": {
                    "type": "number",
                    "minimum": 1,
                    "maximum": 1000,
                    "description": "Volume to transfer in microliters"
                },
                "mix_after": {
                    "type": "object",
                    "properties": {
                        "cycles": {"type": "integer", "default": 3},
                        "volume_ul": {"type": "number"}
                    },
                    "description": "Optional mixing after dispense"
                }
            }
        }

    def validate_params(self, **kwargs) -> list[str]:
        errors = []

        volume = kwargs.get("volume_ul", 0)
        if volume < 1 or volume > 1000:
            errors.append(f"Volume {volume}µL out of range (1-1000)")

        source = kwargs.get("source", "")
        if not self.parse_location(source):
            errors.append(f"Invalid source location: {source}")

        dest = kwargs.get("destination", "")
        if not self.parse_location(dest):
            errors.append(f"Invalid destination: {dest}")

        return errors

    def execute(self, **kwargs) -> ToolResult:
        # Validate first
        errors = self.validate_params(**kwargs)
        if errors:
            return ToolResult(success=False, data={}, error="; ".join(errors))

        try:
            # Parse locations
            source = self.parse_location(kwargs["source"])
            destinations = self.parse_location(kwargs["destination"])
            volume = kwargs["volume_ul"]

            # Execute transfer
            start_time = time.time()

            self.driver.aspirate(source, volume)

            for dest in destinations:
                self.driver.dispense(dest, volume / len(destinations))

                if kwargs.get("mix_after"):
                    mix = kwargs["mix_after"]
                    self.driver.mix(dest, mix["cycles"], mix.get("volume_ul", volume/2))

            duration = time.time() - start_time

            return ToolResult(
                success=True,
                data={
                    "transferred_volume_ul": volume,
                    "wells_affected": len(destinations)
                },
                duration_seconds=duration
            )

        except PipetteError as e:
            return ToolResult(success=False, data={}, error=str(e))
```

### Tool Registry

Manage available tools through a registry:

```python
class ToolRegistry:
    """Central registry for instrument tools"""

    def __init__(self):
        self._tools: dict[str, InstrumentTool] = {}

    def register(self, tool: InstrumentTool):
        self._tools[tool.name] = tool

    def get(self, name: str) -> InstrumentTool:
        if name not in self._tools:
            raise ToolNotFoundError(f"Tool '{name}' not registered")
        return self._tools[name]

    def list_tools(self) -> list[dict]:
        return [tool.to_schema() for tool in self._tools.values()]

    def execute(self, name: str, **kwargs) -> ToolResult:
        tool = self.get(name)
        return tool.execute(**kwargs)


# Usage
registry = ToolRegistry()
registry.register(PipetteTool(pipette_driver))
registry.register(PlateReaderTool(reader_driver))
registry.register(IncubatorTool(incubator_driver))

# Pass to agent
agent = ReActAgent(llm=llm, tools=registry)
```

### Abstraction Levels

Design tools at the right abstraction level:

| Level | Examples | Agent Sees? | Tradeoff |
|-------|----------|-------------|----------|
| **High (Domain)** | `run_elisa_assay()`, `prepare_serial_dilution()` | No | Less flexible, hides complexity |
| **Mid (Workflow)** | `transfer_liquid()`, `incubate_plate()`, `read_plate()` | **Yes** | Right balance for most agents |
| **Low (Hardware)** | `aspirate()`, `dispense()`, `move_arm()` | No | Too many steps, error-prone |

**Recommendation:** Expose mid-level tools to the agent. High-level tools reduce flexibility; low-level tools require too many steps.

## Safety and Control Boundaries

Instrument agents operate in the physical world. Errors can damage equipment, waste expensive reagents, or compromise experiments. Safety must be built into the architecture.

### Permission Model

Define what the agent can and cannot do:

```python
@dataclass
class Permission:
    tool: str
    allowed_operations: list[str]
    constraints: dict

class PermissionManager:
    def __init__(self, permissions: list[Permission]):
        self.permissions = {p.tool: p for p in permissions}

    def check(self, tool: str, operation: str, params: dict) -> tuple[bool, str]:
        if tool not in self.permissions:
            return False, f"Tool '{tool}' not permitted"

        perm = self.permissions[tool]

        if operation not in perm.allowed_operations:
            return False, f"Operation '{operation}' not allowed for {tool}"

        for key, constraint in perm.constraints.items():
            if key in params:
                if not self.check_constraint(params[key], constraint):
                    return False, f"Parameter '{key}' violates constraint: {constraint}"

        return True, "OK"


# Example permission configuration
AGENT_PERMISSIONS = [
    Permission(
        tool="pipette_transfer",
        allowed_operations=["transfer", "mix"],
        constraints={
            "volume_ul": {"max": 200},  # Limit transfer volume
            "destination": {"pattern": r"^plate_[12]:.*"}  # Only specific plates
        }
    ),
    Permission(
        tool="incubator",
        allowed_operations=["start", "check_status"],
        constraints={
            "temperature_c": {"min": 20, "max": 40},  # Safe temperature range
            "duration_min": {"max": 120}  # Max 2 hours
        }
    ),
    # Note: No permission for "plate_shaker" - agent cannot use it
]
```

### Action Validation Pipeline

Every action goes through validation before execution:

```python
class SafetyValidator:
    def __init__(self, permission_manager: PermissionManager, rules: list):
        self.permissions = permission_manager
        self.rules = rules

    def validate(self, action: dict, context: AgentContext) -> ValidationResult:
        errors = []
        warnings = []

        # Check permissions
        allowed, reason = self.permissions.check(
            action["tool"],
            action.get("operation", "execute"),
            action["params"]
        )
        if not allowed:
            errors.append(f"Permission denied: {reason}")

        # Check safety rules
        for rule in self.rules:
            result = rule.check(action, context)
            if result.level == "error":
                errors.append(result.message)
            elif result.level == "warning":
                warnings.append(result.message)

        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )


# Example safety rules
class MaxActionsPerMinuteRule:
    """Prevent runaway agent behavior"""

    def __init__(self, max_actions: int = 10):
        self.max_actions = max_actions

    def check(self, action: dict, context: AgentContext) -> RuleResult:
        recent_actions = context.get_actions_in_window(seconds=60)
        if len(recent_actions) >= self.max_actions:
            return RuleResult(
                level="error",
                message=f"Rate limit: {self.max_actions} actions/minute exceeded"
            )
        return RuleResult(level="ok")


class VolumeConsistencyRule:
    """Ensure volumes are consistent with well capacity"""

    def check(self, action: dict, context: AgentContext) -> RuleResult:
        if action["tool"] != "pipette_transfer":
            return RuleResult(level="ok")

        dest = action["params"]["destination"]
        volume = action["params"]["volume_ul"]
        current = context.get_well_volume(dest)
        capacity = context.get_well_capacity(dest)

        if current + volume > capacity:
            return RuleResult(
                level="error",
                message=f"Volume overflow: {dest} would have {current + volume}µL (capacity: {capacity}µL)"
            )
        return RuleResult(level="ok")
```

### Human-in-the-Loop Controls

For critical operations, require human approval:

```python
class ApprovalRequired:
    """Decorator for actions requiring human approval"""

    HIGH_RISK_TOOLS = ["waste_disposal", "uv_sterilization", "centrifuge"]
    VOLUME_THRESHOLD = 500  # µL

    @classmethod
    def needs_approval(cls, action: dict) -> tuple[bool, str]:
        # High-risk tools always need approval
        if action["tool"] in cls.HIGH_RISK_TOOLS:
            return True, f"High-risk operation: {action['tool']}"

        # Large volumes need approval
        if action.get("params", {}).get("volume_ul", 0) > cls.VOLUME_THRESHOLD:
            return True, f"Large volume transfer: {action['params']['volume_ul']}µL"

        # First action in a new session
        # (paranoia check for runaway agents)

        return False, ""


class ApprovalGate:
    """Gate that pauses execution for human approval"""

    def __init__(self, approval_ui: ApprovalInterface):
        self.ui = approval_ui

    async def request_approval(self, action: dict, reason: str) -> bool:
        approval_request = {
            "action": action,
            "reason": reason,
            "timestamp": datetime.now(),
            "timeout_seconds": 300  # 5 minute timeout
        }

        self.ui.show_approval_request(approval_request)

        try:
            result = await asyncio.wait_for(
                self.ui.wait_for_response(),
                timeout=300
            )
            return result.approved
        except asyncio.TimeoutError:
            return False  # Default deny on timeout
```

### Emergency Stop

Always provide a way to halt the agent:

```python
class EmergencyStop:
    """Global emergency stop for agent operations"""

    def __init__(self):
        self._stopped = False
        self._stop_reason = None

    def stop(self, reason: str = "Manual stop"):
        self._stopped = True
        self._stop_reason = reason
        # Notify all instruments to halt
        self.broadcast_stop()

    def is_stopped(self) -> bool:
        return self._stopped

    def check_or_raise(self):
        if self._stopped:
            raise EmergencyStopError(self._stop_reason)

    def reset(self):
        """Only callable after manual review"""
        self._stopped = False
        self._stop_reason = None


class SafeAgent:
    """Agent wrapper with emergency stop integration"""

    def __init__(self, agent: Agent, emergency_stop: EmergencyStop):
        self.agent = agent
        self.estop = emergency_stop

    def run(self, goal: str) -> AgentResult:
        try:
            for step in self.agent.iterate(goal):
                # Check emergency stop before each action
                self.estop.check_or_raise()
                yield step
        except EmergencyStopError as e:
            return AgentResult(
                success=False,
                reason="emergency_stop",
                message=str(e)
            )
```

## State Management

Agents need to track the state of the laboratory environment:

```python
@dataclass
class LabwareState:
    labware_id: str
    labware_type: str
    location: str
    wells: dict[str, WellState]

@dataclass
class WellState:
    volume_ul: float
    contents: list[str]  # List of reagent/sample names
    last_modified: datetime

class LabState:
    """Tracks current state of laboratory environment"""

    def __init__(self):
        self.labware: dict[str, LabwareState] = {}
        self.equipment_status: dict[str, str] = {}
        self.history: list[StateChange] = []

    def update_well(self, labware_id: str, well: str,
                    volume_delta: float, content: str | None = None):
        state = self.labware[labware_id].wells[well]
        state.volume_ul += volume_delta
        if content:
            state.contents.append(content)
        state.last_modified = datetime.now()

        self.history.append(StateChange(
            timestamp=datetime.now(),
            labware=labware_id,
            well=well,
            change_type="volume",
            old_value=state.volume_ul - volume_delta,
            new_value=state.volume_ul
        ))

    def get_well_volume(self, location: str) -> float:
        labware_id, well = self.parse_location(location)
        return self.labware[labware_id].wells[well].volume_ul

    def snapshot(self) -> dict:
        """Create a serializable snapshot for LLM context"""
        return {
            "labware": {
                lid: {
                    "type": lw.labware_type,
                    "location": lw.location,
                    "wells_summary": self.summarize_wells(lw.wells)
                }
                for lid, lw in self.labware.items()
            },
            "equipment": self.equipment_status
        }
```

### Providing State to the Agent

Include relevant state in the agent's context:

```python
def build_agent_context(lab_state: LabState, goal: str) -> str:
    return f"""
## Current Laboratory State

### Equipment Status
{format_equipment_status(lab_state.equipment_status)}

### Labware
{format_labware_summary(lab_state.labware)}

### Recent Actions
{format_recent_history(lab_state.history[-10:])}

## Goal
{goal}

## Available Tools
{format_tools(tool_registry.list_tools())}
"""
```

## Error Handling and Recovery

Laboratory operations fail. Good agents handle failures gracefully.

### Error Categories

| Category | Examples | Recovery Strategy |
|----------|----------|-------------------|
| **Transient** | Timeout, temporary sensor error | Retry with backoff |
| **Recoverable** | Tip pickup failed, position error | Specific recovery action |
| **Fatal** | Hardware fault, safety violation | Stop and alert |
| **Logical** | Invalid parameters, constraint violation | Re-plan |

### Recovery Strategies

```python
class ErrorRecoveryHandler:
    def __init__(self, agent: Agent):
        self.agent = agent
        self.recovery_strategies = {
            "tip_pickup_failed": self.recover_tip_pickup,
            "position_error": self.recover_position,
            "timeout": self.retry_with_backoff,
            "volume_error": self.adjust_and_retry,
        }

    def handle(self, error: ToolError, context: AgentContext) -> RecoveryResult:
        if error.fatal:
            return RecoveryResult(action="stop", reason=str(error))

        strategy = self.recovery_strategies.get(error.code)
        if strategy:
            return strategy(error, context)

        # Unknown error - ask agent to decide
        return self.ask_agent_for_recovery(error, context)

    def recover_tip_pickup(self, error: ToolError, context: AgentContext):
        # Try alternative tip rack
        alt_tips = context.find_available_tips()
        if alt_tips:
            return RecoveryResult(
                action="retry",
                modifications={"tip_rack": alt_tips[0]}
            )
        return RecoveryResult(action="stop", reason="No tips available")

    def retry_with_backoff(self, error: ToolError, context: AgentContext):
        attempts = context.get_retry_count(error.action_id)
        if attempts < 3:
            delay = 2 ** attempts  # Exponential backoff
            return RecoveryResult(
                action="retry",
                delay_seconds=delay
            )
        return RecoveryResult(action="escalate", reason="Max retries exceeded")

    def ask_agent_for_recovery(self, error: ToolError, context: AgentContext):
        """Let the agent reason about recovery"""
        prompt = f"""
        An error occurred during execution:
        Error: {error.message}
        Failed action: {error.action}
        Current state: {context.snapshot()}

        What should we do?
        Options:
        1. Retry the action (possibly with modifications)
        2. Skip and continue with next step
        3. Stop execution and alert operator
        4. Execute a recovery procedure

        Explain your reasoning and choose an action.
        """

        response = self.agent.llm.generate(prompt)
        return self.parse_recovery_decision(response)
```

## Practical Architecture

Putting it together for a real system:

| Layer | Components | Role |
|-------|------------|------|
| **User Interface** | Input, Status, Approval UI | Human interaction, oversight |
| **Agent Layer** | Orchestrator + Specialists | Goal decomposition, execution logic |
| **Safety Layer** | Permission Manager, Validator, E-Stop | Guardrails, approval gates |
| **Tool Layer** | Tool Registry + Individual Tools | Abstraction over hardware |
| **Hardware Layer** | Instrument Drivers | Direct hardware communication |
| **State** | Lab State, Audit Log | Tracking, compliance |

**Key Connections:**
- User → Orchestrator → Specialists → Permission Check → Tool Registry → Hardware
- Emergency Stop can halt Tool Registry at any time
- All tool executions logged to Audit Log

### Model Selection

| Component | Recommended Model | Reasoning |
|-----------|-------------------|-----------|
| Orchestrator | Mistral-7B / Llama3-8B | Needs reasoning for task decomposition |
| Specialist Agents | Phi-3 / Qwen3-3B | Focused domain, can be smaller |
| Tool Selection | Qwen3-0.6B | Simple classification task |
| Error Recovery | Same as orchestrator | Needs reasoning |

## Considerations for Adoption

### Start with Constrained Domains

Don't try to build a general-purpose lab agent. Start with:
- Single workflow type (e.g., just ELISA)
- Limited tool set (e.g., pipette + reader only)
- Strict permissions (narrow what agent can do)

### Build Trust Incrementally

1. **Phase 1**: Agent suggests, human executes
2. **Phase 2**: Agent executes simple steps, human approves each
3. **Phase 3**: Agent executes routine workflows, human approves batch
4. **Phase 4**: Agent executes autonomously with oversight

### Monitor and Audit

Every agent action should be logged:

```python
@dataclass
class AgentAuditEntry:
    timestamp: datetime
    session_id: str
    agent_id: str
    action_type: str  # "plan", "execute", "observe", "decide"
    content: dict
    reasoning: str | None
    result: dict | None
    user_approvals: list[str]
```

### Regulatory Implications

For GxP environments:
- The agent system itself needs validation
- Agent decisions affecting quality need documentation
- Human oversight requirements may be mandated
- Audit trails must be complete and tamper-evident

## Closing Thoughts

Instrument agents represent the frontier of laboratory automation—systems that can understand goals, plan operations, and adapt to real-world conditions. The technology is advancing rapidly, with frameworks like LangChain, AutoGen, and domain-specific tools like ROSA making implementation more accessible.

But capability without safety is dangerous in laboratory environments. The architectural patterns that matter most aren't about making agents smarter—they're about making them controllable, predictable, and transparent.

Build agents that humans can trust: start narrow, validate thoroughly, maintain oversight, and expand gradually as confidence grows.

_The field of AI agents is evolving rapidly. Specific frameworks and models will change, but the principles of safety-first design, clear tool abstractions, and human oversight will remain essential._

---

**Further Reading:**

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [LangChain Agents Documentation](https://python.langchain.com/docs/modules/agents/)
- [ROSA: ROS Agent](https://github.com/nasa-jpl/rosa)
- [AutoGen: Enabling Next-Gen LLM Applications](https://microsoft.github.io/autogen/)
- [SiLA 2 Standard](https://sila-standard.com/)
