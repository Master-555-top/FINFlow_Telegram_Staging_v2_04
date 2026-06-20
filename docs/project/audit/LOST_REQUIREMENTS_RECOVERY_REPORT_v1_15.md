# Lost Requirements Recovery Report

Version: v1.15  
Updated: 2026-06-15 07:35

## Purpose

This report lists requirements that are easy to lose because they were mentioned casually, inside previous conversations, or across many files.

## Recovered / reinforced requirements

### 1. Meetings frequency

Recovered:
- Average meetings with girlfriend: 5 times/week.

Earlier wrong assumption:
- 2–3/week.

Status:
Corrected in v1.11+.

### 2. Meetings money buffer

Recovered:
- Usually keep 2,000–3,000 ₽ available for meetings.

Status:
Added to Meetings Fund spec.

### 3. Response integrity

Recovered:
- Important answers must say whether anything was lost/deleted/changed.

Status:
Added in v1.14.

### 4. Imported project conversations

Recovered:
- Previous project files and old conversations must be part of project memory.

Status:
Added in v1.13.

### 5. Current-time realism

Recovered:
- FinFlow must use current time and remaining realistic work hours.

Status:
Added in Real-Time Allocation and Daily Planner specs.

### 6. Live orders today

Recovered:
- App must track how many orders were already done today and how much gross is already made.

Status:
Added in Live Shift Progress spec.

### 7. Exact allocation recommendations

Recovered:
- App must recommend exact amounts and destinations, not just totals.

Status:
Added in Money Allocation Recommendation Engine spec.

### 8. Smart allocation, not equal distribution

Recovered:
- Sometimes concentrate money into urgent/critical goals instead of splitting evenly.

Status:
Added in Funds/Allocation docs.

### 9. Car maintenance intelligence

Recovered:
- Oil overdue, future interval 5–6k km, car burns oil, chassis needs repair planning.

Status:
Added in Taxi Vehicle Cost Model and Master Index.

### 10. Raw data protection

Recovered:
- `private_raw_data` never goes to GitHub/cloud/public storage.

Status:
Added across security/protocol docs.

## Still pending / needs deeper source audit

### Shared ChatGPT link

Status:
pending_full_extraction.

Risk:
May contain additional ideas/decisions not yet extracted.

### Full line-by-line audit of all uploaded raw text

Status:
Partial/indexed/covered at spec level.

Risk:
There may be small tactical ideas inside old text files that are not yet mapped one-by-one.

Recommended next action:
Create a separate source inventory and mark every source as:
- indexed;
- partially reviewed;
- fully reviewed;
- approved into master spec.

## Current recovery status

Major known core requirements are preserved in v1.15.

The main remaining risk is hidden detail inside old imported text or inaccessible shared chat.
