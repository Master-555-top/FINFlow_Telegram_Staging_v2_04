import { NextResponse } from 'next/server';
import { buildDraftFinflowProfileFromTelegramUser } from '@/lib/server/finflowProfileResolver';
import { resolveOrCreateFinflowProfile } from '@/lib/server/finflowProfileRepository';
import { getSupabaseServerClientStatus } from '@/lib/server/supabaseServerClient';
import { authenticateTelegramInitData } from '@/lib/server/telegramRequestAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { initData?: string } | null;
  const validation = authenticateTelegramInitData(body?.initData ?? '');

  if (!validation.ok || !validation.user) {
    return NextResponse.json(
      { ok: false, reason: validation.reason, profileReady: false },
      { status: 401 }
    );
  }

  const serverStatus = getSupabaseServerClientStatus();
  const draftProfile = buildDraftFinflowProfileFromTelegramUser(validation.user);

  if (!serverStatus.ready || !serverStatus.cloudSyncEnabled) {
    return NextResponse.json({
      ok: true,
      profileReady: false,
      mode: 'local_fallback',
      profile: draftProfile,
      cloud: {
        ready: serverStatus.ready,
        writesEnabled: serverStatus.writesEnabled,
        cloudSyncEnabled: serverStatus.cloudSyncEnabled,
        reason: serverStatus.reason ?? 'cloud_sync_feature_flag_disabled'
      }
    }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const resolved = await resolveOrCreateFinflowProfile(validation.user);
  if (!resolved.ok) {
    return NextResponse.json({
      ok: false,
      profileReady: false,
      reason: resolved.reason,
      mode: 'cloud_profile_error'
    }, { status: resolved.retryable ? 503 : 409 });
  }

  return NextResponse.json({
    ok: true,
    profileReady: true,
    mode: 'supabase_server',
    profile: {
      id: resolved.profile.id,
      displayName: resolved.profile.display_name,
      timezone: resolved.profile.timezone,
      created: resolved.created
    },
    telegramUser: {
      id: validation.user.id,
      username: validation.user.username,
      firstName: validation.user.first_name,
      languageCode: validation.user.language_code
    }
  }, { headers: { 'Cache-Control': 'no-store' } });
}
