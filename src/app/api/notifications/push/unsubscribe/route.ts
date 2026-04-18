import { NextRequest, NextResponse } from "next/server";
import { requireOnboardingUser } from "@/lib/auth/guards";
import { removePushSubscription } from "@/lib/push";

export async function POST(request: NextRequest) {
  const user = await requireOnboardingUser();
  const { endpoint } = await request.json();
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint ontbreekt" }, { status: 400 });
  }
  await removePushSubscription(endpoint, user.id);
  return NextResponse.json({ ok: true });
}
