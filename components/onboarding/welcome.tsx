"use client";

type Tab = "inicio" | "historial" | "cuentas" | "config";

export function WelcomeBanner({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return (
    <div className="rounded-xl border border-indigo-800/50 bg-indigo-950/30 p-5 space-y-4">
      <div>
        <p className="text-base font-bold text-white">Bienvenido a Crypto Life Tracker</p>
        <p className="text-sm text-slate-400 mt-1">
          Controla cuánto USDT gastas realmente cuando conviertes a bolívares.
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <Step n={1} text="Configura tus cuentas (Solana, Binance, Banco)" action={() => onNavigate("cuentas")} actionLabel="Ir a Cuentas" />
        <Step n={2} text="Ajusta las tasas BCV y P2P actuales" action={() => onNavigate("config")} actionLabel="Ir a Config" />
        <Step n={3} text='Registra tu primer cambio P2P con el botón "+"' />
        <Step n={4} text="Registra cada gasto en Bs con la tasa P2P que usaste" />
      </div>

      <p className="text-xs text-slate-600 text-center">
        Todos tus datos se guardan localmente en este dispositivo.
      </p>
    </div>
  );
}

function Step({
  n,
  text,
  action,
  actionLabel,
}: {
  n: number;
  text: string;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-none h-5 w-5 rounded-full bg-indigo-700 text-white text-xs flex items-center justify-center font-bold">
        {n}
      </span>
      <div className="flex-1">
        <span className="text-slate-300">{text}</span>
        {action && (
          <button onClick={action} className="ml-2 text-xs text-indigo-400 underline active:opacity-70">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
