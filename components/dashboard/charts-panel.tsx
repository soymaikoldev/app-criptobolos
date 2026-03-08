"use client";

import { Card } from "@/components/ui/card";
import { Transaction, Account } from "@/types";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { monthLabel } from "@/lib/calculations";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#a855f7", "#06b6d4", "#ec4899", "#84cc16"];

export function ChartsPanel({ transactions, accounts }: { transactions: Transaction[]; accounts: Account[] }) {
  const expensesByCategory = Object.entries(
    transactions.filter((tx) => tx.type === "gasto").reduce<Record<string, number>>((acc, tx) => {
      const key = tx.category || "Otros";
      acc[key] = (acc[key] || 0) + tx.realUsd;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

  const expensesByAccount = Object.entries(
    transactions.filter((tx) => tx.type === "gasto").reduce<Record<string, number>>((acc, tx) => {
      const name = accounts.find((a) => a.id === tx.accountId)?.name || "Sin cuenta";
      acc[name] = (acc[name] || 0) + tx.realUsd;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, gasto: Number(value.toFixed(2)) }));

  const monthlyBalance = Object.entries(
    transactions.reduce<Record<string, { ingresos: number; gastos: number }>>((acc, tx) => {
      const key = tx.date.slice(0, 7);
      if (!acc[key]) acc[key] = { ingresos: 0, gastos: 0 };
      if (tx.type === "ingreso") acc[key].ingresos += tx.realUsd;
      if (tx.type === "gasto") acc[key].gastos += tx.realUsd;
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({ month: monthLabel(`${month}-01`), ...values }));

  const tooltipStyle = {
    contentStyle: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8" },
  };

  const axisStyle = { fill: "#64748b", fontSize: 11 };

  return (
    <div className="space-y-4">
      <Card className="h-[280px]">
        <p className="mb-2 text-sm font-medium text-slate-300">Gastos por categoría</p>
        {expensesByCategory.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height="88%">
            <PieChart>
              <Tooltip {...tooltipStyle} />
              <Pie data={expensesByCategory} dataKey="value" nameKey="name" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {expensesByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="h-[260px]">
        <p className="mb-2 text-sm font-medium text-slate-300">Gastos por cuenta</p>
        {expensesByAccount.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={expensesByAccount}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="gasto" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="h-[280px]">
        <p className="mb-2 text-sm font-medium text-slate-300">Ingresos vs gastos por mes</p>
        {monthlyBalance.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={monthlyBalance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Bar dataKey="ingresos" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[85%] items-center justify-center text-sm text-slate-600">
      Sin datos aún
    </div>
  );
}
