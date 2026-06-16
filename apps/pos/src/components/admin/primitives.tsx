import { useState } from 'react';

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h3 className="eyebrow mb-4">{title}</h3>
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

export const TextInput = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`input py-2 ${p.className ?? ''}`} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className="input py-2" />;

export function Btn({ children, tone = 'brand', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'brand' | 'ghost' }) {
  return (
    <button {...p} className={`${tone === 'ghost' ? 'btn-ghost' : 'btn-primary'} ${p.className ?? ''}`}>
      {children}
    </button>
  );
}

export const Empty = ({ children }: { children: React.ReactNode }) => <p className="py-6 text-center text-sm text-muted">{children}</p>;

export function useToast() {
  const [t, setT] = useState<{ msg: string; ok: boolean } | null>(null);
  const show = (msg: string, ok = true) => {
    setT({ msg, ok });
    setTimeout(() => setT(null), 2800);
  };
  const node = t ? (
    <div className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full px-6 py-3 font-medium text-white shadow-lift ${t.ok ? 'bg-pine' : 'bg-danger'}`}>{t.msg}</div>
  ) : null;
  return { show, node };
}
