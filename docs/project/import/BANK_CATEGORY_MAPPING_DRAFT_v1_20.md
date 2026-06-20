# Bank Category Mapping Draft

Version: v1.20  
Updated: 2026-06-17 11:39

## Purpose

Draft merchant/category rules for T-Bank statement import.

## Mapping draft

| Pattern | Suggested category | Notes |
|---|---|---|
| Drivee | work_platform_commission | Usually taxi platform/commission top-up |
| AZS / АЗС / FILIAL AZS / Magistral / GAZ North | work_fuel | Fuel/work cost |
| AVTOPILOT / STO / MEKHANICHESKIY MIR / AVTO-STOP | vehicle_parts_service | Car/repair/parts |
| SHAMSA / SEMEJNAYA KORZINKA / PEREKRESTOK / SUPERMARKET / MINIMARKET | food_products | Products/groceries |
| BARAKAT / DONER / KEBAB / KAFE / LAVASH / DURUM / CRAZYKAMCHIKEN | food_cafe | Cafe/fast food |
| YOTA | communication | Mobile/internet |
| T-Bank service fees | bank_services | Fees/subscriptions |
| FUNPAY / CYBER PANDA | entertainment_games | Games/entertainment |
| CALZEDONIA / clothes shops | shopping_gifts_clothes | Needs review; can be relationship/gift/personal |
| External phone transfer | person_to_person | Always review |
| Internal contract transfer | internal_transfer_or_fund | Always review |
| Popolnenie / cash deposit / transfer from own contract | money_movement_or_income | Do not auto-count as income |

## Current extraction totals by category

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

## Important

These are suggestions only. Production import requires review queue confirmation.
