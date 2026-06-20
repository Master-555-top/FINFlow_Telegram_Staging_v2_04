# Day Core Import Application Rules — v1.25

## Core principle

Day Core remains the center of FinFlow, but imported historical data must pass through review before it changes a day.

## Candidate application stages

1. Raw source exists in `private_raw_data` or redacted normalized reports.
2. Import parser creates `ImportCandidate`.
3. User or AI reviews candidate.
4. Review action creates audit event.
5. Candidate can be attached to a day.
6. Only approved, non-sensitive, known-entity candidates can affect Day Core.

## What can affect Day Core

- confirmed income;
- confirmed expense;
- confirmed taxi shift;
- confirmed taxi order;
- confirmed day note.

## What should not directly affect Day Core

- unverified bank transfers;
- rough goals from old chat messages;
- estimated taxi targets;
- duplicated expenses;
- sensitive raw bank rows;
- ambiguous text fragments;
- project ideas that are not factual daily records.

## Why this matters

FinFlow needs realistic calculations: current money, gross taxi target, net result, fuel, commission, food, meeting fund, obligations, funds, car repairs and temporary mini-goals. If old data enters the system without review, the daily plan can become wrong.
