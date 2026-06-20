'use client';

import { useTelegramSession } from '@/lib/telegram/useTelegramSession';

export function TelegramSessionPill() {
  const session = useTelegramSession();

  if (session.status === 'checking') {
    return <div className="pill telegram-pill telegram-pill--checking">Telegram • проверка…</div>;
  }

  if (session.status === 'telegram_verified') {
    return (
      <div className="pill telegram-pill telegram-pill--verified">
        📱 {session.displayName ?? 'Telegram'}
      </div>
    );
  }

  if (session.status === 'telegram_failed') {
    return (
      <div className="pill telegram-pill telegram-pill--failed" title={session.reason}>
        ⚠️ Telegram: {translateReason(session.reason)}
      </div>
    );
  }

  return <div className="pill telegram-pill telegram-pill--browser">🌐 Локальный режим</div>;
}

function translateReason(reason?: string) {
  switch (reason) {
    case 'missing_bot_token':
      return 'бот не настроен';
    case 'invalid_hash':
      return 'подпись не сошлась';
    case 'init_data_expired':
      return 'сессия устарела';
    case 'network_error':
      return 'нет связи с сервером';
    default:
      return reason ?? 'ошибка проверки';
  }
}
