import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type RoleName = 'Administrador' | 'Tecnico' | 'Empleado' | string;
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);

