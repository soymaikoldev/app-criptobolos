import { Account, Rates, Transaction } from "@/types";

export const STORAGE_KEYS = {
  accounts: "accounts",
  transactions: "transactions",
  rates: "rates",
  rateHistory: "rateHistory",
  budgets: "budgets",
  lastP2pRate: "lastP2pRate",
} as const;

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "acc_maik_principal",
    name: "Maik Principal",
    type: "Wallet",
    mainCurrency: "USDT",
    extraBalances: [
      { symbol: "SOL", amount: 0.0097 },
      { symbol: "SKR", amount: 97.16 },
    ],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "acc_edukora",
    name: "EduKora Wallet",
    type: "Wallet",
    mainCurrency: "USDT",
    extraBalances: [{ symbol: "SOL", amount: 1.41 }],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "acc_maik_pub1",
    name: "Maik Public1",
    type: "Wallet",
    mainCurrency: "USDT",
    extraBalances: [{ symbol: "SOL", amount: 0.065 }],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "acc_maikol_pub2",
    name: "Maikol Public2",
    type: "Wallet",
    mainCurrency: "USDT",
    extraBalances: [
      { symbol: "SOL", amount: 0 },
      { symbol: "USDc", amount: 0.21 },
    ],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "acc_binance",
    name: "Binance",
    type: "Exchange",
    mainCurrency: "USDT",
    extraBalances: [{ symbol: "WSOL", amount: 0.013196 }],
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "acc_banco",
    name: "Banco Nacional",
    type: "Banco",
    mainCurrency: "Bs",
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "acc_kast",
    name: "KAST",
    type: "Tarjeta",
    mainCurrency: "USD",
    createdAt: "2026-03-01T00:00:00.000Z",
  },
];

export const DEFAULT_RATES: Rates = {
  bcv: 90,
  p2p: 606.80,
};

/**
 * Transacciones iniciales con datos reales del usuario.
 * Se cargan la primera vez que se abre la app (cuando no hay nada en localStorage).
 */
export const DEFAULT_TRANSACTIONS: Transaction[] = [
  // ── Saldos iniciales (2026-03-01) ──
  {
    id: "tx_init_maik_principal",
    createdAt: "2026-03-01T00:00:00.000Z",
    date: "2026-03-01",
    type: "ingreso",
    amount: 120,
    currency: "USDT",
    accountId: "acc_maik_principal",
    note: "Saldo inicial",
    realUsd: 120,
  },
  {
    id: "tx_init_binance",
    createdAt: "2026-03-01T00:00:00.000Z",
    date: "2026-03-01",
    type: "ingreso",
    amount: 3.03,
    currency: "USDT",
    accountId: "acc_binance",
    note: "Saldo inicial",
    realUsd: 3.03,
  },

  // ── 2026-03-07 ──
  {
    id: "tx_transfer_maik_binance",
    createdAt: "2026-03-07T10:00:00.000Z",
    date: "2026-03-07",
    type: "transferencia",
    amount: 15,
    currency: "USDT",
    sourceAccountId: "acc_maik_principal",
    destinationAccountId: "acc_binance",
    note: "Envío a Binance para cambio P2P",
    realUsd: 15,
  },
  {
    id: "tx_cambio_p2p_1",
    createdAt: "2026-03-07T11:00:00.000Z",
    date: "2026-03-07",
    type: "cambio",
    amount: 16.51,           // USDT total (incluye comisión)
    currency: "USDT",
    commission: 0.06,        // Comisión Binance
    amountReceived: 9981.86, // Bs recibidos: (16.51 - 0.06) × 606.80
    usedRate: 606.80,        // Tasa P2P
    sourceAccountId: "acc_binance",
    destinationAccountId: "acc_banco",
    note: "Cambio P2P Binance → Banco Nacional",
    realUsd: 16.51,
  },
];

export const CATEGORIES = [
  "Supermercado",
  "Comida",
  "Transporte",
  "Servicios",
  "Salud",
  "Entretenimiento",
  "Suscripciones",
  "Ropa",
  "Educación",
  "Tecnología",
  "Inversión",
  "Otros",
];
