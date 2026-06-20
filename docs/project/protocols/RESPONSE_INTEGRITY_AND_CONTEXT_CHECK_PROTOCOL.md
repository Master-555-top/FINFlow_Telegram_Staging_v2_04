# Response Integrity & Context Check Protocol

Version: v1.14  
Updated: 2026-06-15 04:32

## Purpose

The user repeatedly emphasized that the assistant must not answer FinFlow/project questions as isolated messages and must always verify whether anything was lost, deleted, contradicted, or forgotten.

This protocol makes that requirement mandatory for every meaningful FinFlow response.

## Mandatory answer footer/check

For every important FinFlow/project response, include a short integrity check:

```text
Проверка целостности:
- Ничего из прежнего не удаляем.
- Новое требование добавляется к текущей системе, не заменяет её.
- Затронутые файлы/модули: ...
- Что нужно обновить: ...
- Риск регрессии: ...
```

For coding steps, include:

```text
Проверка после шага:
□ приложение запускается
□ старые функции работают
□ данные не потеряны
□ документы/changelog обновлены
□ private_raw_data не загружен наружу
```

## Context rule

Before giving project guidance, the assistant must consider:

- current chat context;
- previous imported project conversations;
- uploaded files;
- `docs/project/memory/PROJECT_MEMORY.md`;
- `docs/project/protocols/LOCKED_DECISIONS.md`;
- `docs/project/protocols/CONTEXT_AWARE_RESPONSE_PROTOCOL.md`;
- `docs/project/protocols/ANTI_REGRESSION_CHECKLIST.md`;
- `docs/project/history/CHAT_TIMELINE_AND_DECISION_HISTORY.md`;
- `docs/project/audit/MASTER_REQUIREMENTS_INDEX.md`;
- `CHANGELOG_LATEST.md`;
- current archive version.

## No-loss rule

The assistant must explicitly avoid:

- deleting existing systems;
- replacing old decisions silently;
- rewriting code/docs from scratch without reason;
- ignoring historical files;
- ignoring old data;
- ignoring user corrections;
- answering from memory only when files exist.

## If a correction happens

When user corrects the assistant:

1. Acknowledge the correction.
2. Mark old value as obsolete in project docs if needed.
3. Update affected specs.
4. Update changelog.
5. State what changed and what did not change.
6. Preserve existing systems.

## Incremental rule

New ideas must be added harmoniously:

```text
existing system
+ new requirement
+ dependency check
+ local update
+ regression check
+ changelog
```

Not:

```text
new idea
→ rewrite everything
```

## Private raw data reminder

Before any GitHub/cloud/deploy/export step, remind:

`private_raw_data` must not be uploaded to GitHub, cloud, Vercel, Supabase Storage, or public archives.
