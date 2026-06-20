export const FINFLOW_ECOSYSTEM_MAP_VERSION = 'finflow_ecosystem_map_v1_64' as const;

export type FinflowEcosystemModule = {
  id: string;
  title: string;
  status: 'built_foundation' | 'partial' | 'planned' | 'blocked';
  purpose: string;
  nextStep: string;
};

export const finflowEcosystemModules: FinflowEcosystemModule[] = [
  {
    id: 'day_core',
    title: 'Day Core',
    status: 'built_foundation',
    purpose: 'Daily decision core: clean money, plan, free money, allocation and warnings.',
    nextStep: 'Connect more inputs to real persistence.'
  },
  {
    id: 'taxi_work_engine',
    title: 'Taxi Work Engine',
    status: 'partial',
    purpose: 'Gross turnover, Drivee commission, top-up, shift/order tracking.',
    nextStep: 'Improve real shift/order UI and analytics.'
  },
  {
    id: 'car_cost_engine',
    title: 'Car Cost and Maintenance Engine',
    status: 'partial',
    purpose: 'Fuel, odometer, oil reminders, service history and repair reserve.',
    nextStep: 'Daily Fuel Budget From Odometer Layer.'
  },
  {
    id: 'bank_review_engine',
    title: 'Bank Review Engine',
    status: 'partial',
    purpose: 'Review bank candidates before they become records.',
    nextStep: 'Persist review decisions and import approved rows.'
  },
  {
    id: 'funds_obligations',
    title: 'Funds and Obligations Engine',
    status: 'built_foundation',
    purpose: 'Obligations, funds, repair/cushion/goals and allocation.',
    nextStep: 'Sync to Supabase and improve deadlines.'
  },
  {
    id: 'ai_assistant',
    title: 'AI Assistant',
    status: 'partial',
    purpose: 'Local advice now, external AI later server-side only.',
    nextStep: 'Connect assistant to more real daily context.'
  },
  {
    id: 'calendar_tasks',
    title: 'Calendar and Task Planner',
    status: 'planned',
    purpose: 'Sleep, errands, girlfriend meetings, car service and real work window.',
    nextStep: 'Add task/calendar model.'
  },
  {
    id: 'learning_exit_track',
    title: 'Learning and Exit-from-Taxi Track',
    status: 'planned',
    purpose: 'Connect finances and learning path to future non-taxi income.',
    nextStep: 'Define learning/career dashboard.'
  },
  {
    id: 'security_ownership',
    title: 'Security and Ownership Layer',
    status: 'partial',
    purpose: 'Protect data, secrets, private repo and IP.',
    nextStep: 'Deploy with safe env/RLS checks.'
  },
  {
    id: 'memory_protocol',
    title: 'Project Memory and Protocol System',
    status: 'built_foundation',
    purpose: 'Continuity, turn ledger, active work state and interruption recovery.',
    nextStep: 'Keep updating every package.'
  }
];
