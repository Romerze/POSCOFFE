import type { Role } from '@poscoffe/types';
import { useAuth } from '../store/auth';
import { useUi, type View } from '../store/ui';
import { OfflineBadge } from './OfflineBadge';
import { CashierScreen } from '../screens/CashierScreen';
import { KdsScreen } from '../screens/KdsScreen';
import { InsightsScreen } from '../screens/InsightsScreen';

const NAV: { view: View; label: string; icon: string; roles: Role[] }[] = [
  { view: 'caja', label: 'Caja', icon: '🧾', roles: ['OWNER', 'ADMIN', 'CASHIER'] },
  { view: 'kds', label: 'Barra', icon: '👨‍🍳', roles: ['OWNER', 'ADMIN', 'BARISTA'] },
  { view: 'insights', label: 'Insights', icon: '📊', roles: ['OWNER', 'ADMIN'] },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { view, setView, theme, toggleTheme } = useUi();

  const items = NAV.filter((n) => (user ? n.roles.includes(user.role) : false));
  const active = items.some((i) => i.view === view) ? view : items[0]?.view ?? 'caja';

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="flex items-center gap-5 border-b border-line bg-surface px-4 py-2.5">
        <span className="font-display text-lg font-bold tracking-tight text-brand">☕ POSCOFFE</span>

        <nav className="flex gap-1">
          {items.map((n) => (
            <button
              key={n.view}
              onClick={() => setView(n.view)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active === n.view ? 'bg-brand text-brand-ink' : 'text-fg hover:bg-surface2'
              }`}
            >
              <span className="mr-1.5">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <OfflineBadge />
          <button
            onClick={toggleTheme}
            title="Cambiar tema"
            className="rounded-lg border border-line px-2.5 py-1.5 text-sm transition hover:bg-surface2"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <span className="hidden text-sm text-fg sm:inline">
            {user?.nombre} · <span className="text-muted">{rolLabel(user?.role)}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-surface2"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {active === 'caja' && <CashierScreen />}
        {active === 'kds' && <KdsScreen />}
        {active === 'insights' && <InsightsScreen />}
      </div>
    </div>
  );
}

function rolLabel(role?: Role): string {
  const map: Record<string, string> = {
    OWNER: 'Dueño',
    ADMIN: 'Administrador',
    CASHIER: 'Cajero',
    BARISTA: 'Barista',
    CUSTOMER: 'Cliente',
  };
  return role ? map[role] ?? role : '';
}
