"use client";

import { Card } from "@/components/ui/card";
import { Transaction, Account } from "@/types";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthLabel } from "@/lib/calculations";

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

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="h-[320px]">
        <p className="mb-2 font-medium">Gastos por categoría</p>
        {expensesByCategory.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Tooltip />
              <Pie data={expensesByCategory} dataKey="value" nameKey="name" outerRadius={100} fill="#2563eb" label />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>
      <Card className="h-[320px]">
        <p className="mb-2 font-medium">Gastos por cuenta</p>
        {expensesByAccount.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={expensesByAccount}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="gasto" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
      <Card className="h-[340px] lg:col-span-2">
        <p className="mb-2 font-medium">Ingresos vs gastos por mes</p>
        {monthlyBalance.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={monthlyBalance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#2563eb" />
              <Bar dataKey="gastos" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-[85%] items-center justify-center text-sm text-slate-500">Aún no hay datos para mostrar.</div>;
}
