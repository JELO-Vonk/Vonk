import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { clearSignals } from "@/lib/live/signaling";

type Props = { params: Promise<{ callId: string }> };

export async function POST(request: Request, { params }: Props) {
  const user = await requireUser();
  const body = await request.json().catch(() => ({}));
  const { callId } = await params;
  const call = await prisma.videoCall.findFirst({
    where: { id: callId, endedAt: null, OR: [{ callerUserId: user.id }, { calleeUserId: user.id }] }
  });
  if (!call) {
    return NextResponse.json({ ok: false, error: "call_not_found" }, { status: 404 });
  }
  const reportedUserId = call.callerUserId === user.id ? call.calleeUserId : call.callerUserId;
  await prisma.$transaction(async (tx) => {
    await tx.videoCall.update({ where: { id: call.id }, data: { reportCount: { increment: 1 }, endedAt: new Date(), endReason: "REPORT" } });
    await tx.report.create({
      data: {
        reporterUserId: user.id,
        reportedUserId,
        reportedVideoCallId: call.id,
        contextType: "VIDEO",
        reasonCode: "OTHER",
        notes: typeof body.notes === "string" ? body.notes.slice(0, 1000) : null
      }
    });
  });
  clearSignals(call.id);
  return NextResponse.json({ ok: true, action: "report", callId });
}
