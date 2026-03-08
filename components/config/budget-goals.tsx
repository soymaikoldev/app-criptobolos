"use client";

import { useState } from "react";
import { CategoryBudget } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BudgetWithProgress extends CategoryBudget {
  spent: number;
  pct: number;
}

export function BudgetGoals({
  budgets,
  progress,
  currentMonth,
  onSave,
  onDelete,
}: {
  budgets: CategoryBudget[];
  progress: BudgetWithProgress[];
  currentMonth: string;
  onSave: (b: CategoryBudget) => void;
  onDelete: (id: string) => void;
}) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState("");

  const add = () => {
    if (!limit || Number(limit) <= 0) return;
    onSave({
      id: crypto.randomUUID(),
      category,
      limitUsdt: Number(limit),
      month: currentMonth,
    });
    setLimit("");
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Metas del mes</h3>
        <p className="text-xs text-slate-500 mt-0.5">Límites de gasto en USDT por categoría</p>
      </div>

      {/* Lista de metas con progreso */}
      {progress.length > 0 && (
        <div className="space-y-3">
          {progress.map((b) => (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300">{b.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {b.spent.toFixed(2)} / {b.limitUsdt} USDT
                  </span>
                  <button onClick={() => onDelete(b.id)} className="text-xs text-slate-600 active:text-rose-400">✕</button>
                </div>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    b.pct >= 100 ? "bg-rose-500" : b.pct >= 80 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              {b.pct >= 80 && (
                <p className={`text-xs mt-0.5 ${b.pct >= 100 ? "text-rose-400" : "text-amber-400"}`}>
                  {b.pct >= 100 ? "Meta superada" : `${(100 - b.pct).toFixed(0)}% restante`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Agregar nueva meta */}
      <div className="border-t border-slate-800 pt-3 space-y-2">
        <p className="text-xs text-slate-500">Agregar meta</p>
        <div className="grid grid-cols-2 gap-2">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input
            type="number"
            placeholder="Límite USDT"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full" onClick={add}>
          Agregar meta
        </Button>
      </div>
    </div>
  );
}
