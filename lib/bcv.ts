/**
 * Obtiene la tasa BCV oficial desde la API interna de Next.js
 */
export async function fetchBCVRate(): Promise<{ rate: number; updatedAt: string } | null> {
  try {
    const res = await fetch("/api/bcv");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.rate) return null;
    return { rate: data.rate, updatedAt: data.updatedAt ?? new Date().toISOString() };
  } catch {
    return null;
  }
}
