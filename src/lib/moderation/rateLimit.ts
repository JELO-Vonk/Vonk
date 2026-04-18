import { prisma } from "@/lib/prisma/client";

export type RateLimitAction =
  | "discover_like"
  | "discover_pass"
  | "discover_profile_view"
  | "chat_message"
  | "report_submit";

export async function assertRecentActionWithinLimit(userId: string, action: RateLimitAction, limit: number, windowSeconds: number) {
  const since = new Date(Date.now() - windowSeconds * 1000);
  const count = await prisma.auditLog.count({
    where: {
      actorUserId: userId,
      action,
      createdAt: { gte: since }
    }
  });

  if (count >= limit) {
    throw new Error("RATE_LIMITED");
  }
}

export async function recordAction(userId: string, action: RateLimitAction, metadataJson?: unknown) {
  await prisma.auditLog.create({
    data: {
      actorUserId: userId,
      action,
      metadataJson: metadataJson as any
    }
  });
}
