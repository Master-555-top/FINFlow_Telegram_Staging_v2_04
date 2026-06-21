# 08 — Context Source Map

## Source 01 — current chat text

Status:
- processed in earlier project context
- informs current requirements

## Source 02 — combined transcript

Status:
- processed/accepted
- used for master requirements

## Source 03 — bank statement PDF

Status:
- candidate transaction extraction only
- not final accounting
- must not be blindly imported

Safe aggregates previously recorded:
- available balance as of statement page 1
- transaction candidates
- incoming/outgoing candidate totals

## Source 04 — empty/truncated RAR

Status:
- ignored because runtime copy was incomplete/truncated

## Source 05 — context archive

Status:
- extracted and reviewed
- semantic review created
- used to strengthen requirements

## Current development packages

v1.29 through v1.38 established:
- net calculation
- quick input
- history
- analytics
- editable data
- allocation
- editable funds/obligations

## v1.39

Adds:
- explicit context preservation system
- mandatory future context update protocol

## v1.40 source recheck

SOURCE_01 raw chat text:
- present in `private_raw_data/source_intake/SOURCE_01_current_chat_text.txt`
- SHA-256: `2cb334ced3089b1dd4809037cc55a197bdf644656c6cf2b81d04783d6c554804`

SOURCE_05 7z archive:
- present in `private_raw_data/source_intake/SOURCE_05_context_archive_original.7z`
- SHA-256: `03d7c4b861a57c12d39983a0ffad3285b1f1f4b72308fe702213180c31cb2edc`
- existing extraction and semantic reports rechecked:
  - `SOURCE_REVIEW_05_CONTEXT_ARCHIVE.md`
  - `SOURCE_REVIEW_05_SEMANTIC_REVIEW.md`
  - `SOURCE05_FILE_INVENTORY.csv`
  - `SOURCE05_SEMANTIC_REQUIREMENTS_MATRIX.csv`
  - `SOURCE05_REDACTED_KEY_EXCERPTS.md`
