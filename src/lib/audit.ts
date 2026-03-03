import { prisma } from './prisma';

export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'published'
  | 'unpublished'
  | 'synced'
  | 'exported'
  | 'imported'
  | 'role_assigned'
  | 'role_removed'
  | 'login'
  | 'logout'
  | 'notification_created';

export type AuditEntityType =
  | 'app'
  | 'block'
  | 'datasource'
  | 'role'
  | 'user'
  | 'notification'
  | 'subscription';

interface AuditLogParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  changes?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  appId?: string;
}

export async function auditLog(params: AuditLogParams) {
  return prisma.auditLog.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: params as any,
  });
}

export async function getAuditLogs(options?: {
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  appId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (options?.entityType) {
    where.entityType = options.entityType;
  }
  if (options?.entityId) {
    where.entityId = options.entityId;
  }
  if (options?.userId) {
    where.userId = options.userId;
  }
  if (options?.appId) {
    where.appId = options.appId;
  }
  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options?.startDate) {
      (where.createdAt as Record<string, Date>).gte = options.startDate;
    }
    if (options?.endDate) {
      (where.createdAt as Record<string, Date>).lte = options.endDate;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

export async function getEntityAuditTrail(entityType: AuditEntityType, entityId: string) {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserAuditTrail(userId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: {
      userId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// Helper for logging app changes
export async function logAppChange(params: {
  action: AuditAction;
  appId: string;
  userId?: string;
  userEmail?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return auditLog({
    action: params.action,
    entityType: 'app',
    entityId: params.appId,
    userId: params.userId,
    userEmail: params.userEmail,
    changes: params.changes,
    appId: params.appId,
    ipAddress: params.ipAddress,
  });
}

// Helper for logging block changes
export async function logBlockChange(params: {
  action: AuditAction;
  blockId: string;
  appId: string;
  userId?: string;
  userEmail?: string;
  changes?: Record<string, unknown>;
}) {
  return auditLog({
    action: params.action,
    entityType: 'block',
    entityId: params.blockId,
    userId: params.userId,
    userEmail: params.userEmail,
    changes: params.changes,
    appId: params.appId,
  });
}

// Helper for logging role changes
export async function logRoleChange(params: {
  action: AuditAction;
  roleId: string;
  appId: string;
  userId?: string;
  userEmail?: string;
  changes?: Record<string, unknown>;
}) {
  return auditLog({
    action: params.action,
    entityType: 'role',
    entityId: params.roleId,
    userId: params.userId,
    userEmail: params.userEmail,
    changes: params.changes,
    appId: params.appId,
  });
}
