import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCart } from '../store/cart';
import type { Modificador, Variante } from '../types';

export function ProductModal({ productoId, onClose }: { productoId: string; onClose: () => void }) {
  const add = useCart((s) => s.add);
  const { data, isLoading } = useQuery({
    queryKey: ['producto', productoId],
    queryFn: () => api.getProducto(productoId),
  });

  const [varianteId, setVarianteId] = useState<string>('');
  const [selectedMods, setSelectedMods] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data?.variantes.length && !varianteId) setVarianteId(data.variantes[0].id);
  }, [data, varianteId]);

  const variante: Variante | undefined = data?.variantes.find((v) => v.id === varianteId);
  const grupos = data?.modGrupos.map((mg) => mg.grupo) ?? [];

  const modIndex = useMemo(() => {
    const map = new Map<string, Modificador>();
    grupos.forEach((g) => g.modificadores.forEach((m) => map.set(m.id, m)));
    return map;
  }, [grupos]);

  const selectedIds = Object.entries(selectedMods)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const precio =
    (variante ? Number(variante.precio) : 0) +
    selectedIds.reduce((acc, id) => acc + Number(modIndex.get(id)?.precioExtra ?? 0), 0);

  const toggleMod = (grupoSeleccion: 'unica' | 'multiple', grupoMods: Modificador[], id: string) => {
    setSelectedMods((prev) => {
      if (grupoSeleccion === 'unica') {
        const next = { ...prev };
        grupoMods.forEach((m) => delete next[m.id]);
        next[id] = true;
        return next;
      }
      return { ...prev, [id]: !prev[id] };
    });
  };

  const onAdd = () => {
    if (!data || !variante) return;
    add({
      varianteId: variante.id,
      productoNombre: data.nombre,
      varianteNombre: variante.nombre,
      cantidad: 1,
      precioUnit: precio,
      modificadorIds: selectedIds,
      modificadorNombres: selectedIds.map((id) => modIndex.get(id)?.nombre ?? ''),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-6 dark:bg-[#262019] sm:rounded-2xl">
        {isLoading || !data ? (
          <p className="text-center text-[#8A7F75]">Cargando…</p>
        ) : (
          <>
            <h3 className="text-xl font-bold text-[#2B2420] dark:text-[#F2EDE6]">{data.nombre}</h3>

            <section className="mt-4">
              <p className="mb-2 text-sm font-semibold text-cafe dark:text-latte">Tamaño</p>
              <div className="flex flex-wrap gap-2">
                {data.variantes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVarianteId(v.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      v.id === varianteId
                        ? 'bg-cafe text-white'
                        : 'bg-latte/15 text-[#2B2420] dark:text-[#F2EDE6]'
                    }`}
                  >
                    {v.nombre} · S/{Number(v.precio).toFixed(2)}
                  </button>
                ))}
              </div>
            </section>

            {grupos.map((g) => (
              <section key={g.id} className="mt-4">
                <p className="mb-2 text-sm font-semibold text-cafe dark:text-latte">
                  {g.nombre}
                  {g.obligatorio && <span className="text-peligro"> *</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {g.modificadores.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleMod(g.seleccion, g.modificadores, m.id)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        selectedMods[m.id]
                          ? 'bg-caramelo text-white'
                          : 'bg-latte/15 text-[#2B2420] dark:text-[#F2EDE6]'
                      }`}
                    >
                      {m.nombre}
                      {Number(m.precioExtra) > 0 && ` +S/${Number(m.precioExtra).toFixed(2)}`}
                    </button>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-latte/40 py-3 font-medium text-cafe dark:text-latte"
              >
                Cancelar
              </button>
              <button
                onClick={onAdd}
                className="flex-[2] rounded-lg bg-cafe py-3 font-semibold text-white"
              >
                Agregar · S/{precio.toFixed(2)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
