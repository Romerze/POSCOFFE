import type { LoginResponse, OrderChannel, OrderStatus, PaymentMethod } from '@poscoffe/types';
import { useAuth } from '../store/auth';
import type { KdsOrder, Local, Producto, ProductoDetalle } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuth.getState().accessToken;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      // sin cuerpo JSON
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface CreateOrderPayload {
  operationId: string;
  localId: string;
  clienteId?: string;
  canal: OrderChannel;
  items: { varianteId: string; cantidad: number; notas?: string; modificadorIds?: string[] }[];
}

export interface CreatePaymentPayload {
  metodo: PaymentMethod;
  monto: number;
  propina?: number;
}

export interface PromoEvalResult {
  descuento: number;
  aplicada: { id: string; nombre: string } | null;
}

export interface ClienteIdentificado {
  id: string;
  nombre: string;
  esVip: boolean;
  fidelizacion?: { puntos: number; nivel: string } | null;
}

export interface Recomendaciones {
  habitual: { varianteId: string; nombre: string; veces: number } | null;
  frecuentes: { varianteId: string; nombre: string; veces: number }[];
  sugerenciaNueva: { varianteId: string; nombre: string } | null;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  health: () => request<{ status: string; db: string }>('/health'),

  listLocals: () => request<Local[]>('/locals'),

  listProductos: (localId: string) =>
    request<Producto[]>(`/productos?local=${encodeURIComponent(localId)}`),

  getProducto: (id: string) => request<ProductoDetalle>(`/productos/${id}`),

  createOrder: (payload: CreateOrderPayload) =>
    request<{ id: string; total: string }>('/pedidos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  addPayment: (orderId: string, payload: CreatePaymentPayload) =>
    request(`/pedidos/${orderId}/pagos`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  evaluarPromos: (localId: string, items: { varianteId: string; cantidad: number; precioUnit: number }[]) =>
    request<PromoEvalResult>('/carrito/evaluar-promos', {
      method: 'POST',
      body: JSON.stringify({ localId, items }),
    }),

  identificarCliente: (telefono: string) =>
    request<ClienteIdentificado>(`/clientes/identificar?telefono=${encodeURIComponent(telefono)}`),

  recomendaciones: (clienteId: string) =>
    request<Recomendaciones>(`/clientes/${clienteId}/recomendaciones`),

  kdsCola: (localId: string) =>
    request<KdsOrder[]>(`/kds/cola?local=${encodeURIComponent(localId)}`),

  updateOrderEstado: (id: string, estado: OrderStatus) =>
    request<KdsOrder>(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),

  // Reportes (dueño/admin)
  dashboard: (localId: string) =>
    request<DashboardKpis>(`/dashboard/kpis?local=${encodeURIComponent(localId)}`),
  mapaCalor: (localId: string) =>
    request<{ hora: number; cantidad: number; ventas: string }[]>(
      `/reportes/mapa-calor?local=${encodeURIComponent(localId)}`,
    ),
  margenes: (localId: string) =>
    request<{ varianteId: string; nombre: string; precio: string; costo: string; margen: string; margenPct: number }[]>(
      `/reportes/margenes?local=${encodeURIComponent(localId)}`,
    ),
  quiebres: (localId: string) =>
    request<{ insumoId: string; nombre: string; stockActual: string; diasRestantes: number | null; critico: boolean }[]>(
      `/reportes/quiebres?local=${encodeURIComponent(localId)}`,
    ),
  ranking: (localId: string) =>
    request<{ usuarioId: string | null; nombre: string; pedidos: number; ventas: string }[]>(
      `/reportes/ranking?local=${encodeURIComponent(localId)}`,
    ),
};

export interface DashboardKpis {
  ventas: string;
  numPedidos: number;
  ticketPromedio: string;
  productosTop: { varianteId: string; nombre: string; cantidad: number }[];
}
