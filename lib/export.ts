import { Account, Transaction } from "@/types";

const esc = (v: string | number | undefined) => `"${String(v ?? "").replaceAll('"', '""')}"`;

const TYPE_LABELS: Record<string, string> = {
  gasto: "Gasto",
  ingreso: "Ingreso",
  transferencia: "Transferencia",
  cambio: "Cambio P2P",
};

export function exportTransactionsCsv(transactions: Transaction[], accounts: Account[]) {
  const accountName = (id?: string) => accounts.find((acc) => acc.id === id)?.name ?? "-";
  const headers = ["fecha", "tipo", "detalle", "monto", "moneda", "tasa_usada", "usd_real", "usd_bcv", "ahorro_usd", "nota"];

  const rows = transactions.map((tx) => {
    let detail = "";
    if (tx.type === "transferencia") {
      detail = `${accountName(tx.sourceAccountId)} → ${accountName(tx.destinationAccountId)}`;
    } else if (tx.type === "cambio") {
      const bsRec = tx.amountReceived ?? tx.amount * (tx.usedRate ?? 0);
      detail = `${accountName(tx.sourceAccountId)} → ${accountName(tx.destinationAccountId)} (${bsRec.toFixed(0)} Bs)`;
    } else {
      detail = `${accountName(tx.accountId)} / ${tx.category ?? "-"}`;
    }
    return [
      tx.date,
      TYPE_LABELS[tx.type] ?? tx.type,
      detail,
      tx.amount,
      tx.currency,
      tx.usedRate ?? "-",
      tx.realUsd.toFixed(2),
      tx.bcvUsd?.toFixed(2) ?? "-",
      tx.diffUsd?.toFixed(2) ?? "-",
      tx.note ?? "",
    ];
  });

  const csv = [headers, ...rows].map((row) => row.map((v) => esc(v)).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
