import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCart } from '../store/cart';

export function CustomerBar() {
  const { clienteId, clienteNombre, setCliente } = useCart();
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: reco } = useQuery({
    queryKey: ['reco', clienteId],
    queryFn: () => api.recomendaciones(clienteId!),
    enabled: !!clienteId,
  });

  const identificar = async () => {
    setError(null);
    try {
      const c = await api.identificarCliente(telefono.trim());
      setCliente(c.id, c.nombre);
    } catch {
      setError('Sin coincidencias');
      setCliente(null);
    }
  };

  if (clienteId) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-surface px-4 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-semibold text-fg">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-cherry/12 text-xs text-cherry">
            {clienteNombre?.[0] ?? '·'}
          </span>
          {clienteNombre}
        </span>
        {reco?.habitual && (
          <span className="text-muted">
            Su habitual: <b className="text-fg">{reco.habitual.nombre}</b>
          </span>
        )}
        {reco?.sugerenciaNueva && (
          <span className="rounded-full bg-honey/15 px-2.5 py-0.5 text-xs font-medium text-honey">
            Ofrécele {reco.sugerenciaNueva.nombre}
          </span>
        )}
        <button onClick={() => setCliente(null)} className="ml-auto text-xs text-muted hover:text-danger">
          Quitar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
      <span className="eyebrow hidden sm:block">Cliente</span>
      <input
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && identificar()}
        placeholder="Teléfono para reconocerlo"
        className="input max-w-[15rem] py-1.5"
      />
      <button onClick={identificar} className="btn-ghost py-1.5">Buscar</button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}
