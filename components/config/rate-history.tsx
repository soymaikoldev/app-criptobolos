"use client";

import { RateRecord } from "@/types";

export function RateHistory({ history }: { history: RateRecord[] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h3 className="text-sm font-semibold text-white mb-1">Historial de tasas</h3>
        <p className="text-xs text-slate-500">Sin historial aún. Las tasas se registran automáticamente cuando cambian.</p>
      </div>
    );
  }

  const recent = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Historial de tasas</h3>
      <div className="space-y-1.5">
        {recent.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
            <span className="text-xs text-slate-400">
              {new Date(r.date).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <div className="flex gap-4 text-xs">
              <span>
                <span className="text-slate-500">BCV </span>
                <span className="text-slate-200 font-medium">{r.bcv}</span>
              </span>
              <span>
                <span className="text-slate-500">P2P </span>
                <span className="text-purple-300 font-medium">{r.p2p}</span>
              </span>
              {r.bcv > 0 && (
                <span className="text-emerald-500 text-xs">
                  +{((r.p2p / r.bcv - 1) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
