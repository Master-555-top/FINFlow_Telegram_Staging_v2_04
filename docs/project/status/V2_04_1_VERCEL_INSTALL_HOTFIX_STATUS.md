# v2.04.1 — Vercel Install Hotfix Status

Reason: first Vercel staging deployment failed during `npm ci --ignore-scripts`.

Root cause: the deploy-safe package included a lockfile generated in an internal build environment. Vercel cannot use internal package mirror URLs, and `npm ci` is too strict for this staging package.

Fix:
- removed deploy package `package-lock.json`;
- set Vercel install command to `npm install --ignore-scripts --no-audit`;
- added `.npmrc` forcing `registry=https://registry.npmjs.org/`;
- pinned public npm-compatible dependency versions;
- kept private_vault/private_raw_data out of deploy-safe package.

No product logic was rewritten. Telegram device-test flow v2.04 is preserved.
