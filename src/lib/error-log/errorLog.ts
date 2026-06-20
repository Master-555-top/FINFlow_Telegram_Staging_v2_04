export type DevErrorLogItem = {
  id: string;
  createdAt: string;
  source: string;
  message: string;
  stack?: string;
  status: 'open' | 'reviewed' | 'fixed';
};

const STORAGE_KEY = 'finflow_dev_error_log_v1';

export function createErrorLogItem(input: {
  source: string;
  message: string;
  stack?: string;
}): DevErrorLogItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    source: input.source,
    message: input.message,
    stack: input.stack,
    status: 'open'
  };
}

export function readErrorLog(): DevErrorLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DevErrorLogItem[];
  } catch {
    return [];
  }
}

export function writeErrorLog(items: DevErrorLogItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

export function appendErrorLog(item: DevErrorLogItem) {
  const current = readErrorLog();
  writeErrorLog([item, ...current]);
}

export function clearErrorLog() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
