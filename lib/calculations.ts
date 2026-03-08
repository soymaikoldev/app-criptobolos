import { Account, AccountBalance, CambioUtilization, CategoryBudget, Rates, Transaction } from "@/types";

export function toRealUsd(amount: number, currency: string, rate?: number, fallbackRate?: number): number {
  if (currency === "USD" || currency === "USDT") return amount;
  const finalRate = rate ?? fallbackRate;
  if (!finalRate || finalRate <= 0) return 0;
  return amount / finalRate;
}

export function enrichWithUsd(amount: number, currency: string, rates: Rates, usedRate?: number) {
  if (currency === "Bs") {
    const realUsd = toRealUsd(amount, currency, usedRate ?? rates.p2p);
    const bcvUsd = toRealUsd(amount, currency, rates.bcv);
    return { realUsd, bcvUsd, diffUsd: bcvUsd - realUsd };
  }
  return { realUsd: toRealUsd(amount, currency), bcvUsd: undefined, diffUsd: undefined };
}

export function monthlySummary(transactions: Transaction[], monthKey: string) {
  const monthTxs = transactions.filter((tx) => tx.date.startsWith(monthKey));
  const gastos = monthTxs.filter((tx) => tx.type === "gasto");
  const ingresos = monthTxs.filter((tx) => tx.type === "ingreso");
  const cambios = monthTxs.filter((tx) => tx.type === "cambio");

  const totalUsdt = gastos.reduce((acc, tx) => acc + tx.realUsd, 0);
  const totalBcv = gastos.reduce((acc, tx) => acc + (tx.bcvUsd ?? tx.realUsd), 0);
  const totalIngreso = ingresos.reduce((acc, tx) => acc + tx.realUsd, 0);
  const ahorroVsBCV = totalBcv - totalUsdt;
  const totalCambiado = cambios.reduce((acc, tx) => acc + tx.amount, 0);

  const today = new Date();
  const monthDate = new Date(`${monthKey}-01`);
  const isCurrentMonth =
    monthDate.getMonth() === today.getMonth() &&
    monthDate.getFullYear() === today.getFullYear();
  const totalDaysInMonth = new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5)), 0).getDate();
  const days = isCurrentMonth ? today.getDate() : totalDaysInMonth;
  const projection = isCurrentMonth && days > 0
    ? (totalUsdt / days) * totalDaysInMonth
    : totalUsdt;

  return {
    totalUsdt,
    totalBcv,
    totalIngreso,
    promedioDiario: days > 0 ? totalUsdt / days : 0,
    ahorroVsBCV,
    totalCambiado,
    projection,
    isCurrentMonth,
    totalDaysInMonth,
  };
}

export function monthLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("es-VE", { month: "short", year: "numeric" });
}

export function calculateAccountBalance(account: Account, transactions: Transaction[], rates: Rates): AccountBalance {
  let balance = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case "ingreso":
        if (tx.accountId === account.id && tx.currency === account.mainCurrency) balance += tx.amount;
        break;
      case "gasto":
        if (tx.accountId === account.id && tx.currency === account.mainCurrency) balance -= tx.amount;
        break;
      case "transferencia":
        if (tx.sourceAccountId === account.id && tx.currency === account.mainCurrency) balance -= tx.amount;
        if (tx.destinationAccountId === account.id && tx.currency === account.mainCurrency) balance += tx.amount;
        break;
      case "cambio":
        // amount ya incluye la comisión (ej: 16.51 total = 16.45 P2P + 0.06 comisión)
        if (tx.sourceAccountId === account.id && tx.currency === account.mainCurrency) {
          balance -= tx.amount;
        }
        if (tx.destinationAccountId === account.id && account.mainCurrency === "Bs") {
          balance += tx.amountReceived ?? tx.amount * (tx.usedRate ?? rates.p2p);
        }
        break;
    }
  }

  const balanceUsd = account.mainCurrency === "Bs" ? balance / rates.p2p : balance;
  return { account, balance, currency: account.mainCurrency, balanceUsd };
}

/**
 * Para un cambio P2P, calcula cuántos Bs se han gastado
 * de los recibidos en ese cambio específico.
 */
export function getCambioUtilization(cambio: Transaction, allTransactions: Transaction[]): CambioUtilization {
  const bsRecibidos = cambio.amountReceived ?? 0;
  if (!bsRecibidos || !cambio.destinationAccountId) {
    return { bsRecibidos, bsGastados: 0, bsRestante: bsRecibidos, pct: 0 };
  }

  // Fecha del siguiente cambio hacia la misma cuenta destino
  const nextCambio = allTransactions
    .filter((tx) =>
      tx.type === "cambio" &&
      tx.id !== cambio.id &&
      tx.destinationAccountId === cambio.destinationAccountId &&
      tx.date > cambio.date,
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const endDate = nextCambio?.date ?? "9999-12-31";

  const bsGastados = allTransactions
    .filter((tx) =>
      tx.type === "gasto" &&
      tx.currency === "Bs" &&
      tx.accountId === cambio.destinationAccountId &&
      tx.date >= cambio.date &&
      tx.date < endDate,
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const bsRestante = Math.max(0, bsRecibidos - bsGastados);
  const pct = bsRecibidos > 0 ? Math.min(100, (bsGastados / bsRecibidos) * 100) : 0;

  return { bsRecibidos, bsGastados, bsRestante, pct };
}

/**
 * Calcula el gasto en USDT por categoría para un mes
 */
export function spendingByCategory(transactions: Transaction[], monthKey: string): Record<string, number> {
  return transactions
    .filter((tx) => tx.type === "gasto" && tx.date.startsWith(monthKey))
    .reduce<Record<string, number>>((acc, tx) => {
      const cat = tx.category ?? "Otros";
      acc[cat] = (acc[cat] ?? 0) + tx.realUsd;
      return acc;
    }, {});
}

/**
 * Para cada budget activo del mes, calcula el progreso
 */
export function budgetProgress(budgets: CategoryBudget[], transactions: Transaction[], monthKey: string) {
  const spending = spendingByCategory(transactions, monthKey);
  return budgets
    .filter((b) => b.month === monthKey)
    .map((b) => ({
      ...b,
      spent: spending[b.category] ?? 0,
      pct: b.limitUsdt > 0 ? Math.min(100, ((spending[b.category] ?? 0) / b.limitUsdt) * 100) : 0,
    }));
}
