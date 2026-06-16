import { useOnline } from '../hooks/useOnline';

/** Indicador persistente de conectividad (parte del shell offline-first). */
export function OfflineBadge() {
  const online = useOnline();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        online ? 'bg-exito/12 text-exito' : 'bg-alerta/15 text-alerta'
      }`}
      title={online ? 'Conectado al servidor' : 'Sin conexión — operando en modo offline'}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-exito' : 'bg-alerta animate-pulse'}`} />
      {online ? 'En línea' : 'Offline'}
    </span>
  );
}
