import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { assertSafeMediaUrl } from "@/lib/moderation/fileValidation";

export async function GET() {
  const user = await requireOnboardingUser();
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: { media: { orderBy: { sortOrder: "asc" } } }
  });

  return NextResponse.json({ ok: true, profile });
}

export async function POST(request: Request) {
  const user = await requireOnboardingUser();
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "add_media").trim();

  if (intent === "update_profile_media") {
    const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;
    const introVideoUrl = String(formData.get("introVideoUrl") ?? "").trim() || null;

    if (avatarUrl) assertSafeMediaUrl(avatarUrl);
    if (introVideoUrl) assertSafeMediaUrl(introVideoUrl);

    await prisma.profile.update({
      where: { userId: user.id },
      data: { avatarUrl, introVideoUrl }
    });

    return NextResponse.redirect(new URL("/settings/photos?saved=1", request.url));
  }

  if (intent === "delete_media") {
    const mediaId = String(formData.get("mediaId") ?? "").trim();
    await prisma.profileMedia.deleteMany({
      where: {
        id: mediaId,
        profile: { userId: user.id }
      }
    });
    return NextResponse.redirect(new URL("/settings/photos?saved=1", request.url));
  }

  const type = String(formData.get("type") ?? "photo").trim().toLowerCase();
  const originalUrl = String(formData.get("originalUrl") ?? "").trim();
  const thumbUrl = String(formData.get("thumbUrl") ?? "").trim() || null;

  if (!originalUrl) {
    return NextResponse.redirect(new URL("/settings/photos?error=missing_url", request.url));
  }

  assertSafeMediaUrl(originalUrl);
  if (thumbUrl) assertSafeMediaUrl(thumbUrl);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, media: { select: { id: true } } }
  });

  if (!profile) {
    return NextResponse.redirect(new URL("/settings/photos?error=missing_profile", request.url));
  }

  await prisma.profileMedia.create({
    data: {
      profileId: profile.id,
      type: type === "video" ? "video" : "photo",
      storageKey: originalUrl,
      originalUrl,
      thumbUrl,
      sortOrder: profile.media.length
    }
  });

  return NextResponse.redirect(new URL("/settings/photos?saved=1", request.url));
}
