import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { OrderStatus } from '@poscoffe/types';
import { api } from '../lib/api';
import { useLocalId } from '../hooks/useLocalId';
import type { KdsOrder } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000';
const SIGUIENTE: Record<string, OrderStatus | null> = { pendiente: 'en_preparacion', en_preparacion: 'listo', listo: 'entregado' };
const LABEL: Record<string, string> = { pendiente: 'Empezar', en_preparacion: 'Marcar listo', listo: 'Entregar' };
const COLS = [
  { estado: 'pendiente', titulo: 'Pendientes' },
  { estado: 'en_preparacion', titulo: 'En preparación' },
  { estado: 'listo', titulo: 'Listos' },
];
const ACTIVOS = COLS.map((c) => c.estado);

const mins = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

export function KdsScreen() {
  const localId = useLocalId();
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!localId) return;
    let socket: Socket | null = null;
    let cancelled = false;
    api.kdsCola(localId).then((c) => !cancelled && setOrders(c));
    socket = io(WS_URL, { transports: ['websocket'] });
    socket.emit('kds:join', { localId });
    const upsert = (o: KdsOrder) =>
      setOrders((prev) => {
        const rest = prev.filter((p) => p.id !== o.id);
        return ACTIVOS.includes(o.estado) ? [...rest, o] : rest;
      });
    socket.on('kds:order_created', upsert);
    socket.on('kds:order_updated', upsert);
    return () => { cancelled = true; socket?.disconnect(); };
  }, [localId]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const avanzar = async (o: KdsOrder) => {
    const n = SIGUIENTE[o.estado];
    if (n) await api.updateOrderEstado(o.id, n);
  };

  const cols = useMemo(
    () => COLS.map((c) => ({ ...c, items: orders.filter((o) => o.estado === c.estado).sort((a, b) => +new Date(a.creadoEn) - +new Date(b.creadoEn)) })),
    [orders],
  );

  if (!localId) return <p className="p-6 text-muted">Sin local asignado.</p>;

  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto p-5 sm:grid-cols-3">
      {cols.map((col) => (
        <section key={col.estado} className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="eyebrow">{col.titulo}</h2>
            <span className="rounded-full bg-surface2 px-2 py-0.5 font-mono text-xs tnum text-fg">{col.items.length}</span>
          </div>
          <div className="flex flex-col gap-3">
            {col.items.length === 0 && (
              <p className="rounded-xl border border-dashed border-line py-6 text-center text-xs text-muted">Vacío</p>
            )}
            {col.items.map((o) => <Card key={o.id} order={o} onAvanzar={() => avanzar(o)} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function Card({ order, onAvanzar }: { order: KdsOrder; onAvanzar: () => void }) {
  const m = mins(order.creadoEn);
  const spine = m >= 8 ? 'bg-danger' : m >= 4 ? 'bg-honey' : 'bg-pine';
  const time = m >= 8 ? 'text-danger' : m >= 4 ? 'text-honey' : 'text-pine';
  const canal = order.canal === 'qr' ? `Mesa ${order.mesa ?? '?'}` : order.canal === 'pickup' ? 'Pick-up' : order.canal === 'delivery' ? 'Delivery' : 'Mostrador';
  return (
    <div className="card relative overflow-hidden p-4 pl-5">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${spine}`} />
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display font-bold text-fg">{canal}</span>
        <span className={`font-mono tnum text-sm font-semibold ${time}`}>{m}′</span>
      </div>
      <ul className="mb-3 space-y-1.5">
        {order.detalles.map((d) => (
          <li key={d.id} className="text-sm text-fg">
            <span className="font-mono tnum font-semibold text-cherry">{d.cantidad}×</span> {d.variante.nombre}
            {d.modificadores.length > 0 && <span className="text-xs text-honey"> · +{d.modificadores.length} mod</span>}
            {d.notas && <span className="block text-xs italic text-muted">"{d.notas}"</span>}
          </li>
        ))}
      </ul>
      <button onClick={onAvanzar} className="btn-primary w-full py-2.5">{LABEL[order.estado] ?? 'Avanzar'}</button>
    </div>
  );
}
