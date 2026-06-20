# Validation Report v1.98

Date: 2026-06-20

## Commands

```bash
npm ci --ignore-scripts --no-audit --prefer-offline
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Results

- Dependency install: passed.
- TypeScript lint/typecheck: passed.
- Next build: passed.
- npm audit moderate: passed, 0 vulnerabilities.

## Build note

The first typecheck before `npm ci` used a globally available TypeScript and rejected the existing project `ignoreDeprecations: "6.0"` setting. After `npm ci`, the project-local TypeScript 6.0.3 was installed and the existing config typechecked correctly. No tsconfig downgrade was kept.
