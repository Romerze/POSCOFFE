import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PaymentMethod } from '@poscoffe/types';
import { api } from '../lib/api';
import { useCart } from '../store/cart';
import { useLocalId } from '../hooks/useLocalId';
import { ProductModal } from '../components/ProductModal';
import { Ticket } from '../components/Ticket';
import { CustomerBar } from '../components/CustomerBar';
import type { Producto } from '../types';

export function CashierScreen() {
  const cart = useCart();
  const localId = useLocalId();
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cobrando, setCobrando] = useState(false);

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos', localId],
    queryFn: () => api.listProductos(localId),
    enabled: !!localId,
  });

  const porCategoria = useMemo(() => {
    const groups = new Map<string, Producto[]>();
    (productos ?? []).forEach((p) => {
      const cat = p.categoria?.nombre ?? 'Sin categoría';
      groups.set(cat, [...(groups.get(cat) ?? []), p]);
    });
    return [...groups.entries()];
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
        items: cart.items.map((it) => ({
          varianteId: it.varianteId,
          cantidad: it.cantidad,
          modificadorIds: it.modificadorIds,
        })),
      });
      // Paga el total ya con descuento de promociones (calculado por el server).
      await api.addPayment(order.id, { metodo, monto: Number(order.total) });
      cart.clear();
      setToast(`Venta cobrada · S/${Number(order.total).toFixed(2)}`);
      setTimeout(() => setToast(null), 2500);
    } catch (e) {
      setToast(e instanceof Error ? e.message : 'Error al cobrar');
      setTimeout(() => setToast(null), 3500);
    } finally {
      setCobrando(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <CustomerBar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
        {/* Catálogo */}
        <main className="flex-1 overflow-y-auto p-4">
          {!localId ? (
            <p className="text-[#8A7F75]">Sin local asignado.</p>
          ) : isLoading ? (
            <CatalogSkeleton />
          ) : porCategoria.length === 0 ? (
            <div className="mt-10 text-center text-[#8A7F75]">
              <p className="text-4xl">🗒️</p>
              <p className="mt-2">No hay productos. Cárgalos desde administración o el seed.</p>
            </div>
          ) : (
            porCategoria.map(([cat, items]) => (
              <section key={cat} className="mb-6">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#8A7F75]">{cat}</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {items.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setOpenProductId(p.id)}
                      className="flex h-24 flex-col justify-between rounded-xl bg-white p-3 text-left shadow-sm transition hover:shadow-md active:scale-95 dark:bg-[#262019]"
                    >
                      <span className="font-semibold text-[#2B2420] dark:text-[#F2EDE6]">{p.nombre}</span>
                      <span className="text-sm text-cafe dark:text-latte">
                        {p.variantes.length
                          ? `desde S/${Math.min(...p.variantes.map((v) => Number(v.precio))).toFixed(2)}`
                          : 'sin precio'}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        {/* Ticket */}
        <div className="border-t border-latte/30 sm:border-l sm:border-t-0">
          <Ticket localId={localId} onCobrar={cobrar} cobrando={cobrando} />
        </div>
      </div>

      {openProductId && (
        <ProductModal productoId={openProductId} onClose={() => setOpenProductId(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-exito px-6 py-3 font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-latte/15" />
      ))}
    </div>
  );
}
