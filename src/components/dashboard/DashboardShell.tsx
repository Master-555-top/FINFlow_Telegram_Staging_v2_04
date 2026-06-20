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
const NAV_TABS: { id: NavTabId; emoji: string; label: string }[] = [
  { id: 'day', emoji: '🌌', label: 'День' },
  { id: 'money', emoji: '💰', label: 'Деньги' },
  { id: 'work', emoji: '🚕', label: 'Работа' },
  { id: 'funds', emoji: '🏦', label: 'Фонды' },
  { id: 'ai', emoji: '🧠', label: 'AI' },
  { id: 'system', emoji: '⚙️', label: 'Система' }
];

export function DashboardShell() {
  const dailyLiveOriginId = useMemo(() => createDailyLiveStateOriginId(), []);
  const [liveDayInput, setLiveDayInput] = useState(dayCoreInputMock);
  const [activeTab, setActiveTab] = useState<NavTabId>('day');
  const [dailyLiveStateSyncedAt, setDailyLiveStateSyncedAt] = useState('');

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
            <div className="logo-subtitle">{dayCoreMock.version} • Day Core • live-state v2.00 • session v2.01 • staging v2.03 • device test v2.04</div>
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
            <EcosystemReadinessBoard />
            <div className="section-kicker" style={{ marginTop: 4 }}>
              System/Dev: облако, Telegram, deployment, backup и проверки — отдельно от ежедневного потока
            </div>
            <DailyQuickInputPanel view="system" onDayInputChange={setLiveDayInput} />
            <BrowserLocalStorageBackupPanel />
            <TelegramStagingDeployPanel />
            <TelegramDeviceTestPanel />
            <PrivateDeploymentPanel />
            <TelegramSupabaseVerificationChecklistPanel />
            <DeploymentAcceptanceTestRunnerPanel />
            <ManualCloudTestWizardPanel />
            <DevErrorLogPanel />
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
