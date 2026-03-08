"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";

export function BackupRestore({ onImport }: { onImport: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = storage.importAll(text);
      if (result.ok) {
        setStatus({ type: "ok", msg: "Datos importados correctamente. La página se recargará." });
        setTimeout(() => { onImport(); window.location.reload(); }, 1500);
      } else {
        setStatus({ type: "error", msg: result.error ?? "Error desconocido." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">Backup y restauración</h3>
        <p className="text-xs text-slate-500 mt-1">
          Exporta tus datos para guardarlos o moverlos a otro dispositivo.
        </p>
      </div>

      <Button variant="outline" className="w-full" onClick={() => storage.exportAll()}>
        Exportar backup (JSON)
      </Button>

      <div>
        <Button
          variant="outline"
          className="w-full border-amber-700 text-amber-400 hover:bg-amber-900/20"
          onClick={() => fileRef.current?.click()}
        >
          Importar backup (JSON)
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
        <p className="text-xs text-slate-600 mt-1 text-center">
          Reemplazará todos los datos actuales
        </p>
      </div>

      {status && (
        <p className={`text-xs text-center font-medium ${status.type === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
          {status.msg}
        </p>
      )}
    </div>
  );
}
