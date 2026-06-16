import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Btn, Field, Select, TextInput } from './primitives';

interface Row {
  insumoId: string;
  cantidad: string;
}

export function RecetaEditor({
  variante,
  onClose,
  onSaved,
}: {
  variante: { id: string; nombre: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const insumos = useQuery({ queryKey: ['adm-insumos'], queryFn: api.listInsumos });
  const receta = useQuery({ queryKey: ['adm-receta', variante.id], queryFn: () => api.getReceta(variante.id) });
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (receta.data) {
      setRows(receta.data.map((r) => ({ insumoId: r.insumoId, cantidad: String(r.cantidad) })));
    }
  }, [receta.data]);

  const addRow = () => setRows((r) => [...r, { insumoId: '', cantidad: '' }]);
  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  const delRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

  const save = async () => {
    const items = rows
      .filter((r) => r.insumoId && Number(r.cantidad) > 0)
      .map((r) => ({ insumoId: r.insumoId, cantidad: Number(r.cantidad) }));
    await api.setReceta(variante.id, items);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold tracking-tight text-fg">Receta · {variante.nombre}</h3>
        <p className="mt-0.5 text-sm text-muted">Insumos y cantidad por unidad vendida. El costo se recalcula al guardar.</p>

        <div className="mt-4 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <Field label="Insumo">
                  <Select value={row.insumoId} onChange={(e) => setRow(i, { insumoId: e.target.value })}>
                    <option value="">Selecciona…</option>
                    {(insumos.data ?? []).map((ins) => (
                      <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad})</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="w-28">
                <Field label="Cantidad">
                  <TextInput inputMode="decimal" value={row.cantidad} onChange={(e) => setRow(i, { cantidad: e.target.value })} />
                </Field>
              </div>
              <button onClick={() => delRow(i)} className="pb-2 text-sm text-muted hover:text-peligro">✕</button>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted">Sin insumos. Añade al menos uno.</p>}
        </div>

        <Btn tone="ghost" onClick={addRow} className="mt-3">+ Insumo</Btn>

        <div className="mt-6 flex gap-2">
          <Btn tone="ghost" onClick={onClose} className="flex-1">Cancelar</Btn>
          <Btn onClick={save} className="flex-1">Guardar receta</Btn>
        </div>
      </div>
    </div>
  );
}
