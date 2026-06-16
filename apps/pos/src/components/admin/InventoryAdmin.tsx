import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useLocalId } from '../../hooks/useLocalId';
import { Btn, Empty, Field, Panel, Select, TextInput, useToast } from './primitives';

export function InventoryAdmin() {
  const localId = useLocalId();
  const qc = useQueryClient();
  const { show, node } = useToast();
  const insumos = useQuery({ queryKey: ['adm-insumos'], queryFn: api.listInsumos });
  const inv = useQuery({ queryKey: ['adm-inv', localId], queryFn: () => api.listInventario(localId), enabled: !!localId });
  const alertas = useQuery({ queryKey: ['adm-alertas', localId], queryFn: () => api.alertas(localId), enabled: !!localId });

  const [nuevo, setNuevo] = useState({ nombre: '', unidad: 'g', costoUnitario: '' });
  const [mov, setMov] = useState({ insumoId: '', cantidad: '', costo: '', motivo: '' });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['adm-inv', localId] }); qc.invalidateQueries({ queryKey: ['adm-alertas', localId] }); };

  const crear = async () => {
    if (!nuevo.nombre.trim() || !nuevo.costoUnitario) return show('Falta nombre o costo', false);
    await api.createInsumo({ nombre: nuevo.nombre.trim(), unidad: nuevo.unidad, costoUnitario: Number(nuevo.costoUnitario) });
    setNuevo({ nombre: '', unidad: 'g', costoUnitario: '' });
    qc.invalidateQueries({ queryKey: ['adm-insumos'] });
    show('Insumo creado');
  };
  const reponer = async () => {
    if (!mov.insumoId || !mov.cantidad) return show('Falta insumo o cantidad', false);
    await api.reposicion({ localId, insumoId: mov.insumoId, cantidad: Number(mov.cantidad), costo: Number(mov.costo || 0) });
    refresh(); show('Reposición registrada');
  };
  const merma = async () => {
    if (!mov.insumoId || !mov.cantidad) return show('Falta insumo o cantidad', false);
    await api.merma({ localId, insumoId: mov.insumoId, cantidad: Number(mov.cantidad), motivo: mov.motivo || 'merma' });
    refresh(); show('Merma registrada');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Stock actual">
        {alertas.data && alertas.data.length > 0 && <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">⚠ {alertas.data.length} insumo(s) en stock crítico</p>}
        {inv.isLoading ? <Empty>Cargando…</Empty> : inv.data?.length === 0 ? <Empty>Sin inventario</Empty> : (
          <table className="w-full text-sm">
            <tbody>
              {(inv.data ?? []).map((i) => {
                const crit = Number(i.stockActual) <= Number(i.puntoReorden);
                return (
                  <tr key={i.insumoId} className="border-b border-dashed border-line last:border-0">
                    <td className="py-2 text-fg">{i.insumo.nombre}</td>
                    <td className={`py-2 text-right font-mono tnum ${crit ? 'font-semibold text-danger' : 'text-fg'}`}>{Number(i.stockActual).toFixed(0)} {i.insumo.unidad}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      <div className="space-y-4">
        <Panel title="Nuevo insumo">
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Nombre"><TextInput value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} /></Field>
            <Field label="Unidad"><Select value={nuevo.unidad} onChange={(e) => setNuevo({ ...nuevo, unidad: e.target.value })}><option value="g">g</option><option value="ml">ml</option><option value="u">u</option></Select></Field>
            <Field label="Costo unitario"><TextInput inputMode="decimal" value={nuevo.costoUnitario} onChange={(e) => setNuevo({ ...nuevo, costoUnitario: e.target.value })} /></Field>
          </div>
          <Btn onClick={crear} className="mt-2.5">Crear insumo</Btn>
        </Panel>
        <Panel title="Movimiento de stock">
          <div className="grid gap-2.5">
            <Field label="Insumo"><Select value={mov.insumoId} onChange={(e) => setMov({ ...mov, insumoId: e.target.value })}><option value="">Selecciona…</option>{(insumos.data ?? []).map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}</Select></Field>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Cantidad"><TextInput inputMode="decimal" value={mov.cantidad} onChange={(e) => setMov({ ...mov, cantidad: e.target.value })} /></Field>
              <Field label="Costo (reposición)"><TextInput inputMode="decimal" value={mov.costo} onChange={(e) => setMov({ ...mov, costo: e.target.value })} /></Field>
            </div>
            <Field label="Motivo (merma)"><TextInput value={mov.motivo} onChange={(e) => setMov({ ...mov, motivo: e.target.value })} /></Field>
            <div className="flex gap-2"><Btn onClick={reponer} className="flex-1">Reponer (+)</Btn><Btn tone="ghost" onClick={merma} className="flex-1">Merma (−)</Btn></div>
          </div>
        </Panel>
      </div>
      {node}
    </div>
  );
}
