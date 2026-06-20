# Source Review 05 — Context Archive `Все файлы с контекстами для проекта(2).7z`

Version: v1.22 draft  
Updated: 2026-06-17 15:10

## 1. Result

The archive was successfully opened and extracted with Python `py7zr`.

This is the first successful processing of the real context archive after the earlier broken 24-byte RAR issue.

## 2. Archive identity

- Source number: 05
- Archive: `Все файлы с контекстами для проекта(2).7z`
- Size: 3,928,424 bytes
- SHA-256: `03d7c4b861a57c12d39983a0ffad3285b1f1f4b72308fe702213180c31cb2edc`
- Archive type: 7-Zip
- Extracted root: `/mnt/data/source05_context_archive_extracted/Users/gta55/Desktop/Новая папка`
- Extracted files: 44

Important duplicate check:

- `Все файлы с контекстами для проекта.7z`
- `Все файлы с контекстами для проекта(1).7z`
- `Все файлы с контекстами для проекта(2).7z`

All three 7z archives have the same size and SHA-256 in this runtime. Therefore `(2).7z` is not a different data set; it is an identical copy of the same context package.

## 3. Content overview

Category counts:

```json
{
  "screenshot_or_image": 3,
  "other": 4,
  "context_document": 26,
  "app_or_config": 10,
  "bank_or_pdf_document": 1
}
```

Extension counts:

```json
{
  ".png": 3,
  "[no_ext]": 4,
  ".md": 11,
  ".json": 7,
  ".example": 1,
  ".html": 1,
  ".ts": 1,
  ".txt": 14,
  ".docx": 1,
  ".pdf": 1
}
```

The archive contains:

- FinFlow project docs: README, project memory, decisions, changelog, requirements, import/editing/integrity specs.
- A static/app snapshot: `index.html`, `package.json`, `package-lock.json`, Next/Vercel/TS config and build manifests.
- Large text exports: Telegram/spending/taxi/chat context files.
- Visual evidence/screenshots: PNG files.
- One PDF bank/person document.
- One DOCX with the active/current chat text.

## 4. Most important project files

### Canonical project docs

- `README.md` — FinFlow v2.4/v2.5 Golden UI Core, startup notes, Supabase, AI, historical import.
- `PROJECT_MEMORY.md` — concise project memory: FinFlow as daily operating system; Day Core; Time Core; money rules.
- `DECISIONS.md` — locked decisions: keep UI Safe, Day Core, no physical deletion, Time Core, deadlines, AI card answers.
- `REGRESSION_CHECKLIST.md` — anti-regression checklist.
- `IMPORT_PLAN.md` and `FULL_EDITING_SPEC.md` — historical import and full editing rules.
- `INTEGRITY_AUDIT.md` and `FEATURE_MAP.md` — coverage and structure control.

### Important raw context files

- `Вставленный текст(3).txt` — Indriver / taxi history and goals.
- `Вставленный текст(4).txt`, `Вставленный текст(5).txt`, `Вставленный текст(13).txt` — spending logs.
- `Вставленный текст(14).txt` — broader taxi/income analytics and historical income context.
- `Вставленный текст(15).txt` — financial model: 8,500 net/day, 11,000 gross/day, weekly model, funds philosophy.
- `Вставленный текст(12).txt` — AI project development protocol: do not recreate project from scratch; preserve working decisions.
- `Вставленный текст (2).txt` — broad Telegram/export data and older personal context.
- `Вставленный текст(6)-(11).txt` — previous chat/project context, including possible technical/secrets-sensitive material.

## 5. High-value requirements confirmed

Source 05 confirms these existing project rules and should not override them:

1. FinFlow is not a simple expense tracker. It is a daily operating system for money, work, funds, time, sleep, AI decisions, and growth.
2. Day Core is central: sleep → shift → income → expenses → net → funds → goals → tomorrow.
3. Time Core must be visible and available to AI: date, weekday, current time, day part.
4. UI must remain v2.0 UI Safe: dark purple/blue glass, readable, no white overlay, no gray alien blocks, safe-area mobile rules.
5. Money constants remain: 8,500₽ net/day, 11,000₽ gross/day, 59,500₽ net/week, 212,500₽ net/month.
6. Obligations: 45,000₽ to car by each 6th; 15,000₽ to bank/bankruptcy by each 15th.
7. Historical data must be imported through a review queue, not blindly trusted.
8. Data must be fully editable, restorable, soft-deleted, audited, and exportable.
9. AI must receive context and learn from corrections.
10. Development must be incremental and anti-regression-first.

## 6. Security and privacy notes

The archive contains sensitive personal/project material:

- bank/person PDF;
- exported chats;
- raw spending and taxi logs;
- `.env`/environment-style file;
- possible token/database/secret references inside pasted technical texts.

Do not upload raw extracted archive, `private_raw_data`, bank PDFs, `.env`, or raw chat exports to GitHub/cloud/public repositories.

Any real exposed token or connection string must be rotated before deployment.

## 7. Integration decision

Source 05 is useful and valid, but it should be treated as a **context intake source**, not as a replacement for the latest working package.

Current integration rule:

```text
Latest working package v1.21 / current FinFlow source state
+ Source 05 context archive
= v1.22 context-integrated project state
```

The app/code should not be overwritten by Source 05 without comparison, because Source 05 includes an older/static project snapshot and raw context exports.

## 8. Next work

Recommended next session/actions:

1. Parse text exports into structured source reviews by file group.
2. Convert spending and Indriver logs into import candidates.
3. Update canonical project memory and locked decisions from Source 05 without duplicating old content.
4. Compare Source 05 app snapshot against the latest actual code package before any code replacement.
5. Start/continue Day Core implementation only after context intake is locked.

## 9. Integrity

- Nothing deleted.
- Archive successfully extracted.
- Raw archive preserved.
- v1.21 remains the latest working project package baseline.
- Source 05 is now processed at extraction/inventory level.
- Deeper semantic parsing of each text export remains pending.
