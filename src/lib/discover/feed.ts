import { SubscriptionTier } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { getDailyProfileViewLimit } from "@/lib/usage/limits";
import { getOrCreateDailyUsage } from "@/lib/usage/dailyUsage";

type DiscoveryFilters = {
  city?: string;
  verifiedOnly?: boolean;
};

function getCurrentTier(user: Awaited<ReturnType<typeof requireOnboardingUser>>): SubscriptionTier {
  return user.subscriptions[0]?.tier ?? "FREE";
}

export async function getDiscoveryFeed(limit = 12, filters: DiscoveryFilters = {}) {
  const currentUser = await requireOnboardingUser();
  const tier = getCurrentTier(currentUser);
  const usage = await getOrCreateDailyUsage(currentUser.id);
  const dailyLimit = getDailyProfileViewLimit(tier);
  const preferences = currentUser.preferences;

  const blocks = await prisma.block.findMany({
    where: {
      OR: [{ blockerUserId: currentUser.id }, { blockedUserId: currentUser.id }]
    },
    select: { blockerUserId: true, blockedUserId: true }
  });

  const blockedIds = new Set<string>();
  for (const row of blocks) {
    blockedIds.add(row.blockerUserId === currentUser.id ? row.blockedUserId : row.blockerUserId);
  }

  const alreadyLiked = await prisma.like.findMany({
    where: { fromUserId: currentUser.id },
    select: { toUserId: true }
  });

  const excludedIds = new Set<string>([...blockedIds, ...alreadyLiked.map((like) => like.toUserId)]);
  const remaining = Number.isFinite(dailyLimit) ? Math.max(0, dailyLimit - usage.profileViewsUsed) : null;
  const take = Number.isFinite(dailyLimit) ? Math.min(limit, remaining ?? limit) : limit;

  const allowedGenders: string[] = [];
  if (preferences?.allowMen ?? true) allowedGenders.push("MAN");
  if (preferences?.allowWomen ?? true) allowedGenders.push("WOMAN");
  if (preferences?.allowNonBinary ?? true) allowedGenders.push("NON_BINARY", "OTHER");

  const minBirthDate = preferences?.maxAge ? new Date(new Date().setFullYear(new Date().getFullYear() - preferences.maxAge - 1)) : undefined;
  const maxBirthDate = preferences?.minAge ? new Date(new Date().setFullYear(new Date().getFullYear() - preferences.minAge)) : undefined;

  const feed = await prisma.profile.findMany({
    where: {
      userId: { not: currentUser.id, notIn: [...excludedIds] },
      isVisible: true,
      isDiscoverable: true,
      visibility: { not: "HIDDEN" },
      ...(allowedGenders.length ? { gender: { in: allowedGenders as never[] } } : {}),
      ...(filters.city ? { city: { contains: filters.city, mode: "insensitive" } } : {}),
      ...((filters.verifiedOnly || preferences?.showVerifiedOnly) ? { verificationStatus: "VERIFIED" } : {}),
      ...(minBirthDate || maxBirthDate
        ? {
            birthDate: {
              ...(minBirthDate ? { gte: minBirthDate } : {}),
              ...(maxBirthDate ? { lte: maxBirthDate } : {})
            }
          }
        : {}),
      ...(preferences?.showOnlineOnly ? { user: { lastSeenAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } } } : {})
    },
    include: {
      user: {
        select: {
          lastSeenAt: true
        }
      },
      media: {
        orderBy: { sortOrder: "asc" },
        take: 1
      },
      spotlights: {
        where: { endsAt: { gt: new Date() } },
        orderBy: { endsAt: "desc" },
        take: 1
      }
    },
    orderBy: [
      { completionScore: "desc" },
      { createdAt: "desc" }
    ],
    take: take > 0 ? take : 0
  });

  return {
    currentUser,
    usage,
    tier,
    dailyLimit,
    remaining,
    filters,
    feed
  };
}
