import { DEFAULT_ACCOUNTS, DEFAULT_RATES, DEFAULT_TRANSACTIONS, STORAGE_KEYS } from "@/lib/constants";
import { Account, CategoryBudget, RateRecord, Rates, Transaction } from "@/types";

const hasWindow = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!hasWindow) return fallback;
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!hasWindow) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getAccounts: () => read<Account[]>(STORAGE_KEYS.accounts, DEFAULT_ACCOUNTS),
  saveAccounts: (accounts: Account[]) => write(STORAGE_KEYS.accounts, accounts),

  getTransactions: () => read<Transaction[]>(STORAGE_KEYS.transactions, DEFAULT_TRANSACTIONS),
  saveTransactions: (transactions: Transaction[]) => write(STORAGE_KEYS.transactions, transactions),

  getRates: () => read<Rates>(STORAGE_KEYS.rates, DEFAULT_RATES),
  saveRates: (rates: Rates) => write(STORAGE_KEYS.rates, rates),

  getRateHistory: () => read<RateRecord[]>(STORAGE_KEYS.rateHistory, []),
  saveRateHistory: (history: RateRecord[]) => write(STORAGE_KEYS.rateHistory, history),

  getBudgets: () => read<CategoryBudget[]>(STORAGE_KEYS.budgets, []),
  saveBudgets: (budgets: CategoryBudget[]) => write(STORAGE_KEYS.budgets, budgets),

  getLastP2pRate: () => read<number>(STORAGE_KEYS.lastP2pRate, 0),
  saveLastP2pRate: (rate: number) => write(STORAGE_KEYS.lastP2pRate, rate),

  /** Exporta todos los datos como JSON para backup */
  exportAll: () => {
    if (!hasWindow) return;
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts: read<Account[]>(STORAGE_KEYS.accounts, []),
      transactions: read<Transaction[]>(STORAGE_KEYS.transactions, []),
      rates: read<Rates>(STORAGE_KEYS.rates, DEFAULT_RATES),
      rateHistory: read<RateRecord[]>(STORAGE_KEYS.rateHistory, []),
      budgets: read<CategoryBudget[]>(STORAGE_KEYS.budgets, []),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crypto-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  /** Importa datos desde un JSON de backup */
  importAll: (jsonString: string): { ok: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.version || !Array.isArray(data.transactions)) {
        return { ok: false, error: "Archivo inválido. ¿Es un backup de Crypto Tracker?" };
      }
      if (data.accounts) write(STORAGE_KEYS.accounts, data.accounts);
      if (data.transactions) write(STORAGE_KEYS.transactions, data.transactions);
      if (data.rates) write(STORAGE_KEYS.rates, data.rates);
      if (data.rateHistory) write(STORAGE_KEYS.rateHistory, data.rateHistory);
      if (data.budgets) write(STORAGE_KEYS.budgets, data.budgets);
      return { ok: true };
    } catch {
      return { ok: false, error: "No se pudo leer el archivo." };
    }
  },

  resetDemo: () => {
    if (!hasWindow) return;
    localStorage.removeItem(STORAGE_KEYS.rateHistory);
    localStorage.removeItem(STORAGE_KEYS.budgets);
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(DEFAULT_ACCOUNTS));
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.rates, JSON.stringify(DEFAULT_RATES));
    localStorage.setItem(STORAGE_KEYS.lastP2pRate, JSON.stringify(606.80));
  },
};
