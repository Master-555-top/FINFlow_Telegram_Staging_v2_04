# BUILD REPORT v1.26

## Commands

```bash
npm install --ignore-scripts
npx tsc --noEmit
NEXT_TELEMETRY_DISABLED=1 npx next build
```

## Result

- npm install: passed, 0 vulnerabilities reported.
- TypeScript: passed after adding `ignoreDeprecations: "6.0"` to silence the TypeScript 6 `baseUrl` deprecation warning.
- Next build: passed.

## Note

Next.js still prints a workspace-root warning because the sandbox contains multiple package-lock files under `/mnt/data`. This is not an application build failure.
