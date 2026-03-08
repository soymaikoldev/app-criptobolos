"use client";

import { Account } from "@/types";
import { AccountBalance } from "@/types";

const TYPE_COLORS: Record<string, string> = {
  Wallet: "text-indigo-300 bg-indigo-900/40 border-indigo-800",
  Exchange: "text-amber-300 bg-amber-900/40 border-amber-800",
  Banco: "text-blue-300 bg-blue-900/40 border-blue-800",
  Tarjeta: "text-pink-300 bg-pink-900/40 border-pink-800",
  Efectivo: "text-emerald-300 bg-emerald-900/40 border-emerald-800",
};

export function AccountsTable({
  accounts,
  balances,
  onEdit,
  onDelete,
}: {
  accounts: Account[];
  balances?: AccountBalance[];
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
}) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
        No hay cuentas. Crea la primera arriba.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((acc) => {
        const bal = balances?.find((b) => b.account.id === acc.id);
        return (
          <div key={acc.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[acc.type] ?? ""}`}>
                  {acc.type}
                </span>
                <p className="text-sm font-semibold text-white">{acc.name}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onEdit(acc)} className="text-xs text-indigo-400 active:opacity-70">Editar</button>
                <button
                  onClick={() => { if (confirm("¿Eliminar cuenta?")) onDelete(acc.id); }}
                  className="text-xs text-rose-400 active:opacity-70"
                >
                  Borrar
                </button>
              </div>
            </div>

            {/* Saldos */}
            <div className="flex flex-wrap gap-2">
              {/* Saldo principal (calculado) */}
              {bal && (
                <div className="bg-slate-800 rounded-lg px-2.5 py-1.5">
                  <p className="text-xs text-slate-500">Saldo estimado</p>
                  <p className="text-sm font-bold text-white">
                    {bal.balance.toLocaleString("es-VE", { maximumFractionDigits: 2 })}
                    <span className="text-xs text-slate-400 ml-1">{acc.mainCurrency}</span>
                  </p>
                  {acc.mainCurrency !== "Bs" && (
                    <p className="text-xs text-slate-500">≈ ${bal.balanceUsd.toFixed(2)}</p>
                  )}
                </div>
              )}

              {/* Saldos manuales (SOL, SKR, etc.) */}
              {(acc.extraBalances ?? []).map((extra) => (
                <div key={extra.symbol} className="bg-slate-800 rounded-lg px-2.5 py-1.5">
                  <p className="text-xs text-slate-500">{extra.symbol}</p>
                  <p className="text-sm font-bold text-white">
                    {extra.amount.toLocaleString("es-VE", { maximumFractionDigits: 6 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
