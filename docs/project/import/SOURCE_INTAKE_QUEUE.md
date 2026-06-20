# Source Intake Queue

Version: v1.19  
Updated: 2026-06-17 11:30

## Status

The project is in Source Intake & Canonicalization phase before further app development.

## Process rule

Files are processed one at a time.

Each file receives:
- source review;
- privacy classification;
- requirement extraction;
- contradiction check;
- canonical project updates;
- changelog update;
- integrity check.

## Source 01 — current chat text

Status: processed  
File: `Вставленный текст(16).txt`  
Review:
`docs/project/import/source_reviews/SOURCE_REVIEW_01_CURRENT_CHAT_TEXT.md`

## Source 02 — combined transcript / mixed user + assistant messages

Status: waiting_for_upload

Important:
The user will not split user messages and assistant messages into separate files.

This is accepted.

Expected processing:
- identify user requirements;
- identify assistant commitments;
- identify corrections;
- identify mistakes/obsolete assumptions;
- extract app mechanics;
- update project memory and requirements.

Protocol:
`docs/project/import/COMBINED_TRANSCRIPT_PROCESSING_PROTOCOL.md`

## Source 03 — bank document

Status: waiting_for_upload_or_existing_review

Expected processing:
- privacy classification;
- transaction import model;
- category mapping;
- bank import review rules;
- do not expose sensitive details.

## Source 04 — previous chats and Telegram channel documents

Status: waiting_for_upload

Expected processing:
- old project decisions;
- Telegram finance/shift mechanics;
- historical data mapping;
- previous bugs/regressions;
- old architecture details;
- requirements not yet in master docs.

## Current app coding status

Current app code from v1.16 is preserved.
Coding is paused for source intake unless explicitly approved.

## Source 03 — bank document

Status: processed

Review:
`docs/project/import/source_reviews/SOURCE_REVIEW_03_BANK_STATEMENT.md`

Created:
- private raw PDF copy;
- private raw extracted CSV;
- redacted bank transaction candidate CSV;
- bank import/review spec;
- bank category mapping draft.

## v1.21 Source 04 status correction

Source 04 — `Все файлы.rar`

Status: processed_empty_archive

Result:
- File exists.
- Size: 24 bytes.
- RAR5 signature present.
- Python rarfile opened it successfully.
- File list is empty.
- Nothing can be extracted from this uploaded archive.

Action:
Do not keep trying to extract this same archive in future sessions. Move to standalone uploaded text/project files unless the user uploads a new non-empty archive.

## v1.22 — Source 05 processed: context archive

Source 05: `Все файлы с контекстами для проекта(2).7z`

Status: extraction_inventory_completed

Result:
- Archive exists and was successfully opened with Python py7zr.
- Size: 3928424 bytes.
- SHA-256: `03d7c4b861a57c12d39983a0ffad3285b1f1f4b72308fe702213180c31cb2edc`.
- Extracted files: 44.
- Root inside archive: `Users/gta55/Desktop/Новая папка`.
- All three 7z copies in runtime have the same hash, so `(2).7z` is an identical copy of the same source package.

Next:
- Do not replace current app code blindly from this source.
- Treat Source 05 as context intake + historical import source.
- Continue with semantic review of text logs and import candidate extraction.


<!-- v1.24 root mirror update -->


## SOURCE 05 semantic status
Status: semantic review completed in v1.23.

Next action:
- turn the semantic mapping into Import Review Queue schemas and UI.
- do not blind-import historical taxi, expense or bank records.


## v1.24 Intake Queue Status

Source 05 remains processed as context and requirements. It is not blindly imported as facts. Next import stage must use Import Review Queue candidates and manual confirmation before anything affects Day Core calculations.
