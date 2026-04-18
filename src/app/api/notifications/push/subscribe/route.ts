import { NextRequest, NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { savePushSubscription } from "@/lib/push";

export async function POST(request: NextRequest) {
  const user = await requireOnboardingUser();
  const body = await request.json();
  if (!body?.endpoint) {
    return NextResponse.json({ error: "endpoint ontbreekt" }, { status: 400 });
  }
  await savePushSubscription(user.id, body, request.headers.get("user-agent"));
  return NextResponse.json({ ok: true });
}
