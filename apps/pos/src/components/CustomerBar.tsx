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
      setError('No encontrado');
      setCliente(null);
    }
  };

  if (clienteId) {
    return (
      <div className="flex flex-wrap items-center gap-3 border-b border-line bg-brand/8 px-4 py-2 text-sm">
        <span className="font-semibold text-brand">👤 {clienteNombre}</span>
        {reco?.habitual && (
          <span className="text-muted">
            Habitual: <b className="text-fg">{reco.habitual.nombre}</b>
          </span>
        )}
        {reco?.sugerenciaNueva && (
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-medium text-accent">
            Prueba: {reco.sugerenciaNueva.nombre}
          </span>
        )}
        <button onClick={() => setCliente(null)} className="ml-auto text-xs text-muted hover:text-peligro">
          Quitar cliente
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-line px-4 py-2">
      <input
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && identificar()}
        placeholder="Teléfono del cliente"
        className="input max-w-[12rem] py-1.5"
      />
      <button
        onClick={identificar}
        className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-ink transition hover:brightness-110"
      >
        Identificar
      </button>
      {error && <span className="text-sm text-peligro">{error}</span>}
    </div>
  );
}
