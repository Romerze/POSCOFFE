import type { Role } from '@poscoffe/types';
import { useAuth } from '../store/auth';
import { useUi, type View } from '../store/ui';
import { OfflineBadge } from './OfflineBadge';
import { CashierScreen } from '../screens/CashierScreen';
import { KdsScreen } from '../screens/KdsScreen';
import { InsightsScreen } from '../screens/InsightsScreen';

const NAV: { view: View; label: string; icon: string; roles: Role[] }[] = [
  { view: 'caja', label: 'Caja', icon: '🧾', roles: ['OWNER', 'ADMIN', 'CASHIER'] },
  { view: 'kds', label: 'Cocina', icon: '👨‍🍳', roles: ['OWNER', 'ADMIN', 'BARISTA'] },
  { view: 'insights', label: 'Insights', icon: '📊', roles: ['OWNER', 'ADMIN'] },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { view, setView, theme, toggleTheme } = useUi();

  const items = NAV.filter((n) => (user ? n.roles.includes(user.role) : false));
  const active = items.some((i) => i.view === view) ? view : items[0]?.view ?? 'caja';

  return (
    <div className="flex h-full flex-col bg-crema dark:bg-espresso">
      <header className="flex items-center gap-4 border-b border-latte/30 bg-white px-4 py-2.5 dark:bg-[#262019]">
        <h1 className="text-lg font-bold text-cafe dark:text-latte">☕ POSCOFFE</h1>

        <nav className="flex gap-1">
          {items.map((n) => (
            <button
              key={n.view}
              onClick={() => setView(n.view)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active === n.view
                  ? 'bg-cafe text-white'
                  : 'text-[#2B2420] hover:bg-latte/15 dark:text-[#F2EDE6]'
              }`}
            >
              <span className="mr-1">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <OfflineBadge />
          <button
            onClick={toggleTheme}
            title="Cambiar tema"
            className="rounded-lg border border-latte/40 px-2.5 py-1.5 text-sm"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span className="hidden text-sm text-[#2B2420] dark:text-[#F2EDE6] sm:inline">
            {user?.nombre} · <span className="text-[#8A7F75]">{user?.role}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-lg border border-latte/40 px-3 py-1.5 text-sm font-medium text-cafe dark:text-latte"
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
