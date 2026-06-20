import crypto from 'crypto';

export const TELEGRAM_INIT_DATA_VERSION = 'telegram_init_data_v1_50' as const;

export type TelegramInitDataValidationResult = {
  ok: boolean;
  reason?: string;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  authDate?: number;
};

export function validateTelegramInitData(initData: string, botToken: string, maxAgeSeconds = 86400): TelegramInitDataValidationResult {
  if (!initData) return { ok: false, reason: 'missing_init_data' };
  if (!botToken) return { ok: false, reason: 'missing_bot_token' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'missing_hash' };

  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (!safeEqualHex(calculatedHash, hash)) {
    return { ok: false, reason: 'invalid_hash' };
  }

  const authDateRaw = params.get('auth_date');
  const authDate = authDateRaw ? Number(authDateRaw) : undefined;
  if (!authDate || Number.isNaN(authDate)) {
    return { ok: false, reason: 'missing_auth_date' };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (authDate > nowSeconds + 30) {
    return { ok: false, reason: 'init_data_from_future' };
  }
  if (nowSeconds - authDate > maxAgeSeconds) {
    return { ok: false, reason: 'init_data_expired' };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { ok: false, reason: 'missing_user' };
  }

  try {
    const user = JSON.parse(userRaw) as Record<string, unknown>;
    if (!Number.isSafeInteger(user?.id) || Number(user.id) <= 0) return { ok: false, reason: 'missing_user_id' };
    if (user.first_name !== undefined && typeof user.first_name !== 'string') return { ok: false, reason: 'invalid_user_json' };
    if (user.last_name !== undefined && typeof user.last_name !== 'string') return { ok: false, reason: 'invalid_user_json' };
    if (user.username !== undefined && typeof user.username !== 'string') return { ok: false, reason: 'invalid_user_json' };
    if (user.language_code !== undefined && typeof user.language_code !== 'string') return { ok: false, reason: 'invalid_user_json' };
    return {
      ok: true,
      user: {
        id: Number(user.id),
        first_name: user.first_name as string | undefined,
        last_name: user.last_name as string | undefined,
        username: user.username as string | undefined,
        language_code: user.language_code as string | undefined
      },
      authDate
    };
  } catch {
    return { ok: false, reason: 'invalid_user_json' };
  }
}

function safeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}
