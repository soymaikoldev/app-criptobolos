"use client";

import { useEffect, useState } from "react";
import { Rates } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  rates: Rates;
  onSave: (rates: Rates) => void;
  onRefreshBCV?: () => void;
  bcvFetching?: boolean;
}

export function RatesForm({ rates, onSave, onRefreshBCV, bcvFetching }: Props) {
  const [bcv, setBcv] = useState(String(rates.bcv));
  const [p2p, setP2p] = useState(String(rates.p2p));
  const [saved, setSaved] = useState(false);

  // ✅ Fix: sync via useEffect en vez de comparación en render
  useEffect(() => {
    setBcv(String(rates.bcv));
  }, [rates.bcv]);

  useEffect(() => {
    setP2p(String(rates.p2p));
  }, [rates.p2p]);

  const handleSave = () => {
    onSave({ ...rates, bcv: Number(bcv), p2p: Number(p2p) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const bcvUpdated = rates.bcvUpdatedAt
    ? new Date(rates.bcvUpdatedAt).toLocaleString("es-VE", { dateStyle: "short", timeStyle: "short" })
    : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">Tasas de cambio</h3>
        <p className="text-xs text-slate-500">
          La BCV se actualiza automáticamente. La P2P la ajustas tú según el mercado del día.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-400">Tasa BCV oficial (Bs/$)</label>
            <button
              onClick={onRefreshBCV}
              disabled={bcvFetching}
              className="text-xs text-indigo-400 active:opacity-70 disabled:opacity-40"
            >
              {bcvFetching ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
          <Input type="number" value={bcv} onChange={(e) => setBcv(e.target.value)} placeholder="Ej: 90" />
          {bcvUpdated && (
            <p className="text-xs text-slate-600 mt-1">Última actualización: {bcvUpdated}</p>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Tasa P2P Binance (Bs/$)</label>
          <Input type="number" value={p2p} onChange={(e) => setP2p(e.target.value)} placeholder="Ej: 620" />
          <p className="text-xs text-slate-600 mt-1">
            Predeterminada. Cada gasto puede tener su propia tasa.
          </p>
        </div>
      </div>

      {Number(p2p) > 0 && Number(bcv) > 0 && (
        <div className="rounded-lg bg-slate-800 p-3 text-xs space-y-1.5">
          <p className="text-slate-300 font-medium">Diferencial actual</p>
          <p className="text-slate-400">
            P2P está{" "}
            <span className="text-emerald-400 font-semibold">
              {((Number(p2p) / Number(bcv) - 1) * 100).toFixed(1)}% por encima
            </span>{" "}
            del BCV
          </p>
          <div className="border-t border-slate-700 pt-1.5 space-y-1">
            <p className="text-slate-500">100 Bs cuestan en realidad:</p>
            <p className="text-slate-400">
              BCV: <span className="text-white">${(100 / Number(bcv)).toFixed(3)}</span>{" "}
              · P2P real: <span className="text-emerald-400 font-semibold">${(100 / Number(p2p)).toFixed(3)} USDT</span>
            </p>
          </div>
        </div>
      )}

      <Button className="w-full" onClick={handleSave}>
        {saved ? "Guardado" : "Guardar tasas"}
      </Button>
    </div>
  );
}
