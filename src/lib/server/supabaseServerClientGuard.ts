export const SUPABASE_SERVER_CLIENT_GUARD_VERSION = 'supabase_server_client_guard_v1_54' as const;

export type SupabaseServerClientGuardStatus = {
  enabled: boolean;
  writesEnabled: boolean;
  hasUrl: boolean;
  hasServiceRoleKey: boolean;
  hasAnonKey: boolean;
  mode: 'disabled' | 'readiness_only' | 'server_write_ready';
  warnings: string[];
};

export function getSupabaseServerClientGuardStatus(): SupabaseServerClientGuardStatus {
  const hasUrl = Boolean(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const writesEnabled = process.env.FINFLOW_ENABLE_SUPABASE_WRITES === 'true';
  const enabled = hasUrl && hasServiceRoleKey;

  const warnings: string[] = [];

  if (!hasUrl) warnings.push('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is missing.');
  if (!hasAnonKey) warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
  if (!hasServiceRoleKey) warnings.push('SUPABASE_SERVICE_ROLE_KEY is missing in server runtime.');
  if (!writesEnabled) warnings.push('FINFLOW_ENABLE_SUPABASE_WRITES is not true, so DB writes must remain disabled.');
  warnings.push('Never expose SUPABASE_SERVICE_ROLE_KEY in client code.');
  warnings.push('Run RLS/user isolation tests before enabling production writes.');

  return {
    enabled,
    writesEnabled,
    hasUrl,
    hasAnonKey,
    hasServiceRoleKey,
    mode: enabled && writesEnabled ? 'server_write_ready' : enabled ? 'readiness_only' : 'disabled',
    warnings
  };
}

export function assertSupabaseServerWritesAllowed() {
  const status = getSupabaseServerClientGuardStatus();

  if (!status.enabled) {
    return {
      ok: false,
      reason: 'supabase_server_env_not_ready',
      status
    };
  }

  if (!status.writesEnabled) {
    return {
      ok: false,
      reason: 'supabase_writes_feature_flag_disabled',
      status
    };
  }

  return {
    ok: true,
    reason: 'supabase_server_writes_allowed',
    status
  };
}
