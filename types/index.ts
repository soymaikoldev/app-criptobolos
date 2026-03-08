export type Currency = "Bs" | "USD" | "USDT";
export type TransactionType = "gasto" | "ingreso" | "transferencia";
export type AccountType = "Wallet" | "Exchange" | "Banco" | "Efectivo";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  mainCurrency: Currency;
  createdAt: string;
}

export interface Rates {
  bcv: number;
  p2p: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
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
