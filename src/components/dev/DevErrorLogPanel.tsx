'use client';

import { useEffect, useState } from 'react';
import {
  appendErrorLog,
  clearErrorLog,
  createErrorLogItem,
  DevErrorLogItem,
  readErrorLog
} from '@/lib/error-log/errorLog';

export function DevErrorLogPanel() {
  const [items, setItems] = useState<DevErrorLogItem[]>([]);

  const refresh = () => setItems(readErrorLog());

  useEffect(() => {
    refresh();

    const onError = (event: ErrorEvent) => {
      appendErrorLog(createErrorLogItem({
        source: 'window.onerror',
        message: event.message,
        stack: event.error?.stack
      }));
      refresh();
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      appendErrorLog(createErrorLogItem({
        source: 'unhandledrejection',
        message: String(event.reason?.message ?? event.reason),
        stack: event.reason?.stack
      }));
      refresh();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  const addTestLog = () => {
    appendErrorLog(createErrorLogItem({
      source: 'manual test',
      message: 'Проверочная запись Dev Error Log'
    }));
    refresh();
  };

  const clear = () => {
    clearErrorLog();
    refresh();
  };

  return (
    <section className="dev-panel">
      <h3>Dev / Error Log</h3>
      <p className="card-description">Ошибки интерфейса сохраняются локально. Позже подключим Supabase.</p>
      <div className="dev-actions">
        <button className="dev-button" type="button" onClick={addTestLog}>+ тест лог</button>
        <button className="dev-button" type="button" onClick={clear}>очистить</button>
      </div>

      {items.length === 0 ? (
        <div className="dev-log-item">Ошибок пока нет.</div>
      ) : (
        items.map(item => (
          <div className="dev-log-item" key={item.id}>
            <b>{new Date(item.createdAt).toLocaleString('ru-RU')}</b><br />
            {item.source}: {item.message}<br />
            <span>status: {item.status}</span>
          </div>
        ))
      )}
    </section>
  );
}
