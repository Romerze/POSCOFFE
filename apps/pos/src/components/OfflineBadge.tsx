import { useOnline } from '../hooks/useOnline';

export function OfflineBadge() {
  const online = useOnline();
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-bar-muted"
      title={online ? 'Conectado al servidor' : 'Sin conexión — operando offline'}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-pine' : 'bg-honey animate-pulse'}`} />
      {online ? 'En línea' : 'Offline'}
    </span>
  );
}
