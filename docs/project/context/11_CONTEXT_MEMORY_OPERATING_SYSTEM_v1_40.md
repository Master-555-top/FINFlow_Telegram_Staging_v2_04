# 11 — Context Memory Operating System v1.40

## Mandatory operating cycle

Every future assistant development turn must follow this cycle:

```text
1. Read context index.
2. Read requirement ledger.
3. Read current state.
4. Read protocols.
5. Check latest changelog and version.
6. Interpret user message as an addition to the existing system.
7. Implement smallest safe step.
8. Run validation.
9. Update context files.
10. Update changelog/current state/project memory.
11. Package artifact.
12. Tell user what changed and what remains.
```

## Pre-edit checklist

Before code changes:

- [ ] Did I check `docs/project/context/02_USER_REQUIREMENTS_LEDGER.md`?
- [ ] Did I check `docs/project/context/04_CONTEXT_UPDATE_PROTOCOL.md`?
- [ ] Did I check `docs/project/context/05_LIVE_REALITY_REGISTER.md`?
- [ ] Did I check `docs/project/context/07_NEXT_STEP_GUARDRAILS.md`?
- [ ] Did I check `docs/project/protocols/CONTEXT_AWARE_RESPONSE_PROTOCOL.md`?
- [ ] Did I check `docs/project/protocols/RESPONSE_INTEGRITY_AND_CONTEXT_CHECK_PROTOCOL.md`?
- [ ] Did I check `CHANGELOG_LATEST.md`?
- [ ] Did I check `docs/project/state/CURRENT_STATE.md`?

## Post-edit checklist

After code changes:

- [ ] User message logged.
- [ ] Assistant action logged.
- [ ] New requirement added if needed.
- [ ] Live/demo status updated if changed.
- [ ] Decision log updated.
- [ ] Security scan updated.
- [ ] Regression check updated.
- [ ] Build report updated.
- [ ] Manifest created.
- [ ] ZIP packaged.

## Memory rule

The assistant may not rely on vague memory when relevant project files exist.

The project files are the source of truth for:
- locked decisions;
- active requirements;
- current live/demo status;
- protocols;
- next-step guardrails;
- user corrections.

## Loss prevention

If a future feature seems to conflict with an old requirement:
- do not overwrite silently;
- record the conflict;
- preserve both until the user decides;
- prefer additive changes.
