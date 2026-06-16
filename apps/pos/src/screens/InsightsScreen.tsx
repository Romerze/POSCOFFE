import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useLocalId } from '../hooks/useLocalId';

export function InsightsScreen() {
  const localId = useLocalId();
  const on = !!localId;
  const dash = useQuery({ queryKey: ['dash', localId], queryFn: () => api.dashboard(localId), enabled: on });
  const calor = useQuery({ queryKey: ['calor', localId], queryFn: () => api.mapaCalor(localId), enabled: on });
  const marg = useQuery({ queryKey: ['marg', localId], queryFn: () => api.margenes(localId), enabled: on });
  const quie = useQuery({ queryKey: ['quie', localId], queryFn: () => api.quiebres(localId), enabled: on });
  const rank = useQuery({ queryKey: ['rank', localId], queryFn: () => api.ranking(localId), enabled: on });
  const maxH = Math.max(1, ...(calor.data?.map((h) => h.cantidad) ?? [1]));

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ventas hoy" value={`S/${Number(dash.data?.ventas ?? 0).toFixed(2)}`} />
        <Kpi label="Pedidos hoy" value={String(dash.data?.numPedidos ?? 0)} />
        <Kpi label="Ticket promedio" value={`S/${Number(dash.data?.ticketPromedio ?? 0).toFixed(2)}`} />
        <Kpi label="Producto top" value={dash.data?.productosTop?.[0]?.nombre?.split(' ')[0] ?? '—'} sub={dash.data?.productosTop?.[0] ? `${dash.data.productosTop[0].cantidad} vendidos` : ' '} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="eyebrow mb-4">Ventas por hora</h3>
          {calor.data?.length ? (
            <div className="flex items-end gap-1.5" style={{ height: 140 }}>
              {calor.data.map((h) => (
                <div key={h.hora} className="flex flex-1 flex-col items-center justify-end gap-1.5" title={`${h.hora}:00 · ${h.cantidad}`}>
                  <div className="w-full rounded-t-md bg-cherry/85" style={{ height: `${(h.cantidad / maxH) * 100}%`, minHeight: 4 }} />
                  <span className="font-mono text-[10px] tnum text-muted">{h.hora}</span>
                </div>
              ))}
            </div>
          ) : <Muted>Sin datos del periodo.</Muted>}
        </div>

        <div className="card p-5">
          <h3 className="eyebrow mb-4">Riesgo de quiebre</h3>
          <ul className="space-y-2.5">
            {(quie.data ?? []).slice(0, 5).map((q) => (
              <li key={q.insumoId} className="flex items-center justify-between text-sm">
                <span className="text-fg">{q.critico && '⚠ '}{q.nombre}</span>
                <span className={`font-mono tnum ${q.critico ? 'font-semibold text-danger' : 'text-muted'}`}>{q.diasRestantes != null ? `${q.diasRestantes.toFixed(0)} días` : '—'}</span>
              </li>
            ))}
            {quie.data?.length === 0 && <Muted>Sin insumos registrados.</Muted>}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="eyebrow mb-4">Margen por producto</h3>
          <table className="w-full text-sm">
            <tbody>
              {(marg.data ?? []).map((m) => (
                <tr key={m.varianteId} className="border-b border-dashed border-line last:border-0">
                  <td className="py-2 text-fg">{m.nombre}</td>
                  <td className="py-2 text-right font-mono tnum text-muted">S/{Number(m.margen).toFixed(2)}</td>
                  <td className="py-2 pl-3 text-right font-mono tnum font-semibold text-pine">{m.margenPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h3 className="eyebrow mb-4">Ranking de personal</h3>
          <ul className="space-y-2.5">
            {(rank.data ?? []).map((r, i) => (
              <li key={r.usuarioId ?? i} className="flex items-center justify-between text-sm">
                <span className="text-fg"><span className="mr-1.5 font-mono tnum text-muted">{i + 1}</span>{r.nombre}</span>
                <span className="font-mono tnum text-muted">{r.pedidos} ped · S/{Number(r.ventas).toFixed(2)}</span>
              </li>
            ))}
            {rank.data?.length === 0 && <Muted>Sin ventas en el periodo.</Muted>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-extrabold tnum text-fg">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}
function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
