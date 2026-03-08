import { Rates, Transaction } from "@/types";

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
    return {
      realUsd,
      bcvUsd,
      diffUsd: bcvUsd - realUsd,
    };
  }

  return {
    realUsd: toRealUsd(amount, currency),
    bcvUsd: undefined,
    diffUsd: undefined,
  };
}

export function monthlySummary(transactions: Transaction[], monthKey: string) {
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(monthKey));
  const gastos = monthTransactions.filter((tx) => tx.type === "gasto");
  const ingresos = monthTransactions.filter((tx) => tx.type === "ingreso");

  const totalGasto = gastos.reduce((acc, tx) => acc + tx.realUsd, 0);
  const totalIngreso = ingresos.reduce((acc, tx) => acc + tx.realUsd, 0);
  const ahorroVsBCV = gastos.reduce((acc, tx) => acc + (tx.diffUsd ?? 0), 0);

  const days = new Date(`${monthKey}-01`).getMonth() === new Date().getMonth()
    ? new Date().getDate()
    : new Date(Number(monthKey.slice(0, 4)), Number(monthKey.slice(5)), 0).getDate();

  return {
    totalGasto,
    totalIngreso,
    promedioDiario: days > 0 ? totalGasto / days : 0,
    ahorroVsBCV,
  };
}

export function monthLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("es-VE", { month: "short", year: "numeric" });
}
