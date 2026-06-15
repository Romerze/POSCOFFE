/**
 * Motor de promociones (lógica pura, sin BD). Evalúa el carrito contra las
 * promociones vigentes y devuelve el mejor descuento aplicable.
 * Ver docs/08 §8.2 (reglas de promociones).
 */

export interface PromoCondicion {
  /** Franja horaria local "HH:MM"–"HH:MM" (p. ej. hora valle). */
  franja?: { desde: string; hasta: string };
  /** Días de la semana válidos (0=domingo … 6=sábado). */
  diasSemana?: number[];
  /** Subtotal mínimo del pedido para que aplique. */
  montoMinimo?: number;
  /** Si está presente, la promo solo afecta a estas variantes. */
  varianteIds?: string[];
}

export interface PromoEfecto {
  tipo: 'porcentaje' | 'monto' | 'nxm';
  /** Para 'porcentaje' (0–100) o 'monto' (valor fijo). */
  valor?: number;
  /** Para 'nxm': lleva n, paga m. */
  n?: number;
  m?: number;
}

export interface PromoEvaluable {
  id: string;
  nombre: string;
  tipo: string;
  prioridad: number;
  condicion: PromoCondicion;
  efecto: PromoEfecto;
}

export interface CartLine {
  varianteId: string;
  cantidad: number;
  precioUnit: number;
}

export interface PromoResult {
  descuento: number;
  aplicada: { id: string; nombre: string } | null;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** ¿La hora de `now` cae dentro de la franja? Soporta franjas que cruzan medianoche. */
function enFranja(now: Date, franja: { desde: string; hasta: string }): boolean {
  const mins = now.getHours() * 60 + now.getMinutes();
  const desde = toMinutes(franja.desde);
  const hasta = toMinutes(franja.hasta);
  return desde <= hasta ? mins >= desde && mins <= hasta : mins >= desde || mins <= hasta;
}

function lineasEnScope(lines: CartLine[], cond: PromoCondicion): CartLine[] {
  if (!cond.varianteIds?.length) return lines;
  const set = new Set(cond.varianteIds);
  return lines.filter((l) => set.has(l.varianteId));
}

function aplica(promo: PromoEvaluable, lines: CartLine[], subtotal: number, now: Date): boolean {
  const c = promo.condicion;
  if (c.franja && !enFranja(now, c.franja)) return false;
  if (c.diasSemana?.length && !c.diasSemana.includes(now.getDay())) return false;
  if (c.montoMinimo != null && subtotal < c.montoMinimo) return false;
  if (lineasEnScope(lines, c).length === 0) return false;
  return true;
}

function calcularDescuento(promo: PromoEvaluable, lines: CartLine[], subtotal: number): number {
  const scoped = lineasEnScope(lines, promo.condicion);
  const scopedSubtotal = scoped.reduce((acc, l) => acc + l.precioUnit * l.cantidad, 0);
  const e = promo.efecto;

  switch (e.tipo) {
    case 'porcentaje':
      return round2((scopedSubtotal * (e.valor ?? 0)) / 100);
    case 'monto':
      return round2(Math.min(e.valor ?? 0, subtotal));
    case 'nxm': {
      const n = e.n ?? 0;
      const m = e.m ?? 0;
      if (n <= 0 || m < 0 || m >= n) return 0;
      // Por cada grupo de n unidades de una línea, se regalan (n - m).
      let desc = 0;
      for (const l of scoped) {
        const grupos = Math.floor(l.cantidad / n);
        desc += grupos * (n - m) * l.precioUnit;
      }
      return round2(desc);
    }
    default:
      return 0;
  }
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * Evalúa todas las promos y aplica la de mayor prioridad que sea aplicable
 * (no acumulable por defecto). El descuento nunca deja el total negativo.
 */
export function evaluatePromotions(
  lines: CartLine[],
  promos: PromoEvaluable[],
  now: Date = new Date(),
): PromoResult {
  const subtotal = lines.reduce((acc, l) => acc + l.precioUnit * l.cantidad, 0);
  const candidatas = promos
    .filter((p) => aplica(p, lines, subtotal, now))
    .sort((a, b) => b.prioridad - a.prioridad);

  for (const promo of candidatas) {
    const descuento = calcularDescuento(promo, lines, subtotal);
    if (descuento > 0) {
      return { descuento: Math.min(descuento, subtotal), aplicada: { id: promo.id, nombre: promo.nombre } };
    }
  }
  return { descuento: 0, aplicada: null };
}
