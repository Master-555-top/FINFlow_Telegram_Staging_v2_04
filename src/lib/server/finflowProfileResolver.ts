export const FINFLOW_PROFILE_RESOLVER_VERSION = 'finflow_profile_resolver_v1_52' as const;

export type TelegramVerifiedUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type FinflowProfileResolutionMode = 'draft_no_database' | 'supabase_server';

export type FinflowResolvedProfile = {
  ok: boolean;
  mode: FinflowProfileResolutionMode;
  profileReady: boolean;
  profileId?: string;
  telegramUserId: string;
  displayName: string;
  timezone: string;
  warning?: string;
};

export function buildDraftFinflowProfileFromTelegramUser(user: TelegramVerifiedUser): FinflowResolvedProfile {
  const telegramUserId = String(user.id);
  const displayName = buildDisplayName(user);

  return {
    ok: true,
    mode: 'draft_no_database',
    profileReady: false,
    telegramUserId,
    displayName,
    timezone: 'Asia/Kamchatka',
    warning: 'Telegram user verified. Cloud profile is unavailable in the current environment, so FINFlow remains in local fallback mode.'
  };
}

export function buildDisplayName(user: TelegramVerifiedUser) {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  if (parts.length > 0) return parts.join(' ');
  if (user.username) return `@${user.username}`;
  return `Telegram ${user.id}`;
}

// v2.02 Claude audit sync: old v1.52/v1.55 Supabase profile resolver draft/dry-run
// placeholders were removed from runtime source after the real guarded server-only
// path landed in finflowProfileRepository.ts. Current path:
// API route → authenticateTelegramInitData → finflowProfileRepository.
