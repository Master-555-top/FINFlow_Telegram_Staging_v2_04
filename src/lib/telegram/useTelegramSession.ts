'use client';

import { useEffect, useState } from 'react';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

export const TELEGRAM_SESSION_HOOK_VERSION = 'telegram_session_hook_v1_92' as const;

export type TelegramSessionStatus =
  | 'checking'
  | 'browser_mode'
  | 'telegram_verified'
  | 'telegram_failed';

export type TelegramSessionState = {
  status: TelegramSessionStatus;
  displayName?: string;
  reason?: string;
  profileReady?: boolean;
};

/**
 * Real (not dry-run) client-side wiring for Telegram Mini App launch.
 *
 * - Outside Telegram (plain browser tab): resolves to `browser_mode`
 *   immediately. The rest of the app keeps working exactly as before
 *   (local-only, no Telegram identity) — nothing here is required for
 *   FinFlow to function as a normal web app.
 * - Inside Telegram: calls `webApp.ready()` / `webApp.expand()`, then
 *   POSTs the real `initData` to the existing `/api/telegram/verify`
 *   route (server-side HMAC validation against TELEGRAM_BOT_TOKEN,
 *   already implemented, previously never called from any client code).
 */
export function useTelegramSession(): TelegramSessionState {
  const [state, setState] = useState<TelegramSessionState>({ status: 'checking' });

  useEffect(() => {
    let cancelled = false;
    const webApp = getTelegramWebApp();

    if (!webApp || !webApp.initData) {
      setState({ status: 'browser_mode' });
      return;
    }

    try {
      webApp.ready();
      webApp.expand();
    } catch {
      // Telegram bridge present but degraded; verification call below still proceeds.
    }

    fetch('/api/telegram/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: webApp.initData })
    })
      .then(response => response.json().catch(() => null))
      .then(data => {
        if (cancelled) return;
        if (data?.ok) {
          setState({
            status: 'telegram_verified',
            displayName: data.profile?.displayName ?? data.profile?.display_name ?? data.telegramUser?.firstName,
            profileReady: Boolean(data.profileReady ?? data.profile?.profileReady)
          });
        } else {
          setState({ status: 'telegram_failed', reason: data?.reason ?? 'verify_failed' });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'telegram_failed', reason: 'network_error' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
