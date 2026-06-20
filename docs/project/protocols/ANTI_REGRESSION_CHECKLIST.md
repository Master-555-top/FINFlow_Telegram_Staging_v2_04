# ANTI-REGRESSION CHECKLIST

Run after every meaningful change.

## Core launch
- [ ] npm install works
- [ ] npm run dev works
- [ ] app opens at localhost
- [ ] no Hydration failed error
- [ ] no blank screen
- [ ] no console critical errors

## Live system
- [ ] live time works
- [ ] time of day works
- [ ] dashboard updates when data changes
- [ ] dependent values recalculate

## Data
- [ ] existing mock/sample data still displays
- [ ] new records do not break old views
- [ ] edits update derived totals
- [ ] archive/restore logic remains intact when implemented

## UX
- [ ] mobile layout not broken
- [ ] important cards are readable
- [ ] buttons remain usable
- [ ] bottom navigation remains accessible

## FinFlow business rules
- [ ] gross target still shown/calculated
- [ ] working costs still included
- [ ] funds and mini-goals still included
- [ ] current balance still affects plan
- [ ] realistic day limit still respected

## Documentation
- [ ] changelog updated if behavior changed
- [ ] locked decisions updated if new decision was made
- [ ] project memory updated if a durable requirement was added
