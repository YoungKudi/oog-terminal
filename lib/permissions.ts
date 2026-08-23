export const PERMISSIONS = {
  // Container permissions
  CONTAINER_READ: 'container:read',
  CONTAINER_CREATE: 'container:create',
  CONTAINER_UPDATE: 'container:update',
  CONTAINER_DELETE: 'container:delete',
  CONTAINER_CLEAR: 'container:clear',
  
  // Devanning permissions
  DEVANNING_READ: 'devanning:read',
  DEVANNING_CREATE: 'devanning:create',
  DEVANNING_UPDATE: 'devanning:update',
  DEVANNING_UNSTUFF: 'devanning:unstuff',
  
  // User permissions
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Admin permissions
  ADMIN_CLEAR: 'admin:clear',
  ADMIN_BACKUP: 'admin:backup',
  ADMIN_RESTORE: 'admin:restore',
}

export const ROLE_PERMISSIONS = {
  user: [
    PERMISSIONS.CONTAINER_READ,
    PERMISSIONS.CONTAINER_CREATE,
    PERMISSIONS.DEVANNING_READ,
    PERMISSIONS.DEVANNING_CREATE,
  ],
  officer: [
    ...ROLE_PERMISSIONS.user,
    PERMISSIONS.CONTAINER_UPDATE,
    PERMISSIONS.CONTAINER_DELETE,
    PERMISSIONS.DEVANNING_UPDATE,
    PERMISSIONS.DEVANNING_UNSTUFF,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.ADMIN_CLEAR,
    PERMISSIONS.ADMIN_BACKUP,
    PERMISSIONS.ADMIN_RESTORE,
  ],
  admin: [
    ...ROLE_PERMISSIONS.officer,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.CONTAINER_CLEAR,
  ],
}

export function hasPermission(role: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}
