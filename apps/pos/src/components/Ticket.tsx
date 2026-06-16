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
      api.evaluarPromos(
        localId,
        items.map((it) => ({ varianteId: it.varianteId, cantidad: it.cantidad, precioUnit: it.precioUnit })),
      ),
    enabled: items.length > 0 && !!localId,
  });

  const descuento = promo?.descuento ?? 0;
  const totalFinal = Math.max(0, subtotal - descuento);

  return (
    <aside className="flex h-full w-full flex-col bg-surface sm:w-[24rem]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <h2 className="font-display font-bold tracking-tight text-fg">Comanda</h2>
        {items.length > 0 && (
          <button onClick={clear} className="text-sm text-peligro hover:underline">
            Vaciar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-3xl">🫗</p>
            <p className="mt-2 text-sm text-muted">Toca un producto para empezar la comanda.</p>
          </div>
        ) : (
          items.map((it) => (
            <div key={it.key} className="border-b border-line/70 py-3">
              <div className="flex justify-between gap-2">
                <span className="font-medium text-fg">
                  {it.productoNombre} · {it.varianteNombre}
                </span>
                <span className="font-mono tnum font-semibold text-fg">
                  S/{(it.precioUnit * it.cantidad).toFixed(2)}
                </span>
              </div>
              {it.modificadorNombres.length > 0 && (
                <p className="text-xs text-accent">{it.modificadorNombres.join(' · ')}</p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <Stepper onClick={() => setCantidad(it.key, it.cantidad - 1)}>−</Stepper>
                <span className="w-6 text-center font-mono tnum text-fg">{it.cantidad}</span>
                <Stepper onClick={() => setCantidad(it.key, it.cantidad + 1)}>+</Stepper>
                <button onClick={() => remove(it.key)} className="ml-auto text-xs text-muted hover:text-peligro">
                  Quitar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-line p-4">
        {descuento > 0 && (
          <>
            <Row label="Subtotal" value={`S/${subtotal.toFixed(2)}`} muted />
            <div className="flex justify-between py-0.5 text-sm font-medium text-exito">
              <span>🎉 {promo?.aplicada?.nombre ?? 'Descuento'}</span>
              <span className="font-mono tnum">−S/{descuento.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="mb-3 mt-1 flex items-baseline justify-between">
          <span className="font-display font-bold text-fg">Total</span>
          <span className="font-mono tnum text-2xl font-bold text-fg">S/{totalFinal.toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {METODOS.map((m) => (
            <button
              key={m.metodo}
              disabled={items.length === 0 || cobrando}
              onClick={() => onCobrar(m.metodo)}
              className="rounded-lg bg-brand py-3 text-sm font-semibold text-brand-ink transition hover:brightness-110 disabled:opacity-50"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Stepper({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="h-8 w-8 rounded-full bg-surface2 text-lg leading-none text-fg transition hover:brightness-95"
    >
      {children}
    </button>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between py-0.5 text-sm ${muted ? 'text-muted' : 'text-fg'}`}>
      <span>{label}</span>
      <span className="font-mono tnum">{value}</span>
    </div>
  );
}
