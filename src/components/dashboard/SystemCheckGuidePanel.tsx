const SYSTEM_CHECK_GROUPS = [
  {
    title: 'Навигация',
    accent: 'violet',
    checks: [
      'Вкладка Система открывается корневым экраном с кнопками, а не длинной лентой.',
      'Кнопки Telegram / Аудит / Cloud / Backup / QA / Dev открывают отдельные окна.',
      'Кнопка ← Все разделы возвращает назад без перезагрузки и без потери состояния.'
    ]
  },
  {
    title: 'Telegram',
    accent: 'cyan',
    checks: [
      'Система → Telegram → Тест показывает режим Telegram Mini App, initData bytes и viewport.',
      'После safe checks /api/telegram/verify возвращает HTTP 200 и verify ok/local_fallback.',
      'Raw initData, hash, токены и service role key нигде не видны.'
    ]
  },
  {
    title: 'API / Cloud',
    accent: 'magenta',
    checks: [
      '/api/deployment/readiness открывается и не возвращает секреты.',
      '/api/supabase/readiness может быть warning, если Supabase ещё не подключён — это нормально.',
      'GET /api/sync/day даёт safe fail FINFLOW_ENABLE_CLOUD_SYNC_not_true, пока cloud выключен.'
    ]
  },
  {
    title: 'Телефон',
    accent: 'lime',
    checks: [
      'Кнопки нажимаются пальцем, нижнее меню не перекрывает важный контент.',
      'Карточки не прилипают друг к другу, текст читается, нет слишком мелких подписей.',
      'В Telegram на телефоне нет горизонтального скролла и сломанных рамок.'
    ]
  }
] as const;

const QUICK_RESULT_GUIDE = [
  { label: 'Норма', text: 'Telegram verify OK, deployment readiness OK, cloud write off.' },
  { label: 'Допустимо', text: 'Supabase/cloud warning, пока мы не включали Supabase.' },
  { label: 'Чинить', text: 'Нет initData в Telegram, 500 на readiness, видны секреты, сломана навигация.' }
] as const;

export function SystemCheckGuidePanel() {
  return (
    <section className="system-check-guide-panel system-module-panel">
      <div className="system-check-hero">
        <span>v2.10 • QA route</span>
        <h2>Короткая проверка</h2>
        <p>После deploy: навигация, Telegram, API и мобильная читабельность. Cloud write не трогаем.</p>
      </div>

      <div className="system-check-grid">
        {SYSTEM_CHECK_GROUPS.map(group => (
          <article className={`system-check-card ${group.accent}`} key={group.title}>
            <b>{group.title}</b>
            {group.checks.map(check => <p key={check}>✓ {check}</p>)}
          </article>
        ))}
      </div>

      <div className="system-check-result-row">
        {QUICK_RESULT_GUIDE.map(item => (
          <div key={item.label}>
            <span>{item.label}</span>
            <b>{item.text}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
