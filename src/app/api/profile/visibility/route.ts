import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  const user = await requireOnboardingUser();
  const formData = await request.formData();
  const visibility = String(formData.get("visibility") ?? "PUBLIC").trim();
  const isDiscoverable = formData.get("isDiscoverable") === "on";
  const isVisible = formData.get("isVisible") === "on";

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      visibility: visibility as never,
      isDiscoverable: visibility === "HIDDEN" ? false : isDiscoverable,
      isVisible
    }
  });

  return NextResponse.redirect(new URL("/settings/privacy?saved=1", request.url));
}
