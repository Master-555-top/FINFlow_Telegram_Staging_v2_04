# v1.56 — Built-in AI Assistant Core

## Goal

FINFlow needs an embedded assistant that works as a daily dispatcher, not just a generic chatbot.

## Assistant roles

- Daily dispatcher: what to do next today.
- Financial controller: check clean income, free money, obligations, funds.
- Taxi work advisor: orders/gross/net/Drivee/fuel.
- Risk guard: impossible plan, negative free money, critical shortage.
- Car/work protection: fuel, Drivee, maintenance direction.
- Future AI bridge: OpenAI/n8n server-side only.

## v1.56 implementation

Added local rule-based assistant core:

```text
src/lib/assistant/finflowAssistantCore.ts
```

Displayed in:

```text
DailyQuickInputPanel
```

## Why local first

The assistant can already produce useful deterministic advice from Day Core without exposing API keys.

External AI will be added later only through server-side routes.
