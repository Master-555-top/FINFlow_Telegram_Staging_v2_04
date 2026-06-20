import { NextResponse } from 'next/server';
import { getSupabaseServerClientStatus } from '@/lib/server/supabaseServerClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getSupabaseServerClientStatus();

  return NextResponse.json({
    ok: true,
    supabaseServerStatus: {
      ready: status.ready,
      writesEnabled: status.writesEnabled,
      cloudSyncEnabled: status.cloudSyncEnabled,
      reason: status.reason
    },
    safety: {
      secretsReturned: false,
      writesRequireFlag: 'FINFLOW_ENABLE_SUPABASE_WRITES=true',
      serviceRoleFrontendAllowed: false
    }
  }, { headers: { 'Cache-Control': 'no-store' } });
}
