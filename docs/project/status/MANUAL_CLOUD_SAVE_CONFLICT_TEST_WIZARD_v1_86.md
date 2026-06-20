# Manual Cloud Save / Conflict Test Wizard — v1.86

## Purpose

After v1.85 added a safe acceptance test runner, v1.86 adds a manual wizard for the risky parts of cloud verification:

- real cloud save;
- load-preview;
- manual apply;
- two-session conflict test;
- rollback/cleanup.

## Safety

The wizard never performs automatic cloud writes.

It only stores local progress and notes in browser localStorage.
