"use client";

import { useEffect, useState } from "react";
import { Account, AccountType, Currency, ExtraBalance } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function AccountForm({
  editing,
  onSave,
  onCancel,
}: {
  editing?: Account | null;
  onSave: (acc: Account) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Wallet");
  const [mainCurrency, setMainCurrency] = useState<Currency>("USDT");
  const [extras, setExtras] = useState<ExtraBalance[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newAmount, setNewAmount] = useState("");

  useEffect(() => {
    if (!editing) return;
    setName(editing.name);
    setType(editing.type);
    setMainCurrency(editing.mainCurrency);
    setExtras(editing.extraBalances ?? []);
  }, [editing]);

  const addExtra = () => {
    if (!newSymbol.trim()) return;
    const symbol = newSymbol.trim().toUpperCase();
    setExtras((prev) => {
      const exists = prev.findIndex((e) => e.symbol === symbol);
      if (exists >= 0) {
        return prev.map((e, i) => (i === exists ? { symbol, amount: Number(newAmount || 0) } : e));
      }
      return [...prev, { symbol, amount: Number(newAmount || 0) }];
    });
    setNewSymbol("");
    setNewAmount("");
  };

  const removeExtra = (symbol: string) => setExtras((prev) => prev.filter((e) => e.symbol !== symbol));

  const updateExtraAmount = (symbol: string, amount: string) => {
    setExtras((prev) => prev.map((e) => (e.symbol === symbol ? { ...e, amount: Number(amount || 0) } : e)));
  };

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: editing?.id ?? crypto.randomUUID(),
      name: name.trim(),
      type,
      mainCurrency,
      extraBalances: extras.length > 0 ? extras : undefined,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    });
    if (!editing) {
      setName("");
      setExtras([]);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white">{editing ? "Editar cuenta" : "Nueva cuenta"}</h3>

      <Input
        placeholder="Nombre (ej: Maik Principal, Binance, Banco Venezolano)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        <Select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          <option>Wallet</option>
          <option>Exchange</option>
          <option>Banco</option>
          <option>Tarjeta</option>
          <option>Efectivo</option>
        </Select>
        <Select value={mainCurrency} onChange={(e) => setMainCurrency(e.target.value as Currency)}>
          <option>USDT</option>
          <option>USD</option>
          <option>Bs</option>
        </Select>
      </div>

      {/* Otros tokens (SOL, SKR, etc.) */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Otros saldos (SOL, SKR, WSOL, USDc...)</p>

        {extras.map((e) => (
          <div key={e.symbol} className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-300 w-14 flex-none">{e.symbol}</span>
            <Input
              type="number"
              value={String(e.amount)}
              onChange={(ev) => updateExtraAmount(e.symbol, ev.target.value)}
              className="flex-1"
            />
            <button
              onClick={() => removeExtra(e.symbol)}
              className="text-rose-400 text-xs px-2 active:opacity-70"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="flex gap-2">
          <Input
            placeholder="Token (ej: SOL)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            className="w-24 flex-none"
          />
          <Input
            type="number"
            placeholder="Cantidad"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="flex-1"
          />
          <button
            onClick={addExtra}
            className="text-sm text-indigo-400 px-3 border border-slate-700 rounded-lg active:opacity-70"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={save}>
          {editing ? "Actualizar" : "Crear cuenta"}
        </Button>
        {editing && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
      </div>
    </div>
  );
}
