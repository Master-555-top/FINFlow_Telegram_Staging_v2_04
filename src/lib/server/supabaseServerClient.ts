import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_SERVER_CLIENT_VERSION = 'supabase_server_client_v1_54' as const;

export type SupabaseServerClientStatus = {
  ready: boolean;
  writesEnabled: boolean;
  cloudSyncEnabled: boolean;
  reason?: string;
};

export function getSupabaseServerClientStatus(): SupabaseServerClientStatus {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const writesEnabled = process.env.FINFLOW_ENABLE_SUPABASE_WRITES === 'true';
  const cloudSyncEnabled = process.env.FINFLOW_ENABLE_CLOUD_SYNC === 'true';

  if (!supabaseUrl) return { ready: false, writesEnabled, cloudSyncEnabled, reason: 'missing_SUPABASE_URL' };
  if (!serviceRoleKey) return { ready: false, writesEnabled, cloudSyncEnabled, reason: 'missing_SUPABASE_SERVICE_ROLE_KEY' };

  return { ready: true, writesEnabled, cloudSyncEnabled };
}

export function createSupabaseServerClient(): SupabaseClient | null {
  const status = getSupabaseServerClientStatus();

  if (!status.ready) return null;

  const supabaseUrl = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function assertSupabaseWritesEnabled() {
  const status = getSupabaseServerClientStatus();

  if (!status.ready) {
    return {
      ok: false as const,
      reason: status.reason ?? 'supabase_server_client_not_ready'
    };
  }

  if (!status.writesEnabled) {
    return {
      ok: false as const,
      reason: 'FINFLOW_ENABLE_SUPABASE_WRITES_not_true'
    };
  }

  return { ok: true as const };
}
