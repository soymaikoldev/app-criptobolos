"use client";

import { Account, MovementFilters, Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";

export function MovementsTable({
  data,
  accounts,
  filters,
  onFilters,
  onEdit,
  onDelete,
}: {
  data: Transaction[];
  accounts: Account[];
  filters: MovementFilters;
  onFilters: (f: MovementFilters) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const accountName = (id?: string) => accounts.find((a) => a.id === id)?.name ?? "-";

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Historial</h3>
      <div className="mb-3 grid gap-2 md:grid-cols-5">
        <Input type="date" value={filters.fromDate ?? ""} onChange={(e) => onFilters({ ...filters, fromDate: e.target.value || undefined })} />
        <Input type="date" value={filters.toDate ?? ""} onChange={(e) => onFilters({ ...filters, toDate: e.target.value || undefined })} />
        <Select value={filters.type ?? "todos"} onChange={(e) => onFilters({ ...filters, type: e.target.value as MovementFilters["type"] })}>
          <option value="todos">Todos los tipos</option><option value="gasto">Gasto</option><option value="ingreso">Ingreso</option><option value="transferencia">Transferencia</option>
        </Select>
        <Select value={filters.accountId ?? "todas"} onChange={(e) => onFilters({ ...filters, accountId: e.target.value as MovementFilters["accountId"] })}>
          <option value="todas">Todas las cuentas</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </Select>
        <Select value={filters.category ?? "todas"} onChange={(e) => onFilters({ ...filters, category: e.target.value as MovementFilters["category"] })}>
          <option value="todas">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
      </div>

      {data.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-slate-500">Sin movimientos aún. Carga tu primer registro arriba.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr><th className="p-2">Fecha</th><th className="p-2">Tipo</th><th className="p-2">Detalle</th><th className="p-2">Monto</th><th className="p-2">USD real</th><th className="p-2">Nota</th><th className="p-2">Acciones</th></tr>
            </thead>
            <tbody>
              {data.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="p-2">{tx.date}</td>
                  <td className="p-2 capitalize">{tx.type}</td>
                  <td className="p-2">{tx.type === "transferencia" ? `${accountName(tx.sourceAccountId)} → ${accountName(tx.destinationAccountId)}` : `${accountName(tx.accountId)} / ${tx.category}`}</td>
                  <td className="p-2">{tx.amount} {tx.currency}</td>
                  <td className="p-2">${tx.realUsd.toFixed(2)}</td>
                  <td className="p-2">{tx.note || "-"}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onEdit(tx)}>Editar</Button>
                      <Button variant="danger" onClick={() => onDelete(tx.id)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
