import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const user = await requireUser();
  const fresh = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      preferences: true,
      subscriptions: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return NextResponse.json({ ok: true, user: fresh });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const formData = await request.formData();

  const displayName = String(formData.get("displayName") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const gender = String(formData.get("gender") ?? "MAN").trim();
  const interestedIn = String(formData.get("interestedIn") ?? "EVERYONE").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  if (!displayName || !birthDate) {
    return NextResponse.redirect(new URL("/onboarding?error=missing_profile", request.url));
  }

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      displayName,
      birthDate: new Date(birthDate),
      gender: gender as never,
      interestedIn: interestedIn as never,
      city,
      bio,
      onboardingCompleted: true,
      isVisible: true,
      isDiscoverable: true,
      completionScore: Math.min(100, 40 + (bio ? 20 : 0) + (city ? 20 : 0) + 20)
    },
    create: {
      userId: user.id,
      displayName,
      birthDate: new Date(birthDate),
      gender: gender as never,
      interestedIn: interestedIn as never,
      city,
      bio,
      visibility: "PUBLIC",
      onboardingCompleted: true,
      isVisible: true,
      isDiscoverable: true,
      completionScore: Math.min(100, 40 + (bio ? 20 : 0) + (city ? 20 : 0) + 20)
    }
  });

  return NextResponse.redirect(new URL("/dashboard?profile=updated", request.url));
}
