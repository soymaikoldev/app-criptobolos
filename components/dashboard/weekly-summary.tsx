"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/types";

const STORAGE_KEY = "weeklySummaryDismissed";

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function WeeklySummary({ transactions }: { transactions: Transaction[] }) {
  const [visible, setVisible] = useState(false);
  const [lastWeek, setLastWeek] = useState(0);
  const [prevWeek, setPrevWeek] = useState(0);

  useEffect(() => {
    const currentWeek = getISOWeek(new Date());
    if (localStorage.getItem(STORAGE_KEY) === currentWeek) return;

    const now = new Date();
    const offset = (days: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d.toISOString().slice(0, 10);
    };

    const last7Start = offset(7);
    const prev7Start = offset(14);
    const today = now.toISOString().slice(0, 10);

    const gastos = transactions.filter((tx) => tx.type === "gasto");
    const lastTotal = gastos
      .filter((tx) => tx.date >= last7Start && tx.date < today)
      .reduce((s, tx) => s + tx.realUsd, 0);
    const prevTotal = gastos
      .filter((tx) => tx.date >= prev7Start && tx.date < last7Start)
      .reduce((s, tx) => s + tx.realUsd, 0);

    if (lastTotal > 0 || prevTotal > 0) {
      setLastWeek(lastTotal);
      setPrevWeek(prevTotal);
      setVisible(true);
    }
  }, [transactions]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, getISOWeek(new Date()));
    setVisible(false);
  };

  if (!visible) return null;

  const diff = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek) * 100 : null;
  const better = diff !== null && diff <= 0;

  return (
    <div className="rounded-xl border border-indigo-800/40 bg-indigo-950/30 p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">
          Resumen semanal
        </p>
        <button onClick={dismiss} className="text-slate-500 text-sm active:opacity-70 leading-none">
          ✕
        </button>
      </div>

      <p className="text-3xl font-bold text-white">
        {lastWeek.toFixed(2)}
        <span className="text-base text-slate-400 ml-2">USDT</span>
      </p>
      <p className="text-sm text-slate-400 mt-0.5">gastados en los últimos 7 días</p>

      {diff !== null && (
        <p className={`text-sm font-medium mt-3 ${better ? "text-emerald-400" : "text-rose-400"}`}>
          {better ? "▼" : "▲"} {Math.abs(diff).toFixed(0)}% vs semana anterior
          <span className="text-slate-500 font-normal ml-1">
            ({prevWeek.toFixed(2)} USDT)
          </span>
        </p>
      )}
    </div>
  );
}
