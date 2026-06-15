/** Métricas RFM de un cliente. */
export interface RfmInput {
  recenciaDias: number | null; // días desde la última compra (null = nunca)
  frecuencia: number; // nº de pedidos
  monto: number; // gasto acumulado
}

export interface SegmentacionResult {
  segmento: 'nuevo' | 'ocasional' | 'fiel' | 'en_riesgo' | 'dormido';
  esVip: boolean;
}

/**
 * Segmentación RFM simple (reglas, Fase 2). Ver docs/03 §3.13.
 * - VIP: gasto alto o muy frecuente.
 */
export function segmentar({ recenciaDias, frecuencia, monto }: RfmInput): SegmentacionResult {
  const esVip = monto >= 200 || frecuencia >= 10;

  let segmento: SegmentacionResult['segmento'];
  if (frecuencia === 0 || recenciaDias === null) {
    segmento = 'nuevo';
  } else if (recenciaDias > 90) {
    segmento = 'dormido';
  } else if (recenciaDias > 30 && frecuencia >= 2) {
    segmento = 'en_riesgo';
  } else if (frecuencia >= 5 && recenciaDias <= 30) {
    segmento = 'fiel';
  } else if (frecuencia <= 1) {
    segmento = 'nuevo';
  } else {
    segmento = 'ocasional';
  }

  return { segmento, esVip };
}
