import { useState } from 'react';
import { CatalogAdmin } from '../components/admin/CatalogAdmin';
import { InventoryAdmin } from '../components/admin/InventoryAdmin';
import { PromosAdmin } from '../components/admin/PromosAdmin';
import { RetosAdmin } from '../components/admin/RetosAdmin';
import { CajaAdmin } from '../components/admin/CajaAdmin';

type Tab = 'catalogo' | 'inventario' | 'promos' | 'retos' | 'caja';
const TABS: { id: Tab; label: string }[] = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'promos', label: 'Promociones' },
  { id: 'retos', label: 'Retos' },
  { id: 'caja', label: 'Caja y turno' },
];

export function AdminScreen() {
  const [tab, setTab] = useState<Tab>('catalogo');
  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 overflow-x-auto border-b border-line bg-surface px-4 py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${tab === t.id ? 'bg-cherry text-cherry-ink' : 'text-fg hover:bg-surface2'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {tab === 'catalogo' && <CatalogAdmin />}
        {tab === 'inventario' && <InventoryAdmin />}
        {tab === 'promos' && <PromosAdmin />}
        {tab === 'retos' && <RetosAdmin />}
        {tab === 'caja' && <CajaAdmin />}
      </div>
    </div>
  );
}
