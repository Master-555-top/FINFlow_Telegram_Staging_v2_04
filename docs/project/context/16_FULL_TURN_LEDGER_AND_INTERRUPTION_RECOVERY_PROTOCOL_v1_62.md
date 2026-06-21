# v1.62 — Full Turn Ledger & Interruption Recovery Protocol

## Why this exists

User explicitly required stronger trust guarantees:

```text
Every user message must be captured.
Every assistant answer/action must be captured.
When user interrupts, the current step must not be lost.
The project must contain files that prove what happened, what changed, what was deferred and what is next.
```

## Honest status before v1.62

Before this protocol, the project already had:

- transcript ledger;
- context ledger;
- current state;
- project memory;
- changelog;
- source recheck register;
- guardrails.

But the ledger format was mostly:

```text
exact user text + assistant action summary
```

It was not yet strict enough for full turn-level operational recovery.

## New locked rule from v1.62 onward

For every future package, update these files before packaging:

```text
docs/project/context/13_FULL_CHAT_TRANSCRIPT_LEDGER.md
docs/project/context/17_TURN_BY_TURN_OPERATION_LEDGER.md
docs/project/state/ACTIVE_WORK_STATE.md
docs/project/state/INTERRUPTION_RECOVERY_QUEUE.md
docs/project/context/02_USER_REQUIREMENTS_LEDGER.md
docs/project/state/CURRENT_STATE.md
docs/project/memory/PROJECT_MEMORY.md
CHANGELOG_LATEST.md
```

## What each future entry must include

### User message

- exact user text when available;
- timestamp/version;
- whether it interrupts an active task;
- whether it adds new requirements;
- whether it changes current scope.

### Assistant action

- what was planned before the user interrupted;
- what changed because of the user message;
- what was completed;
- what was deferred;
- whether build/package succeeded;
- artifact link or artifact pending;
- next step.

### Interruption recovery

If a user interrupts during an unfinished package:

```text
1. Record the interrupt exactly.
2. Do not discard the previous active task.
3. Decide whether to:
   A) finish current package first;
   B) merge new instruction into current package;
   C) defer current package and start new one.
4. Record the decision in ACTIVE_WORK_STATE and INTERRUPTION_RECOVERY_QUEUE.
5. Continue only after the decision is recorded.
```

## Trust rule

If a full exact assistant response cannot be captured inside the artifact because it is written after packaging, the artifact must at least contain:
- exact user message;
- assistant action summary;
- final-response intention;
- package result;
- next-step state.

The chat itself then contains the exact final answer.

## Future ideal

When possible, each package should include:

```text
exact_user_text
assistant_action_summary
assistant_final_response_summary
active_task_before_message
active_task_after_message
files_changed
validation_result
artifact_name
next_step
```

## Non-negotiable

The assistant must not rely only on chat memory.

The repository/archive must become the durable memory system.
