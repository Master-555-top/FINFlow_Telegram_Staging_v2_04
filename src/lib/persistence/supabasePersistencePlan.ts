export const SUPABASE_PERSISTENCE_PLAN_VERSION = 'supabase_persistence_plan_v2_39' as const;

export type SupabaseIntegrationStatus = {
  schemaPrepared: boolean;
  stagingFoundationPrepared: boolean;
  clientConnected: boolean;
  telegramAuthVerified: boolean;
  rlsTested: boolean;
  conflictTested: boolean;
  backupGatePrepared: boolean;
  localFallbackPreserved: boolean;
};

export const supabaseIntegrationStatus: SupabaseIntegrationStatus = {
  schemaPrepared: true,
  stagingFoundationPrepared: true,
  clientConnected: false,
  telegramAuthVerified: false,
  rlsTested: false,
  conflictTested: false,
  backupGatePrepared: true,
  localFallbackPreserved: true
};

export const supabaseIntegrationWarnings = [
  'Do not expose SUPABASE_SERVICE_ROLE_KEY in frontend code.',
  'Do not connect production persistence before Telegram identity and RLS are tested.',
  'Keep localStorage fallback until cloud sync is verified.',
  'Do not enable FINFLOW_ENABLE_SUPABASE_WRITES and FINFLOW_ENABLE_CLOUD_SYNC until backup + RLS + conflict tests pass.',
  'Bank candidates and imported historical records must remain review/preview before cloud writes.'
];
