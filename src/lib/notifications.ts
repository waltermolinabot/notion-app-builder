import { prisma } from './prisma';
import { auditLog } from './audit';

export type NotificationType =
  | 'app_created'
  | 'app_published'
  | 'app_unpublished'
  | 'app_deleted'
  | 'datasource_connected'
  | 'datasource_disconnected'
  | 'datasource_synced'
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'
  | 'user_added'
  | 'user_removed'
  | 'block_created'
  | 'block_updated'
  | 'block_deleted';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entityType?: string;
  entityId?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      entityType: params.entityType,
      entityId: params.entityId,
    },
  });

  // Also create audit log for important notifications
  if (['app_published', 'app_deleted', 'role_created', 'role_deleted', 'user_added', 'user_removed'].includes(params.type)) {
    await auditLog({
      action: 'notification_created',
      entityType: 'notification',
      entityId: notification.id,
      userId: params.userId,
      changes: { notification: params },
    });
  }

  return notification;
}

export async function getUserNotifications(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
  const where: Record<string, unknown> = { userId };
  
  if (options?.unreadOnly) {
    where.read = false;
  }

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId,
    },
  });
}

// Helper functions to create specific notifications
export async function notifyAppPublished(userId: string, appId: string, appName: string) {
  return createNotification({
    userId,
    type: 'app_published',
    title: 'App Published',
    message: `Your app "${appName}" has been published and is now live.`,
    link: `/apps/${appId}`,
    entityType: 'app',
    entityId: appId,
  });
}

export async function notifyUserAdded(userId: string, invitedEmail: string, appName: string, roleName: string) {
  return createNotification({
    userId,
    type: 'user_added',
    title: 'User Added',
    message: `${invitedEmail} has been added to "${appName}" as ${roleName}.`,
    link: `/apps/${userId}/settings/team`,
    entityType: 'user',
    entityId: invitedEmail,
  });
}

export async function notifyDataSourceSynced(userId: string, datasourceId: string, datasourceName: string, rowCount: number) {
  return createNotification({
    userId,
    type: 'datasource_synced',
    title: 'Data Synced',
    message: `${rowCount} rows synced from "${datasourceName}".`,
    link: `/datasources/${datasourceId}`,
    entityType: 'datasource',
    entityId: datasourceId,
  });
}
