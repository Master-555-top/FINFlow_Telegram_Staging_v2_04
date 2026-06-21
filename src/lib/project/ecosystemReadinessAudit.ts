import { buildMiniAppDeliveryPlan } from '@/lib/project/miniAppDeliveryPlan';

export const ECOSYSTEM_READINESS_AUDIT_VERSION = 'ecosystem_readiness_audit_v2_42' as const;

export type EcosystemReadinessArea = {
  id: string;
  title: string;
  previousPercent: number;
  percent: number;
  status: 'done' | 'usable' | 'needs_real_test' | 'in_progress' | 'not_started';
  summary: string;
  done: string[];
  remaining: string[];
};

export type EcosystemReadinessAudit = {
  version: typeof ECOSYSTEM_READINESS_AUDIT_VERSION;
  previousOverallProductionPercent: number;
  overallProductionPercent: number;
  previousLocalDailyUsePercent: number;
  localDailyUsePercent: number;
  previousSafeLaunchPercent: number;
  safeLaunchPercent: number;
  areas: EcosystemReadinessArea[];
  topRisks: string[];
  nextActions: string[];
};

export function buildEcosystemReadinessAudit(): EcosystemReadinessAudit {
  const delivery = buildMiniAppDeliveryPlan();
  const areas: EcosystemReadinessArea[] = delivery.areas.map(area => ({
    id: area.id,
    title: area.title,
    previousPercent: Math.max(0, area.percent - (area.id === 'global_data_backbone' ? 8 : 0)),
    percent: area.percent,
    status: area.status === 'ready'
      ? 'done'
      : area.status === 'usable_local'
        ? 'usable'
        : area.status === 'blocked'
          ? 'needs_real_test'
          : area.status === 'planned'
            ? 'not_started'
            : 'in_progress',
    summary: area.summary,
    done: area.done,
    remaining: area.remaining
  }));

  return {
    version: ECOSYSTEM_READINESS_AUDIT_VERSION,
    previousOverallProductionPercent: Math.max(0, delivery.overallStrongMiniAppPercent - 5),
    overallProductionPercent: delivery.overallStrongMiniAppPercent,
    previousLocalDailyUsePercent: 72,
    localDailyUsePercent: 76,
    previousSafeLaunchPercent: 67,
    safeLaunchPercent: 68,
    areas,
    topRisks: [
      `До сильного полностью рабочего mini app осталось примерно ${delivery.remainingPercent}%. Следующий риск — включить Supabase/external n8n без реального Telegram staging, auth, redaction, conflict review и backup.`,
      'Исторические данные нельзя заливать напрямую: нужен preview, dedupe, подтверждение и rollback.',
      'Supabase writes остаются safe-off до миграций, RLS/security review и backup.',
      'n8n теперь имеет dry-run contract, но внешние вызовы остаются заблокированы до private staging/auth/redaction.'
    ],
    nextActions: delivery.criticalPath
  };
}
