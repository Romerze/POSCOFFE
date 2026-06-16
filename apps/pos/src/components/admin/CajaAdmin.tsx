import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useLocalId } from '../../hooks/useLocalId';
import { Btn, Empty, Field, Panel, Select, TextInput, useToast } from './primitives';

export function CajaAdmin() {
  const localId = useLocalId();
  const qc = useQueryClient();
  const { show, node } = useToast();

  const cajas = useQuery({ queryKey: ['adm-cajas', localId], queryFn: () => api.listCajas(localId), enabled: !!localId });
  const turno = useQuery({ queryKey: ['adm-turno', localId], queryFn: () => api.turnoAbierto(localId), enabled: !!localId });

  const [cajaId, setCajaId] = useState('');
  const [fondo, setFondo] = useState('');
  const [contado, setContado] = useState('');
  const [z, setZ] = useState<Awaited<ReturnType<typeof api.cerrarCaja>> | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ['adm-turno', localId] });

  const abrir = async () => {
    if (!cajaId || !fondo) return show('Caja y fondo requeridos', false);
    await api.abrirTurno({ localId, cajaId, montoInicial: Number(fondo) });
    setFondo('');
    refresh();
    show('Turno abierto');
  };

  const cerrar = async () => {
    if (!turno.data || !cajaId || !contado) return show('Caja y efectivo contado requeridos', false);
    try {
      const r = await api.cerrarCaja({ turnoId: turno.data.id, cajaId, efectivoContado: Number(contado) });
      setZ(r);
      setContado('');
      refresh();
      show('Caja cerrada');
    } catch (e) {
      show(e instanceof Error ? e.message : 'Error al cerrar', false);
    }
  };

  const abierto = !!turno.data;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Turno">
        <p className="mb-3 text-sm">
          Estado:{' '}
          <span className={abierto ? 'font-semibold text-exito' : 'font-semibold text-muted'}>
            {abierto ? 'Turno abierto' : 'Sin turno'}
          </span>
        </p>
        <div className="grid gap-2">
          <Field label="Caja">
            <Select value={cajaId} onChange={(e) => setCajaId(e.target.value)}>
              <option value="">Selecciona…</option>
              {(cajas.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Select>
          </Field>
          {!abierto ? (
            <>
              <Field label="Fondo inicial"><TextInput inputMode="decimal" value={fondo} onChange={(e) => setFondo(e.target.value)} /></Field>
              <Btn onClick={abrir} className="mt-1">Abrir turno</Btn>
            </>
          ) : (
            <>
              <Field label="Efectivo contado"><TextInput inputMode="decimal" value={contado} onChange={(e) => setContado(e.target.value)} /></Field>
              <Btn onClick={cerrar} className="mt-1">Cerrar caja (reporte Z)</Btn>
            </>
          )}
          {cajas.data?.length === 0 && <Empty>No hay cajas en este local</Empty>}
        </div>
      </Panel>

      <Panel title="Último reporte Z">
        {!z ? (
          <Empty>Cierra una caja para ver el cuadre</Empty>
        ) : (
          <div className="space-y-1 text-sm">
            <p className="mb-2 font-medium text-fg">Ventas por método</p>
            {Object.entries(z.ventasPorMetodo).map(([m, v]) => (
              <div key={m} className="flex justify-between">
                <span className="capitalize text-muted">{m}</span>
                <span className="font-mono tnum text-fg">S/{Number(v).toFixed(2)}</span>
              </div>
            ))}
            <div className="my-2 border-t border-line" />
            <Row label="Esperado en efectivo" value={z.efectivoEsperado} />
            <Row label="Contado" value={z.efectivoContado} />
            <div className="flex justify-between font-semibold">
              <span className="text-fg">Diferencia</span>
              <span className={`font-mono tnum ${Number(z.diferencia) === 0 ? 'text-exito' : 'text-peligro'}`}>
                S/{Number(z.diferencia).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Panel>
      {node}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-mono tnum text-fg">S/{Number(value).toFixed(2)}</span>
    </div>
  );
}
