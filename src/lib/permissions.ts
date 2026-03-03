// Permission types and utilities
export type Permission =
  | 'app:read'
  | 'app:write'
  | 'app:delete'
  | 'app:publish'
  | 'datasource:read'
  | 'datasource:write'
  | 'datasource:delete'
  | 'datasource:sync'
  | 'block:read'
  | 'block:write'
  | 'block:delete'
  | 'role:read'
  | 'role:write'
  | 'role:delete'
  | 'user:invite'
  | 'user:remove'
  | 'data:read'
  | 'data:write'
  | 'data:delete';

export type RoleName = 'admin' | 'editor' | 'viewer';

// Default permissions per role
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  admin: [
    'app:read', 'app:write', 'app:delete', 'app:publish',
    'datasource:read', 'datasource:write', 'datasource:delete', 'datasource:sync',
    'block:read', 'block:write', 'block:delete',
    'role:read', 'role:write', 'role:delete',
    'user:invite', 'user:remove',
    'data:read', 'data:write', 'data:delete',
  ],
  editor: [
    'app:read', 'app:write',
    'datasource:read', 'datasource:write', 'datasource:sync',
    'block:read', 'block:write',
    'role:read',
    'data:read', 'data:write',
  ],
  viewer: [
    'app:read',
    'datasource:read',
    'block:read',
    'data:read',
  ],
};

export function hasPermission(rolePermissions: Permission[], required: Permission): boolean {
  return rolePermissions.includes(required);
}

export function hasAnyPermission(rolePermissions: Permission[], required: Permission[]): boolean {
  return required.some(p => rolePermissions.includes(p));
}

export function hasAllPermissions(rolePermissions: Permission[], required: Permission[]): boolean {
  return required.every(p => rolePermissions.includes(p));
}

export function getPermissionsForRole(roleName: string): Permission[] {
  const normalizedRole = roleName.toLowerCase() as RoleName;
  return DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
}
