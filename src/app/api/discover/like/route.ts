import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { createMatchForUsers } from "@/lib/matching/createMatch";
import { getOrCreateDailyUsage } from "@/lib/usage/dailyUsage";
import { getDailyProfileViewLimit } from "@/lib/usage/limits";
import { assertRecentActionWithinLimit, recordAction } from "@/lib/moderation/rateLimit";

export async function POST(request: Request) {
  const user = await requireOnboardingUser();
  const formData = await request.formData();
  const profileId = String(formData.get("profileId") ?? "").trim();

  if (!profileId) {
    return NextResponse.redirect(new URL("/discover?error=missing_profile", request.url));
  }

  const target = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true }
  });

  if (!target || target.userId === user.id) {
    return NextResponse.redirect(new URL("/discover?error=invalid_profile", request.url));
  }

  try {
    await assertRecentActionWithinLimit(user.id, "discover_like", 10, 60);
  } catch {
    return NextResponse.redirect(new URL(`/discover/${profileId}?error=rate_limited`, request.url));
  }

  const activeTier = user.subscriptions[0]?.tier ?? "FREE";
  const usage = await getOrCreateDailyUsage(user.id);
  const limit = getDailyProfileViewLimit(activeTier);
  if (Number.isFinite(limit) && usage.profileViewsUsed >= limit) {
    return NextResponse.redirect(new URL("/discover?error=limit_reached", request.url));
  }

  let matched = false;
  await prisma.$transaction(async (tx) => {
    await tx.like.upsert({
      where: {
        fromUserId_toUserId: {
          fromUserId: user.id,
          toUserId: target.userId
        }
      },
      update: { source: "GALLERY" },
      create: {
        fromUserId: user.id,
        toUserId: target.userId,
        source: "GALLERY"
      }
    });

    const reverseLike = await tx.like.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: target.userId,
          toUserId: user.id
        }
      }
    });

    if (reverseLike) {
      await createMatchForUsers(tx, user.id, target.userId, "GALLERY");
      matched = true;
    }
  });

  await recordAction(user.id, "discover_like", { profileId, matched });
  return NextResponse.redirect(new URL(matched ? "/discover?matched=1" : "/discover?liked=1", request.url));
}
