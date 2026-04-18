import { NextRequest, NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: NextRequest) {
  const user = await requireOnboardingUser();
  const body = await request.json();
  await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      emailNewMatches: !!body.emailNewMatches,
      emailNewMessages: !!body.emailNewMessages,
      pushNewMatches: !!body.pushNewMatches,
      pushNewMessages: !!body.pushNewMessages
    },
    create: {
      userId: user.id,
      emailNewMatches: !!body.emailNewMatches,
      emailNewMessages: !!body.emailNewMessages,
      pushNewMatches: !!body.pushNewMatches,
      pushNewMessages: !!body.pushNewMessages
    }
  });
  return NextResponse.json({ ok: true });
}
