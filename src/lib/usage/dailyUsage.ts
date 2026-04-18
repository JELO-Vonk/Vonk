import { prisma } from "@/lib/prisma/client";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrCreateDailyUsage(userId: string) {
  return prisma.dailyUsage.upsert({
    where: {
      userId_dateKey: {
        userId,
        dateKey: todayKey()
      }
    },
    update: {},
    create: {
      userId,
      dateKey: todayKey()
    }
  });
}
