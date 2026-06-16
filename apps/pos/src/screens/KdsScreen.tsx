import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { OrderStatus } from '@poscoffe/types';
import { api } from '../lib/api';
import { useLocalId } from '../hooks/useLocalId';
import type { KdsOrder } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:3000';

const SIGUIENTE: Record<string, OrderStatus | null> = {
  pendiente: 'en_preparacion',
  en_preparacion: 'listo',
  listo: 'entregado',
};
const LABEL_SIGUIENTE: Record<string, string> = {
  pendiente: 'Empezar',
  en_preparacion: 'Marcar listo',
  listo: 'Entregar',
};
const ACTIVOS = ['pendiente', 'en_preparacion', 'listo'];

function minutosDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

export function KdsScreen() {
  const localId = useLocalId();
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!localId) return;
    let socket: Socket | null = null;
    let cancelled = false;

    api.kdsCola(localId).then((cola) => {
      if (!cancelled) setOrders(cola);
    });

    socket = io(WS_URL, { transports: ['websocket'] });
    socket.emit('kds:join', { localId });
    const upsert = (o: KdsOrder) =>
      setOrders((prev) => {
        const rest = prev.filter((p) => p.id !== o.id);
        return ACTIVOS.includes(o.estado) ? [...rest, o] : rest;
      });
    socket.on('kds:order_created', upsert);
    socket.on('kds:order_updated', upsert);

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [localId]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const avanzar = async (o: KdsOrder) => {
    const next = SIGUIENTE[o.estado];
    if (next) await api.updateOrderEstado(o.id, next);
  };

  const columnas = useMemo(
    () =>
      ACTIVOS.map((estado) => ({
        estado,
        items: orders
          .filter((o) => o.estado === estado)
          .sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime()),
      })),
    [orders],
  );

  if (!localId) return <p className="p-6 text-muted">Sin local asignado.</p>;

  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-3">
      {columnas.map((col) => (
        <section key={col.estado} className="flex min-w-0 flex-col">
          <h2 className="mb-3 flex items-center justify-between font-display text-sm font-bold uppercase tracking-wider text-muted">
            <span>{tituloEstado(col.estado)}</span>
            <span className="rounded-full bg-surface2 px-2 py-0.5 font-mono text-xs tnum text-fg">
              {col.items.length}
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {col.items.length === 0 && (
              <p className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-muted">
                Vacío
              </p>
            )}
            {col.items.map((o) => (
              <OrderCard key={o.id} order={o} onAvanzar={() => avanzar(o)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function OrderCard({ order, onAvanzar }: { order: KdsOrder; onAvanzar: () => void }) {
  const mins = minutosDesde(order.creadoEn);
  const tone = mins >= 8 ? 'text-peligro' : mins >= 4 ? 'text-alerta' : 'text-exito';
  const ring = mins >= 8 ? 'border-l-peligro' : mins >= 4 ? 'border-l-alerta' : 'border-l-exito';

  return (
    <div className={`rounded-xl border border-line border-l-4 ${ring} bg-surface p-3.5 shadow-soft`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-fg">
          {order.canal === 'qr' ? `Mesa ${order.mesa ?? '?'}` : etiquetaCanal(order.canal)}
        </span>
        <span className={`font-mono tnum text-sm font-bold ${tone}`}>{mins}′</span>
      </div>
      <ul className="mb-3 space-y-1.5">
        {order.detalles.map((d) => (
          <li key={d.id} className="text-sm text-fg">
            <span className="font-mono tnum font-semibold text-brand">{d.cantidad}×</span> {d.variante.nombre}
            {d.modificadores.length > 0 && (
              <span className="text-xs text-accent"> · +{d.modificadores.length} mod</span>
            )}
            {d.notas && <span className="block text-xs italic text-muted">“{d.notas}”</span>}
          </li>
        ))}
      </ul>
      <button
        onClick={onAvanzar}
        className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-ink transition hover:brightness-110"
      >
        {LABEL_SIGUIENTE[order.estado] ?? 'Avanzar'}
      </button>
    </div>
  );
}

function tituloEstado(e: string): string {
  return e === 'pendiente' ? 'Pendientes' : e === 'en_preparacion' ? 'En preparación' : 'Listos';
}
function etiquetaCanal(c: string): string {
  return c === 'pickup' ? 'Pick-up' : c === 'delivery' ? 'Delivery' : 'Mostrador';
}
