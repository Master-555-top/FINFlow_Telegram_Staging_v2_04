export const dashboardMock = {
  version: 'v3.0 Foundation v1',
  goals: {
    dailyGross: 11_000,
    dailyNet: 8_500,
    weeklyNet: 59_500,
    monthlyNet: 212_500
  },
  week: {
    gross: 0,
    expenses: 0,
    net: 0,
    remainingNet: 59_500
  },
  ai: {
    title: 'ИИ-решение сейчас',
    message: 'Пока подключены mock-данные. Следующий этап — Data Core и живые записи из Supabase.',
    chips: ['Realtime: локально', 'Фонды: защищены', 'Hydration: безопасно']
  }
} as const;

export function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) + '₽';
}
