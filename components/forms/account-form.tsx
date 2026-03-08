"use client";

import { useEffect, useState } from "react";
import { Account, AccountType, Currency } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function AccountForm({ editing, onSave, onCancel }: { editing?: Account | null; onSave: (acc: Account) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Wallet");
  const [mainCurrency, setMainCurrency] = useState<Currency>("USDT");

  useEffect(() => {
    if (!editing) return;
    setName(editing.name);
    setType(editing.type);
    setMainCurrency(editing.mainCurrency);
  }, [editing]);

  return (
    <Card>
      <h3 className="mb-3 font-semibold">{editing ? "Editar cuenta" : "Crear cuenta"}</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <Input placeholder="Nombre de cuenta" value={name} onChange={(e) => setName(e.target.value)} />
        <Select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          <option>Wallet</option><option>Exchange</option><option>Banco</option><option>Efectivo</option>
        </Select>
        <Select value={mainCurrency} onChange={(e) => setMainCurrency(e.target.value as Currency)}>
          <option>Bs</option><option>USD</option><option>USDT</option>
        </Select>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => {
          if (!name.trim()) return;
          onSave({ id: editing?.id ?? crypto.randomUUID(), name: name.trim(), type, mainCurrency, createdAt: editing?.createdAt ?? new Date().toISOString() });
          if (!editing) setName("");
        }}>{editing ? "Actualizar" : "Crear"}</Button>
        {editing && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
      </div>
    </Card>
  );
}
