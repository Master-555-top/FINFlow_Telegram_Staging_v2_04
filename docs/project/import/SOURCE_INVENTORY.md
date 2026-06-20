# Source Inventory

Version: v1.18  
Updated: 2026-06-17 11:28

## Purpose

Tracks every source file/chat/import used to build canonical FinFlow memory.

## Sources

| ID | Source | Type | Privacy | Status | Notes |
|---|---|---|---|---|---|
| SOURCE_01 | `Вставленный текст(16).txt` | current chat text | PRIVATE_CONTEXT / PROJECT_INTERNAL | reviewed_v1.18 | Contains current chat/source segment, file upload list, FinFlow final concept, v1.15/v1.16/v1.17 decisions. Raw copy stored in `private_raw_data/source_intake/`. |
| SOURCE_02 | all user messages text | user-message extract | pending | waiting_for_upload | Higher priority than assistant interpretation. |
| SOURCE_03 | all assistant messages text | assistant-message extract | pending | waiting_for_upload | Used for commitments/accountability. |
| SOURCE_04 | bank document | bank PDF | PRIVATE_FINANCIAL / THIRD_PARTY_PERSONAL | pending_review | Must remain private. |
| SOURCE_05 | previous chats / Telegram channels | historical project/finance sources | mixed/private | waiting_for_upload | Process one by one. |
| EXT_01 | ChatGPT share link `6a2c2a25-1b00-83eb-932a-90dcd35cdd86` | external previous chat | pending | pending_full_extraction | Browser view did not expose full content. |

## Current next source

`SOURCE_02 — all user messages as text document`.

## Source 03 — Bank statement PDF

- Status: processed
- Source type: bank_pdf
- Privacy: PRIVATE_FINANCIAL + THIRD_PARTY_PERSONAL
- Period: 01.12.2025-06.06.2026
- Pages: 105
- Extracted transaction candidates: 2766
- Review file: `docs/project/import/source_reviews/SOURCE_REVIEW_03_BANK_STATEMENT.md`
- Raw private copy: `private_raw_data/source_intake/SOURCE_03_bank_statement_tbank.pdf`
- Redacted candidates: `docs/project/import/normalized/BANK_TRANSACTION_CANDIDATES_REVIEW_REDACTED_v1_20.csv`

## Source 04 — `Все файлы.rar`

- Status: processed_empty_archive
- Size: 24 bytes
- SHA-256: `4301ec2e9592e7a22262d1c046954545033b73be322b33a8117d201556c4254b`
- RAR5 signature: yes
- Extractable files: 0
- Review file: `docs/project/import/source_reviews/SOURCE_REVIEW_04_ALL_FILES_RAR.md`
- Private copy: `private_raw_data/source_intake/SOURCE_04_all_files_archive_original.rar`
- Conclusion: the uploaded archive contains no files. Do not retry extraction unless a new archive is uploaded.

## Source 05 — context archive

- Archive: `Все файлы с контекстами для проекта(2).7z`
- Status: extraction_inventory_completed
- Size: 3928424 bytes
- SHA-256: `03d7c4b861a57c12d39983a0ffad3285b1f1f4b72308fe702213180c31cb2edc`
- Files extracted: 44
- Review: `docs/project/import/source_reviews/SOURCE_REVIEW_05_CONTEXT_ARCHIVE.md`
- Inventory: `docs/project/import/reports/SOURCE05_FILE_INVENTORY.csv`
- Keyword scan: `docs/project/import/reports/SOURCE05_KEYWORD_SCAN.json`
- Private raw copy: `private_raw_data/source_intake/SOURCE_05_context_archive_original.7z`
- Integration decision: useful source, but not a code replacement without comparison.
