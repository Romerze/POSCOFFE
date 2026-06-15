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

  // Carga inicial (catch-up) + suscripción en tiempo real.
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

  // Refresca los cronómetros cada 15s.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const avanzar = async (o: KdsOrder) => {
    const next = SIGUIENTE[o.estado];
    if (!next) return;
    await api.updateOrderEstado(o.id, next);
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

  if (!localId) return <p className="p-6 text-[#8A7F75]">Sin local asignado.</p>;

  return (
    <div className="grid h-full grid-cols-1 gap-3 overflow-y-auto p-4 sm:grid-cols-3">
      {columnas.map((col) => (
        <section key={col.estado} className="flex flex-col">
          <h2 className="mb-2 flex items-center justify-between text-sm font-bold uppercase tracking-wide text-[#8A7F75]">
            <span>{tituloEstado(col.estado)}</span>
            <span className="rounded-full bg-latte/20 px-2 text-xs">{col.items.length}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {col.items.length === 0 && (
              <p className="rounded-xl border border-dashed border-latte/30 p-4 text-center text-xs text-[#8A7F75]">
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
  const semaforo = mins >= 8 ? 'text-peligro' : mins >= 4 ? 'text-alerta' : 'text-exito';

  return (
    <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-[#262019]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#2B2420] dark:text-[#F2EDE6]">
          {order.canal === 'qr' ? `Mesa ${order.mesa ?? '?'}` : etiquetaCanal(order.canal)}
        </span>
        <span className={`text-sm font-bold ${semaforo}`}>{mins}′</span>
      </div>
      <ul className="mb-3 space-y-1">
        {order.detalles.map((d) => (
          <li key={d.id} className="text-sm text-[#2B2420] dark:text-[#F2EDE6]">
            <span className="font-medium">{d.cantidad}×</span> {d.variante.nombre}
            {d.modificadores.length > 0 && (
              <span className="text-xs text-caramelo"> · +{d.modificadores.length} mod</span>
            )}
            {d.notas && <span className="block text-xs text-[#8A7F75]">“{d.notas}”</span>}
          </li>
        ))}
      </ul>
      <button
        onClick={onAvanzar}
        className="w-full rounded-lg bg-cafe py-2 text-sm font-semibold text-white transition hover:bg-cafe/90"
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
