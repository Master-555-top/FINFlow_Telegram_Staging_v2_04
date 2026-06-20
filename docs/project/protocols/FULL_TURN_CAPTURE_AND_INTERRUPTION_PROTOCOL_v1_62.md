# Full Turn Capture and Interruption Protocol — v1.62

## Required before work

1. Check context files.
2. Check active work state.
3. Check interruption recovery queue.
4. Check latest package version.
5. Record new exact user message.

## Required during work

1. Do not silently switch tasks.
2. If new user message interrupts, record it.
3. Preserve previous active task in queue if not completed.
4. Update active state before continuing.

## Required before final answer/package

1. Update transcript ledger.
2. Update operation ledger.
3. Update current state.
4. Update project memory.
5. Update changelog.
6. Run validation.
7. Package only after validation.

## Exactness limits

The artifact can store:
- exact user messages available before packaging;
- assistant action summaries;
- package results;
- intended final answer summary.

The final chat answer itself is visible in ChatGPT after the ZIP is created and should be treated as part of the external conversation record.
