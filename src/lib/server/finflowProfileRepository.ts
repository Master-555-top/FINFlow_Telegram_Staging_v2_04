import { buildDisplayName, type TelegramVerifiedUser } from '@/lib/server/finflowProfileResolver';
import { assertSupabaseWritesEnabled, createSupabaseServerClient } from '@/lib/server/supabaseServerClient';

export const FINFLOW_PROFILE_REPOSITORY_VERSION = 'finflow_profile_repository_v1_73' as const;

export type FinflowProfileRow = {
  id: string;
  telegram_user_id: string;
  display_name: string | null;
  timezone: string;
  telegram_username: string | null;
  telegram_language_code: string | null;
  created_at: string;
  updated_at: string;
};

export type FinflowProfileRepositoryResult =
  | { ok: true; profile: FinflowProfileRow; created: boolean }
  | { ok: false; reason: string; retryable: boolean };

const profileColumns = 'id,telegram_user_id,display_name,timezone,telegram_username,telegram_language_code,created_at,updated_at';

export async function resolveOrCreateFinflowProfile(user: TelegramVerifiedUser): Promise<FinflowProfileRepositoryResult> {
  const client = createSupabaseServerClient();
  if (!client) return { ok: false, reason: 'supabase_server_client_not_ready', retryable: false };

  const telegramUserId = String(user.id);
  const existing = await client
    .from('finflow_profiles')
    .select(profileColumns)
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();

  if (existing.error) {
    return { ok: false, reason: `profile_select_failed:${existing.error.code ?? 'unknown'}`, retryable: true };
  }

  if (existing.data) {
    return { ok: true, profile: existing.data as FinflowProfileRow, created: false };
  }

  const writeGuard = assertSupabaseWritesEnabled();
  if (!writeGuard.ok) return { ok: false, reason: writeGuard.reason, retryable: false };

  const created = await client
    .from('finflow_profiles')
    .insert({
      telegram_user_id: telegramUserId,
      display_name: buildDisplayName(user),
      timezone: process.env.FINFLOW_DEFAULT_TIMEZONE ?? 'Asia/Kamchatka',
      telegram_username: user.username ?? null,
      telegram_language_code: user.language_code ?? null,
      last_seen_at: new Date().toISOString()
    })
    .select(profileColumns)
    .single();

  if (!created.error && created.data) {
    return { ok: true, profile: created.data as FinflowProfileRow, created: true };
  }

  if (created.error?.code === '23505') {
    const raced = await client
      .from('finflow_profiles')
      .select(profileColumns)
      .eq('telegram_user_id', telegramUserId)
      .single();
    if (!raced.error && raced.data) {
      return { ok: true, profile: raced.data as FinflowProfileRow, created: false };
    }
  }

  return { ok: false, reason: `profile_create_failed:${created.error?.code ?? 'unknown'}`, retryable: true };
}
