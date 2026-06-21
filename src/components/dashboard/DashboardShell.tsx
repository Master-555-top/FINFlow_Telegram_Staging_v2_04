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

type NavTabId = 'day' | 'money' | 'work' | 'funds' | 'sleep' | 'ai' | 'system';
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
type IconName = 'day' | 'money' | 'work' | 'funds' | 'sleep' | 'ai' | 'system' | 'telegram' | 'audit' | 'cloud' | 'backup' | 'qa' | 'dev' | 'check' | 'sync' | 'warn' | 'log';

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

const SYSTEM_UI_VERSION = 'v2.15';

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
    id: 'cloud',
    icon: 'cloud',
    title: 'Cloud',
    shortTitle: 'Cloud',
    accent: 'blue',
    subsections: [
      { id: 'cloud_center', label: 'Sync' },
      { id: 'cloud_wizard', label: 'Wizard' }
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
  cloud: 'cloud_center',
  backup: 'backup_local',
  qa: 'qa_guide',
  dev: 'dev_logs'
};

const SYSTEM_ROWS: Record<Exclude<SystemSubsectionId, 'telegram_device'>, SystemRow[]> = {
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
    { icon: 'telegram', title: 'Telegram', meta: '96%', tone: 'ok' },
    { icon: 'cloud', title: 'Cloud', meta: '82% · writes off', tone: 'safe' },
    { icon: 'system', title: 'Ecosystem', meta: '88%', tone: 'info' }
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
              <div className="logo-subtitle">{`${dayCoreMock.version} • ${SYSTEM_UI_VERSION}`}</div>
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
            <ImportReviewQueuePanel />
          </>
        )}

        {activeTab === 'work' && <DailyQuickInputPanel view="work" onDayInputChange={setLiveDayInput} />}
        {activeTab === 'funds' && <DailyQuickInputPanel view="funds" onDayInputChange={setLiveDayInput} />}
        {activeTab === 'sleep' && <SleepDashboard />}
        {activeTab === 'ai' && <DailyQuickInputPanel view="ai" onDayInputChange={setLiveDayInput} />}

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

function AppIcon(props: { name: IconName }) {
  const stroke = 'currentColor';
  const common = { fill: 'none', stroke, strokeWidth: 2.1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (props.name) {
    case 'telegram':
      return <svg viewBox="0 0 24 24"><path {...common} d="M21 4 3.8 10.9c-.8.3-.7 1.4.1 1.6l4.2 1.2 1.6 5.1c.2.7 1.1.9 1.6.3l2.3-2.8 4.3 3.2c.7.5 1.6.1 1.8-.7L22 5.2c.2-.8-.3-1.5-1-1.2Z"/><path {...common} d="m8.2 13.5 8.9-5.6-6.5 7.8"/></svg>;
    case 'audit':
      return <svg viewBox="0 0 24 24"><path {...common} d="M5 20V9"/><path {...common} d="M12 20V4"/><path {...common} d="M19 20v-7"/><path {...common} d="M3 20h18"/></svg>;
    case 'cloud':
      return <svg viewBox="0 0 24 24"><path {...common} d="M7 18h10.5a4.5 4.5 0 0 0 .5-9 6.5 6.5 0 0 0-12-2.2A5.5 5.5 0 0 0 7 18Z"/></svg>;
    case 'backup':
      return <svg viewBox="0 0 24 24"><ellipse {...common} cx="12" cy="6" rx="7" ry="3"/><path {...common} d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path {...common} d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/><path {...common} d="M15 11.5h4.5V7"/><path {...common} d="m19.5 11.5-4.8-4.8"/></svg>;
    case 'qa':
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z"/><path {...common} d="m8.5 12 2.2 2.2 4.8-5"/></svg>;
    case 'dev':
      return <svg viewBox="0 0 24 24"><path {...common} d="m8 8-4 4 4 4"/><path {...common} d="m16 8 4 4-4 4"/><path {...common} d="m14 5-4 14"/></svg>;
    case 'sleep':
      return <svg viewBox="0 0 24 24"><path {...common} d="M20 15.2A7.8 7.8 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z"/></svg>;
    case 'day':
      return <svg viewBox="0 0 24 24"><circle {...common} cx="12" cy="12" r="4"/><path {...common} d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>;
    case 'money':
      return <svg viewBox="0 0 24 24"><rect {...common} x="3" y="6" width="18" height="13" rx="3"/><path {...common} d="M3 10h18"/><path {...common} d="M7 15h4"/></svg>;
    case 'work':
      return <svg viewBox="0 0 24 24"><path {...common} d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/><rect {...common} x="4" y="6" width="16" height="14" rx="3"/><path {...common} d="M4 12h16"/></svg>;
    case 'funds':
      return <svg viewBox="0 0 24 24"><path {...common} d="M4 19h16"/><path {...common} d="M6 17V9M10 17V9M14 17V9M18 17V9"/><path {...common} d="M3 9h18L12 4 3 9Z"/></svg>;
    case 'ai':
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3v18M3 12h18"/><path {...common} d="M7 7h10v10H7z"/><path {...common} d="M5 5h2M17 5h2M5 19h2M17 19h2"/></svg>;
    case 'sync':
      return <svg viewBox="0 0 24 24"><path {...common} d="M20 7v5h-5"/><path {...common} d="M4 17v-5h5"/><path {...common} d="M18 9A7 7 0 0 0 6.5 6.5"/><path {...common} d="M6 15a7 7 0 0 0 11.5 2.5"/></svg>;
    case 'warn':
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3 2.5 20h19L12 3Z"/><path {...common} d="M12 9v5M12 17h.01"/></svg>;
    case 'log':
      return <svg viewBox="0 0 24 24"><path {...common} d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z"/><path {...common} d="M9 9h6M9 13h5"/></svg>;
    case 'check':
      return <svg viewBox="0 0 24 24"><path {...common} d="m5 12 4 4L19 6"/></svg>;
    case 'system':
    default:
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3 5 7v10l7 4 7-4V7l-7-4Z"/><path {...common} d="m8.5 9.5 3.5-2 3.5 2v5L12 16.5l-3.5-2v-5Z"/></svg>;
  }
}
