const SYSTEM_CHECK_GROUPS = [
  { title: 'Навигация', accent: 'violet', checks: ['Разделы открываются', 'Назад работает', 'Нет длинной ленты'] },
  { title: 'Telegram', accent: 'cyan', checks: ['initData есть', 'Verify HTTP 200', 'Секреты скрыты'] },
  { title: 'Cloud', accent: 'magenta', checks: ['Write off', 'Dry-run safe', 'Supabase warning допустим'] },
  { title: 'Телефон', accent: 'lime', checks: ['Нет бокового скролла', 'Кнопки крупные', 'Текст не съезжает'] }
] as const;

const QUICK_RESULT_GUIDE = [
  { label: 'OK', text: 'Telegram + Verify зелёные.' },
  { label: 'SAFE', text: 'Cloud read 503 при writes off.' },
  { label: 'FIX', text: 'Сломан layout или видны секреты.' }
] as const;

export function SystemCheckGuidePanel() {
  return (
    <section className="system-check-guide-panel system-module-panel">
      <div className="system-check-hero">
        <span>Проверка</span>
        <h2>Проверка</h2>
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
