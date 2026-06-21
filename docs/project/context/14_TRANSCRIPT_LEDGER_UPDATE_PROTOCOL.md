# 14 — Transcript Ledger Update Protocol

Version: v1.46

## Mandatory step for every future package

Before final packaging, update:

```text
docs/project/context/13_FULL_CHAT_TRANSCRIPT_LEDGER.md
```

## Required entry format

Each new entry must include:

```text
### Entry vX.XX

Type:
- exact_user_text
- exact_assistant_final
- assistant_action_summary
- reconstructed_summary

Text or summary:
...

Implementation action:
...

Context impact:
...

Locked rule:
...
```

## Exactness rule

Use `exact_user_text` only when the exact current user message or source text is available.

Use `reconstructed_summary` when text is reconstructed from memory, source reviews or prior summaries.

## Assistant answer rule

Do not store hidden reasoning.

Store:
- final response summary;
- artifact created;
- files changed;
- validation result;
- next step.

## Safety rule

Never paste into the ledger:
- `.env`
- tokens
- API keys
- raw bank rows from private CSV
- raw private archive content
- private unredacted financial data
