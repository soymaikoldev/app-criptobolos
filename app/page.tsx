"use client";

import { useEffect, useMemo, useState } from "react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { MovementForm } from "@/components/forms/movement-form";
import { AccountForm } from "@/components/forms/account-form";
import { RatesForm } from "@/components/forms/rates-form";
import { AccountsTable } from "@/components/tables/accounts-table";
import { MovementsTable } from "@/components/tables/movements-table";
import { Button } from "@/components/ui/button";
import { exportTransactionsCsv } from "@/lib/export";
import { monthlySummary } from "@/lib/calculations";
import { storage } from "@/lib/storage";
import { Account, MovementFilters, Rates, Transaction } from "@/types";

export default function HomePage() {
  const [tab, setTab] = useState<"movimientos" | "dashboard" | "cuentas" | "config">("movimientos");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rates, setRates] = useState<Rates>({ bcv: 42, p2p: 62 });
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filters, setFilters] = useState<MovementFilters>({ type: "todos", accountId: "todas", category: "todas" });

  useEffect(() => {
    setAccounts(storage.getAccounts());
    setTransactions(storage.getTransactions());
    setRates(storage.getRates());
  }, []);

  useEffect(() => storage.saveAccounts(accounts), [accounts]);
  useEffect(() => storage.saveTransactions(transactions), [transactions]);
  useEffect(() => storage.saveRates(rates), [rates]);

  const filteredTransactions = useMemo(() => transactions.filter((tx) => {
    if (filters.fromDate && tx.date < filters.fromDate) return false;
    if (filters.toDate && tx.date > filters.toDate) return false;
    if (filters.type && filters.type !== "todos" && tx.type !== filters.type) return false;

    const related = tx.accountId ?? tx.sourceAccountId ?? tx.destinationAccountId;
    if (filters.accountId && filters.accountId !== "todas" && related !== filters.accountId && tx.sourceAccountId !== filters.accountId && tx.destinationAccountId !== filters.accountId) return false;

    if (filters.category && filters.category !== "todas" && tx.category !== filters.category) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date)), [transactions, filters]);

  const summary = useMemo(() => monthlySummary(transactions, selectedMonth), [transactions, selectedMonth]);

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Crypto Life Tracker</h1>
          <p className="text-sm text-slate-600">Controla tu gasto real en USD según la tasa real que usaste.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportTransactionsCsv(filteredTransactions, accounts)}>Exportar CSV</Button>
          <Button variant="danger" onClick={() => {
            if (!confirm("¿Seguro que quieres limpiar datos de prueba?")) return;
            storage.resetDemo();
            setAccounts(storage.getAccounts());
            setTransactions([]);
            setRates(storage.getRates());
          }}>Limpiar datos</Button>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["movimientos", "dashboard", "cuentas", "config"] as const).map((name) => (
          <Button key={name} variant={tab === name ? "default" : "outline"} onClick={() => setTab(name)} className="capitalize">{name}</Button>
        ))}
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm" />
      </div>

      <section className="space-y-4">
        <SummaryCards gasto={summary.totalGasto} ingreso={summary.totalIngreso} promedio={summary.promedioDiario} ahorro={summary.ahorroVsBCV} />

        {tab === "movimientos" && (
          <>
            <MovementForm
              accounts={accounts}
              rates={rates}
              editing={editingTx}
              onCancelEdit={() => setEditingTx(null)}
              onSave={(tx) => {
                setTransactions((prev) => {
                  const found = prev.some((p) => p.id === tx.id);
                  return found ? prev.map((p) => (p.id === tx.id ? tx : p)) : [tx, ...prev];
                });
                setEditingTx(null);
              }}
            />
            <MovementsTable
              data={filteredTransactions}
              accounts={accounts}
              filters={filters}
              onFilters={setFilters}
              onEdit={setEditingTx}
              onDelete={(id) => {
                if (!confirm("¿Eliminar movimiento?")) return;
                setTransactions((prev) => prev.filter((tx) => tx.id !== id));
              }}
            />
          </>
        )}

        {tab === "dashboard" && <ChartsPanel transactions={filteredTransactions} accounts={accounts} />}

        {tab === "cuentas" && (
          <>
            <AccountForm
              editing={editingAccount}
              onCancel={() => setEditingAccount(null)}
              onSave={(acc) => {
                setAccounts((prev) => {
                  const found = prev.some((p) => p.id === acc.id);
                  return found ? prev.map((p) => (p.id === acc.id ? acc : p)) : [...prev, acc];
                });
                setEditingAccount(null);
              }}
            />
            <AccountsTable
              accounts={accounts}
              onEdit={setEditingAccount}
              onDelete={(id) => {
                if (!confirm("¿Eliminar cuenta?")) return;
                setAccounts((prev) => prev.filter((acc) => acc.id !== id));
              }}
            />
          </>
        )}

        {tab === "config" && <RatesForm rates={rates} onSave={setRates} />}
      </section>
    </main>
  );
}
