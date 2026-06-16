import { aplicarAvance, calcularRacha, type ProgresoState } from './gamification-rules';

const now = new Date('2026-06-15T10:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

describe('aplicarAvance', () => {
  const reto = { objetivo: 5, periodoDias: 7, recompensaPuntos: 50 };
  const base: ProgresoState = { progreso: 4, periodoInicio: new Date('2026-06-14'), completados: 0 };

  it('incrementa sin completar', () => {
    const r = aplicarAvance({ ...base, progreso: 2 }, reto, 1, now);
    expect(r.state.progreso).toBe(3);
    expect(r.vecesCompletadoAhora).toBe(0);
  });

  it('completa al alcanzar el objetivo y otorga puntos', () => {
    const r = aplicarAvance(base, reto, 1, now); // 4 + 1 = 5 → completa
    expect(r.vecesCompletadoAhora).toBe(1);
    expect(r.puntosGanados).toBe(50);
    expect(r.state.progreso).toBe(0);
    expect(r.state.completados).toBe(1);
  });

  it('reinicia el progreso si el periodo venció', () => {
    const viejo: ProgresoState = { progreso: 4, periodoInicio: new Date('2026-06-01'), completados: 0 };
    const r = aplicarAvance(viejo, reto, 1, now); // periodo venció → reset, luego +1 = 1
    expect(r.state.progreso).toBe(1);
    expect(r.vecesCompletadoAhora).toBe(0);
  });
});

describe('calcularRacha', () => {
  it('cuenta días consecutivos hasta hoy', () => {
    const fechas = [new Date(now), new Date(now.getTime() - DAY), new Date(now.getTime() - 2 * DAY)];
    expect(calcularRacha(fechas, now)).toBe(3);
  });

  it('se corta con un hueco', () => {
    const fechas = [new Date(now), new Date(now.getTime() - 3 * DAY)];
    expect(calcularRacha(fechas, now)).toBe(1);
  });

  it('sin compras → 0', () => {
    expect(calcularRacha([], now)).toBe(0);
  });
});
