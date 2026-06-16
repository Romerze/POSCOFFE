import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useLocalId } from '../../hooks/useLocalId';
import { Btn, Empty, Field, Panel, Select, TextInput, useToast } from './primitives';

export function PromosAdmin() {
  const localId = useLocalId();
  const qc = useQueryClient();
  const { show, node } = useToast();
  const promos = useQuery({ queryKey: ['adm-promos', localId], queryFn: () => api.listPromos(localId), enabled: !!localId });

  const [f, setF] = useState({
    nombre: '',
    tipo: 'descuento',
    efectoTipo: 'porcentaje',
    valor: '',
    n: '2',
    m: '1',
    prioridad: '1',
    montoMinimo: '',
    franjaDesde: '',
    franjaHasta: '',
    vigenciaDesde: '2026-01-01',
    vigenciaHasta: '2026-12-31',
  });

  const crear = async () => {
    if (!f.nombre.trim()) return show('Nombre requerido', false);
    const condicion: Record<string, unknown> = {};
    if (f.montoMinimo) condicion.montoMinimo = Number(f.montoMinimo);
    if (f.franjaDesde && f.franjaHasta) condicion.franja = { desde: f.franjaDesde, hasta: f.franjaHasta };
    const efecto =
      f.tipo === 'nxm'
        ? { tipo: 'nxm', n: Number(f.n), m: Number(f.m) }
        : { tipo: f.efectoTipo, valor: Number(f.valor) };
    await api.createPromo({
      localId,
      nombre: f.nombre.trim(),
      tipo: f.tipo,
      vigenciaDesde: f.vigenciaDesde,
      vigenciaHasta: f.vigenciaHasta,
      prioridad: Number(f.prioridad),
      condicion,
      efecto,
    });
    qc.invalidateQueries({ queryKey: ['adm-promos', localId] });
    show('Promoción creada');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Nueva promoción">
        <div className="grid gap-2">
          <Field label="Nombre"><TextInput value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tipo">
              <Select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
                <option value="descuento">Descuento</option>
                <option value="hora_valle">Hora valle</option>
                <option value="nxm">NxM</option>
              </Select>
            </Field>
            <Field label="Prioridad"><TextInput inputMode="numeric" value={f.prioridad} onChange={(e) => setF({ ...f, prioridad: e.target.value })} /></Field>
          </div>

          {f.tipo === 'nxm' ? (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Lleva (n)"><TextInput inputMode="numeric" value={f.n} onChange={(e) => setF({ ...f, n: e.target.value })} /></Field>
              <Field label="Paga (m)"><TextInput inputMode="numeric" value={f.m} onChange={(e) => setF({ ...f, m: e.target.value })} /></Field>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Efecto">
                <Select value={f.efectoTipo} onChange={(e) => setF({ ...f, efectoTipo: e.target.value })}>
                  <option value="porcentaje">Porcentaje %</option>
                  <option value="monto">Monto S/</option>
                </Select>
              </Field>
              <Field label="Valor"><TextInput inputMode="decimal" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} /></Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Field label="Franja desde (HH:MM)"><TextInput placeholder="15:00" value={f.franjaDesde} onChange={(e) => setF({ ...f, franjaDesde: e.target.value })} /></Field>
            <Field label="Franja hasta (HH:MM)"><TextInput placeholder="18:00" value={f.franjaHasta} onChange={(e) => setF({ ...f, franjaHasta: e.target.value })} /></Field>
          </div>
          <Field label="Monto mínimo (opcional)"><TextInput inputMode="decimal" value={f.montoMinimo} onChange={(e) => setF({ ...f, montoMinimo: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Vigente desde"><TextInput type="date" value={f.vigenciaDesde} onChange={(e) => setF({ ...f, vigenciaDesde: e.target.value })} /></Field>
            <Field label="Vigente hasta"><TextInput type="date" value={f.vigenciaHasta} onChange={(e) => setF({ ...f, vigenciaHasta: e.target.value })} /></Field>
          </div>
          <Btn onClick={crear} className="mt-1">Crear promoción</Btn>
        </div>
      </Panel>

      <Panel title="Promociones activas">
        {promos.isLoading ? (
          <Empty>Cargando…</Empty>
        ) : promos.data?.length === 0 ? (
          <Empty>Sin promociones</Empty>
        ) : (
          <div className="space-y-2">
            {(promos.data ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
                <span className="font-medium text-fg">{p.nombre}</span>
                <span className="flex items-center gap-2 text-xs text-muted">
                  <span className="rounded-full bg-surface2 px-2 py-0.5">{p.tipo}</span>
                  <span className="font-mono tnum">P{p.prioridad}</span>
                  <span className={p.activa ? 'text-exito' : 'text-peligro'}>{p.activa ? '●' : '○'}</span>
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
