import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { clearSignals } from "@/lib/live/signaling";

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
  await prisma.videoCall.update({ where: { id: call.id }, data: { endedAt: new Date(), endReason: "NEXT" } });
  clearSignals(call.id);
  return NextResponse.json({ ok: true, action: "next", callId });
}
