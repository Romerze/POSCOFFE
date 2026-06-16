// Formas de datos del catálogo y pedidos que consume la app de caja.

export interface Variante {
  id: string;
  nombre: string;
  precio: string; // Decimal serializado
}

export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  imagen?: string | null;
  categoriaId: string;
  esCombo: boolean;
  variantes: Variante[];
  categoria?: Categoria;
}

export interface Modificador {
  id: string;
  nombre: string;
  precioExtra: string;
}

export interface ModificadorGrupo {
  id: string;
  nombre: string;
  seleccion: 'unica' | 'multiple';
  min: number;
  max: number | null;
  obligatorio: boolean;
  modificadores: Modificador[];
}

export interface ProductoDetalle extends Producto {
  modGrupos: { grupo: ModificadorGrupo }[];
}

export interface Local {
  id: string;
  nombre: string;
}

export interface KdsDetalle {
  id: string;
  cantidad: number;
  notas?: string | null;
  variante: { id: string; nombre: string };
  modificadores: { id: string }[];
}

export interface KdsOrder {
  id: string;
  canal: string;
  mesa?: string | null;
  estado: string;
  total: string;
  creadoEn: string;
  detalles: KdsDetalle[];
}

export interface CartItem {
  key: string; // id único de línea en el carrito
  varianteId: string;
  productoNombre: string;
  varianteNombre: string;
  cantidad: number;
  precioUnit: number; // precio base + modificadores
  modificadorIds: string[];
  modificadorNombres: string[];
}
