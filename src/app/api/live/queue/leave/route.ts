import { NextResponse } from "next/server";
import { leaveVideoQueue } from "@/lib/live/queue";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.sessionId) {
    return NextResponse.json({ ok: false, error: "sessionId is verplicht." }, { status: 400 });
  }

  const session = await leaveVideoQueue(String(body.sessionId));
  return NextResponse.json({ ok: true, session });
}
