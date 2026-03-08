import { Account, Rates } from "@/types";

export const STORAGE_KEYS = {
  accounts: "accounts",
  transactions: "transactions",
  rates: "rates",
} as const;

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: "acc_maik", name: "Maik Principal", type: "Wallet", mainCurrency: "USDT", createdAt: new Date().toISOString() },
  { id: "acc_binance", name: "Binance", type: "Exchange", mainCurrency: "USDT", createdAt: new Date().toISOString() },
  { id: "acc_banco_nacional", name: "Banco Nacional", type: "Banco", mainCurrency: "Bs", createdAt: new Date().toISOString() },
];

export const DEFAULT_RATES: Rates = {
  bcv: 42,
  p2p: 62,
};

export const CATEGORIES = ["Supermercado", "Comida", "Transporte", "Servicios", "Salud", "Entretenimiento", "Otros"];
