import { permissionMatrix } from '../data/sourceOfTruth';
import type { Permission, Role } from '../types';

export function can(role: Role, permission: Permission) {
  return permissionMatrix[role][permission];
}

export function permissionSummary(role: Role) {
  return Object.entries(permissionMatrix[role])
    .filter(([, allowed]) => allowed)
    .map(([permission]) => permission);
}
