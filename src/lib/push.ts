import { prisma } from "@/lib/prisma/client";

export function getWebPushPublicKey() {
  return process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || "";
}

export async function savePushSubscription(userId: string, subscription: { endpoint: string; keys?: { p256dh?: string; auth?: string } }, userAgent?: string | null) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      p256dh: subscription.keys?.p256dh ?? "",
      auth: subscription.keys?.auth ?? "",
      userAgent: userAgent ?? null
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys?.p256dh ?? "",
      auth: subscription.keys?.auth ?? "",
      userAgent: userAgent ?? null
    }
  });
}

export async function removePushSubscription(endpoint: string, userId?: string) {
  return prisma.pushSubscription.deleteMany({
    where: { endpoint, ...(userId ? { userId } : {}) }
  });
}

export async function getPushSubscriptionCount(userId: string) {
  return prisma.pushSubscription.count({ where: { userId } });
}
