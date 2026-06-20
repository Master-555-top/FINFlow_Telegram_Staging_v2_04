import type { FinflowPersistenceAdapter } from '@/lib/persistence/finflowPersistenceTypes';

export const localPersistenceAdapter: FinflowPersistenceAdapter = {
  mode: 'local_storage',

  async loadDay() {
    return {};
  },

  async saveDay() {
    return {
      ok: true,
      warning: 'Local browser persistence is currently handled inside UI components. This adapter is a v1.49 boundary for future migration.'
    };
  }
};
