import type { DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';

export const storageKey = 'finflow.dailyQuickInput.v1_47';
export const recordsStorageKey = 'finflow.dailyRecords.v1_47';
export const customTemplatesStorageKey = 'finflow.customRecordTemplates.v1_47';
export const bankDecisionsStorageKey = 'finflow.bankCandidateDecisions.v1_47';

export type DailyQuickInputView = 'daily' | 'money' | 'work' | 'funds' | 'ai' | 'system' | 'legacy';

export type ExpensePreset = {
  id: string;
  title: string;
  amount: number;
  type: DayCoreTaskInput['type'];
  priority: DayCoreTaskInput['priority'];
};

export const orderPresets = [300, 500, 700, 1000, 1500];
export const fuelPresets = [500, 1000, 1500, 2000];
export const expensePresets: ExpensePreset[] = [
  { id: 'food', title: 'Еда', amount: 500, type: 'food', priority: 'high' },
  { id: 'meeting', title: 'Встреча', amount: 1500, type: 'meeting', priority: 'high' },
  { id: 'products', title: 'Продукты', amount: 1000, type: 'admin', priority: 'normal' },
  { id: 'car-small', title: 'Машина мелкое', amount: 1000, type: 'car', priority: 'high' }
];
