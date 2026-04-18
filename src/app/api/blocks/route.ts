import { NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const user = await requireOnboardingUser();
  const blocks = await prisma.block.findMany({
    where: { blockerUserId: user.id },
    include: { blocked: { include: { profile: true } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ ok: true, blocks });
}

export async function POST(request: Request) {
  const user = await requireOnboardingUser();
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "block").trim();
  const blockedUserId = String(formData.get("blockedUserId") ?? "").trim();

  if (!blockedUserId || blockedUserId === user.id) {
    return NextResponse.redirect(new URL("/blocked?error=invalid_block", request.url));
  }

  if (intent === "unblock") {
    await prisma.block.deleteMany({
      where: {
        blockerUserId: user.id,
        blockedUserId
      }
    });
    return NextResponse.redirect(new URL("/blocked?saved=unblock", request.url));
  }

  await prisma.block.upsert({
    where: {
      blockerUserId_blockedUserId: {
        blockerUserId: user.id,
        blockedUserId
      }
    },
    update: {},
    create: {
      blockerUserId: user.id,
      blockedUserId
    }
  });

  await prisma.chat.updateMany({
    where: {
      match: {
        OR: [
          { userAId: user.id, userBId: blockedUserId },
          { userAId: blockedUserId, userBId: user.id }
        ]
      }
    },
    data: { status: "BLOCKED" }
  });

  return NextResponse.redirect(new URL("/blocked?saved=block", request.url));
}
