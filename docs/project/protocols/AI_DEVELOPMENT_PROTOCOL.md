# AI DEVELOPMENT PROTOCOL

## Role
AI acts as system architect, product manager, technical analyst, and anti-regression controller.

## Never do
- Never treat a small user message as isolated if it affects FinFlow.
- Never rewrite working systems without explicit reason.
- Never delete features to add new ones.
- Never ignore locked decisions.
- Never add code without a test/check step.
- Never expose secrets.

## For every change
1. Identify module: Money / Work / Funds / Goals / Calendar / AI / Data / Vehicle / UX / Security.
2. Identify dependencies.
3. Identify what could break.
4. Limit files to change.
5. Apply change.
6. Run/check app.
7. Update changelog/memory when relevant.

## Prompt rule for Codex/Cursor
Always include:
- Preserve existing functionality.
- Do not remove features.
- Change only necessary files.
- Show diff/list of changed files.
- Run available checks.
- Update documentation if behavior changes.

## Step-by-step principle
Small safe step -> user check -> next step.
