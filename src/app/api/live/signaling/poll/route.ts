import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { getSignalsSince } from "@/lib/live/signaling";

export async function GET(request: Request) {
  const user = await requireUser();
  const url = new URL(request.url);
  const callId = url.searchParams.get("callId") ?? "";
  const since = Number(url.searchParams.get("since") ?? "0") || 0;
  if (!callId) {
    return NextResponse.json({ ok: false, error: "missing_call_id" }, { status: 400 });
  }

  const call = await prisma.videoCall.findFirst({
    where: {
      id: callId,
      endedAt: null,
      OR: [{ callerUserId: user.id }, { calleeUserId: user.id }]
    }
  });
  if (!call) {
    return NextResponse.json({ ok: false, error: "call_not_found" }, { status: 404 });
  }

  const signals = getSignalsSince(callId, since, user.id);
  return NextResponse.json({ ok: true, signals });
}
