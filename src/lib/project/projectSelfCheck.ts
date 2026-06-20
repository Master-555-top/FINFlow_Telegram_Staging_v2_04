import { finflowAiPartnerReality, finflowBankReality, finflowCarReality } from '@/lib/project/finflowRealityContext';
export const PROJECT_SELF_CHECK_VERSION = 'project_self_check_v1_60' as const;

export type ProjectReadinessBand = {
  label: string;
  percent: string;
  meaning: string;
};

export type ProjectSelfCheckItem = {
  id: string;
  label: string;
  status: 'done' | 'partial' | 'pending' | 'blocked';
  note: string;
};

export type ProjectSelfCheckReport = {
  version: typeof PROJECT_SELF_CHECK_VERSION;
  miniAppReadiness: ProjectReadinessBand[];
  protocolItems: ProjectSelfCheckItem[];
  nextMilestones: ProjectSelfCheckItem[];
};

export function buildProjectSelfCheckReport(): ProjectSelfCheckReport {
  return {
    version: PROJECT_SELF_CHECK_VERSION,
    miniAppReadiness: [
      {
        label: 'Foundation/MVP внутри проекта',
        percent: '60–65%',
        meaning: 'Основная логика, локальный интерфейс, расчёты, AI-помощник, import review и проектная память уже собраны.'
      },
      {
        label: 'Личный daily-usable MVP',
        percent: '40–50%',
        meaning: 'Нужны реальное сохранение/синхронизация, запуск на твоём устройстве, UI-полировка и проверка сценариев.'
      },
      {
        label: 'Production-ready Telegram Mini App',
        percent: '25–35%',
        meaning: 'Нужны Telegram WebApp production flow, Supabase auth/sync, RLS tests, деплой, мобильное тестирование и защита данных.'
      }
    ],
    protocolItems: [
      {
        id: 'memory_preflight',
        label: 'Memory/context preflight',
        status: 'done',
        note: 'Перед изменениями проверяются ledger, protocols, current state, memory и guardrails.'
      },
      {
        id: 'transcript_ledger',
        label: 'Transcript ledger',
        status: 'done',
        note: 'Текущие сообщения фиксируются в контекстном ledger.'
      },
      {
        id: 'anti_regression',
        label: 'Anti-regression',
        status: 'done',
        note: 'Каждый пакет проходит TypeScript/build/zip test перед выдачей.'
      },
      {
        id: 'privacy',
        label: 'Privacy/security',
        status: 'done',
        note: 'private_raw_data, .env, tokens, bank raw data не должны попадать в публичные репозитории.'
      },
      {
        id: 'supabase_live',
        label: 'Real Supabase writes',
        status: 'pending',
        note: 'Пока есть schema/wrapper/dry-run, но реальные writes ещё не включены.'
      },
      {
        id: 'telegram_live',
        label: 'Real Telegram Mini App testing',
        status: 'pending',
        note: 'Потребуется твой бот, Vercel URL, телефон и реальные env.'
      },
      {
        id: 'car_context_synced',
        label: 'Car/taxi reality context',
        status: 'done',
        note: `Синхронизировано: ${finflowCarReality.car}, расход ${finflowCarReality.consumptionLitersPer100KmRange[0]}–${finflowCarReality.consumptionLitersPer100KmRange[1]} л/100 км, Drivee ~${Math.round(finflowCarReality.driveeRateApprox * 100)}%.`
      },
      {
        id: 'bank_context_synced',
        label: 'Bank statement context',
        status: 'done',
        note: `Банк обработан как review candidates: ${finflowBankReality.candidateRows} строк, не финальная бухгалтерия.`
      },
      {
        id: 'ai_partner_context_synced',
        label: 'AI partner context',
        status: 'done',
        note: `Роль: ${finflowAiPartnerReality.role}; проект ведётся как долгосрочная система, а не разовая задача.`
      }
    ],
    nextMilestones: [
      {
        id: 'm1',
        label: 'Real Supabase profile resolver',
        status: 'pending',
        note: 'Server-only select/create профиля за feature flag.'
      },
      {
        id: 'm2',
        label: 'Cloud sync for records/funds',
        status: 'pending',
        note: 'Синхронизация ежедневных записей, фондов и обязательств.'
      },
      {
        id: 'm3',
        label: 'Telegram device test',
        status: 'pending',
        note: 'Запуск mini app на телефоне через реального Telegram-бота.'
      }
    ]
  };
}
