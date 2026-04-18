import { SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { createVideoCall } from "@/lib/live/matchVideoPair";
import { getOrCreateDailyUsage } from "@/lib/usage/dailyUsage";
import { canUseVideoConnects, getTierDefaults } from "@/lib/billing/entitlements";

function getActiveTier(tier: SubscriptionTier | null | undefined): SubscriptionTier {
  return tier ?? "FREE";
}

export async function getCurrentActiveCallForUser(userId: string) {
  return prisma.videoCall.findFirst({
    where: {
      endedAt: null,
      OR: [{ callerUserId: userId }, { calleeUserId: userId }]
    },
    orderBy: { startedAt: "desc" },
    include: {
      caller: { include: { profile: true } },
      callee: { include: { profile: true } }
    }
  });
}

export async function getCurrentWaitingSessionForUser(userId: string) {
  return prisma.videoQueueSession.findFirst({
    where: { userId, status: "WAITING" },
    orderBy: { enteredAt: "desc" }
  });
}

export async function getLiveStatusForUser(userId: string) {
  const [queueSession, call] = await Promise.all([
    getCurrentWaitingSessionForUser(userId),
    getCurrentActiveCallForUser(userId)
  ]);

  if (!call) {
    return { queueSession, call: null };
  }

  const isCaller = call.callerUserId === userId;
  const peer = isCaller ? call.callee : call.caller;

  return {
    queueSession,
    call: {
      id: call.id,
      signalingRoomKey: call.signalingRoomKey,
      startedAt: call.startedAt,
      isCaller,
      peer: peer
        ? {
            userId: peer.id,
            profileId: peer.profile?.id ?? null,
            displayName: peer.profile?.displayName ?? peer.email,
            avatarUrl: peer.profile?.avatarUrl ?? null,
            city: peer.profile?.city ?? null,
            verificationStatus: peer.profile?.verificationStatus ?? "UNVERIFIED"
          }
        : null
    }
  };
}

export async function joinVideoQueue(userId: string, filtersJson?: unknown) {
  const existingCall = await getCurrentActiveCallForUser(userId);
  if (existingCall) {
    return { queueSession: null, call: existingCall, matched: false, reason: "already_in_call" as const };
  }

  const existingWaiting = await getCurrentWaitingSessionForUser(userId);
  if (existingWaiting) {
    return { queueSession: existingWaiting, call: null, matched: false, reason: "already_waiting" as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        orderBy: [{ currentPeriodEnd: "desc" }, { createdAt: "desc" }],
        take: 1
      }
    }
  });

  const tier = getActiveTier(user?.subscriptions[0]?.tier);
  const limits = getTierDefaults(tier);
  const usage = await getOrCreateDailyUsage(userId);

  if (!canUseVideoConnects(usage.videoConnectsUsed, limits.videoConnectsDailyLimit)) {
    return { queueSession: null, call: null, matched: false, reason: "video_limit_reached" as const };
  }

  await prisma.videoQueueSession.updateMany({
    where: { userId, status: "WAITING" },
    data: { status: "CANCELED", expiredAt: new Date() }
  });

  const queueSession = await prisma.videoQueueSession.create({
    data: {
      userId,
      status: "WAITING",
      filtersJson: filtersJson ?? undefined
    }
  });

  const candidate = await prisma.videoQueueSession.findFirst({
    where: {
      status: "WAITING",
      userId: { not: userId }
    },
    orderBy: { enteredAt: "asc" }
  });

  if (!candidate) {
    return { queueSession, call: null, matched: false, reason: null };
  }

  const call = await prisma.$transaction(async (tx) => {
    await tx.videoQueueSession.updateMany({
      where: { id: { in: [queueSession.id, candidate.id] }, status: "WAITING" },
      data: { status: "MATCHED", matchedAt: new Date() }
    });

    await tx.dailyUsage.upsert({
      where: { userId_dateKey: { userId, dateKey: usage.dateKey } },
      update: { videoConnectsUsed: { increment: 1 } },
      create: { userId, dateKey: usage.dateKey, videoConnectsUsed: 1 }
    });

    const candidateUsage = await tx.dailyUsage.upsert({
      where: {
        userId_dateKey: {
          userId: candidate.userId,
          dateKey: usage.dateKey
        }
      },
      update: { videoConnectsUsed: { increment: 1 } },
      create: { userId: candidate.userId, dateKey: usage.dateKey, videoConnectsUsed: 1 }
    });
    void candidateUsage;

    return createVideoCall(userId, candidate.userId, tx);
  });

  return { queueSession, call, matched: true, reason: null };
}

export async function leaveVideoQueue(sessionId: string, userId: string) {
  return prisma.videoQueueSession.updateMany({
    where: { id: sessionId, userId, status: "WAITING" },
    data: {
      status: "CANCELED",
      expiredAt: new Date()
    }
  });
}


export async function getQueueSessionStatus(sessionId: string, userId: string) {
  const [session, status] = await Promise.all([
    prisma.videoQueueSession.findFirst({ where: { id: sessionId, userId } }),
    getLiveStatusForUser(userId)
  ]);
  return {
    session: session ? { id: session.id, status: session.status } : null,
    call: status.call
  };
}
