'use client';

import { useEffect, useMemo, useState } from 'react';
import { DayCoreDashboard } from '@/components/day-core/DayCoreDashboard';
import { NetCalculationPanel } from '@/components/day-core/NetCalculationPanel';
import { DailyQuickInputPanel } from '@/components/day-core/DailyQuickInputPanel';
import { LiveTimeWidget, TimeOfDayPill } from '@/components/live/LiveTimeWidget';
import { TelegramSessionPill } from '@/components/telegram/TelegramSessionPill';
import { TelegramDeviceTestPanel } from '@/components/deployment/TelegramDeviceTestPanel';
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
import { createInitialDailyRecordsFromInput } from '@/lib/day-core/dailyRecordsModel';

type NavTabId = 'day' | 'money' | 'work' | 'funds' | 'sleep' | 'ai' | 'system';
type SystemSectionId = 'telegram' | 'overview' | 'data' | 'cloud' | 'backup' | 'qa' | 'dev';
type SystemSubsectionId =
  | 'data_backbone'
  | 'data_templates'
  | 'data_apply'
  | 'telegram_device'
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

const TAB_COMMANDS: Partial<Record<NavTabId, TabCommandMeta>> = {
  money: {
    eyebrow: 'Money OS',
    title: 'Деньги под контролем',
    description: 'Баланс, записи, шаблоны и review собраны как финансовый cockpit.',
    chips: ['баланс', 'review', 'шаблоны']
  },
  work: {
    eyebrow: 'Taxi Work',
    title: 'Рабочий режим',
    description: 'Заказы, смена, бензин, пробег и машина — отдельно от dev-панелей.',
    chips: ['заказы', 'топливо', 'машина']
  },
  funds: {
    eyebrow: 'Funds System',
    title: 'Фонды и обязательства',
    description: 'Цели, ремонт, подушка и временные покупки как понятные контейнеры.',
    chips: ['подушка', 'ремонт', 'обязательства']
  },
  ai: {
    eyebrow: 'AI Partner',
    title: 'Локальный помощник',
    description: 'Контекст дня, денег, работы и рисков — в одном советнике.',
    chips: ['совет', 'контекст', 'план']
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
      { id: 'telegram_device', label: 'Чек' },
      { id: 'telegram_launch', label: 'Старт' },
      { id: 'telegram_checklist', label: 'Защита' }
    ]
  },
  {
    id: 'overview',
    icon: 'audit',
    title: 'Аудит',
    shortTitle: 'Аудит',
    accent: 'violet',
    subsections: [
      { id: 'overview_readiness', label: 'Статус' }
    ]
  },

  {
    id: 'data',
    icon: 'backup',
    title: 'Данные',
    shortTitle: 'Данные',
    accent: 'amber',
    subsections: [
      { id: 'data_backbone', label: 'Backbone' },
      { id: 'data_templates', label: 'Шаблоны' },
      { id: 'data_apply', label: 'Apply' },
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
      { id: 'cloud_staging', label: 'Staging' },
      { id: 'cloud_center', label: 'Sync' },
      { id: 'cloud_wizard', label: 'Wizard' },
      { id: 'cloud_n8n', label: 'n8n' }
    ]
  },
  {
    id: 'backup',
    icon: 'backup',
    title: 'Backup',
    shortTitle: 'Backup',
    accent: 'magenta',
    subsections: [
      { id: 'backup_local', label: 'Backup' }
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
      { id: 'deploy_readiness', label: 'Статус' },
      { id: 'deploy_acceptance', label: 'Runner' }
    ]
  },
  {
    id: 'dev',
    icon: 'dev',
    title: 'Dev',
    shortTitle: 'Dev',
    accent: 'blue',
    subsections: [
      { id: 'dev_logs', label: 'Логи' }
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

const SYSTEM_ROWS: Record<Exclude<SystemSubsectionId, 'telegram_device' | 'data_backbone' | 'data_templates' | 'data_apply' | 'data_reset' | 'data_storage' | 'cloud_staging' | 'cloud_n8n'>, SystemRow[]> = {
  telegram_launch: [
    { icon: 'telegram', title: 'Mini App URL', meta: 'BotFather → стабильный домен', tone: 'ok' },
    { icon: 'sync', title: 'Vercel', meta: 'Deploy-safe пакет', tone: 'ok' },
    { icon: 'check', title: 'Env', meta: 'TELEGRAM_BOT_TOKEN server-only', tone: 'safe' }
  ],
  telegram_checklist: [
    { icon: 'check', title: 'Raw initData скрыт', meta: 'без hash в UI', tone: 'ok' },
    { icon: 'check', title: 'Cloud write off', meta: 'PUT/save не запускается', tone: 'safe' },
    { icon: 'warn', title: 'Секреты', meta: 'только Vercel env', tone: 'safe' }
  ],
  overview_readiness: [
    { icon: 'audit', title: 'Day Core', meta: '96%', tone: 'ok' },
    { icon: 'money', title: 'Money Engine', meta: '76%', tone: 'ok' },
    { icon: 'work', title: 'Work Engine', meta: '84%', tone: 'ok' },
    { icon: 'cloud', title: 'Cloud', meta: 'safe-off', tone: 'safe' }
  ],
  cloud_center: [
    { icon: 'sync', title: 'Cloud sync', meta: 'выключено', tone: 'safe' },
    { icon: 'telegram', title: 'Telegram context', meta: 'найден', tone: 'ok' },
    { icon: 'warn', title: 'Writes', meta: 'заблокировано', tone: 'safe' }
  ],
  cloud_wizard: [
    { icon: 'backup', title: 'Local backup', meta: 'сначала сохранить', tone: 'safe' },
    { icon: 'cloud', title: 'Cloud preview', meta: 'после Supabase', tone: 'info' },
    { icon: 'check', title: 'Manual apply', meta: 'только после подтверждения', tone: 'safe' }
  ],
  backup_local: [
    { icon: 'backup', title: 'Создать', meta: 'локальный бэкап', tone: 'ok' },
    { icon: 'sync', title: 'Восстановить', meta: 'preview first', tone: 'info' },
    { icon: 'log', title: 'История', meta: 'точки отката', tone: 'info' }
  ],
  qa_guide: [
    { icon: 'check', title: 'System screen', meta: 'без горизонтального скролла', tone: 'ok' },
    { icon: 'telegram', title: 'Telegram check', meta: 'verify HTTP 200', tone: 'ok' },
    { icon: 'cloud', title: 'Cloud dry-run', meta: 'safe fail допустим', tone: 'safe' }
  ],
  deploy_readiness: [
    { icon: 'check', title: 'Deploy', meta: 'HTTP 200', tone: 'ok' },
    { icon: 'telegram', title: 'Telegram', meta: 'ready', tone: 'ok' },
    { icon: 'cloud', title: 'Supabase', meta: 'optional', tone: 'safe' }
  ],
  deploy_acceptance: [
    { icon: 'check', title: 'Manual QA', meta: 'запустить после deploy', tone: 'info' },
    { icon: 'system', title: 'UI pass', meta: 'кнопки и отступы', tone: 'info' },
    { icon: 'warn', title: 'No secrets', meta: 'скрины без токенов', tone: 'safe' }
  ],
  dev_logs: [
    { icon: 'warn', title: 'Ошибки', meta: 'dev log', tone: 'info' },
    { icon: 'dev', title: 'Инструменты', meta: 'служебные утилиты', tone: 'info' },
    { icon: 'log', title: 'О приложении', meta: SYSTEM_UI_VERSION, tone: 'info' }
  ]
};

function TabCommandCard(props: { meta: TabCommandMeta }) {
  return (
    <section className="card tab-command-card">
      <div className="tab-command-orb" aria-hidden="true" />
      <div className="section-kicker">{props.meta.eyebrow}</div>
      <h2>{props.meta.title}</h2>
      <p>{props.meta.description}</p>
      <div className="tab-command-chips">
        {props.meta.chips.map(chip => <span key={chip}>{chip}</span>)}
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
    if (subsectionId === 'overview_readiness') return <EcosystemReadinessBoard />;
    if (subsectionId === 'data_backbone') return <GlobalDataBackbonePanel />;
    if (subsectionId === 'data_templates') return <TemplatesEnginePanel dayInput={liveDayInput} records={systemTemplateRecords} customTemplates={[]} />;
    if (subsectionId === 'data_apply') return <LocalApplyCenterPanel dayInput={liveDayInput} records={systemTemplateRecords} customTemplates={[]} />;
    if (subsectionId === 'cloud_staging') return <SupabaseStagingPanel />;
    if (subsectionId === 'cloud_center') return <CloudSyncQueuePanel />;
    if (subsectionId === 'cloud_n8n') return <N8nAutomationPanel />;
    if (subsectionId === 'data_storage') return <DataStoragePanel />;
    if (subsectionId === 'data_reset') return <DataResetPanel />;
    return <SystemRows rows={SYSTEM_ROWS[subsectionId]} />;
  }

  const shouldShowDailyChrome = activeTab !== 'system' && activeTab !== 'sleep';

  return (
    <>
      <main className={`app-shell app-shell--${activeTab}`}>
        {shouldShowDailyChrome && (
          <header className="topbar">
            <div className="logo">
              <div className="logo-title">FinFlow</div>
              <div className="logo-subtitle">{dayCoreMock.version}</div>
            </div>
            <div className="topbar-pills">
              <TelegramSessionPill />
              <TimeOfDayPill />
            </div>
          </header>
        )}

        {shouldShowDailyChrome && <LiveTimeWidget />}

        {shouldShowDailyChrome && (
          <div className="daily-live-state-banner">
            <b>Live-state:</b> День / Деньги / Работа / Фонды / AI читают общий локальный state.
            <span>{dailyLiveStateSyncedAt ? `Последняя синхронизация: ${new Date(dailyLiveStateSyncedAt).toLocaleTimeString('ru-RU')}` : 'Ожидаю первый ввод дня.'}</span>
          </div>
        )}

        {activeTab !== 'day' && activeTab !== 'system' && activeTab !== 'sleep' && TAB_COMMANDS[activeTab] ? (
          <TabCommandCard meta={TAB_COMMANDS[activeTab] as TabCommandMeta} />
        ) : null}

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
            <SectionHistoryPanel title="Деньги" subtitle="Только денежные записи этого раздела: доходы, расходы, банк-review и шаблоны." sections={['records', 'bank', 'templates']} />
            <ImportReviewQueuePanel />
          </>
        )}

        {activeTab === 'work' && (
          <>
            <DailyQuickInputPanel view="work" onDayInputChange={setLiveDayInput} />
            <SectionHistoryPanel title="Работа" subtitle="История смен, заказов, топлива и пробега без общей вкладки истории." sections={['records', 'fuel']} />
          </>
        )}
        {activeTab === 'funds' && (
          <>
            <DailyQuickInputPanel view="funds" onDayInputChange={setLiveDayInput} />
            <SectionHistoryPanel title="Фонды" subtitle="История фондов и обязательств берётся из live-state Дня, не из отдельной копии." sections={['funds']} />
          </>
        )}
        {activeTab === 'sleep' && <SleepDashboard dayInput={liveDayInput} />}
        {activeTab === 'ai' && (
          <>
            <DailyQuickInputPanel view="ai" onDayInputChange={setLiveDayInput} />
            <SectionHistoryPanel title="AI контекст" subtitle="AI не имеет отдельной базы: история берётся из дневных данных, задач, сна и работы." sections={['day', 'sleep', 'records']} />
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
                <div className="system-premium-grid" role="tablist" aria-label="Разделы System">
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
                  <div className="premium-segmented" role="tablist" aria-label={`${activeSystemMeta.shortTitle} окна`}>
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
