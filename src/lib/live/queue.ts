import { prisma } from "@/lib/prisma/client";

export async function joinVideoQueue(userId: string, filtersJson?: unknown) {
  return prisma.videoQueueSession.create({
    data: {
      userId,
      status: "WAITING",
      filtersJson: filtersJson ?? undefined
    }
  });
}

export async function leaveVideoQueue(sessionId: string) {
  return prisma.videoQueueSession.update({
    where: { id: sessionId },
    data: {
      status: "CANCELED",
      expiredAt: new Date()
    }
  });
}
