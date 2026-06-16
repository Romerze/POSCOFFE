export interface ResumenEncuestas {
  total: number;
  promedio: number;
  distribucion: Record<number, number>; // puntaje (1..5) → conteo
  nps: number; // -100..100
}

/**
 * Resume puntajes de encuestas (escala 1–5). NPS adaptado: promotores (≥4)
 * menos detractores (≤2), en porcentaje. Ver docs/03 §3.9 y §3.14.
 */
export function resumirEncuestas(puntajes: number[]): ResumenEncuestas {
  const total = puntajes.length;
  const distribucion: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (total === 0) return { total: 0, promedio: 0, distribucion, nps: 0 };

  let suma = 0;
  let promotores = 0;
  let detractores = 0;
  for (const p of puntajes) {
    distribucion[p] = (distribucion[p] ?? 0) + 1;
    suma += p;
    if (p >= 4) promotores++;
    else if (p <= 2) detractores++;
  }

  return {
    total,
    promedio: Math.round((suma / total) * 100) / 100,
    distribucion,
    nps: Math.round(((promotores - detractores) / total) * 100),
  };
}
