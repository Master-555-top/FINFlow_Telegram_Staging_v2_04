# v1.43 — Template and Bank Source Recheck

## User request

The user asked to continue and recheck:
- how he said he would fill orders;
- how he would fill expenses;
- how funds fit this;
- what is the status of the bank file.

## Template direction check

The current direction is correct:

```text
Orders / income / fuel / expenses = editable records.
Funds / obligations = editable planning targets.
Analytics / clean income / allocation = derived, not manually edited.
```

## How the user should fill daily data

### Taxi orders

Best daily input:

```text
Each taxi order = separate `taxi_order` record when possible.
```

Why:
- better daily history;
- better order count;
- later can support time/zone/route;
- avoids one vague aggregate.

Fast option:
- use templates `Заказ 300`, `Заказ 500`, `Заказ 700`, `Заказ 1000`;
- or create custom templates for common order sizes.

### Fuel

Fuel should be a `fuel` record.

Examples:
- `Заправка 500`
- `Заправка 1500`
- custom `Заправка 2000`

Fuel affects clean shift income.

### Drivee / platform commission

Current clean formula uses a Drivee percentage rate.

Drivee top-up template exists as an expense-type template, but final production logic should distinguish:
- Drivee commission calculated from gross;
- Drivee balance top-up as cashflow/payment to platform.

This is an important future refinement.

### Expenses

Expenses should be separate `expense` records:
- food;
- products;
- car;
- meeting/girlfriend;
- oil;
- repairs;
- other.

### Funds

Funds are not the same as expenses.

Funds are planning targets:
- working fund;
- car repair;
- safety cushion;
- girlfriend-related fund;
- relocation;
- obligations.

Daily allocation recommends how much to move into each fund after clean/free money is calculated.

## Bank file status

Bank statement source review says:

- Bank: T-Bank
- Period: 01.12.2025–06.06.2026
- Pages: 105
- Transactions extracted: 2766
- Income/replenishment rows: 1135
- Expense/outgoing rows: 1631
- Processing status: extracted_to_candidates
- Statement totals matched extracted totals:
  - incoming: 1,486,492.27 ₽
  - outgoing: -1,484,097.64 ₽

Redacted candidate CSV exists:

```text
docs/project/import/normalized/BANK_TRANSACTION_CANDIDATES_REVIEW_REDACTED_v1_20.csv
```

Rows counted in v1.43 recheck: 2766

## Bank file rule

The bank file must not be automatically imported as final truth.

Correct pipeline:

```text
Bank PDF → extracted candidates → redacted review queue → manual approval/category correction → import into records/funds/history
```

## Suggested bank import mapping later

| Bank suggested category | FINFlow target |
|---|---|
| work_fuel | fuel record |
| work_platform_commission | Drivee/platform cost review |
| food_cafe | expense: food |
| food_products | expense: products |
| vehicle_parts_service | expense: car |
| entertainment_games | expense: entertainment/flexible |
| leisure_relationship | expense/fund: meeting/girlfriend |
| internal_transfer_or_fund | review; maybe fund movement |
| person_to_person | review; never auto-classify |
| income_or_transfer | review; maybe income or transfer |

## Current conclusion

The template structure is moving correctly, but the next improvements should be:

1. Custom templates — implemented in v1.43.
2. Better Drivee distinction: commission vs top-up.
3. Bank candidate review UI connected to records.
4. Category settings and record-to-fund mapping.
