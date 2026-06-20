export const TELEGRAM_WEB_APP_BRIDGE_VERSION = 'telegram_web_app_bridge_v2_04' as const;

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe: {
    user?: TelegramWebAppUser;
    auth_date?: number;
    hash?: string;
    [key: string]: unknown;
  };
  version?: string;
  platform?: string;
  colorScheme?: 'light' | 'dark';
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  ready: () => void;
  expand: () => void;
  close?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

/**
 * Returns the Telegram WebApp bridge if the app is actually running inside
 * Telegram (Mini App webview) and the SDK script has loaded. Returns null
 * in any other context (plain browser, SSR) instead of throwing, so the
 * rest of the app can degrade gracefully to local/browser mode.
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

/**
 * True only when the SDK is present AND Telegram actually handed us
 * initData (i.e. we are really inside a Telegram client, not just a
 * browser tab that happens to have the script loaded).
 */
export function isRunningInsideTelegram(): boolean {
  const webApp = getTelegramWebApp();
  return Boolean(webApp && webApp.initData);
}
