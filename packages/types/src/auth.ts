import type { Permission, Role } from './roles';

/** Payload del JWT de acceso. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  localId: string | null; // null = acceso multi-local (p.ej. OWNER)
  permissions: Permission[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PinLoginRequest {
  userId: string;
  pin: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  localId: string | null;
  permissions: Permission[];
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}
