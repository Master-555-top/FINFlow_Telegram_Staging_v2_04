# Source Review 03 - Bank Statement

Version: v1.20  
Updated: 2026-06-17 11:39

## 1. Source identity

- Source number: 03
- Source filename: `Чаплыгин Дмитрий Сергеевич Copy.pdf`
- Canonical private copy: `private_raw_data/source_intake/SOURCE_03_bank_statement_tbank.pdf`
- Source type: bank PDF statement
- Bank: T-Bank
- Period in statement: 01.12.2025-06.06.2026
- Pages: 105
- Privacy class: `PRIVATE_FINANCIAL + THIRD_PARTY_PERSONAL`
- Processing status: extracted_to_candidates

## 2. Extraction status

- Parsed text extraction: successful
- Transactions extracted: 2766
- Income/replenishment rows: 1135
- Expense/outgoing rows: 1631
- Statement totals matched extracted totals:
  - incoming: 1,486,492.27 ₽
  - outgoing: -1,484,097.64 ₽

Important:
This is not final accounting yet. Transfers and replenishments can be internal money movements, taxi cash conversion, fund movements, support payments, or real income. They must be reviewed before production import.

## 3. Files created

Private:
- `private_raw_data/source_intake/SOURCE_03_bank_statement_tbank.pdf`
- `private_raw_data/source_intake/SOURCE_03_bank_transactions_raw_private.csv`

Project-safe/redacted:
- `docs/project/import/normalized/BANK_TRANSACTION_CANDIDATES_REVIEW_REDACTED_v1_20.csv`
- `docs/project/import/reports/BANK_STATEMENT_EXTRACTION_SUMMARY_v1_20.json`

## 4. Main contents

The bank statement contains dated operations with:
- operation date/time;
- posting date/time;
- amount;
- description;
- card last digits;
- incoming/replenishment operations;
- purchases;
- Drivee payments;
- fuel payments;
- car service/parts payments;
- transfers;
- mobile/service fees;
- food/cafe/product spending;
- entertainment/gaming;
- person-to-person transfers.

## 5. Suggested category summary

| Suggested category | Count | Candidate sum |
|---|---:|---:|
| person_to_person | 128 | -399 718.00 ₽ |
| other | 411 | -347 127.58 ₽ |
| internal_transfer_or_fund | 119 | -300 025.39 ₽ |
| work_fuel | 183 | -154 383.60 ₽ |
| food_cafe | 226 | -98 160.02 ₽ |
| work_platform_commission | 316 | -67 024.00 ₽ |
| food_products | 144 | -57 021.82 ₽ |
| entertainment_games | 54 | -22 478.23 ₽ |
| vehicle_parts_service | 19 | -18 050.00 ₽ |
| communication | 10 | -8 868.00 ₽ |
| leisure_relationship | 7 | -4 537.00 ₽ |
| shopping_gifts_clothes | 2 | -4 398.00 ₽ |
| bank_services | 11 | -1 506.00 ₽ |
| government_services | 1 | -800.00 ₽ |
| taxi_or_platform_income | 1 | 198.00 ₽ |
| income_or_transfer | 15 | 9 353.76 ₽ |
| money_movement_or_income | 1119 | 1 476 940.51 ₽ |

## 6. Month summary

| Month | Incoming rows | Incoming candidate total | Outgoing rows | Outgoing candidate total |
|---|---:|---:|---:|---:|
| 12.2025 | 3 | 14 131.32 ₽ | 12 | -5 438.69 ₽ |
| 01.2026 | 154 | 295 501.22 ₽ | 341 | -301 622.83 ₽ |
| 02.2026 | 220 | 217 623.41 ₽ | 340 | -219 300.11 ₽ |
| 03.2026 | 245 | 310 232.08 ₽ | 304 | -309 963.00 ₽ |
| 04.2026 | 273 | 383 121.27 ₽ | 292 | -383 773.88 ₽ |
| 05.2026 | 215 | 246 929.97 ₽ | 296 | -240 473.32 ₽ |
| 06.2026 | 25 | 18 953.00 ₽ | 46 | -23 525.81 ₽ |

## 7. Requirements found for FinFlow

### Bank import is mandatory

FinFlow must support bank statement import as a separate source type.

### Review Queue is mandatory

Bank transactions must not be imported directly into production categories. They go through:

```text
raw_bank_pdf
-> extracted_transactions
-> normalized_candidates
-> review_queue
-> user_confirmed_records
-> production tables
```

### Transfer handling is critical

Incoming replenishments and internal transfers must not be blindly counted as income.

Outgoing internal/person transfers must not be blindly counted as expenses.

### Category rules are needed

FinFlow needs merchant/category mapping:
- Drivee -> work platform commission;
- AZS/fuel merchants -> work fuel;
- vehicle shops/STO -> vehicle service/parts;
- supermarkets/minimarkets -> products;
- cafes/fast food -> food/cafe;
- Yota -> communications;
- bank fees -> bank services;
- FunPay/Cyber Panda -> entertainment/games;
- person transfers -> review;
- internal transfers -> review/fund movement.

## 8. App mechanics found

The bank import supports these future modules:
- Money Core;
- Import Center;
- Category Mapping;
- Review Queue;
- Funds;
- Taxi Cost Model;
- Daily Money Planner;
- AI Memory;
- Export/Backup;
- bank-vs-Telegram reconciliation.

## 9. Contradictions / risks

No direct contradiction with the current system.

Risks:
- If all incoming card replenishments are counted as income, income will be inflated.
- If all internal transfers are counted as expenses, expenses will be inflated.
- Person-to-person transfers may be girlfriend/family/debt/work/funds and require manual mapping.
- Merchant-based categorization is useful but imperfect.

## 10. Canonical decision

Bank statement import is a candidate extraction source, not final truth.

The production app must require review/confirmation for ambiguous transactions.

## 11. Integrity check

- Nothing deleted.
- Current v1.16 code preserved.
- v1.19 source intake protocols remain active.
- Bank PDF placed only in `private_raw_data`.
- Redacted candidate CSV created for project-safe review.
- Sensitive raw descriptions remain private.
