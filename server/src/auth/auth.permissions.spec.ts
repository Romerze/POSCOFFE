import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, ROLES } from '@poscoffe/types';

describe('RBAC default permissions', () => {
  it('OWNER tiene todos los permisos', () => {
    expect(DEFAULT_ROLE_PERMISSIONS[ROLES.OWNER]).toEqual(
      expect.arrayContaining(Object.values(PERMISSIONS)),
    );
  });

  it('CASHIER puede vender y manejar caja pero no gestionar locales', () => {
    const perms = DEFAULT_ROLE_PERMISSIONS[ROLES.CASHIER];
    expect(perms).toContain(PERMISSIONS.SALES_CREATE);
    expect(perms).toContain(PERMISSIONS.CASH_MANAGE);
    expect(perms).not.toContain(PERMISSIONS.LOCALS_MANAGE);
  });

  it('BARISTA no tiene permisos de venta ni gestión', () => {
    expect(DEFAULT_ROLE_PERMISSIONS[ROLES.BARISTA]).toHaveLength(0);
  });
});
