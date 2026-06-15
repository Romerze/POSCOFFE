// Prueba de la regla pura de niveles de fidelización.
function nivelPorPuntos(puntos: number): string {
  if (puntos >= 1000) return 'oro';
  if (puntos >= 300) return 'plata';
  return 'base';
}

describe('niveles de fidelización', () => {
  it('asigna base por debajo de 300', () => {
    expect(nivelPorPuntos(0)).toBe('base');
    expect(nivelPorPuntos(299)).toBe('base');
  });
  it('asigna plata entre 300 y 999', () => {
    expect(nivelPorPuntos(300)).toBe('plata');
    expect(nivelPorPuntos(999)).toBe('plata');
  });
  it('asigna oro desde 1000', () => {
    expect(nivelPorPuntos(1000)).toBe('oro');
  });
});
