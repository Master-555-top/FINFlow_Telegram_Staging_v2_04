// Single source of truth for FINFlow UI/version labels.
// NEXT_PUBLIC_APP_VERSION is injected from package.json in next.config.js.
// This prevents recurring merge drift where UI badges showed old v2.xx values.

export const APP_PACKAGE_VERSION = process.env.NEXT_PUBLIC_APP_VERSION?.trim() || 'unknown';

export function formatAppVersion(raw = APP_PACKAGE_VERSION): string {
  const clean = raw.trim();
  const match = clean.match(/^0\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (match) return `v${match[1]}.${match[2]}`;
  return clean ? `v${clean}` : 'v2';
}

export const APP_UI_VERSION = formatAppVersion();
export const APP_FOUNDATION_VERSION = `v3.0 Foundation ${APP_UI_VERSION}`;
