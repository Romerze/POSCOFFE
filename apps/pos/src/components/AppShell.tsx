import type { Role } from '@poscoffe/types';
import { useAuth } from '../store/auth';
import { useUi, type View } from '../store/ui';
import { OfflineBadge } from './OfflineBadge';
import { CashierScreen } from '../screens/CashierScreen';
import { KdsScreen } from '../screens/KdsScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { AdminScreen } from '../screens/AdminScreen';

const NAV: { view: View; label: string; roles: Role[] }[] = [
  { view: 'caja', label: 'Caja', roles: ['OWNER', 'ADMIN', 'CASHIER'] },
  { view: 'kds', label: 'Barra', roles: ['OWNER', 'ADMIN', 'BARISTA'] },
  { view: 'insights', label: 'Insights', roles: ['OWNER', 'ADMIN'] },
  { view: 'admin', label: 'Gestión', roles: ['OWNER', 'ADMIN'] },
];

const ROL: Record<string, string> = {
  OWNER: 'Dueño',
  ADMIN: 'Administrador',
  CASHIER: 'Cajero',
  BARISTA: 'Barista',
  CUSTOMER: 'Cliente',
};

export function AppShell() {
  const { user, logout } = useAuth();
  const { view, setView, theme, toggleTheme } = useUi();

  const items = NAV.filter((n) => (user ? n.roles.includes(user.role) : false));
  const active = items.some((i) => i.view === view) ? view : items[0]?.view ?? 'caja';

  return (
    <div className="flex h-full flex-col bg-paper">
      {/* Barra del tostador */}
      <header className="flex items-center gap-6 bg-bar px-5 text-bar-fg">
        <span className="flex items-center gap-2 py-3 font-display text-lg font-extrabold tracking-tight">
          <span className="text-honey">●</span> POSCOFFE
        </span>

        <nav className="flex h-full items-stretch gap-1">
          {items.map((n) => (
            <button
              key={n.view}
              onClick={() => setView(n.view)}
              className={`relative px-3.5 text-sm font-medium transition ${
                active === n.view ? 'text-bar-fg' : 'text-bar-muted hover:text-bar-fg'
              }`}
            >
              {n.label}
              {active === n.view && (
                <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-honey" />
              )}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <OfflineBadge />
          <button
            onClick={toggleTheme}
            title="Cambiar tema"
            className="rounded-lg px-2 py-1.5 text-bar-muted transition hover:bg-bar-line hover:text-bar-fg"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium leading-tight">{user?.nombre}</div>
            <div className="text-xs text-bar-muted">{ROL[user?.role ?? ''] ?? user?.role}</div>
          </div>
          <button onClick={logout} className="rounded-lg border border-bar-line px-3 py-1.5 text-sm font-medium text-bar-fg transition hover:bg-bar-line">
            Salir
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        {active === 'caja' && <CashierScreen />}
        {active === 'kds' && <KdsScreen />}
        {active === 'insights' && <InsightsScreen />}
        {active === 'admin' && <AdminScreen />}
      </main>
    </div>
  );
}
