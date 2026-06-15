/** Roles base del sistema (RBAC). Ver docs/06-arquitectura.md §6.7 */
export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  CASHIER: 'CASHIER',
  BARISTA: 'BARISTA',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

/** Permisos por módulo (granularidad básica para Fase 0). */
export const PERMISSIONS = {
  CATALOG_MANAGE: 'catalog:manage',
  INVENTORY_MANAGE: 'inventory:manage',
  SALES_CREATE: 'sales:create',
  SALES_REFUND: 'sales:refund',
  CASH_MANAGE: 'cash:manage',
  REPORTS_VIEW: 'reports:view',
  USERS_MANAGE: 'users:manage',
  LOCALS_MANAGE: 'locals:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Mapa por defecto rol → permisos. El servidor puede sobreescribirlo en BD. */
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.CATALOG_MANAGE,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_REFUND,
    PERMISSIONS.CASH_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.USERS_MANAGE,
  ],
  CASHIER: [PERMISSIONS.SALES_CREATE, PERMISSIONS.CASH_MANAGE],
  BARISTA: [],
  CUSTOMER: [],
};
