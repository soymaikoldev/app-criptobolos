"use client";

import { useMemo, useState } from "react";
import { Account, Currency, Rates, Transaction, TransactionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/constants";
import { enrichWithUsd } from "@/lib/calculations";

interface Props {
  accounts: Account[];
  rates: Rates;
  /** Tasa P2P del último cambio registrado — auto-fill para gastos en Bs */
  lastP2pRate?: number;
  editing?: Transaction | null;
  onSave: (tx: Transaction) => void;
  onCancelEdit: () => void;
}

export function MovementForm({ accounts, rates, lastP2pRate, editing, onSave, onCancelEdit }: Props) {
  const [type, setType] = useState<TransactionType>(editing?.type ?? "gasto");
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(editing?.accountId ?? accounts[0]?.id ?? "");
  const [sourceAccountId, setSourceAccountId] = useState(
    editing?.sourceAccountId ?? accounts.find((a) => a.type === "Exchange")?.id ?? accounts[0]?.id ?? "",
  );
  const [destinationAccountId, setDestinationAccountId] = useState(
    editing?.destinationAccountId ?? accounts.find((a) => a.type === "Banco")?.id ?? accounts[1]?.id ?? "",
  );
  const [category, setCategory] = useState(editing?.category ?? CATEGORIES[0]);
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [currency, setCurrency] = useState<Currency>(editing?.currency ?? "Bs");
  // Auto-fill: usa tasa del último cambio P2P > tasa predeterminada > tasa actual del form
  const defaultRate = editing?.usedRate ?? lastP2pRate ?? rates.p2p;
  const [usedRate, setUsedRate] = useState(String(defaultRate));
  const [commission, setCommission] = useState(
    editing?.commission ? String(editing.commission) : "",
  );
  const [note, setNote] = useState(editing?.note ?? "");
  const [error, setError] = useState("");

  const isCambio = type === "cambio";
  const isTransfer = type === "transferencia";

  // Cambio P2P: cálculo en tiempo real
  const cambioCalc = useMemo(() => {
    const usdt = Number(amount || 0);
    const comm = Number(commission || 0);
    const tasa = Number(usedRate || rates.p2p);
    const usdtEfectivo = usdt - comm; // USDT que realmente van al P2P
    const bsRecibidos = usdtEfectivo * tasa;
    const tasaEfectiva = usdt > 0 ? bsRecibidos / usdt : 0; // considerando comisión
    return { usdtEfectivo, bsRecibidos, tasaEfectiva };
  }, [amount, commission, usedRate, rates.p2p]);

  // Gasto: preview USD real vs BCV
  const gastoPreview = useMemo(() => {
    if (isCambio || isTransfer) return null;
    return enrichWithUsd(Number(amount || 0), currency, rates, Number(usedRate));
  }, [amount, currency, rates, usedRate, isCambio, isTransfer]);

  const submit = () => {
    const parsedAmount = Number(amount);
    if (!date || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Completa fecha y monto válido.");
      return;
    }

    // ── CAMBIO P2P ──
    if (isCambio) {
      if (!sourceAccountId || !destinationAccountId || sourceAccountId === destinationAccountId) {
        setError("Elige cuentas origen y destino distintas.");
        return;
      }
      const comm = Number(commission || 0);
      const tx: Transaction = {
        id: editing?.id ?? crypto.randomUUID(),
        createdAt: editing?.createdAt ?? new Date().toISOString(),
        date,
        type: "cambio",
        amount: parsedAmount,
        currency: "USDT",
        commission: comm > 0 ? comm : undefined,
        amountReceived: cambioCalc.bsRecibidos,
        usedRate: Number(usedRate),
        sourceAccountId,
        destinationAccountId,
        note,
        realUsd: parsedAmount, // USDT total enviados = USD real gastado
      };
      onSave(tx);
      setError("");
      if (!editing) { setAmount(""); setCommission(""); setNote(""); }
      return;
    }

    // ── TRANSFERENCIA ──
    if (isTransfer) {
      if (!sourceAccountId || !destinationAccountId || sourceAccountId === destinationAccountId) {
        setError("Elige cuentas distintas.");
        return;
      }
      const tx: Transaction = {
        id: editing?.id ?? crypto.randomUUID(),
        createdAt: editing?.createdAt ?? new Date().toISOString(),
        date, type: "transferencia",
        amount: parsedAmount, currency,
        sourceAccountId, destinationAccountId, note,
        realUsd: currency === "Bs" ? parsedAmount / rates.p2p : parsedAmount,
      };
      onSave(tx);
      setError("");
      if (!editing) { setAmount(""); setNote(""); }
      return;
    }

    // ── GASTO / INGRESO ──
    if (!accountId) { setError("Selecciona una cuenta."); return; }
    const usd = enrichWithUsd(parsedAmount, currency, rates, Number(usedRate));
    const tx: Transaction = {
      id: editing?.id ?? crypto.randomUUID(),
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      date, type,
      amount: parsedAmount, currency,
      note, category,
      accountId,
      usedRate: currency === "Bs" ? Number(usedRate) : undefined,
      realUsd: usd.realUsd,
      bcvUsd: usd.bcvUsd,
      diffUsd: usd.diffUsd,
    };
    onSave(tx);
    setError("");
    if (!editing) { setAmount(""); setNote(""); }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">
          {editing ? "Editar movimiento" : "Nuevo movimiento"}
        </h3>
        {editing && (
          <button onClick={onCancelEdit} className="text-sm text-slate-400">Cancelar</button>
        )}
      </div>

      <div className="space-y-3">
        {/* Tipo + Fecha */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
            <option value="cambio">Cambio P2P</option>
            <option value="transferencia">Transferencia</option>
          </Select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {/* ── CAMBIO P2P ── */}
        {isCambio && (
          <div className="rounded-xl border border-purple-800/40 bg-purple-950/20 p-4 space-y-3">
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Cambio P2P en Binance</p>

            <Select value={sourceAccountId} onChange={(e) => setSourceAccountId(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>Desde: {a.name}</option>)}
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">USDT total a cambiar</label>
                <Input type="number" placeholder="Ej: 16.51" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Comisión Binance (USDT)</label>
                <Input type="number" placeholder="Ej: 0.06" value={commission} onChange={(e) => setCommission(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tasa P2P de este cambio (Bs/$)</label>
              <Input type="number" placeholder={`Ej: ${rates.p2p}`} value={usedRate} onChange={(e) => setUsedRate(e.target.value)} />
            </div>

            {/* Preview en tiempo real */}
            {Number(amount) > 0 && (
              <div className="rounded-lg bg-slate-900 p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">USDT al P2P</span>
                  <span className="text-white font-medium">{cambioCalc.usdtEfectivo.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Bs que recibirás</span>
                  <span className="text-purple-300 font-bold text-base">
                    {cambioCalc.bsRecibidos.toLocaleString("es-VE", { maximumFractionDigits: 2 })} Bs
                  </span>
                </div>
                {Number(commission) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Tasa efectiva (c/comisión)</span>
                    <span className="text-slate-400 text-xs">{cambioCalc.tasaEfectiva.toFixed(2)} Bs/$</span>
                  </div>
                )}
              </div>
            )}

            <Select value={destinationAccountId} onChange={(e) => setDestinationAccountId(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>Hacia: {a.name}</option>)}
            </Select>
          </div>
        )}

        {/* ── TRANSFERENCIA ── */}
        {isTransfer && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                <option>USDT</option><option>USD</option><option>Bs</option>
              </Select>
            </div>
            <Select value={sourceAccountId} onChange={(e) => setSourceAccountId(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>Desde: {a.name}</option>)}
            </Select>
            <Select value={destinationAccountId} onChange={(e) => setDestinationAccountId(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>Hacia: {a.name}</option>)}
            </Select>
          </div>
        )}

        {/* ── GASTO / INGRESO ── */}
        {!isCambio && !isTransfer && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                <option>Bs</option><option>USDT</option><option>USD</option>
              </Select>
            </div>

            {/* Tasa P2P solo para gastos en Bs */}
            {currency === "Bs" && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Tasa P2P de este gasto (Bs/$)
                </label>
                <Input
                  type="number"
                  placeholder={`Tasa que usaste — Ej: ${rates.p2p}`}
                  value={usedRate}
                  onChange={(e) => setUsedRate(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>

            {/* Preview USD real */}
            {gastoPreview && Number(amount) > 0 && (
              <div className="rounded-lg bg-slate-800 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">USDT reales gastados</span>
                  <span className="font-bold text-white text-base">{gastoPreview.realUsd.toFixed(2)} USDT</span>
                </div>
                {currency === "Bs" && gastoPreview.bcvUsd !== undefined && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-xs">Equivalente a tasa BCV</span>
                      <span className="text-slate-400 text-xs">${gastoPreview.bcvUsd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-700 pt-1.5">
                      <span className="text-slate-400 text-xs">Ahorro usando P2P</span>
                      <span className={`font-semibold text-xs ${(gastoPreview.diffUsd ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        ${(gastoPreview.diffUsd ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        <Textarea rows={2} placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <Button className="w-full" onClick={submit}>
          {editing ? "Actualizar" : "Guardar movimiento"}
        </Button>
      </div>
    </div>
  );
}
