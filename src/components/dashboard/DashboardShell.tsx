'use client';

import { useEffect, useMemo, useState } from 'react';
import { DayCoreDashboard } from '@/components/day-core/DayCoreDashboard';
import { NetCalculationPanel } from '@/components/day-core/NetCalculationPanel';
import { DailyQuickInputPanel } from '@/components/day-core/DailyQuickInputPanel';
import { DevErrorLogPanel } from '@/components/dev/DevErrorLogPanel';
import { LiveTimeWidget, TimeOfDayPill } from '@/components/live/LiveTimeWidget';
import { TelegramSessionPill } from '@/components/telegram/TelegramSessionPill';
import { SystemCheckGuidePanel } from '@/components/dashboard/SystemCheckGuidePanel';
import { EcosystemReadinessBoard } from '@/components/project/EcosystemReadinessBoard';
import { ImportReviewQueuePanel } from '@/components/import-review/ImportReviewQueuePanel';
import { PrivateDeploymentPanel } from '@/components/deployment/PrivateDeploymentPanel';
import { TelegramSupabaseVerificationChecklistPanel } from '@/components/deployment/TelegramSupabaseVerificationChecklistPanel';
import { TelegramStagingDeployPanel } from '@/components/deployment/TelegramStagingDeployPanel';
import { TelegramDeviceTestPanel } from '@/components/deployment/TelegramDeviceTestPanel';
import { DeploymentAcceptanceTestRunnerPanel } from '@/components/deployment/DeploymentAcceptanceTestRunnerPanel';
import { ManualCloudTestWizardPanel } from '@/components/deployment/ManualCloudTestWizardPanel';
import { LocalBackupRestorePanel as BrowserLocalStorageBackupPanel } from '@/components/backup/LocalBackupRestorePanel';
import { dayCoreMock } from '@/lib/day-core/dayCoreModel';
import { dayCoreInputMock } from '@/lib/day-core/dayCoreInputModel';
import { createDailyLiveStateOriginId, readDailyLiveStateSnapshot, subscribeDailyLiveState } from '@/lib/day-core/dailyLiveStatePersistence';

type NavTabId = 'day' | 'money' | 'work' | 'funds' | 'ai' | 'system';
type SystemSectionId = 'telegram' | 'overview' | 'cloud' | 'backup' | 'qa' | 'dev';
type SystemSubsectionId =
  | 'telegram_device'
  | 'telegram_launch'
  | 'telegram_checklist'
  | 'overview_readiness'
  | 'cloud_center'
  | 'cloud_wizard'
  | 'backup_local'
  | 'qa_guide'
  | 'deploy_readiness'
  | 'deploy_acceptance'
  | 'dev_logs';

type SystemSubsectionMeta = {
  id: SystemSubsectionId;
  label: string;
  caption: string;
};

type SystemSectionMeta = {
  id: SystemSectionId;
  emoji: string;
  title: string;
  shortTitle: string;
  description: string;
  status: string;
  primary?: boolean;
  subsections: SystemSubsectionMeta[];
};

type TabCommandMeta = {
  eyebrow: string;
  title: string;
  description: string;
  chips: string[];
};

const SYSTEM_UI_VERSION = 'v2.14';

const NAV_TABS: { id: NavTabId; emoji: string; label: string }[] = [
  { id: 'day', emoji: '🌌', label: 'День' },
  { id: 'money', emoji: '💰', label: 'Деньги' },
  { id: 'work', emoji: '🚕', label: 'Работа' },
  { id: 'funds', emoji: '🏦', label: 'Фонды' },
  { id: 'ai', emoji: '🧠', label: 'AI' },
  { id: 'system', emoji: '⚙️', label: 'Система' }
];

const TAB_COMMANDS: Partial<Record<NavTabId, TabCommandMeta>> = {
  money: {
    eyebrow: 'Money OS',
    title: 'Деньги под контролем',
    description: 'Баланс, записи, шаблоны и review собраны как финансовый cockpit — быстро понять, что свободно, что нельзя трогать и что требует решения.',
    chips: ['баланс', 'review', 'шаблоны']
  },
  work: {
    eyebrow: 'Taxi Work',
    title: 'Рабочий режим',
    description: 'Заказы, смена, бензин, пробег и машина — без смешивания с dev-панелями и системными проверками.',
    chips: ['заказы', 'топливо', 'машина']
  },
  funds: {
    eyebrow: 'Funds System',
    title: 'Фонды и обязательства',
    description: 'Цели, ремонт, подушка и временные покупки должны жить как понятные финансовые контейнеры, а не как разрозненные заметки.',
    chips: ['подушка', 'ремонт', 'обязательства']
  },
  ai: {
    eyebrow: 'AI Partner',
    title: 'Локальный помощник',
    description: 'AI должен помогать принять решение по дню, деньгам, работе и рискам, сохраняя контекст всей экосистемы FINFlow.',
    chips: ['совет', 'контекст', 'план']
  }
};

const SYSTEM_SECTIONS: SystemSectionMeta[] = [
  {
    id: 'telegram',
    emoji: '📱',
    title: 'Telegram',
    shortTitle: 'Telegram',
    description: 'Mini App test.',
    status: 'ok',
    primary: true,
    subsections: [
      { id: 'telegram_device', label: 'Тест', caption: '' },
      { id: 'telegram_launch', label: 'Старт', caption: '' },
      { id: 'telegram_checklist', label: 'Чек', caption: '' }
    ]
  },
  {
    id: 'overview',
    emoji: '📊',
    title: 'Аудит',
    shortTitle: 'Аудит',
    description: 'Готовность и риски.',
    status: 'info',
    subsections: [
      { id: 'overview_readiness', label: 'Статус', caption: '' }
    ]
  },
  {
    id: 'cloud',
    emoji: '☁️',
    title: 'Cloud',
    shortTitle: 'Cloud',
    description: 'Cloud flags and sync.',
    status: 'off',
    subsections: [
      { id: 'cloud_center', label: 'Sync', caption: '' },
      { id: 'cloud_wizard', label: 'Wizard', caption: '' }
    ]
  },
  {
    id: 'backup',
    emoji: '🧯',
    title: 'Backup',
    shortTitle: 'Backup',
    description: 'Local safety.',
    status: 'safe',
    subsections: [
      { id: 'backup_local', label: 'Backup', caption: '' }
    ]
  },
  {
    id: 'qa',
    emoji: '✅',
    title: 'QA',
    shortTitle: 'QA',
    description: 'Post-deploy route.',
    status: 'qa',
    subsections: [
      { id: 'qa_guide', label: 'План', caption: '' },
      { id: 'deploy_readiness', label: 'Статус', caption: '' },
      { id: 'deploy_acceptance', label: 'Runner', caption: '' }
    ]
  },
  {
    id: 'dev',
    emoji: '🛠️',
    title: 'Dev',
    shortTitle: 'Dev',
    description: 'Logs.',
    status: 'dev',
    subsections: [
      { id: 'dev_logs', label: 'Логи', caption: '' }
    ]
  }
];

const DEFAULT_SYSTEM_SUBSECTIONS: Record<SystemSectionId, SystemSubsectionId> = {
  telegram: 'telegram_device',
  overview: 'overview_readiness',
  cloud: 'cloud_center',
  backup: 'backup_local',
  qa: 'qa_guide',
  dev: 'dev_logs'
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
    switch (subsectionId) {
      case 'telegram_device':
        return <TelegramDeviceTestPanel />;
      case 'telegram_launch':
        return <TelegramStagingDeployPanel />;
      case 'telegram_checklist':
        return <TelegramSupabaseVerificationChecklistPanel />;
      case 'overview_readiness':
        return <EcosystemReadinessBoard />;
      case 'cloud_center':
        return <DailyQuickInputPanel view="system" onDayInputChange={setLiveDayInput} />;
      case 'cloud_wizard':
        return <ManualCloudTestWizardPanel />;
      case 'backup_local':
        return <BrowserLocalStorageBackupPanel />;
      case 'qa_guide':
        return <SystemCheckGuidePanel />;
      case 'deploy_readiness':
        return <PrivateDeploymentPanel />;
      case 'deploy_acceptance':
        return <DeploymentAcceptanceTestRunnerPanel />;
      case 'dev_logs':
        return <DevErrorLogPanel />;
      default:
        return null;
    }
  }

  return (
    <>
      <main className={`app-shell app-shell--${activeTab}`}>
        {activeTab !== 'system' && (
          <header className="topbar">
            <div className="logo">
              <div className="logo-title">FinFlow</div>
              <div className="logo-subtitle">{`${dayCoreMock.version} • ${SYSTEM_UI_VERSION}`}</div>
            </div>
            <div className="topbar-pills">
              <TelegramSessionPill />
              <TimeOfDayPill />
            </div>
          </header>
        )}

        {activeTab !== 'system' && <LiveTimeWidget />}

        {activeTab !== 'system' && (
          <div className="daily-live-state-banner">
            <b>Live-state:</b> День / Деньги / Работа / Фонды / AI читают общий локальный state.
            <span>{dailyLiveStateSyncedAt ? `Последняя синхронизация: ${new Date(dailyLiveStateSyncedAt).toLocaleTimeString('ru-RU')}` : 'Ожидаю первый ввод дня.'}</span>
          </div>
        )}

        {activeTab !== 'day' && activeTab !== 'system' && TAB_COMMANDS[activeTab] ? (
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
            <ImportReviewQueuePanel />
          </>
        )}

        {activeTab === 'work' && <DailyQuickInputPanel view="work" onDayInputChange={setLiveDayInput} />}

        {activeTab === 'funds' && <DailyQuickInputPanel view="funds" onDayInputChange={setLiveDayInput} />}

        {activeTab === 'ai' && <DailyQuickInputPanel view="ai" onDayInputChange={setLiveDayInput} />}

        {activeTab === 'system' && (
          <>
            {!activeSystemMeta ? (
              <section className="card system-root-card system-root-card--minimal">
                <div className="system-mini-head">
                  <h2>Система</h2>
                  <small>{SYSTEM_UI_VERSION}</small>
                </div>

                <div className="system-section-grid system-section-grid--root" role="tablist" aria-label="Разделы System">
                  {SYSTEM_SECTIONS.map(section => (
                    <button
                      key={section.id}
                      type="button"
                      role="tab"
                      aria-selected={false}
                      className={`system-section-button system-section-button--${section.id}${section.primary ? ' primary' : ''}`}
                      onClick={() => openSystemSection(section.id)}
                    >
                      <span className="system-section-emoji">{section.emoji}</span>
                      <b>{section.shortTitle}</b>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="card system-detail-shell">
                <div className="system-detail-toolbar system-detail-toolbar--single">
                  <button type="button" className="system-back-button" onClick={() => setActiveSystemSection(null)} aria-label="Назад к разделам">
                    ←
                  </button>
                  <div className="system-detail-title-row system-detail-title-row--minimal">
                    <h2>{activeSystemMeta.shortTitle}</h2>
                    <span>{SYSTEM_UI_VERSION}</span>
                  </div>
                </div>

                {activeSystemMeta.subsections.length > 1 ? (
                  <div className="system-subsection-grid" role="tablist" aria-label={`${activeSystemMeta.shortTitle} окна`}>
                    {activeSystemMeta.subsections.map(subsection => (
                      <button
                        key={subsection.id}
                        type="button"
                        role="tab"
                        aria-selected={currentSystemSubsection === subsection.id}
                        className={`system-subsection-button${currentSystemSubsection === subsection.id ? ' active' : ''}`}
                        onClick={() => setActiveSystemSubsection(prev => ({ ...prev, [activeSystemMeta.id]: subsection.id }))}
                      >
                        <b>{subsection.label}</b>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="system-content-window">
                  {currentSystemSubsection ? renderSystemSubsectionContent(currentSystemSubsection) : null}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Главная навигация">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`nav-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="nav-emoji">{tab.emoji}</span>{tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}
