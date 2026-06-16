import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useLocalId } from '../../hooks/useLocalId';
import type { Producto } from '../../types';
import { Btn, Empty, Field, Panel, Select, TextInput, useToast } from './primitives';
import { RecetaEditor } from './RecetaEditor';

export function CatalogAdmin() {
  const localId = useLocalId();
  const qc = useQueryClient();
  const { show, node } = useToast();

  const categorias = useQuery({ queryKey: ['adm-cats', localId], queryFn: () => api.listCategorias(localId), enabled: !!localId });
  const productos = useQuery({ queryKey: ['adm-prods', localId], queryFn: () => api.listProductos(localId), enabled: !!localId });

  const [catNombre, setCatNombre] = useState('');
  const [prod, setProd] = useState({ nombre: '', categoriaId: '', esCombo: false });
  const [recetaVariante, setRecetaVariante] = useState<{ id: string; nombre: string } | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['adm-prods', localId] });
    qc.invalidateQueries({ queryKey: ['productos', localId] });
  };

  const addCat = async () => {
    if (!catNombre.trim()) return;
    await api.createCategoria({ localId, nombre: catNombre.trim() });
    setCatNombre('');
    qc.invalidateQueries({ queryKey: ['adm-cats', localId] });
    show('Categoría creada');
  };

  const addProd = async () => {
    if (!prod.nombre.trim() || !prod.categoriaId) return show('Nombre y categoría requeridos', false);
    await api.createProducto({ localId, categoriaId: prod.categoriaId, nombre: prod.nombre.trim(), esCombo: prod.esCombo });
    setProd({ nombre: '', categoriaId: '', esCombo: false });
    refresh();
    show('Producto creado');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Categorías">
        <div className="mb-3 flex gap-2">
          <TextInput placeholder="Nueva categoría" value={catNombre} onChange={(e) => setCatNombre(e.target.value)} />
          <Btn onClick={addCat}>Añadir</Btn>
        </div>
        <div className="flex flex-wrap gap-2">
          {(categorias.data ?? []).map((c) => (
            <span key={c.id} className="rounded-full bg-surface2 px-3 py-1 text-sm text-fg">{c.nombre}</span>
          ))}
          {categorias.data?.length === 0 && <Empty>Sin categorías</Empty>}
        </div>
      </Panel>

      <Panel title="Nuevo producto">
        <div className="grid gap-2">
          <Field label="Nombre"><TextInput value={prod.nombre} onChange={(e) => setProd({ ...prod, nombre: e.target.value })} /></Field>
          <Field label="Categoría">
            <Select value={prod.categoriaId} onChange={(e) => setProd({ ...prod, categoriaId: e.target.value })}>
              <option value="">Selecciona…</option>
              {(categorias.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-fg">
            <input type="checkbox" checked={prod.esCombo} onChange={(e) => setProd({ ...prod, esCombo: e.target.checked })} />
            Es combo
          </label>
          <Btn onClick={addProd} className="mt-1">Crear producto</Btn>
        </div>
      </Panel>

      <div className="lg:col-span-2">
        <Panel title="Productos y variantes">
          {productos.isLoading ? (
            <Empty>Cargando…</Empty>
          ) : productos.data?.length === 0 ? (
            <Empty>Aún no hay productos</Empty>
          ) : (
            <div className="space-y-4">
              {(productos.data ?? []).map((p) => (
                <ProductoRow key={p.id} producto={p} onChange={refresh} onReceta={setRecetaVariante} onToast={show} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      {recetaVariante && (
        <RecetaEditor
          variante={recetaVariante}
          onClose={() => setRecetaVariante(null)}
          onSaved={() => { setRecetaVariante(null); refresh(); show('Receta guardada'); }}
        />
      )}
      {node}
    </div>
  );
}

function ProductoRow({
  producto,
  onChange,
  onReceta,
  onToast,
}: {
  producto: Producto;
  onChange: () => void;
  onReceta: (v: { id: string; nombre: string }) => void;
  onToast: (m: string, ok?: boolean) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');

  const addVar = async () => {
    if (!nombre.trim() || !precio) return onToast('Nombre y precio requeridos', false);
    await api.createVariante({ productoId: producto.id, nombre: nombre.trim(), precio: Number(precio) });
    setNombre('');
    setPrecio('');
    onChange();
    onToast('Variante añadida');
  };

  return (
    <div className="rounded-lg border border-line p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-display font-semibold text-fg">{producto.nombre}</span>
        {producto.esCombo && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">combo</span>}
        <span className="ml-auto text-xs text-muted">{producto.categoria?.nombre}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {producto.variantes.map((v) => (
          <button
            key={v.id}
            onClick={() => onReceta({ id: v.id, nombre: `${producto.nombre} ${v.nombre}` })}
            className="rounded-lg bg-surface2 px-3 py-1.5 text-sm text-fg transition hover:brightness-95"
            title="Editar receta"
          >
            {v.nombre} · <span className="font-mono tnum text-brand">S/{Number(v.precio).toFixed(2)}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <TextInput placeholder="Variante (ej. Grande)" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <TextInput placeholder="Precio" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} className="input py-2 max-w-[7rem]" />
        <Btn tone="ghost" onClick={addVar}>+ Variante</Btn>
      </div>
    </div>
  );
}
