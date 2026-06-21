import { useMemo, type Dispatch, type SetStateAction } from 'react';
import {
  DAILY_RECORD_TEMPLATES,
  createDailyRecord,
  createCustomTemplate,
  createRecordFromTemplate,
  deleteCustomTemplate,
  deleteDailyRecord,
  updateCustomTemplate,
  updateDailyRecord,
  type CustomDailyRecordTemplate,
  type DailyRecord,
  type DailyRecordCategoryTemplate,
  type DailyRecordType
} from '@/lib/day-core/dailyRecordsModel';
import {
  approveBankCandidateAsRecord,
  BANK_CANDIDATE_SAMPLE,
  getBankDecision,
  updateBankDecision,
  type BankCandidateDecision
} from '@/lib/day-core/bankCandidateReviewModel';
import type { DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';
import { formatRub } from '@/lib/day-core/dayCoreModel';
import { getRecordTypeLabel } from '@/components/day-core/DailyQuickInputShared';

export type DailyQuickInputRecordActions = ReturnType<typeof useDailyQuickInputRecordActions>;

export function useDailyQuickInputRecordActions(input: {
  customTemplates: CustomDailyRecordTemplate[];
  bankDecisions: BankCandidateDecision[];
  setRecords: Dispatch<SetStateAction<DailyRecord[]>>;
  setCustomTemplates: Dispatch<SetStateAction<CustomDailyRecordTemplate[]>>;
  setBankDecisions: Dispatch<SetStateAction<BankCandidateDecision[]>>;
}) {
  return useMemo(() => {
    function addRecord(type: DailyRecordType, title: string, amount: number, category?: string) {
      if (amount <= 0) return false;
      input.setRecords(previous => [
        createDailyRecord({ type, title, amount, category, source: 'quick_button' }),
        ...previous
      ]);
      return true;
    }

    function addOrder(amount: number) {
      return addRecord('taxi_order', `Заказ ${formatRub(amount)}`, amount, 'taxi');
    }

    function addFuel(amount: number) {
      return addRecord('fuel', `Бензин ${formatRub(amount)}`, amount, 'fuel');
    }

    function addTaskExpense(title: string, amount: number, type: DayCoreTaskInput['type'], priority: DayCoreTaskInput['priority']) {
      void priority;
      return addRecord('expense', title, amount, type);
    }

    function patchRecord(recordId: string, patch: Partial<DailyRecord>) {
      input.setRecords(previous => updateDailyRecord(previous, recordId, patch));
    }

    function removeRecord(recordId: string) {
      input.setRecords(previous => deleteDailyRecord(previous, recordId));
    }

    function addTemplateRecord(templateId: string) {
      const template = [...DAILY_RECORD_TEMPLATES, ...input.customTemplates].find(item => item.id === templateId);
      if (!template) return false;
      input.setRecords(previous => [createRecordFromTemplate(template), ...previous]);
      return true;
    }

    function addCustomTemplate(inputData: {
      label: string;
      amount: number;
      category: string;
      type: DailyRecordType;
      priority?: DailyRecordCategoryTemplate['priority'];
    }) {
      if (inputData.amount <= 0) return false;
      const template = createCustomTemplate({
        label: inputData.label || `${getRecordTypeLabel(inputData.type)} ${formatRub(inputData.amount)}`,
        type: inputData.type,
        category: inputData.category,
        defaultTitle: inputData.label || getRecordTypeLabel(inputData.type),
        defaultAmount: inputData.amount,
        priority: inputData.priority ?? (inputData.type === 'fuel' ? 'critical' : 'normal')
      });
      input.setCustomTemplates(previous => [template, ...previous]);
      return true;
    }

    function patchCustomTemplate(templateId: string, patch: Partial<CustomDailyRecordTemplate>) {
      input.setCustomTemplates(previous => updateCustomTemplate(previous, templateId, patch));
    }

    function removeCustomTemplate(templateId: string) {
      input.setCustomTemplates(previous => deleteCustomTemplate(previous, templateId));
    }

    function patchBankDecision(transactionId: string, patch: Partial<BankCandidateDecision>) {
      input.setBankDecisions(previous => updateBankDecision(previous, transactionId, patch));
    }

    function approveBankCandidate(transactionId: string) {
      const candidate = BANK_CANDIDATE_SAMPLE.find(item => item.transactionId === transactionId);
      if (!candidate) return false;
      const decision = getBankDecision(candidate, input.bankDecisions);
      const record = approveBankCandidateAsRecord(candidate, { ...decision, status: 'approved' });
      input.setRecords(previous => [record, ...previous]);
      input.setBankDecisions(previous => updateBankDecision(previous, transactionId, { status: 'approved' }));
      return true;
    }

    function rejectBankCandidate(transactionId: string) {
      input.setBankDecisions(previous => updateBankDecision(previous, transactionId, { status: 'rejected' }));
    }

    function postponeBankCandidate(transactionId: string) {
      input.setBankDecisions(previous => updateBankDecision(previous, transactionId, { status: 'postponed' }));
    }

    return {
      addRecord,
      addOrder,
      addFuel,
      addTaskExpense,
      patchRecord,
      removeRecord,
      addTemplateRecord,
      addCustomTemplate,
      patchCustomTemplate,
      removeCustomTemplate,
      patchBankDecision,
      approveBankCandidate,
      rejectBankCandidate,
      postponeBankCandidate
    };
  }, [input]);
}
