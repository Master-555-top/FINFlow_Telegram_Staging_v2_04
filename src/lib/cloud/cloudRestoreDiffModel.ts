import type { FinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import { buildLocalBackupRestorePreview, type LocalBackupRestorePreview } from '@/lib/local/localBackupDiffModel';

export const CLOUD_RESTORE_DIFF_MODEL_VERSION = 'cloud_restore_diff_model_v1_93' as const;

export type CloudRestorePreviewDiff = LocalBackupRestorePreview & {
  cloudVersion: typeof CLOUD_RESTORE_DIFF_MODEL_VERSION;
  source: 'cloud_preview';
  revision: number | null;
  headline: string;
  riskLevel: 'no_change' | 'safe' | 'watch' | 'warning';
};

export function buildCloudRestorePreviewDiff(input: {
  current: FinflowCloudDayDocument;
  cloud: FinflowCloudDayDocument;
  revision: number | null;
}): CloudRestorePreviewDiff {
  const preview = buildLocalBackupRestorePreview({
    current: input.current,
    backup: input.cloud
  });

  const riskLevel: CloudRestorePreviewDiff['riskLevel'] = !preview.hasDifferences
    ? 'no_change'
    : preview.summary.warnings > 0
      ? 'warning'
      : preview.summary.watches > 0
        ? 'watch'
        : 'safe';

  return {
    ...preview,
    cloudVersion: CLOUD_RESTORE_DIFF_MODEL_VERSION,
    source: 'cloud_preview',
    revision: input.revision,
    headline: buildHeadline(preview, input.revision, riskLevel),
    riskLevel
  };
}

function buildHeadline(
  preview: LocalBackupRestorePreview,
  revision: number | null,
  riskLevel: CloudRestorePreviewDiff['riskLevel']
) {
  const revisionText = revision === null ? '—' : String(revision);
  if (!preview.hasDifferences) return `Cloud revision ${revisionText}: отличий по ключевым полям не найдено.`;
  if (riskLevel === 'warning') return `Cloud revision ${revisionText}: есть важные отличия перед применением.`;
  if (riskLevel === 'watch') return `Cloud revision ${revisionText}: есть изменения, проверь перед применением.`;
  return `Cloud revision ${revisionText}: изменения выглядят безопасно, но apply всё равно только вручную.`;
}
