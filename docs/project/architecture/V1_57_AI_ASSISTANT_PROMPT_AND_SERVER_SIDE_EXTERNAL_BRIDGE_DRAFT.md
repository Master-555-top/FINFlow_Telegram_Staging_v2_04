# v1.57 — AI Assistant Prompt & Server-side External AI Bridge Draft

## Goal

Prepare future OpenAI/n8n assistant integration safely.

## Added

- assistant prompt builder
- minimized external assistant payload
- server-side external bridge dry-run
- `/api/assistant/dry-run`
- UI note showing payload is ready, but external AI is not called

## Safety

No external AI call is made in v1.57.

External AI must be:
- server-side only;
- behind `FINFLOW_ENABLE_EXTERNAL_AI=true`;
- using minimized payload;
- without raw bank rows, private_raw_data, tokens or env values.

## Future providers

Draft supports status for:
- OpenAI
- n8n

But no real API call is implemented yet.
