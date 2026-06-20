import type { TelegramSupabaseVerificationChecklist } from '@/lib/deployment/telegramSupabaseVerificationChecklist';
import {
  defaultUserStatusFromStage,
  getVerificationStageProgress,
  summarizeVerificationChecklistProgress,
  type VerificationChecklistProgressState
} from '@/lib/deployment/verificationChecklistProgress';

export const VERIFICATION_HANDOFF_REPORT_VERSION = 'verification_handoff_report_v1_84' as const;

export type VerificationHandoffReport = {
  version: typeof VERIFICATION_HANDOFF_REPORT_VERSION;
  generatedAt: string;
  summary: {
    percentDone: number;
    done: number;
    total: number;
    nextStage: string | null;
    localFoundation: number;
    dailyLocalUse: number;
    cloudFoundation: number;
    productionEcosystem: number;
  };
  markdown: string;
  json: string;
};

export function buildVerificationHandoffReport(input: {
  checklist: TelegramSupabaseVerificationChecklist;
  progressState: VerificationChecklistProgressState;
  generatedAt?: string;
}): VerificationHandoffReport {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const summary = summarizeVerificationChecklistProgress(input.checklist.stages, input.progressState);

  const stageRows = input.checklist.stages.map(stage => {
    const progress = getVerificationStageProgress(input.progressState, stage.id);
    const status = progress?.status ?? defaultUserStatusFromStage(stage);
    const note = sanitizeNote(progress?.note ?? '');
    return {
      id: stage.id,
      title: stage.title,
      area: stage.area,
      templateStatus: stage.status,
      userStatus: status,
      note,
      updatedAt: progress?.updatedAt ?? null
    };
  });

  const jsonPayload = {
    version: VERIFICATION_HANDOFF_REPORT_VERSION,
    generatedAt,
    warning: 'No secrets are included. Do not paste tokens, service_role keys, .env.local, bank PDFs/CSVs or private_raw_data into handoff notes.',
    readiness: input.checklist.readiness,
    progress: {
      percentDone: summary.percentDone,
      done: summary.done,
      total: summary.total,
      inProgress: summary.inProgress,
      blocked: summary.blocked,
      notStarted: summary.notStarted,
      nextStageId: summary.nextManualStage?.id ?? null,
      nextStageTitle: summary.nextManualStage?.title ?? null
    },
    stages: stageRows,
    nextCriticalPath: input.checklist.nextCriticalPath
  };

  const markdown = [
    '# FINFlow Telegram/Supabase Verification Handoff',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Safe handoff note',
    '',
    'This report intentionally excludes real secrets. Do not paste TELEGRAM_BOT_TOKEN, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, .env.local, bank PDFs/CSVs or private_raw_data into chat or public repos.',
    '',
    '## Readiness',
    '',
    `- Local Foundation: ${input.checklist.readiness.localFoundation}%`,
    `- Daily local use: ${input.checklist.readiness.dailyLocalUse}%`,
    `- Cloud foundation: ${input.checklist.readiness.cloudFoundation}%`,
    `- Production ecosystem: ${input.checklist.readiness.productionEcosystem}%`,
    `- Verification progress: ${summary.percentDone}% (${summary.done}/${summary.total})`,
    `- Next unfinished stage: ${summary.nextManualStage?.title ?? 'none'}`,
    '',
    '## Verification stages',
    '',
    ...stageRows.map(row => [
      `### ${row.title}`,
      '',
      `- ID: ${row.id}`,
      `- Area: ${row.area}`,
      `- Template status: ${row.templateStatus}`,
      `- User status: ${row.userStatus}`,
      row.updatedAt ? `- Updated: ${row.updatedAt}` : '- Updated: not marked',
      row.note ? `- Note: ${row.note}` : '- Note: —',
      ''
    ].join('\n')),
    '## Next critical path',
    '',
    ...input.checklist.nextCriticalPath.map(step => `- ${step}`)
  ].join('\n');

  return {
    version: VERIFICATION_HANDOFF_REPORT_VERSION,
    generatedAt,
    summary: {
      percentDone: summary.percentDone,
      done: summary.done,
      total: summary.total,
      nextStage: summary.nextManualStage?.title ?? null,
      localFoundation: input.checklist.readiness.localFoundation,
      dailyLocalUse: input.checklist.readiness.dailyLocalUse,
      cloudFoundation: input.checklist.readiness.cloudFoundation,
      productionEcosystem: input.checklist.readiness.productionEcosystem
    },
    markdown,
    json: JSON.stringify(jsonPayload, null, 2)
  };
}

function sanitizeNote(value: string) {
  return value
    .replace(/(service[_-]?role|bot[_-]?token|openai|api[_-]?key|telegram[_-]?bot[_-]?token)/gi, '[secret-name-redacted]')
    .replace(/eyJ[a-zA-Z0-9_\-.]+/g, '[jwt-like-token-redacted]')
    .replace(/[A-Za-z0-9_\-]{32,}/g, '[long-token-redacted]')
    .slice(0, 500);
}
