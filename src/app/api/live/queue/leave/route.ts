import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { leaveVideoQueue } from "@/lib/live/queue";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => ({}));
  if (!body.sessionId) {
    return NextResponse.json({ ok: false, error: "missing_session_id" }, { status: 400 });
  }
  await leaveVideoQueue(String(body.sessionId), user.id);
  return NextResponse.json({ ok: true });
}
