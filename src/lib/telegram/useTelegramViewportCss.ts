'use client';

import { useEffect } from 'react';
import { getTelegramWebApp } from '@/lib/telegram/telegramWebApp';

type Insets = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

type TelegramViewportPayload = {
  height?: number;
  width?: number;
  isStateStable?: boolean;
  safeAreaInset?: Insets;
  contentSafeAreaInset?: Insets;
  safe_area?: Insets;
  content_safe_area?: Insets;
};

const PX_KEYS = [
  '--tg-viewport-height',
  '--tg-viewport-stable-height',
  '--tg-safe-top',
  '--tg-safe-right',
  '--tg-safe-bottom',
  '--tg-safe-left',
  '--tg-content-safe-top',
  '--tg-content-safe-right',
  '--tg-content-safe-bottom',
  '--tg-content-safe-left'
] as const;

export function useTelegramViewportCss() {
  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const setPx = (name: (typeof PX_KEYS)[number], value: unknown) => {
      const num = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
      root.style.setProperty(name, `${num}px`);
    };

    const readInsets = (source: unknown): Insets => {
      if (!source || typeof source !== 'object') return {};
      const data = source as Record<string, unknown>;
      return {
        top: data.top as number | undefined,
        right: data.right as number | undefined,
        bottom: data.bottom as number | undefined,
        left: data.left as number | undefined
      };
    };

    const apply = (payload?: TelegramViewportPayload) => {
      const raw = (webApp ?? {}) as unknown as Record<string, unknown>;
      setPx('--tg-viewport-height', payload?.height ?? raw.viewportHeight ?? window.innerHeight);
      setPx('--tg-viewport-stable-height', raw.viewportStableHeight ?? payload?.height ?? window.innerHeight);

      const safe = payload?.safeAreaInset ?? payload?.safe_area ?? readInsets(raw.safeAreaInset ?? raw.safe_area);
      const content = payload?.contentSafeAreaInset ?? payload?.content_safe_area ?? readInsets(raw.contentSafeAreaInset ?? raw.content_safe_area);
      setPx('--tg-safe-top', safe.top);
      setPx('--tg-safe-right', safe.right);
      setPx('--tg-safe-bottom', safe.bottom);
      setPx('--tg-safe-left', safe.left);
      setPx('--tg-content-safe-top', content.top ?? safe.top);
      setPx('--tg-content-safe-right', content.right ?? safe.right);
      setPx('--tg-content-safe-bottom', content.bottom ?? safe.bottom);
      setPx('--tg-content-safe-left', content.left ?? safe.left);
    };

    apply();
    webApp?.ready?.();
    webApp?.expand?.();
    webApp?.setHeaderColor?.('#050617');
    webApp?.setBackgroundColor?.('#050617');

    const onViewport = (payload?: unknown) => apply(payload as TelegramViewportPayload | undefined);
    const onSafeArea = (payload?: unknown) => apply(payload as TelegramViewportPayload | undefined);
    const onResize = () => apply();
    webApp?.onEvent?.('viewportChanged', onViewport);
    webApp?.onEvent?.('safeAreaChanged', onSafeArea);
    webApp?.onEvent?.('contentSafeAreaChanged', onSafeArea);
    window.addEventListener('resize', onResize);

    return () => {
      webApp?.offEvent?.('viewportChanged', onViewport);
      webApp?.offEvent?.('safeAreaChanged', onSafeArea);
      webApp?.offEvent?.('contentSafeAreaChanged', onSafeArea);
      window.removeEventListener('resize', onResize);
      PX_KEYS.forEach(key => root.style.removeProperty(key));
    };
  }, []);
}
