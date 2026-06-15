import { create } from 'zustand';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  clienteId: string | null;
  add: (item: Omit<CartItem, 'key'>) => void;
  setCantidad: (key: string, cantidad: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCliente: (id: string | null) => void;
  total: () => number;
}

let seq = 0;

export const useCart = create<CartState>((set, get) => ({
  items: [],
  clienteId: null,
  add: (item) =>
    set((s) => ({ items: [...s.items, { ...item, key: `l${++seq}` }] })),
  setCantidad: (key, cantidad) =>
    set((s) => ({
      items: s.items
        .map((it) => (it.key === key ? { ...it, cantidad } : it))
        .filter((it) => it.cantidad > 0),
    })),
  remove: (key) => set((s) => ({ items: s.items.filter((it) => it.key !== key) })),
  clear: () => set({ items: [], clienteId: null }),
  setCliente: (id) => set({ clienteId: id }),
  total: () => get().items.reduce((acc, it) => acc + it.precioUnit * it.cantidad, 0),
}));
