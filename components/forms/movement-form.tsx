"use client";

import { useEffect, useMemo, useState } from "react";
import { Account, Currency, Rates, Transaction, TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { enrichWithUsd } from "@/lib/calculations";

interface Props {
  accounts: Account[];
  rates: Rates;
  editing?: Transaction | null;
  onSave: (tx: Transaction) => void;
  onCancelEdit: () => void;
}

export function MovementForm({ accounts, rates, editing, onSave, onCancelEdit }: Props) {
  const [type, setType] = useState<TransactionType>(editing?.type ?? "gasto");
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(editing?.accountId ?? accounts[0]?.id ?? "");
  const [sourceAccountId, setSourceAccountId] = useState(editing?.sourceAccountId ?? accounts[0]?.id ?? "");
  const [destinationAccountId, setDestinationAccountId] = useState(editing?.destinationAccountId ?? accounts[1]?.id ?? "");
  const [category, setCategory] = useState(editing?.category ?? CATEGORIES[0]);
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [currency, setCurrency] = useState<Currency>(editing?.currency ?? "Bs");
  const [usedRate, setUsedRate] = useState(editing?.usedRate ? String(editing.usedRate) : String(rates.p2p));
  const [note, setNote] = useState(editing?.note ?? "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editing) {
      setType(editing.type);
      setDate(editing.date);
      setAccountId(editing.accountId ?? accounts[0]?.id ?? "");
      setSourceAccountId(editing.sourceAccountId ?? accounts[0]?.id ?? "");
      setDestinationAccountId(editing.destinationAccountId ?? accounts[1]?.id ?? "");
      setCategory(editing.category ?? CATEGORIES[0]);
      setAmount(String(editing.amount));
      setCurrency(editing.currency);
      setUsedRate(String(editing.usedRate ?? rates.p2p));
      setNote(editing.note ?? "");
      setMessage("");
      return;
    }

    setType("gasto");
    setDate(new Date().toISOString().slice(0, 10));
    setAccountId(accounts[0]?.id ?? "");
    setSourceAccountId(accounts[0]?.id ?? "");
    setDestinationAccountId(accounts[1]?.id ?? accounts[0]?.id ?? "");
    setCategory(CATEGORIES[0]);
    setAmount("");
    setCurrency("Bs");
    setUsedRate(String(rates.p2p));
    setNote("");
    setMessage("");
  }, [editing, accounts, rates.p2p]);

  const preview = useMemo(() => {
    const parsed = Number(amount || 0);
    return enrichWithUsd(parsed, currency, rates, Number(usedRate));
  }, [amount, currency, rates, usedRate]);

  const submit = () => {
    const parsedAmount = Number(amount);
    if (!date || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessage("Completa fecha y monto válido.");
      return;
    }
    if ((type === "gasto" || type === "ingreso") && !accountId) {
      setMessage("Selecciona una cuenta.");
      return;
    }
    if (type === "transferencia" && (!sourceAccountId || !destinationAccountId || sourceAccountId === destinationAccountId)) {
      setMessage("Elige cuentas origen/destino distintas.");
      return;
    }

    const usd = enrichWithUsd(parsedAmount, currency, rates, Number(usedRate));
    const tx: Transaction = {
      id: editing?.id ?? crypto.randomUUID(),
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      date,
      type,
      amount: parsedAmount,
      currency,
      note,
      category: type === "transferencia" ? undefined : category,
      accountId: type === "transferencia" ? undefined : accountId,
      sourceAccountId: type === "transferencia" ? sourceAccountId : undefined,
      destinationAccountId: type === "transferencia" ? destinationAccountId : undefined,
      usedRate: currency === "Bs" ? Number(usedRate) : undefined,
      realUsd: usd.realUsd,
      bcvUsd: usd.bcvUsd,
      diffUsd: usd.diffUsd,
    };

    onSave(tx);
    setMessage(editing ? "Movimiento actualizado." : "Movimiento guardado.");
    if (!editing) {
      setAmount("");
      setNote("");
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{editing ? "Editar movimiento" : "Nuevo movimiento"}</h3>
        {editing && <Button variant="outline" onClick={onCancelEdit}>Cancelar edición</Button>}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
          <option value="gasto">Gasto</option><option value="ingreso">Ingreso</option><option value="transferencia">Transferencia</option>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input type="number" placeholder="Monto ej: 420" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
          <option>Bs</option><option>USD</option><option>USDT</option>
        </Select>
        {currency === "Bs" && (
          <Input type="number" placeholder="Tasa usada ej: 62" value={usedRate} onChange={(e) => setUsedRate(e.target.value)} />
        )}
        {type !== "transferencia" && (
          <>
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>{accounts.map((a) => <option value={a.id} key={a.id}>{a.name}</option>)}</Select>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
          </>
        )}
        {type === "transferencia" && (
          <>
            <Select value={sourceAccountId} onChange={(e) => setSourceAccountId(e.target.value)}>{accounts.map((a) => <option value={a.id} key={a.id}>Origen: {a.name}</option>)}</Select>
            <Select value={destinationAccountId} onChange={(e) => setDestinationAccountId(e.target.value)}>{accounts.map((a) => <option value={a.id} key={a.id}>Destino: {a.name}</option>)}</Select>
          </>
        )}
        <Textarea className="md:col-span-3" rows={2} placeholder="Nota corta (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="mt-3 text-sm text-slate-600">
        USD real: <b>${preview.realUsd.toFixed(2)}</b>
        {currency === "Bs" && <> · USD BCV: <b>${(preview.bcvUsd ?? 0).toFixed(2)}</b> · Diferencia: <b>${(preview.diffUsd ?? 0).toFixed(2)}</b></>}
      </div>
      {message && <p className="mt-2 text-sm text-blue-700">{message}</p>}
      <Button className="mt-3" onClick={submit}>{editing ? "Actualizar" : "Guardar"}</Button>
    </Card>
  );
}
