# Validation Plan — v1.99

Required checks before packaging:

```text
npm ci --ignore-scripts --no-audit --prefer-offline
npm run lint
npm run build
npm audit --audit-level=moderate
```

Manual protocol checks:

- Anti-regression: v1.95–v1.98 systems remain present.
- Locked decisions: external Claude file is a patch source, not a new base.
- Dependency check: no dependency changes except package version metadata.
- Runtime boundary: `private_vault` is not imported by runtime/client code.
- Deploy ignore rules: `.dockerignore` and `.vercelignore` exist in `finflow_app`.

## Actual validation result

```text
npm ci --ignore-scripts --no-audit --prefer-offline — passed
npm run lint — passed
npm run build — passed
npm audit --audit-level=moderate — passed, 0 vulnerabilities
```

## Dependency check result

No runtime dependency versions were changed. Only project package version metadata moved from `0.1.98` to `0.1.99`.
