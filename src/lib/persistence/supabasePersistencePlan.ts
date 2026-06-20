export const SUPABASE_PERSISTENCE_PLAN_VERSION = 'supabase_persistence_plan_v1_49' as const;

export type SupabaseIntegrationStatus = {
  schemaPrepared: boolean;
  clientConnected: boolean;
  telegramAuthVerified: boolean;
  rlsTested: boolean;
  localFallbackPreserved: boolean;
};

export const supabaseIntegrationStatus: SupabaseIntegrationStatus = {
  schemaPrepared: true,
  clientConnected: false,
  telegramAuthVerified: false,
  rlsTested: false,
  localFallbackPreserved: true
};

export const supabaseIntegrationWarnings = [
  'Do not expose SUPABASE_SERVICE_ROLE_KEY in frontend code.',
  'Do not connect production persistence before Telegram identity and RLS are tested.',
  'Keep localStorage fallback until cloud sync is verified.',
  'Bank candidates must remain review-only.'
];
