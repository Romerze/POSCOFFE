import { useState } from 'react';
import { useAuth } from '../store/auth';
import { OfflineBadge } from '../components/OfflineBadge';

export function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('dueno@poscoffe.dev');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void login(email, password);
  };

  return (
    <div className="flex h-full items-center justify-center bg-crema p-4 dark:bg-espresso">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg dark:bg-[#262019]">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-cafe dark:text-latte">☕ POSCOFFE</h1>
          <OfflineBadge />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#2B2420] dark:text-[#F2EDE6]">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-latte/40 px-3 py-2 outline-none focus:border-cafe dark:bg-espresso dark:text-[#F2EDE6]"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#2B2420] dark:text-[#F2EDE6]">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-latte/40 px-3 py-2 outline-none focus:border-cafe dark:bg-espresso dark:text-[#F2EDE6]"
              autoComplete="current-password"
              placeholder="poscoffe123"
            />
          </div>
          {error && <p className="text-sm text-peligro">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cafe py-2.5 font-semibold text-white transition hover:bg-cafe/90 disabled:opacity-60"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-[#8A7F75]">
          Demo: dueno@poscoffe.dev / poscoffe123
        </p>
      </div>
    </div>
  );
}
