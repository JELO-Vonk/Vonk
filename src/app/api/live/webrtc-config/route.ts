import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getIceServers } from "@/lib/live/webrtc";

export async function GET() {
  await requireUser();
  return NextResponse.json({ ok: true, iceServers: getIceServers() });
}
