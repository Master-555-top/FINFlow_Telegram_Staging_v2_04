export const CLOUD_SAVE_PREFLIGHT_MODEL_VERSION = 'cloud_save_preflight_model_v1_95' as const;

export type CloudSavePreflightLevel = 'ready' | 'watch' | 'blocked';

export type CloudSavePreflightBackupSummary = {
  total: number;
  latestBackupAt: string | null;
  latestLabel: string | null;
};

export type CloudSavePreflightReport = {
  version: typeof CLOUD_SAVE_PREFLIGHT_MODEL_VERSION;
  level: CloudSavePreflightLevel;
  canSave: boolean;
  headline: string;
  message: string;
  checks: Array<{
    id: string;
    ok: boolean;
    title: string;
    message: string;
  }>;
};

export function buildCloudSavePreflightReport(input: {
  backupSummary: CloudSavePreflightBackupSummary;
  hasRollbackSnapshot: boolean;
  revision: number | null;
  hasPendingCloudPreview: boolean;
  hasTelegramInitData: boolean;
}): CloudSavePreflightReport {
  const hasLocalBackup = input.backupSummary.total > 0;
  const hasAnySafetyNet = hasLocalBackup || input.hasRollbackSnapshot;

  const checks = [
    {
      id: 'telegram_context',
      ok: input.hasTelegramInitData,
      title: 'Telegram context',
      message: input.hasTelegramInitData
        ? 'Telegram initData найден.'
        : 'Cloud save доступен только из Telegram Mini App.'
    },
    {
      id: 'local_backup',
      ok: hasLocalBackup,
      title: 'Local backup',
      message: hasLocalBackup
        ? `Есть локальный backup: ${input.backupSummary.latestLabel ?? 'без названия'}.`
        : 'Перед cloud save нужен локальный backup текущего дня.'
    },
    {
      id: 'rollback_snapshot',
      ok: input.hasRollbackSnapshot,
      title: 'Rollback snapshot',
      message: input.hasRollbackSnapshot
        ? 'Есть session rollback после последнего cloud apply.'
        : 'Rollback snapshot отсутствует. Это нормально, если есть local backup.'
    },
    {
      id: 'cloud_revision',
      ok: input.revision !== null,
      title: 'Cloud revision',
      message: input.revision === null
        ? 'Cloud revision неизвестна. Лучше сначала загрузить cloud preview.'
        : `Текущая cloud revision: ${input.revision}.`
    },
    {
      id: 'no_pending_preview',
      ok: !input.hasPendingCloudPreview,
      title: 'No pending cloud preview',
      message: input.hasPendingCloudPreview
        ? 'Сначала примени или сбрось загруженный cloud preview.'
        : 'Нет незавершённого cloud preview.'
    }
  ];

  if (!input.hasTelegramInitData) {
    return {
      version: CLOUD_SAVE_PREFLIGHT_MODEL_VERSION,
      level: 'blocked',
      canSave: false,
      headline: 'Cloud save недоступен без Telegram Mini App',
      message: 'Запусти приложение через Telegram, чтобы сервер мог проверить initData.',
      checks
    };
  }

  if (input.hasPendingCloudPreview) {
    return {
      version: CLOUD_SAVE_PREFLIGHT_MODEL_VERSION,
      level: 'blocked',
      canSave: false,
      headline: 'Сначала разбери загруженный cloud preview',
      message: 'Чтобы не затереть данные, save заблокирован пока есть pending cloud preview.',
      checks
    };
  }

  if (!hasAnySafetyNet) {
    return {
      version: CLOUD_SAVE_PREFLIGHT_MODEL_VERSION,
      level: 'blocked',
      canSave: false,
      headline: 'Нужна страховка перед cloud save',
      message: 'Создай local backup текущего дня. После этого save в Supabase будет доступен.',
      checks
    };
  }

  if (!hasLocalBackup && input.hasRollbackSnapshot) {
    return {
      version: CLOUD_SAVE_PREFLIGHT_MODEL_VERSION,
      level: 'watch',
      canSave: true,
      headline: 'Save разрешён, но лучше создать local backup',
      message: 'Есть rollback snapshot, но полноценная страховка перед Supabase save — local backup.',
      checks
    };
  }

  if (input.revision === null) {
    return {
      version: CLOUD_SAVE_PREFLIGHT_MODEL_VERSION,
      level: 'watch',
      canSave: true,
      headline: 'Save разрешён с предупреждением',
      message: 'Backup есть, но cloud revision неизвестна. Безопаснее сначала загрузить cloud preview.',
      checks
    };
  }

  return {
    version: CLOUD_SAVE_PREFLIGHT_MODEL_VERSION,
    level: 'ready',
    canSave: true,
    headline: 'Cloud save preflight passed',
    message: 'Есть Telegram context, страховка и понятное состояние cloud preview.',
    checks
  };
}
