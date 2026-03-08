import { DEFAULT_ACCOUNTS, DEFAULT_RATES, STORAGE_KEYS } from "@/lib/constants";
import { Account, Rates, Transaction } from "@/types";

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
  getTransactions: () => read<Transaction[]>(STORAGE_KEYS.transactions, []),
  saveTransactions: (transactions: Transaction[]) => write(STORAGE_KEYS.transactions, transactions),
  getRates: () => read<Rates>(STORAGE_KEYS.rates, DEFAULT_RATES),
  saveRates: (rates: Rates) => write(STORAGE_KEYS.rates, rates),
  resetDemo: () => {
    if (!hasWindow) return;
    localStorage.removeItem(STORAGE_KEYS.transactions);
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(DEFAULT_ACCOUNTS));
    localStorage.setItem(STORAGE_KEYS.rates, JSON.stringify(DEFAULT_RATES));
  },
};
