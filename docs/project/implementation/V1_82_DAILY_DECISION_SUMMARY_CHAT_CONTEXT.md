# v1.82 — Daily Decision Summary Into Assistant Chat

## Added

- `src/lib/assistant/dailyDecisionChatContext.ts`
- optional daily decision context in `answerAssistantQuestionLocally`
- daily decision chat context memo in `DailyQuickInputPanel`
- chat answers now use the unified day summary before isolated fuel/car/repair contexts

## Purpose

Make the assistant behave less like separate calculators and more like one daily operating partner.
