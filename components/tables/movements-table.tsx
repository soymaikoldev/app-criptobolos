"use client";

import { useState } from "react";
import { Account, MovementFilters, Transaction } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import { getCambioUtilization } from "@/lib/calculations";

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  gasto:         { label: "Gasto",         className: "bg-rose-900/60 text-rose-300 border-rose-800" },
  ingreso:       { label: "Ingreso",        className: "bg-emerald-900/60 text-emerald-300 border-emerald-800" },
  transferencia: { label: "Transferencia",  className: "bg-blue-900/60 text-blue-300 border-blue-800" },
  cambio:        { label: "Cambio P2P",     className: "bg-purple-900/60 text-purple-300 border-purple-800" },
};

export function MovementsTable({
  data,
  allTransactions,
  accounts,
  filters,
  onFilters,
  onEdit,
  onDelete,
}: {
  data: Transaction[];
  allTransactions: Transaction[];
  accounts: Account[];
  filters: MovementFilters;
  onFilters: (f: MovementFilters) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const accountName = (id?: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const txDetail = (tx: Transaction) => {
    if (tx.type === "transferencia") return `${accountName(tx.sourceAccountId)} → ${accountName(tx.destinationAccountId)}`;
    if (tx.type === "cambio") return `${accountName(tx.sourceAccountId)} → ${accountName(tx.destinationAccountId)}`;
    return `${accountName(tx.accountId)}${tx.category ? ` · ${tx.category}` : ""}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{data.length} movimiento{data.length !== 1 ? "s" : ""}</p>
        <button onClick={() => setShowFilters((v) => !v)} className="text-sm text-indigo-400 active:text-indigo-300">
          {showFilters ? "Ocultar filtros" : "Filtrar"}
        </button>
      </div>

      {showFilters && (
        <Card className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={filters.fromDate ?? ""} onChange={(e) => onFilters({ ...filters, fromDate: e.target.value || undefined })} />
            <Input type="date" value={filters.toDate ?? ""} onChange={(e) => onFilters({ ...filters, toDate: e.target.value || undefined })} />
          </div>
          <Select value={filters.type ?? "todos"} onChange={(e) => onFilters({ ...filters, type: e.target.value as MovementFilters["type"] })}>
            <option value="todos">Todos los tipos</option>
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
            <option value="transferencia">Transferencia</option>
            <option value="cambio">Cambio P2P</option>
          </Select>
          <Select value={filters.accountId ?? "todas"} onChange={(e) => onFilters({ ...filters, accountId: e.target.value as MovementFilters["accountId"] })}>
            <option value="todas">Todas las cuentas</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
          <Select value={filters.category ?? "todas"} onChange={(e) => onFilters({ ...filters, category: e.target.value as MovementFilters["category"] })}>
            <option value="todas">Todas las categorías</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Card>
      )}

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
          Sin movimientos. Presiona + para agregar.
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((tx) => {
            const badge = TYPE_BADGE[tx.type] ?? TYPE_BADGE.gasto;
            const util = tx.type === "cambio" ? getCambioUtilization(tx, allTransactions) : null;

            return (
              <div key={tx.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                {/* Fila superior */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-slate-500">{tx.date}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => onEdit(tx)} className="text-xs text-indigo-400 active:opacity-70">Editar</button>
                    <button
                      onClick={() => { if (confirm("¿Eliminar?")) onDelete(tx.id); }}
                      className="text-xs text-rose-400 active:opacity-70"
                    >
                      Borrar
                    </button>
                  </div>
                </div>

                {/* Detalle + monto */}
                <div className="flex items-end justify-between">
                  <p className="text-sm text-slate-200 flex-1 pr-2">{txDetail(tx)}</p>
                  <div className="text-right flex-none">
                    <p className="text-sm font-semibold text-white">
                      {tx.amount.toLocaleString("es-VE", { maximumFractionDigits: 4 })} {tx.currency}
                    </p>
                    {tx.type !== "transferencia" && (
                      <p className="text-xs text-emerald-400">{tx.realUsd.toFixed(2)} USDT</p>
                    )}
                  </div>
                </div>

                {/* Cambio P2P — detalle + utilización */}
                {tx.type === "cambio" && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-xs bg-purple-950/30 rounded-lg px-2 py-1.5">
                      <span className="text-purple-300">
                        Recibido: {(tx.amountReceived ?? 0).toLocaleString("es-VE", { maximumFractionDigits: 0 })} Bs
                      </span>
                      <span className="text-slate-400">
                        Tasa: {tx.usedRate}
                        {tx.commission ? ` · Comisión: ${tx.commission} USDT` : ""}
                      </span>
                    </div>

                    {/* Barra de utilización */}
                    {util && util.bsRecibidos > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Gastado: {util.bsGastados.toLocaleString("es-VE", { maximumFractionDigits: 0 })} Bs ({util.pct.toFixed(0)}%)</span>
                          <span className={util.bsRestante > 0 ? "text-emerald-500" : "text-rose-400"}>
                            Restante: {util.bsRestante.toLocaleString("es-VE", { maximumFractionDigits: 0 })} Bs
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${util.pct >= 100 ? "bg-rose-500" : util.pct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${util.pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ahorro BCV para gastos en Bs */}
                {tx.currency === "Bs" && tx.bcvUsd !== undefined && (
                  <div className="mt-2 flex justify-between text-xs text-slate-600 bg-slate-800/50 rounded-lg px-2 py-1">
                    <span>Tasa: {tx.usedRate} · BCV: ${tx.bcvUsd.toFixed(2)}</span>
                    <span className={(tx.diffUsd ?? 0) >= 0 ? "text-emerald-600" : "text-rose-500"}>
                      Ahorro: ${(tx.diffUsd ?? 0).toFixed(2)}
                    </span>
                  </div>
                )}

                {tx.note && <p className="mt-1 text-xs text-slate-500 italic">{tx.note}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
