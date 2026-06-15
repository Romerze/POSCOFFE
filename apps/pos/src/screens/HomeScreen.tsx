import { useAuth } from '../store/auth';
import { OfflineBadge } from '../components/OfflineBadge';

export function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-crema dark:bg-espresso">
      <header className="flex items-center justify-between border-b border-latte/30 bg-white px-6 py-3 dark:bg-[#262019]">
        <h1 className="text-xl font-bold text-cafe dark:text-latte">☕ POSCOFFE</h1>
        <div className="flex items-center gap-4">
          <OfflineBadge />
          <span className="text-sm text-[#2B2420] dark:text-[#F2EDE6]">
            {user?.nombre} · <span className="text-[#8A7F75]">{user?.role}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-lg border border-latte/40 px-3 py-1.5 text-sm font-medium text-cafe transition hover:bg-latte/10 dark:text-latte"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <p className="text-5xl">🚧</p>
          <h2 className="mt-4 text-2xl font-bold text-[#2B2420] dark:text-[#F2EDE6]">
            Shell operativo listo
          </h2>
          <p className="mt-2 text-[#8A7F75]">
            Fase 0 completa: autenticación, RBAC y base offline-first. La pantalla de caja
            (toma de pedidos) llega en la Fase 1.
          </p>
        </div>
      </main>
    </div>
  );
}
