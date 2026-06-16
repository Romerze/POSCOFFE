import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CartItem, Modificador, Producto, Variante } from '../types';

export function QrApp({ localId, mesa }: { localId: string; mesa?: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const menu = useQuery({ queryKey: ['qr-menu', localId], queryFn: () => api.qrMenu(localId) });

  const porCategoria = useMemo(() => {
    const g = new Map<string, Producto[]>();
    (menu.data?.productos ?? []).forEach((p) => g.set(p.categoria?.nombre ?? 'Menú', [...(g.get(p.categoria?.nombre ?? 'Menú') ?? []), p]));
    return [...g.entries()];
  }, [menu.data]);

  const total = cart.reduce((a, it) => a + it.precioUnit * it.cantidad, 0);

  const enviar = async () => {
    if (!cart.length) return;
    setSending(true);
    try {
      const order = await api.qrPedido(localId, { operationId: crypto.randomUUID(), canal: mesa ? 'qr' : 'pickup', mesa, items: cart.map((it) => ({ varianteId: it.varianteId, cantidad: it.cantidad, modificadorIds: it.modificadorIds })) });
      setOrderId(order.id); setCart([]);
    } finally { setSending(false); }
  };

  if (orderId) return <Confirm orderId={orderId} />;

  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-paper">
      <header className="bg-bar px-5 py-4 text-bar-fg">
        <div className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight"><span className="text-honey">●</span> POSCOFFE</div>
        <p className="mt-0.5 text-sm text-bar-muted">{mesa ? `Mesa ${mesa}` : 'Para recoger'}</p>
      </header>
      <main className="flex-1 overflow-y-auto p-5 pb-28">
        {menu.isLoading ? <p className="text-muted">Cargando menú…</p> : porCategoria.map(([cat, items]) => (
          <section key={cat} className="mb-6">
            <h2 className="eyebrow mb-2.5">{cat}</h2>
            <div className="space-y-2.5">
              {items.map((p) => {
                const desde = p.variantes.length ? Math.min(...p.variantes.map((v) => Number(v.precio))) : null;
                return (
                  <button key={p.id} onClick={() => setOpenId(p.id)} className="card flex w-full items-center justify-between p-4 text-left active:scale-[0.99]">
                    <div><div className="font-display font-bold text-fg">{p.nombre}</div>{p.descripcion && <div className="text-xs text-muted">{p.descripcion}</div>}</div>
                    {desde !== null && <span className="font-mono tnum text-sm font-semibold text-cherry">S/{desde.toFixed(2)}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-line bg-surface p-4">
          <button onClick={enviar} disabled={sending} className="btn-primary flex w-full items-center justify-between py-3.5 text-base">
            <span>{sending ? 'Enviando…' : `Enviar pedido · ${cart.length}`}</span>
            <span className="font-mono tnum">S/{total.toFixed(2)}</span>
          </button>
        </div>
      )}
      {openId && <Modal localId={localId} productoId={openId} onClose={() => setOpenId(null)} onAdd={(i) => { setCart((c) => [...c, i]); setOpenId(null); }} />}
    </div>
  );
}

function Modal({ localId, productoId, onClose, onAdd }: { localId: string; productoId: string; onClose: () => void; onAdd: (i: CartItem) => void }) {
  const { data } = useQuery({ queryKey: ['qr-prod', productoId], queryFn: () => api.qrProducto(localId, productoId) });
  const [vid, setVid] = useState('');
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const variante: Variante | undefined = data?.variantes.find((v) => v.id === vid) ?? data?.variantes[0];
  const grupos = data?.modGrupos.map((m) => m.grupo) ?? [];
  const idx = new Map<string, Modificador>();
  grupos.forEach((g) => g.modificadores.forEach((m) => idx.set(m.id, m)));
  const ids = Object.entries(sel).filter(([, v]) => v).map(([k]) => k);
  const precio = (variante ? Number(variante.precio) : 0) + ids.reduce((a, id) => a + Number(idx.get(id)?.precioExtra ?? 0), 0);

  const add = () => {
    if (!data || !variante) return;
    onAdd({ key: crypto.randomUUID(), varianteId: variante.id, productoNombre: data.nombre, varianteNombre: variante.nombre, cantidad: 1, precioUnit: precio, modificadorIds: ids, modificadorNombres: ids.map((id) => idx.get(id)?.nombre ?? '') });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-bar/55 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        {!data || !variante ? <p className="py-10 text-center text-muted">Cargando…</p> : (
          <>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-fg">{data.nombre}</h3>
            <section className="mt-4"><p className="eyebrow mb-2">Tamaño</p>
              <div className="flex flex-wrap gap-2">{data.variantes.map((v) => <button key={v.id} onClick={() => setVid(v.id)} className={`chip ${v.id === variante.id ? 'chip-on' : ''}`}>{v.nombre} · <span className="font-mono tnum">S/{Number(v.precio).toFixed(2)}</span></button>)}</div>
            </section>
            {grupos.map((g) => (
              <section key={g.id} className="mt-4"><p className="eyebrow mb-2">{g.nombre}</p>
                <div className="flex flex-wrap gap-2">{g.modificadores.map((m) => (
                  <button key={m.id} onClick={() => setSel((p) => { if (g.seleccion === 'unica') { const n = { ...p }; g.modificadores.forEach((x) => delete n[x.id]); n[m.id] = true; return n; } return { ...p, [m.id]: !p[m.id] }; })} className={`chip ${sel[m.id] ? 'chip-on-honey' : ''}`}>
                    {m.nombre}{Number(m.precioExtra) > 0 && <span className="font-mono tnum"> +{Number(m.precioExtra).toFixed(2)}</span>}
                  </button>
                ))}</div>
              </section>
            ))}
            <button onClick={add} className="btn-primary mt-6 w-full py-3.5 text-base">Agregar · <span className="font-mono tnum">S/{precio.toFixed(2)}</span></button>
          </>
        )}
      </div>
    </div>
  );
}

function Confirm({ orderId }: { orderId: string }) {
  const [done, setDone] = useState(false);
  const [comentario, setComentario] = useState('');
  const responder = async (puntaje: number) => { try { await api.encuesta({ pedidoId: orderId, puntaje, comentario: comentario || undefined }); } finally { setDone(true); } };
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center bg-paper p-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-pine/15 text-3xl">✓</div>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-fg">¡Pedido enviado!</h1>
      <p className="mt-1 text-muted">Tu código: <span className="font-mono tnum font-semibold text-cherry">{orderId.slice(-6).toUpperCase()}</span></p>
      {done ? <p className="mt-8 text-muted">¡Gracias por tu opinión!</p> : (
        <div className="mt-10 w-full">
          <p className="mb-3 text-sm font-medium text-fg">¿Cómo estuvo tu experiencia?</p>
          <div className="flex justify-center gap-3">
            {[{ p: 5, e: '😀', l: 'Excelente' }, { p: 3, e: '😐', l: 'Normal' }, { p: 1, e: '😞', l: 'Mala' }].map((o) => (
              <button key={o.p} onClick={() => responder(o.p)} className="card flex flex-1 flex-col items-center gap-1 py-4 active:scale-95"><span className="text-3xl">{o.e}</span><span className="text-xs text-muted">{o.l}</span></button>
            ))}
          </div>
          <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Comentario (opcional)" className="input mt-3 h-20 resize-none" />
        </div>
      )}
    </div>
  );
}
