'use client';

import { useEffect, useMemo, useState } from 'react';
import { dayCoreInputMock, type DayCoreFundInput, type DayCoreInputModel, type DayCoreObligationInput, type DayCoreTaskInput } from '@/lib/day-core/dayCoreInputModel';
import { buildFinflowAssistantAdvice } from '@/lib/assistant/finflowAssistantCore';
import { answerAssistantQuestionLocally, buildInitialAssistantChat, createAssistantChatMessage, type FinflowAssistantChatMessage } from '@/lib/assistant/finflowAssistantChat';
import { buildExternalAssistantPayload } from '@/lib/assistant/finflowAssistantPrompt';
import { buildFuelOdometerAssistantAdvice } from '@/lib/assistant/fuelOdometerAssistantAdvice';
import { buildCarMaintenanceChatContext } from '@/lib/assistant/carMaintenanceChatContext';
import { buildCarRepairAllocationChatContext } from '@/lib/assistant/carRepairAllocationChatContext';
import { buildDailyDecisionChatContext } from '@/lib/assistant/dailyDecisionChatContext';
import { calculateOilServiceStatus, estimateFuelFromMileage } from '@/lib/car/carMaintenanceModel';
import { buildDailyFuelBudgetReport, formatFuelRub } from '@/lib/car/dailyFuelBudgetModel';
import { calculateEditableFuelBudget, createDefaultEditableFuelInputState, parseFuelNumber, type EditableFuelInputState } from '@/lib/car/editableFuelInputsModel';
import { addFuelOdometerHistoryEntry, createFuelOdometerHistoryEntry, createInitialFuelOdometerHistoryState, deleteFuelOdometerHistoryEntry, summarizeFuelOdometerHistory } from '@/lib/car/fuelOdometerHistoryModel';
import { exportFuelOdometerHistoryAsCsv, exportFuelOdometerHistoryAsJson } from '@/lib/car/fuelOdometerHistoryExport';
import { buildFuelOdometerTrendReport } from '@/lib/car/fuelOdometerTrendModel';
import { buildProjectSelfCheckReport } from '@/lib/project/projectSelfCheck';
import { calculateDayNet } from '@/lib/day-core/netCalculationModel';
import { buildFuelNetIntegrationReport } from '@/lib/day-core/fuelNetIntegrationModel';
import { buildDailyAllocation } from '@/lib/day-core/dailyAllocationModel';
import { buildCarRepairAllocationAdvisor } from '@/lib/day-core/carRepairAllocationModel';
import { buildDailyDecisionSummary } from '@/lib/day-core/dailyDecisionSummaryModel';
import {
  DAILY_RECORD_FILTERS,
  DAILY_RECORD_TEMPLATES,
  filterDailyRecords,
  getRecordCategoryLabel,
  createInitialDailyRecordsFromInput,
  summarizeDailyRecords,
  type DailyRecord,
  type CustomDailyRecordTemplate,
  type DailyRecordFilterId,
  type DailyRecordType
} from '@/lib/day-core/dailyRecordsModel';
import {
  analyzeDailyHistory,
  buildDailyHistoryComparison,
  getDailyHistorySnapshotById,
  getDailyHistoryStorageLabel,
  summarizeDailyHistory
} from '@/lib/day-core/dailyHistoryModel';
import {
  BANK_CANDIDATE_CATEGORY_COUNTS,
  BANK_CANDIDATE_FILTERS,
  BANK_CANDIDATE_SAMPLE,
  BANK_CANDIDATE_TOTAL_COUNT,
  buildDefaultBankDecision,
  filterBankCandidates,
  getBankCandidatePageCount,
  getBankDecision,
  paginateBankCandidates,
  type BankCandidateDecision,
  type BankCandidateFilterId
} from '@/lib/day-core/bankCandidateReviewModel';
import { formatPercent, formatRub } from '@/lib/day-core/dayCoreModel';
import { CloudDaySyncPanel } from '@/components/cloud/CloudDaySyncPanel';
import { LocalBackupRestorePanel } from '@/components/local/LocalBackupRestorePanel';
import { createFinflowCloudDayDocument } from '@/lib/cloud/finflowCloudDayDocument';
import {
  expensePresets,
  fuelPresets,
  orderPresets,
  recordsStorageKey,
  storageKey,
  type DailyQuickInputView,
  type ExpensePreset
} from '@/components/day-core/DailyQuickInputConfig';
import {
  AllocationBucketRow,
  LiveStateStatus,
  MoneyInput,
  parseMoney,
  parseRate,
  markNote,
  formatSignedRub,
  getRecordTypeLabel,
  ProgressBar
} from '@/components/day-core/DailyQuickInputShared';
import { useDailyQuickInputLiveState } from '@/components/day-core/useDailyQuickInputLiveState';
import { useDailyQuickInputRecordActions } from '@/components/day-core/useDailyQuickInputRecordActions';
import { useDailyQuickInputDayActions } from '@/components/day-core/useDailyQuickInputDayActions';
import { useDailyQuickInputHistoryActions } from '@/components/day-core/useDailyQuickInputHistoryActions';
import { MoneyEnginePanel } from '@/components/money/MoneyEnginePanel';
import { WorkTaxiEnginePanel } from '@/components/work/WorkTaxiEnginePanel';
import { TemplatesEnginePanel } from '@/components/templates/TemplatesEnginePanel';

export function DailyQuickInputPanel(props: { onDayInputChange?: (input: DayCoreInputModel) => void; view?: DailyQuickInputView }) {
  const view = props.view ?? 'daily';
  const [customOrder, setCustomOrder] = useState('');
  const [customExpense, setCustomExpense] = useState('');
  const [customExpenseTitle, setCustomExpenseTitle] = useState('Прочее');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordAmount, setRecordAmount] = useState('');
  const [recordType, setRecordType] = useState<DailyRecordType>('taxi_order');
  const [recordFilter, setRecordFilter] = useState<DailyRecordFilterId>('all');
  const [templateLabel, setTemplateLabel] = useState('');
  const [templateAmount, setTemplateAmount] = useState('');
  const [templateCategory, setTemplateCategory] = useState('other');
  const [templateType, setTemplateType] = useState<DailyRecordType>('expense');
  const [bankFilter, setBankFilter] = useState<BankCandidateFilterId>('all');
  const [bankPage, setBankPage] = useState(0);
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantChat, setAssistantChat] = useState<FinflowAssistantChatMessage[]>([]);
  const [fuelHistoryExportText, setFuelHistoryExportText] = useState('');
  const [fuelHistoryExportFormat, setFuelHistoryExportFormat] = useState<'json' | 'csv'>('json');
  const {
    dailyLiveOriginId,
    hydrated,
    dayInput,
    setDayInput,
    historyState,
    setHistoryState,
    records,
    setRecords,
    customTemplates,
    setCustomTemplates,
    bankDecisions,
    setBankDecisions,
    fuelInputState,
    setFuelInputState,
    fuelHistoryState,
    setFuelHistoryState,
    dailyLiveSyncedAt,
    activeDaySession,
    setActiveDaySession,
    latestRolloverEntry,
    setLatestRolloverEntry,
    rolloverStatus,
    setRolloverStatus
  } = useDailyQuickInputLiveState({ onDayInputChange: props.onDayInputChange });

  const {
    addOrder,
    addFuel,
    addTaskExpense,
    addRecord,
    patchRecord,
    removeRecord,
    addTemplateRecord,
    addCustomTemplate: addCustomTemplateAction,
    patchCustomTemplate,
    removeCustomTemplate,
    patchBankDecision,
    approveBankCandidate,
    rejectBankCandidate,
    postponeBankCandidate
  } = useDailyQuickInputRecordActions({
    customTemplates,
    bankDecisions,
    setRecords,
    setCustomTemplates,
    setBankDecisions
  });

  const net = useMemo(() => calculateDayNet(dayInput), [dayInput]);
  const cloudDocument = useMemo(() => createFinflowCloudDayDocument({
    dayInput,
    records,
    customTemplates,
    bankDecisions,
    fuelInputState,
    fuelHistoryState
  }), [dayInput, records, customTemplates, bankDecisions, fuelInputState, fuelHistoryState]);
  const historySummary = useMemo(() => summarizeDailyHistory(historyState), [historyState]);
  const historyAnalytics = useMemo(() => analyzeDailyHistory(historyState, net.targetNet), [historyState, net.targetNet]);
  const allocation = useMemo(() => buildDailyAllocation(dayInput, net), [dayInput, net]);
  const carRepairAllocation = useMemo(() => buildCarRepairAllocationAdvisor({ day: dayInput, allocation, net }), [dayInput, allocation, net]);
  const carRepairAllocationChatContext = useMemo(() => buildCarRepairAllocationChatContext({ repair: carRepairAllocation }), [carRepairAllocation]);
  const recordsSummary = useMemo(() => summarizeDailyRecords(records), [records]);
  const assistantHour = hydrated
    ? new Date().getHours()
    : Number(dayCoreInputMock.localTime.slice(0, 2));
  const assistantAdvice = useMemo(
    () => buildFinflowAssistantAdvice({ net, allocation, recordsSummary, currentHour: assistantHour }),
    [net, allocation, recordsSummary, assistantHour]
  );
  const externalAssistantPayload = useMemo(() => buildExternalAssistantPayload({ net, allocation, recordsSummary, localAdvice: assistantAdvice }), [net, allocation, recordsSummary, assistantAdvice]);
  const projectSelfCheck = useMemo(() => buildProjectSelfCheckReport(), []);
  const oilServiceStatus = useMemo(() => calculateOilServiceStatus(), []);
  const fuelByMileageEstimate = useMemo(() => estimateFuelFromMileage({ km: 189.5 }), []);
  const dailyFuelBudget = useMemo(() => buildDailyFuelBudgetReport(), []);
  const editableFuelCalculation = useMemo(() => calculateEditableFuelBudget(fuelInputState), [fuelInputState]);
  const fuelHistorySummary = useMemo(() => summarizeFuelOdometerHistory(fuelHistoryState), [fuelHistoryState]);
  const fuelTrendReport = useMemo(() => buildFuelOdometerTrendReport(fuelHistoryState), [fuelHistoryState]);
  const fuelNetIntegration = useMemo(() => buildFuelNetIntegrationReport({ net, fuel: editableFuelCalculation }), [net, editableFuelCalculation]);
  const {
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
  } = useDailyQuickInputDayActions({
    setDayInput,
    fuelNetIntegration,
    carRepairAllocation
  });
  const fuelAssistantAdvice = useMemo(() => buildFuelOdometerAssistantAdvice({ net, fuelNet: fuelNetIntegration, trend: fuelTrendReport }), [net, fuelNetIntegration, fuelTrendReport]);
  const fuelChatContext = useMemo(() => ({ version: 'fuel_odometer_chat_context_v1_73' as const, advice: fuelAssistantAdvice, fuelNet: fuelNetIntegration, trend: fuelTrendReport }), [fuelAssistantAdvice, fuelNetIntegration, fuelTrendReport]);
  const carMaintenanceChatContext = useMemo(() => buildCarMaintenanceChatContext({ oil: oilServiceStatus }), [oilServiceStatus]);
  const dailyDecisionSummary = useMemo(() => buildDailyDecisionSummary({ net, allocation, fuelNet: fuelNetIntegration, carRepair: carRepairAllocation, oil: oilServiceStatus }), [net, allocation, fuelNetIntegration, carRepairAllocation, oilServiceStatus]);
  const dailyDecisionChatContext = useMemo(() => buildDailyDecisionChatContext({ summary: dailyDecisionSummary }), [dailyDecisionSummary]);

  useEffect(() => {
    if (assistantChat.length === 0) setAssistantChat(buildInitialAssistantChat(assistantAdvice));
  }, [assistantAdvice, assistantChat.length]);
  const visibleRecords = useMemo(() => filterDailyRecords(records, recordFilter), [records, recordFilter]);
  const filteredBankCandidates = useMemo(() => filterBankCandidates(BANK_CANDIDATE_SAMPLE, bankDecisions, bankFilter), [bankDecisions, bankFilter]);
  const bankPageSize = 8;
  const bankPageCount = useMemo(() => getBankCandidatePageCount(filteredBankCandidates, bankPageSize), [filteredBankCandidates]);
  const visibleBankCandidates = useMemo(() => paginateBankCandidates(filteredBankCandidates, Math.min(bankPage, bankPageCount - 1), bankPageSize), [filteredBankCandidates, bankPage, bankPageCount]);
  const selectedSnapshot = useMemo(() => selectedSnapshotId ? getDailyHistorySnapshotById(historyState, selectedSnapshotId) : null, [historyState, selectedSnapshotId]);
  const selectedSnapshotComparison = useMemo(() => selectedSnapshot ? buildDailyHistoryComparison(net, selectedSnapshot) : null, [net, selectedSnapshot]);
  const cleanProgress = Math.min(100, Math.round((net.shiftCleanExpected / Math.max(1, net.targetNet)) * 100));
  const grossProgress = Math.min(100, Math.round((net.grossDone / Math.max(1, net.grossNeededForTargetNet)) * 100));

  function addExpense(preset: ExpensePreset) {
    addTaskExpense(preset.title, preset.amount, preset.type, preset.priority);
  }

  function addCustomOrder() {
    if (addOrder(parseMoney(customOrder))) setCustomOrder('');
  }

  function addCustomExpense() {
    if (addTaskExpense(customExpenseTitle || 'Прочее', parseMoney(customExpense), 'admin', 'normal')) setCustomExpense('');
  }

  function addCustomRecord() {
    const amount = parseMoney(recordAmount);
    if (amount <= 0) return;
    if (!addRecord(recordType, recordTitle || getRecordTypeLabel(recordType), amount)) return;
    setRecordAmount('');
    setRecordTitle('');
  }

  function addCustomTemplate() {
    const amount = parseMoney(templateAmount);
    const saved = addCustomTemplateAction({
      label: templateLabel,
      amount,
      category: templateCategory,
      type: templateType,
      priority: templateType === 'fuel' ? 'critical' : 'normal'
    });
    if (!saved) return;
    setTemplateLabel('');
    setTemplateAmount('');
  }

  function exportFuelHistory(format: 'json' | 'csv') {
    setFuelHistoryExportFormat(format);
    setFuelHistoryExportText(format === 'json'
      ? exportFuelOdometerHistoryAsJson(fuelHistoryState)
      : exportFuelOdometerHistoryAsCsv(fuelHistoryState)
    );
  }

  function clearFuelHistory() {
    const approved = window.confirm('Очистить всю локальную историю пробега/бензина? Это действие нельзя отменить.');
    if (!approved) return;
    setFuelHistoryState(createInitialFuelOdometerHistoryState());
    setFuelHistoryExportText('');
  }

  function saveFuelHistoryEntry() {
    if (!editableFuelCalculation.isValid || editableFuelCalculation.kmDriven <= 0) return;
    const entry = createFuelOdometerHistoryEntry({
      state: fuelInputState,
      calculation: editableFuelCalculation
    });
    setFuelHistoryState(previous => addFuelOdometerHistoryEntry(previous, entry));
  }

  function removeFuelHistoryEntry(entryId: string) {
    setFuelHistoryState(previous => deleteFuelOdometerHistoryEntry(previous, entryId));
  }

  function updateFuelInput(field: keyof EditableFuelInputState, value: string) {
    setFuelInputState(previous => ({
      ...previous,
      [field]: parseFuelNumber(value, previous[field])
    }));
  }

  function askAssistant() {
    const question = assistantQuestion.trim();
    if (!question) return;

    const userMessage = createAssistantChatMessage({
      role: 'user',
      text: question,
      source: 'manual'
    });

    const assistantMessage = createAssistantChatMessage({
      role: 'assistant',
      text: answerAssistantQuestionLocally(question, assistantAdvice, externalAssistantPayload, fuelChatContext, carMaintenanceChatContext, carRepairAllocationChatContext, dailyDecisionChatContext),
      source: 'local_rule_based'
    });

    setAssistantChat(previous => [...previous, userMessage, assistantMessage].slice(-10));
    setAssistantQuestion('');
  }

  const {
    saveDaySnapshot,
    deleteSnapshot,
    toggleSnapshotLock,
    restoreSnapshot,
    loadCloudDocument,
    startNewActiveDay,
    restoreLatestRolloverDay
  } = useDailyQuickInputHistoryActions({
    dailyLiveOriginId,
    dayInput,
    net,
    historyState,
    selectedSnapshotId,
    records,
    customTemplates,
    bankDecisions,
    fuelInputState,
    fuelHistoryState,
    latestRolloverEntry,
    setSelectedSnapshotId,
    setDayInput,
    setHistoryState,
    setRecords,
    setCustomTemplates,
    setBankDecisions,
    setFuelInputState,
    setFuelHistoryState,
    setLatestRolloverEntry,
    setActiveDaySession,
    setRolloverStatus
  });

  function resetDay() {
    setDayInput({
      ...dayCoreInputMock,
      reviewNotes: [
        'Демо-день сброшен. В production это будет создавать новый день, а не стирать историю.'
      ]
    });
    const nextRecords = createInitialDailyRecordsFromInput(dayCoreInputMock);
    setRecords(nextRecords);
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(recordsStorageKey);
  }

  if (view === 'daily') {
    return (
      <section className={`card quick-input-card daily-mode-card ${net.mode}`}>
        <div className="section-kicker">Active Day Session</div>
        <h2 className="card-heading">День: утро → смена → вечер</h2>
        <p className="card-description">
          Ежедневный режим теперь показывает только то, что нужно для сегодняшнего дня. Cloud, backup, deployment и dev-панели вынесены в “Система”.
        </p>
        <LiveStateStatus syncedAt={dailyLiveSyncedAt} />

        <div className="active-day-session-card">
          <div>
            <span>Активный день</span>
            <b>{dayInput.localDate} • {dayInput.dayId}</b>
            <p>{activeDaySession ? `Сессия: ${activeDaySession.activeLocalDate}` : 'Сессия будет зафиксирована при первом New Day flow.'}</p>
            {latestRolloverEntry ? <small>Последний закрытый день: {latestRolloverEntry.previousLocalDate} → {latestRolloverEntry.nextLocalDate}</small> : <small>Rollover archive пока пуст.</small>}
            {rolloverStatus ? <small className="active-day-session-status">{rolloverStatus}</small> : null}
          </div>
          <div className="active-day-session-actions">
            <button type="button" onClick={startNewActiveDay}>закрыть день → новый день</button>
            <button type="button" onClick={restoreLatestRolloverDay} disabled={!latestRolloverEntry}>откатить последний переход</button>
          </div>
        </div>

        <div className="daily-mode-phase-grid">
          <article className="daily-phase-card morning">
            <span>Утро</span>
            <b>План дня</b>
            <p>Цель: {formatRub(net.targetNet)} чистыми / {formatRub(net.grossNeededForTargetNet)} грязными.</p>
            <small>Перед стартом проверь деньги, бензин, обязательные траты и реальную цель смены.</small>
          </article>
          <article className="daily-phase-card work">
            <span>Смена</span>
            <b>Quick-flow</b>
            <p>Осталось: {formatRub(net.remainingGrossToTarget)} грязными. Заказов сейчас: {dayInput.taxi.ordersDone}.</p>
            <small>Добавляй заказ, бензин или расход одной кнопкой — расчёты пересчитаются автоматически.</small>
          </article>
          <article className="daily-phase-card evening">
            <span>Вечер</span>
            <b>Итог дня</b>
            <p>Чистые: {formatRub(net.shiftCleanExpected)}. Свободно после плана: {formatRub(net.realFreeExpectedAfterDayPlan)}.</p>
            <small>Сохрани снимок дня, чтобы завтра видеть динамику и не потерять контекст.</small>
          </article>
        </div>

        <div className="quick-current-grid compact">
          <MoneyInput label="Наличные" value={dayInput.money.cash} onChange={value => updateMoney('cash', value)} />
          <MoneyInput label="Карта" value={dayInput.money.card} onChange={value => updateMoney('card', value)} />
          <MoneyInput label="Drivee" value={dayInput.money.driveeBalance} onChange={value => updateMoney('driveeBalance', value)} />
        </div>

        <div className="quick-net-summary">
          <div><span>Грязными сейчас</span><b>{formatRub(net.grossDone)}</b></div>
          <div><span>Чистые со смены</span><b>{formatRub(net.shiftCleanExpected)}</b></div>
          <div><span>Свободно после плана</span><b>{formatRub(net.realFreeExpectedAfterDayPlan)}</b></div>
        </div>

        <div className="quick-progress-pair">
          <div><span>К чистым {formatRub(net.targetNet)}</span><b>{cleanProgress}%</b></div>
          <ProgressBar value={cleanProgress} />
          <div><span>К обороту {formatRub(net.grossNeededForTargetNet)}</span><b>{grossProgress}%</b></div>
          <ProgressBar value={grossProgress} />
        </div>

        <div className={`daily-decision-summary-panel ${dailyDecisionSummary.mode}`}>
          <div className="audit-log-heading">Решение сейчас</div>
          <div className="decision-headline">
            <b>{dailyDecisionSummary.headline}</b>
            <span>{dailyDecisionSummary.primaryAction}</span>
          </div>
          <div className="daily-mode-decision-list">
            <p><b>Работа:</b> {dailyDecisionSummary.workDecision}</p>
            <p><b>Бензин:</b> {dailyDecisionSummary.fuelDecision}</p>
            <p><b>Деньги:</b> {dailyDecisionSummary.allocationDecision}</p>
          </div>
          <div className="decision-signal-list compact">
            {dailyDecisionSummary.signals.slice(0, 3).map(signal => (
              <div className={`decision-signal ${signal.level}`} key={signal.id}>
                <b>{signal.title}</b>
                <p>{signal.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-action-block primary-flow">
          <h3>Рабочий quick-flow</h3>
          <div className="quick-button-row">
            {orderPresets.map(amount => <button key={amount} type="button" onClick={() => addOrder(amount)}>заказ +{formatRub(amount)}</button>)}
          </div>
          <div className="quick-inline-form">
            <input inputMode="numeric" placeholder="сумма заказа" value={customOrder} onChange={event => setCustomOrder(event.target.value)} />
            <button type="button" onClick={addCustomOrder}>добавить</button>
          </div>
        </div>

        <div className="daily-mode-two-col">
          <div className="quick-action-block">
            <h3>Бензин</h3>
            <div className="quick-button-row">
              {fuelPresets.map(amount => <button key={amount} type="button" onClick={() => addFuel(amount)}>+{formatRub(amount)}</button>)}
            </div>
            <p className="quick-note">Оплачено: {formatRub(dayInput.taxi.fuelAlreadyPaid)} • ещё нужно: {formatRub(net.fuelStillNeeded)}</p>
          </div>
          <div className="quick-action-block">
            <h3>Расход</h3>
            <div className="quick-button-row">
              {expensePresets.slice(0, 3).map(preset => <button key={preset.id} type="button" onClick={() => addExpense(preset)}>{preset.title} +{formatRub(preset.amount)}</button>)}
            </div>
            <div className="quick-inline-form two-inputs">
              <input placeholder="название" value={customExpenseTitle} onChange={event => setCustomExpenseTitle(event.target.value)} />
              <input inputMode="numeric" placeholder="сумма" value={customExpense} onChange={event => setCustomExpense(event.target.value)} />
              <button type="button" onClick={addCustomExpense}>+</button>
            </div>
          </div>
        </div>

        <div className="evening-summary-card">
          <div className="audit-log-heading">Вечерний итог дня</div>
          <div className="evening-summary-grid">
            <div><span>Заказы</span><b>{recordsSummary.ordersCount}</b></div>
            <div><span>Грязными</span><b>{formatRub(recordsSummary.taxiGross)}</b></div>
            <div><span>Расходы</span><b>{formatRub(recordsSummary.expensesTotal + recordsSummary.fuelPaid)}</b></div>
            <div><span>Дефицит</span><b>{formatRub(allocation.shortage)}</b></div>
          </div>
          <p className="quick-note">{historyAnalytics.recommendation}</p>
          <button className="quick-save-button" type="button" onClick={saveDaySnapshot}>сохранить вечерний снимок дня</button>
        </div>

        <div className="daily-mode-latest-records">
          <div className="audit-log-heading">Последние записи</div>
          {records.slice(0, 5).map(record => (
            <article className={`daily-record compact ${record.enabled ? '' : 'disabled'}`} key={record.id}>
              <b>{record.title}</b>
              <span>{getRecordTypeLabel(record.type)} • {formatRub(record.amount)}</span>
              <button type="button" onClick={() => removeRecord(record.id)}>удалить</button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (view === 'work') {
    return (
      <section className={`card quick-input-card work-mode-card ${net.mode}`}>
        <div className="section-kicker">v1.98 • Work Quick-flow</div>
        <h2 className="card-heading">Работа: заказы, бензин, машина</h2>
        <p className="card-description">Здесь только рабочий слой такси: оборот, активные часы, топливо, пробег и машина.</p>
        <LiveStateStatus syncedAt={dailyLiveSyncedAt} />

        <WorkTaxiEnginePanel dayInput={dayInput} records={records} />
        <TemplatesEnginePanel dayInput={dayInput} records={records} customTemplates={customTemplates} compact />

        <div className="quick-net-summary">
          <div><span>Оборот</span><b>{formatRub(net.grossDone)}</b></div>
          <div><span>Осталось грязными</span><b>{formatRub(net.remainingGrossToTarget)}</b></div>
          <div><span>Актив / смена</span><b>{dayInput.taxi.activeHours}ч / {dayInput.taxi.fullShiftHours}ч</b></div>
        </div>

        <div className="quick-action-block primary-flow">
          <h3>Добавить заказ</h3>
          <div className="quick-button-row">
            {orderPresets.map(amount => <button key={amount} type="button" onClick={() => addOrder(amount)}>+{formatRub(amount)}</button>)}
          </div>
          <div className="quick-inline-form">
            <input inputMode="numeric" placeholder="сумма заказа" value={customOrder} onChange={event => setCustomOrder(event.target.value)} />
            <button type="button" onClick={addCustomOrder}>добавить</button>
          </div>
        </div>

        <div className="quick-action-block">
          <h3>Бензин</h3>
          <div className="quick-button-row">
            {fuelPresets.map(amount => <button key={amount} type="button" onClick={() => addFuel(amount)}>+{formatRub(amount)}</button>)}
          </div>
          <p className="quick-note">Бензин — рабочая издержка такси. Оплачено: {formatRub(dayInput.taxi.fuelAlreadyPaid)}. Ещё нужно: {formatRub(net.fuelStillNeeded)}.</p>
        </div>

        <div className="editable-day-panel compact-source-edit">
          <div className="audit-log-heading">Быстро поправить смену</div>
          <div className="editable-grid">
            <label><span>Заказов</span><input inputMode="numeric" value={String(dayInput.taxi.ordersDone)} onChange={event => updateTaxiNumber('ordersDone', event.target.value)} /></label>
            <label><span>Грязными</span><input inputMode="numeric" value={String(dayInput.taxi.grossDone)} onChange={event => updateTaxiNumber('grossDone', event.target.value)} /></label>
            <label><span>Прогноз</span><input inputMode="numeric" value={String(dayInput.taxi.expectedGrossByEvening)} onChange={event => updateTaxiNumber('expectedGrossByEvening', event.target.value)} /></label>
            <label><span>Активные часы</span><input inputMode="decimal" value={String(dayInput.taxi.activeHours)} onChange={event => updateTaxiNumber('activeHours', event.target.value)} /></label>
            <label><span>Часы смены</span><input inputMode="decimal" value={String(dayInput.taxi.fullShiftHours)} onChange={event => updateTaxiNumber('fullShiftHours', event.target.value)} /></label>
            <label><span>Бензин план</span><input inputMode="numeric" value={String(dayInput.taxi.fuelPlanned)} onChange={event => updateTaxiNumber('fuelPlanned', event.target.value)} /></label>
          </div>
        </div>

        <div className="car-maintenance-panel">
          <div className="audit-log-heading">Машина / масло / пробег</div>
          <div className="maintenance-grid">
            <div><b>{oilServiceStatus.kmSinceService.toLocaleString('ru-RU')} км</b><span>после замены 16.06.2026</span></div>
            <div><b>{oilServiceStatus.nextChangeOdometerKm.toLocaleString('ru-RU')} км</b><span>плановая замена</span></div>
            <div><b>{Math.round(editableFuelCalculation.fuelCostRub).toLocaleString('ru-RU')} ₽</b><span>расчёт бензина по вводу</span></div>
            <div><b>{fuelTrendReport.ready ? 'есть история' : 'нет истории'}</b><span>тренд топлива</span></div>
          </div>
          <p className="quick-note">{oilServiceStatus.recommendation}</p>
        </div>

        <div className="daily-fuel-budget-panel">
          <div className="audit-log-heading">Калькулятор бензина / одометр</div>
          <div className="editable-fuel-inputs">
            <div className="quick-inline-form four-inputs">
              <label><span>предыдущий пробег</span><input inputMode="numeric" value={fuelInputState.previousOdometerKm} onChange={event => updateFuelInput('previousOdometerKm', event.target.value)} /></label>
              <label><span>текущий пробег</span><input inputMode="numeric" value={fuelInputState.currentOdometerKm} onChange={event => updateFuelInput('currentOdometerKm', event.target.value)} /></label>
              <label><span>АИ-92 ₽/л</span><input inputMode="decimal" value={fuelInputState.fuelPriceRubPerLiter} onChange={event => updateFuelInput('fuelPriceRubPerLiter', event.target.value)} /></label>
              <label><span>расход л/100</span><input inputMode="decimal" value={fuelInputState.consumptionLitersPer100Km} onChange={event => updateFuelInput('consumptionLitersPer100Km', event.target.value)} /></label>
            </div>
            <div className="editable-fuel-result">
              <div><b>{Math.round(editableFuelCalculation.kmDriven).toLocaleString('ru-RU')} км</b><span>пройдено</span></div>
              <div><b>{editableFuelCalculation.litersNeeded.toFixed(1)} л</b><span>нужно топлива</span></div>
              <div><b>{Math.round(editableFuelCalculation.fuelCostRub).toLocaleString('ru-RU')} ₽</b><span>стоимость</span></div>
              <div><b>{editableFuelCalculation.costPerKmRub.toFixed(1)} ₽/км</b><span>цена км</span></div>
            </div>
            {editableFuelCalculation.warning ? <p className="quick-warning">{editableFuelCalculation.warning}</p> : null}
            <button type="button" onClick={applyOdometerFuelToPlan} disabled={!editableFuelCalculation.isValid}>применить бензин в план дня</button>
          </div>
        </div>
      </section>
    );
  }

  if (view === 'money') {
    return (
      <section className={`card quick-input-card money-mode-card ${net.mode}`}>
        <div className="section-kicker">v1.98 • Money Flow</div>
        <h2 className="card-heading">Деньги и записи дня</h2>
        <p className="card-description">Деньги, записи, шаблоны и bank-review без deployment/dev шума.</p>

        <MoneyEnginePanel dayInput={dayInput} records={records} />
        <TemplatesEnginePanel dayInput={dayInput} records={records} customTemplates={customTemplates} compact />

        <div className="quick-current-grid compact">
          <MoneyInput label="Наличные" value={dayInput.money.cash} onChange={value => updateMoney('cash', value)} />
          <MoneyInput label="Карта" value={dayInput.money.card} onChange={value => updateMoney('card', value)} />
          <MoneyInput label="Drivee баланс" value={dayInput.money.driveeBalance} onChange={value => updateMoney('driveeBalance', value)} />
        </div>

        <div className="records-summary-grid">
          <div><span>Заказы</span><b>{recordsSummary.ordersCount}</b></div>
          <div><span>Такси грязными</span><b>{formatRub(recordsSummary.taxiGross)}</b></div>
          <div><span>Бензин</span><b>{formatRub(recordsSummary.fuelPaid)}</b></div>
          <div><span>Drivee top-up</span><b>{formatRub(recordsSummary.driveeTopupPaid)}</b></div>
          <div><span>Расходы</span><b>{formatRub(recordsSummary.expensesTotal)}</b></div>
          <div><span>Доходы прочие</span><b>{formatRub(recordsSummary.otherIncomeTotal)}</b></div>
        </div>

        <div className="record-template-grid">
          {DAILY_RECORD_TEMPLATES.map(template => (
            <button key={template.id} type="button" onClick={() => addTemplateRecord(template.id)}>{template.label}</button>
          ))}
        </div>

        <div className="record-add-form">
          <select value={recordType} onChange={event => setRecordType(event.target.value as DailyRecordType)}>
            <option value="taxi_order">заказ такси</option>
            <option value="fuel">бензин</option>
            <option value="drivee_topup">Drivee пополнение</option>
            <option value="expense">расход</option>
            <option value="income">доход</option>
          </select>
          <input placeholder="название" value={recordTitle} onChange={event => setRecordTitle(event.target.value)} />
          <input inputMode="numeric" placeholder="сумма" value={recordAmount} onChange={event => setRecordAmount(event.target.value)} />
          <button type="button" onClick={addCustomRecord}>+ запись</button>
        </div>

        <div className="record-filter-row">
          {DAILY_RECORD_FILTERS.map(filter => (
            <button className={recordFilter === filter.id ? 'active' : ''} key={filter.id} type="button" onClick={() => setRecordFilter(filter.id)}>{filter.label}</button>
          ))}
        </div>

        <div className="record-list compact-record-list">
          {visibleRecords.map(record => (
            <article className={`daily-record ${record.enabled ? '' : 'disabled'}`} key={record.id}>
              <select value={record.type} onChange={event => patchRecord(record.id, { type: event.target.value as DailyRecordType, category: event.target.value })}>
                <option value="taxi_order">заказ</option>
                <option value="fuel">бензин</option>
                <option value="drivee_topup">Drivee</option>
                <option value="expense">расход</option>
                <option value="income">доход</option>
              </select>
              <input value={record.title} onChange={event => patchRecord(record.id, { title: event.target.value })} />
              <input inputMode="numeric" value={String(record.amount)} onChange={event => patchRecord(record.id, { amount: parseMoney(event.target.value) })} />
              <label className="editable-check"><input type="checkbox" checked={record.enabled} onChange={event => patchRecord(record.id, { enabled: event.target.checked })} /><span>учесть</span></label>
              <button type="button" onClick={() => removeRecord(record.id)}>удалить</button>
            </article>
          ))}
        </div>

        <div className="bank-review-panel compact-bank-review">
          <div className="audit-log-heading">Банк → review → записи</div>
          <p className="quick-note">Preview по redacted банковским кандидатам. Ничего не импортируется автоматически.</p>
          <div className="bank-review-summary">
            <div><span>Всего в CSV</span><b>{BANK_CANDIDATE_TOTAL_COUNT}</b></div>
            <div><span>В preview</span><b>{BANK_CANDIDATE_SAMPLE.length}</b></div>
            <div><span>В фильтре</span><b>{filteredBankCandidates.length}</b></div>
          </div>
          <div className="bank-filter-row">
            {BANK_CANDIDATE_FILTERS.map(filter => (
              <button className={bankFilter === filter.id ? 'active' : ''} key={filter.id} type="button" onClick={() => { setBankFilter(filter.id); setBankPage(0); }}>{filter.label}</button>
            ))}
          </div>
          <div className="bank-review-list">
            {visibleBankCandidates.slice(0, 4).map(candidate => {
              const decision = getBankDecision(candidate, bankDecisions);
              return (
                <article className={`bank-candidate ${decision.status}`} key={candidate.transactionId}>
                  <div className="bank-candidate-main">
                    <b>{candidate.operationDate} • {formatRub(Math.abs(candidate.amount))}</b>
                    <span>{candidate.descriptionRedacted}</span>
                    <small>{candidate.suggestedCategory} • {decision.status}</small>
                  </div>
                  <div className="bank-candidate-actions">
                    <button type="button" disabled={decision.status === 'approved'} onClick={() => approveBankCandidate(candidate.transactionId)}>в записи</button>
                    <button type="button" onClick={() => postponeBankCandidate(candidate.transactionId)}>позже</button>
                    <button type="button" onClick={() => rejectBankCandidate(candidate.transactionId)}>отклонить</button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (view === 'funds') {
    return (
      <section className={`card quick-input-card funds-mode-card ${allocation.mode}`}>
        <div className="section-kicker">v1.98 • Funds & Allocation</div>
        <h2 className="card-heading">Фонды, обязательства и распределение</h2>
        <p className="card-description">Слой денег после смены: что обязательно закрыть, куда направить остаток и что переносить.</p>

        <div className="allocation-summary-grid">
          <div><span>Доступно распределить</span><b>{formatRub(allocation.availableToAllocate)}</b></div>
          <div><span>Распределено</span><b>{formatRub(allocation.totalAllocated)}</b></div>
          <div><span>Дефицит</span><b>{formatRub(allocation.shortage)}</b></div>
        </div>

        <div className="editable-group-heading"><b>Обязательства</b><button type="button" onClick={addObligation}>+ обязательство</button></div>
        <div className="editable-record-list">
          {dayInput.obligations.map(obligation => (
            <article className="editable-record" key={obligation.id}>
              <input value={obligation.title} onChange={event => updateObligation(obligation.id, { title: event.target.value })} />
              <input inputMode="numeric" value={String(obligation.amountDue)} onChange={event => updateObligation(obligation.id, { amountDue: parseMoney(event.target.value) })} />
              <input inputMode="numeric" value={String(obligation.currentSaved)} onChange={event => updateObligation(obligation.id, { currentSaved: parseMoney(event.target.value) })} />
              <input inputMode="numeric" value={String(obligation.dueDayOfMonth)} onChange={event => updateObligation(obligation.id, { dueDayOfMonth: Math.max(1, Math.min(31, parseMoney(event.target.value))) })} />
              <select value={obligation.priority} onChange={event => updateObligation(obligation.id, { priority: event.target.value as DayCoreObligationInput['priority'] })}>
                <option value="critical">critical</option><option value="high">high</option><option value="normal">normal</option><option value="flexible">flexible</option>
              </select>
              <button type="button" onClick={() => deleteObligation(obligation.id)}>удалить</button>
              <small>сумма / накоплено / день месяца</small>
            </article>
          ))}
        </div>

        <div className="editable-group-heading"><b>Фонды</b><button type="button" onClick={addFund}>+ фонд</button></div>
        <div className="editable-record-list">
          {dayInput.funds.map(fund => (
            <article className="editable-record fund-record" key={fund.id}>
              <input value={fund.title} onChange={event => updateFund(fund.id, { title: event.target.value })} />
              <input inputMode="numeric" value={String(fund.targetAmount)} onChange={event => updateFund(fund.id, { targetAmount: parseMoney(event.target.value) })} />
              <input inputMode="numeric" value={String(fund.currentAmount)} onChange={event => updateFund(fund.id, { currentAmount: parseMoney(event.target.value) })} />
              <select value={fund.priority} onChange={event => updateFund(fund.id, { priority: event.target.value as DayCoreFundInput['priority'] })}>
                <option value="critical">critical</option><option value="high">high</option><option value="normal">normal</option><option value="flexible">flexible</option>
              </select>
              <label className="editable-check"><input type="checkbox" checked={fund.canReceiveToday} onChange={event => updateFund(fund.id, { canReceiveToday: event.target.checked })} /><span>сегодня</span></label>
              <button type="button" onClick={() => deleteFund(fund.id)}>удалить</button>
              <small>цель / накоплено / приоритет / участвует сегодня</small>
            </article>
          ))}
        </div>

        <div className={`allocation-panel ${allocation.mode}`}>
          <div className="audit-log-heading">Распределение чистых денег</div>
          <div className="allocation-strategy"><span>Режим: <b>{allocation.mode}</b></span><span>Стратегия: <b>{allocation.strategy}</b></span></div>
          <div className="allocation-bucket-list">{allocation.buckets.map(bucket => <AllocationBucketRow bucket={bucket} key={bucket.id} />)}</div>
          <p className="quick-note">{allocation.recommendation}</p>
        </div>

        <div className={`car-repair-allocation-panel ${carRepairAllocation.status}`}>
          <div className="audit-log-heading">Машина → ремонтный фонд</div>
          <div className="car-repair-grid">
            <div><span>Цель ремонта</span><b>{formatRub(carRepairAllocation.targetRub)}</b></div>
            <div><span>Накоплено</span><b>{formatRub(carRepairAllocation.currentRub)}</b></div>
            <div><span>Сегодня в плане</span><b>{formatRub(carRepairAllocation.allocatedTodayRub)}</b></div>
            <div><span>Лучше сегодня</span><b>{formatRub(carRepairAllocation.suggestedTodayRub)}</b></div>
          </div>
          <p className="quick-note">{carRepairAllocation.recommendation}</p>
          <button type="button" onClick={strengthenCarRepairFund}>усилить ремонтный фонд сегодня</button>
        </div>
      </section>
    );
  }

  if (view === 'ai') {
    return (
      <section className={`card quick-input-card ai-mode-card ${assistantAdvice.mode}`}>
        <div className="section-kicker">v1.98 • Daily AI</div>
        <h2 className="card-heading">AI-помощник FINFlow</h2>
        <p className="card-description">Локальный помощник по дню, работе, бензину, машине и распределению. Внешний AI bridge остаётся draft и не вызывается автоматически.</p>

        <div className={`assistant-panel ${assistantAdvice.mode}`}>
          <div className="assistant-headline">{assistantAdvice.headline}</div>
          <p className="assistant-next-action">{assistantAdvice.nextAction}</p>
          <div className="assistant-signal-list">
            {assistantAdvice.signals.slice(0, 5).map(signal => (
              <div className={`assistant-signal ${signal.priority}`} key={signal.id}><b>{signal.title}</b><span>{signal.message}</span></div>
            ))}
          </div>
          <div className="assistant-chat-box">
            <div className="assistant-chat-list">
              {assistantChat.slice(-6).map(message => (
                <div className={`assistant-chat-message ${message.role}`} key={message.id}><b>{message.role === 'user' ? 'Ты' : 'FINFlow AI'}</b><span>{message.text}</span></div>
              ))}
            </div>
            <div className="assistant-chat-input">
              <input value={assistantQuestion} onChange={event => setAssistantQuestion(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') askAssistant(); }} placeholder="Спроси: сколько ещё работать? можно тратить? что с Drivee?" />
              <button type="button" onClick={askAssistant}>спросить</button>
            </div>
          </div>
          <div className="assistant-bridge-note"><b>External AI bridge draft:</b><span> payload готов: {externalAssistantPayload.privacyMode}; внешний AI пока не вызывается.</span></div>
          <p className="quick-note">{assistantAdvice.disclaimer}</p>
        </div>

        <div className={`fuel-ai-advice-panel ${fuelAssistantAdvice.mode}`}>
          <div className="audit-log-heading">AI по бензину / одометру</div>
          <div className="fuel-ai-headline">{fuelAssistantAdvice.headline}</div>
          <p className="assistant-next-action">{fuelAssistantAdvice.nextAction}</p>
          <div className="assistant-signal-list">
            {fuelAssistantAdvice.signals.map(signal => (
              <div className={`assistant-signal ${signal.priority}`} key={signal.id}><b>{signal.title}</b><span>{signal.message}</span></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (view === 'system') {
    return (
      <section className="card quick-input-card system-mode-card">
        <div className="section-kicker">v1.98 • System / Dev only</div>
        <h2 className="card-heading">Системные инструменты дня</h2>
        <p className="card-description">Cloud save/load, local restore, self-check и технические панели не мешают ежедневному режиму и доступны только здесь.</p>
        <LiveStateStatus syncedAt={dailyLiveSyncedAt} />
        <CloudDaySyncPanel document={cloudDocument} onLoad={loadCloudDocument} />
        <LocalBackupRestorePanel document={cloudDocument} onRestore={loadCloudDocument} />
        <div className="project-self-check-panel">
          <div className="audit-log-heading">Project self-check / готовность mini app</div>
          <div className="readiness-grid">
            {projectSelfCheck.miniAppReadiness.map(item => (
              <div className="readiness-card" key={item.label}><b>{item.percent}</b><span>{item.label}</span><p>{item.meaning}</p></div>
            ))}
          </div>
          <div className="self-check-list">
            {projectSelfCheck.protocolItems.map(item => (
              <div className={`self-check-row ${item.status}`} key={item.id}><b>{item.label}</b><span>{item.status}</span><p>{item.note}</p></div>
            ))}
          </div>
        </div>
        <button className="quick-reset-button" type="button" onClick={resetDay}>сбросить demo-день</button>
      </section>
    );
  }

  return (
    <section className={`card quick-input-card ${net.mode}`}>
      <div className="section-kicker">v1.87 • Local Backup / Restore Safety Layer</div>
      <h2 className="card-heading">Быстрый ввод дня</h2>
      <p className="card-description">
        Перед реальными cloud save/load/conflict тестами можно сделать локальный backup дня и восстановиться без записи в Supabase.
      </p>

      <CloudDaySyncPanel document={cloudDocument} onLoad={loadCloudDocument} />
      <LocalBackupRestorePanel document={cloudDocument} onRestore={loadCloudDocument} />

      <div className="quick-current-grid">
        <MoneyInput label="Наличные" value={dayInput.money.cash} onChange={value => updateMoney('cash', value)} />
        <MoneyInput label="Карта" value={dayInput.money.card} onChange={value => updateMoney('card', value)} />
        <MoneyInput label="Drivee баланс" value={dayInput.money.driveeBalance} onChange={value => updateMoney('driveeBalance', value)} />
      </div>

      <div className="quick-net-summary">
        <div>
          <span>Грязными сейчас</span>
          <b>{formatRub(net.grossDone)}</b>
        </div>
        <div>
          <span>Чистые со смены</span>
          <b>{formatRub(net.shiftCleanExpected)}</b>
        </div>
        <div>
          <span>Свободно после плана</span>
          <b>{formatRub(net.realFreeExpectedAfterDayPlan)}</b>
        </div>
      </div>

      <div className="quick-progress-pair">
        <div>
          <span>К чистым {formatRub(net.targetNet)}</span>
          <b>{cleanProgress}%</b>
        </div>
        <ProgressBar value={cleanProgress} />
        <div>
          <span>К обороту для чистой цели {formatRub(net.grossNeededForTargetNet)}</span>
          <b>{grossProgress}%</b>
        </div>
        <ProgressBar value={grossProgress} />
      </div>


      <div className={`daily-decision-summary-panel ${dailyDecisionSummary.mode}`}>
        <div className="audit-log-heading">Решение дня: работа / бензин / машина / деньги</div>
        <div className="decision-headline">
          <b>{dailyDecisionSummary.headline}</b>
          <span>{dailyDecisionSummary.primaryAction}</span>
        </div>
        <div className="decision-grid">
          <div><span>Работа</span><p>{dailyDecisionSummary.workDecision}</p></div>
          <div><span>Бензин</span><p>{dailyDecisionSummary.fuelDecision}</p></div>
          <div><span>Машина</span><p>{dailyDecisionSummary.carDecision}</p></div>
          <div><span>Распределение</span><p>{dailyDecisionSummary.allocationDecision}</p></div>
          <div className="decision-spending"><span>Траты</span><p>{dailyDecisionSummary.spendingDecision}</p></div>
        </div>
        <div className="decision-signal-list">
          {dailyDecisionSummary.signals.map(signal => (
            <div className={`decision-signal ${signal.level}`} key={signal.id}>
              <b>{signal.title}</b>
              <p>{signal.message}</p>
            </div>
          ))}
        </div>
      </div>


      <div className="quick-action-block">
        <h3>Добавить заказ</h3>
        <div className="quick-button-row">
          {orderPresets.map(amount => <button key={amount} type="button" onClick={() => addOrder(amount)}>+{formatRub(amount)}</button>)}
        </div>
        <div className="quick-inline-form">
          <input inputMode="numeric" placeholder="сумма заказа" value={customOrder} onChange={event => setCustomOrder(event.target.value)} />
          <button type="button" onClick={addCustomOrder}>добавить</button>
        </div>
      </div>

      <div className="quick-action-block">
        <h3>Добавить бензин</h3>
        <div className="quick-button-row">
          {fuelPresets.map(amount => <button key={amount} type="button" onClick={() => addFuel(amount)}>+{formatRub(amount)}</button>)}
        </div>
        <p className="quick-note">Бензин уменьшает “ещё нужно на бензин” и влияет на чистые со смены по твоей логике.</p>
      </div>

      <div className="quick-action-block">
        <h3>Добавить расход / задачу дня</h3>
        <div className="quick-button-row">
          {expensePresets.map(preset => <button key={preset.id} type="button" onClick={() => addExpense(preset)}>{preset.title} +{formatRub(preset.amount)}</button>)}
        </div>
        <div className="quick-inline-form two-inputs">
          <input placeholder="название" value={customExpenseTitle} onChange={event => setCustomExpenseTitle(event.target.value)} />
          <input inputMode="numeric" placeholder="сумма" value={customExpense} onChange={event => setCustomExpense(event.target.value)} />
          <button type="button" onClick={addCustomExpense}>добавить</button>
        </div>
      </div>






      <div className="car-maintenance-panel">
        <div className="audit-log-heading">Машина / масло / пробег</div>
        <div className="maintenance-grid">
          <div>
            <b>{oilServiceStatus.kmSinceService.toLocaleString('ru-RU')} км</b>
            <span>после замены 16.06.2026</span>
          </div>
          <div>
            <b>{oilServiceStatus.reminderOdometerKm.toLocaleString('ru-RU')} км</b>
            <span>напомнить о масле</span>
          </div>
          <div>
            <b>{oilServiceStatus.nextChangeOdometerKm.toLocaleString('ru-RU')} км</b>
            <span>плановая замена</span>
          </div>
          <div>
            <b>{Math.round(oilServiceStatus.averageKmPerDaySinceService).toLocaleString('ru-RU')} км/день</b>
            <span>среднее после замены</span>
          </div>
        </div>
        <p className="quick-note">{oilServiceStatus.recommendation}</p>
        <p className="quick-note">
          При текущем свежем темпе примерно {Math.round(fuelByMileageEstimate.costRub).toLocaleString('ru-RU')} ₽ бензина на 189.5 км при 12 л/100 км и 75.51 ₽/л. Это короткий период, не вечная норма.
        </p>
      </div>


      <div className="daily-fuel-budget-panel">
        <div className="audit-log-heading">Дневной бюджет бензина от пробега</div>
        <div className="fuel-budget-summary">
          <div>
            <b>{dailyFuelBudget.recommendedWorkFuelReserveRub.toLocaleString('ru-RU')} ₽</b>
            <span>рекомендуемый рабочий резерв на бензин</span>
          </div>
          <div>
            <b>{Math.round(dailyFuelBudget.currentFreshAverageKmPerDay).toLocaleString('ru-RU')} км/день</b>
            <span>свежий средний пробег после замены</span>
          </div>
          <div>
            <b>{dailyFuelBudget.consumptionRangeLitersPer100Km[0]}–{dailyFuelBudget.consumptionRangeLitersPer100Km[1]} л</b>
            <span>расход на 100 км</span>
          </div>
        </div>

        <div className="editable-fuel-inputs">
          <div className="quick-inline-form four-inputs">
            <label>
              <span>предыдущий пробег</span>
              <input
                inputMode="numeric"
                value={fuelInputState.previousOdometerKm}
                onChange={event => updateFuelInput('previousOdometerKm', event.target.value)}
              />
            </label>
            <label>
              <span>текущий пробег</span>
              <input
                inputMode="numeric"
                value={fuelInputState.currentOdometerKm}
                onChange={event => updateFuelInput('currentOdometerKm', event.target.value)}
              />
            </label>
            <label>
              <span>АИ-92 ₽/л</span>
              <input
                inputMode="decimal"
                value={fuelInputState.fuelPriceRubPerLiter}
                onChange={event => updateFuelInput('fuelPriceRubPerLiter', event.target.value)}
              />
            </label>
            <label>
              <span>расход л/100</span>
              <input
                inputMode="decimal"
                value={fuelInputState.consumptionLitersPer100Km}
                onChange={event => updateFuelInput('consumptionLitersPer100Km', event.target.value)}
              />
            </label>
          </div>
          <div className="editable-fuel-result">
            <div>
              <b>{Math.round(editableFuelCalculation.kmDriven).toLocaleString('ru-RU')} км</b>
              <span>пройдено</span>
            </div>
            <div>
              <b>{editableFuelCalculation.litersNeeded.toFixed(1)} л</b>
              <span>нужно топлива</span>
            </div>
            <div>
              <b>{Math.round(editableFuelCalculation.fuelCostRub).toLocaleString('ru-RU')} ₽</b>
              <span>стоимость бензина</span>
            </div>
            <div>
              <b>{editableFuelCalculation.costPerKmRub.toFixed(1)} ₽/км</b>
              <span>цена 1 км</span>
            </div>
          </div>
          {editableFuelCalculation.warning ? <p className="quick-warning">{editableFuelCalculation.warning}</p> : null}
          <p className="quick-note">{editableFuelCalculation.recommendation}</p>
          <p className="quick-note">Сохранение локально включено: пробег, бензин и история остаются на устройстве.</p>

          <div className="fuel-history-actions">
            <button type="button" onClick={saveFuelHistoryEntry} disabled={!editableFuelCalculation.isValid || editableFuelCalculation.kmDriven <= 0}>
              сохранить в историю
            </button>
            <span>{fuelHistorySummary.entriesCount} записей</span>
          </div>
          <div className="fuel-history-summary">
            <div>
              <b>{Math.round(fuelHistorySummary.totalKm).toLocaleString('ru-RU')} км</b>
              <span>в истории</span>
            </div>
            <div>
              <b>{fuelHistorySummary.totalLiters.toFixed(1)} л</b>
              <span>топливо</span>
            </div>
            <div>
              <b>{Math.round(fuelHistorySummary.totalFuelCostRub).toLocaleString('ru-RU')} ₽</b>
              <span>стоимость</span>
            </div>
            <div>
              <b>{fuelHistorySummary.averageCostPerKmRub.toFixed(1)} ₽/км</b>
              <span>средняя цена км</span>
            </div>
          </div>



          <div className={`fuel-net-integration-panel ${fuelNetIntegration.mode}`}>
            <div className="audit-log-heading">Бензин по пробегу → чистые деньги</div>
            <div className="fuel-net-grid">
              <div>
                <b>{Math.round(fuelNetIntegration.odometerFuelRub).toLocaleString('ru-RU')} ₽</b>
                <span>бензин по пробегу</span>
              </div>
              <div>
                <b>{Math.round(fuelNetIntegration.plannedFuelRub).toLocaleString('ru-RU')} ₽</b>
                <span>план топлива сейчас</span>
              </div>
              <div>
                <b>{Math.round(fuelNetIntegration.shiftCleanUsingOdometerFuelRub).toLocaleString('ru-RU')} ₽</b>
                <span>чистые с одометром</span>
              </div>
              <div>
                <b>{Math.round(fuelNetIntegration.freeMoneyUsingOdometerFuelRub).toLocaleString('ru-RU')} ₽</b>
                <span>свободно с одометром</span>
              </div>
            </div>
            <p className="quick-note">{fuelNetIntegration.summary}</p>
            {fuelNetIntegration.warnings.length > 0 ? (
              <div className="fuel-net-warnings">
                {fuelNetIntegration.warnings.map(warning => <p key={warning}>{warning}</p>)}
              </div>
            ) : null}
            <div className="fuel-net-actions">
              <button type="button" onClick={applyOdometerFuelToPlan} disabled={!editableFuelCalculation.isValid}>
                применить бензин по пробегу в план дня
              </button>
              <span>Это обновит план топлива, но не тронет историю и банк.</span>
            </div>
          </div>

          <div className="fuel-trend-panel">
            <div className="audit-log-heading">Тренды бензина / пробега</div>
            <div className="fuel-trend-chart">
              {fuelTrendReport.points.length > 0 ? fuelTrendReport.points.map(point => (
                <div className="fuel-trend-bar-row" key={`${point.label}-${point.fuelCostRub}`}>
                  <span>{point.label}</span>
                  <div className="fuel-trend-bar-track">
                    <div className="fuel-trend-bar-fill" style={{ width: `${point.barPercent}%` }} />
                  </div>
                  <b>{Math.round(point.fuelCostRub).toLocaleString('ru-RU')} ₽</b>
                </div>
              )) : <p className="quick-note">Мини-график появится после сохранения записей истории.</p>}
            </div>
            <div className="fuel-trend-signal-list">
              {fuelTrendReport.signals.map(signal => (
                <div className={`fuel-trend-signal ${signal.level}`} key={signal.id}>
                  <b>{signal.title}</b>
                  <p>{signal.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fuel-history-export-controls">
            <button type="button" onClick={() => exportFuelHistory('json')} disabled={fuelHistoryState.entries.length === 0}>
              экспорт JSON
            </button>
            <button type="button" onClick={() => exportFuelHistory('csv')} disabled={fuelHistoryState.entries.length === 0}>
              экспорт CSV
            </button>
            <button type="button" className="danger" onClick={clearFuelHistory} disabled={fuelHistoryState.entries.length === 0}>
              очистить историю
            </button>
          </div>
          {fuelHistoryExportText ? (
            <div className="fuel-history-export-box">
              <b>Экспорт {fuelHistoryExportFormat.toUpperCase()}</b>
              <textarea readOnly value={fuelHistoryExportText} />
              <p className="quick-note">Скопируй текст и сохрани в файл. Это локальный экспорт без отправки данных наружу.</p>
            </div>
          ) : null}

          <div className="fuel-history-list">
            {fuelHistoryState.entries.slice(0, 5).map(entry => (
              <div className="fuel-history-entry" key={entry.id}>
                <b>{entry.date}</b>
                <span>{Math.round(entry.kmDriven).toLocaleString('ru-RU')} км · {entry.litersNeeded.toFixed(1)} л · {Math.round(entry.fuelCostRub).toLocaleString('ru-RU')} ₽</span>
                <button type="button" onClick={() => removeFuelHistoryEntry(entry.id)}>удалить</button>
              </div>
            ))}
            {fuelHistoryState.entries.length === 0 ? (
              <p className="quick-note">История пока пустая. Сохрани текущий расчёт после смены или дня.</p>
            ) : null}
          </div>
        </div>

        <div className="fuel-scenario-list">
          {dailyFuelBudget.scenarios.map(scenario => (
            <div className="fuel-scenario-card" key={scenario.id}>
              <b>{scenario.title}</b>
              <span>{Math.round(scenario.km).toLocaleString('ru-RU')} км</span>
              <p>{formatFuelRub(scenario.costLowRub)}–{formatFuelRub(scenario.costHighRub)} / база {formatFuelRub(scenario.costBaseRub)}</p>
              <small>{scenario.note}</small>
            </div>
          ))}
        </div>
        <p className="quick-note">{dailyFuelBudget.recommendation}</p>
        <p className="quick-note">Бензин — рабочая издержка такси, а не личная трата. Он должен вычитаться до расчёта свободных денег.</p>
      </div>

      <div className="project-self-check-panel">
        <div className="audit-log-heading">Project self-check / готовность mini app</div>
        <div className="readiness-grid">
          {projectSelfCheck.miniAppReadiness.map(item => (
            <div className="readiness-card" key={item.label}>
              <b>{item.percent}</b>
              <span>{item.label}</span>
              <p>{item.meaning}</p>
            </div>
          ))}
        </div>
        <div className="self-check-list">
          {projectSelfCheck.protocolItems.map(item => (
            <div className={`self-check-row ${item.status}`} key={item.id}>
              <b>{item.label}</b>
              <span>{item.status}</span>
              <p>{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`assistant-panel ${assistantAdvice.mode}`}>
        <div className="audit-log-heading">ИИ-помощник FINFlow</div>
        <div className="assistant-headline">{assistantAdvice.headline}</div>
        <p className="assistant-next-action">{assistantAdvice.nextAction}</p>
        <div className="assistant-signal-list">
          {assistantAdvice.signals.slice(0, 5).map((signal) => (
            <div className={`assistant-signal ${signal.priority}`} key={signal.id}>
              <b>{signal.title}</b>
              <span>{signal.message}</span>
            </div>
          ))}
          {assistantAdvice.signals.length === 0 ? (
            <div className="assistant-signal info">
              <b>Сигналов риска нет</b>
              <span>Пока день выглядит управляемо. Следи за реальными заказами и расходами.</span>
            </div>
          ) : null}
        </div>



        <div className={`fuel-ai-advice-panel ${fuelAssistantAdvice.mode}`}>
          <div className="audit-log-heading">ИИ по бензину / одометру</div>
          <div className="fuel-ai-headline">{fuelAssistantAdvice.headline}</div>
          <p className="assistant-next-action">{fuelAssistantAdvice.nextAction}</p>
          <div className="assistant-signal-list">
            {fuelAssistantAdvice.signals.map(signal => (
              <div className={`assistant-signal ${signal.priority}`} key={signal.id}>
                <b>{signal.title}</b>
                <span>{signal.message}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="assistant-chat-box">
          <div className="assistant-chat-list">
            {assistantChat.slice(-6).map(message => (
              <div className={`assistant-chat-message ${message.role}`} key={message.id}>
                <b>{message.role === 'user' ? 'Ты' : 'FINFlow AI'}</b>
                <span>{message.text}</span>
              </div>
            ))}
          </div>
          <div className="assistant-chat-input">
            <input
              value={assistantQuestion}
              onChange={event => setAssistantQuestion(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') askAssistant();
              }}
              placeholder="Спроси: сколько ещё работать? можно тратить? что с Drivee?"
            />
            <button type="button" onClick={askAssistant}>спросить</button>
          </div>
        </div>

        <div className="assistant-bridge-note">
          <b>External AI bridge draft:</b>
          <span> payload готов: {externalAssistantPayload.privacyMode}; внешний AI пока не вызывается.</span>
        </div>

        <p className="quick-note">{assistantAdvice.disclaimer}</p>
      </div>

      <div className="drivee-separation-panel">
        <div className="audit-log-heading">Drivee: комиссия ≠ пополнение</div>
        <p className="quick-note">
          Комиссия Drivee считается автоматически как процент от грязных заказов. Пополнение Drivee — отдельная запись движения денег. Они не должны смешиваться, иначе чистые будут считаться неправильно.
        </p>
        <div className="allocation-summary-grid">
          <div><span>Комиссия по прогнозу</span><b>{formatRub(net.driveeExpected)}</b></div>
          <div><span>Пополнено Drivee</span><b>{formatRub(recordsSummary.driveeTopupPaid)}</b></div>
          <div><span>Ставка Drivee</span><b>{formatPercent(dayInput.taxi.driveeRate)}</b></div>
        </div>
      </div>

      <div className="records-panel">
        <div className="audit-log-heading">Редактируемые записи дня</div>
        <p className="quick-note">
          Записи — это источник правды для текущего дня. Меняешь запись → пересчитываются грязными, чистые, свободно, история, аналитика и распределение.
        </p>
        <div className="records-summary-grid">
          <div><span>Заказы</span><b>{recordsSummary.ordersCount}</b></div>
          <div><span>Такси грязными</span><b>{formatRub(recordsSummary.taxiGross)}</b></div>
          <div><span>Бензин</span><b>{formatRub(recordsSummary.fuelPaid)}</b></div>
          <div><span>Drivee top-up</span><b>{formatRub(recordsSummary.driveeTopupPaid)}</b></div>
          <div><span>Расходы</span><b>{formatRub(recordsSummary.expensesTotal)}</b></div>
          <div><span>Доходы прочие</span><b>{formatRub(recordsSummary.otherIncomeTotal)}</b></div>
          <div><span>Отключено</span><b>{recordsSummary.disabledCount}</b></div>
        </div>
        <div className="record-template-grid">
          {DAILY_RECORD_TEMPLATES.map(template => (
            <button key={template.id} type="button" onClick={() => addTemplateRecord(template.id)}>
              {template.label}
            </button>
          ))}
        </div>


        <div className="custom-template-panel">
          <div className="audit-log-heading">Мои шаблоны</div>
          <div className="record-add-form">
            <select value={templateType} onChange={event => setTemplateType(event.target.value as DailyRecordType)}>
              <option value="taxi_order">заказ</option>
              <option value="fuel">бензин</option>
              <option value="drivee_topup">Drivee пополнение</option>
              <option value="expense">расход</option>
              <option value="income">доход</option>
            </select>
            <input placeholder="название шаблона" value={templateLabel} onChange={event => setTemplateLabel(event.target.value)} />
            <input inputMode="numeric" placeholder="сумма" value={templateAmount} onChange={event => setTemplateAmount(event.target.value)} />
            <input placeholder="категория" value={templateCategory} onChange={event => setTemplateCategory(event.target.value)} />
            <button type="button" onClick={addCustomTemplate}>+ шаблон</button>
          </div>
          {customTemplates.length > 0 ? (
            <div className="custom-template-list">
              {customTemplates.map(template => (
                <article className="custom-template-row" key={template.id}>
                  <button type="button" onClick={() => addTemplateRecord(template.id)}>+ {template.label}</button>
                  <input value={template.label} onChange={event => patchCustomTemplate(template.id, { label: event.target.value })} />
                  <input inputMode="numeric" value={String(template.defaultAmount)} onChange={event => patchCustomTemplate(template.id, { defaultAmount: parseMoney(event.target.value) })} />
                  <input value={template.category} onChange={event => patchCustomTemplate(template.id, { category: event.target.value })} />
                  <button type="button" onClick={() => removeCustomTemplate(template.id)}>удалить</button>
                </article>
              ))}
            </div>
          ) : (
            <p className="quick-note">Пока своих шаблонов нет. Добавь, например: “Девушка 2500”, “Масло 7000”, “Ремонт 50000”, “Drivee 350”.</p>
          )}
        </div>

        <div className="record-filter-row">
          {DAILY_RECORD_FILTERS.map(filter => (
            <button className={recordFilter === filter.id ? 'active' : ''} key={filter.id} type="button" onClick={() => setRecordFilter(filter.id)}>
              {filter.label}
            </button>
          ))}
        </div>

        <div className="record-add-form">
          <select value={recordType} onChange={event => setRecordType(event.target.value as DailyRecordType)}>
            <option value="taxi_order">заказ такси</option>
            <option value="fuel">бензин</option>
            <option value="expense">расход</option>
            <option value="income">доход</option>
          </select>
          <input placeholder="название" value={recordTitle} onChange={event => setRecordTitle(event.target.value)} />
          <input inputMode="numeric" placeholder="сумма" value={recordAmount} onChange={event => setRecordAmount(event.target.value)} />
          <button type="button" onClick={addCustomRecord}>+ запись</button>
        </div>
        <div className="record-list">
          {visibleRecords.map(record => (
            <article className={`daily-record ${record.enabled ? '' : 'disabled'}`} key={record.id}>
              <select value={record.type} onChange={event => patchRecord(record.id, { type: event.target.value as DailyRecordType, category: event.target.value })}>
                <option value="taxi_order">заказ</option>
                <option value="fuel">бензин</option>
                <option value="expense">расход</option>
                <option value="income">доход</option>
              </select>
              <input value={record.title} onChange={event => patchRecord(record.id, { title: event.target.value })} />
              <input inputMode="numeric" value={String(record.amount)} onChange={event => patchRecord(record.id, { amount: parseMoney(event.target.value) })} />
              <input value={record.category} onChange={event => patchRecord(record.id, { category: event.target.value })} />
              <label className="editable-check">
                <input type="checkbox" checked={record.enabled} onChange={event => patchRecord(record.id, { enabled: event.target.checked })} />
                <span>учесть</span>
              </label>
              <button type="button" onClick={() => removeRecord(record.id)}>удалить</button>
              <small>{getRecordCategoryLabel(record.category)} • {record.source} • {record.note || 'без заметки'}</small>
            </article>
          ))}
        </div>
      </div>


      <div className="bank-review-panel">
        <div className="audit-log-heading">Банк → review → записи</div>
        <p className="quick-note">
          Это безопасный preview по redacted банковским кандидатам. Ничего не импортируется само: сначала проверь тип, категорию и сумму, потом нажми “в записи”.
        </p>
        <div className="bank-review-summary">
          <div><span>Всего в банковском CSV</span><b>{BANK_CANDIDATE_TOTAL_COUNT}</b></div>
          <div><span>В preview</span><b>{BANK_CANDIDATE_SAMPLE.length}</b></div>
          <div><span>В фильтре</span><b>{filteredBankCandidates.length}</b></div>
          <div><span>Топ категория</span><b>{Object.keys(BANK_CANDIDATE_CATEGORY_COUNTS)[0] ?? '—'}</b></div>
        </div>
        <div className="bank-filter-row">
          {BANK_CANDIDATE_FILTERS.map(filter => (
            <button className={bankFilter === filter.id ? 'active' : ''} key={filter.id} type="button" onClick={() => { setBankFilter(filter.id); setBankPage(0); }}>
              {filter.label}
            </button>
          ))}
        </div>
        <div className="bank-pagination-row">
          <button type="button" disabled={bankPage <= 0} onClick={() => setBankPage(previous => Math.max(0, previous - 1))}>назад</button>
          <span>страница {Math.min(bankPage + 1, bankPageCount)} / {bankPageCount}</span>
          <button type="button" disabled={bankPage >= bankPageCount - 1} onClick={() => setBankPage(previous => Math.min(bankPageCount - 1, previous + 1))}>вперёд</button>
        </div>
        <div className="bank-review-list">
          {visibleBankCandidates.map(candidate => {
            const decision = getBankDecision(candidate, bankDecisions);
            return (
              <article className={`bank-candidate ${decision.status}`} key={candidate.transactionId}>
                <div className="bank-candidate-main">
                  <b>{candidate.operationDate} {candidate.operationTime} • {formatRub(Math.abs(candidate.amount))}</b>
                  <span>{candidate.descriptionRedacted}</span>
                  <small>{candidate.suggestedCategory} / {candidate.suggestedSubcategory} • {decision.status}</small>
                </div>
                <div className="bank-candidate-edit">
                  <select value={decision.recordType} onChange={event => patchBankDecision(candidate.transactionId, { recordType: event.target.value as DailyRecordType })}>
                    <option value="taxi_order">заказ</option>
                    <option value="fuel">бензин</option>
                    <option value="drivee_topup">Drivee</option>
                    <option value="expense">расход</option>
                    <option value="income">доход</option>
                  </select>
                  <input value={decision.recordTitle} onChange={event => patchBankDecision(candidate.transactionId, { recordTitle: event.target.value })} />
                  <input value={decision.recordCategory} onChange={event => patchBankDecision(candidate.transactionId, { recordCategory: event.target.value })} />
                  <input inputMode="numeric" value={String(decision.amount)} onChange={event => patchBankDecision(candidate.transactionId, { amount: parseMoney(event.target.value) })} />
                </div>
                <div className="bank-candidate-actions">
                  <button type="button" disabled={decision.status === 'approved'} onClick={() => approveBankCandidate(candidate.transactionId)}>в записи</button>
                  <button type="button" onClick={() => postponeBankCandidate(candidate.transactionId)}>позже</button>
                  <button type="button" onClick={() => rejectBankCandidate(candidate.transactionId)}>отклонить</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="quick-facts-row">
        <span>Заказов: <b>{dayInput.taxi.ordersDone}</b></span>
        <span>Drivee оценка: <b>{formatRub(net.driveeDone)}</b> / {formatPercent(dayInput.taxi.driveeRate)}</span>
        <span>Бензин оплачен: <b>{formatRub(dayInput.taxi.fuelAlreadyPaid)}</b></span>
        <span>Бензин ещё нужен: <b>{formatRub(net.fuelStillNeeded)}</b></span>
      </div>

      <div className="editable-day-panel">
        <div className="audit-log-heading">Редактировать исходные данные</div>
        <p className="quick-note">
          Всё ниже — исходные данные. Их можно менять. Аналитика, проценты, средние и рекомендации пересчитываются автоматически и вручную не редактируются.
        </p>

        <div className="editable-grid">
          <label><span>Дата</span><input type="date" value={dayInput.localDate} onChange={event => updateDayField('localDate', event.target.value)} /></label>
          <label><span>Время</span><input type="time" value={dayInput.localTime} onChange={event => updateDayField('localTime', event.target.value)} /></label>
          <label><span>Заказов</span><input inputMode="numeric" value={String(dayInput.taxi.ordersDone)} onChange={event => updateTaxiNumber('ordersDone', event.target.value)} /></label>
          <label><span>Грязными сейчас</span><input inputMode="numeric" value={String(dayInput.taxi.grossDone)} onChange={event => updateTaxiNumber('grossDone', event.target.value)} /></label>
          <label><span>Прогноз грязными</span><input inputMode="numeric" value={String(dayInput.taxi.expectedGrossByEvening)} onChange={event => updateTaxiNumber('expectedGrossByEvening', event.target.value)} /></label>
          <label><span>Цель грязными</span><input inputMode="numeric" value={String(dayInput.taxi.targetGrossToday)} onChange={event => updateTaxiNumber('targetGrossToday', event.target.value)} /></label>
          <label><span>Цель чистыми</span><input inputMode="numeric" value={String(dayInput.taxi.targetNetToday)} onChange={event => updateTaxiNumber('targetNetToday', event.target.value)} /></label>
          <label><span>Комиссия Drivee</span><input inputMode="decimal" value={String(Math.round(dayInput.taxi.driveeRate * 100))} onChange={event => updateTaxiNumber('driveeRate', event.target.value)} /></label>
          <label><span>Бензин план</span><input inputMode="numeric" value={String(dayInput.taxi.fuelPlanned)} onChange={event => updateTaxiNumber('fuelPlanned', event.target.value)} /></label>
          <label><span>Бензин оплачен</span><input inputMode="numeric" value={String(dayInput.taxi.fuelAlreadyPaid)} onChange={event => updateTaxiNumber('fuelAlreadyPaid', event.target.value)} /></label>
          <label><span>Активные часы</span><input inputMode="decimal" value={String(dayInput.taxi.activeHours)} onChange={event => updateTaxiNumber('activeHours', event.target.value)} /></label>
          <label><span>Часы смены</span><input inputMode="decimal" value={String(dayInput.taxi.fullShiftHours)} onChange={event => updateTaxiNumber('fullShiftHours', event.target.value)} /></label>
        </div>

        <div className="editable-task-list">
          <div className="audit-log-heading">Расходы / задачи дня</div>
          {dayInput.tasks.length === 0 ? (
            <p className="quick-note">Расходов и задач пока нет.</p>
          ) : (
            dayInput.tasks.map(task => (
              <article className="editable-task" key={task.id}>
                <input value={task.title} onChange={event => updateTask(task.id, { title: event.target.value })} />
                <input inputMode="numeric" value={String(task.moneyCost)} onChange={event => updateTask(task.id, { moneyCost: parseMoney(event.target.value) })} />
                <select value={task.priority} onChange={event => updateTask(task.id, { priority: event.target.value as DayCoreTaskInput['priority'] })}>
                  <option value="critical">critical</option>
                  <option value="high">high</option>
                  <option value="normal">normal</option>
                  <option value="flexible">flexible</option>
                </select>
                <label className="editable-check">
                  <input type="checkbox" checked={task.plannedToday} onChange={event => updateTask(task.id, { plannedToday: event.target.checked })} />
                  <span>учесть</span>
                </label>
                <button type="button" onClick={() => deleteTask(task.id)}>удалить</button>
              </article>
            ))
          )}
        </div>
      </div>


      {net.warnings.length > 0 ? (
        <div className="net-warnings">
          {net.warnings.map(warning => <div key={warning}>⚠️ {warning}</div>)}
        </div>
      ) : null}

      <p className="card-description strong-note">{net.recommendation}</p>


      <div className="editable-funds-panel">
        <div className="audit-log-heading">Фонды и обязательства</div>
        <p className="quick-note">
          Это исходные данные для распределения. Их можно менять вручную. Итоговое распределение ниже пересчитывается автоматически.
        </p>

        <div className="editable-group-heading">
          <b>Обязательства</b>
          <button type="button" onClick={addObligation}>+ обязательство</button>
        </div>
        <div className="editable-record-list">
          {dayInput.obligations.map(obligation => (
            <article className="editable-record" key={obligation.id}>
              <input value={obligation.title} onChange={event => updateObligation(obligation.id, { title: event.target.value })} />
              <input inputMode="numeric" value={String(obligation.amountDue)} onChange={event => updateObligation(obligation.id, { amountDue: parseMoney(event.target.value) })} />
              <input inputMode="numeric" value={String(obligation.currentSaved)} onChange={event => updateObligation(obligation.id, { currentSaved: parseMoney(event.target.value) })} />
              <input inputMode="numeric" value={String(obligation.dueDayOfMonth)} onChange={event => updateObligation(obligation.id, { dueDayOfMonth: Math.max(1, Math.min(31, parseMoney(event.target.value))) })} />
              <select value={obligation.priority} onChange={event => updateObligation(obligation.id, { priority: event.target.value as DayCoreObligationInput['priority'] })}>
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="normal">normal</option>
                <option value="flexible">flexible</option>
              </select>
              <button type="button" onClick={() => deleteObligation(obligation.id)}>удалить</button>
              <small>сумма / накоплено / день месяца</small>
            </article>
          ))}
        </div>

        <div className="editable-group-heading">
          <b>Фонды</b>
          <button type="button" onClick={addFund}>+ фонд</button>
        </div>
        <div className="editable-record-list">
          {dayInput.funds.map(fund => (
            <article className="editable-record fund-record" key={fund.id}>
              <input value={fund.title} onChange={event => updateFund(fund.id, { title: event.target.value })} />
              <input inputMode="numeric" value={String(fund.targetAmount)} onChange={event => updateFund(fund.id, { targetAmount: parseMoney(event.target.value) })} />
              <input inputMode="numeric" value={String(fund.currentAmount)} onChange={event => updateFund(fund.id, { currentAmount: parseMoney(event.target.value) })} />
              <select value={fund.priority} onChange={event => updateFund(fund.id, { priority: event.target.value as DayCoreFundInput['priority'] })}>
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="normal">normal</option>
                <option value="flexible">flexible</option>
              </select>
              <label className="editable-check">
                <input type="checkbox" checked={fund.canReceiveToday} onChange={event => updateFund(fund.id, { canReceiveToday: event.target.checked })} />
                <span>сегодня</span>
              </label>
              <button type="button" onClick={() => deleteFund(fund.id)}>удалить</button>
              <small>цель / накоплено / приоритет / участвует сегодня</small>
            </article>
          ))}
        </div>
      </div>

      <div className={`allocation-panel ${allocation.mode}`}>
        <div className="audit-log-heading">Распределение чистых денег</div>
        <div className="allocation-summary-grid">
          <div><span>Доступно распределить</span><b>{formatRub(allocation.availableToAllocate)}</b></div>
          <div><span>Распределено</span><b>{formatRub(allocation.totalAllocated)}</b></div>
          <div><span>Дефицит</span><b>{formatRub(allocation.shortage)}</b></div>
        </div>
        <div className="allocation-strategy">
          <span>Режим: <b>{allocation.mode}</b></span>
          <span>Стратегия: <b>{allocation.strategy}</b></span>
        </div>
        <div className="allocation-bucket-list">
          {allocation.buckets.map(bucket => <AllocationBucketRow bucket={bucket} key={bucket.id} />)}
        </div>
        <p className="quick-note">{allocation.recommendation}</p>
      </div>



      <div className={`car-repair-allocation-panel ${carRepairAllocation.status}`}>
        <div className="audit-log-heading">Машина → ремонтный фонд → распределение</div>
        <div className="car-repair-grid">
          <div><span>Цель ремонта</span><b>{formatRub(carRepairAllocation.targetRub)}</b></div>
          <div><span>Накоплено</span><b>{formatRub(carRepairAllocation.currentRub)}</b></div>
          <div><span>Сегодня в плане</span><b>{formatRub(carRepairAllocation.allocatedTodayRub)}</b></div>
          <div><span>Лучше сегодня</span><b>{formatRub(carRepairAllocation.suggestedTodayRub)}</b></div>
        </div>
        <p className="quick-note">{carRepairAllocation.recommendation}</p>
        <div className="car-repair-warning-list">
          {carRepairAllocation.warnings.slice(0, 4).map(warning => <p key={warning}>{warning}</p>)}
        </div>
        <div className="car-repair-actions">
          <button type="button" onClick={strengthenCarRepairFund}>усилить ремонтный фонд сегодня</button>
          <span>Сделает фонд активным сегодня и поднимет приоритет до high.</span>
        </div>
      </div>


      <div className="daily-history-panel">
        <div className="audit-log-heading">История дней • локально</div>
        <div className="history-status-row">
          <span>{getDailyHistoryStorageLabel(historyState)}</span>
          <span>сохранено дней: <b>{historySummary.daysSaved}</b></span>
        </div>
        <div className="history-summary-grid">
          <div><span>Грязными</span><b>{formatRub(historySummary.totalGross)}</b></div>
          <div><span>Чистыми</span><b>{formatRub(historySummary.totalClean)}</b></div>
          <div><span>Среднее чистыми</span><b>{formatRub(historySummary.averageClean)}</b></div>
        </div>

        <div className="history-analytics-panel">
          <div className="audit-log-heading">Аналитика истории</div>
          <div className="analytics-grid">
            <div><span>Выполнение цели</span><b>{historyAnalytics.targetHitRate}%</b></div>
            <div><span>Дней в цели</span><b>{historyAnalytics.targetHitDays}/{historyAnalytics.daysSaved}</b></div>
            <div><span>Средний заказов</span><b>{historyAnalytics.averageOrders}</b></div>
            <div><span>Средне грязными</span><b>{formatRub(historyAnalytics.averageGross)}</b></div>
            <div><span>Средне свободно</span><b>{formatRub(historyAnalytics.averageFree)}</b></div>
            <div><span>Динамика чистых</span><b>{formatSignedRub(historyAnalytics.cleanTrendDelta)}</b></div>
          </div>
          <div className="analytics-best-worst">
            <div>
              <span>Лучший день</span>
              <b>{historyAnalytics.bestCleanSnapshot ? formatRub(historyAnalytics.bestCleanSnapshot.summary.shiftClean) : '—'}</b>
              <small>{historyAnalytics.bestCleanSnapshot?.localDate ?? 'нет данных'}</small>
            </div>
            <div>
              <span>Худший день</span>
              <b>{historyAnalytics.worstCleanSnapshot ? formatRub(historyAnalytics.worstCleanSnapshot.summary.shiftClean) : '—'}</b>
              <small>{historyAnalytics.worstCleanSnapshot?.localDate ?? 'нет данных'}</small>
            </div>
          </div>
          <p className="quick-note">{historyAnalytics.recommendation}</p>
        </div>

        <button className="quick-save-button" type="button" onClick={saveDaySnapshot}>сохранить снимок дня</button>

        {historyState.snapshots.length > 0 ? (
          <div className="history-snapshot-list">
            {historyState.snapshots.slice(0, 5).map(snapshot => (
              <article className={`history-snapshot ${snapshot.locked ? 'locked' : ''}`} key={snapshot.id}>
                <div>
                  <b>{snapshot.localDate}</b>
                  <span>{formatRub(snapshot.summary.grossDone)} грязными • {formatRub(snapshot.summary.shiftClean)} чистыми • заказов {snapshot.summary.ordersDone}</span>
                </div>
                <div className="history-actions">
                  <button type="button" onClick={() => setSelectedSnapshotId(snapshot.id)}>details</button>
                  <button type="button" onClick={() => restoreSnapshot(snapshot.id)}>restore</button>
                  <button type="button" onClick={() => toggleSnapshotLock(snapshot.id)}>{snapshot.locked ? 'unlock' : 'lock'}</button>
                  <button type="button" disabled={snapshot.locked} onClick={() => deleteSnapshot(snapshot.id)}>delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="quick-note">История пока пустая. Сохрани снимок дня, чтобы не потерять текущий расчёт.</p>
        )}

        {selectedSnapshot ? (
          <div className="history-detail-panel">
            <div className="audit-log-heading">Детали снимка</div>
            <div className="history-detail-grid">
              <div><span>Дата</span><b>{selectedSnapshot.localDate}</b></div>
              <div><span>Сохранён</span><b>{new Date(selectedSnapshot.savedAt).toLocaleString('ru-RU')}</b></div>
              <div><span>Режим</span><b>{selectedSnapshot.summary.mode}</b></div>
              <div><span>Грязными</span><b>{formatRub(selectedSnapshot.summary.grossDone)}</b></div>
              <div><span>Чистые со смены</span><b>{formatRub(selectedSnapshot.summary.shiftClean)}</b></div>
              <div><span>Свободно после плана</span><b>{formatRub(selectedSnapshot.summary.freeAfterPlan)}</b></div>
              <div><span>Drivee</span><b>{formatRub(selectedSnapshot.summary.drivee)}</b></div>
              <div><span>Бензин оплачен</span><b>{formatRub(selectedSnapshot.summary.fuelPaid)}</b></div>
            </div>
            {selectedSnapshotComparison ? (
              <div className="history-compare-box">
                <b>Сравнение с текущим вводом</b>
                <span>Грязными: {formatSignedRub(selectedSnapshotComparison.grossDelta)}</span>
                <span>Чистыми: {formatSignedRub(selectedSnapshotComparison.cleanDelta)}</span>
                <span>Свободно: {formatSignedRub(selectedSnapshotComparison.freeDelta)}</span>
                <span>Режим изменился: {selectedSnapshotComparison.modeChanged ? 'да' : 'нет'}</span>
              </div>
            ) : null}
            <div className="history-detail-actions">
              <button type="button" onClick={() => restoreSnapshot(selectedSnapshot.id)}>восстановить в Quick Input</button>
              <button type="button" onClick={() => setSelectedSnapshotId('')}>закрыть детали</button>
            </div>
          </div>
        ) : null}

      </div>

      <button className="quick-reset-button" type="button" onClick={resetDay}>сбросить demo-день</button>
    </section>
  );
}
