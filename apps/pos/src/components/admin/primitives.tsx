import { useState } from 'react';

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display font-bold tracking-tight text-fg">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="input py-2" />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="input py-2" />;
}

export function Btn({
  children,
  tone = 'brand',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'brand' | 'ghost' }) {
  const cls =
    tone === 'ghost'
      ? 'border border-line text-fg hover:bg-surface2'
      : 'bg-brand text-brand-ink hover:brightness-110';
  return (
    <button
      {...props}
      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50 ${cls} ${props.className ?? ''}`}
    >
      {children}
    </button>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted">{children}</p>;
}

/** Toast simple para confirmaciones/errores en el panel admin. */
export function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const show = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };
  const node = toast ? (
    <div
      className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full px-6 py-3 font-medium text-white shadow-lift ${
        toast.ok ? 'bg-exito' : 'bg-peligro'
      }`}
    >
      {toast.msg}
    </div>
  ) : null;
  return { show, node };
}
