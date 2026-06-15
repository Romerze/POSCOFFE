import { SetMetadata } from '@nestjs/common';
import type { Permission, Role } from '@poscoffe/types';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

/** Restringe un endpoint a roles concretos. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** Restringe un endpoint a quien tenga todos los permisos indicados. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
