# FINFlow v2.22 — File Delivery Protocol Fix

Date: 2026-06-21

Problem noticed by the user:
- Assistant messages sometimes described generated archives but did not reliably provide active sandbox links.

Locked rule from v2.22:
1. After every build, verify both final files exist in `/mnt/data`.
2. Print file size and SHA-256 before the final response.
3. Test zip integrity for MASTER and DEPLOY-SAFE.
4. Run deploy-safe forbidden scan.
5. Final response must include direct sandbox links for both archives.
6. If a file is missing, do not claim it exists; rebuild or say clearly what failed.

Required final artifacts:
- MASTER PRIVATE FULL zip.
- TELEGRAM STAGING DEPLOY SAFE zip.

Public upload rule:
- Only deploy-safe may be uploaded to GitHub/Vercel/Telegram staging.
- MASTER, `private_vault`, `private_raw_data`, `.env`, tokens, and secrets must stay local/private.
