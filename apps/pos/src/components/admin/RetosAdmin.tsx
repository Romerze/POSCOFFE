import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useLocalId } from '../../hooks/useLocalId';
import { Btn, Empty, Field, Panel, Select, TextInput, useToast } from './primitives';

export function RetosAdmin() {
  const localId = useLocalId();
  const qc = useQueryClient();
  const { show, node } = useToast();
  const retos = useQuery({ queryKey: ['adm-retos', localId], queryFn: () => api.listRetos(localId), enabled: !!localId });

  const [f, setF] = useState({
    nombre: '',
    tipo: 'visitas',
    objetivo: '5',
    periodoDias: '7',
    recompensaPuntos: '50',
    insignia: '☕️🔥',
  });

  const crear = async () => {
    if (!f.nombre.trim()) return show('Nombre requerido', false);
    await api.createReto({
      localId,
      nombre: f.nombre.trim(),
      tipo: f.tipo,
      objetivo: Number(f.objetivo),
      periodoDias: Number(f.periodoDias),
      recompensaPuntos: Number(f.recompensaPuntos),
      insignia: f.insignia,
    });
    qc.invalidateQueries({ queryKey: ['adm-retos', localId] });
    show('Reto creado');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Nuevo reto">
        <div className="grid gap-2">
          <Field label="Nombre"><TextInput value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Ej. 5 visitas esta semana" /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tipo">
              <Select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
                <option value="visitas">Visitas</option>
                <option value="gasto">Gasto</option>
              </Select>
            </Field>
            <Field label="Objetivo"><TextInput inputMode="decimal" value={f.objetivo} onChange={(e) => setF({ ...f, objetivo: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Periodo (días)"><TextInput inputMode="numeric" value={f.periodoDias} onChange={(e) => setF({ ...f, periodoDias: e.target.value })} /></Field>
            <Field label="Puntos"><TextInput inputMode="numeric" value={f.recompensaPuntos} onChange={(e) => setF({ ...f, recompensaPuntos: e.target.value })} /></Field>
            <Field label="Insignia"><TextInput value={f.insignia} onChange={(e) => setF({ ...f, insignia: e.target.value })} /></Field>
          </div>
          <Btn onClick={crear} className="mt-1">Crear reto</Btn>
        </div>
      </Panel>

      <Panel title="Retos">
        {retos.isLoading ? (
          <Empty>Cargando…</Empty>
        ) : retos.data?.length === 0 ? (
          <Empty>Sin retos</Empty>
        ) : (
          <div className="space-y-2">
            {(retos.data ?? []).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                <span className="font-medium text-fg">{r.insignia} {r.nombre}</span>
                <span className="text-xs text-muted">
                  {r.tipo} · <span className="font-mono tnum">{Number(r.objetivo)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
      {node}
    </div>
  );
}
