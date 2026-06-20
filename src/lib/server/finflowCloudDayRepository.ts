import type { FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import { assertSupabaseWritesEnabled, createSupabaseServerClient } from '@/lib/server/supabaseServerClient';

export const FINFLOW_CLOUD_DAY_REPOSITORY_VERSION = 'finflow_cloud_day_repository_v1_73' as const;

export type CloudDayRecord = {
  profileId: string;
  localDate: string;
  document: FinflowCloudDayDocument;
  revision: number;
  updatedAt: string;
};

export async function loadCloudDay(profileId: string, localDate: string) {
  const client = createSupabaseServerClient();
  if (!client) return { ok: false as const, reason: 'supabase_server_client_not_ready' };

  const result = await client
    .from('finflow_day_documents')
    .select('profile_id,local_date,document,revision,updated_at')
    .eq('profile_id', profileId)
    .eq('local_date', localDate)
    .maybeSingle();

  if (result.error) return { ok: false as const, reason: `cloud_day_select_failed:${result.error.code ?? 'unknown'}` };
  if (!result.data) return { ok: true as const, record: null };

  return {
    ok: true as const,
    record: {
      profileId: result.data.profile_id,
      localDate: result.data.local_date,
      document: result.data.document as FinflowCloudDayDocument,
      revision: result.data.revision,
      updatedAt: result.data.updated_at
    } satisfies CloudDayRecord
  };
}

export async function saveCloudDay(input: {
  profileId: string;
  document: FinflowCloudDayDocument;
  expectedRevision?: number | null;
}) {
  const writeGuard = assertSupabaseWritesEnabled();
  if (!writeGuard.ok) return { ok: false as const, reason: writeGuard.reason, conflict: false };

  const client = createSupabaseServerClient();
  if (!client) return { ok: false as const, reason: 'supabase_server_client_not_ready', conflict: false };

  const localDate = input.document.dayInput.localDate;
  const current = await loadCloudDay(input.profileId, localDate);
  if (!current.ok) return { ok: false as const, reason: current.reason, conflict: false };

  if (current.record) {
    if (input.expectedRevision === undefined || input.expectedRevision === null) {
      return { ok: false as const, reason: 'cloud_day_revision_required', conflict: true, currentRevision: current.record.revision };
    }
    if (input.expectedRevision !== undefined && input.expectedRevision !== null && input.expectedRevision !== current.record.revision) {
      return { ok: false as const, reason: 'cloud_day_revision_conflict', conflict: true, currentRevision: current.record.revision };
    }

    const nextRevision = current.record.revision + 1;
    const updated = await client
      .from('finflow_day_documents')
      .update({ document: input.document, revision: nextRevision })
      .eq('profile_id', input.profileId)
      .eq('local_date', localDate)
      .eq('revision', current.record.revision)
      .select('profile_id,local_date,document,revision,updated_at')
      .maybeSingle();

    if (updated.error) return { ok: false as const, reason: `cloud_day_update_failed:${updated.error.code ?? 'unknown'}`, conflict: false };
    if (!updated.data) return { ok: false as const, reason: 'cloud_day_revision_conflict', conflict: true, currentRevision: current.record.revision };

    return { ok: true as const, revision: nextRevision, updatedAt: updated.data.updated_at };
  }

  if (input.expectedRevision !== undefined && input.expectedRevision !== null && input.expectedRevision !== 0) {
    return { ok: false as const, reason: 'cloud_day_revision_conflict', conflict: true, currentRevision: 0 };
  }

  const inserted = await client
    .from('finflow_day_documents')
    .insert({
      profile_id: input.profileId,
      local_date: localDate,
      document: input.document,
      revision: 1
    })
    .select('revision,updated_at')
    .single();

  if (inserted.error?.code === '23505') {
    return { ok: false as const, reason: 'cloud_day_revision_conflict', conflict: true, currentRevision: 1 };
  }
  if (inserted.error) return { ok: false as const, reason: `cloud_day_insert_failed:${inserted.error.code ?? 'unknown'}`, conflict: false };

  return { ok: true as const, revision: inserted.data.revision, updatedAt: inserted.data.updated_at };
}
