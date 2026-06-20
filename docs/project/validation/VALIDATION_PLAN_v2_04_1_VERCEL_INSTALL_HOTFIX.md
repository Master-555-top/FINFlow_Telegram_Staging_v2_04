# Validation Plan — v2.04.1

1. Upload deploy-safe hotfix package to private GitHub repository.
2. Commit and push changes.
3. Vercel should run `npm install --ignore-scripts --no-audit` instead of `npm ci --ignore-scripts`.
4. Confirm deployment reaches Ready state.
5. Open `/api/deployment/readiness`.
6. Open `/` and then Telegram Device Test panel from Telegram.
