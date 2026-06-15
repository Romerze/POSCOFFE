import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useLocalId } from '../hooks/useLocalId';

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-[#262019]">{children}</div>;
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-[#8A7F75]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#2B2420] dark:text-[#F2EDE6]">{value}</p>
      {sub && <p className="text-xs text-[#8A7F75]">{sub}</p>}
    </Card>
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
      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ventas hoy" value={`S/${Number(dash.data?.ventas ?? 0).toFixed(2)}`} />
        <Kpi label="Pedidos hoy" value={String(dash.data?.numPedidos ?? 0)} />
        <Kpi label="Ticket promedio" value={`S/${Number(dash.data?.ticketPromedio ?? 0).toFixed(2)}`} />
        <Kpi
          label="Producto top"
          value={dash.data?.productosTop?.[0]?.nombre?.split(' ')[0] ?? '—'}
          sub={dash.data?.productosTop?.[0] ? `${dash.data.productosTop[0].cantidad} vendidos` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Mapa de calor */}
        <Card>
          <h3 className="mb-3 font-bold text-[#2B2420] dark:text-[#F2EDE6]">Ventas por hora</h3>
          {calor.data?.length ? (
            <div className="flex items-end gap-1" style={{ height: 120 }}>
              {calor.data.map((h) => (
                <div key={h.hora} className="flex flex-1 flex-col items-center justify-end" title={`${h.hora}:00 · ${h.cantidad} pedidos`}>
                  <div
                    className="w-full rounded-t bg-caramelo"
                    style={{ height: `${(h.cantidad / maxHora) * 100}%`, minHeight: 4 }}
                  />
                  <span className="mt-1 text-[10px] text-[#8A7F75]">{h.hora}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8A7F75]">Sin datos aún.</p>
          )}
        </Card>

        {/* Predicción de quiebres */}
        <Card>
          <h3 className="mb-3 font-bold text-[#2B2420] dark:text-[#F2EDE6]">Predicción de quiebres</h3>
          <ul className="space-y-2">
            {(quiebres.data ?? []).slice(0, 5).map((q) => (
              <li key={q.insumoId} className="flex items-center justify-between text-sm">
                <span className="text-[#2B2420] dark:text-[#F2EDE6]">
                  {q.critico && '⚠️ '}
                  {q.nombre}
                </span>
                <span className={q.critico ? 'font-semibold text-peligro' : 'text-[#8A7F75]'}>
                  {q.diasRestantes != null ? `${q.diasRestantes.toFixed(0)} días` : 'sin consumo'}
                </span>
              </li>
            ))}
            {quiebres.data?.length === 0 && <li className="text-sm text-[#8A7F75]">Sin insumos.</li>}
          </ul>
        </Card>

        {/* Márgenes */}
        <Card>
          <h3 className="mb-3 font-bold text-[#2B2420] dark:text-[#F2EDE6]">Márgenes por producto</h3>
          <table className="w-full text-sm">
            <tbody>
              {(margenes.data ?? []).map((m) => (
                <tr key={m.varianteId} className="border-b border-latte/15 last:border-0">
                  <td className="py-1.5 text-[#2B2420] dark:text-[#F2EDE6]">{m.nombre}</td>
                  <td className="py-1.5 text-right text-[#8A7F75]">S/{Number(m.margen).toFixed(2)}</td>
                  <td className="py-1.5 text-right font-semibold text-exito">{m.margenPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Ranking */}
        <Card>
          <h3 className="mb-3 font-bold text-[#2B2420] dark:text-[#F2EDE6]">Ranking de personal</h3>
          <ul className="space-y-2">
            {(ranking.data ?? []).map((r, i) => (
              <li key={r.usuarioId ?? i} className="flex items-center justify-between text-sm">
                <span className="text-[#2B2420] dark:text-[#F2EDE6]">
                  {i + 1}. {r.nombre}
                </span>
                <span className="text-[#8A7F75]">
                  {r.pedidos} ped · S/{Number(r.ventas).toFixed(2)}
                </span>
              </li>
            ))}
            {ranking.data?.length === 0 && <li className="text-sm text-[#8A7F75]">Sin ventas aún.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
