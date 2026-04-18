import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateDailyUsage } from "@/lib/usage/dailyUsage";
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
    await assertRecentActionWithinLimit(user.id, "discover_pass", 20, 60);
  } catch {
    return NextResponse.redirect(new URL(`/discover/${profileId}?error=rate_limited`, request.url));
  }

  await getOrCreateDailyUsage(user.id);
  await prisma.dailyUsage.update({
    where: {
      userId_dateKey: {
        userId: user.id,
        dateKey: new Date().toISOString().slice(0, 10)
      }
    },
    data: {
      profileViewsUsed: { increment: 1 }
    }
  });
  await recordAction(user.id, "discover_pass", { profileId });

  return NextResponse.redirect(new URL("/discover?passed=1", request.url));
}
