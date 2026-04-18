import { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string | null,
  href?: string | null,
  metadataJson?: Prisma.InputJsonValue
) {
  return prisma.notification.create({
    data: { userId, type, title, body: body ?? null, href: href ?? null, metadataJson: metadataJson ?? undefined }
  });
}

export async function createNotificationTx(
  tx: Prisma.TransactionClient,
  userId: string,
  type: NotificationType,
  title: string,
  body?: string | null,
  href?: string | null,
  metadataJson?: Prisma.InputJsonValue
) {
  return tx.notification.create({
    data: { userId, type, title, body: body ?? null, href: href ?? null, metadataJson: metadataJson ?? undefined }
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markNotificationsRead(userId: string, notificationIds?: string[]) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
      ...(notificationIds?.length ? { id: { in: notificationIds } } : {})
    },
    data: { readAt: new Date() }
  });
}
