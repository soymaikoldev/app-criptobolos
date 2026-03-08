"use client";

import { useRef, useState } from "react";
import { Account, AccountBalance } from "@/types";

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
  onReorder,
}: {
  accounts: Account[];
  balances?: AccountBalance[];
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
  onReorder: (accounts: Account[]) => void;
}) {
  const dragIdx = useRef<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function commit(from: number, to: number) {
    if (from === to) return;
    const next = [...accounts];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
  }

  // ── HTML5 drag (desktop) ──
  function onDragStart(idx: number) {
    dragIdx.current = idx;
    setDragging(idx);
  }
  function onDragEnter(idx: number) {
    setOverIdx(idx);
  }
  function onDragEnd() {
    if (dragIdx.current !== null && overIdx !== null) commit(dragIdx.current, overIdx);
    dragIdx.current = null;
    setDragging(null);
    setOverIdx(null);
  }

  // ── Touch drag (iOS) ──
  function onTouchStart(e: React.TouchEvent, idx: number) {
    dragIdx.current = idx;
    setDragging(idx);
  }
  function onTouchMove(e: React.TouchEvent) {
    if (dragIdx.current === null || !containerRef.current) return;
    const y = e.touches[0].clientY;
    const children = Array.from(containerRef.current.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        setOverIdx(i);
        break;
      }
    }
  }
  function onTouchEnd() {
    if (dragIdx.current !== null && overIdx !== null) commit(dragIdx.current, overIdx);
    dragIdx.current = null;
    setDragging(null);
    setOverIdx(null);
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
        No hay cuentas. Crea la primera arriba.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {accounts.map((acc, idx) => {
        const bal = balances?.find((b) => b.account.id === acc.id);
        const isDragging = dragging === idx;
        const isOver = overIdx === idx && dragging !== idx;

        return (
          <div
            key={acc.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragEnter={() => onDragEnter(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={onDragEnd}
            onTouchStart={(e) => onTouchStart(e, idx)}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`rounded-xl border bg-slate-900 p-3 transition-all select-none ${
              isDragging ? "opacity-40 scale-[0.98] border-indigo-600" : ""
            } ${isOver ? "border-indigo-500 bg-indigo-950/40" : "border-slate-800"}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Drag handle */}
                <span className="text-slate-600 text-lg cursor-grab active:cursor-grabbing touch-none">
                  ⠿
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[acc.type] ?? ""}`}>
                  {acc.type}
                </span>
                <p className="text-sm font-semibold text-white">{acc.name}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onEdit(acc)} className="text-xs text-indigo-400 active:opacity-70">
                  Editar
                </button>
                <button
                  onClick={() => { if (confirm("¿Eliminar cuenta?")) onDelete(acc.id); }}
                  className="text-xs text-rose-400 active:opacity-70"
                >
                  Borrar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
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
