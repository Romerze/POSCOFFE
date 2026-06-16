import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PaymentMethod } from '@poscoffe/types';
import { api } from '../lib/api';
import { useCart } from '../store/cart';
import { useLocalId } from '../hooks/useLocalId';
import { ProductModal } from '../components/ProductModal';
import { Ticket } from '../components/Ticket';
import { CustomerBar } from '../components/CustomerBar';
import { productImage } from '../lib/img';
import type { Producto } from '../types';

export function CashierScreen() {
  const cart = useCart();
  const localId = useLocalId();
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cobrando, setCobrando] = useState(false);

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos', localId],
    queryFn: () => api.listProductos(localId),
    enabled: !!localId,
  });

  const porCategoria = useMemo(() => {
    const g = new Map<string, Producto[]>();
    (productos ?? []).forEach((p) => g.set(p.categoria?.nombre ?? 'Menú', [...(g.get(p.categoria?.nombre ?? 'Menú') ?? []), p]));
    return [...g.entries()];
  }, [productos]);

  const cobrar = async (metodo: PaymentMethod) => {
    if (!localId || cart.items.length === 0) return;
    setCobrando(true);
    try {
      const order = await api.createOrder({
        operationId: crypto.randomUUID(),
        localId,
        clienteId: cart.clienteId ?? undefined,
        canal: 'mostrador',
        items: cart.items.map((it) => ({ varianteId: it.varianteId, cantidad: it.cantidad, modificadorIds: it.modificadorIds })),
      });
      await api.addPayment(order.id, { metodo, monto: Number(order.total) });
      cart.clear();
      setToast(`Cobrado · S/${Number(order.total).toFixed(2)}`);
      setTimeout(() => setToast(null), 2500);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'No se pudo cobrar');
      setTimeout(() => setToast(null), 3500);
    } finally {
      setCobrando(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <CustomerBar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
        <section className="flex-1 overflow-y-auto px-5 py-5">
          {!localId ? (
            <p className="text-muted">Sin local asignado.</p>
          ) : isLoading ? (
            <Skeleton />
          ) : porCategoria.length === 0 ? (
            <Empty />
          ) : (
            porCategoria.map(([cat, items]) => (
              <div key={cat} className="mb-7">
                <h2 className="eyebrow mb-3">{cat}</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {items.map((p) => (
                    <ProductCard key={p.id} producto={p} onClick={() => setOpenId(p.id)} />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
        <Ticket localId={localId} onCobrar={cobrar} cobrando={cobrando} />
      </div>

      {openId && <ProductModal productoId={openId} onClose={() => setOpenId(null)} />}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-pine px-6 py-3 font-medium text-white shadow-lift">
          {toast}
        </div>
      )}
    </div>
  );
}

function ProductCard({ producto, onClick }: { producto: Producto; onClick: () => void }) {
  const desde = producto.variantes.length ? Math.min(...producto.variantes.map((v) => Number(v.precio))) : null;
  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0"
    >
      <div className="relative h-28 overflow-hidden">
        <img
          src={productImage(producto.nombre, producto.imagen)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {producto.esCombo && (
          <span className="absolute left-2 top-2 rounded-full bg-honey px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[rgb(28_31_21)] shadow">
            Combo
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <span className="font-display text-[1.05rem] font-bold leading-tight text-fg">{producto.nombre}</span>
        {desde !== null && (
          <span className="shrink-0 text-sm font-semibold tnum text-cherry">S/{desde.toFixed(2)}</span>
        )}
      </div>
    </button>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-surface2" />)}
    </div>
  );
}

function Empty() {
  return (
    <div className="mt-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-surface2 text-3xl">🗒️</div>
      <p className="mt-3 text-muted">Aún no hay productos. Créalos en Gestión → Catálogo.</p>
    </div>
  );
}
