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

const NAV_TABS: { id: NavTabId; emoji: string; label: string }[] = [
  { id: 'day', emoji: '🌌', label: 'День' },
  { id: 'money', emoji: '💰', label: 'Деньги' },
  { id: 'work', emoji: '🚕', label: 'Работа' },
  { id: 'funds', emoji: '🏦', label: 'Фонды' },
  { id: 'ai', emoji: '🧠', label: 'AI' },
  { id: 'system', emoji: '⚙️', label: 'Система' }
];

const SYSTEM_SECTIONS: { id: SystemSectionId; emoji: string; title: string; shortTitle: string; description: string; status: string; primary?: boolean }[] = [
  {
    id: 'telegram',
    emoji: '📱',
    title: 'Telegram / Device test',
    shortTitle: 'Telegram',
    description: 'BotFather, Vercel staging, initData, viewport и real device test.',
    status: 'текущий шаг',
    primary: true
  },
  {
    id: 'overview',
    emoji: '📊',
    title: 'Готовность / аудит',
    shortTitle: 'Аудит',
    description: 'Проценты готовности, риски, next actions и общий status проекта.',
    status: 'обзор'
  },
  {
    id: 'cloud',
    emoji: '☁️',
    title: 'Cloud sync / Supabase',
    shortTitle: 'Cloud',
    description: 'Safe cloud read/write flow, manual conflict wizard, feature flags.',
    status: 'writes off'
  },
  {
    id: 'backup',
    emoji: '🧯',
    title: 'Backup / Restore',
    shortTitle: 'Backup',
    description: 'Локальные backup, restore-preview и защита перед облачными тестами.',
    status: 'safety'
  },
  {
    id: 'deploy',
    emoji: '🚀',
    title: 'Deploy / QA',
    shortTitle: 'Deploy',
    description: 'Private deploy checklist, acceptance runner, Vercel readiness.',
    status: 'staging'
  },
  {
    id: 'dev',
    emoji: '🛠️',
    title: 'Dev / logs',
    shortTitle: 'Dev',
    description: 'Технический журнал, ошибки, dev-only панели.',
    status: 'служебное'
  }
];

function SystemSectionHeader(props: { section: typeof SYSTEM_SECTIONS[number] }) {
  return (
    <div className="system-section-header">
      <span>{props.section.emoji} {props.section.status}</span>
      <h2>{props.section.title}</h2>
      <p>{props.section.description}</p>
    </div>
  );
}

export function DashboardShell() {
  const dailyLiveOriginId = useMemo(() => createDailyLiveStateOriginId(), []);
  const [liveDayInput, setLiveDayInput] = useState(dayCoreInputMock);
  const [activeTab, setActiveTab] = useState<NavTabId>('day');
  const [activeSystemSection, setActiveSystemSection] = useState<SystemSectionId>('telegram');
  const [dailyLiveStateSyncedAt, setDailyLiveStateSyncedAt] = useState('');

  const activeSystemMeta = useMemo(() => SYSTEM_SECTIONS.find(section => section.id === activeSystemSection) ?? SYSTEM_SECTIONS[0], [activeSystemSection]);

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

  return (
    <>
      <main className="app-shell">
        <header className="topbar">
          <div className="logo">
            <div className="logo-title">FinFlow</div>
            <div className="logo-subtitle">{dayCoreMock.version} • Day Core • live-state v2.00 • session v2.01 • staging/device v2.04.1 • system UX v2.05</div>
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
            <section className="card system-hub-card">
              <div className="section-kicker">v2.05 • System menu polish</div>
              <h2 className="card-heading">Система без бесконечной прокрутки</h2>
              <p className="card-description">
                Технические панели разделены по кнопкам. Сейчас тебе нужен раздел <b>Telegram</b>: там лежит Real Telegram Device Test.
              </p>
              <div className="system-section-grid" role="tablist" aria-label="Разделы System">
                {SYSTEM_SECTIONS.map(section => (
                  <button
                    key={section.id}
                    type="button"
                    role="tab"
                    aria-selected={activeSystemSection === section.id}
                    className={`system-section-button${activeSystemSection === section.id ? ' active' : ''}${section.primary ? ' primary' : ''}`}
                    onClick={() => setActiveSystemSection(section.id)}
                  >
                    <span className="system-section-emoji">{section.emoji}</span>
                    <b>{section.shortTitle}</b>
                    <small>{section.status}</small>
                  </button>
                ))}
              </div>
              <div className="system-now-card">
                <span>Открыто сейчас</span>
                <b>{activeSystemMeta.emoji} {activeSystemMeta.title}</b>
                <p>{activeSystemMeta.description}</p>
              </div>
            </section>

            <SystemSectionHeader section={activeSystemMeta} />

            {activeSystemSection === 'telegram' && (
              <>
                <TelegramDeviceTestPanel />
                <TelegramStagingDeployPanel />
                <TelegramSupabaseVerificationChecklistPanel />
              </>
            )}

            {activeSystemSection === 'overview' && <EcosystemReadinessBoard />}

            {activeSystemSection === 'cloud' && (
              <>
                <DailyQuickInputPanel view="system" onDayInputChange={setLiveDayInput} />
                <ManualCloudTestWizardPanel />
              </>
            )}

            {activeSystemSection === 'backup' && <BrowserLocalStorageBackupPanel />}

            {activeSystemSection === 'deploy' && (
              <>
                <PrivateDeploymentPanel />
                <DeploymentAcceptanceTestRunnerPanel />
              </>
            )}

            {activeSystemSection === 'dev' && <DevErrorLogPanel />}
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
