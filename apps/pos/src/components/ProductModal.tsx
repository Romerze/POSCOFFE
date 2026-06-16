import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCart } from '../store/cart';
import type { Modificador, Variante } from '../types';

export function ProductModal({ productoId, onClose }: { productoId: string; onClose: () => void }) {
  const add = useCart((s) => s.add);
  const { data, isLoading } = useQuery({ queryKey: ['producto', productoId], queryFn: () => api.getProducto(productoId) });

  const [varianteId, setVarianteId] = useState('');
  const [sel, setSel] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data?.variantes.length && !varianteId) setVarianteId(data.variantes[0].id);
  }, [data, varianteId]);

  const variante: Variante | undefined = data?.variantes.find((v) => v.id === varianteId);
  const grupos = data?.modGrupos.map((m) => m.grupo) ?? [];
  const modIndex = useMemo(() => {
    const map = new Map<string, Modificador>();
    grupos.forEach((g) => g.modificadores.forEach((m) => map.set(m.id, m)));
    return map;
  }, [grupos]);

  const ids = Object.entries(sel).filter(([, v]) => v).map(([k]) => k);
  const precio = (variante ? Number(variante.precio) : 0) + ids.reduce((a, id) => a + Number(modIndex.get(id)?.precioExtra ?? 0), 0);

  const toggle = (s: 'unica' | 'multiple', mods: Modificador[], id: string) =>
    setSel((p) => {
      if (s === 'unica') {
        const n = { ...p };
        mods.forEach((m) => delete n[m.id]);
        n[id] = true;
        return n;
      }
      return { ...p, [id]: !p[id] };
    });

  const onAdd = () => {
    if (!data || !variante) return;
    add({
      varianteId: variante.id,
      productoNombre: data.nombre,
      varianteNombre: variante.nombre,
      cantidad: 1,
      precioUnit: precio,
      modificadorIds: ids,
      modificadorNombres: ids.map((id) => modIndex.get(id)?.nombre ?? ''),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-bar/55 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-lift sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {isLoading || !data ? (
          <p className="py-12 text-center text-muted">Cargando…</p>
        ) : (
          <>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-fg">{data.nombre}</h3>
            {data.descripcion && <p className="mt-1 text-sm text-muted">{data.descripcion}</p>}

            <section className="mt-5">
              <p className="eyebrow mb-2">Tamaño</p>
              <div className="flex flex-wrap gap-2">
                {data.variantes.map((v) => (
                  <button key={v.id} onClick={() => setVarianteId(v.id)} className={`chip ${v.id === varianteId ? 'chip-on' : ''}`}>
                    {v.nombre} · <span className="font-mono tnum">S/{Number(v.precio).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </section>

            {grupos.map((g) => (
              <section key={g.id} className="mt-5">
                <p className="eyebrow mb-2">{g.nombre}{g.obligatorio && <span className="text-danger"> *</span>}</p>
                <div className="flex flex-wrap gap-2">
                  {g.modificadores.map((m) => (
                    <button key={m.id} onClick={() => toggle(g.seleccion, g.modificadores, m.id)} className={`chip ${sel[m.id] ? 'chip-on-honey' : ''}`}>
                      {m.nombre}
                      {Number(m.precioExtra) > 0 && <span className="font-mono tnum"> +{Number(m.precioExtra).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-7 flex items-center gap-3">
              <button onClick={onClose} className="btn-ghost flex-1 py-3">Cancelar</button>
              <button onClick={onAdd} className="btn-primary flex-[2] py-3 text-base">
                Agregar · <span className="font-mono tnum">S/{precio.toFixed(2)}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
