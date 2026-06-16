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
    <div className="grid h-full lg:grid-cols-[1.1fr_1fr]">
      {/* Barra del tostador — la firma de marca */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-bar p-12 text-bar-fg lg:flex">
        <div className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
          <span className="text-honey">●</span> POSCOFFE
        </div>

        <div>
          <p className="eyebrow text-honey">Punto de venta · café de especialidad</p>
          <h1 className="mt-4 font-display text-[3.5rem] font-extrabold leading-[0.95] tracking-tight">
            Cada taza,
            <br />
            <span className="text-honey">medida</span> y vendida
            <br />
            en segundos.
          </h1>
          <p className="mt-6 max-w-md text-bar-muted">
            Rápido en barra, claro para la cocina e inteligente para el dueño. La caja sigue
            funcionando aunque se caiga el internet.
          </p>
        </div>

        {/* Ficha de extracción — dato real del oficio */}
        <div className="grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-xl border border-bar-line bg-bar-line">
          {[
            ['18 g', 'dosis'],
            ['25 s', 'extracción'],
            ['1:2', 'ratio'],
          ].map(([n, l]) => (
            <div key={l} className="bg-bar px-4 py-4">
              <div className="font-mono text-2xl font-semibold tnum text-bar-fg">{n}</div>
              <div className="mt-0.5 text-xs text-bar-muted">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-fg lg:hidden">
            <span className="text-cherry">●</span> POSCOFFE
          </div>

          <h2 className="font-display text-3xl font-extrabold tracking-tight text-fg">Inicia tu turno</h2>
          <p className="mt-2 text-muted">Entra con tu cuenta para abrir la caja.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg">Correo</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className="input" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="input"
              />
            </label>
            {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Abriendo caja…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Demo · <span className="font-mono">dueno@poscoffe.dev</span> · <span className="font-mono">poscoffe123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
