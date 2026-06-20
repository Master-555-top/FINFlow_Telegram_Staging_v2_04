# Bank Import & Review Queue Spec

Version: v1.20  
Updated: 2026-06-17 11:39

## Purpose

Define how FinFlow imports bank statements without corrupting real accounting.

## Source

Bank statement PDF, period 01.12.2025-06.06.2026.

## Core principle

Bank records are evidence, not final categories.

The app must never blindly convert every bank row into a confirmed income or expense.

## Pipeline

```text
bank_pdf
-> text/table extraction
-> bank_transaction_candidate
-> merchant/category suggestion
-> duplicate detection
-> review queue
-> user confirmation
-> production income/expense/fund/transfer record
```

## Required tables/entities

### import_source

- id
- source_type = bank_pdf
- original_filename
- bank_name
- period_start
- period_end
- privacy_class
- checksum
- imported_at

### bank_transaction_candidate

- id
- import_source_id
- operation_date
- operation_time
- posting_date
- posting_time
- amount
- direction
- raw_description_private
- description_redacted
- card_last4
- movement_type
- suggested_category
- suggested_subcategory
- confidence
- review_status

### review_queue_item

- id
- candidate_id
- candidate_type
- suggested_action
- user_action
- final_entity_type
- final_category
- final_fund
- duplicate_of
- reviewed_at

## Movement types

- `expense`
- `expense_review`
- `candidate_income`
- `incoming_replenishment_review`
- `incoming_review`
- `transfer_out_review`

## Important review rules

### Incoming replenishments

Do not count automatically as income.

Can be:
- taxi cash deposited to card;
- money from another personal account;
- family transfer;
- refund;
- real income;
- temporary movement.

### Internal transfers

Do not count automatically as expenses.

Can be:
- fund movement;
- transfer between user's accounts;
- reserve;
- obligation account;
- duplicate of cash/card movement.

### Person-to-person transfers

Always require user review.

Can be:
- girlfriend/meeting;
- family;
- debt;
- car;
- work;
- gift;
- emergency;
- unknown.

### Drivee

Usually work/platform commission or operating cost.

### Fuel/AZS

Usually work fuel, but may need separation if not taxi work day.

### Car/STO/parts

Vehicle cost / car maintenance.

## UI requirements

Import Center must show:
- total rows extracted;
- rows by category suggestion;
- rows needing review;
- duplicates;
- unsafe auto-count warnings;
- button to approve category;
- button to mark as transfer/fund movement;
- button to split transaction;
- button to ignore;
- button to link with Telegram record.

## AI behavior

AI can suggest categories, but user confirmation is required for ambiguous rows.

AI should learn from confirmed mappings:
- merchant -> category;
- phone/person -> category/person/fund;
- internal contract -> fund/account;
- amount pattern -> likely meaning.

## Safety

Raw bank data belongs in `private_raw_data`.

Do not upload to GitHub/cloud/public archives.
