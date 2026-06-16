import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useLocalId } from '../hooks/useLocalId';

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-soft">
      {title && <h3 className="mb-3 font-display font-bold tracking-tight text-fg">{title}</h3>}
      {children}
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-mono tnum text-2xl font-bold text-fg">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function InsightsScreen() {
  const localId = useLocalId();
  const enabled = !!localId;
  const dash = useQuery({ queryKey: ['dash', localId], queryFn: () => api.dashboard(localId), enabled });
  const calor = useQuery({ queryKey: ['calor', localId], queryFn: () => api.mapaCalor(localId), enabled });
  const margenes = useQuery({ queryKey: ['marg', localId], queryFn: () => api.margenes(localId), enabled });
  const quiebres = useQuery({ queryKey: ['quie', localId], queryFn: () => api.quiebres(localId), enabled });
  const ranking = useQuery({ queryKey: ['rank', localId], queryFn: () => api.ranking(localId), enabled });

  const maxHora = Math.max(1, ...(calor.data?.map((h) => h.cantidad) ?? [1]));

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ventas hoy" value={`S/${Number(dash.data?.ventas ?? 0).toFixed(2)}`} />
        <Kpi label="Pedidos hoy" value={String(dash.data?.numPedidos ?? 0)} />
        <Kpi label="Ticket prom." value={`S/${Number(dash.data?.ticketPromedio ?? 0).toFixed(2)}`} />
        <Kpi
          label="Producto top"
          value={dash.data?.productosTop?.[0]?.nombre?.split(' ')[0] ?? '—'}
          sub={dash.data?.productosTop?.[0] ? `${dash.data.productosTop[0].cantidad} vendidos` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Ventas por hora">
          {calor.data?.length ? (
            <div className="flex items-end gap-1.5" style={{ height: 132 }}>
              {calor.data.map((h) => (
                <div
                  key={h.hora}
                  className="flex flex-1 flex-col items-center justify-end"
                  title={`${h.hora}:00 · ${h.cantidad} pedidos`}
                >
                  <div
                    className="w-full rounded-t bg-accent transition-all"
                    style={{ height: `${(h.cantidad / maxHora) * 100}%`, minHeight: 4 }}
                  />
                  <span className="mt-1 font-mono text-[10px] tnum text-muted">{h.hora}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Sin datos aún.</p>
          )}
        </Card>

        <Card title="Predicción de quiebres">
          <ul className="space-y-2">
            {(quiebres.data ?? []).slice(0, 5).map((q) => (
              <li key={q.insumoId} className="flex items-center justify-between text-sm">
                <span className="text-fg">
                  {q.critico && '⚠️ '}
                  {q.nombre}
                </span>
                <span className={`font-mono tnum ${q.critico ? 'font-semibold text-peligro' : 'text-muted'}`}>
                  {q.diasRestantes != null ? `${q.diasRestantes.toFixed(0)} días` : '—'}
                </span>
              </li>
            ))}
            {quiebres.data?.length === 0 && <li className="text-sm text-muted">Sin insumos.</li>}
          </ul>
        </Card>

        <Card title="Márgenes por producto">
          <table className="w-full text-sm">
            <tbody>
              {(margenes.data ?? []).map((m) => (
                <tr key={m.varianteId} className="border-b border-line/70 last:border-0">
                  <td className="py-1.5 text-fg">{m.nombre}</td>
                  <td className="py-1.5 text-right font-mono tnum text-muted">S/{Number(m.margen).toFixed(2)}</td>
                  <td className="py-1.5 text-right font-mono tnum font-semibold text-exito">{m.margenPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Ranking de personal">
          <ul className="space-y-2">
            {(ranking.data ?? []).map((r, i) => (
              <li key={r.usuarioId ?? i} className="flex items-center justify-between text-sm">
                <span className="text-fg">
                  <span className="font-mono tnum text-muted">{i + 1}.</span> {r.nombre}
                </span>
                <span className="font-mono tnum text-muted">
                  {r.pedidos} ped · S/{Number(r.ventas).toFixed(2)}
                </span>
              </li>
            ))}
            {ranking.data?.length === 0 && <li className="text-sm text-muted">Sin ventas aún.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
