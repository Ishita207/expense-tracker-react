export type TransactionType = 'income' | 'expense' | 'investment';

export type Theme = 'light' | 'dark';

/** Budgets in this app are always monthly (selectedMonth in the store). */
export type BudgetPeriod = 'month';

/**
 * A single ledger entry.
 * The UI currently stores a `title` rather than a separate `note` field.
 * `note` is optional so persisted records can carry one later without a runtime change.
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  title: string;
  note?: string;
  isRecurring?: boolean;
  recurringSourceId?: string;
}

/**
 * Conceptual budget row. The Zustand store persists this as
 * `categoryBudgets: Record<category, limit>` with an implicit monthly period.
 */
export interface Budget {
  category: string;
  limit: number;
  period: BudgetPeriod;
}

export type CategoryBudgetMap = Record<string, number | string>;

/** ok <80%, warning 80–100%, over >100%. */
export type BudgetProgressStatus = 'ok' | 'warning' | 'over' | 'no-limit';

export interface BudgetUsage {
  category: string;
  spent: number;
  limit: number;
  usagePercent: number;
  status: BudgetProgressStatus;
}

export interface TransactionFilters {
  searchQuery?: string;
  category?: string;
  amountMin?: string | number;
  amountMax?: string | number;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionTotals {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
}

export interface ExpenseFormData {
  title: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringSourceId: string | undefined;
}

export interface ExpenseStoreState {
  expenses: Transaction[];
  selectedMonth: string;
  categoryBudgets: CategoryBudgetMap;
  theme: Theme;
  hasHydrated: boolean;
}

export interface ExpenseStoreActions {
  addExpenseEntry: (expense: Transaction) => void;
  addExpenseEntries: (entries: Transaction[]) => void;
  updateExpenseEntry: (updatedExpense: Transaction) => void;
  deleteExpenseEntry: (id: string) => void;
  setSelectedMonth: (month: string) => void;
  setCategoryBudget: (category: string, value: number | string) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setHasHydrated: (value: boolean) => void;
}

export type ExpenseStore = ExpenseStoreState & ExpenseStoreActions;

export type PersistedExpenseState = Pick<
  ExpenseStoreState,
  'expenses' | 'selectedMonth' | 'categoryBudgets' | 'theme'
>;
