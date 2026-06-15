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
      <div className="flex flex-wrap items-center gap-3 border-b border-latte/30 bg-latte/10 px-4 py-2 text-sm">
        <span className="font-semibold text-cafe dark:text-latte">👤 {clienteNombre}</span>
        {reco?.habitual && (
          <span className="text-[#8A7F75]">
            Habitual: <b className="text-[#2B2420] dark:text-[#F2EDE6]">{reco.habitual.nombre}</b>
          </span>
        )}
        {reco?.sugerenciaNueva && (
          <span className="rounded-full bg-caramelo/15 px-2 py-0.5 text-caramelo">
            Prueba: {reco.sugerenciaNueva.nombre}
          </span>
        )}
        <button onClick={() => setCliente(null)} className="ml-auto text-xs text-peligro">
          Quitar cliente
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-latte/30 px-4 py-2">
      <input
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && identificar()}
        placeholder="Teléfono del cliente"
        className="w-48 rounded-lg border border-latte/40 px-3 py-1.5 text-sm outline-none focus:border-cafe dark:bg-espresso dark:text-[#F2EDE6]"
      />
      <button
        onClick={identificar}
        className="rounded-lg bg-cafe px-3 py-1.5 text-sm font-medium text-white"
      >
        Identificar
      </button>
      {error && <span className="text-sm text-peligro">{error}</span>}
    </div>
  );
}
