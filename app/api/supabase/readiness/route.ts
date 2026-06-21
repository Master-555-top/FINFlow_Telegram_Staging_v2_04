import { NextResponse } from 'next/server';
import { getSupabaseServerClientGuardStatus } from '@/lib/server/supabaseServerClientGuard';
import { getSupabaseServerClientStatus } from '@/lib/server/supabaseServerClient';
import { buildSupabaseStagingReadiness } from '@/lib/persistence/supabaseStagingFoundation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getSupabaseServerClientStatus();
  const guard = getSupabaseServerClientGuardStatus();
  const staging = buildSupabaseStagingReadiness({
    serverReady: status.ready,
    writesEnabled: status.writesEnabled,
    cloudSyncEnabled: status.cloudSyncEnabled,
    hasUrl: guard.hasUrl,
    hasAnonKey: guard.hasAnonKey,
    hasServiceRoleKey: guard.hasServiceRoleKey,
    hasTelegramInitData: false,
    backupCount: 0,
    hasRollbackSnapshot: false,
    rlsManuallyTested: false,
    conflictTested: false
  });

  return NextResponse.json({
    ok: true,
    supabaseServerStatus: {
      ready: status.ready,
      writesEnabled: status.writesEnabled,
      cloudSyncEnabled: status.cloudSyncEnabled,
      reason: status.reason
    },
    guard: {
      mode: guard.mode,
      hasUrl: guard.hasUrl,
      hasAnonKey: guard.hasAnonKey,
      hasServiceRoleKey: guard.hasServiceRoleKey,
      warnings: guard.warnings
    },
    staging,
    safety: {
      secretsReturned: false,
      writesRequireFlags: ['FINFLOW_ENABLE_SUPABASE_WRITES=true', 'FINFLOW_ENABLE_CLOUD_SYNC=true'],
      serviceRoleFrontendAllowed: false,
      rlsAndBackupRequired: true
    }
  }, { headers: { 'Cache-Control': 'no-store' } });
}
