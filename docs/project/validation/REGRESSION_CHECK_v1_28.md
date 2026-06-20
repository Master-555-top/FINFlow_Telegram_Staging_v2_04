# Regression Check — v1.28

## Scope

Persistent applied patch storage and rollback commands.

## Checks

- [x] v1.27 Apply-to-Day Core flow preserved.
- [x] Import Review Queue still requires approved candidates before Day Core changes.
- [x] Sensitive/high-risk candidates remain blocked from direct application.
- [x] Applied patch records are stored separately from import review candidates.
- [x] Rollback restores a previous Day Core snapshot.
- [x] Reset demo clears review queue and Day Core patch state.
- [x] private_raw_data is not rendered in UI.
- [x] raw bank/PDF/chat data is not imported blindly.
- [x] TypeScript passes.
- [x] Next build passes.
