export type Currency = "Bs" | "USD" | "USDT";
export type TransactionType = "gasto" | "ingreso" | "transferencia" | "cambio";
export type AccountType = "Wallet" | "Exchange" | "Banco" | "Efectivo" | "Tarjeta";

export interface ExtraBalance {
  symbol: string;
  amount: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  mainCurrency: Currency;
  extraBalances?: ExtraBalance[];
  createdAt: string;
}

export interface Rates {
  bcv: number;
  p2p: number;
  bcvUpdatedAt?: string;
}

export interface RateRecord {
  date: string;
  bcv: number;
  p2p: number;
}

export interface CategoryBudget {
  id: string;
  category: string;
  limitUsdt: number;
  month: string; // "2026-03"
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  amountReceived?: number;
  commission?: number;
  note?: string;
  category?: string;
  accountId?: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  usedRate?: number;
  realUsd: number;
  bcvUsd?: number;
  diffUsd?: number;
  createdAt: string;
}

export interface MovementFilters {
  fromDate?: string;
  toDate?: string;
  type?: TransactionType | "todos";
  accountId?: string | "todas";
  category?: string | "todas";
}

export interface AccountBalance {
  account: Account;
  balance: number;
  currency: Currency;
  balanceUsd: number;
}

export interface CambioUtilization {
  bsRecibidos: number;
  bsGastados: number;
  bsRestante: number;
  pct: number;
}
