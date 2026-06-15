import { useQuery } from '@tanstack/react-query';
import type { PaymentMethod } from '@poscoffe/types';
import { api } from '../lib/api';
import { useCart } from '../store/cart';

const METODOS: { metodo: PaymentMethod; label: string }[] = [
  { metodo: 'efectivo', label: 'Efectivo' },
  { metodo: 'tarjeta', label: 'Tarjeta' },
  { metodo: 'digital', label: 'Digital' },
];

export function Ticket({
  localId,
  onCobrar,
  cobrando,
}: {
  localId: string;
  onCobrar: (metodo: PaymentMethod) => void;
  cobrando: boolean;
}) {
  const { items, setCantidad, remove, clear, total } = useCart();
  const subtotal = total();

  // Evalúa promociones en vivo cuando cambia el carrito.
  const cartKey = items.map((it) => `${it.varianteId}:${it.cantidad}:${it.precioUnit}`).join('|');
  const { data: promo } = useQuery({
    queryKey: ['promos', localId, cartKey],
    queryFn: () =>
      api.evaluarPromos(
        localId,
        items.map((it) => ({ varianteId: it.varianteId, cantidad: it.cantidad, precioUnit: it.precioUnit })),
      ),
    enabled: items.length > 0 && !!localId,
  });

  const descuento = promo?.descuento ?? 0;
  const totalFinal = Math.max(0, subtotal - descuento);

  return (
    <aside className="flex h-full w-full flex-col bg-white dark:bg-[#262019] sm:w-96">
      <div className="flex items-center justify-between border-b border-latte/30 px-4 py-3">
        <h2 className="font-bold text-[#2B2420] dark:text-[#F2EDE6]">Ticket</h2>
        {items.length > 0 && (
          <button onClick={clear} className="text-sm text-peligro">
            Vaciar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {items.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#8A7F75]">Sin productos</p>
        ) : (
          items.map((it) => (
            <div key={it.key} className="border-b border-latte/20 py-3">
              <div className="flex justify-between">
                <span className="font-medium text-[#2B2420] dark:text-[#F2EDE6]">
                  {it.productoNombre} · {it.varianteNombre}
                </span>
                <span className="font-semibold text-cafe dark:text-latte">
                  S/{(it.precioUnit * it.cantidad).toFixed(2)}
                </span>
              </div>
              {it.modificadorNombres.length > 0 && (
                <p className="text-xs text-[#8A7F75]">{it.modificadorNombres.join(', ')}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setCantidad(it.key, it.cantidad - 1)}
                  className="h-7 w-7 rounded-full bg-latte/20 text-lg leading-none text-cafe dark:text-latte"
                >
                  −
                </button>
                <span className="w-6 text-center text-[#2B2420] dark:text-[#F2EDE6]">{it.cantidad}</span>
                <button
                  onClick={() => setCantidad(it.key, it.cantidad + 1)}
                  className="h-7 w-7 rounded-full bg-latte/20 text-lg leading-none text-cafe dark:text-latte"
                >
                  +
                </button>
                <button onClick={() => remove(it.key)} className="ml-auto text-xs text-peligro">
                  Quitar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-latte/30 p-4">
        {descuento > 0 && (
          <>
            <div className="flex justify-between text-sm text-[#8A7F75]">
              <span>Subtotal</span>
              <span>S/{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-exito">
              <span>🎉 {promo?.aplicada?.nombre ?? 'Descuento'}</span>
              <span>−S/{descuento.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="mb-3 mt-1 flex justify-between text-lg font-bold text-[#2B2420] dark:text-[#F2EDE6]">
          <span>Total</span>
          <span>S/{totalFinal.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {METODOS.map((m) => (
            <button
              key={m.metodo}
              disabled={items.length === 0 || cobrando}
              onClick={() => onCobrar(m.metodo)}
              className="rounded-lg bg-cafe py-2.5 text-sm font-semibold text-white transition hover:bg-cafe/90 disabled:opacity-50"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
