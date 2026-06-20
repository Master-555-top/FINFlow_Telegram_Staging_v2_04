# Security Scan — v1.25

## Result

No raw private data is rendered in the new action layer.

## Protected data

The following must remain private and must not be uploaded to GitHub/cloud/public storage:

- `private_raw_data/`
- bank PDFs
- raw CSV exports
- source chat exports
- `.env` files
- tokens and keys
- unredacted personal data

## v1.25 safety properties

- Audit events use notes, not raw sensitive excerpts.
- Sensitive candidates cannot be approved by the demo action layer.
- Approved candidates still need safe status, known entity and day link before they can affect Day Core.
