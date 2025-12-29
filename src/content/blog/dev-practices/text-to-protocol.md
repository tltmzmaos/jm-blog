---
title: "Text-to-Protocol: From Natural Language to Executable Lab Procedures"
description: "Designing systems that convert natural language instructions into structured, validated laboratory protocols—covering representation formats, LLM pipelines, and safety verification."
pubDate: 2025-12-27
author: "Jongmin Lee"
tags: ["Machine Learning", "Lab Automation", "Software Engineering", "Best Practices"]
draft: false
---

"Run the standard cell viability assay on samples A1-A6, but use half the usual reagent volume."

For a trained lab technician, this instruction is clear enough. For an automation system, it's impossibly ambiguous. What's the "standard" assay? What volumes are "usual"? What specific steps are involved?

**Text-to-Protocol** systems aim to bridge this gap—converting human-readable instructions into structured, machine-executable procedures. This isn't just about parsing text; it's about capturing intent, resolving ambiguity, and ensuring the resulting protocol is safe to execute.

## The Problem Space

Traditional lab automation requires explicit programming: every pipetting step, every incubation time, every conditional branch must be specified in code. This creates a barrier between scientists who design experiments and automation systems that execute them.

| Approach | Flow | Bottleneck |
|----------|------|------------|
| **Traditional** | Scientist → Programmer → Code → Robot | Programmer bandwidth |
| **Text-to-Protocol** | Scientist → NLP → Protocol → Validation → Robot | Validation accuracy |

The promise is compelling: scientists describe what they want in familiar terms, and the system figures out how to make it happen. But the implementation is far from trivial.

## Protocol Representation Formats

Before an LLM can generate a protocol, you need to decide how protocols are represented. This choice has significant implications for validation, execution, and maintainability.

### Option 1: JSON Schema

The most straightforward approach—define a JSON schema that captures protocol structure:

```json
{
  "protocol": {
    "name": "Cell Viability Assay",
    "version": "1.0",
    "steps": [
      {
        "id": "step_1",
        "action": "aspirate",
        "source": {
          "labware": "reagent_plate",
          "wells": ["A1"]
        },
        "volume_ul": 50,
        "parameters": {
          "speed": "normal",
          "touch_tip": true
        }
      },
      {
        "id": "step_2",
        "action": "dispense",
        "destination": {
          "labware": "sample_plate",
          "wells": ["A1", "A2", "A3", "A4", "A5", "A6"]
        },
        "volume_ul": 8.33,
        "parameters": {
          "speed": "slow",
          "mix_after": {
            "cycles": 3,
            "volume_ul": 25
          }
        }
      },
      {
        "id": "step_3",
        "action": "incubate",
        "labware": "sample_plate",
        "parameters": {
          "temperature_c": 37,
          "duration_min": 30,
          "humidity_percent": 95
        }
      }
    ],
    "metadata": {
      "estimated_duration_min": 45,
      "required_labware": ["reagent_plate", "sample_plate"],
      "required_equipment": ["pipette_8channel", "incubator"]
    }
  }
}
```

**Pros:**
- Easy to validate with JSON Schema
- Widely supported, language-agnostic
- Human-readable

**Cons:**
- Verbose for complex protocols
- Limited expressiveness for conditionals and loops
- No built-in semantics

### Option 2: Domain-Specific Language (DSL)

A purpose-built language for laboratory procedures:

```
PROTOCOL "Cell Viability Assay" v1.0

LABWARE:
  reagent_plate: 96-well plate at position 1
  sample_plate: 96-well plate at position 2

PROCEDURE:
  # Transfer reagent to samples
  TRANSFER 50uL FROM reagent_plate:A1
           TO sample_plate:A1-A6
           USING 8-channel pipette
           WITH mix_after(3, 25uL)

  # Incubate
  INCUBATE sample_plate
           AT 37C FOR 30min
           HUMIDITY 95%

  # Measure
  READ sample_plate
       MODE fluorescence
       WAVELENGTH 485/535nm

CONSTRAINTS:
  - reagent_plate MUST be at 4C before use
  - total_volume per well MUST NOT exceed 200uL
```

**Pros:**
- Concise, readable syntax
- Can encode domain-specific semantics
- Natural expression of constraints

**Cons:**
- Requires custom parser
- Learning curve for users
- Tooling must be built from scratch

### Option 3: Existing Standards

Several standards exist for laboratory protocol exchange:

| Standard | Focus | Adoption |
|----------|-------|----------|
| **Autoprotocol** | Cloud lab execution | Transcriptic/Strateos |
| **SBOL** | Synthetic biology | Academic |
| **AnIML** | Analytical data | Instrument vendors |
| **SiLA 2** | Lab instrument communication | Industry consortium |

```python
# Example: Autoprotocol-style representation
from autoprotocol import Protocol, Container

p = Protocol()
sample_plate = p.ref("sample_plate", cont_type="96-pcr", storage="cold_4")

p.transfer(
    source=reagent_plate.wells_from(0, 1),
    dest=sample_plate.wells_from(0, 6),
    volume="50:microliter",
    mix_after=True
)

p.incubate(sample_plate, where="warm_37", duration="30:minute")
```

**Pros:**
- Industry backing
- Existing tooling
- Interoperability potential

**Cons:**
- May not fit your specific domain
- Can be over-engineered for simple cases
- Vendor lock-in risks

### Recommendation

For most cases, start with **JSON with a well-defined schema**. It's the easiest for LLMs to generate reliably, straightforward to validate, and can always be compiled to other formats if needed.

```
Natural Language → LLM → JSON Protocol → Validator → DSL/Autoprotocol → Execution
```

## The LLM Pipeline

Converting natural language to structured protocols involves several stages, each with its own challenges.

### Stage 1: Intent Extraction

Before generating a full protocol, understand what the user actually wants:

**Example: "Run viability assay on A1-A6, half reagent volume"**

| Extraction Step | Output |
|-----------------|--------|
| Assay Type | `viability` |
| Samples | `A1-A6` |
| Modifier | `0.5x reagent` |
| Template Resolution | `standard_viability_v2` + apply modifications |

**Implementation approach:**

```python
EXTRACTION_PROMPT = """
You are a laboratory protocol assistant. Extract structured information from the user's request.

Return JSON with:
- protocol_type: The type of assay/procedure requested
- samples: List of sample identifiers or ranges
- modifications: Any deviations from standard procedure
- ambiguities: Any unclear aspects that need clarification

User request: {user_input}
"""

def extract_intent(user_input: str) -> dict:
    response = llm.generate(
        prompt=EXTRACTION_PROMPT.format(user_input=user_input),
        response_format={"type": "json_object"}
    )
    return json.loads(response)
```

### Stage 2: Template Resolution

Most protocols are variations of standard procedures. Rather than generating from scratch, resolve to a template and apply modifications:

```python
class ProtocolResolver:
    def __init__(self, template_library: dict):
        self.templates = template_library

    def resolve(self, intent: dict) -> dict:
        # Find matching template
        template_id = self.find_template(intent["protocol_type"])
        template = self.templates[template_id].copy()

        # Apply sample mapping
        template = self.apply_samples(template, intent["samples"])

        # Apply modifications
        for mod in intent["modifications"]:
            template = self.apply_modification(template, mod)

        return template

    def apply_modification(self, template: dict, modification: dict) -> dict:
        """Apply a modification like 'half reagent volume'"""
        if modification["type"] == "volume_scale":
            scale = modification["factor"]
            for step in template["steps"]:
                if "volume_ul" in step:
                    step["volume_ul"] *= scale
        return template
```

### Stage 3: Full Generation (When Needed)

For truly novel protocols, generate from scratch with careful prompting:

```python
GENERATION_PROMPT = """
You are a laboratory automation expert. Generate a structured protocol in JSON format.

## Protocol Requirements
{requirements}

## Available Equipment
{equipment_list}

## Available Labware
{labware_list}

## Output Format
Generate a JSON protocol following this schema:
{schema}

## Constraints
- All volumes must be between 1uL and 1000uL
- All temperatures must be between 4C and 95C
- Each step must reference existing labware
- Pipetting steps must specify source and destination

## Examples
{few_shot_examples}

Generate the protocol:
"""

def generate_protocol(requirements: str, context: dict) -> dict:
    prompt = GENERATION_PROMPT.format(
        requirements=requirements,
        equipment_list=json.dumps(context["equipment"]),
        labware_list=json.dumps(context["labware"]),
        schema=json.dumps(PROTOCOL_SCHEMA),
        few_shot_examples=format_examples(context["examples"])
    )

    response = llm.generate(
        prompt=prompt,
        response_format={"type": "json_object"},
        temperature=0.2  # Lower temperature for more consistent output
    )

    return json.loads(response)
```

### Few-Shot Examples Matter

The quality of generated protocols depends heavily on examples:

```python
EXAMPLES = [
    {
        "input": "Add 100uL of PBS to wells A1-A12",
        "output": {
            "steps": [{
                "action": "dispense",
                "source": {"labware": "reagent_reservoir", "wells": ["A1"]},
                "destination": {"labware": "plate_1", "wells": ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"]},
                "volume_ul": 100,
                "reagent": "PBS"
            }]
        }
    },
    {
        "input": "Serial dilution 1:2 across row A, starting with 200uL",
        "output": {
            "steps": [
                {
                    "action": "dispense",
                    "destination": {"labware": "plate_1", "wells": ["A1"]},
                    "volume_ul": 200
                },
                {
                    "action": "serial_dilute",
                    "labware": "plate_1",
                    "wells": ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"],
                    "dilution_factor": 2,
                    "transfer_volume_ul": 100
                }
            ]
        }
    }
]
```

## Validation Pipeline

Generated protocols **must** be validated before execution. This is non-negotiable in laboratory environments where errors can waste expensive reagents, damage equipment, or compromise safety.

### Layer 1: Schema Validation

First, ensure the output is structurally valid:

```python
from jsonschema import validate, ValidationError

PROTOCOL_SCHEMA = {
    "type": "object",
    "required": ["steps"],
    "properties": {
        "steps": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["action"],
                "properties": {
                    "action": {"enum": ["aspirate", "dispense", "transfer", "incubate", "mix", "read"]},
                    "volume_ul": {"type": "number", "minimum": 0.1, "maximum": 1000},
                    "temperature_c": {"type": "number", "minimum": 4, "maximum": 95}
                }
            }
        }
    }
}

def validate_schema(protocol: dict) -> list[str]:
    errors = []
    try:
        validate(instance=protocol, schema=PROTOCOL_SCHEMA)
    except ValidationError as e:
        errors.append(f"Schema error: {e.message}")
    return errors
```

### Layer 2: Semantic Validation

Check that the protocol makes sense in the domain:

```python
class SemanticValidator:
    def validate(self, protocol: dict, context: dict) -> list[str]:
        errors = []

        # Check labware references
        errors.extend(self.validate_labware_refs(protocol, context["labware"]))

        # Check volume constraints
        errors.extend(self.validate_volumes(protocol))

        # Check liquid tracking
        errors.extend(self.validate_liquid_tracking(protocol))

        # Check equipment availability
        errors.extend(self.validate_equipment(protocol, context["equipment"]))

        return errors

    def validate_liquid_tracking(self, protocol: dict) -> list[str]:
        """Ensure we don't aspirate more than what's in a well"""
        errors = []
        well_volumes = defaultdict(float)

        for step in protocol["steps"]:
            if step["action"] == "dispense":
                for well in step["destination"]["wells"]:
                    well_volumes[well] += step["volume_ul"]

            elif step["action"] == "aspirate":
                for well in step["source"]["wells"]:
                    if well_volumes[well] < step["volume_ul"]:
                        errors.append(
                            f"Aspirating {step['volume_ul']}uL from {well} "
                            f"but only {well_volumes[well]}uL available"
                        )
                    well_volumes[well] -= step["volume_ul"]

        return errors
```

### Layer 3: Safety Validation

Enforce safety rules that should never be violated:

```python
class SafetyValidator:
    def __init__(self, safety_rules: list):
        self.rules = safety_rules

    def validate(self, protocol: dict) -> list[str]:
        errors = []

        for rule in self.rules:
            if not rule.check(protocol):
                errors.append(f"Safety violation: {rule.description}")

        return errors

# Example safety rules
SAFETY_RULES = [
    MaxVolumeRule(max_ul=200, description="Well volume must not exceed 200uL"),
    IncompatibleReagentsRule(
        pairs=[("bleach", "acid"), ("oxidizer", "reducer")],
        description="Incompatible reagents must not be mixed"
    ),
    TemperatureRangeRule(
        min_c=4, max_c=65,
        description="Temperature must be in safe range"
    ),
    RequiredPPERule(
        hazardous_reagents=["formaldehyde", "ethidium_bromide"],
        description="Hazardous reagents require appropriate PPE"
    )
]
```

### Layer 4: Simulation/Dry Run

Before touching real equipment, simulate the protocol:

```python
class ProtocolSimulator:
    def __init__(self, deck_layout: dict):
        self.deck = DeckState(deck_layout)
        self.pipette = PipetteState()

    def simulate(self, protocol: dict) -> SimulationResult:
        timeline = []
        warnings = []

        for step in protocol["steps"]:
            try:
                result = self.execute_step(step)
                timeline.append({
                    "step": step,
                    "state": self.deck.snapshot(),
                    "duration_s": result.duration
                })
            except SimulationError as e:
                return SimulationResult(
                    success=False,
                    error=str(e),
                    timeline=timeline
                )

        return SimulationResult(
            success=True,
            timeline=timeline,
            total_duration_s=sum(t["duration_s"] for t in timeline),
            warnings=warnings
        )
```

### Validation Pipeline Integration

| Layer | Check | On Fail |
|-------|-------|---------|
| 1. Schema | JSON structure valid? | Regenerate |
| 2. Semantic | Labware exists? Volumes feasible? | Regenerate |
| 3. Safety | No hazardous combinations? Within limits? | Reject + Alert |
| 4. Simulation | Dry-run succeeds? | Regenerate |
| ✓ Pass All | → Ready for Human Review | |

## Human-in-the-Loop

Even with thorough validation, human review should be part of the workflow—especially for novel protocols or high-stakes experiments.

### Review Interface

Present generated protocols in a way that facilitates quick review:

```
┌─────────────────────────────────────────────────────────────┐
│ Generated Protocol: Cell Viability Assay (Modified)         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Original Request:                                           │
│ "Run standard viability on A1-A6, half reagent"            │
│                                                             │
│ ⚠ Modifications from Standard:                              │
│   • Reagent volume: 50µL → 25µL (0.5x)                     │
│                                                             │
│ Steps:                                                      │
│ ┌─────┬────────────┬──────────────┬─────────────┐          │
│ │  #  │ Action     │ Details      │ Duration    │          │
│ ├─────┼────────────┼──────────────┼─────────────┤          │
│ │  1  │ Transfer   │ 25µL to A1-6 │ 30s         │          │
│ │  2  │ Mix        │ 3x at 20µL   │ 45s         │          │
│ │  3  │ Incubate   │ 37°C, 30min  │ 30min       │          │
│ │  4  │ Read       │ FL 485/535   │ 2min        │          │
│ └─────┴────────────┴──────────────┴─────────────┘          │
│                                                             │
│ Validation: ✓ Schema ✓ Semantic ✓ Safety ✓ Simulation      │
│ Estimated Duration: 33 minutes                              │
│ Required Reagents: Viability Reagent (150µL total)         │
│                                                             │
│ [Approve & Execute]  [Edit]  [Reject]  [Save as Template]  │
└─────────────────────────────────────────────────────────────┘
```

### Approval Workflow

```python
class ProtocolApproval:
    def __init__(self, protocol: dict, user: str):
        self.protocol = protocol
        self.requested_by = user
        self.status = "pending_review"
        self.reviews = []

    def submit_for_review(self, reviewer: str):
        self.status = "under_review"
        self.assigned_reviewer = reviewer
        notify_reviewer(reviewer, self)

    def approve(self, reviewer: str, comments: str = ""):
        self.reviews.append({
            "reviewer": reviewer,
            "decision": "approved",
            "comments": comments,
            "timestamp": datetime.now()
        })
        self.status = "approved"

    def request_changes(self, reviewer: str, changes: list[str]):
        self.reviews.append({
            "reviewer": reviewer,
            "decision": "changes_requested",
            "changes": changes,
            "timestamp": datetime.now()
        })
        self.status = "changes_requested"
```

## Handling Ambiguity

Natural language is inherently ambiguous. Good text-to-protocol systems must detect and resolve ambiguity rather than guessing.

### Common Ambiguities

| Ambiguity Type | Example | Resolution Strategy |
|----------------|---------|---------------------|
| **Implicit references** | "the samples" | Ask for clarification or infer from context |
| **Undefined terms** | "standard protocol" | Lookup in protocol library |
| **Missing parameters** | "incubate briefly" | Use defaults or ask |
| **Conflicting instructions** | "quickly but gently" | Prioritize or ask |

### Clarification Dialog

```python
class ClarificationHandler:
    def __init__(self, llm):
        self.llm = llm

    def detect_ambiguities(self, intent: dict) -> list[Ambiguity]:
        """Use LLM to identify ambiguous elements"""
        prompt = f"""
        Analyze this protocol request for ambiguities:
        {json.dumps(intent)}

        Identify any:
        - Undefined references (e.g., "the plate" without specifying which)
        - Missing required parameters
        - Vague quantities or durations
        - Implicit assumptions

        Return JSON list of ambiguities with suggested clarifying questions.
        """

        response = self.llm.generate(prompt)
        return [Ambiguity(**a) for a in json.loads(response)]

    def generate_clarification(self, ambiguities: list[Ambiguity]) -> str:
        """Generate user-friendly clarification request"""
        questions = []
        for amb in ambiguities:
            questions.append(f"• {amb.question}")
            if amb.suggestions:
                questions.append(f"  Options: {', '.join(amb.suggestions)}")

        return "I need a few clarifications:\n" + "\n".join(questions)
```

### Example Dialog

```
User: Run the assay on today's samples

System: I need a few clarifications:
        • Which assay would you like to run?
          Options: Cell Viability, ELISA, Bradford Protein
        • Where are today's samples located?
          Options: Plate 1 (Position A), Plate 2 (Position B)

User: Viability assay, samples are in Plate 1

System: Got it. Generating protocol for Cell Viability Assay
        on Plate 1 samples...
```

## Error Recovery

When generation fails or produces invalid output, the system should recover gracefully.

```python
class ResilientGenerator:
    def __init__(self, llm, max_retries: int = 3):
        self.llm = llm
        self.max_retries = max_retries

    def generate_with_recovery(self, request: str, context: dict) -> dict:
        errors_encountered = []

        for attempt in range(self.max_retries):
            # Generate protocol
            protocol = self.generate(request, context, errors_encountered)

            # Validate
            validation_errors = self.validate(protocol)

            if not validation_errors:
                return protocol

            # Log errors for next attempt
            errors_encountered.extend(validation_errors)

            # Adjust prompt based on error type
            if any("volume" in e for e in validation_errors):
                context["hints"].append("Pay careful attention to volume constraints")
            if any("labware" in e for e in validation_errors):
                context["hints"].append("Only use labware from the provided list")

        # All retries failed
        raise GenerationError(
            f"Failed to generate valid protocol after {self.max_retries} attempts",
            errors=errors_encountered
        )
```

## Practical Architecture

Putting it all together for air-gapped deployment:

| Layer | Components | Responsibilities |
|-------|------------|------------------|
| **User Interface** | Input, Review UI | Natural language input, approval workflow |
| **Processing** | Intent Extractor, Template Resolver, Generator, Validator | Parse → Resolve → Generate → Validate |
| **Resources** | Protocol Templates, Local LLM (7B), Safety Rules | Domain knowledge, inference, constraints |
| **Execution** | Simulator, Lab Equipment | Dry-run verification, physical execution |

**Data Flow:** Input → Intent Extraction → Template Resolution → LLM Generation → Validation → Human Review → Simulation → Equipment

### Model Selection for Protocol Generation

| Task | Recommended Model | Why |
|------|-------------------|-----|
| Intent extraction | Qwen3-0.6B / Phi-3 | Fast, simple structured output |
| Protocol generation | Llama3.2-3B / Mistral-7B | Balance of capability and speed |
| Ambiguity detection | Same as generation | Requires reasoning |
| Validation | Rule-based (no LLM) | Deterministic, auditable |

## Considerations for Adoption

### Start Simple

Don't try to handle all possible protocols. Start with:
1. A single, well-understood protocol type
2. Clear template with parameterized variations
3. Strict validation rules
4. Mandatory human review

### Build Your Template Library

The more templates you have, the less the LLM needs to generate from scratch:

```python
TEMPLATES = {
    "cell_viability_standard": {...},
    "cell_viability_extended": {...},
    "elisa_sandwich": {...},
    "elisa_competitive": {...},
    "pcr_standard": {...},
    # etc.
}
```

### Log Everything

Every generation, validation, and execution should be logged:

```python
@dataclass
class ProtocolAuditLog:
    timestamp: datetime
    request_id: str
    user_input: str
    extracted_intent: dict
    generated_protocol: dict
    validation_results: list
    human_review: dict
    execution_result: dict
```

### Regulatory Considerations

For GxP environments:
- Generated protocols may need to be treated as controlled documents
- The LLM itself may need validation
- Audit trails must be complete and tamper-evident
- Human approval workflows must be documented

## Closing Thoughts

Text-to-Protocol systems represent a significant step toward making lab automation accessible. The technology is ready—LLMs can generate structured output reliably, and validation systems can catch errors.

The challenge is building the infrastructure around the LLM: robust validation, sensible defaults, clear error messages, and appropriate human oversight. Get these right, and you have a system that genuinely accelerates scientific work.

Get them wrong, and you have a system that generates plausible-looking protocols that fail in subtle, expensive ways.

The key insight: **the LLM is just one component**. Template libraries, validation rules, and human review processes are equally important. Invest in all of them.

_Protocol generation is advancing rapidly. The specific models and techniques will evolve, but the architectural principles—structured output, multi-layer validation, human oversight—will remain relevant._

---

**Further Reading:**

- [Autoprotocol Specification](https://autoprotocol.org/)
- [SiLA 2 Standard](https://sila-standard.com/)
- [Structured Output with LLMs - OpenAI](https://platform.openai.com/docs/guides/structured-outputs)
- [JSON Schema Specification](https://json-schema.org/)
