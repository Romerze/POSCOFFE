import { useState } from 'react';
import { useAuth } from '../store/auth';

export function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('dueno@poscoffe.dev');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void login(email, password);
  };

  return (
    <div className="grid h-full lg:grid-cols-2">
      {/* Panel de marca — la firma: el oficio en gramos y segundos. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-12 text-brand-ink lg:flex">
        <div className="font-display text-2xl font-bold tracking-tight">☕ POSCOFFE</div>
        <div>
          <p className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
            La barra,
            <br />
            afinada.
          </p>
          <p className="mt-5 max-w-sm text-brand-ink/75">
            Punto de venta para cafeterías que miden cada shot: rápido en barra, inteligente para el dueño.
          </p>
        </div>
        <div className="flex gap-8 font-mono text-sm text-brand-ink/70">
          <div>
            <div className="text-2xl font-semibold text-brand-ink tnum">18g</div>
            dosis
          </div>
          <div>
            <div className="text-2xl font-semibold text-brand-ink tnum">25s</div>
            extracción
          </div>
          <div>
            <div className="text-2xl font-semibold text-brand-ink tnum">1:2</div>
            ratio
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-display text-2xl font-bold tracking-tight text-brand">☕ POSCOFFE</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Inicia turno</h1>
          <p className="mt-1 text-sm text-muted">Ingresa con tu cuenta para abrir la caja.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field label="Correo">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="input"
              />
            </Field>
            <Field label="Contraseña">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="input"
              />
            </Field>
            {error && (
              <p className="rounded-lg bg-peligro/10 px-3 py-2 text-sm text-peligro">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-3 font-semibold text-brand-ink transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? 'Ingresando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Demo · <span className="font-mono">dueno@poscoffe.dev</span> / <span className="font-mono">poscoffe123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}
