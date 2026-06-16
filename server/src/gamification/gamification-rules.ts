const DAY_MS = 1000 * 60 * 60 * 24;

export interface ProgresoState {
  progreso: number;
  periodoInicio: Date;
  completados: number;
}

export interface RetoDef {
  objetivo: number;
  periodoDias: number;
  recompensaPuntos: number;
}

export interface AvanceResult {
  state: ProgresoState;
  vecesCompletadoAhora: number;
  puntosGanados: number;
}

/**
 * Aplica un incremento al progreso de un reto. Si el periodo venció, reinicia
 * el contador. Cada vez que el progreso alcanza el objetivo, cuenta una
 * compleción (insignia) y otorga los puntos de recompensa; el remanente se
 * arrastra al siguiente ciclo. Ver docs/03 §3.7.
 */
export function aplicarAvance(
  state: ProgresoState,
  reto: RetoDef,
  incremento: number,
  now: Date = new Date(),
): AvanceResult {
  let { progreso, periodoInicio, completados } = state;

  // Reinicio de periodo.
  if (now.getTime() - periodoInicio.getTime() >= reto.periodoDias * DAY_MS) {
    progreso = 0;
    periodoInicio = now;
  }

  progreso += incremento;

  let veces = 0;
  let puntos = 0;
  if (reto.objetivo > 0) {
    while (progreso >= reto.objetivo) {
      progreso -= reto.objetivo;
      veces += 1;
      puntos += reto.recompensaPuntos;
      completados += 1;
    }
  }

  return {
    state: { progreso: Math.round(progreso * 100) / 100, periodoInicio, completados },
    vecesCompletadoAhora: veces,
    puntosGanados: puntos,
  };
}

/** Racha de días consecutivos con compra hasta hoy, dadas las fechas de pedidos. */
export function calcularRacha(fechas: Date[], now: Date = new Date()): number {
  if (fechas.length === 0) return 0;
  const dias = new Set(fechas.map((f) => Math.floor(f.getTime() / DAY_MS)));
  let racha = 0;
  let cursor = Math.floor(now.getTime() / DAY_MS);
  // Permite que la racha cuente desde hoy o ayer (si aún no compró hoy).
  if (!dias.has(cursor)) cursor -= 1;
  while (dias.has(cursor)) {
    racha += 1;
    cursor -= 1;
  }
  return racha;
}
