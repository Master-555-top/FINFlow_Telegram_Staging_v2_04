'use client';

import { useEffect, useMemo, useState } from 'react';
import { DayCoreDashboard } from '@/components/day-core/DayCoreDashboard';
import { NetCalculationPanel } from '@/components/day-core/NetCalculationPanel';
import { DailyQuickInputPanel } from '@/components/day-core/DailyQuickInputPanel';
import { DevErrorLogPanel } from '@/components/dev/DevErrorLogPanel';
import { LiveTimeWidget, TimeOfDayPill } from '@/components/live/LiveTimeWidget';
import { TelegramSessionPill } from '@/components/telegram/TelegramSessionPill';
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
type SystemSectionId = 'telegram' | 'overview' | 'cloud' | 'backup' | 'deploy' | 'dev';
type SystemSubsectionId =
  | 'telegram_device'
  | 'telegram_launch'
  | 'telegram_checklist'
  | 'overview_readiness'
  | 'cloud_center'
  | 'cloud_wizard'
  | 'backup_local'
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
    title: 'Telegram / Device test',
    shortTitle: 'Telegram',
    description: 'BotFather, Vercel staging, initData, viewport и real device test.',
    status: 'текущий шаг',
    primary: true,
    subsections: [
      { id: 'telegram_device', label: 'Тест', caption: 'initData + viewport' },
      { id: 'telegram_launch', label: 'Запуск', caption: 'BotFather + staging' },
      { id: 'telegram_checklist', label: 'Чеклист', caption: 'пошаговая проверка' }
    ]
  },
  {
    id: 'overview',
    emoji: '📊',
    title: 'Готовность / аудит',
    shortTitle: 'Аудит',
    description: 'Проценты готовности, риски, next actions и общий status проекта.',
    status: 'обзор',
    subsections: [
      { id: 'overview_readiness', label: 'Готовность', caption: 'проценты + риски' }
    ]
  },
  {
    id: 'cloud',
    emoji: '☁️',
    title: 'Cloud sync / Supabase',
    shortTitle: 'Cloud',
    description: 'Safe cloud read/write flow, manual conflict wizard и feature flags.',
    status: 'writes off',
    subsections: [
      { id: 'cloud_center', label: 'Центр', caption: 'sync + flags' },
      { id: 'cloud_wizard', label: 'Wizard', caption: 'ручной сценарий' }
    ]
  },
  {
    id: 'backup',
    emoji: '🧯',
    title: 'Backup / Restore',
    shortTitle: 'Backup',
    description: 'Локальные backup, restore-preview и защита перед облачными тестами.',
    status: 'safety',
    subsections: [
      { id: 'backup_local', label: 'Backup', caption: 'локальная защита' }
    ]
  },
  {
    id: 'deploy',
    emoji: '🚀',
    title: 'Deploy / QA',
    shortTitle: 'Deploy',
    description: 'Private deploy checklist, acceptance runner и Vercel readiness.',
    status: 'staging',
    subsections: [
      { id: 'deploy_readiness', label: 'Readiness', caption: 'deploy status' },
      { id: 'deploy_acceptance', label: 'QA', caption: 'acceptance runner' }
    ]
  },
  {
    id: 'dev',
    emoji: '🛠️',
    title: 'Dev / logs',
    shortTitle: 'Dev',
    description: 'Технический журнал, ошибки и dev-only панели.',
    status: 'служебное',
    subsections: [
      { id: 'dev_logs', label: 'Логи', caption: 'ошибки и debug' }
    ]
  }
];

const DEFAULT_SYSTEM_SUBSECTIONS: Record<SystemSectionId, SystemSubsectionId> = {
  telegram: 'telegram_device',
  overview: 'overview_readiness',
  cloud: 'cloud_center',
  backup: 'backup_local',
  deploy: 'deploy_readiness',
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
        <header className="topbar">
          <div className="logo">
            <div className="logo-title">FinFlow</div>
            <div className="logo-subtitle">{dayCoreMock.version} • Day Core • live-state v2.00 • session v2.01 • staging/device v2.04.1 • ecosystem UI v2.08</div>
          </div>
          <div className="topbar-pills">
            <TelegramSessionPill />
            <TimeOfDayPill />
          </div>
        </header>

        <LiveTimeWidget />

        <div className="daily-live-state-banner">
          <b>Live-state:</b> День / Деньги / Работа / Фонды / AI читают общий локальный state.
          <span>{dailyLiveStateSyncedAt ? `Последняя синхронизация: ${new Date(dailyLiveStateSyncedAt).toLocaleTimeString('ru-RU')}` : 'Ожидаю первый ввод дня.'}</span>
        </div>

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
              <section className="card system-root-card">
                <div className="section-kicker">v2.08 • Ecosystem UI / command center</div>
                <h2 className="card-heading">Система</h2>
                <p className="card-description">
                  Центр управления экосистемой: сначала выбираешь область, затем конкретное окно. Без простынь, без хаоса, с единым мобильным стилем.
                </p>
                <div className="system-root-highlights">
                  <span>glass UI</span>
                  <span>mobile first</span>
                  <span>safe by design</span>
                </div>

                <div className="system-section-grid system-section-grid--root" role="tablist" aria-label="Разделы System">
                  {SYSTEM_SECTIONS.map(section => (
                    <button
                      key={section.id}
                      type="button"
                      role="tab"
                      aria-selected={false}
                      className={`system-section-button${section.primary ? ' primary' : ''}`}
                      onClick={() => openSystemSection(section.id)}
                    >
                      <span className="system-section-emoji">{section.emoji}</span>
                      <b>{section.shortTitle}</b>
                      <small>{section.status}</small>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="card system-detail-shell">
                <div className="system-detail-toolbar">
                  <button type="button" className="system-back-button" onClick={() => setActiveSystemSection(null)}>
                    ← Все разделы
                  </button>
                  <div className="system-detail-path">
                    <span>Система</span>
                    <b>{activeSystemMeta.emoji} {activeSystemMeta.shortTitle}</b>
                  </div>
                </div>

                <div className="system-detail-hero">
                  <div>
                    <span>{activeSystemMeta.status}</span>
                    <h2>{activeSystemMeta.title}</h2>
                    <p>{activeSystemMeta.description}</p>
                  </div>
                  <div className="system-detail-count">
                    <strong>{activeSystemMeta.subsections.length}</strong>
                    <small>окна</small>
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
                        <small>{subsection.caption}</small>
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
