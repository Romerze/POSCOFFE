import { puedeConsumir } from './subscription-rules';

const base = {
  estado: 'activa',
  inicio: new Date('2026-06-01'),
  fin: new Date('2026-07-01'),
  limiteConsumos: 10,
  consumosActuales: 0,
};
const now = new Date('2026-06-15');

describe('puedeConsumir', () => {
  it('permite consumo válido dentro de vigencia y límite', () => {
    expect(puedeConsumir(base, now).ok).toBe(true);
  });

  it('rechaza si no está activa', () => {
    expect(puedeConsumir({ ...base, estado: 'cancelada' }, now)).toMatchObject({ ok: false });
  });

  it('rechaza si está vencida', () => {
    expect(puedeConsumir(base, new Date('2026-08-01')).ok).toBe(false);
  });

  it('rechaza si alcanzó el límite', () => {
    expect(puedeConsumir({ ...base, consumosActuales: 10 }, now).ok).toBe(false);
  });

  it('ilimitada (límite null) siempre admite', () => {
    expect(puedeConsumir({ ...base, limiteConsumos: null, consumosActuales: 999 }, now).ok).toBe(true);
  });
});
