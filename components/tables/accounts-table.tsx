"use client";

import { Account } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AccountsTable({ accounts, onEdit, onDelete }: { accounts: Account[]; onEdit: (a: Account) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <h3 className="mb-3 font-semibold">Cuentas</h3>
      {accounts.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-slate-500">No hay cuentas activas.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left"><tr><th className="p-2">Nombre</th><th className="p-2">Tipo</th><th className="p-2">Moneda principal</th><th className="p-2">Acciones</th></tr></thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} className="border-t">
                  <td className="p-2">{acc.name}</td><td className="p-2">{acc.type}</td><td className="p-2">{acc.mainCurrency}</td>
                  <td className="p-2"><div className="flex gap-2"><Button variant="outline" onClick={() => onEdit(acc)}>Editar</Button><Button variant="danger" onClick={() => onDelete(acc.id)}>Eliminar</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
