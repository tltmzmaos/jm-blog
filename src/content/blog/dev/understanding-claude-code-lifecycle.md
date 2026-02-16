---
title: "Understanding How Claude Code Works Under the Hood"
description: "A walkthrough of Claude Code's execution lifecycle — from the moment you type a prompt to the final response"
pubDate: 2026-02-14
author: "Jongmin Lee"
tags: ["Software Engineering", "AI"]
draft: false
---

## Why I Wanted to Understand This

After actively using Claude Code at work for a while, I realized I was treating it like a black box. I'd type a prompt, it would do things, and I'd get a result. That worked fine most of the time, but when the output wasn't what I expected, I had no mental model for understanding *why*.

So I spent some time digging into how Claude Code actually works — what happens between the moment I hit Enter and the moment I see a response. This post is my attempt to organize that understanding.

## The Big Picture

At its core, Claude Code runs in a loop:

1. **Gather context** — read files, search the codebase, look up information
2. **Take action** — make edits, run commands, call external tools
3. **Verify results** — check outputs, run tests, adjust approach

This loop repeats until Claude decides it has enough to give a final response. A single prompt can trigger dozens of tool calls — reading files, making edits, running tests — all within one cycle.

## Session Initialization

Before any of the above happens, the session needs to be set up. When you start Claude Code (either in the terminal or VS Code extension), it loads several things:

| What | Where | Purpose |
|------|-------|---------|
| CLAUDE.md | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Project-specific instructions |
| Rules | `.claude/rules/*.md` | Modular, topic-specific rules |
| Auto Memory | `~/.claude/projects/<project>/memory/` | Learnings from previous sessions |
| Settings | `settings.json` (user / project / local) | Permissions, hooks, env vars |
| MCP Servers | `.mcp.json`, `~/.claude.json` | External tool connections |

All of this becomes part of the system prompt — the context that Claude always has access to throughout the session. This is why CLAUDE.md is powerful: it's not a one-time instruction, it's persistent context that shapes every response.

A `SessionStart` hook fires at this point, if configured. This can inject additional context or run setup scripts.

## The Agentic Loop

This is the core of how Claude Code operates. When you submit a prompt:

**Step 1: Prompt Processing**

The `UserPromptSubmit` hook fires first. This can modify or add context to your prompt before Claude sees it. Then your prompt, along with the system prompt and conversation history, gets sent to the Claude API.

**Step 2: Claude Decides What To Do**

Claude analyzes the prompt and decides whether it can respond directly or needs to use tools first. If tools are needed, it selects which ones — and it can select multiple tools in parallel if they're independent.

**Step 3: Permission Check**

Before any tool executes, Claude Code checks the permission rules in `settings.json`:

- **allow**: Runs without asking
- **ask**: Prompts the user for approval
- **deny**: Blocked entirely

This is where rules like `Bash(npm run *)` come in — you can pre-approve specific patterns so Claude doesn't ask every time.

**Step 4: Hook Execution**

If a `PreToolUse` hook is configured, it fires before the tool runs. This is where you can add guardrails — for example, blocking edits to certain files, or running a linter check before any write operation.

If the hook returns exit code 2, the tool call is blocked and Claude is informed why.

**Step 5: Tool Execution**

The tool actually runs. This could be reading a file, making an edit, executing a shell command, fetching a URL, or calling an MCP server.

**Step 6: Post-Processing**

`PostToolUse` hook fires after the tool succeeds. Common use case: running Prettier after every file edit so formatting stays consistent.

**Step 7: Back to Claude**

The tool result goes back to Claude. It then decides: *"Do I need more information? Should I use another tool? Or do I have enough to respond?"*

If more work is needed, the loop goes back to Step 2. If not, Claude generates the final response and the `Stop` hook fires.

## Subagents

Sometimes Claude delegates work to a subagent — a separate Claude instance with its own context window. This happens when:

- The task is exploratory and might consume a lot of context (e.g., searching through a large codebase)
- A specialized, restricted tool set is appropriate (e.g., read-only analysis)
- A different model makes sense (e.g., Haiku for quick searches)

The key thing to understand: subagents run the same agentic loop, but in isolation. They don't share the main conversation's context. When they finish, only their final result comes back to the main session.

Built-in subagent types include:

| Agent | Purpose | Tools |
|-------|---------|-------|
| Explore | Fast codebase search | Read-only |
| Plan | Architecture and design | Read-only |
| General-purpose | Complex multi-step tasks | All tools |
| Bash | Terminal operations | Bash only |

You can also define custom subagents in `.claude/agents/` with specific instructions, tool restrictions, and even their own hooks.

## Context Window Management

Claude Code has a finite context window — the amount of information it can hold in a single session. As the conversation grows, it eventually approaches the limit.

When context usage hits roughly 95%, auto-compaction kicks in. Claude summarizes the earlier parts of the conversation to free up space, preserving the most relevant information. A `PreCompact` hook fires before this happens.

You can monitor this with `/context` in the terminal, or watch for compaction messages.

This is why CLAUDE.md is important: even after compaction, the system prompt (including CLAUDE.md) stays intact. Information in the conversation history might get summarized away, but CLAUDE.md persists.

## Where Each Configuration Fits In

Here's a summary of when each configuration file and concept comes into play across the lifecycle:

| Configuration | When It's Used | Role in Lifecycle |
|---------------|---------------|-------------------|
| `CLAUDE.md` | Session init, persists after compaction | Always-on project context — shapes every response |
| `.claude/rules/` | Session init, loaded with CLAUDE.md | Modular instructions by topic or file path |
| Auto Memory | Session init (first 200 lines) | Claude's own notes from previous sessions |
| `settings.json` | Session init + every tool call | Permissions, hooks, env vars, model selection |
| `.mcp.json` | Session init | External tool connections (GitHub, Slack, DBs, etc.) |
| `.claude/agents/` | During agentic loop, when Claude delegates | Custom subagent definitions with restricted tools/instructions |
| `.claude/skills/` | On invocation (slash command or auto-trigger) | Reusable prompt templates for repeatable workflows |
| Hooks | Throughout — tied to specific lifecycle events | Automation at each stage (format, validate, block, notify) |

Skills and agents are worth noting separately: they don't load at session init. Skills load their descriptions at startup so Claude knows they exist, but the full content only loads when a skill is actually invoked. Custom agents are instantiated only when Claude decides to delegate a task.

## What Each Looks Like in Practice

### Permission Rules in settings.json

Permission rules follow a `Tool(pattern)` syntax. You can pre-approve safe commands and block dangerous ones:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npm test *)",
      "Bash(git status)",
      "Bash(git diff *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(curl *)",
      "Read(./.env*)"
    ]
  }
}
```

Without these rules, Claude asks for approval every time it wants to run a shell command. With them, safe operations like `npm run build` go through automatically, and anything matching `deny` patterns is blocked outright.

### Hooks

Hooks are shell commands that fire at specific lifecycle events. A common use case is auto-formatting after every file edit:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $(echo $CLAUDE_TOOL_INPUT | jq -r '.file_path')"
          }
        ]
      }
    ]
  }
}
```

The available hook events map directly to the lifecycle stages:

| Hook Event | Lifecycle Stage | Common Use |
|------------|----------------|------------|
| `SessionStart` | Session init | Load env vars, inject context |
| `UserPromptSubmit` | Before processing | Validate or modify prompts |
| `PreToolUse` | Before tool execution | Block dangerous operations |
| `PostToolUse` | After tool execution | Auto-format, lint, notify |
| `Stop` | Response complete | Verify all tasks done |
| `PreCompact` | Before compaction | Preserve critical context |

### MCP Servers

MCP connects Claude Code to external tools. Some commonly used servers:

```bash
# GitHub — PR reviews, issue management
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# Sentry — error monitoring and debugging
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# PostgreSQL — query databases directly
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:pass@host:5432/dbname"

# Notion — access documentation
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

Once connected, you can ask things like "What are the most common errors in Sentry this week?" or "Create a GitHub issue for the bug we just found" — Claude uses the MCP tools to interact with these services directly.

### Commands

Commands are simple prompt templates in `.claude/commands/`. They're markdown files invoked with `/command-name`:

```markdown
<!-- .claude/commands/check.md -->
Run the build and report any errors:
1. Execute `npm run build`
2. If there are errors, explain what's wrong and suggest fixes
3. If clean, confirm the build succeeded
```

Commands are lightweight — just text that gets injected into the conversation. They don't have frontmatter or special configuration. Think of them as saved prompts you'd otherwise type manually.

**Commands vs Skills:** Commands inject a prompt. Skills define a workflow with metadata (name, description, model invocation rules). Use commands for simple "do this" actions. Use skills when you need structured behavior, dynamic context injection, or want Claude to recognize when to apply it automatically.

### Skills

Skills are reusable prompts stored as `SKILL.md` files with YAML frontmatter. For example, a `/deploy` skill:

```yaml
# .claude/skills/deploy/SKILL.md
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:
1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

`disable-model-invocation: true` means only you can trigger this with `/deploy` — Claude won't run it on its own. Skills can also inject dynamic context using shell commands:

```yaml
---
name: pr-summary
description: Summarize the current pull request
context: fork
---

## PR Context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`

Summarize this pull request.
```

The `!`command`` syntax runs the shell command and injects its output before Claude sees the prompt.

### Custom Subagents

Custom subagents go in `.claude/agents/` as Markdown files. Here's a read-only code reviewer:

```yaml
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Reviews code for quality and best practices. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior code reviewer. When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Review for quality, security, and maintainability

Provide feedback organized by priority:
- Critical (must fix)
- Warnings (should fix)
- Suggestions (consider)
```

The `tools` field restricts this agent to read-only operations (no Edit or Write). The `description` tells Claude when to delegate — including "use proactively" encourages automatic delegation after code changes.

## Beyond the CLI: Agent SDK

Everything above applies to Claude Code as a CLI tool. But if you need to build a standalone AI application — multi-agent pipelines, production services, or custom UIs — the Agent SDK is the next step.

| Aspect | Claude Code CLI | Agent SDK |
| ------ | --------------- | --------- |
| What it is | Interactive coding assistant | Library for building AI agents |
| Languages | N/A (you use the CLI) | Python, TypeScript |
| Use case | Development workflow | Production applications |
| Agents | Built-in subagents + custom `.claude/agents/` | Fully programmable agent orchestration |
| When to use | Day-to-day coding, project management | When you need custom agent logic beyond the CLI |

For most development workflows, the CLI is sufficient. The SDK becomes relevant when you want to embed Claude's agentic capabilities into your own application — for example, an automated code review service, a CI/CD pipeline that reasons about failures, or a multi-agent system where different agents handle different concerns.

## What This Means in Practice

Understanding this lifecycle changed how I use Claude Code:

- **CLAUDE.md isn't optional.** It's the one piece of context that never gets lost. If there's something Claude should always know about your project, it belongs there.
- **Hooks are guardrails, not features.** They're most useful for preventing mistakes (blocking edits to sensitive files) and maintaining consistency (auto-formatting).
- **Permission rules reduce friction.** Pre-approving safe commands means fewer interruptions without sacrificing control.
- **Subagents protect your context.** Heavy exploration tasks should be delegated so your main conversation stays focused.

---

**Further Reading:**

- [Claude Code Overview](https://code.claude.com/docs/en/overview)
- [Claude Code Settings](https://code.claude.com/docs/en/settings)
- [Memory and CLAUDE.md](https://code.claude.com/docs/en/memory)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Sub-agents](https://code.claude.com/docs/en/sub-agents)
- [MCP](https://code.claude.com/docs/en/mcp)
- [Skills](https://code.claude.com/docs/en/skills)
