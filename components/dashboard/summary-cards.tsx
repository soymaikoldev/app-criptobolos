import { Card } from "@/components/ui/card";

const money = (n: number) => `$${n.toFixed(2)}`;

export function SummaryCards({
  gasto,
  ingreso,
  promedio,
  ahorro,
}: {
  gasto: number;
  ingreso: number;
  promedio: number;
  ahorro: number;
}) {
  const data = [
    { label: "Gasto del mes", value: money(gasto) },
    { label: "Ingresos del mes", value: money(ingreso) },
    { label: "Promedio diario", value: money(promedio) },
    { label: "Ahorro vs BCV", value: money(ahorro) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((item) => (
        <Card key={item.label}>
          <p className="text-xs text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
