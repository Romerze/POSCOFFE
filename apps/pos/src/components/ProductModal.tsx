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

  const toggleMod = (sel: 'unica' | 'multiple', mods: Modificador[], id: string) => {
    setSelectedMods((prev) => {
      if (sel === 'unica') {
        const next = { ...prev };
        mods.forEach((m) => delete next[m.id]);
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
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-lift sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading || !data ? (
          <p className="py-10 text-center text-muted">Cargando…</p>
        ) : (
          <>
            <h3 className="font-display text-xl font-bold tracking-tight text-fg">{data.nombre}</h3>
            {data.descripcion && <p className="mt-0.5 text-sm text-muted">{data.descripcion}</p>}

            <section className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tamaño</p>
              <div className="flex flex-wrap gap-2">
                {data.variantes.map((v) => (
                  <Chip key={v.id} active={v.id === varianteId} onClick={() => setVarianteId(v.id)}>
                    {v.nombre} · <span className="font-mono tnum">S/{Number(v.precio).toFixed(2)}</span>
                  </Chip>
                ))}
              </div>
            </section>

            {grupos.map((g) => (
              <section key={g.id} className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {g.nombre}
                  {g.obligatorio && <span className="text-peligro"> *</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {g.modificadores.map((m) => (
                    <Chip
                      key={m.id}
                      tone="accent"
                      active={!!selectedMods[m.id]}
                      onClick={() => toggleMod(g.seleccion, g.modificadores, m.id)}
                    >
                      {m.nombre}
                      {Number(m.precioExtra) > 0 && (
                        <span className="font-mono tnum"> +S/{Number(m.precioExtra).toFixed(2)}</span>
                      )}
                    </Chip>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-7 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-line py-3 font-medium text-fg transition hover:bg-surface2"
              >
                Cancelar
              </button>
              <button
                onClick={onAdd}
                className="flex-[2] rounded-lg bg-brand py-3 font-semibold text-brand-ink transition hover:brightness-110"
              >
                Agregar · <span className="font-mono tnum">S/{precio.toFixed(2)}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  tone = 'brand',
  onClick,
  children,
}: {
  active: boolean;
  tone?: 'brand' | 'accent';
  onClick: () => void;
  children: React.ReactNode;
}) {
  const on = tone === 'accent' ? 'bg-accent text-[rgb(26_22_19)]' : 'bg-brand text-brand-ink';
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
        active ? on : 'bg-surface2 text-fg hover:brightness-95'
      }`}
    >
      {children}
    </button>
  );
}
