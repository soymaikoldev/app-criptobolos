"use client";

import { useState } from "react";
import { Rates } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RatesForm({ rates, onSave }: { rates: Rates; onSave: (rates: Rates) => void }) {
  const [bcv, setBcv] = useState(String(rates.bcv));
  const [p2p, setP2p] = useState(String(rates.p2p));

  return (
    <Card>
      <h3 className="mb-3 font-semibold">Configuración de tasas</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <Input type="number" value={bcv} onChange={(e) => setBcv(e.target.value)} placeholder="Tasa BCV" />
        <Input type="number" value={p2p} onChange={(e) => setP2p(e.target.value)} placeholder="Tasa P2P/Binance" />
      </div>
      <Button className="mt-3" onClick={() => onSave({ bcv: Number(bcv), p2p: Number(p2p) })}>Guardar tasas</Button>
    </Card>
  );
}
