import { validateTelegramInitData, type TelegramInitDataValidationResult } from '@/lib/telegram/telegramInitData';

export const TELEGRAM_REQUEST_AUTH_VERSION = 'telegram_request_auth_v1_73' as const;

export function authenticateTelegramInitData(initData: string): TelegramInitDataValidationResult {
  const botToken = process.env.TELEGRAM_BOT_TOKEN ?? '';
  const configuredMaxAge = Number(process.env.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS ?? 3_600);
  const maxAgeSeconds = Number.isFinite(configuredMaxAge)
    ? Math.max(60, Math.min(86_400, Math.round(configuredMaxAge)))
    : 3_600;

  return validateTelegramInitData(initData, botToken, maxAgeSeconds);
}
