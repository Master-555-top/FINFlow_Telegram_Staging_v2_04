# FinFlow Chat Timeline & Decision History

Version: v1.11  
Updated: 2026-06-15 04:22

## Purpose

This file records the development history of FinFlow by dates/stages so the project does not depend only on chat memory.

It should be updated after every important conversation or project decision.

## Before June 2026 — background

### Taxi work and money context

The user works in taxi and values:
- freedom;
- no boss;
- flexible start/end;
- immediate money;
- direct control over income;
- driving;
- communication with people;
- ability to help parents and girlfriend.

Downsides identified:
- fuel;
- Drivee/platform commission;
- oil;
- parts;
- car wear;
- road/passenger risks;
- fatigue;
- health impact;
- difficulty saving because income arrives daily in smaller amounts.

Decision:
FinFlow must model taxi as a freedom/cashflow system, not just income tracking.

### Earlier bot / Telegram accounting stage

The user kept records in Telegram-style messages:
- income;
- shifts;
- expenses;
- funds;
- daily notes;
- work costs;
- goals;
- AI-style analysis prompts.

Decision:
Old data must become a source for future Import Center, not be discarded.

## 2026-06-03 — Taxi Income Bot specification stage

Key concept:
The system should answer:

> "Am I getting closer to financial goals and what blocks me from earning more?"

Core chain formed:

```text
Time → Income → Net money → Obligations → Funds → Stability → Growth
```

Taxi KPIs were repeatedly used:
- daily gross target: 11,000 ₽;
- daily net target: 8,500 ₽;
- weekly net target: 59,500 ₽;
- monthly target: 212,500 ₽;
- active KPI: 1,400 ₽/hour;
- full shift KPI: 1,100 ₽/hour.

Decision:
FinFlow must track not only money, but time, work efficiency, shifts, active time, idle time, zones, and weekly/monthly progress.

## 2026-06-11 — Mini App direction and UX

The project moved from command-based bot thinking toward Telegram Mini App.

Requirements:
- modern mobile interface;
- fewer commands;
- more buttons/cards;
- full editing;
- statistics in every section;
- Dashboard renamed/treated as "General Analytics";
- day/week/month/year filters;
- graph/calculator blocks;
- live history.

Decision:
FinFlow must be Mini App first, not a simple command bot.

## 2026-06-13 — Project protocol / AI development protocol

The user described the problem of AI projects drifting and breaking existing features.

Requirements:
- do not rewrite from scratch randomly;
- preserve existing systems;
- work cumulatively;
- maintain Master Spec, Locked Decisions, AI Development Protocol, Change Log;
- every new feature must be integrated, not destructive.

Decision:
FinFlow must use anti-regression and project-memory documents.

## 2026-06-14 — Current implementation review and Minecraft-mod lesson

Problem reinforced:
In another project, improvements broke existing systems.

Decision:
For FinFlow:
- improvements must not break old systems;
- every change needs dependency checks;
- use checklists;
- update docs/changelog;
- work step by step with user verification.

## 2026-06-15 — Full project reconstruction and file upload stage

The user uploaded many files:
- README/spec documents;
- current project files;
- pasted text histories;
- Telegram-like financial history;
- expense histories;
- income/shift histories;
- strategy notes;
- bank PDF;
- UI screenshots.

Important user instruction:
Do not analyze until all files are uploaded.

After upload completion, project was reframed as:

> FinFlow OS — personal operating system for money, taxi, time, goals, car, AI decisions, and growth.

## 2026-06-15 — Documents v0.1

Documents created:
- Master Project Specification;
- Locked Decisions;
- AI Development Protocol;
- Project Change Log.

Decision:
These documents become source of truth.

## 2026-06-15 — Rebuild decision

Based on current UI and hydration issues, decision made:

> Rebuild implementation from clean Foundation, not from scratch in meaning.

Meaning:
- keep all logic, docs, data, rules;
- rebuild code cleanly if old code is unstable;
- avoid random rewrites later.

## 2026-06-15 — Foundation packages v1.1–v1.4

Project archives evolved:
- Foundation v1;
- latest working package;
- project memory files;
- private_raw_data rules;
- security docs;
- update protocol;
- import/normalization plans.

Decision:
The project folder itself must contain project memory and rules.

## 2026-06-15 — Historical normalization v1.5

User requested line-level review/normalization before development.

Action:
Historical data was indexed and candidate financial lines were generated.

Important distinction:
- old data is now indexed and prepared for review;
- not all candidates are confirmed accounting records yet;
- Import Center / Review Queue will be required to turn candidates into production records.

Decision:
Old income/expense/shift data must be brought to a unified template and used for AI learning.

## 2026-06-15 — Real gross target thinking

User clarified a more realistic money mindset:
Not "earn 5–10k abstractly", but:

Example day:
- fuel;
- Drivee;
- food;
- meeting;
- products;
- bankruptcy top-up.

Decision:
FinFlow must calculate **gross required today** from exact today's needs.

Important correction:
Drivee is percentage-based. So gross target must be solved with formula, not by simply adding commission as fixed if gross is unknown.

## 2026-06-15 — Time realism

User clarified current time matters:
At 16:07, the day may no longer support the original plan.

Decision:
FinFlow must include:
- live current time;
- remaining realistic work hours;
- 24-hour human limit;
- sleep/food/rest/errands;
- realistic cap around 10,000 ₽ net/day;
- Emergency/Recovery Mode when a target is no longer realistic.

## 2026-06-15 — Live shift progress

User clarified that the app must track orders already completed today.

Decision:
FinFlow must update after every order:
- gross done;
- remaining gross target;
- Drivee estimate;
- fuel/work cost impact;
- time left;
- feasibility;
- recommended allocation.

## 2026-06-15 — Money allocation recommendation engine

User clarified the app must recommend:
- how much money;
- to which category/fund;
- what to pay first;
- what to cut/postpone;
- what to do by scenario if income is lower/higher.

Decision:
FinFlow must show exact recommended allocations, not just totals.

## 2026-06-15 — Meetings Fund correction

User corrected default meeting frequency:
Average meetings with girlfriend: **5 times per week**.

Decision:
FinFlow must:
- keep 2,000–3,000 ₽ usually available for meetings;
- treat Meetings Fund as recurring turnover buffer;
- track 5 meetings/week by default;
- calculate weekly relationship time/money impact;
- integrate meetings into calendar and daily gross target.

## Permanent project principles

Across all future work:
- do not treat requests as isolated;
- use project docs and chat context;
- update files when important requirements appear;
- preserve existing systems;
- do not rewrite code every time;
- make local incremental changes;
- run anti-regression checks;
- never upload `private_raw_data` to GitHub/cloud/Vercel/Supabase Storage/public archives.

## v1.12 provenance correction

Important:
The 03.06.2026 FinFlow/Taxi Income Bot material belongs to earlier project context / previous dialogue / uploaded historical materials. It is not the start date of the current active working conversation.

The current active working conversation for the v1.x archive/rebuild sequence is treated as 15.06.2026.

Future timeline entries must label source type:
- current chat;
- previous conversation/imported context;
- historical source data;
- generated project artifact.
