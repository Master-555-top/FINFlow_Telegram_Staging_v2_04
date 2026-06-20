# CODE CHANGE PROTOCOL — FinFlow v3.0

## Rule
Do not rewrite the app each time. Make local, controlled changes.

## Before changing code
Answer:
1. What feature/change is being made?
2. Which module does it belong to?
3. Which files are allowed to change?
4. Which existing functions must not break?
5. What is the test checklist?

## During change
- Change the smallest practical set of files.
- Do not delete unrelated code.
- Do not rename architecture casually.
- Do not replace working components unless needed.
- Keep mock data if it is needed for testing.
- Keep error log and live time working.

## After change
Run/check:
- app starts;
- no hydration error;
- dashboard renders;
- live time works;
- error log works;
- changed feature works;
- older visible features still work;
- docs/changelog updated if needed.

## Codex/Cursor prompt rule
Every coding prompt should include:
"Do not rewrite the project. Preserve existing features. Make only the requested local changes. Show changed files and run/check the app."

## v1.8 Addition — local incremental changes only

All future code work must be incremental. Do not recreate files, components, routes, or architecture from scratch unless the task is explicitly a planned migration/rebuild. New features must be integrated into the existing system with minimal local edits and anti-regression checks.

Every Codex/Cursor prompt must include:

- preserve existing features;
- change only necessary files;
- do not remove docs/project memory/protocol files;
- show diff/changed files;
- run checks or provide verification steps;
- keep `private_raw_data` out of GitHub/cloud/deploy.
