import { Card } from "@/components/ui/card";
import { AccountBalance, CategoryBudget } from "@/types";

interface BudgetWithProgress extends CategoryBudget {
  spent: number;
  pct: number;
}

export function SummaryCards({
  totalUsdt,
  totalBcv,
  totalIngreso,
  promedioDiario,
  ahorroVsBCV,
  totalCambiado,
  projection,
  isCurrentMonth,
  totalDaysInMonth,
  balances,
  showBalances,
  budgetProgress = [],
}: {
  totalUsdt: number;
  totalBcv: number;
  totalIngreso: number;
  promedioDiario: number;
  ahorroVsBCV: number;
  totalCambiado: number;
  projection?: number;
  isCurrentMonth?: boolean;
  totalDaysInMonth?: number;
  balances?: AccountBalance[];
  showBalances?: boolean;
  budgetProgress?: BudgetWithProgress[];
}) {
  return (
    <div className="space-y-3">
      {/* Métrica principal: USDT gastados */}
      <Card className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-800/40">
        <p className="text-xs text-indigo-300 font-medium uppercase tracking-wide mb-1">
          USDT gastados este mes
        </p>
        <p className="text-4xl font-bold text-white">
          {totalUsdt.toFixed(2)}
          <span className="text-lg text-indigo-300 ml-2">USDT</span>
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="text-slate-400">
            ≈ <span className="text-slate-200">${totalBcv.toFixed(2)}</span> a tasa BCV
          </span>
          {ahorroVsBCV > 0 && (
            <span className="text-emerald-400 font-medium">
              Ahorraste ${ahorroVsBCV.toFixed(2)}
            </span>
          )}
        </div>
        {isCurrentMonth && projection !== undefined && totalDaysInMonth !== undefined && (
          <div className="mt-3 pt-3 border-t border-indigo-800/30 flex items-center justify-between text-sm">
            <span className="text-slate-500">Proyección al día {totalDaysInMonth}</span>
            <span className={`font-semibold ${projection > totalUsdt * 1.2 ? "text-rose-400" : "text-indigo-300"}`}>
              ~{projection.toFixed(2)} USDT
            </span>
          </div>
        )}
      </Card>

      {/* 3 tarjetas secundarias */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="py-3">
          <p className="text-xs text-slate-500">Promedio/día</p>
          <p className="text-base font-bold text-blue-400 mt-0.5">{promedioDiario.toFixed(2)}</p>
          <p className="text-xs text-slate-600">USDT</p>
        </Card>
        <Card className="py-3">
          <p className="text-xs text-slate-500">Ingresos</p>
          <p className="text-base font-bold text-emerald-400 mt-0.5">{totalIngreso.toFixed(2)}</p>
          <p className="text-xs text-slate-600">USDT</p>
        </Card>
        <Card className="py-3">
          <p className="text-xs text-slate-500">Cambiado</p>
          <p className="text-base font-bold text-purple-400 mt-0.5">{totalCambiado.toFixed(2)}</p>
          <p className="text-xs text-slate-600">USDT→Bs</p>
        </Card>
      </div>

      {/* Saldos por cuenta */}
      {showBalances && balances && balances.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2 px-1">Saldo estimado por cuenta</p>
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
            {balances.map((b) => (
              <div
                key={b.account.id}
                className="flex-none snap-start rounded-xl border border-slate-800 bg-slate-900 p-3 min-w-[140px]"
              >
                <p className="text-xs text-slate-500">{b.account.type}</p>
                <p className="text-xs text-slate-300 font-medium truncate mt-0.5">{b.account.name}</p>
                <p className="text-base font-bold text-white mt-1">
                  {b.balance.toLocaleString("es-VE", { maximumFractionDigits: 2 })}
                  <span className="text-xs text-slate-400 ml-1">{b.currency}</span>
                </p>
                {b.currency !== "Bs" && (
                  <p className="text-xs text-slate-500">≈ ${b.balanceUsd.toFixed(2)}</p>
                )}
                {/* Extra balances (SOL, SKR, etc.) */}
                {(b.account.extraBalances ?? []).map((extra) => (
                  <p key={extra.symbol} className="text-xs text-slate-500 mt-0.5">
                    {extra.symbol}: {extra.amount.toLocaleString("es-VE", { maximumFractionDigits: 4 })}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metas del mes */}
      {budgetProgress.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2 px-1">Metas del mes</p>
          <Card className="space-y-3">
            {budgetProgress.map((b) => (
              <div key={b.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{b.category}</span>
                  <span className={b.pct >= 100 ? "text-rose-400" : b.pct >= 80 ? "text-amber-400" : "text-slate-400"}>
                    {b.spent.toFixed(2)} / {b.limitUsdt} USDT
                  </span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${b.pct >= 100 ? "bg-rose-500" : b.pct >= 80 ? "bg-amber-500" : "bg-indigo-500"}`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>  );
}
