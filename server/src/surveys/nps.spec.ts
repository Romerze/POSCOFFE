import { resumirEncuestas } from './nps';

describe('resumirEncuestas', () => {
  it('sin respuestas devuelve ceros', () => {
    expect(resumirEncuestas([])).toEqual({
      total: 0,
      promedio: 0,
      distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      nps: 0,
    });
  });

  it('calcula promedio, distribución y NPS', () => {
    // 5,5,4 (promotores=3), 3 (neutro), 1 (detractor) → total 5
    const r = resumirEncuestas([5, 5, 4, 3, 1]);
    expect(r.total).toBe(5);
    expect(r.promedio).toBe(3.6);
    expect(r.distribucion[5]).toBe(2);
    // promotores 3, detractores 1 → (3-1)/5 = 40
    expect(r.nps).toBe(40);
  });

  it('todos excelentes → NPS 100', () => {
    expect(resumirEncuestas([5, 5, 5]).nps).toBe(100);
  });
});
