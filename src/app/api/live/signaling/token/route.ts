import { NextResponse } from "next/server";
import { getDemoSignalingPayload } from "@/lib/live/signaling";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, payload: getDemoSignalingPayload(String(body.callId ?? "")) });
}
