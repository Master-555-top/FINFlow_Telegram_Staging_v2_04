'use client';

import { useEffect, useMemo, useState } from 'react';
import { DayCoreDashboard } from '@/components/day-core/DayCoreDashboard';
import { NetCalculationPanel } from '@/components/day-core/NetCalculationPanel';
import { DailyQuickInputPanel } from '@/components/day-core/DailyQuickInputPanel';
import { LiveTimeWidget, TimeOfDayPill } from '@/components/live/LiveTimeWidget';
import { TelegramSessionPill } from '@/components/telegram/TelegramSessionPill';
import { TelegramDeviceTestPanel } from '@/components/deployment/TelegramDeviceTestPanel';
import { TelegramSupabasePreflightPanel } from '@/components/deployment/TelegramSupabasePreflightPanel';
import { SleepDashboard } from '@/components/sleep/SleepDashboard';
import { ImportReviewQueuePanel } from '@/components/import-review/ImportReviewQueuePanel';
import { dayCoreMock } from '@/lib/day-core/dayCoreModel';
import { dayCoreInputMock } from '@/lib/day-core/dayCoreInputModel';
import { createDailyLiveStateOriginId, readDailyLiveStateSnapshot, subscribeDailyLiveState } from '@/lib/day-core/dailyLiveStatePersistence';
import { APP_UI_VERSION } from '@/lib/appVersion';
import { AppIcon, type IconName } from '@/components/ui/AppIcon';
import { useTelegramViewportCss } from '@/lib/telegram/useTelegramViewportCss';
import { DataResetPanel } from '@/components/system/DataResetPanel';
import { DataStoragePanel } from '@/components/system/DataStoragePanel';
import { SectionHistoryPanel } from '@/components/history/SectionHistoryPanel';
import { EcosystemReadinessBoard } from '@/components/project/EcosystemReadinessBoard';
import { GlobalDataBackbonePanel } from '@/components/system/GlobalDataBackbonePanel';
import { TemplatesEnginePanel } from '@/components/templates/TemplatesEnginePanel';
import { SupabaseStagingPanel } from '@/components/cloud/SupabaseStagingPanel';
import { CloudSyncQueuePanel } from '@/components/cloud/CloudSyncQueuePanel';
import { N8nAutomationPanel } from '@/components/automation/N8nAutomationPanel';
import { LocalApplyCenterPanel } from '@/components/apply/LocalApplyCenterPanel';
import { CsvJsonImportMapperPanel } from '@/components/import-review/CsvJsonImportMapperPanel';
import { RealDataWeekTestPanel } from '@/components/project/RealDataWeekTestPanel';
import { RealUsageGapsPanel } from '@/components/project/RealUsageGapsPanel';
import { FinalLocalMvpSmokePanel } from '@/components/project/FinalLocalMvpSmokePanel';
import { ReleaseCandidatePanel } from '@/components/project/ReleaseCandidatePanel';
import { GlobalRedesignAcceptancePanel } from '@/components/project/GlobalRedesignAcceptancePanel';
import { createInitialDailyRecordsFromInput } from '@/lib/day-core/dailyRecordsModel';

type NavTabId = 'day' | 'money' | 'work' | 'funds' | 'sleep' | 'ai' | 'system';
type SystemSectionId = 'telegram' | 'overview' | 'data' | 'cloud' | 'backup' | 'qa' | 'dev';
type SystemSubsectionId =
  | 'data_backbone'
  | 'data_templates'
  | 'data_apply'
  | 'data_mapper'
  | 'telegram_device'
  | 'telegram_preflight'
  | 'telegram_launch'
  | 'telegram_checklist'
  | 'overview_readiness'
  | 'cloud_staging'
  | 'cloud_center'
  | 'cloud_wizard'
  | 'cloud_n8n'
  | 'backup_local'
  | 'data_reset'
  | 'data_storage'
  | 'qa_guide'
  | 'qa_week_test'
  | 'qa_gaps'
  | 'qa_mvp_smoke'
  | 'qa_release_candidate'
  | 'qa_design_acceptance'
  | 'deploy_readiness'
  | 'deploy_acceptance'
  | 'dev_logs';
type SystemSubsectionMeta = {
  id: SystemSubsectionId;
  label: string;
};

type SystemSectionMeta = {
  id: SystemSectionId;
  icon: IconName;
  title: string;
  shortTitle: string;
  accent: 'cyan' | 'violet' | 'blue' | 'magenta' | 'green' | 'amber';
  primary?: boolean;
  subsections: SystemSubsectionMeta[];
};

type TabCommandMeta = {
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
};

type SystemRow = {
  icon: IconName;
  title: string;
  meta: string;
  tone?: 'ok' | 'safe' | 'warn' | 'info';
};

const SYSTEM_UI_VERSION = APP_UI_VERSION;

const NAV_TABS: { id: NavTabId; icon: IconName; label: string }[] = [
  { id: 'day', icon: 'day', label: 'День' },
  { id: 'money', icon: 'money', label: 'Деньги' },
  { id: 'work', icon: 'work', label: 'Работа' },
  { id: 'funds', icon: 'funds', label: 'Фонды' },
  { id: 'sleep', icon: 'sleep', label: 'Сон' },
  { id: 'ai', icon: 'ai', label: 'AI' },
  { id: 'system', icon: 'system', label: 'Система' }
];

const COMMAND_CENTER_META: Record<Exclude<NavTabId, 'system'>, TabCommandMeta> = {
  day: {
    eyebrow: '',
    title: 'День',
    description: '',
    chips: []
  },
  money: {
    eyebrow: '',
    title: 'Деньги',
    description: '',
    chips: []
  },
  work: {
    eyebrow: '',
    title: 'Работа',
    description: '',
    chips: []
  },
  funds: {
    eyebrow: '',
    title: 'Фонды',
    description: '',
    chips: []
  },
  sleep: {
    eyebrow: '',
    title: 'Сон',
    description: '',
    chips: []
  },
  ai: {
    eyebrow: '',
    title: 'AI',
    description: '',
    chips: []
  }
};

const SYSTEM_SECTIONS: SystemSectionMeta[] = [
  {
    id: 'telegram',
    icon: 'telegram',
    title: 'Telegram',
    shortTitle: 'Telegram',
    accent: 'cyan',
    primary: true,
    subsections: [
      { id: 'telegram_device', label: 'Проверка' },
      { id: 'telegram_preflight', label: 'Перед стартом' },
      { id: 'telegram_launch', label: 'Старт' },
      { id: 'telegram_checklist', label: 'Безопасность' }
    ]
  },
  {
    id: 'overview',
    icon: 'audit',
    title: 'Аудит',
    shortTitle: 'Аудит',
    accent: 'violet',
    subsections: [
      { id: 'overview_readiness', label: 'Готовность' }
    ]
  },

  {
    id: 'data',
    icon: 'backup',
    title: 'Данные',
    shortTitle: 'Данные',
    accent: 'amber',
    subsections: [
      { id: 'data_backbone', label: 'Основа' },
      { id: 'data_templates', label: 'Шаблоны' },
      { id: 'data_apply', label: 'Применить' },
      { id: 'data_mapper', label: 'Импорт' },
      { id: 'data_storage', label: 'Хранилище' },
      { id: 'data_reset', label: 'Сброс' }
    ]
  },
  {
    id: 'cloud',
    icon: 'cloud',
    title: 'Cloud',
    shortTitle: 'Cloud',
    accent: 'blue',
    subsections: [
      { id: 'cloud_staging', label: 'Проверка' },
      { id: 'cloud_center', label: 'Синхронизация' },
      { id: 'cloud_wizard', label: 'Пошагово' },
      { id: 'cloud_n8n', label: 'Автоматизация' }
    ]
  },
  {
    id: 'backup',
    icon: 'backup',
    title: 'Backup',
    shortTitle: 'Backup',
    accent: 'magenta',
    subsections: [
      { id: 'backup_local', label: 'Копии' }
    ]
  },
  {
    id: 'qa',
    icon: 'qa',
    title: 'QA',
    shortTitle: 'QA',
    accent: 'green',
    subsections: [
      { id: 'qa_guide', label: 'План' },
      { id: 'qa_week_test', label: 'Неделя' },
      { id: 'qa_gaps', label: 'Проблемы' },
      { id: 'qa_mvp_smoke', label: 'Готовность' },
      { id: 'qa_release_candidate', label: 'Финал' },
      { id: 'qa_design_acceptance', label: 'Дизайн' },
      { id: 'deploy_readiness', label: 'Публикация' },
      { id: 'deploy_acceptance', label: 'Проверка' }
    ]
  },
  {
    id: 'dev',
    icon: 'dev',
    title: 'Dev',
    shortTitle: 'Dev',
    accent: 'blue',
    subsections: [
      { id: 'dev_logs', label: 'Журнал' }
    ]
  }
];

const DEFAULT_SYSTEM_SUBSECTIONS: Record<SystemSectionId, SystemSubsectionId> = {
  telegram: 'telegram_device',
  overview: 'overview_readiness',
  data: 'data_backbone',
  cloud: 'cloud_staging',
  backup: 'backup_local',
  qa: 'qa_guide',
  dev: 'dev_logs'
};

const SYSTEM_ROWS: Record<Exclude<SystemSubsectionId, 'telegram_device' | 'telegram_preflight' | 'data_backbone' | 'data_templates' | 'data_apply' | 'data_mapper' | 'data_reset' | 'data_storage' | 'cloud_staging' | 'cloud_n8n' | 'qa_week_test' | 'qa_gaps' | 'qa_mvp_smoke' | 'qa_release_candidate' | 'qa_design_acceptance'>, SystemRow[]> = {
  telegram_launch: [
    { icon: 'telegram', title: 'Ссылка приложения', meta: 'домен подключён', tone: 'ok' },
    { icon: 'sync', title: 'Публикация', meta: 'чистый пакет', tone: 'ok' },
    { icon: 'check', title: 'Ключи', meta: 'только на сервере', tone: 'safe' }
  ],
  telegram_checklist: [
    { icon: 'check', title: 'Вход скрыт', meta: 'без лишнего на экране', tone: 'ok' },
    { icon: 'check', title: 'Запись в облако', meta: 'только после проверки', tone: 'safe' },
    { icon: 'warn', title: 'Секреты', meta: 'только настройки сервера', tone: 'safe' }
  ],
  overview_readiness: [
    { icon: 'audit', title: 'День', meta: 'готов', tone: 'ok' },
    { icon: 'money', title: 'Деньги', meta: 'готово', tone: 'ok' },
    { icon: 'work', title: 'Работа', meta: 'готово', tone: 'ok' },
    { icon: 'cloud', title: 'Облако', meta: 'без записи', tone: 'safe' }
  ],
  cloud_center: [
    { icon: 'sync', title: 'Синхронизация', meta: 'пока без записи', tone: 'safe' },
    { icon: 'telegram', title: 'Telegram', meta: 'подключён', tone: 'ok' },
    { icon: 'warn', title: 'Запись', meta: 'после проверки', tone: 'safe' }
  ],
  cloud_wizard: [
    { icon: 'backup', title: 'Копия', meta: 'сначала сохранить', tone: 'safe' },
    { icon: 'cloud', title: 'Проверка облака', meta: 'после настройки', tone: 'info' },
    { icon: 'check', title: 'Применение', meta: 'только вручную', tone: 'safe' }
  ],
  backup_local: [
    { icon: 'backup', title: 'Создать', meta: 'локальный бэкап', tone: 'ok' },
    { icon: 'sync', title: 'Восстановить', meta: 'сначала проверить', tone: 'info' },
    { icon: 'log', title: 'История', meta: 'точки отката', tone: 'info' }
  ],
  qa_guide: [
    { icon: 'check', title: 'Экран системы', meta: 'без лишнего скролла', tone: 'ok' },
    { icon: 'telegram', title: 'Telegram', meta: 'открывается', tone: 'ok' },
    { icon: 'cloud', title: 'Облако', meta: 'только проверка', tone: 'safe' }
  ],
  deploy_readiness: [
    { icon: 'check', title: 'Публикация', meta: 'страница открывается', tone: 'ok' },
    { icon: 'telegram', title: 'Telegram', meta: 'готово', tone: 'ok' },
    { icon: 'cloud', title: 'Облако', meta: 'позже', tone: 'safe' }
  ],
  deploy_acceptance: [
    { icon: 'check', title: 'Ручная проверка', meta: 'после публикации', tone: 'info' },
    { icon: 'system', title: 'Экран', meta: 'кнопки и отступы', tone: 'info' },
    { icon: 'warn', title: 'Безопасность', meta: 'без токенов на скринах', tone: 'safe' }
  ],
  dev_logs: [
    { icon: 'warn', title: 'Ошибки', meta: 'журнал', tone: 'info' },
    { icon: 'dev', title: 'Инструменты', meta: 'для проверки', tone: 'info' },
    { icon: 'log', title: 'Состояние', meta: 'актуально', tone: 'info' }
  ]
};

function SectionCommandCenter(props: { activeTab: Exclude<NavTabId, 'system'>; syncedAt: string }) {
  const meta = COMMAND_CENTER_META[props.activeTab];
  const lastSync = props.syncedAt
    ? new Date(props.syncedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : 'ожидаю ввод';

  return (
    <section className={`redesign-command-center redesign-command-center--${props.activeTab}`}>
      <div className="redesign-command-main">
        {meta.eyebrow ? <div className="redesign-command-kicker">{meta.eyebrow}</div> : null}
        <h1>{meta.title}</h1>
        {meta.description ? <p>{meta.description}</p> : null}
        {meta.chips.length ? (
          <div className="redesign-command-chips">
            {meta.chips.map(chip => <span key={chip}>{chip}</span>)}
          </div>
        ) : null}
      </div>
      <div className="redesign-command-side" aria-label="Состояние приложения">
        <div className="redesign-status-row">
          <TelegramSessionPill />
          <TimeOfDayPill />
        </div>
        <div className="redesign-sync-card">
          <span>Обновлено</span>
          <b>{lastSync}</b>
          <small>Данные связаны между разделами</small>
        </div>
      </div>
    </section>
  );
}

export function DashboardShell() {
  const dailyLiveOriginId = useMemo(() => createDailyLiveStateOriginId(), []);
  const [liveDayInput, setLiveDayInput] = useState(dayCoreInputMock);
  const [activeTab, setActiveTab] = useState<NavTabId>('day');
  const [activeSystemSection, setActiveSystemSection] = useState<SystemSectionId | null>(null);
  const [activeSystemSubsection, setActiveSystemSubsection] = useState<Record<SystemSectionId, SystemSubsectionId>>(DEFAULT_SYSTEM_SUBSECTIONS);
  const [dailyLiveStateSyncedAt, setDailyLiveStateSyncedAt] = useState('');
  const systemTemplateRecords = useMemo(() => createInitialDailyRecordsFromInput(liveDayInput), [liveDayInput]);

  const activeSystemMeta = useMemo(
    () => SYSTEM_SECTIONS.find(section => section.id === activeSystemSection) ?? null,
    [activeSystemSection]
  );

  const currentSystemSubsection = activeSystemSection ? activeSystemSubsection[activeSystemSection] : null;

  useEffect(() => {
    const snapshot = readDailyLiveStateSnapshot();
    if (snapshot) {
      setLiveDayInput(snapshot.dayInput);
      setDailyLiveStateSyncedAt(snapshot.savedAtIso);
    }

    return subscribeDailyLiveState(nextSnapshot => {
      if (nextSnapshot.originTabId === dailyLiveOriginId) return;
      setLiveDayInput(nextSnapshot.dayInput);
      setDailyLiveStateSyncedAt(nextSnapshot.savedAtIso);
    });
  }, [dailyLiveOriginId]);

  function openSystemSection(sectionId: SystemSectionId) {
    setActiveSystemSection(sectionId);
    setActiveSystemSubsection(prev => ({
      ...prev,
      [sectionId]: prev[sectionId] ?? DEFAULT_SYSTEM_SUBSECTIONS[sectionId]
    }));
  }

  function renderSystemSubsectionContent(subsectionId: SystemSubsectionId) {
    if (subsectionId === 'telegram_device') return <TelegramDeviceTestPanel />;
    if (subsectionId === 'telegram_preflight') return <TelegramSupabasePreflightPanel />;
    if (subsectionId === 'overview_readiness') return <EcosystemReadinessBoard />;
    if (subsectionId === 'data_backbone') return <GlobalDataBackbonePanel />;
    if (subsectionId === 'data_templates') return <TemplatesEnginePanel dayInput={liveDayInput} records={systemTemplateRecords} customTemplates={[]} />;
    if (subsectionId === 'data_apply') return <LocalApplyCenterPanel dayInput={liveDayInput} records={systemTemplateRecords} customTemplates={[]} />;
    if (subsectionId === 'data_mapper') return <CsvJsonImportMapperPanel />;
    if (subsectionId === 'cloud_staging') return <SupabaseStagingPanel />;
    if (subsectionId === 'cloud_center') return <CloudSyncQueuePanel />;
    if (subsectionId === 'cloud_n8n') return <N8nAutomationPanel />;
    if (subsectionId === 'qa_week_test') return <RealDataWeekTestPanel dayInput={liveDayInput} records={systemTemplateRecords} />;
    if (subsectionId === 'qa_gaps') return <RealUsageGapsPanel dayInput={liveDayInput} records={systemTemplateRecords} />;
    if (subsectionId === 'qa_mvp_smoke') return <FinalLocalMvpSmokePanel dayInput={liveDayInput} records={systemTemplateRecords} />;
    if (subsectionId === 'qa_release_candidate') return <ReleaseCandidatePanel dayInput={liveDayInput} records={systemTemplateRecords} />;
    if (subsectionId === 'qa_design_acceptance') return <GlobalRedesignAcceptancePanel dayInput={liveDayInput} records={systemTemplateRecords} />;
    if (subsectionId === 'data_storage') return <DataStoragePanel />;
    if (subsectionId === 'data_reset') return <DataResetPanel />;
    return <SystemRows rows={SYSTEM_ROWS[subsectionId]} />;
  }

  const shouldShowDailyChrome = activeTab !== 'system' && activeTab !== 'sleep';

  return (
    <>
      <main className={`app-shell app-shell--${activeTab}`}>
        {activeTab !== 'system' && <SectionCommandCenter activeTab={activeTab} syncedAt={dailyLiveStateSyncedAt} />}

        {shouldShowDailyChrome && <LiveTimeWidget />}

        {activeTab === 'day' && (
          <>
            <DayCoreDashboard dayInput={liveDayInput} />
            <DailyQuickInputPanel view="daily" onDayInputChange={setLiveDayInput} />
          </>
        )}

        {activeTab === 'money' && (
          <>
            <NetCalculationPanel dayInput={liveDayInput} />
            <DailyQuickInputPanel view="money" onDayInputChange={setLiveDayInput} />
            <SectionHistoryPanel title="Деньги" subtitle="Доходы, расходы и обязательства." sections={['records', 'bank', 'templates']} />
            <ImportReviewQueuePanel />
          </>
        )}

        {activeTab === 'work' && (
          <>
            <DailyQuickInputPanel view="work" onDayInputChange={setLiveDayInput} />
            <SectionHistoryPanel title="Работа" subtitle="Смены, заказы, топливо." sections={['records', 'fuel']} />
          </>
        )}
        {activeTab === 'funds' && (
          <>
            <DailyQuickInputPanel view="funds" onDayInputChange={setLiveDayInput} />
            <SectionHistoryPanel title="Фонды" subtitle="Цели и обязательства." sections={['funds']} />
          </>
        )}
        {activeTab === 'sleep' && <SleepDashboard dayInput={liveDayInput} />}
        {activeTab === 'ai' && (
          <>
            <DailyQuickInputPanel view="ai" onDayInputChange={setLiveDayInput} />
            <SectionHistoryPanel title="AI контекст" subtitle="Советы по дню и деньгам." sections={['day', 'sleep', 'records']} />
          </>
        )}

        {activeTab === 'system' && (
          <section className="premium-screen system-premium-screen">
            {!activeSystemMeta ? (
              <>
                <div className="premium-screen-head">
                  <h1>Система</h1>
                  <span>{SYSTEM_UI_VERSION}</span>
                </div>
                <div className="system-premium-grid" role="tablist" aria-label="Разделы системы">
                  {SYSTEM_SECTIONS.map(section => (
                    <button
                      key={section.id}
                      type="button"
                      role="tab"
                      aria-selected={false}
                      className={`system-premium-tile tone-${section.accent}${section.primary ? ' primary' : ''}`}
                      onClick={() => openSystemSection(section.id)}
                    >
                      <AppIcon name={section.icon} />
                      <b>{section.shortTitle}</b>
                      <i />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="premium-screen-head detail">
                  <button type="button" className="premium-back-button" onClick={() => setActiveSystemSection(null)} aria-label="Назад к разделам">
                    ←
                  </button>
                  <h1>{activeSystemMeta.shortTitle}</h1>
                  <span>{SYSTEM_UI_VERSION}</span>
                </div>

                {activeSystemMeta.subsections.length > 1 ? (
                  <div className="premium-segmented" role="tablist" aria-label={`${activeSystemMeta.shortTitle} разделы`}>
                    {activeSystemMeta.subsections.map(subsection => (
                      <button
                        key={subsection.id}
                        type="button"
                        role="tab"
                        aria-selected={currentSystemSubsection === subsection.id}
                        className={currentSystemSubsection === subsection.id ? 'active' : ''}
                        onClick={() => setActiveSystemSubsection(prev => ({ ...prev, [activeSystemMeta.id]: subsection.id }))}
                      >
                        {subsection.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="system-premium-window">
                  {currentSystemSubsection ? renderSystemSubsectionContent(currentSystemSubsection) : null}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <nav className="bottom-nav premium-bottom-nav" aria-label="Главная навигация">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`nav-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <AppIcon name={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

function SystemRows(props: { rows: SystemRow[] }) {
  return (
    <div className="system-premium-list">
      {props.rows.map(row => (
        <article className={`system-premium-row ${row.tone ?? 'info'}`} key={`${row.title}-${row.meta}`}>
          <span className="row-icon"><AppIcon name={row.icon} /></span>
          <div>
            <b>{row.title}</b>
            <small>{row.meta}</small>
          </div>
          <em>›</em>
        </article>
      ))}
    </div>
  );
}
