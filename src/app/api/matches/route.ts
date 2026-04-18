import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const user = await requireOnboardingUser();
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: user.id }, { userBId: user.id }]
    },
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      chat: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ ok: true, matches });
}
