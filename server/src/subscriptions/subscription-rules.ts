/** Estado de una suscripción para evaluar si admite un consumo. */
export interface SubscriptionState {
  estado: string;
  inicio: Date;
  fin: Date | null;
  limiteConsumos: number | null; // null = ilimitado
  consumosActuales: number;
}

export interface ConsumoCheck {
  ok: boolean;
  motivo?: string;
}

/**
 * ¿La suscripción admite un consumo más? Reglas docs/08 §8.6:
 * activa, dentro de vigencia y sin exceder el límite de consumos.
 */
export function puedeConsumir(s: SubscriptionState, now: Date = new Date()): ConsumoCheck {
  if (s.estado !== 'activa') return { ok: false, motivo: 'Suscripción no activa' };
  if (now < s.inicio) return { ok: false, motivo: 'Suscripción aún no vigente' };
  if (s.fin && now > s.fin) return { ok: false, motivo: 'Suscripción vencida' };
  if (s.limiteConsumos !== null && s.consumosActuales >= s.limiteConsumos) {
    return { ok: false, motivo: 'Límite de consumos alcanzado' };
  }
  return { ok: true };
}
