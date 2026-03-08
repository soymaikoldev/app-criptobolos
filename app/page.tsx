"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ChartsPanel } from "@/components/dashboard/charts-panel";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { MovementForm } from "@/components/forms/movement-form";
import { AccountForm } from "@/components/forms/account-form";
import { RatesForm } from "@/components/forms/rates-form";
import { AccountsTable } from "@/components/tables/accounts-table";
import { MovementsTable } from "@/components/tables/movements-table";
import { BackupRestore } from "@/components/config/backup-restore";
import { RateHistory } from "@/components/config/rate-history";
import { BudgetGoals } from "@/components/config/budget-goals";
import { WelcomeBanner } from "@/components/onboarding/welcome";
import { Button } from "@/components/ui/button";
import { exportTransactionsCsv } from "@/lib/export";
import { budgetProgress, calculateAccountBalance, monthlySummary } from "@/lib/calculations";
import { fetchBCVRate } from "@/lib/bcv";
import { storage } from "@/lib/storage";
import { Account, CategoryBudget, MovementFilters, RateRecord, Rates, Transaction } from "@/types";

type Tab = "inicio" | "historial" | "cuentas" | "config";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("inicio");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rates, setRates] = useState<Rates>({ bcv: 90, p2p: 620 });
  const [rateHistory, setRateHistory] = useState<RateRecord[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filters, setFilters] = useState<MovementFilters>({ type: "todos", accountId: "todas", category: "todas" });
  const [bcvFetching, setBcvFetching] = useState(false);
  const [bcvError, setBcvError] = useState("");
  const initialized = useRef(false);

  // Cargar datos (solo una vez al montar)
  useEffect(() => {
    setAccounts(storage.getAccounts());
    setTransactions(storage.getTransactions());
    setRates(storage.getRates());
    setRateHistory(storage.getRateHistory());
    setBudgets(storage.getBudgets());
    initialized.current = true;
  }, []);

  // Guardar automáticamente (solo después de la carga inicial)
  useEffect(() => { if (initialized.current) storage.saveAccounts(accounts); }, [accounts]);
  useEffect(() => { if (initialized.current) storage.saveTransactions(transactions); }, [transactions]);
  useEffect(() => { if (initialized.current) storage.saveRates(rates); }, [rates]);
  useEffect(() => { if (initialized.current) storage.saveRateHistory(rateHistory); }, [rateHistory]);
  useEffect(() => { if (initialized.current) storage.saveBudgets(budgets); }, [budgets]);

  // Auto-fetch BCV
  const refreshBCV = useCallback(async () => {
    setBcvFetching(true);
    setBcvError("");
    const result = await fetchBCVRate();
    if (result) {
      setRates((prev) => ({ ...prev, bcv: result.rate, bcvUpdatedAt: result.updatedAt }));
    } else {
      setBcvError("No se pudo obtener la tasa BCV");
    }
    setBcvFetching(false);
  }, []);

  useEffect(() => {
    const isStale = !rates.bcvUpdatedAt || Date.now() - new Date(rates.bcvUpdatedAt).getTime() > 3_600_000;
    if (isStale) refreshBCV();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar historial cuando cambian las tasas manualmente
  const handleSaveRates = (newRates: Rates) => {
    setRates(newRates);
    const today = new Date().toISOString().slice(0, 10);
    setRateHistory((prev) => {
      const withoutToday = prev.filter((r) => r.date !== today);
      return [{ date: today, bcv: newRates.bcv, p2p: newRates.p2p }, ...withoutToday].slice(0, 60);
    });
    // Guarda última tasa P2P
    storage.saveLastP2pRate(newRates.p2p);
  };

  // Tasa P2P del último cambio registrado (auto-fill)
  const lastP2pRate = useMemo(() => {
    const lastCambio = transactions
      .filter((tx) => tx.type === "cambio" && tx.usedRate)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    return lastCambio?.usedRate ?? storage.getLastP2pRate() ?? rates.p2p;
  }, [transactions, rates.p2p]);

  const filteredTransactions = useMemo(
    () =>
      transactions
        .filter((tx) => {
          if (filters.fromDate && tx.date < filters.fromDate) return false;
          if (filters.toDate && tx.date > filters.toDate) return false;
          if (filters.type && filters.type !== "todos" && tx.type !== filters.type) return false;
          if (filters.accountId && filters.accountId !== "todas") {
            const match =
              tx.accountId === filters.accountId ||
              tx.sourceAccountId === filters.accountId ||
              tx.destinationAccountId === filters.accountId;
            if (!match) return false;
          }
          if (filters.category && filters.category !== "todas" && tx.category !== filters.category) return false;
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, filters],
  );

  const summary = useMemo(() => monthlySummary(transactions, selectedMonth), [transactions, selectedMonth]);
  const accountBalances = useMemo(
    () => accounts.map((acc) => calculateAccountBalance(acc, transactions, rates)),
    [accounts, transactions, rates],
  );
  const budgetProgressData = useMemo(
    () => budgetProgress(budgets, transactions, selectedMonth),
    [budgets, transactions, selectedMonth],
  );

  const isFirstTime = transactions.length === 0;

  const openEdit = (tx: Transaction) => { setEditingTx(tx); setShowForm(true); };
  const closeForm = () => { setEditingTx(null); setShowForm(false); };

  const saveTx = (tx: Transaction) => {
    setTransactions((prev) => {
      const found = prev.some((p) => p.id === tx.id);
      return found ? prev.map((p) => (p.id === tx.id ? tx : p)) : [tx, ...prev];
    });
    // Guardar última tasa P2P cuando se hace un cambio
    if (tx.type === "cambio" && tx.usedRate) {
      storage.saveLastP2pRate(tx.usedRate);
    }
    closeForm();
  };

  const bcvLabel = bcvFetching ? "BCV: ..." : bcvError ? `BCV: ${rates.bcv} ⚠` : `BCV: ${rates.bcv}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Crypto Life Tracker</h1>
            <button onClick={refreshBCV} className="text-xs text-slate-500 active:text-indigo-400 transition-colors">
              {bcvLabel} · P2P: {rates.p2p}
            </button>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-9 rounded-lg border border-slate-700 bg-slate-800 px-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <SummaryCards
          totalUsdt={summary.totalUsdt}
          totalBcv={summary.totalBcv}
          totalIngreso={summary.totalIngreso}
          promedioDiario={summary.promedioDiario}
          ahorroVsBCV={summary.ahorroVsBCV}
          totalCambiado={summary.totalCambiado}
          projection={summary.projection}
          isCurrentMonth={summary.isCurrentMonth}
          totalDaysInMonth={summary.totalDaysInMonth}
          balances={accountBalances}
          showBalances={tab === "inicio"}
          budgetProgress={tab === "inicio" ? budgetProgressData : []}
        />

        {/* Onboarding */}
        {tab === "inicio" && isFirstTime && (
          <WelcomeBanner onNavigate={setTab} />
        )}

        {tab === "inicio" && !isFirstTime && (
          <>
            <WeeklySummary transactions={transactions} />
            <ChartsPanel transactions={filteredTransactions} accounts={accounts} />
          </>
        )}

        {tab === "historial" && (
          <MovementsTable
            data={filteredTransactions}
            allTransactions={transactions}
            accounts={accounts}
            filters={filters}
            onFilters={setFilters}
            onEdit={openEdit}
            onDelete={(id) => setTransactions((prev) => prev.filter((tx) => tx.id !== id))}
          />
        )}

        {tab === "cuentas" && (
          <div className="space-y-3">
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
              balances={accountBalances}
              onEdit={setEditingAccount}
              onDelete={(id) => setAccounts((prev) => prev.filter((acc) => acc.id !== id))}
              onReorder={setAccounts}
            />
          </div>
        )}

        {tab === "config" && (
          <div className="space-y-3">
            <RatesForm
              rates={rates}
              onSave={handleSaveRates}
              onRefreshBCV={refreshBCV}
              bcvFetching={bcvFetching}
            />
            <BudgetGoals
              budgets={budgets}
              progress={budgetProgressData}
              currentMonth={selectedMonth}
              onSave={(b) => setBudgets((prev) => [...prev.filter((x) => x.id !== b.id), b])}
              onDelete={(id) => setBudgets((prev) => prev.filter((b) => b.id !== id))}
            />
            <RateHistory history={rateHistory} />
            <BackupRestore onImport={() => {}} />
            <div className="rounded-xl border border-rose-900/50 bg-slate-900 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">Zona de peligro</h3>
              <Button variant="outline" className="w-full" onClick={() => exportTransactionsCsv(filteredTransactions, accounts)}>
                Exportar CSV
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  if (!confirm("¿Seguro? Se restaurarán los datos iniciales.")) return;
                  storage.resetDemo();
                  setAccounts(storage.getAccounts());
                  setTransactions(storage.getTransactions());
                  setRates(storage.getRates());
                  setRateHistory(storage.getRateHistory());
                  setBudgets(storage.getBudgets());
                }}
              >
                Limpiar todos los datos
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-[76px] right-4 z-40 h-14 w-14 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-950/60 flex items-center justify-center text-3xl font-light active:scale-95 transition-transform"
          aria-label="Nuevo movimiento"
        >
          +
        </button>
      )}

      {/* Bottom Sheet */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/75" onClick={closeForm}>
          <div
            className="w-full max-w-lg mx-auto rounded-t-2xl bg-slate-900 border-t border-slate-700 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mt-3 mb-2" />
            <div className="px-4 pb-8">
              <MovementForm
                accounts={accounts}
                rates={rates}
                lastP2pRate={lastP2pRate}
                editing={editingTx}
                onCancelEdit={closeForm}
                onSave={saveTx}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 safe-pb">
        <div className="flex justify-around max-w-lg mx-auto py-2">
          {([
            { id: "inicio" as Tab, label: "Inicio", Icon: HomeIcon },
            { id: "historial" as Tab, label: "Historial", Icon: ListIcon },
            { id: "cuentas" as Tab, label: "Cuentas", Icon: WalletIcon },
            { id: "config" as Tab, label: "Config", Icon: GearIcon },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 px-5 py-1 rounded-lg transition-colors ${tab === id ? "text-indigo-400" : "text-slate-500"}`}
            >
              <Icon active={tab === id} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "#818cf8" : "#64748b";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#818cf8" : "none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function ListIcon({ active }: { active: boolean }) {
  const c = active ? "#818cf8" : "#64748b";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}
function WalletIcon({ active }: { active: boolean }) {
  const c = active ? "#818cf8" : "#64748b";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></svg>;
}
function GearIcon({ active }: { active: boolean }) {
  const c = active ? "#818cf8" : "#64748b";
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
}
