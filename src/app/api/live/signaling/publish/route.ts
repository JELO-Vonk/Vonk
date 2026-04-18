import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { publishSignal } from "@/lib/live/signaling";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => ({}));
  const callId = String(body.callId ?? "");
  const kind = String(body.kind ?? "");
  if (!callId || !["offer", "answer", "candidate"].includes(kind)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
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

  const signal = publishSignal(callId, user.id, kind as "offer" | "answer" | "candidate", body.payload ?? null);
  return NextResponse.json({ ok: true, signal });
}
