import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateMatchForUsers } from "@/lib/matching/createMatch";

type Props = { params: Promise<{ callId: string }> };

export async function POST(_: Request, { params }: Props) {
  const user = await requireUser();
  const { callId } = await params;

  const call = await prisma.videoCall.findFirst({
    where: { id: callId, endedAt: null, OR: [{ callerUserId: user.id }, { calleeUserId: user.id }] }
  });
  if (!call) {
    return NextResponse.json({ ok: false, error: "call_not_found" }, { status: 404 });
  }

  const isCaller = call.callerUserId === user.id;
  const updated = await prisma.videoCall.update({
    where: { id: call.id },
    data: isCaller ? { callerLiked: true } : { calleeLiked: true }
  });

  let matchId: string | null = null;
  if ((isCaller ? updated.calleeLiked : updated.callerLiked) || (updated.callerLiked && updated.calleeLiked)) {
    const match = await getOrCreateMatchForUsers(updated.callerUserId, updated.calleeUserId, "VIDEO");
    await prisma.videoCall.update({ where: { id: updated.id }, data: { mutualLike: true } });
    matchId = match.id;
  }

  return NextResponse.json({ ok: true, action: "like", callId, matchId });
}
