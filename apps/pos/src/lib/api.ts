import type { LoginResponse, OrderChannel, PaymentMethod } from '@poscoffe/types';
import { useAuth } from '../store/auth';
import type { Local, Producto, ProductoDetalle } from '../types';

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
};
