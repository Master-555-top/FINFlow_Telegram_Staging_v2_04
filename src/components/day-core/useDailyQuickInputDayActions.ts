import { useMemo, type Dispatch, type SetStateAction } from 'react';
import type { DayCoreFundInput, DayCoreInputModel, DayCoreObligationInput, DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';
import type { FuelNetIntegrationReport } from '@/lib/day-core/fuelNetIntegrationModel';
import type { CarRepairAllocationAdvisor } from '@/lib/day-core/carRepairAllocationModel';
import { markNote, parseMoney, parseRate } from '@/components/day-core/DailyQuickInputShared';

export function useDailyQuickInputDayActions(input: {
  setDayInput: Dispatch<SetStateAction<DayCoreInputModel>>;
  fuelNetIntegration: FuelNetIntegrationReport;
  carRepairAllocation: CarRepairAllocationAdvisor;
}) {
  return useMemo(() => {
    function updateMoney(field: 'cash' | 'card' | 'driveeBalance', value: string) {
      const amount = parseMoney(value);
      input.setDayInput(previous => ({
        ...previous,
        money: { ...previous.money, [field]: amount },
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Деньги сейчас обновлены вручную: ${field}.`)
      }));
    }

    function updateTaxiNumber(field: keyof DayCoreInputModel['taxi'], value: string) {
      const amount = field === 'driveeRate' ? parseRate(value) : parseMoney(value);
      input.setDayInput(previous => ({
        ...previous,
        taxi: { ...previous.taxi, [field]: amount },
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Отредактировано поле такси: ${String(field)}.`)
      }));
    }

    function applyOdometerFuelToPlan() {
      input.setDayInput(previous => ({
        ...previous,
        taxi: {
          ...previous.taxi,
          fuelPlanned: Math.max(0, Math.round(input.fuelNetIntegration.odometerFuelRub))
        },
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, 'Бензин по пробегу применён в план топлива дня.')
      }));
    }

    function strengthenCarRepairFund() {
      input.setDayInput(previous => {
        const existing = previous.funds.find(fund => fund.id === 'car-repair');
        const nextFunds = existing
          ? previous.funds.map(fund => fund.id === 'car-repair'
            ? {
                ...fund,
                targetAmount: Math.max(fund.targetAmount, input.carRepairAllocation.targetRub),
                priority: 'high' as const,
                canReceiveToday: true,
                fundType: fund.fundType ?? 'savings',
                group: fund.group ?? 'required'
              }
            : fund)
          : [
              ...previous.funds,
              {
                id: 'car-repair',
                title: 'Ремонт ходовки / подвески',
                targetAmount: input.carRepairAllocation.targetRub,
                currentAmount: 0,
                priority: 'high' as const,
                canReceiveToday: true,
                fundType: 'savings' as const,
                group: 'required' as const,
                sortOrder: 25
              }
            ];

        return {
          ...previous,
          funds: nextFunds,
          status: 'review_needed',
          reviewNotes: markNote(previous.reviewNotes, 'Ремонтный фонд машины усилен как рабочий актив такси.')
        };
      });
    }

    function updateTask(taskId: string, patch: Partial<Pick<DayCoreTaskInput, 'title' | 'moneyCost' | 'plannedToday' | 'priority' | 'type'>>) {
      input.setDayInput(previous => ({
        ...previous,
        tasks: previous.tasks.map(task => task.id === taskId ? { ...task, ...patch } : task),
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Отредактирована задача/расход: ${taskId}.`)
      }));
    }

    function deleteTask(taskId: string) {
      input.setDayInput(previous => ({
        ...previous,
        tasks: previous.tasks.filter(task => task.id !== taskId),
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Удалена задача/расход: ${taskId}.`)
      }));
    }

    function updateDayField(field: 'localDate' | 'localTime', value: string) {
      input.setDayInput(previous => ({
        ...previous,
        [field]: value,
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Отредактировано поле дня: ${field}.`)
      }));
    }

    function updateFund(fundId: string, patch: Partial<DayCoreFundInput>) {
      input.setDayInput(previous => ({
        ...previous,
        funds: previous.funds.map(fund => fund.id === fundId ? { ...fund, ...patch } : fund),
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Отредактирован фонд: ${fundId}.`)
      }));
    }

    function addFund() {
      const id = `fund-${Date.now()}`;
      const fund: DayCoreFundInput = {
        id,
        title: 'Новый фонд',
        targetAmount: 5000,
        currentAmount: 0,
        priority: 'normal',
        canReceiveToday: true,
        fundType: 'savings',
        group: 'savings',
        sortOrder: 999,
        note: ''
      };
      input.setDayInput(previous => ({
        ...previous,
        funds: [...previous.funds, fund],
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, 'Добавлен новый фонд.')
      }));
    }

    function deleteFund(fundId: string) {
      input.setDayInput(previous => ({
        ...previous,
        funds: previous.funds.filter(fund => fund.id !== fundId),
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Удалён фонд: ${fundId}.`)
      }));
    }

    function updateObligation(obligationId: string, patch: Partial<DayCoreObligationInput>) {
      input.setDayInput(previous => ({
        ...previous,
        obligations: previous.obligations.map(obligation => obligation.id === obligationId ? { ...obligation, ...patch } : obligation),
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Отредактировано обязательство: ${obligationId}.`)
      }));
    }

    function addObligation() {
      const id = `obligation-${Date.now()}`;
      const obligation: DayCoreObligationInput = {
        id,
        title: 'Новое обязательство',
        amountDue: 5000,
        dueDayOfMonth: 1,
        currentSaved: 0,
        priority: 'high',
        source: 'manual'
      };
      input.setDayInput(previous => ({
        ...previous,
        obligations: [...previous.obligations, obligation],
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, 'Добавлено новое обязательство.')
      }));
    }

    function deleteObligation(obligationId: string) {
      input.setDayInput(previous => ({
        ...previous,
        obligations: previous.obligations.filter(obligation => obligation.id !== obligationId),
        source: 'manual',
        status: 'review_needed',
        reviewNotes: markNote(previous.reviewNotes, `Удалено обязательство: ${obligationId}.`)
      }));
    }

    return {
      updateMoney,
      updateTaxiNumber,
      applyOdometerFuelToPlan,
      strengthenCarRepairFund,
      updateTask,
      deleteTask,
      updateDayField,
      updateFund,
      addFund,
      deleteFund,
      updateObligation,
      addObligation,
      deleteObligation
    };
  }, [input]);
}
