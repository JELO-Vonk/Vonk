import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { joinVideoQueue, getLiveStatusForUser } from "@/lib/live/queue";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json().catch(() => ({}));
  const result = await joinVideoQueue(user.id, body.filters ?? null);
  const status = await getLiveStatusForUser(user.id);
  return NextResponse.json({ ok: true, result, status });
}
