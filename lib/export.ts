import { Account, Transaction } from "@/types";

const esc = (v: string | number | undefined) => `"${String(v ?? "").replaceAll('"', '""')}"`;

export function exportTransactionsCsv(transactions: Transaction[], accounts: Account[]) {
  const accountName = (id?: string) => accounts.find((acc) => acc.id === id)?.name ?? "-";
  const headers = ["fecha", "tipo", "detalle", "monto", "moneda", "usd_real", "nota"];
  const rows = transactions.map((tx) => {
    const detail = tx.type === "transferencia"
      ? `${accountName(tx.sourceAccountId)} → ${accountName(tx.destinationAccountId)}`
      : `${accountName(tx.accountId)} / ${tx.category ?? "-"}`;
    return [tx.date, tx.type, detail, tx.amount, tx.currency, tx.realUsd.toFixed(2), tx.note ?? ""];
  });

  const csv = [headers, ...rows].map((row) => row.map((v) => esc(v)).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
