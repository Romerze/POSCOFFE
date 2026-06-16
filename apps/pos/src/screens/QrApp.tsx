import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CartItem, Modificador, Producto, Variante } from '../types';

/** App pública para el cliente: menú por QR, pedido y encuesta. Sin login. */
export function QrApp({ localId, mesa }: { localId: string; mesa?: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const menu = useQuery({ queryKey: ['qr-menu', localId], queryFn: () => api.qrMenu(localId) });

  const porCategoria = useMemo(() => {
    const groups = new Map<string, Producto[]>();
    (menu.data?.productos ?? []).forEach((p) => {
      const cat = p.categoria?.nombre ?? 'Menú';
      groups.set(cat, [...(groups.get(cat) ?? []), p]);
    });
    return [...groups.entries()];
  }, [menu.data]);

  const total = cart.reduce((a, it) => a + it.precioUnit * it.cantidad, 0);

  const enviar = async () => {
    if (cart.length === 0) return;
    setSending(true);
    try {
      const order = await api.qrPedido(localId, {
        operationId: crypto.randomUUID(),
        canal: mesa ? 'qr' : 'pickup',
        mesa,
        items: cart.map((it) => ({ varianteId: it.varianteId, cantidad: it.cantidad, modificadorIds: it.modificadorIds })),
      });
      setOrderId(order.id);
      setCart([]);
    } finally {
      setSending(false);
    }
  };

  if (orderId) return <Confirm orderId={orderId} />;

  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-bg">
      <header className="border-b border-line bg-surface px-4 py-3">
        <div className="font-display text-lg font-bold tracking-tight text-brand">☕ POSCOFFE</div>
        <p className="text-sm text-muted">{mesa ? `Pedido en mesa ${mesa}` : 'Pedido para recoger'}</p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-28">
        {menu.isLoading ? (
          <p className="text-muted">Cargando menú…</p>
        ) : (
          porCategoria.map(([cat, items]) => (
            <section key={cat} className="mb-6">
              <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted">{cat}</h2>
              <div className="space-y-2">
                {items.map((p) => {
                  const desde = p.variantes.length ? Math.min(...p.variantes.map((v) => Number(v.precio))) : null;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setOpenId(p.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-line bg-surface p-3.5 text-left shadow-soft transition active:scale-[0.99]"
                    >
                      <div>
                        <div className="font-display font-semibold text-fg">{p.nombre}</div>
                        {p.descripcion && <div className="text-xs text-muted">{p.descripcion}</div>}
                      </div>
                      {desde !== null && (
                        <span className="font-mono tnum text-sm text-brand">S/{desde.toFixed(2)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-line bg-surface p-4">
          <button
            onClick={enviar}
            disabled={sending}
            className="flex w-full items-center justify-between rounded-lg bg-brand px-5 py-3.5 font-semibold text-brand-ink transition hover:brightness-110 disabled:opacity-60"
          >
            <span>{sending ? 'Enviando…' : `Enviar pedido (${cart.length})`}</span>
            <span className="font-mono tnum">S/{total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {openId && (
        <QrProductModal
          localId={localId}
          productoId={openId}
          onClose={() => setOpenId(null)}
          onAdd={(item) => {
            setCart((c) => [...c, item]);
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
}

function QrProductModal({
  localId,
  productoId,
  onClose,
  onAdd,
}: {
  localId: string;
  productoId: string;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}) {
  const { data } = useQuery({ queryKey: ['qr-prod', productoId], queryFn: () => api.qrProducto(localId, productoId) });
  const [varianteId, setVarianteId] = useState('');
  const [mods, setMods] = useState<Record<string, boolean>>({});

  const variante: Variante | undefined = data?.variantes.find((v) => v.id === varianteId) ?? data?.variantes[0];
  const grupos = data?.modGrupos.map((m) => m.grupo) ?? [];
  const modIndex = new Map<string, Modificador>();
  grupos.forEach((g) => g.modificadores.forEach((m) => modIndex.set(m.id, m)));
  const selIds = Object.entries(mods).filter(([, v]) => v).map(([k]) => k);
  const precio = (variante ? Number(variante.precio) : 0) + selIds.reduce((a, id) => a + Number(modIndex.get(id)?.precioExtra ?? 0), 0);

  const add = () => {
    if (!data || !variante) return;
    onAdd({
      key: crypto.randomUUID(),
      varianteId: variante.id,
      productoNombre: data.nombre,
      varianteNombre: variante.nombre,
      cantidad: 1,
      precioUnit: precio,
      modificadorIds: selIds,
      modificadorNombres: selIds.map((id) => modIndex.get(id)?.nombre ?? ''),
    });
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/45 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        {!data || !variante ? (
          <p className="py-10 text-center text-muted">Cargando…</p>
        ) : (
          <>
            <h3 className="font-display text-xl font-bold tracking-tight text-fg">{data.nombre}</h3>
            <section className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tamaño</p>
              <div className="flex flex-wrap gap-2">
                {data.variantes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVarianteId(v.id)}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                      v.id === variante.id ? 'bg-brand text-brand-ink' : 'bg-surface2 text-fg'
                    }`}
                  >
                    {v.nombre} · <span className="font-mono tnum">S/{Number(v.precio).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </section>
            {grupos.map((g) => (
              <section key={g.id} className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{g.nombre}</p>
                <div className="flex flex-wrap gap-2">
                  {g.modificadores.map((m) => (
                    <button
                      key={m.id}
                      onClick={() =>
                        setMods((prev) => {
                          if (g.seleccion === 'unica') {
                            const next = { ...prev };
                            g.modificadores.forEach((x) => delete next[x.id]);
                            next[m.id] = true;
                            return next;
                          }
                          return { ...prev, [m.id]: !prev[m.id] };
                        })
                      }
                      className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                        mods[m.id] ? 'bg-accent text-[rgb(26_22_19)]' : 'bg-surface2 text-fg'
                      }`}
                    >
                      {m.nombre}
                      {Number(m.precioExtra) > 0 && <span className="font-mono tnum"> +S/{Number(m.precioExtra).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </section>
            ))}
            <button onClick={add} className="mt-6 w-full rounded-lg bg-brand py-3.5 font-semibold text-brand-ink">
              Agregar · <span className="font-mono tnum">S/{precio.toFixed(2)}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Confirm({ orderId }: { orderId: string }) {
  const [done, setDone] = useState(false);
  const [comentario, setComentario] = useState('');
  const opciones = [
    { p: 5, e: '😀', l: 'Excelente' },
    { p: 3, e: '😐', l: 'Normal' },
    { p: 1, e: '😞', l: 'Mala' },
  ];

  const responder = async (puntaje: number) => {
    try {
      await api.encuesta({ pedidoId: orderId, puntaje, comentario: comentario || undefined });
    } finally {
      setDone(true);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center bg-bg p-8 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-fg">¡Pedido enviado!</h1>
      <p className="mt-1 text-muted">
        Tu código: <span className="font-mono tnum font-semibold text-brand">{orderId.slice(-6).toUpperCase()}</span>
      </p>

      {done ? (
        <p className="mt-8 text-muted">¡Gracias por tu opinión! 🙌</p>
      ) : (
        <div className="mt-10 w-full">
          <p className="mb-3 text-sm font-medium text-fg">¿Cómo estuvo tu experiencia?</p>
          <div className="flex justify-center gap-3">
            {opciones.map((o) => (
              <button
                key={o.p}
                onClick={() => responder(o.p)}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-line bg-surface py-4 transition active:scale-95"
              >
                <span className="text-3xl">{o.e}</span>
                <span className="text-xs text-muted">{o.l}</span>
              </button>
            ))}
          </div>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentario (opcional)"
            className="input mt-3 h-20 resize-none"
          />
        </div>
      )}
    </div>
  );
}
