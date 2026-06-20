# Security Scan — v1.92

The full master private package intentionally contains private vault data.

Working app rules:
- `finflow_app` can be developed/tested/deployed.
- `private_vault` must not be deployed or committed to a public repo.
- Telegram session client bridge does not expose bot token; verification remains server-side.
- No automatic cloud writes were added.
