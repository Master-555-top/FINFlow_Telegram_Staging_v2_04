# v1.43 — Custom Record Templates + Bank Source Position

## Memory preflight

Before implementation, context and protocol files were checked under v1.40 rules.

## Goal

1. Let the user create personal templates for daily records.
2. Recheck whether the current order/expense/fund workflow matches the user's intended data entry.
3. Clarify bank file status and safe next use.

## Added

- Custom record templates.
- Local custom template persistence.
- Add/edit/delete custom templates.
- Safe template and bank source recheck document.

## Bank file status

The bank PDF has already been extracted into review candidates.
It is not final accounting.
It must flow through review before import.

## Product rule

Bank candidates can become records only after review/approval.
