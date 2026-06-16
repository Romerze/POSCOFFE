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
  const cartKey = items.map((it) => `${it.varianteId}:${it.cantidad}:${it.precioUnit}`).join('|');

  const { data: promo } = useQuery({
    queryKey: ['promos', localId, cartKey],
    queryFn: () =>
      api.evaluarPromos(localId, items.map((it) => ({ varianteId: it.varianteId, cantidad: it.cantidad, precioUnit: it.precioUnit }))),
    enabled: items.length > 0 && !!localId,
  });

  const descuento = promo?.descuento ?? 0;
  const totalFinal = Math.max(0, subtotal - descuento);
  const unidades = items.reduce((a, it) => a + it.cantidad, 0);

  return (
    <aside className="flex h-full w-full flex-col border-l border-line bg-surface sm:w-[23rem]">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <div className="eyebrow">Comanda</div>
          <div className="font-display text-lg font-bold text-fg">
            {unidades > 0 ? `${unidades} ${unidades === 1 ? 'ítem' : 'ítems'}` : 'Vacía'}
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={clear} className="text-sm text-muted hover:text-danger">Vaciar</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-surface2 text-2xl">☕</div>
            <p className="mt-3 max-w-[14rem] text-sm text-muted">Toca un producto para empezar la comanda.</p>
          </div>
        ) : (
          <ul className="divide-y divide-dashed divide-line">
            {items.map((it) => (
              <li key={it.key} className="py-3.5">
                <div className="flex justify-between gap-3">
                  <span className="font-medium leading-tight text-fg">
                    {it.productoNombre}
                    <span className="text-muted"> · {it.varianteNombre}</span>
                  </span>
                  <span className="font-mono tnum font-semibold text-fg">{(it.precioUnit * it.cantidad).toFixed(2)}</span>
                </div>
                {it.modificadorNombres.length > 0 && (
                  <p className="mt-0.5 text-xs text-honey">{it.modificadorNombres.join(' · ')}</p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setCantidad(it.key, it.cantidad - 1)} className="h-7 w-7 rounded-md bg-surface2 text-lg leading-none text-fg hover:brightness-95">−</button>
                  <span className="w-6 text-center font-mono tnum text-fg">{it.cantidad}</span>
                  <button onClick={() => setCantidad(it.key, it.cantidad + 1)} className="h-7 w-7 rounded-md bg-surface2 text-lg leading-none text-fg hover:brightness-95">+</button>
                  <button onClick={() => remove(it.key)} className="ml-auto text-xs text-muted hover:text-danger">Quitar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-line px-5 py-4">
        {descuento > 0 && (
          <>
            <div className="flex justify-between py-0.5 text-sm text-muted">
              <span>Subtotal</span>
              <span className="font-mono tnum">S/{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-sm font-medium text-pine">
              <span>{promo?.aplicada?.nombre ?? 'Descuento'}</span>
              <span className="font-mono tnum">−S/{descuento.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="mb-3 mt-1 flex items-end justify-between">
          <span className="font-display text-lg font-bold text-fg">Total</span>
          <span className="font-display text-3xl font-extrabold tnum text-cherry">S/{totalFinal.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {METODOS.map((m) => (
            <button
              key={m.metodo}
              disabled={items.length === 0 || cobrando}
              onClick={() => onCobrar(m.metodo)}
              className="btn-primary flex-col py-3 text-xs"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
