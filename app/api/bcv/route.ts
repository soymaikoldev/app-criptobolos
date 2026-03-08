import { NextResponse } from "next/server";

/**
 * Obtiene la tasa oficial BCV desde ve.dolarapi.com
 * Se llama server-side para evitar CORS.
 */
export async function GET() {
  // Fuente 1: ve.dolarapi.com
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 3600 }, // cache 1 hora
    });
    if (res.ok) {
      const data = await res.json();
      // Formato: { promedio: number, nombre: string, ultima_actualizacion: string }
      const rate = data.promedio ?? data.precio ?? data.price;
      if (rate && Number(rate) > 0) {
        return NextResponse.json({
          rate: Number(Number(rate).toFixed(2)),
          source: "dolarapi",
          updatedAt: data.ultima_actualizacion ?? new Date().toISOString(),
        });
      }
    }
  } catch {
    // Intenta siguiente fuente
  }

  // Fuente 2: pydolarve.org
  try {
    const res = await fetch("https://pydolarve.org/api/v1/dollar?page=bcv", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const rate = data.price ?? data.promedio;
      if (rate && Number(rate) > 0) {
        return NextResponse.json({
          rate: Number(Number(rate).toFixed(2)),
          source: "pydolarve",
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch {
    // Ambas fuentes fallaron
  }

  return NextResponse.json(
    { error: "No se pudo obtener la tasa BCV. Verifica tu conexión." },
    { status: 503 },
  );
}
