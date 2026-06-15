import { segmentar } from './segmentation';

describe('segmentar (RFM)', () => {
  it('cliente sin compras → nuevo, no VIP', () => {
    expect(segmentar({ recenciaDias: null, frecuencia: 0, monto: 0 })).toEqual({
      segmento: 'nuevo',
      esVip: false,
    });
  });

  it('frecuente y reciente → fiel', () => {
    expect(segmentar({ recenciaDias: 5, frecuencia: 6, monto: 80 }).segmento).toBe('fiel');
  });

  it('sin comprar hace mucho → dormido', () => {
    expect(segmentar({ recenciaDias: 120, frecuencia: 3, monto: 50 }).segmento).toBe('dormido');
  });

  it('compraba y se está alejando → en_riesgo', () => {
    expect(segmentar({ recenciaDias: 45, frecuencia: 4, monto: 60 }).segmento).toBe('en_riesgo');
  });

  it('gasto alto → VIP', () => {
    expect(segmentar({ recenciaDias: 10, frecuencia: 3, monto: 250 }).esVip).toBe(true);
  });

  it('muy frecuente → VIP', () => {
    expect(segmentar({ recenciaDias: 10, frecuencia: 12, monto: 100 }).esVip).toBe(true);
  });
});
